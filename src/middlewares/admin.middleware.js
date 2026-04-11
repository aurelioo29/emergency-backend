const AppError = require("../utils/AppError");

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (req.user.type !== "ADMIN") {
    return next(new AppError("Only admin can access this resource", 403));
  }

  next();
};

module.exports = adminMiddleware;
