function errorHandler(err, req, res, _next) {
  console.error('[Error]', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message,
    data: null
  });
}

module.exports = errorHandler;
