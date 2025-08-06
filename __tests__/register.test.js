// __tests__/userOrg.test.js
const request = require('supertest');
const express = require('express');
const { db, User, Org } = require('../server/db'); 
const app = express();
app.use(express.json());

// Sample route to test
app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.status(200).json(users);
});

beforeAll(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close(); 
});

describe('Mock Users and Organizations', () => {
  test('create sample users and organizations', async () => {
    await Org.create({
      name: 'MockOrg',
      email: 'org@example.com',
      hashed_password: 'hashed123'
    });

    await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'user@example.com',
      hashed_password: 'hashed123',
      role_title: 'member',
      phone: '1234567890',
      organization_id: 1
    });

    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].email).toBe('user@example.com');
  });
});
app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});
test('POST /api/users should create user', async () => {
  const res = await request(app).post('/api/users').send({
    name: 'New User',
    username: 'newuser',
    email: 'new@example.com',
    hashed_password: 'hashed',
    role_title: 'developer',
    phone: '9876543210'
  });
  expect(res.status).toBe(201);
  expect(res.body.username).toBe('newuser');
});
