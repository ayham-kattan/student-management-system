require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_db',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    charset: 'utf8mb4',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    database: parseInt(process.env.REDIS_DB) || 0,
    ttl: {
      list: parseInt(process.env.REDIS_TTL_LIST) || 60,
      item: parseInt(process.env.REDIS_TTL_ITEM) || 300,
    },
  },
};