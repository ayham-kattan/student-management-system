const express = require('express');
const cors = require('cors');
const db = require('./db');

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

app.listen(PORT, () => {
  console.log(`[${process.env.APP_ENV}] Server listening on http://localhost:${PORT}`);
});
