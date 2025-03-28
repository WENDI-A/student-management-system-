const { Grade, Assessment, Student, Course } = require('../models');

exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const grades = await Grade.findAll({
      where: { course_id: courseId },
      include: [
        { model: Student, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Assessment, attributes: ['id', 'title', 'type', 'max_score', 'weight'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Error fetching course grades:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all grades for a specific student in a course
exports.getStudentCourseGrades = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    
    const grades = await Grade.findAll({
      where: { 
        course_id: courseId,
        student_id: studentId
      },
      include: [
        { model: Assessment, attributes: ['id', 'title', 'type', 'max_score', 'weight'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Error fetching student course grades:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create or update a grade
exports.createOrUpdateGrade = async (req, res) => {
  try {
    const { courseId, studentId, assessmentId } = req.params;
    const { score, letter_grade, feedback } = req.body;
    
    // Check if the assessment exists and belongs to the course
    const assessment = await Assessment.findOne({
      where: { 
        id: assessmentId,
        course_id: courseId
      }
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or does not belong to this course'
      });
    }
    
    // Check if the student is enrolled in the course
    const enrollment = await CourseEnrollment.findOne({
      where: {
        course_id: courseId,
        student_id: studentId,
        status: 'active'
      }
    });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }
    
    // Find or create the grade
    const [grade, created] = await Grade.findOrCreate({
      where: {
        course_id: courseId,
        student_id: studentId,
        assessment_id: assessmentId
      },
      defaults: {
        score,
        letter_grade,
        feedback,
        graded_at: new Date(),
        is_published: false
      }
    });
    
    // If the grade already existed, update it
    if (!created) {
      await grade.update({
        score,
        letter_grade,
        feedback,
        graded_at: new Date()
      });
    }
    
    res.status(created ? 201 : 200).json({
      success: true,
      data: grade,
      message: created ? 'Grade created successfully' : 'Grade updated successfully'
    });
  } catch (error) {
    console.error('Error creating/updating grade:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Publish grades for an assessment
exports.publishAssessmentGrades = async (req, res) => {
  try {
    const { courseId, assessmentId } = req.params;
    
    await Grade.update(
      { is_published: true },
      { 
        where: { 
          course_id: courseId,
          assessment_id: assessmentId
        } 
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Grades published successfully'
    });
  } catch (error) {
    console.error('Error publishing grades:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Calculate final grades for all students in a course
exports.calculateFinalGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Get all assessments for the course with their weights
    const assessments = await Assessment.findAll({
      where: { course_id: courseId }
    });
    
    // Get all active enrollments for the course
    const enrollments = await CourseEnrollment.findAll({
      where: { 
        course_id: courseId,
        status: 'active'
      }
    });
    
    // For each enrollment, calculate the final grade
    for (const enrollment of enrollments) {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      // Get all grades for this student in this course
      const grades = await Grade.findAll({
        where: {
          course_id: courseId,
          student_id: enrollment.student_id
        },
        include: [{ model: Assessment }]
      });
      
      // Calculate weighted score
      for (const grade of grades) {
        if (grade.score !== null) {
          const assessment = grade.Assessment;
          totalWeightedScore += (grade.score / assessment.max_score) * assessment.weight;
          totalWeight += assessment.weight;
        }
      }
      
      // Calculate final percentage if there are grades
      if (totalWeight > 0) {
        const finalPercentage = (totalWeightedScore / totalWeight) * 100;
        
        // Determine letter grade based on percentage
        let letterGrade = '';
        if (finalPercentage >= 90) letterGrade = 'A';
        else if (finalPercentage >= 80) letterGrade = 'B';
        else if (finalPercentage >= 70) letterGrade = 'C';
        else if (finalPercentage >= 60) letterGrade = 'D';
        else letterGrade = 'F';
        
        // Update the enrollment with the final grade
        await enrollment.update({
          final_grade: finalPercentage,
          final_letter_grade: letterGrade
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Final grades calculated successfully'
    });
  } catch (error) {
    console.error('Error calculating final grades:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;