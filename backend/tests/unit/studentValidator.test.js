const { validateStudent, parseId, parseListQuery } = require('../../src/utils/studentValidator');
const AppError = require('../../src/utils/AppError');

function validationErrors(body) {
  try {
    validateStudent(body);
  } catch (err) {
    return err;
  }
  throw new Error('expected validation to fail');
}

describe('validateStudent', () => {
  it('accepts a full valid student and normalises it', () => {
    expect(
      validateStudent({
        name: '  Ayham Kattan ',
        email: 'Ayham@Example.COM',
        phone: '+968 9123-4567',
        department: 'CS',
      })
    ).toEqual({
      name: 'Ayham Kattan',
      email: 'ayham@example.com',
      phone: '+968 9123-4567',
      department: 'CS',
    });
  });

  it('stores missing or empty optional fields as null', () => {
    expect(validateStudent({ name: 'A', email: 'a@b.co', phone: '' })).toEqual({
      name: 'A',
      email: 'a@b.co',
      phone: null,
      department: null,
    });
  });

  it('reports every invalid field at once with a 400', () => {
    const err = validationErrors({ email: 'nope', phone: 'abc', department: 'x'.repeat(51) });
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(Object.keys(err.details).sort()).toEqual(['department', 'email', 'name', 'phone']);
  });

  it('enforces max lengths from the spec', () => {
    const err = validationErrors({ name: 'x'.repeat(101), email: `${'x'.repeat(95)}@a.com` });
    expect(err.details).toEqual({
      name: 'name must be at most 100 characters',
      email: 'email must be at most 100 characters',
    });
  });

  it('rejects non-string values', () => {
    expect(validationErrors({ name: 123, email: 'a@b.co' }).details).toEqual({
      name: 'name must be a string',
    });
  });

  it('handles a missing body', () => {
    expect(validationErrors(undefined).details).toEqual({
      name: 'name is required',
      email: 'email is required',
    });
  });
});

describe('parseListQuery', () => {
  it('applies defaults', () => {
    expect(parseListQuery({})).toEqual({
      page: 1,
      limit: 20,
      offset: 0,
      search: '',
      sortBy: 'studentId',
      sortOrder: 'desc',
      sortColumn: 'student_id',
    });
  });

  it('maps API sort fields to SQL columns', () => {
    expect(parseListQuery({ sortBy: 'createdDate', sortOrder: 'ASC' })).toMatchObject({
      sortColumn: 'created_date',
      sortOrder: 'asc',
    });
  });

  it('trims the search term', () => {
    expect(parseListQuery({ search: '  ali  ' }).search).toBe('ali');
  });

  it.each([
    [{ page: '3', limit: '20' }, { page: 3, limit: 20, offset: 40 }],
    [{ page: '0', limit: '0' }, { page: 1, limit: 20, offset: 0 }],
    [{ page: '-2', limit: '500' }, { page: 1, limit: 100, offset: 0 }],
    [{ page: 'x', limit: 'y' }, { page: 1, limit: 20, offset: 0 }],
  ])('clamps paging %p', (query, expected) => {
    expect(parseListQuery(query)).toMatchObject(expected);
  });

  it('rejects unknown sort fields, so nothing unsafe reaches ORDER BY', () => {
    expect(() => parseListQuery({ sortBy: 'name; DROP TABLE students' })).toThrow(
      expect.objectContaining({ statusCode: 400, details: { sortBy: expect.any(String) } })
    );
  });

  it('rejects an invalid sort order and an over-long search', () => {
    expect(() => parseListQuery({ sortOrder: 'up', search: 'x'.repeat(101) })).toThrow(
      expect.objectContaining({ details: { sortOrder: expect.any(String), search: expect.any(String) } })
    );
  });
});

describe('parseId', () => {
  it.each(['1', '42'])('accepts %s', (raw) => {
    expect(parseId(raw)).toBe(Number(raw));
  });

  it.each(['0', '-1', '1.5', 'abc', ''])('rejects %p with a 400', (raw) => {
    expect(() => parseId(raw)).toThrow(expect.objectContaining({ statusCode: 400 }));
  });
});
