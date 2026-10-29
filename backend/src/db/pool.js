const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.db);

async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log('✅ MySQL connected');
}

module.exports = { pool, testConnection };