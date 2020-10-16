const logger = require("./logger");

const getToken = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  }
  next();
};

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
    case "JsonWebTokenError":
      return response.status(401).send({
        [error.name]: "an error occured when decoding the token",
      });
    default:
      next(error);
  }
};

module.exports = { getToken, errorHandler };
