import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    status: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
