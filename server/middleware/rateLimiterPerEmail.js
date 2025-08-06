const rateLimit = require('express-rate-limit');

const rateLimiterPerEmail = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 3,
  keyGenerator: (req) => req.body.email || req.ip,
  message: { error: 'Too many password reset attempts. Try again later.' }
});

module.exports = rateLimiterPerEmail;
