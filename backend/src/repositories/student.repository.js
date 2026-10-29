const { pool } = require('../db/pool');

const COLUMNS = `
  student_id   AS studentId,
  name,
  email,
  phone,
  department,
  created_date AS createdDate
`;

async function findAll({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM students ORDER BY student_id DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM students');
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
