import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(ENV.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
};
