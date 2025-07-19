const { z } = require("zod");

const CourseTeacherSchema = z.object({
  id: z.string().cuid().optional(),
  teacherId: z.string(),
  courseId: z.string()
});

module.exports = { CourseTeacherSchema }; 