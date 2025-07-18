const { z } = require("zod");

const StudentAnswerSchema = z.object({
  id: z.string().cuid().optional(),
  questionId: z.string(),
  studentId: z.string(),
  answer: z.string()
});

module.exports = { StudentAnswerSchema }; 