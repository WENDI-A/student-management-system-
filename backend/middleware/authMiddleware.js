const jwt = require('jsonwebtoken');
const { Admin, Teacher, Student, Parent, Guest } = require('../models');  // Importing Guest model

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please log in.'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists based on role
      let currentUser;
      switch (decoded.role) {
        case 'admin':
          currentUser = await Admin.findByPk(decoded.id);
          break;
        case 'teacher':
          currentUser = await Teacher.findByPk(decoded.id);
          break;
        case 'student':
          currentUser = await Student.findByPk(decoded.id);
          break;
        case 'parent':
          currentUser = await Parent.findByPk(decoded.id);
          break;
        case 'guest':  // Handling guest role
          currentUser = await Guest.findByPk(decoded.id);
          break;
      }
      
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists'
        });
      }
      
      if (!currentUser.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact administrator.'
        });
      }
      
      req.user = {
        id: currentUser.id,
        role: decoded.role,
        email: currentUser.email
      };
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please log in again.'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your token has expired. Please log in again.'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.map(role => role.toLowerCase()).includes(req.user.role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role || 'unknown'}' is not authorized to access this route`
      });
    }
    next();
  };
};


exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        
        // Check user based on role
        let currentUser;
        switch (decoded.role) {
          case 'admin':
            currentUser = await Admin.findByPk(decoded.id, {
              attributes: { exclude: ['password'] }
            });
            break;
          case 'teacher':
            currentUser = await Teacher.findByPk(decoded.id, {
              attributes: { exclude: ['password'] }
            });
            break;
          case 'student':
            currentUser = await Student.findByPk(decoded.id, {
              attributes: { exclude: ['password'] }
            });
            break;
          case 'parent':
            currentUser = await Parent.findByPk(decoded.id, {
              attributes: { exclude: ['password'] }
            });
            break;
          case 'guest':  // Handling guest role
            currentUser = await Guest.findByPk(decoded.id, {
              attributes: { exclude: ['password'] }
            });
            break;
        }
        
        if (currentUser && currentUser.isActive) {
          res.locals.user = currentUser;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
