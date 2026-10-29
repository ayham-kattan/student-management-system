const express = require('express');
const cors = require('cors');
const db = require('./db');
const { client: redis, connectRedis } = require('./src/cache/redis');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.APP_ENV });
});

app.get('/api/db-health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: process.env.DB_NAME });
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
connectRedis().catch((err) => console.error(err.message));

app.listen(PORT, () => {
  console.log(`[${process.env.APP_ENV}] Server listening on http://localhost:${PORT}`);
});
