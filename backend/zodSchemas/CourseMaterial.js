const { z } = require("zod");

const CourseMaterialSchema = z.object({
  courseId: z.string(),
  teacherId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable()
});

module.exports = { CourseMaterialSchema }; 