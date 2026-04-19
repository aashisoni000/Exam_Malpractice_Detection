const { sendError } = require('../utils/responseHelper');

const errorMiddleware = (err, req, res, next) => {
  console.error('[Error:', err.message, ']');
  return sendError(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

module.exports = errorMiddleware;
