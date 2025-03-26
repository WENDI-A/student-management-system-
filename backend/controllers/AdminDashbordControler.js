const { Student } = require('../models');

exports.getdashbord = async (req, res, next) => {
  try {
    const students = await Student.findAll().count();
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};