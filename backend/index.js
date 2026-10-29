const app = require('./src/app');
const config = require('./src/config');
const { connectRedis } = require('./src/cache/redis');

connectRedis().catch((err) => console.error(err.message));

app.listen(config.port, () => {
  console.log(`[${process.env.APP_ENV}] Server listening on http://localhost:${config.port}`);
});
