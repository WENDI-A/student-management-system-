const { z } = require("zod");

const StudentSchema = z.object({
  code: z.string().regex(/^\d{1,10}\/\d{1,10}$/).optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  classId: z.string().nullable(),
});

module.exports = { StudentSchema }; 