const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
  const { host, port, user, password, database } = config.db;
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conn.changeUser({ database });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await conn.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));

    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log('✅ Database is up to date');
      return;
    }

    for (const file of pending) {
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await conn.query(sql);
      await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      console.log(`✅ Applied ${file}`);
    }
  } finally {
    await conn.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
