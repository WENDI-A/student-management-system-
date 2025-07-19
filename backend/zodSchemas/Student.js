const { z } = require("zod");

const StudentSchema = z.object({
  // Student ID must match format like 1378/14
  id: z.string().regex(/^\d{1,10}\/\d{1,10}$/).optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  classId: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable()
});

module.exports = { StudentSchema }; 