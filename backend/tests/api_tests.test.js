const helpers = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const User = require("../models/user");

let testToken;

const allInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map((note) => note.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({
    username: { $regex: /^(?!testuser1).*$/, $options: "i" },
  });

  for (let obj of helpers.manyBlogs) {
    let blogEntry = new Blog(obj);
    await blogEntry.save();
  }
});

test("notes are json", async () => {
  await api
    .get("/api/blogs")
    .set("Authorization", process.env.TEST_TOKEN)
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("length of database get", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(helpers.manyBlogs.length);
});

describe("check if id is defined", () => {
  test("verify unique identifier", async () => {
    const blogsAtStart = await allInDB();
    const toBeChecked = blogsAtStart[0];

    expect(toBeChecked.id).toBeDefined();
  });
});

describe("Tests for adding of blog", () => {
  test("try adding blogs with authentication", async () => {
    await api
      .post("/api/blogs")
      .send(helpers.newPost)
      .set("Authorization", process.env.TEST_TOKEN)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await allInDB();
    expect(blogsAfter).toHaveLength(helpers.manyBlogs.length + 1);
  });
});

describe("check if likes defaults to zero", () => {
  test("likes default is zero", async () => {
    const newlyAddedBlog = await api
      .post("/api/blogs")
      .send(helpers.newPost)
      .set("Authorization", process.env.TEST_TOKEN);
    expect(newlyAddedBlog.body.likes).toBeDefined();
  });
});

describe("check if title or url is missing", () => {
  test("validate name and title", async () => {
    const newPost = {
      author: "admin",
      likes: 2,
    };

    await api
      .post("/api/blogs/")
      .send(newPost)
      .set("Authorization", process.env.TEST_TOKEN)
      .expect(400);
  });
});

describe("Testing the user creation", () => {
  test("Successful user creation with valid data", async () => {
    const beforeNewUser = await usersInDb();

    const newUserData = {
      username: "dave",
      password: "123456",
      name: "David Smith",
    };

    await api
      .post("/api/users/")
      .send(newUserData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const afterNewUser = await usersInDb();
    expect(afterNewUser).toHaveLength(beforeNewUser.length + 1);
  });

  test("fails with error code 400 with invalid data", async () => {
    const beforeNewUser = await usersInDb();
    const newUserDataNoPassword = {
      username: "root",
      name: "admin",
    };

    await api
      .post("/api/users/")
      .send(newUserDataNoPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const afterNewUser = await usersInDb();
    expect(beforeNewUser).toHaveLength(afterNewUser.length);
  });

  test("fails with shorter password", async () => {
    const beforeNewUser = await usersInDb();
    const newUserDataNoPassword = {
      username: "root",
      name: "admin",
      password: "12",
    };

    await api
      .post("/api/users/")
      .send(newUserDataNoPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const afterNewUser = await usersInDb();
    expect(beforeNewUser).toHaveLength(afterNewUser.length);
  });

  test("fails with shorter username", async () => {
    const beforeNewUser = await usersInDb();
    const newUserDataNoPassword = {
      username: "rt",
      name: "admin",
      password: "123456",
    };

    await api
      .post("/api/users/")
      .send(newUserDataNoPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const afterNewUser = await usersInDb();
    expect(beforeNewUser).toHaveLength(afterNewUser.length);
  });

  test("fails with no username", async () => {
    const beforeNewUser = await usersInDb();
    const newUserDataNoPassword = {
      name: "admin",
      password: "12",
    };

    await api
      .post("/api/users/")
      .send(newUserDataNoPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const afterNewUser = await usersInDb();
    expect(beforeNewUser).toHaveLength(afterNewUser.length);
  });
});

describe("testing user authentication", () => {
  test("login success with valid data", async () => {
    //! to get token, add .expect(r => console.log(r)) here
    await api
      .post("/api/login")
      .send(helpers.defaultUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
