const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title && !request.body.url) {
    response.status(400).end();
  }
  const users = await User.find({});

  const blog = new Blog({
    ...request.body,
    likes: request.body.likes ? request.body.likes : 0,
    user: users[0] ? users[0].id : '',
  });
  const result = await blog.save();

  users[0].blogs = users[0].blogs.concat(result._id);
  await users[0].save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const result = await Blog.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
  });
  response.json(result);
});

module.exports = blogsRouter;
