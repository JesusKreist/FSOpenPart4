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

blogsRouter.get("/", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogsRouter.post("/", (request, response) => {
  const { title, author, url, likes } = request.body;

  const blogPost = new Blog({
    title,
    author,
    url,
    likes,
  });

  blogPost.save().then((result) => {
    response.status(201).json(result);
  });
});

module.exports = blogsRouter;
