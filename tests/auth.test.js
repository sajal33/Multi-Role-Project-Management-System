const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Company = require('../models/Company');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Company.deleteMany({});
});

describe('Authentication Endpoints', () => {
  it('should register a new company and admin user', async () => {
    // First create a company
    const companyRes = await request(app)
      .post('/api/companies')
      .send({
        name: 'Test Company',
        domain: 'testcompany.com'
      });
    
    expect(companyRes.statusCode).toEqual(201);
    expect(companyRes.body).toHaveProperty('data');
    
    const companyId = companyRes.body.data._id;
    
    // Register admin user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@testcompany.com',
        password: 'password123',
        companyId
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toHaveProperty('role', 'Admin');
  });

  it('should login a user', async () => {
    // First create a company
    const companyRes = await request(app)
      .post('/api/companies')
      .send({
        name: 'Test Company',
        domain: 'testcompany.com'
      });
    
    const companyId = companyRes.body.data._id;
    
    // Create a user
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Admin',
      companyId
    });
    
    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should not login with invalid credentials', async () => {
    // First create a company
    const companyRes = await request(app)
      .post('/api/companies')
      .send({
        name: 'Test Company',
        domain: 'testcompany.com'
      });
    
    const companyId = companyRes.body.data._id;
    
    // Create a user
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Admin',
      companyId
    });
    
    // Try to login with wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should refresh token', async () => {
    // First create a company
    const companyRes = await request(app)
      .post('/api/companies')
      .send({
        name: 'Test Company',
        domain: 'testcompany.com'
      });
    
    const companyId = companyRes.body.data._id;
    
    // Create a user and login
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Admin',
      companyId
    });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    const refreshToken = loginRes.body.refreshToken;
    
    // Refresh token
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({
        refreshToken
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});
