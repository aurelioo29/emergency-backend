const sendSuccess = (res, options = {}) => {
  const {
    message = "Success",
    data = null,
    statusCode = 200,
    meta = null,
  } = options;

  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, options = {}) => {
  const {
    message = "Something went wrong",
    statusCode = 500,
    errors = null,
  } = options;

  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
