const { z } = require("zod");

const GradeSummarySchema = z.object({
  id: z.string().cuid().optional(),
  studentId: z.string(),
  courseId: z.string(),
  average: z.number()
});

module.exports = { GradeSummarySchema }; 