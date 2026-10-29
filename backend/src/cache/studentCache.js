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

// Search is lowercased because MySQL matching is case-insensitive: "Ali" and "ali" share a key.
async function listKey({ page, limit, search, sortBy, sortOrder }) {
  const version = (await safe(() => client.get(VERSION_KEY))) || '0';
  const q = encodeURIComponent(search.toLowerCase());
  return `students:list:v${version}:p${page}:l${limit}:s${sortBy}.${sortOrder}:q${q}`;
}

async function getList(query) {
  const key = await listKey(query);
  const cached = await safe(() => client.get(key));
  return cached ? JSON.parse(cached) : null;
}

async function setList(query, data) {
  const key = await listKey(query);
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
