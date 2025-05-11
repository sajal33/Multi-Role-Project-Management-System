const express = require('express');
const { 
  createCompany, 
  getCompanies, 
  getCompany, 
  updateCompany, 
  deleteCompany 
} = require('../controllers/companyController');
const { validateCompany } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for company registration
router.post('/', validateCompany, createCompany);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getCompanies);

router.route('/:id')
  .get(getCompany)
  .put(validateCompany, updateCompany)
  .delete(deleteCompany);

module.exports = router;
