const { z } = require("zod");

const AttendanceSchema = z.object({
  id: z.string().cuid().optional(),
  studentId: z.string().cuid(),
  courseId: z.string().cuid(),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"])
});

module.exports = { AttendanceSchema }; 