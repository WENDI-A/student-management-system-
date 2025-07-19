const { z } = require("zod");

const AssessmentSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string(),
  type: z.string(),
  courseId: z.string(),
  teacherId: z.string(),
  date: z.date()
});

module.exports = { AssessmentSchema }; 