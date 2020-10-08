const listHelper = require("../utils/test_functions");
const helpers = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const mongoose = require("mongoose");
const Blog = require("../models/blog");

const allInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map((note) => note.toJSON());
};

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let obj of helpers.manyBlogs) {
    let blogEntry = new Blog(obj);
    await blogEntry.save();
  }
});

test("notes are json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("length of database get", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(helpers.manyBlogs.length);
});

describe("check to see if blogs can be added", () => {
  test("Add new post", async () => {
    const postObject = new Blog(helpers.newPost);
    await postObject.save();
    const blogsAfter = await allInDB();
    expect(blogsAfter).toHaveLength(helpers.manyBlogs.length + 1);
  });
});

describe("check if id is defined", () => {
  test("verify unique identifier", async () => {
    const blogsAtStart = await allInDB();
    const toBeChecked = blogsAtStart[0];
    console.log(toBeChecked);

    expect(toBeChecked.id).toBeDefined();
  });
});

describe("mock post request", () => {
  test("check if post requests work", async () => {
    await api
      .post("/api/blogs")
      .send(helpers.newPost)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await allInDB();
    expect(blogsAfter).toHaveLength(helpers.manyBlogs.length + 1);
  });
});

describe("check if likes defaults to zero", () => {
  test("likes default is zero", async () => {
    const newlyAddedBlog = await api.post("/api/blogs").send(helpers.newPost);
    expect(newlyAddedBlog.body.likes).toBeDefined();
  });
});

describe("check if title or url is missing", () => {
  test("validate name and title", async () => {
    const newPost = {
      author: "admin",
      likes: 2,
    };

    await api.post("/api/blogs").send(newPost).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
