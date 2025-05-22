const db = require('../models');
const { Grade, GradeSummary, Student, Assessment, Course } = db;
const { Op } = require('sequelize');

/**
 * Grade Controller
 * Handles operations related to student grades
 */
const gradeController = {
  /**
   * Get all grades with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllGrades: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Grade.findAndCountAll({
        limit,
        offset,
        include: [
          { model: Student, attributes: ['id', 'name'] },
          { model: Course, attributes: ['id', 'title'] },
          { model: Assessment, attributes: ['id', 'title', 'type'] }
        ],
        order: [['updatedAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      console.error('Error fetching grades:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grades',
        error: error.message
      });
    }
  },

  /**
   * Get grades by student ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getGradesByStudentId: async (req, res) => {
    try {
      const { studentId } = req.params;
      
      // Validate student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get all grades for the student
      const grades = await Grade.findAll({
        where: { student_id: studentId },
        include: [
          { model: Course, attributes: ['id', 'Course_name', 'Course_code'] },
          { model: Assessment, attributes: ['id', 'title', 'type', 'weight'] }
        ],
        order: [
          ['course_id', 'ASC'],
          ['assessment_id', 'ASC']
        ]
      });

      // Get grade summaries for the student
      const gradeSummaries = await GradeSummary.findAll({
        where: { student_id: studentId },
        order: [['semester', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.name
          },
          grades,
          gradeSummaries
        }
      });
    } catch (error) {
      console.error('Error fetching student grades:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student grades',
        error: error.message
      });
    }
  },

  /**
   * Get grade by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getGradeById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const grade = await Grade.findByPk(id, {
        include: [
          { model: Student, attributes: ['id', 'name'] },
          { model: Course, attributes: ['id', 'title', 'code'] },
          { model: Assessment, attributes: ['id', 'title', 'type', 'weight'] }
        ]
      });

      if (!grade) {
        return res.status(404).json({
          success: false,
          message: 'Grade not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: grade
      });
    } catch (error) {
      console.error('Error fetching grade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grade',
        error: error.message
      });
    }
  },

  /**
   * Update a grade
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateGrade: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { 
        score, 
        letter_grade, 
        feedback, 
        is_published 
      } = req.body;

      // Find the grade
      const grade = await Grade.findByPk(id);
      
      if (!grade) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Grade not found'
        });
      }

      // Update the grade
      await grade.update({
        score: score !== undefined ? score : grade.score,
        letter_grade: letter_grade !== undefined ? letter_grade : grade.letter_grade,
        feedback: feedback !== undefined ? feedback : grade.feedback,
        is_published: is_published !== undefined ? is_published : grade.is_published,
        graded_at: new Date()
      }, { transaction });

      // If the grade is updated, we need to update the GradeSummary
      if (score !== undefined) {
        // Get the course to determine the semester
        const course = await Course.findByPk(grade.course_id);
        
        if (!course) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: 'Course not found'
          });
        }

        // Find or create the grade summary for this student and semester
        let [gradeSummary, created] = await GradeSummary.findOrCreate({
          where: {
            student_id: grade.student_id,
            semester: "1"
          },
          defaults: {
            total_grade: 0
          },
          transaction
        });

        // Calculate the new total grade for the student in this semester
        const studentGrades = await Grade.findAll({
          where: {
            student_id: grade.student_id
          },
          include: [
            {
              model: Course,
              attributes: ['id']
            },
            {
              model: Assessment,
              attributes: ['id', 'weight']
            }
          ],
          transaction
        });

        // Calculate weighted average
        let totalWeight = 0;
        let weightedSum = 0;

        studentGrades.forEach(g => {
          if (g.score !== null) {
            const weight = g.Assessment.weight || 1;
            weightedSum += g.score * weight;
            totalWeight += weight;
          }
        });

        const newTotalGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Update the grade summary
        await gradeSummary.update({
          total_grade: newTotalGrade
        }, { transaction });
      }

      await transaction.commit();

      // Fetch the updated grade with associations
      const updatedGrade = await Grade.findByPk(id, {
        include: [
          { model: Student, attributes: ['id', 'firstName', 'lastName'] },
          { model: Course, attributes: ['id', 'Course_name', 'Course_code'] },
          { model: Assessment, attributes: ['id', 'title', 'type', 'weight'] }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Grade updated successfully',
        data: updatedGrade
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating grade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade',
        error: error.message
      });
    }
  },

  /**
   * Get grade summaries by student ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getGradeSummariesByStudentId: async (req, res) => {
    try {
      const { studentId } = req.params;
      
      // Validate student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get grade summaries for the student
      const gradeSummaries = await GradeSummary.findAll({
        where: { student_id: studentId },
        order: [['semester', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.name
          },
          gradeSummaries
        }
      });
    } catch (error) {
      console.error('Error fetching grade summaries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grade summaries',
        error: error.message
      });
    }
  },

  /**
   * Update grade summaries for a student
   * This recalculates all grade summaries for a student based on their grades
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  recalculateGradeSummaries: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { studentId } = req.params;
      
      // Validate student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get all courses the student is enrolled in, grouped by semester
      const studentGrades = await Grade.findAll({
        where: { student_id: studentId },
        include: [
          { 
            model: Course,
            attributes: ['id', 'semester']
          },
          {
            model: Assessment,
            attributes: ['id', 'weight']
          }
        ],
        transaction
      });

      // Group grades by semester
      const semesterGrades = {};
      studentGrades.forEach(grade => {
        const semester = grade.Course.semester;
        if (!semesterGrades[semester]) {
          semesterGrades[semester] = [];
        }
        semesterGrades[semester].push(grade);
      });

      // Calculate and update grade summaries for each semester
      const updatedSummaries = [];
      for (const [semester, grades] of Object.entries(semesterGrades)) {
        // Calculate weighted average
        let totalWeight = 0;
        let weightedSum = 0;

        grades.forEach(grade => {
          if (grade.score !== null) {
            const weight = grade.Assessment.weight || 1;
            weightedSum += grade.score * weight;
            totalWeight += weight;
          }
        });

        const totalGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Find or create the grade summary
        const [gradeSummary, created] = await GradeSummary.findOrCreate({
          where: {
            student_id: studentId,
            semester
          },
          defaults: {
            total_grade: totalGrade
          },
          transaction
        });

        if (!created) {
          await gradeSummary.update({
            total_grade: totalGrade
          }, { transaction });
        }

        updatedSummaries.push(gradeSummary);
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Grade summaries recalculated successfully',
        data: updatedSummaries
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error recalculating grade summaries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to recalculate grade summaries',
        error: error.message
      });
    }
  }
};

module.exports = gradeController;