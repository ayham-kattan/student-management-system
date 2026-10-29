// Runs against real MySQL and Redis (see tests/setupEnv.js for the isolated test DB).
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { client: redis, connectRedis } = require('../../src/cache/redis');
const { migrate } = require('../../src/db/migrate');

const newStudent = (overrides = {}) => ({
  name: 'Ayham Kattan',
  email: `student.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`,
  phone: '+968 9123 4567',
  department: 'Computer Science',
  ...overrides,
});

async function createStudent(overrides) {
  const res = await request(app).post('/api/students').send(newStudent(overrides)).expect(201);
  return res.body.data;
}

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await migrate();
  await connectRedis();
});

beforeEach(async () => {
  await pool.query('DELETE FROM students');
  await redis.flushDb();
});

afterAll(async () => {
  await redis.quit();
  await pool.end();
});

describe('health', () => {
  it.each(['/api/health', '/api/db-health', '/api/redis-health'])('%s is ok', async (path) => {
    const res = await request(app).get(path).expect(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/students', () => {
  it('creates a student and returns 201 with a Location header', async () => {
    const body = newStudent({ email: 'New.Student@Example.com' });
    const res = await request(app).post('/api/students').send(body).expect(201);

    expect(res.body.data).toMatchObject({
      studentId: expect.any(Number),
      name: body.name,
      email: 'new.student@example.com',
      phone: body.phone,
      department: body.department,
      createdDate: expect.any(String),
    });
    expect(res.headers.location).toBe(`/api/students/${res.body.data.studentId}`);
  });

  it('returns 400 with every invalid field', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({ email: 'bad', phone: 'abc' })
      .expect(400);

    expect(Object.keys(res.body.error.details).sort()).toEqual(['email', 'name', 'phone']);
  });

  it('returns 409 for a duplicate email, ignoring case', async () => {
    const existing = await createStudent();
    const res = await request(app)
      .post('/api/students')
      .send(newStudent({ email: existing.email.toUpperCase() }))
      .expect(409);

    expect(res.body.error.message).toMatch(/email/);
  });

  it('returns 400 for malformed JSON', async () => {
    await request(app)
      .post('/api/students')
      .set('Content-Type', 'application/json')
      .send('{bad')
      .expect(400, { error: { message: 'Invalid JSON body' } });
  });
});

describe('GET /api/students', () => {
  it('lists newest first with paging metadata', async () => {
    const first = await createStudent();
    const second = await createStudent();
    const third = await createStudent();

    const res = await request(app).get('/api/students?page=1&limit=2').expect(200);

    expect(res.body.data.map((s) => s.studentId)).toEqual([third.studentId, second.studentId]);
    expect(res.body.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });

    const page2 = await request(app).get('/api/students?page=2&limit=2').expect(200);
    expect(page2.body.data.map((s) => s.studentId)).toEqual([first.studentId]);
  });

  it('shows a new student even after the list was cached', async () => {
    await request(app).get('/api/students').expect(200);
    const created = await createStudent();

    const res = await request(app).get('/api/students').expect(200);
    expect(res.body.data.map((s) => s.studentId)).toContain(created.studentId);
  });
});

describe('GET /api/students/:id', () => {
  it('returns the student and caches it', async () => {
    const created = await createStudent();

    const res = await request(app).get(`/api/students/${created.studentId}`).expect(200);
    expect(res.body.data).toEqual(created);
    expect(await redis.exists(`students:item:${created.studentId}`)).toBe(1);
  });

  it('returns 404 for an unknown id', async () => {
    await request(app).get('/api/students/999999').expect(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    await request(app).get('/api/students/abc').expect(400);
  });
});

describe('PUT /api/students/:id', () => {
  it('updates the student and serves fresh data afterwards', async () => {
    const created = await createStudent();
    await request(app).get(`/api/students/${created.studentId}`).expect(200); // warm cache

    const update = { name: 'Updated Name', email: created.email, department: 'Engineering' };
    const res = await request(app).put(`/api/students/${created.studentId}`).send(update).expect(200);
    expect(res.body.data).toMatchObject({ ...update, phone: null });

    const after = await request(app).get(`/api/students/${created.studentId}`).expect(200);
    expect(after.body.data.name).toBe('Updated Name');
  });

  it('returns 409 when taking another student’s email', async () => {
    const a = await createStudent();
    const b = await createStudent();

    await request(app)
      .put(`/api/students/${b.studentId}`)
      .send({ name: b.name, email: a.email })
      .expect(409);
  });

  it('returns 404 for an unknown id', async () => {
    await request(app).put('/api/students/999999').send(newStudent()).expect(404);
  });

  it('returns 400 for invalid input', async () => {
    const created = await createStudent();
    await request(app).put(`/api/students/${created.studentId}`).send({ name: '' }).expect(400);
  });
});

describe('DELETE /api/students/:id', () => {
  it('deletes the student, then returns 404', async () => {
    const created = await createStudent();
    await request(app).get(`/api/students/${created.studentId}`).expect(200); // warm cache

    await request(app).delete(`/api/students/${created.studentId}`).expect(204);
    await request(app).get(`/api/students/${created.studentId}`).expect(404);
    await request(app).delete(`/api/students/${created.studentId}`).expect(404);
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    expect(res.body.error.message).toBe('Route GET /api/nope not found');
  });
});

describe('docs', () => {
  it('serves the OpenAPI spec', async () => {
    const res = await request(app).get('/api/docs/openapi.json').expect(200);
    expect(res.body.openapi).toBe('3.0.3');
  });
});
