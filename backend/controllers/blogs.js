const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "test") {
  morgan.token("requestBody", (request, response) =>
    JSON.stringify(request.body)
  );

  blogsRouter.use(
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :requestBody"
    )
  );
}

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const { id } = request.params;
  const blog = await Blog.findById(id).populate("user", {
    username: 1,
    name: 1,
  });

  if (blog) {
    response.json(blog);
  } else {
    response.status(404).send({
      error: "No matching document found",
    });
  }
});

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;
  const { token } = request;

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({
      error: "token invalid or missing",
    });
  }

  const user = await User.findById(decodedToken.id);

  const blogPost = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id,
  });

  const savedBlog = await blogPost.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const { id } = request.params;
  const blog = await Blog.findById(id);

  const { token } = request;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  if (!token || !decodedToken.id) {
    return response.status(401).json({
      error: "token invalid or missing",
    });
  } else if (blog.user.toString() !== decodedToken.id) {
    return response.status(401).json({
      error: "User authentication info incorrect",
    });
  }

  await blog.remove();
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const { id } = request.params;
  const { likes } = request.body;
  const updatedPost = { likes };

  const blog = await Blog.findById(id);

  const { token } = request;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  if (!token || !decodedToken.id) {
    return response.status(401).json({
      error: "token invalid or missing",
    });
  } else if (blog.user.toString() !== decodedToken.id) {
    return response.status(401).json({
      error: "User authentication info incorrect",
    });
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, updatedPost, {
    new: true,
  });

  response.json(updatedBlog);
});

module.exports = blogsRouter;
