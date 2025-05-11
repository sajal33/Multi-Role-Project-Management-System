const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    next();
  };
};

// Company validation schema
const companySchema = Joi.object({
  name: Joi.string().required().trim(),
  domain: Joi.string().required().trim()
});

// User validation schema
const userSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Manager', 'Member').required(),
  companyId: Joi.string().required()
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required()
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Project validation schema
const projectSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  companyId: Joi.string().required()
});

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done'),
  assignedTo: Joi.string().required(),
  projectId: Joi.string().required()
});

// Task update validation schema
const taskUpdateSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done'),
  assignedTo: Joi.string()
}).min(1);

module.exports = {
  validateCompany: validate(companySchema),
  validateUser: validate(userSchema),
  validateLogin: validate(loginSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateProject: validate(projectSchema),
  validateTask: validate(taskSchema),
  validateTaskUpdate: validate(taskUpdateSchema)
};
