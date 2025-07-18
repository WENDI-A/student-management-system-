const { Student, Teacher, Parent, Course, Assessment } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      studentCount,
      teacherCount,
      parentCount,
      courseCount,
    ] = await Promise.all([
      Student.count(),
      Teacher.count(),
      Parent.count(),
      Course.count(),
      Assessment.count()
    ]);


    return res.status(200).json({
      success: true,
      data: {
        stats: {
          students: studentCount,
          teachers: teacherCount,
          courses: courseCount,
          parents: parentCount
        },
      }
    });
  } catch (error) {
    next(error);
  }
};