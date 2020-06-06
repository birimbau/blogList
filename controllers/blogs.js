const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

  if (!request.body.title && !request.body.url) {
    response.status(400).end();
  }
  const users = await User.find({});

  const blog = new Blog({
    ...request.body,
    likes: request.body.likes ? request.body.likes : 0,
    user: user.id,
  });
  const result = await blog.save();

  users[0].blogs = users[0].blogs.concat(result._id);
  await users[0].save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(decodedToken.id);
  const blog = await Blog.findById(request.params.id).populate('user', {
    id: 1,
  });

  if (!user || !blog || blog.user.id !== user.id) {
    return response
      .status(403)
      .json({ error: `You don't have permissions to delete this resource` });
  }

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
