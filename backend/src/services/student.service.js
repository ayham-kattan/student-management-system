const repo = require('../repositories/student.repository');
const cache = require('../cache/studentCache');
const AppError = require('../utils/AppError');

// `query` comes from studentValidator.parseListQuery.
async function list(query) {
  const cached = await cache.getList(query);
  if (cached) return cached;

  const { page, limit, search, sortBy, sortOrder } = query;
  const { rows, total } = await repo.findAll(query);
  const result = {
    data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit), search, sortBy, sortOrder },
  };
  await cache.setList(query, result);
  return result;
}

async function getById(id) {
  const cached = await cache.getItem(id);
  if (cached) return cached;

  const student = await repo.findById(id);
  if (!student) throw new AppError(404, 'Student not found');
  await cache.setItem(student);
  return student;
}

async function create(data) {
  const student = await withUniqueEmail(() => repo.create(data));
  await cache.invalidate(student.studentId);
  return student;
}

async function update(id, data) {
  const student = await withUniqueEmail(() => repo.update(id, data));
  if (!student) throw new AppError(404, 'Student not found');
  await cache.invalidate(id);
  return student;
}

async function remove(id) {
  const deleted = await repo.remove(id);
  if (!deleted) throw new AppError(404, 'Student not found');
  await cache.invalidate(id);
}

// The unique index is the source of truth; checking first would race.
async function withUniqueEmail(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'A student with this email already exists');
    }
    throw err;
  }
}

module.exports = { list, getById, create, update, remove };
