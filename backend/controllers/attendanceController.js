const { Attendance, Student, Course, Teacher } = require('../models');

/**
 * Get attendance records for courses taught by the authenticated teacher
 * @route GET /api/attendance
 * @access Private (Teachers only)
 */
exports.getAttendanceByTeacherCourse = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    
    // Find courses taught by this teacher
    const courses = await Course.findAll({
      where: { teacherId },
      attributes: ['id', 'name', 'code']
    });
    
    if (!courses.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No courses found for this teacher'
      });
    }
    
    const courseIds = courses.map(course => course.id);
    
    // Get attendance for these courses
    const attendanceRecords = await Attendance.findAll({
      where: { courseId: courseIds },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: attendanceRecords.length,
      data: {
        attendance: attendanceRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get attendance statistics by weekday for courses taught by the authenticated teacher
 * @route GET /api/attendance/weekday
 * @access Private (Teachers only)
 */
exports.getAttendanceByWeekday = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    
    // Find courses taught by this teacher
    const courses = await Course.findAll({
      where: { teacherId },
      attributes: ['id']
    });
    
    if (!courses.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No courses found for this teacher'
      });
    }
    
    const courseIds = courses.map(course => course.id);
    
    // Get all attendance records for these courses
    const attendanceRecords = await Attendance.findAll({
      where: { courseId: courseIds },
      attributes: ['date', 'status']
    });
    
    // Process data to get statistics by weekday
    const weekdayStats = {
      0: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }, // Sunday
      1: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }, // Monday
      2: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }, // Tuesday
      3: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }, // Wednesday
      4: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }, // Thursday
      5: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }, // Friday
      6: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }  // Saturday
    };
    
    attendanceRecords.forEach(record => {
      const date = new Date(record.date);
      const weekday = date.getDay();
      weekdayStats[weekday][record.status]++;
      weekdayStats[weekday].total++;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        weekdayStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Mark attendance for a single student
 * @route POST /api/attendance/attendance
 * @access Private (Teachers only)
 */
exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, courseId, date, status, notes } = req.body;
    
    if (!studentId || !courseId || !date || !status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields'
      });
    }
    
    // Verify the course belongs to the authenticated teacher
    const course = await Course.findOne({
      where: { 
        id: courseId,
        teacherId: req.user.id
      }
    });
    
    if (!course) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to mark attendance for this course'
      });
    }
    
    // Check if student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }
    
    // Check if attendance record already exists for this student, course, and date
    let attendance = await Attendance.findOne({
      where: { studentId, courseId, date }
    });
    
    if (attendance) {
      // Update existing record
      attendance = await attendance.update({
        status,
        notes: notes || attendance.notes
      });
    } else {
      // Create new record
      attendance = await Attendance.create({
        studentId,
        courseId,
        date,
        status,
        notes
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Mark attendance for multiple students at once
 * @route POST /api/attendance/attendance/bulk
 * @access Private (Teachers only)
 */
exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { courseId, date, attendanceData } = req.body;
    
    if (!courseId || !date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields in the correct format'
      });
    }
    
    // Verify the course belongs to the authenticated teacher
    const course = await Course.findOne({
      where: { 
        id: courseId,
        teacherId: req.user.id
      }
    });
    
    if (!course) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to mark attendance for this course'
      });
    }
    
    // Process each attendance record
    const attendanceRecords = [];
    
    for (const record of attendanceData) {
      const { studentId, status, notes } = record;
      
      if (!studentId || !status) {
        return res.status(400).json({
          status: 'fail',
          message: 'Each attendance record must include studentId and status'
        });
      }
      
      // Check if student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          status: 'fail',
          message: `Student with ID ${studentId} not found`
        });
      }
      
      // Check if attendance record already exists
      let attendance = await Attendance.findOne({
        where: { studentId, courseId, date }
      });
      
      if (attendance) {
        // Update existing record
        attendance = await attendance.update({
          status,
          notes: notes || attendance.notes
        });
      } else {
        // Create new record
        attendance = await Attendance.create({
          studentId,
          courseId,
          date,
          status,
          notes
        });
      }
      
      attendanceRecords.push(attendance);
    }
    
    res.status(200).json({
      status: 'success',
      results: attendanceRecords.length,
      data: {
        attendance: attendanceRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};