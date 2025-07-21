const { PrismaClient } = require('../../prismaClient');
const prisma = new PrismaClient();

const questionConfig = {
  // Custom POST action to handle question creation
  customActions: {
    POST: async (req, res) => {
      try {
        const { assessmentId, text, type, marks, options, correctAnswer, order } = req.body;

        // Validate required fields
        if (!assessmentId || !text || !type || !marks) {
          return res.status(400).json({
            error: 'Missing required fields: assessmentId, text, type, marks'
          });
        }

        // Validate marks
        if (marks <= 0) {
          return res.status(400).json({
            error: 'Marks must be greater than 0'
          });
        }

        // Validate question type specific requirements
        if (type === 'MULTIPLE_CHOICE') {
          if (!options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
              error: 'Multiple choice questions must have at least 2 options'
            });
          }
          if (!correctAnswer) {
            return res.status(400).json({
              error: 'Multiple choice questions must have a correct answer'
            });
          }
        }

        if ((type === 'TRUE_FALSE' || type === 'FILL_BLANK') && !correctAnswer) {
          return res.status(400).json({
            error: `${type} questions must have a correct answer`
          });
        }

        // Create question
        const question = await prisma.question.create({
          data: {
            assessmentId,
            text,
            type,
            marks,
            options: options ? JSON.stringify(options) : null,
            correctAnswer: correctAnswer || null,
            order: order || 0
          },
          include: {
            assessment: true
          }
        });

        res.status(201).json({
          message: 'Question created successfully',
          data: question
        });
      } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({
          error: 'Failed to create question',
          details: error.message
        });
      }
    },

    // Custom PUT action to handle question updates
    PUT: async (req, res) => {
      try {
        const { id } = req.params;
        const { text, type, marks, options, correctAnswer, order } = req.body;

        // Validate required fields
        if (!text || !type || !marks) {
          return res.status(400).json({
            error: 'Missing required fields: text, type, marks'
          });
        }

        // Validate marks
        if (marks <= 0) {
          return res.status(400).json({
            error: 'Marks must be greater than 0'
          });
        }

        // Validate question type specific requirements
        if (type === 'MULTIPLE_CHOICE') {
          if (!options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
              error: 'Multiple choice questions must have at least 2 options'
            });
          }
          if (!correctAnswer) {
            return res.status(400).json({
              error: 'Multiple choice questions must have a correct answer'
            });
          }
        }

        if ((type === 'TRUE_FALSE' || type === 'FILL_BLANK') && !correctAnswer) {
          return res.status(400).json({
            error: `${type} questions must have a correct answer`
          });
        }

        // Update question
        const question = await prisma.question.update({
          where: { id },
          data: {
            text,
            type,
            marks,
            options: options ? JSON.stringify(options) : null,
            correctAnswer: correctAnswer || null,
            order: order || 0
          },
          include: {
            assessment: true
          }
        });

        res.json({
          message: 'Question updated successfully',
          data: question
        });
  } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({
          error: 'Failed to update question',
          details: error.message
        });
      }
    }
  }
};

module.exports = questionConfig; 