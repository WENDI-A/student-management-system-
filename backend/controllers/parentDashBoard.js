const { Parent, Student, ParentStudent, Assessment, Course, courseEnrollments, Grade } = require('../models');
const { Op } = require('sequelize');

exports.getStudentsOverview = async (req, res) => {
  try {
    const parentId = req.user.id;
    
    // Verify the user is a parent
    if (req.user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only parents can access this resource.'
      });
    } 
    
    // First, get the parent's associated student IDs
    const parent = await Parent.findOne({
      where: { id: parentId },
      include: [
        {
          model: Student,
          as: 'students',
          through: { model: ParentStudent },
          attributes: ['id', 'firstName', 'lastName', 'grade']
        }
      ]
    });
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    // Get student IDs for further queries
    const studentIds = parent.students.map(student => student.id);
    
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No students associated with this parent',
        data: {
          students: [],
          upcomingAssessments: []
        }
      });
    }
    
    // Get course enrollments for these students
    const enrollments = await courseEnrollments.findAll({
      where: {
        student_id: studentIds
      },
      include: [
        {
          model: Course,
          as: 'Course',
          attributes: ['id', 'Course_name', 'Course_code']
        }
      ]
    });
    
    // Group enrollments by student
    const coursesByStudent = {};
    enrollments.forEach(enrollment => {
      if (!coursesByStudent[enrollment.student_id]) {
        coursesByStudent[enrollment.student_id] = [];
      }
      coursesByStudent[enrollment.student_id].push(enrollment.Course);
    });
    
    // Get upcoming assessments for all students
    const upcomingAssessments = await Assessment.findAll({
      where: { 
        is_published: true,
        due_date: {
          [Op.gt]: new Date() // Only future assessments
        }
      },
      include: [
        {
          model: Course,
          attributes: ['id', 'Course_name', 'Course_code']
        }
      ],
      order: [['due_date', 'ASC']],
      limit: 5 // Limit to 5 upcoming assessments
    });
    
    // Get grades for all students
    const grades = await Grade.findAll({
      where: {
        student_id: studentIds,
        is_published: true // Only published grades
      },
      include: [
        {
          model: Assessment,
          attributes: ['id', 'title', 'type', 'max_score', 'weight']
        },
        {
          model: Course,
          attributes: ['id', 'Course_name', 'Course_code']
        }
      ]
    });
    
    // Group grades by student
    const gradesByStudent = {};
    grades.forEach(grade => {
      if (!gradesByStudent[grade.student_id]) {
        gradesByStudent[grade.student_id] = [];
      }
      gradesByStudent[grade.student_id].push({
        id: grade.id,
        score: grade.score,
        letterGrade: grade.letter_grade,
        feedback: grade.feedback,
        assessment: grade.Assessment,
        course: grade.Course,
        submittedAt: grade.submitted_at,
        gradedAt: grade.graded_at
      });
    });
    
    // Format the response data
    const studentsOverview = parent.students.map(student => {
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        section: student.section,
        courses: coursesByStudent[student.id] || [],
        grades: gradesByStudent[student.id] || [] // Include grades for this student
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        students: studentsOverview,
        upcomingAssessments: upcomingAssessments
      }
    });
    
  } catch (error) {
    console.error('Error fetching parent students overview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;
