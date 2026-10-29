const express = require('express');
const cors = require('cors');
const config = require('./config');
const { pool } = require('./db/pool');
const { client: redis } = require('./cache/redis');
const studentRoutes = require('./routes/student.routes');
const docsRoutes = require('./docs/swagger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.APP_ENV });
});

app.get('/api/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: config.db.database });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/redis-health', async (req, res) => {
  try {
    await redis.set('health:ping', 'pong', { EX: 10 });
    const value = await redis.get('health:ping');
    res.json({ status: 'ok', redis: value });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/students', studentRoutes);
app.use('/api/docs', docsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
