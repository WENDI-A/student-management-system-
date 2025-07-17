const { Grade, Assessment, Course, Student, courseEnrollments } = require('../models');

exports.getStudentAssessmentsWithGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Fetch the student's grade
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const studentGrade = student.grade;

    // Verify student is enrolled in this course if courseId is provided
    if (courseId) {
      const enrollment = await courseEnrollments.findOne({
        where: {
          student_id: studentId,
          course_id: courseId
        }
      });

      if (!enrollment) {
        console.error('[ENROLLMENT CHECK FAILED]', {
          studentId,
          courseId,
          enrollmentResult: enrollment
        });
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    // Build the where clause for assessments
    const whereClause = { is_published: true };
    if (courseId) {
      whereClause.course_id = courseId;
    }
    console.log('[ASSESSMENT QUERY]', { whereClause, studentGrade });

    // Get all published assessments for the student's grade/class with associated grades if they exist
    const assessments = await Assessment.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          attributes: ['id', 'Course_name', 'Course_code', 'grade'],
          where: { grade: studentGrade }, // Only courses matching the student's grade/class
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
    console.log('[ASSESSMENTS FOUND]', { count: assessments.length });

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

exports.getStudentAssessmentById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assessmentId } = req.params;
    console.log('[DEBUG] getStudentAssessmentById called', { studentId, assessmentId });

    // Fetch the assessment
    const assessment = await Assessment.findOne({
      where: { id: assessmentId, is_published: true },
      include: [
        {
          model: Course,
          attributes: ['id', 'Course_name', 'Course_code', 'grade']
        },
        {
          model: Grade,
          required: false,
          where: { student_id: studentId },
          attributes: ['id', 'score', 'submitted_at', 'graded_at', 'is_published']
        }
      ]
    });
    console.log('[DEBUG] Assessment query result:', assessment);

    if (!assessment) {
      console.error('[ASSESSMENT NOT FOUND OR NOT PUBLISHED]', { assessmentId });
      return res.status(404).json({ success: false, message: 'Assessment not found or not published' });
    }

    // Check enrollment
    const courseId = assessment.course_id || (assessment.Course && assessment.Course.id);
    console.log('[DEBUG] Checking enrollment for student and course', { studentId, courseId });
    const enrollment = await courseEnrollments.findOne({
      where: {
        student_id: studentId,
        course_id: courseId
      }
    });
    console.log('[DEBUG] Enrollment query result:', enrollment);
    if (!enrollment) {
      console.error('[ENROLLMENT CHECK FAILED - SINGLE ASSESSMENT]', { studentId, courseId, assessmentId });
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    console.error('Error fetching single student assessment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = exports;