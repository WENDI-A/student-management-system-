const { z } = require("zod");

const CourseSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  code: z.string(),
  classId: z.string().optional().nullable()
});

module.exports = { CourseSchema }; 