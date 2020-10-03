require("dotenv").config({ path: __dirname + "/../.env" });

const { MONGODB_URI, PORT } = process.env;
module.exports = { MONGODB_URI, PORT };
