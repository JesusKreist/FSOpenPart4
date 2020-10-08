require("dotenv").config({ path: __dirname + "/../.env" });

const { PORT } = process.env;
let { MONGODB_URI } = process.env;

if (process.env.NODE_ENV === "test") {
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

module.exports = { MONGODB_URI, PORT };
