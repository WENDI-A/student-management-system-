const { z } = require("zod");

const CourseEnrollmentSchema = z.object({
  id: z.string().cuid().optional(),
  studentId: z.string(),
  courseId: z.string(),
  enrolledAt: z.date().optional()
});

module.exports = { CourseEnrollmentSchema }; 