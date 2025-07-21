const { AssessmentSchema } = require("../../zodSchemas/Assessment");
const auth = require("../../middleware/authMiddleware");
const { PrismaClient } = require('../../prismaClient');
const prisma = new PrismaClient();

const validateAssessment = (data, req) => {
  try {
    let validatedData;
    if (req.method && req.method.toLowerCase() === "post") {
      validatedData = AssessmentSchema.omit({ id: true }).parse(data);
    } else {
      validatedData = AssessmentSchema.omit({ id: true }).partial().parse(data);
    }
    return {
      isValid: true,
      message: "Validation successful",
      data: validatedData
    };
  } catch (error) {
    if (error.errors) {
      const errors = error.errors.map(err => JSON.stringify(err));
      return {
        isValid: false,
        message: errors.join(", "),
        errors: errors
      };
    }
    return {
      isValid: false,
      message: "Validation failed",
      errors: [error.message]
    };
  }
};

const assessmentConfig = {
  // Custom POST action to handle assessment creation with questions
  customActions: {
    POST: async (req, res) => {
      try {
        const { title, type, courseId, teacherId, date, totalMarks, questions } = req.body;

        // Validate required fields
        if (!title || !type || !courseId || !teacherId || !date) {
          return res.status(400).json({
            error: 'Missing required fields: title, type, courseId, teacherId, date'
          });
        }

        // Validate questions if provided
        if (questions && Array.isArray(questions)) {
          let calculatedTotalMarks = 0;
          for (const question of questions) {
            if (!question.text || !question.type || !question.marks) {
              return res.status(400).json({
                error: 'Each question must have text, type, and marks'
              });
            }
            if (question.marks <= 0) {
              return res.status(400).json({
                error: 'Question marks must be greater than 0'
              });
            }
            calculatedTotalMarks += question.marks;
          }

          // Validate total marks match
          if (totalMarks && Math.abs(calculatedTotalMarks - totalMarks) > 0.01) {
            return res.status(400).json({
              error: `Total marks (${totalMarks}) does not match sum of question marks (${calculatedTotalMarks})`
            });
          }
        }

        // Create assessment with questions in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create the assessment
          const assessment = await tx.assessment.create({
            data: {
              title,
              type,
              courseId,
              teacherId,
              date: new Date(date),
              totalMarks: totalMarks || 0
            }
          });

          // Create questions if provided
          if (questions && Array.isArray(questions)) {
            const questionData = questions.map((q, index) => ({
              assessmentId: assessment.id,
              text: q.text,
              type: q.type,
              marks: q.marks,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.correctAnswer || null,
              order: q.order !== undefined ? q.order : index
            }));

            await tx.question.createMany({
              data: questionData
            });
          }

          // Return assessment with questions
          return await tx.assessment.findUnique({
            where: { id: assessment.id },
            include: {
              course: true,
              teacher: true,
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          });
        });

        res.status(201).json({
          message: 'Assessment created successfully',
          data: result
        });
      } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({
          error: 'Failed to create assessment',
          details: error.message
        });
      }
    },

    // Custom PUT action to handle assessment updates with questions
    PUT: async (req, res) => {
      try {
        const { id } = req.params;
        const { title, type, courseId, teacherId, date, totalMarks, questions } = req.body;

        // Validate required fields
        if (!title || !type || !courseId || !teacherId || !date) {
          return res.status(400).json({
            error: 'Missing required fields: title, type, courseId, teacherId, date'
          });
        }

        // Validate questions if provided
        if (questions && Array.isArray(questions)) {
          let calculatedTotalMarks = 0;
          for (const question of questions) {
            if (!question.text || !question.type || !question.marks) {
              return res.status(400).json({
                error: 'Each question must have text, type, and marks'
              });
            }
            if (question.marks <= 0) {
              return res.status(400).json({
                error: 'Question marks must be greater than 0'
              });
            }
            calculatedTotalMarks += question.marks;
          }

          // Validate total marks match
          if (totalMarks && Math.abs(calculatedTotalMarks - totalMarks) > 0.01) {
            return res.status(400).json({
              error: `Total marks (${totalMarks}) does not match sum of question marks (${calculatedTotalMarks})`
            });
          }
        }

        // Update assessment with questions in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Update the assessment
          const assessment = await tx.assessment.update({
            where: { id },
            data: {
              title,
              type,
              courseId,
              teacherId,
              date: new Date(date),
              totalMarks: totalMarks || 0
            }
          });

          // Delete existing questions
          await tx.question.deleteMany({
            where: { assessmentId: id }
          });

          // Create new questions if provided
          if (questions && Array.isArray(questions)) {
            const questionData = questions.map((q, index) => ({
              assessmentId: id,
              text: q.text,
              type: q.type,
              marks: q.marks,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.correctAnswer || null,
              order: q.order !== undefined ? q.order : index
            }));

            await tx.question.createMany({
              data: questionData
            });
          }

          // Return updated assessment with questions
          return await tx.assessment.findUnique({
            where: { id },
            include: {
              course: true,
              teacher: true,
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          });
        });

        res.json({
          message: 'Assessment updated successfully',
          data: result
        });
      } catch (error) {
        console.error('Error updating assessment:', error);
        res.status(500).json({
          error: 'Failed to update assessment',
          details: error.message
        });
      }
    },

    // Custom DELETE action to handle cascade deletion
    DELETE: async (req, res) => {
      try {
        const { id } = req.params;

        // Delete assessment (questions will be deleted automatically due to cascade)
        await prisma.assessment.delete({
          where: { id }
        });

        res.json({
          message: 'Assessment deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({
          error: 'Failed to delete assessment',
          details: error.message
        });
      }
    }
  }
};

module.exports = assessmentConfig; 