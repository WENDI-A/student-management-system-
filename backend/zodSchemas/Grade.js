const { z } = require("zod");

const GradeSchema = z.object({
  id: z.string().cuid().optional(),
  assessmentId: z.string(),
  studentId: z.string(),
  value: z.number()
});

module.exports = { GradeSchema }; 