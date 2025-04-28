const { Grade, Assessment, Course, Student, Enrollment } = require('../models');

exports.getStudentAssessmentsWithGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;
    
    // Verify student is enrolled in this course if courseId is provided
    if (courseId) {
      const enrollment = await Student.findOne({
        where: { 
          id: studentId,
          '$Enrollments.course_id$': courseId
        },
        include: [
          {
            model: Enrollment,
            as: 'Enrollments',
            attributes: ['id']
          }
        ]
      });
      
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }
    
    // Build the where clause based on whether courseId is provided
    const whereClause = courseId ? { course_id: courseId, is_published: true } : { is_published: true };
    
    // Get all published assessments with associated grades if they exist
    const assessments = await Assessment.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          attributes: ['id', 'Course_name', 'Course_code']
        },
        {
          model: Grade,
          required: false, // Left join to include assessments without grades
          where: { student_id: studentId },
          attributes: ['id', 'score', 'submitted_at', 'graded_at', 'is_published']
        }
      ],
      order: [
        [{ model: Course }, 'Course_name', 'ASC'],
        ['due_date', 'ASC']
      ]
    });
    
    res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching student assessments with grades:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;