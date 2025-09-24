const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies && req.cookies.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) return res.status(401).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure both id and _id aliases exist for downstream code
    req.user = decoded;
    if (decoded.id && !decoded._id) {
      req.user._id = decoded.id;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
