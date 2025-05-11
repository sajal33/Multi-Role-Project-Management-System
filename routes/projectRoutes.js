const express = require('express');
const { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { validateProject } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for Admin and Manager
router.route('/')
  .post(authorize('Admin', 'Manager'), validateProject, createProject)
  .get(authorize('Admin', 'Manager'), getProjects);

router.route('/:id')
  .get(getProject) // All roles can get project details
  .put(authorize('Admin', 'Manager'), updateProject)
  .delete(authorize('Admin', 'Manager'), deleteProject);

module.exports = router;
