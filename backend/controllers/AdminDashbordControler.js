const { Student, Teacher,Parent } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      studentCount,
      teacherCount,
      parentCount
      // courseCount,
      // assignmentCount,
      // announcementCount
    ] = await Promise.all([
      Student.count(),
      Teacher.count(),
      Parent.count() 
      // Course.count(),
      // Assignment.count(),
    ]);

    const recentActivities = [
      { id: 1, description: 'New teacher onboarded - Mathematics Department', timestamp: new Date() },
      { id: 2, description: 'Semester 2 schedule finalized', timestamp: new Date() },
      { id: 3, description: 'Annual budget review meeting scheduled', timestamp: new Date() },
      { id: 4, description: 'School maintenance scheduled for next weekend', timestamp: new Date() }
    ];

    const systemNotifications = [
      { id: 1, message: 'Database backup scheduled for tonight', timestamp: new Date() },
      { id: 2, message: 'New system update available', timestamp: new Date() },
      { id: 3, message: '15 new user registrations pending approval', timestamp: new Date() },
      { id: 4, message: 'Server maintenance scheduled for Sunday, 2 AM', timestamp: new Date() }
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          students: studentCount,
          teachers: teacherCount,
          courses: 0,
          assignments: 0,
          announcements: 0,
          parents:parentCount
        },
        recentActivities,
        systemNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};