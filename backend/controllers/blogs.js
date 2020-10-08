const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const morgan = require("morgan");

morgan.token("requestBody", (request, response) =>
  JSON.stringify(request.body)
);

blogsRouter.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :requestBody"
  )
);

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const blogPost = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
  });

  const result = await blogPost.save();
  response.status(201).json(result);
});

module.exports = blogsRouter;
