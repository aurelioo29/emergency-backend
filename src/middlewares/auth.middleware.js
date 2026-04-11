const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
