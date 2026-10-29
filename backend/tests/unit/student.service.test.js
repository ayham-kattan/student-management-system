jest.mock('../../src/repositories/student.repository');
jest.mock('../../src/cache/studentCache');

const repo = require('../../src/repositories/student.repository');
const cache = require('../../src/cache/studentCache');
const service = require('../../src/services/student.service');
const { parseListQuery } = require('../../src/utils/studentValidator');

const student = { studentId: 7, name: 'A', email: 'a@b.co', phone: null, department: null };
const input = { name: 'A', email: 'a@b.co', phone: null, department: null };
const dupError = Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' });

beforeEach(() => jest.resetAllMocks());

describe('list', () => {
  const query = parseListQuery({ page: '3', limit: '20', search: 'ali', sortBy: 'name', sortOrder: 'asc' });

  it('returns the cached page without hitting the database', async () => {
    const cached = { data: [student], meta: {} };
    cache.getList.mockResolvedValue(cached);

    await expect(service.list(query)).resolves.toBe(cached);
    expect(cache.getList).toHaveBeenCalledWith(query);
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it('loads from the database on a cache miss and caches the result', async () => {
    cache.getList.mockResolvedValue(null);
    repo.findAll.mockResolvedValue({ rows: [student], total: 41 });

    const result = await service.list(query);

    expect(repo.findAll).toHaveBeenCalledWith(query);
    expect(result.meta).toEqual({
      page: 3,
      limit: 20,
      total: 41,
      totalPages: 3,
      search: 'ali',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    expect(cache.setList).toHaveBeenCalledWith(query, result);
  });
});

describe('getById', () => {
  it('returns the cached student', async () => {
    cache.getItem.mockResolvedValue(student);
    await expect(service.getById(7)).resolves.toBe(student);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it('loads and caches on a miss', async () => {
    cache.getItem.mockResolvedValue(null);
    repo.findById.mockResolvedValue(student);

    await expect(service.getById(7)).resolves.toBe(student);
    expect(cache.setItem).toHaveBeenCalledWith(student);
  });

  it('throws 404 when the student does not exist', async () => {
    cache.getItem.mockResolvedValue(null);
    repo.findById.mockResolvedValue(null);

    await expect(service.getById(7)).rejects.toMatchObject({ statusCode: 404 });
    expect(cache.setItem).not.toHaveBeenCalled();
  });
});

describe('create', () => {
  it('creates and invalidates the cache', async () => {
    repo.create.mockResolvedValue(student);

    await expect(service.create(input)).resolves.toBe(student);
    expect(cache.invalidate).toHaveBeenCalledWith(7);
  });

  it('maps a duplicate email to 409', async () => {
    repo.create.mockRejectedValue(dupError);

    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 409 });
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('rethrows unexpected database errors', async () => {
    const boom = new Error('connection lost');
    repo.create.mockRejectedValue(boom);

    await expect(service.create(input)).rejects.toBe(boom);
  });
});

describe('update', () => {
  it('updates and invalidates the cache', async () => {
    repo.update.mockResolvedValue(student);

    await expect(service.update(7, input)).resolves.toBe(student);
    expect(cache.invalidate).toHaveBeenCalledWith(7);
  });

  it('throws 404 when the student does not exist', async () => {
    repo.update.mockResolvedValue(null);

    await expect(service.update(7, input)).rejects.toMatchObject({ statusCode: 404 });
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('maps a duplicate email to 409', async () => {
    repo.update.mockRejectedValue(dupError);
    await expect(service.update(7, input)).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('remove', () => {
  it('deletes and invalidates the cache', async () => {
    repo.remove.mockResolvedValue(true);

    await service.remove(7);
    expect(cache.invalidate).toHaveBeenCalledWith(7);
  });

  it('throws 404 when the student does not exist', async () => {
    repo.remove.mockResolvedValue(false);

    await expect(service.remove(7)).rejects.toMatchObject({ statusCode: 404 });
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
