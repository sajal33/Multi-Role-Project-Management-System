const express = require('express');
const { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { validateUser } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.use(authorize('Admin'));

router.route('/')
  .post(validateUser, createUser)
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
