const { Assessment, Course } = require('../models');

// Get all assessments for all courses taught by the teacher
exports.getTeacherAssessments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Find all courses taught by this teacher
    const courses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ['id']
    });
    
    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No courses found for this teacher'
      });
    }
    
    // Extract course IDs
    const courseIds = courses.map(course => course.id);
    
    // Get all assessments for these courses
    const assessments = await Assessment.findAll({
      where: { course_id: courseIds },
      order: [['due_date', 'ASC']],
      include: [{
        model: Course,
        attributes: ['id', 'Course_name', 'Course_code']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching teacher assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all assessments for a specific course taught by the teacher
exports.getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;
    
    // Verify the course belongs to the teacher
    const course = await Course.findOne({
      where: { 
        id: courseId,
        teacher_id: teacherId
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not taught by this teacher'
      });
    }
    
    const assessments = await Assessment.findAll({
      where: { course_id: courseId },
      order: [['due_date', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching course assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single assessment (verifying teacher ownership)
exports.getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const teacherId = req.user.id;
    
    // Find the assessment and verify it belongs to a course taught by this teacher
    const assessment = await Assessment.findOne({
      where: { id: assessmentId },
      include: [{
        model: Course,
        where: { teacher_id: teacherId },
        attributes: ['id', 'Course_name', 'Course_code']
      }]
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not associated with your courses'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get one assessment by ID from params
exports.getOneAssessment = async (req, res) => {
  try {
    const { id } = req.params; // Get assessment ID from params
    const teacherId = req.user.id;
    
    // Find the assessment and verify it belongs to a course taught by this teacher
    const assessment = await Assessment.findOne({
      where: { id },
      include: [{
        model: Course,
        where: { teacher_id: teacherId },
        attributes: ['id', 'Course_name', 'Course_code']
      }]
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not associated with your courses'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all courses taught by the teacher
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const courses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ['id', 'Course_name', 'Course_code'],
      order: [['Course_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new assessment for a course taught by the teacher
exports.createAssessment = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, type, max_score, weight, due_date, is_published } = req.body;
    
    // Find all courses taught by this teacher
    const courses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ['id'],
      order: [['createdAt', 'ASC']]
    });
    
    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No courses found for this teacher'
      });
    }
    
    // Use the first course ID from the teacher's courses
    const courseId = courses[0].id;
    
    const assessment = await Assessment.create({
      course_id: courseId,
      title,
      description,
      type,
      max_score,
      weight,
      due_date,
      is_published: is_published || false
    });
    
    res.status(201).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update an assessment (verifying teacher ownership)
exports.updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const teacherId = req.user.id;
    const { title, description, type, max_score, weight, due_date, is_published } = req.body;
    
    // Find the assessment and verify it belongs to a course taught by this teacher
    const assessment = await Assessment.findOne({
      where: { id: assessmentId },
      include: [{
        model: Course,
        where: { teacher_id: teacherId },
        attributes: ['id', 'Course_name']
      }]
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not associated with your courses'
      });
    }
    
    await assessment.update({
      title,
      description,
      type,
      max_score,
      weight,
      due_date,
      is_published
    });
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete an assessment (verifying teacher ownership)
exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const teacherId = req.user.id;
    
    // Find the assessment and verify it belongs to a course taught by this teacher
    const assessment = await Assessment.findOne({
      where: { id: assessmentId },
      include: [{
        model: Course,
        where: { teacher_id: teacherId },
        attributes: ['id']
      }]
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not associated with your courses'
      });
    }
    
    await assessment.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;
