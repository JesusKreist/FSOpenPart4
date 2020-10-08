const logger = require("./logger");

const errorHandler = (error, request, response, next) => {
  if (process.env.NODE_ENV !== "test") {
    logger.error(error.name);
    logger.error(error.message);
  }

  switch (error.name) {
    case "ValidationError":
      return response.status(400).send({
        [error.name]: error.message,
      });
    default:
      next(error);
  }
};

module.exports = { errorHandler };
