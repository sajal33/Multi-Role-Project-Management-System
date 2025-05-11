const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin/Manager
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, assignedTo, projectId } = req.body;

    // Check if project exists and belongs to user's company
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project belongs to the same company
    if (project.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks for this project'
      });
    }

    // Check if assigned user exists and belongs to the same company
    const assignedUser = await User.findById(assignedTo);
    
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    if (assignedUser.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot assign task to user from another company'
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      assignedTo,
      projectId
    });

    // Populate task with related data
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'projectId',
        select: 'name description',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering
// @route   GET /api/tasks
// @access  Private/Admin/Manager
exports.getTasks = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Build query
    const query = {};
    
    // Filter by company (always apply this filter)
    // We need to get all projects for the company first
    const companyProjects = await Project.find({ companyId: req.user.companyId }).select('_id');
    const projectIds = companyProjects.map(project => project._id);
    
    query.projectId = { $in: projectIds };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by assignee if provided
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    // Filter by project if provided
    if (req.query.projectId) {
      // Check if project belongs to user's company
      const project = await Project.findById(req.query.projectId);
      
      if (!project || project.companyId.toString() !== req.user.companyId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access tasks for this project'
        });
      }
      
      query.projectId = req.query.projectId;
    }
    
    // Count total tasks matching query
    const total = await Task.countDocuments(query);

    // Query with pagination
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'projectId',
        select: 'name description',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to me
// @route   GET /api/tasks/me
// @access  Private/Member
exports.getMyTasks = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Build query for tasks assigned to the current user
    const query = { assignedTo: req.user._id };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Count total tasks matching query
    const total = await Task.countDocuments(query);

    // Query with pagination
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'projectId',
        select: 'name description',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private/Admin/Manager/Member (if assigned)
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'projectId',
        select: 'name description companyId',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task's project belongs to the same company
    if (task.projectId.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    // If user is a Member, check if they are assigned to this task
    if (req.user.role === 'Member' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private/Admin/Manager/Member (if assigned)
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    let task = await Task.findById(req.params.id).populate({
      path: 'projectId',
      select: 'companyId'
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task's project belongs to the same company
    if (task.projectId.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // If user is a Member, they can only update their assigned tasks
    if (req.user.role === 'Member') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }
      
      // Members can only update status and description, not reassign or change title
      const updateData = {};
      if (status) updateData.status = status;
      if (description) updateData.description = description;
      
      task = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email')
        .populate({
          path: 'projectId',
          select: 'name description',
          populate: {
            path: 'createdBy',
            select: 'name email'
          }
        });
    } else {
      // Admin and Manager can update all fields
      // If assignedTo is changed, verify the new user exists and belongs to same company
      if (assignedTo && assignedTo !== task.assignedTo.toString()) {
        const assignedUser = await User.findById(assignedTo);
        
        if (!assignedUser) {
          return res.status(404).json({
            success: false,
            message: 'Assigned user not found'
          });
        }

        if (assignedUser.companyId.toString() !== req.user.companyId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Cannot assign task to user from another company'
          });
        }
      }
      
      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (status) updateData.status = status;
      if (assignedTo) updateData.assignedTo = assignedTo;
      
      task = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email')
        .populate({
          path: 'projectId',
          select: 'name description',
          populate: {
            path: 'createdBy',
            select: 'name email'
          }
        });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin/Manager
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: 'projectId',
      select: 'companyId'
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task's project belongs to the same company
    if (task.projectId.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
