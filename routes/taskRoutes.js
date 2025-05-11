const express = require('express');
const { 
  createTask, 
  getTasks, 
  getMyTasks,
  getTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { validateTask, validateTaskUpdate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Route for Members to get their assigned tasks
router.get('/me', getMyTasks);

// Routes for Admin and Manager
router.route('/')
  .post(authorize('Admin', 'Manager'), validateTask, createTask)
  .get(authorize('Admin', 'Manager'), getTasks);

router.route('/:id')
  .get(getTask) // All roles can get task details (with role-based access control in controller)
  .put(validateTaskUpdate, updateTask) // All roles can update tasks (with role-based access control in controller)
  .delete(authorize('Admin', 'Manager'), deleteTask);

module.exports = router;
