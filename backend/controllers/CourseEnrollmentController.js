const { Student, Course, courseEnrollments } = require('../models');
const { Op } = require('sequelize');

const enrollStudentInGradeLevelCourses = async (studentId) => {
  try {
    const student = await Student.findOne({
      where: { id: studentId }
    });

    if (!student) {
      return {
        success: false,
        message: 'Student not found',
        data: null
      };
    }

    const studentGrade = student.grade;

    if (!studentGrade) {
      return {
        success: false,
        message: 'Student does not have a grade assigned',
        data: null
      };
    }

    const gradeLevelCourses = await Course.findAll({
      where: { 
        grade: studentGrade,
        isActive: true
      }
    });

    if (gradeLevelCourses.length === 0) {
      return {
        success: false,
        message: `No active courses found for grade ${studentGrade}`,
        data: null
      };
    }


    const courseIds = gradeLevelCourses.map(course => course.id);
    
    const existingEnrollments = await courseEnrollments.findAll({
      where: {
        student_id: studentId,
        course_id: {
          [Op.in]: courseIds
        }
      },
      raw: true
    });
    
    console.log('Found existing enrollments:', existingEnrollments);
    
    const enrolledCourseIds = new Set(existingEnrollments.map(enrollment => 
      enrollment.course_id
    ));

    const enrollmentResults = {
      alreadyEnrolled: [],
      newlyEnrolled: [],
      failed: []
    };

    for (const course of gradeLevelCourses) {
      const courseId = course.id;
      
      if (enrolledCourseIds.has(courseId)) {
        enrollmentResults.alreadyEnrolled.push({
          courseId,
          courseName: course.name || course.course_name || course.Course_name 
        });
        continue;
      }

      try {
        const newEnrollment = await courseEnrollments.create({
          course_id: courseId,
          student_id: studentId,
          enrollment_date: new Date(),
          status: 'pending'
        });

        console.log('Created new enrollment:', newEnrollment.toJSON());

        enrollmentResults.newlyEnrolled.push({
          courseId,
          courseName: course.name || course.course_name || course.Course_name,
          enrollmentId: newEnrollment.id
        });
      } catch (error) {
        console.error('Error creating enrollment:', error);
        enrollmentResults.failed.push({
          courseId,
          courseName: course.name || course.course_name || course.Course_name,
          error: error.message
        });
      }
    }

    return {
      success: true,
      message: 'Grade-based enrollment process completed',
      data: {
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        studentGrade,
        enrollmentSummary: {
          totalCoursesForGrade: gradeLevelCourses.length,
          alreadyEnrolled: enrollmentResults.alreadyEnrolled.length,
          newlyEnrolled: enrollmentResults.newlyEnrolled.length,
          failed: enrollmentResults.failed.length
        },
        enrollmentResults
      }
    };
  } catch (error) {
    console.error('Error in enrollStudentInGradeLevelCourses:', error);
    if (error.sql) {
      console.error('SQL Error:', error.sql);
    }
    return {
      success: false,
      message: 'Error processing grade-based enrollment',
      error: error.message
    };
  }
};


const enrollAllStudentsInGradeLevelCourses = async () => {
  try {
    const students = await Student.findAll({
      where: { 
        isActive: true,
        grade: {
          [Op.not]: null 
        }
      }
    });

    if (students.length === 0) {
      return {
        success: false,
        message: 'No active students with grade levels found',
        data: null
      };
    }

    const results = {
      totalStudents: students.length,
      processedStudents: 0,
      successfulEnrollments: 0,
      failedEnrollments: 0,
      studentResults: []
    };

    for (const student of students) {
      const enrollmentResult = await enrollStudentInGradeLevelCourses(student.id);
      
      results.processedStudents++;
      
      if (enrollmentResult.success) {
        results.successfulEnrollments++;
      } else {
        results.failedEnrollments++;
      }
      
      results.studentResults.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        success: enrollmentResult.success,
        message: enrollmentResult.message,
        newEnrollments: enrollmentResult.success ? 
          enrollmentResult.data.enrollmentSummary.newlyEnrolled : 0
      });
    }

    return {
      success: true,
      message: 'Bulk grade-based enrollment completed',
      data: results
    };
  } catch (error) {
    console.error('Error in enrollAllStudentsInGradeLevelCourses:', error);
    return {
      success: false,
      message: 'Error processing bulk grade-based enrollment',
      error: error.message
    };
  }
};

const getPendingStudentsByCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Teacher ID not found in request',
        data: null
      });
    }

    const teacherCourses = await Course.findAll({
      where: { 
        teacher_id: teacherId,
        isActive: true
      }
    });

    if (teacherCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No courses found for this teacher',
        data: null
      });
    }

    const courseIds = teacherCourses.map(course => course.id);
    const pendingEnrollments = await courseEnrollments.findAll({
      where: { 
        course_id: {
          [Op.in]: courseIds
        },
        status: 'pending'
      },
      include: [
        {
          model: Student,
          as: "Student", 
          attributes: ['id', 'firstName', 'lastName', 'email', 'grade' ,'student_id'],
          where: { isActive: true }
        },
        {
          model: Course,
          as: "Course",
          attributes: ['id', 'course_name', 'grade']
        }
      ]
    });

    if (pendingEnrollments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No students with pending enrollment status in any of your courses',
        data: {
          teacherId,
          totalCourses: teacherCourses.length,
          pendingStudents: []
        }
      });
    }
    const enrollmentsByCoursesMap = new Map();
    
    pendingEnrollments.forEach(enrollment => {
      const courseId = enrollment.course_id;
      const courseName = enrollment.Course.dataValues.course_name;
      
      if (!enrollmentsByCoursesMap.has(courseId)) {
        enrollmentsByCoursesMap.set(courseId, {
          courseId,
          courseName,
          pendingStudents: []
        });
      }
      
      enrollmentsByCoursesMap.get(courseId).pendingStudents.push({
        enrollmentId: enrollment.id,
        studentId: enrollment.Student.student_id,
        studentName: `${enrollment.Student.firstName} ${enrollment.Student.lastName}`,
        email: enrollment.Student.email,
        grade: enrollment.Student.grade,
        enrollmentDate: enrollment.enrollment_date,
        status: enrollment.status
      });
    });
    
    const enrollmentsByCourses = Array.from(enrollmentsByCoursesMap.values());
    enrollmentsByCourses.forEach(course => {
      course.totalPending = course.pendingStudents.length;
    });

    return res.status(200).json({
      success: true,
      message: 'Pending students retrieved successfully',
      data: {
        teacherId,
        totalCourses: teacherCourses.length,
        totalPendingEnrollments: pendingEnrollments.length,
        courses: enrollmentsByCourses
      }
    });
  } catch (error) {
    console.error('Error in getPendingStudentsByCourse:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving pending students',
      error: error.message
    });
  }
};


module.exports = {
  enrollStudentInGradeLevelCourses,
  enrollAllStudentsInGradeLevelCourses,
  getPendingStudentsByCourse
};
