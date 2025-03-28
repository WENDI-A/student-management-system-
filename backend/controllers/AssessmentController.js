const { Assessment, Course } = require('../models');

// Get all assessments for a course
exports.getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;
    
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

// Get a single assessment
exports.getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findByPk(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
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

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, type, max_score, weight, due_date, is_published } = req.body;
    
    // Check if the course exists
    const course = await Course.findByPk(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
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

// Update an assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { title, description, type, max_score, weight, due_date, is_published } = req.body;
    
    const assessment = await Assessment.findByPk(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
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

// Delete an assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findByPk(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
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