const { sendError } = require("../utils/response");

const errorMiddleware = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    return sendError(res, {
      statusCode: 400,
      message: "Duplicate data",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: `${e.path} already exists`,
      })),
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return sendError(res, {
      statusCode: 401,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, {
      statusCode: 401,
      message: "Token expired",
    });
  }

  // Custom error (manual throw)
  if (err.statusCode) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Default fallback
  return sendError(res, {
    statusCode: 500,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;
