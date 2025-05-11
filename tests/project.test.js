const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Company = require('../models/Company');
const Project = require('../models/Project');
const { generateAccessToken } = require('../config/jwt');

let mongoServer;
let adminToken;
let managerToken;
let memberToken;
let companyId;
let adminUser;
let managerUser;
let memberUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  
  // Create test company
  const company = await Company.create({
    name: 'Test Company',
    domain: 'testcompany.com'
  });
  
  companyId = company._id;
  
  // Create test users with different roles
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@testcompany.com',
    password: 'password123',
    role: 'Admin',
    companyId
  });
  
  managerUser = await User.create({
    name: 'Manager User',
    email: 'manager@testcompany.com',
    password: 'password123',
    role: 'Manager',
    companyId
  });
  
  memberUser = await User.create({
    name: 'Member User',
    email: 'member@testcompany.com',
    password: 'password123',
    role: 'Member',
    companyId
  });
  
  // Generate tokens
  adminToken = generateAccessToken(adminUser);
  managerToken = generateAccessToken(managerUser);
  memberToken = generateAccessToken(memberUser);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Project.deleteMany({});
});

describe('Project Endpoints', () => {
  it('should create a new project as Admin', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Project',
        description: 'This is a test project',
        companyId: companyId.toString()
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('name', 'Test Project');
  });
  
  it('should create a new project as Manager', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Manager Project',
        description: 'This is a project created by a manager',
        companyId: companyId.toString()
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('name', 'Manager Project');
  });
  
  it('should not allow Members to create projects', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Member Project',
        description: 'This is a project created by a member',
        companyId: companyId.toString()
      });
    
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('success', false);
  });
  
  it('should get all projects as Admin', async () => {
    // Create some test projects
    await Project.create({
      name: 'Project 1',
      description: 'Description 1',
      createdBy: adminUser._id,
      companyId
    });
    
    await Project.create({
      name: 'Project 2',
      description: 'Description 2',
      createdBy: managerUser._id,
      companyId
    });
    
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toEqual(2);
  });
  
  it('should update a project as Admin', async () => {
    // Create a test project
    const project = await Project.create({
      name: 'Project to Update',
      description: 'Original description',
      createdBy: adminUser._id,
      companyId
    });
    
    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Project',
        description: 'Updated description'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('name', 'Updated Project');
    expect(res.body.data).toHaveProperty('description', 'Updated description');
  });
  
  it('should delete a project as Admin', async () => {
    // Create a test project
    const project = await Project.create({
      name: 'Project to Delete',
      description: 'This will be deleted',
      createdBy: adminUser._id,
      companyId
    });
    
    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    
    // Verify project was deleted
    const deletedProject = await Project.findById(project._id);
    expect(deletedProject).toBeNull();
  });
});
