const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    // algorithms: only accept tokens signed the way we sign them
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};