const { z } = require("zod");

const AttendanceSchema = z.object({
  id: z.string().cuid().optional(),
  studentId: z.string(),
  courseId: z.string(),
  date: z.date(),
  status: z.string()
});

module.exports = { AttendanceSchema }; 