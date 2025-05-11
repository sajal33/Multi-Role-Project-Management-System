/**
 * Setup script for Project Management API
 * This script helps initialize the database with sample data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('./models/Company');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('All existing data cleared');
  } catch (error) {
    console.error(`Error clearing data: ${error.message}`);
    process.exit(1);
  }
};

// Create sample data
const createSampleData = async () => {
  try {
    // Create a company
    const company = await Company.create({
      name: 'Acme Inc',
      domain: 'acme.com'
    });
    console.log(`Created company: ${company.name}`);

    // Create users with different roles
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@acme.com',
      password: adminPassword,
      role: 'Admin',
      companyId: company._id
    });
    console.log(`Created admin user: ${admin.email}`);

    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@acme.com',
      password: managerPassword,
      role: 'Manager',
      companyId: company._id
    });
    console.log(`Created manager user: ${manager.email}`);

    const memberPassword = await bcrypt.hash('member123', 10);
    const member = await User.create({
      name: 'Member User',
      email: 'member@acme.com',
      password: memberPassword,
      role: 'Member',
      companyId: company._id
    });
    console.log(`Created member user: ${member.email}`);

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      createdBy: admin._id,
      companyId: company._id
    });
    console.log(`Created project: ${project1.name}`);

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Develop a new mobile app for customers',
      createdBy: manager._id,
      companyId: company._id
    });
    console.log(`Created project: ${project2.name}`);

    // Create tasks
    const task1 = await Task.create({
      title: 'Design Homepage',
      description: 'Create mockups for the new homepage',
      status: 'To Do',
      assignedTo: member._id,
      projectId: project1._id
    });
    console.log(`Created task: ${task1.title}`);

    const task2 = await Task.create({
      title: 'Implement Authentication',
      description: 'Set up user authentication for the mobile app',
      status: 'In Progress',
      assignedTo: manager._id,
      projectId: project2._id
    });
    console.log(`Created task: ${task2.title}`);

    const task3 = await Task.create({
      title: 'Database Schema Design',
      description: 'Design the database schema for the app',
      status: 'Done',
      assignedTo: admin._id,
      projectId: project2._id
    });
    console.log(`Created task: ${task3.title}`);

    console.log('\nSample data created successfully!');
    console.log('\nYou can now login with these credentials:');
    console.log('Admin: admin@acme.com / admin123');
    console.log('Manager: manager@acme.com / manager123');
    console.log('Member: member@acme.com / member123');
  } catch (error) {
    console.error(`Error creating sample data: ${error.message}`);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  
  console.log('\nThis script will clear all existing data and create sample data.');
  console.log('Press Ctrl+C now if you want to cancel.');
  
  // Wait 5 seconds before proceeding
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await clearData();
  await createSampleData();
  
  // Close the connection
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

// Run the script
main();
