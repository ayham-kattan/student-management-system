const { client } = require('./redis');
const config = require('../config');

// Lists are keyed by a version number; bumping it on any write invalidates
// every cached page at once without scanning keys.
const VERSION_KEY = 'students:list:version';
const itemKey = (id) => `students:item:${id}`;

// Redis is an optimisation: if it is down, log and fall through to MySQL.
async function safe(fn, fallback = null) {
  if (!client.isReady) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error('⚠️  Cache error:', err.message);
    return fallback;
  }
}

async function listKey(page, limit) {
  const version = (await safe(() => client.get(VERSION_KEY))) || '0';
  return `students:list:v${version}:p${page}:l${limit}`;
}

async function getList(page, limit) {
  const key = await listKey(page, limit);
  const cached = await safe(() => client.get(key));
  return cached ? JSON.parse(cached) : null;
}

async function setList(page, limit, data) {
  const key = await listKey(page, limit);
  await safe(() => client.set(key, JSON.stringify(data), { EX: config.redis.ttl.list }));
}

async function getItem(id) {
  const cached = await safe(() => client.get(itemKey(id)));
  return cached ? JSON.parse(cached) : null;
}

async function setItem(student) {
  await safe(() =>
    client.set(itemKey(student.studentId), JSON.stringify(student), { EX: config.redis.ttl.item })
  );
}

async function invalidate(id) {
  await safe(() => client.multi().del(itemKey(id)).incr(VERSION_KEY).exec());
}

module.exports = { getList, setList, getItem, setItem, invalidate };
