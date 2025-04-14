const db = require('../models');
const { Op } = require('sequelize');
const Course = db.Course;
const Student = db.Student;
const Schedule = db.Schedule;
const Assessment = db.Assessment;

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const today = new Date();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
    const formattedDate = today.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Get courses taught by this teacher
    const courses = await Course.findAll({
      where: {
        teacher_id: teacherId,
        isActive: true
      },
      attributes: ['id', 'Course_name', 'Course_code', 'grade']
    });

    const courseIds = courses.map(course => course.id);

    // Count students enrolled in teacher's courses
    const studentCount = await Student.count()

    // Get today's schedule
    const todaySchedule = await Schedule.findAll({
      where: {
        course_id: {
          [Op.in]: courseIds
        },
        day_of_week: dayOfWeek,
        isActive: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['Course_name', 'grade']
        }
      ],
      order: [['start_time', 'ASC']]
    });

    const formattedSchedule = todaySchedule.map(schedule => {
      const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
      };

      const formatGrade = (room) => {
        if (room === '9') return 'Grade 9';
        if (room === '10') return 'Grade 10';
        return room;
      };

      return {
        time: `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`,
        class: schedule.course.Course_name,
        room: formatGrade(schedule.room_number),
        grade: `Grade ${schedule.course.grade}`
      };
    });

    // Count assessments created by this teacher
    const assessmentCount = await Assessment.count({
      where: {
        teacher_id: teacherId,
        isActive: true
      }
    }).catch(() => 0);

    // Count assignments and exams separately
    const assignmentsCount = await Assessment.count({
      where: {
        teacher_id: teacherId,
        assessment_type: 'Assignment',
        isActive: true
      }
    }).catch(() => 0);

    const examsCount = await Assessment.count({
      where: {
        teacher_id: teacherId,
        assessment_type: 'Exam',
        isActive: true
      }
    }).catch(() => 0);

    // Structure the data to match frontend expectations
    const dashboardData = {
      teacherName: req.user.name,
      currentDate: formattedDate,
      stats: {
        students: studentCount,
        classes: courses.length,
        assignments: assignmentsCount,
        exams: examsCount
      },
      todaySchedule: formattedSchedule
    };

    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};