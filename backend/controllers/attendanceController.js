
const { Attendance, Student, Course, courseEnrollments: CourseEnrollment } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

exports.getCurrentWeekAttendance = async (req, res, next) => {
  try {
    const teacher_id = req.user.id;

    const startOfWeek = moment().startOf('week').add(1, 'days'); // Monday
    const endOfWeek = moment().startOf('week').add(5, 'days'); // Friday

    const teacherCourses = await Course.findAll({
      where: { teacher_id }
    });

    const courseIds = teacherCourses.map(course => course.id);

    const enrolledStudents = await CourseEnrollment.findAll({
      where: {
        course_id: { [Op.in]: courseIds },
        status: 'pending'
      },
      include: [{
        model: Student,
        as: 'Student',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    const attendance = await Attendance.findAll({
      where: {
        studentId: { [Op.in]: enrolledStudents.map(e => e.Student.id) },
        courseId: { [Op.in]: courseIds },
        date: {
          [Op.between]: [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')]
        }
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['firstName', 'lastName']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
        enrolledStudents,
        meta: {
          startDate: startOfWeek.format('YYYY-MM-DD'),
          endDate: endOfWeek.format('YYYY-MM-DD')
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'error',
      message: 'Error fetching attendance'
    });
  }
};

exports.setAttendance = async (req, res, next) => {
  try {
    const teacher_id = req.user.id;
    const { studentId, date, status, notes } = req.body;

    if (!['present', 'absent', 'late', 'excused'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid attendance status'
      });
    }

    const course = await Course.findOne({
      where: { teacher_id }
    });

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'No course found for this teacher'
      });
    }

    const enrollment = await CourseEnrollment.findOne({
      where: {
        course_id: course.id,
        student_id: studentId,
        status: 'pending'
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Student is not enrolled in this course'
      });
    }

    const [attendance, created] = await Attendance.findOrCreate({
      where: {
        studentId,
        courseId: course.id,
        date
      },
      defaults: {
        status,
        notes
      }
    });

    if (!created) {
      await attendance.update({ status, notes });
    }

    res.status(200).json({
      status: 'success',
      data: attendance
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'error',
      message: 'Error setting attendance'
    });
  }
};

exports.getAttendanceByWeek = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { week, year } = req.query;

    // Calculate start and end dates for the specified week
    const startOfWeek = moment().year(year).week(week).startOf('week').add(1, 'days');
    const endOfWeek = moment().year(year).week(week).startOf('week').add(5, 'days');

    // Get teacher's courses
    const teacherCourses = await Course.findAll({
      where: { teacherId }
    });

    const courseIds = teacherCourses.map(course => course.id);

    // Get attendance records
    const attendance = await Attendance.findAll({
      where: {
        courseId: { [Op.in]: courseIds },
        date: {
          [Op.between]: [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')]
        }
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['firstName', 'lastName']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
        startDate: startOfWeek.format('YYYY-MM-DD'),
        endDate: endOfWeek.format('YYYY-MM-DD')
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Error fetching attendance by week'
    });
  }
};