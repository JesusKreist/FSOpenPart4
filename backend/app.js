const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
const middlewares = require("./utils/middleware");

logger.info("Connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => logger.info("Successfully connected to Mongo Database"))
  .catch((error) => logger.error(error.message));

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogsRouter);
app.use(middlewares.errorHandler);

module.exports = app;
