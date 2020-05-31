const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const helper = require('../utils/helper');

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', name: 'root', passwordHash });

    await user.save();
  });

  test('there is one user in the database', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBeDefined();
    expect(response.body[0].username).toBeDefined();
    expect(response.body[0].id).toBeDefined();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('username must be unique', async () => {
    const newUser = {
      username: 'root',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api.post('/api/users').send(newUser).expect(400);
  });

  test('username must be at least 3 characters long', async () => {
    const newUser = {
      username: 'lu',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api.post('/api/users').send(newUser).expect(400);
  });

  test('password must be at least 3 characters long', async () => {
    const newUser = {
      username: 'luki',
      name: 'Matti Luukkainen',
      password: 'sa',
    };

    await api.post('/api/users').send(newUser).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
