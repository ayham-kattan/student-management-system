const { createClient } = require('redis');
const config = require('../config');

const client = createClient({
  socket: { host: config.redis.host, port: config.redis.port },
});

client.on('error', (err) => console.error('❌ Redis error:', err.message));

async function connectRedis() {
  if (!client.isOpen) await client.connect();
  console.log('✅ Redis connected');
}

module.exports = { client, connectRedis };
