const usersRouter = require("express").Router();
const User = require("../models/user");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "test") {
  morgan.token("requestBody", (request, _) => JSON.stringify(request.body));

  usersRouter.use(
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :requestBody"
    )
  );
}

usersRouter.get("/", async (_, response) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
  });
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, password, name } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).json({
      Error: "Length of password was less than 3",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    passwordHash,
    name,
  });

  const newUser = await user.save();

  const userForToken = {
    username,
    id: newUser._id,
  };

  const token = jwt.sign(userForToken, process.env.JWT_SECRET);
  response.status(201).json({
    token,
    username: newUser.username,
    name: newUser.name,
    isRegisteredNew: true,
    isLoggedIn: true,
  });
});

module.exports = usersRouter;
