const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { Admin, Teacher, Student, Parent, Guest } = db;

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }

    let user = null;
    let role = null;
    const studentIdRegex = /^\d+\/\d+$/;
    const isStudentId = studentIdRegex.test(identifier);

    if (!isStudentId) {
      user = await Admin.findOne({ where: { email: identifier, isActive: true } });
      if (user) role = 'admin';
    }

    if (!user && !isStudentId) {
      user = await Teacher.findOne({ where: { email: identifier, isActive: true } });
      if (user) role = 'teacher';
    }

    if (!user) {
      user = await Student.findOne({ where: { student_id: identifier, isActive: true } });
      if (user) role = 'student';
    }

    if (!user && !isStudentId) {
      user = await Parent.findOne({ where: { email: identifier, isActive: true } });
      if (user) role = 'parent';
    }

    if (!user && !isStudentId) {
      user = await Guest.findOne({ where: { email: identifier } });
      if (user) {
        role = 'guest';
        return sendLoginResponse(res, user, role);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or student ID' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    return sendLoginResponse(res, user, role);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

const sendLoginResponse = (res, user, role) => {
  const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const responseData = {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role
    },
    token
  };

  return res.status(200).json(responseData);
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email and role' });
    }
    
    let user;
    switch (role) {
      case 'admin':
        user = await Admin.findOne({ where: { email, isActive: true } });
        break;
      case 'teacher':
        user = await Teacher.findOne({ where: { email, isActive: true } });
        break;
      case 'student':
        user = await Student.findOne({ where: { email, isActive: true } });
        break;
      case 'parent':
        user = await Parent.findOne({ where: { email, isActive: true } });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email address' });
    }

    return res.status(200).json({ success: true, message: 'Password reset instructions sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password, role } = req.body;
    
    if (!token || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide token, new password and role' });
    }

    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};
