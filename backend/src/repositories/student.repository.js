const { pool } = require('../db/pool');

const COLUMNS = `
  student_id   AS studentId,
  name,
  email,
  phone,
  department,
  created_date AS createdDate
`;

// Escape LIKE wildcards so a search for "a_b" or "100%" matches literally.
const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

// sortColumn must come from the whitelist in studentValidator.parseListQuery.
async function findAll({ limit, offset, search, sortColumn, sortOrder }) {
  const where = search ? 'WHERE name LIKE ? OR email LIKE ?' : '';
  const params = search ? Array(2).fill(`%${escapeLike(search)}%`) : [];
  const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
  // student_id as a tie-breaker keeps paging stable when sorted values repeat.
  const orderBy =
    sortColumn === 'student_id'
      ? `student_id ${direction}`
      : `${sortColumn} ${direction}, student_id ${direction}`;

  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM students ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM students ${where}`, params);
  return { rows, total };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM students WHERE student_id = ?`, [id]);
  return rows[0] || null;
}

async function create({ name, email, phone, department }) {
  const [result] = await pool.query(
    'INSERT INTO students (name, email, phone, department) VALUES (?, ?, ?, ?)',
    [name, email, phone, department]
  );
  return findById(result.insertId);
}

async function update(id, { name, email, phone, department }) {
  const [result] = await pool.query(
    'UPDATE students SET name = ?, email = ?, phone = ?, department = ? WHERE student_id = ?',
    [name, email, phone, department, id]
  );
  return result.affectedRows > 0 ? findById(id) : null;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
