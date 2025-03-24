const { Teacher, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const generateToken = (teacher) => {
  return jwt.sign(
    { 
      id: teacher.id,
      email: teacher.email,
      role: 'teacher' 
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1d' }
  );
};

const checkTeacherExists = async (email) => {
  const teacher = await Teacher.findOne({ where: { email } });
  return !!teacher;
};

exports.registerTeacher = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      department,
      specialization,
      joinDate,
      position
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const teacherExists = await checkTeacherExists(email);
    if (teacherExists) {
      return res.status(409).json({ 
        success: false, 
        message: 'Teacher with this email already exists' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = await Teacher.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      department: department || null,
      specialization: specialization || null,
      joinDate: joinDate || new Date(),
      position: position || null,
      phone: phone || null
    });

    const token = generateToken(newTeacher);

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      teacher: {
        id: newTeacher.id,
        firstName: newTeacher.firstName,
        lastName: newTeacher.lastName,
        email: newTeacher.email,
        role: 'teacher'
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

exports.updateTeacherColumn = async (req, res, next) => {
  try {
    const teacherId = req.params.id;
    const { columnName, value } = req.body;

    const validColumns = ['firstName', 'lastName', 'email', 'department', 'specialization', 'joinDate', 'position', 'phone', 'isActive'];
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
    
    const teacher = await Teacher.findByPk(teacherId);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      department,
      specialization,
      joinDate,
      position,
      phone,
      isActive 
    } = req.body;
    
    if (email && email !== teacher.email) {
      const emailExists = await checkTeacherExists(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    const updateData = {};
    
    if (firstName !== undefined || !isPartialUpdate) updateData.firstName = firstName || teacher.firstName;
    if (lastName !== undefined || !isPartialUpdate) updateData.lastName = lastName || teacher.lastName;
    if (email !== undefined || !isPartialUpdate) updateData.email = email || teacher.email;
    if (department !== undefined || !isPartialUpdate) updateData.department = department;
    if (specialization !== undefined || !isPartialUpdate) updateData.specialization = specialization;
    if (joinDate !== undefined || !isPartialUpdate) updateData.joinDate = joinDate || teacher.joinDate;
    if (position !== undefined || !isPartialUpdate) updateData.position = position;
    if (phone !== undefined || !isPartialUpdate) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    await teacher.update(updateData);

    // Fetch updated teacher
    const updatedTeacher = await Teacher.findByPk(teacherId);

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
      attributes: { exclude: ['password'] }
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
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
  })
  } catch (error) {
    console.error('Get all teachers error:', error);
    next(error);
  }
};
