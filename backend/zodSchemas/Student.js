const { z } = require("zod");

const StudentSchema = z.object({
  id: z.string().cuid().optional(),
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