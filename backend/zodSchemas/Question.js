const { z } = require("zod");

const QuestionSchema = z.object({
  id: z.string().cuid().optional(),
  assessmentId: z.string(),
  text: z.string()
});

module.exports = { QuestionSchema }; 