const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, ...(err.details && { details: err.details }) },
    });
  }
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Invalid JSON body' } });
  }

  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}

module.exports = { notFound, errorHandler };
