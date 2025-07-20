const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../../prismaClient');
const prisma = new PrismaClient();

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }

    let user = null;
    let role = null;

    // Try Admin
    user = await prisma.admin.findFirst({ where: { email: identifier, deletedAt: null } });
    if (user) role = 'admin';

    // Try Teacher
    if (!user) {
      user = await prisma.teacher.findFirst({ where: { email: identifier, deletedAt: null } });
      if (user) role = 'teacher';
    }

    // Try Director
    if (!user) {
      user = await prisma.director.findFirst({ where: { email: identifier, deletedAt: null } });
      if (user) role = 'director';
    }

    // Try Parent
    if (!user) {
      user = await prisma.parent.findFirst({ where: { email: identifier, deletedAt: null } });
      if (user) role = 'parent';
    }

    // Try Guest
    if (!user) {
      user = await prisma.guest.findFirst({ where: { email: identifier, deletedAt: null } });
      if (user) role = 'guest';
    }

    // Try Student (by email)
    if (!user) {
      user = await prisma.student.findFirst({ where: { code: identifier, deletedAt: null } });
      if (user) role = 'student';
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or student Id credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password credentials' });
    }

    let firstName = user.firstName || user.name;
    let lastName = user.lastName || '';

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName,
        lastName,
        email: user.email,
        role
      },
      token
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendLoginResponse = (res, user, role) => {
  let firstName = user.firstName;
  let lastName = user.lastName;

  // Special handling for Director model, which uses 'name' instead of firstName/lastName
  if (role === 'director') {
    firstName = user.name;
    lastName = '';
  }

  const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

  const responseData = {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      firstName,
      lastName,
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
        user = await prisma.admin.findFirst({ where: { email, deletedAt: null } });
        break;
      case 'director':
        user = await prisma.director.findFirst({ where: { email, deletedAt: null } });
        break;
      case 'teacher':
        user = await prisma.teacher.findFirst({ where: { email, deletedAt: null } });
        break;
      case 'student':
        user = await prisma.student.findFirst({ where: { email, deletedAt: null } });
        break;
      case 'parent':
        user = await prisma.parent.findFirst({ where: { email, deletedAt: null } });
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

exports.token_refresh = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    let user = null;
    switch (decoded.role) {
      case "admin":
        user = await prisma.admin.findFirst({ where: { id: decoded.id, deletedAt: null } });
        break;
      case "director":
        user = await prisma.director.findFirst({ where: { id: decoded.id, deletedAt: null } });
        break;
      case "teacher":
        user = await prisma.teacher.findFirst({ where: { id: decoded.id, deletedAt: null } });
        break;
      case "student":
        user = await prisma.student.findFirst({ where: { id: decoded.id, deletedAt: null } });
        break;
      case "parent":
        user = await prisma.parent.findFirst({ where: { id: decoded.id, deletedAt: null } });
        break;
      case "guest":
        user = await prisma.guest.findFirst({ where: { id: decoded.id, deletedAt: null } });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid role in token" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or inactive" });
    }

    if (decoded.exp * 1000 > Date.now()) {
      return res.status(200).json({
        success: true,
        message: "Token is still valid",
        token,
      });
    }

    const newToken = jwt.sign({ id: user.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
