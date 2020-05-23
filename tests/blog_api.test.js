const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

const initialBlog = [
  {
    title: 'test',
    author: 'test author',
    url: 'www.url.com',
    likes: 3,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(initialBlog[0]);
  await blogObject.save();
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(initialBlog.length);
});

test('there is a blog which author is test author', async () => {
  const response = await api.get('/api/blogs');
  const authors = response.body.map((r) => r.author);

  expect(authors).toContain('test author');
});

test('there is an id property', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body[0].id).toBeDefined();
});

test('the blog is created successfuly', async () => {
  const newBlog = {
    title: 'test new blog',
    author: 'test new author',
    url: 'www.url-new.com',
    likes: 33,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');

  expect(response.body.length).toBe(2);
});

test('if blog is created without like property its defaulted to 0', async () => {
  const newBlog = {
    title: 'test new blog',
    author: 'test new author',
    url: 'www.url-new.com',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');

  expect(response.body[1].likes).toBe(0);
});

test('if title and url are missing the response is a Bad Request', async () => {
  const newBlog = {
    author: 'Bad Request',
    likes: 33,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
});

test('a blog is deleted successfully', async () => {
  const response = await api.get('/api/blogs');
  await api.delete(`/api/blogs/${response.body[0].id}`).expect(204);
  const responseUpdated = await api.get('/api/blogs');
  expect(responseUpdated.body.length).toBe(response.body.length - 1);
});

test('a blog is updated', async () => {
  const response = await api.get('/api/blogs');

  const result = await api.put(`/api/blogs/${response.body[0].id}`).send({
    ...response.body[0],
    likes: 4,
  });

  expect(result.body.likes).toBe(4);
});

afterAll(() => {
  mongoose.connection.close();
});
