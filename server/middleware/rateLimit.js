const rateLimit = require("express-rate-limit");

// Limits login attempts from one IP address, to slow down password guessing.
// Successful logins are not counted.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: Number(process.env.LOGIN_RATE_LIMIT) || 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again in 15 minutes" },
});

// Limits account creation from one IP address.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: Number(process.env.REGISTER_RATE_LIMIT) || 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many accounts created, please try again later" },
});

module.exports = { loginLimiter, registerLimiter };
