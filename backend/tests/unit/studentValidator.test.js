const { validateStudent, parseId } = require('../../src/utils/studentValidator');
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

describe('parseId', () => {
  it.each(['1', '42'])('accepts %s', (raw) => {
    expect(parseId(raw)).toBe(Number(raw));
  });

  it.each(['0', '-1', '1.5', 'abc', ''])('rejects %p with a 400', (raw) => {
    expect(() => parseId(raw)).toThrow(expect.objectContaining({ statusCode: 400 }));
  });
});
