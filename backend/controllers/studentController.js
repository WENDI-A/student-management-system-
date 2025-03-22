const { Student } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for token generation

exports.registerStudent = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      address,
      student_id, 
      department, 
      enrollmentYear, 
      currentSemester
    } = req.body;

    if (!firstName || !lastName || !email || !password || !student_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const existingStudent = await Student.findOne({ where: { student_id } });
    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        message: 'Student ID is already in use' 
      });
    }

    const studentIdRegex = /^\d+\/\d{2}$/;
    if (!studentIdRegex.test(student_id)) {
      return res.status(400).json({
        success: false,
        message: 'Student ID must be in format xxxx/xx'
      });
    }

    const result = await sequelize.transaction(async (t) => {
      // Create user record directly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'student',
        phone,
        address
      }, { transaction: t });

      // Create student record
      await Student.create({
        userId: newUser.id,
        student_id,
        email,
        department: department || null,
        enrollmentYear: enrollmentYear || null,
        currentSemester: currentSemester || 1
      }, { transaction: t });

      return newUser;
    });

    const token = jwt.sign({ id: result.id, role: result.role }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
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
    console.error('Student registration error:', error);
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

exports.updateStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const isPartialUpdate = req.method === 'PATCH';
    
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const { 
      student_id,
      department,
      enrollmentYear,
      currentSemester,
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      address,
      isActive 
    } = req.body;
    
    if (student_id && student_id !== student.student_id) {
      const existingStudent = await Student.findOne({ where: { student_id } });
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: 'Student ID is already in use'
        });
      }
      
      const studentIdRegex = /^\d+\/\d{2}$/;
      if (!studentIdRegex.test(student_id)) {
        return res.status(400).json({
          success: false,
          message: 'Student ID must be in format xxxx/xx'
        });
      }
    }
    
    if (currentSemester !== undefined) {
      const semesterNum = parseInt(currentSemester, 10);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 12) {
        return res.status(400).json({
          success: false,
          message: 'Current semester must be a number between 1 and 12'
        });
      }
    }
    
    await sequelize.transaction(async (t) => {
      const studentUpdateData = {};
      
      if (student_id !== undefined || !isPartialUpdate) studentUpdateData.student_id = student_id || student.student_id;
      if (department !== undefined || !isPartialUpdate) studentUpdateData.department = department;
      if (enrollmentYear !== undefined || !isPartialUpdate) studentUpdateData.enrollmentYear = enrollmentYear;
      if (currentSemester !== undefined || !isPartialUpdate) studentUpdateData.currentSemester = currentSemester !== undefined ? parseInt(currentSemester, 10) : student.currentSemester;

      if (email !== undefined) studentUpdateData.email = email;
      
      if (Object.keys(studentUpdateData).length > 0) {
        await student.update(studentUpdateData, { transaction: t });
      }
      
      if (student.user && (firstName || lastName || email || password || phone !== undefined || address !== undefined || isActive !== undefined)) {
        if (email && email !== student.user.email) {
          const emailExists = await User.findOne({ where: { email } });
          if (emailExists) {
            throw new Error('Email is already in use');
          }
        }
        
        const userUpdateData = {};
        
        if (firstName !== undefined || !isPartialUpdate) userUpdateData.firstName = firstName || student.user.firstName;
        if (lastName !== undefined || !isPartialUpdate) userUpdateData.lastName = lastName || student.user.lastName;
        if (email !== undefined || !isPartialUpdate) userUpdateData.email = email || student.user.email;
        if (phone !== undefined || !isPartialUpdate) userUpdateData.phone = phone;
        if (address !== undefined || !isPartialUpdate) userUpdateData.address = address;
        if (isActive !== undefined) userUpdateData.isActive = isActive;
        
        if (password) {
          const salt = await bcrypt.genSalt(10);
          userUpdateData.password = await bcrypt.hash(password, salt);
        }
        
        if (Object.keys(userUpdateData).length > 0) {
          await student.user.update(userUpdateData, { transaction: t });
        }
      }
    });
    
    const updatedStudent = await Student.findByPk(studentId, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
    
  } catch (error) {
    console.error('Student update error:', error);
    
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

exports.getStudentById = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    
    const student = await Student.findByPk(studentId, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    next(error);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });
    
    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get all students error:', error);
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Find student by ID
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete student record along with associated user
    await sequelize.transaction(async (t) => {
      await student.user.destroy({ transaction: t }); // Delete the associated user
      await student.destroy({ transaction: t }); // Delete the student record
    });

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Student delete error:', error);
    next(error);
  }
};
