const { Teacher } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

exports.registerTeacher = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      address,
      teacher_id,
      department,
      specialization,
      joinDate,
      position
    } = req.body;

    if (!firstName || !lastName || !email || !password || !teacher_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const userExists = await userController.checkUserExists(email);
    if (userExists) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const existingTeacher = await Teacher.findOne({ where: { teacher_id } });
    if (existingTeacher) {
      return res.status(409).json({ 
        success: false, 
        message: 'Teacher ID is already in use' 
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const newUser = await userController.createBaseUser({
        firstName,
        lastName,
        email,
        password,
        role: 'teacher',
        phone,
        address
      }, t);

      await Teacher.create({
        userId: newUser.id,
        teacher_id,
        email,
        department: department || null,
        specialization: specialization || null,
        joinDate: joinDate || new Date(),
        position: position || null
      }, { transaction: t });

      return newUser;
    });

    const token = userController.generateToken(result);

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      user: {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        role: result.role
      },
      token
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    next(error);
  }
};

// Update Specific Column (e.g., only position, department, etc.)
exports.updateTeacherColumn = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    const { columnName, value } = req.body;

    // Check if column exists
    const validColumns = ['teacher_id', 'department', 'specialization', 'joinDate', 'position'];
    if (!validColumns.includes(columnName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid column name'
      });
    }

    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Update the column value
    const updatedTeacher = await teacher.update({ [columnName]: value });

    return res.status(200).json({
      success: true,
      message: `${columnName} updated successfully`,
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Update specific column error:', error);
    next(error);
  }
};

// Delete Teacher by ID
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    await teacher.destroy();

    return res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    next(error);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    const isPartialUpdate = req.method === 'PATCH';
    
    const teacher = await Teacher.findByPk(teacherId, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    const { 
      teacher_id,
      department,
      specialization,
      joinDate,
      position,
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      address,
      isActive 
    } = req.body;
    
    if (teacher_id && teacher_id !== teacher.teacher_id) {
      const existingTeacher = await Teacher.findOne({ where: { teacher_id } });
      if (existingTeacher) {
        return res.status(409).json({
          success: false,
          message: 'Teacher ID is already in use'
        });
      }
    }

    await sequelize.transaction(async (t) => {
      const teacherUpdateData = {};
      
      if (teacher_id !== undefined || !isPartialUpdate) teacherUpdateData.teacher_id = teacher_id || teacher.teacher_id;
      if (department !== undefined || !isPartialUpdate) teacherUpdateData.department = department;
      if (specialization !== undefined || !isPartialUpdate) teacherUpdateData.specialization = specialization;
      if (joinDate !== undefined || !isPartialUpdate) teacherUpdateData.joinDate = joinDate || teacher.joinDate;
      if (position !== undefined || !isPartialUpdate) teacherUpdateData.position = position;

      if (email !== undefined) teacherUpdateData.email = email;
      
      if (Object.keys(teacherUpdateData).length > 0) {
        await teacher.update(teacherUpdateData, { transaction: t });
      }
      
      if (teacher.user && (firstName || lastName || email || password || phone !== undefined || address !== undefined || isActive !== undefined)) {
        if (email && email !== teacher.user.email) {
          const emailExists = await userController.checkUserExists(email);
          if (emailExists) {
            throw new Error('Email is already in use');
          }
        }
        
        const userUpdateData = {};
        
        if (firstName !== undefined || !isPartialUpdate) userUpdateData.firstName = firstName || teacher.user.firstName;
        if (lastName !== undefined || !isPartialUpdate) userUpdateData.lastName = lastName || teacher.user.lastName;
        if (email !== undefined || !isPartialUpdate) userUpdateData.email = email || teacher.user.email;
        if (phone !== undefined || !isPartialUpdate) userUpdateData.phone = phone;
        if (address !== undefined || !isPartialUpdate) userUpdateData.address = address;
        if (isActive !== undefined) userUpdateData.isActive = isActive;
        
        if (password) {
          const salt = await bcrypt.genSalt(10);
          userUpdateData.password = await bcrypt.hash(password, salt);
        }
        
        if (Object.keys(userUpdateData).length > 0) {
          await teacher.user.update(userUpdateData, { transaction: t });
        }
      }
    });

    const updatedTeacher = await Teacher.findByPk(teacherId, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    return res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Teacher update error:', error);
    
    if (error.message === 'Email is already in use') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    next(error);
  }
};

exports.getTeacherById = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    
    const teacher = await Teacher.findByPk(teacherId, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    next(error);
  }
};

exports.getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('Get all teachers error:', error);
    next(error);
  }
};
