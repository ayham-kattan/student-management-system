const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const { pool } = require('./src/db/pool');
const { client: redis, connectRedis } = require('./src/cache/redis');
const studentRoutes = require('./src/routes/student.routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

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

app.use(notFound);
app.use(errorHandler);

connectRedis().catch((err) => console.error(err.message));

app.listen(config.port, () => {
  console.log(`[${process.env.APP_ENV}] Server listening on http://localhost:${config.port}`);
});
