const { z } = require("zod");

const TeacherSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
});

module.exports = { TeacherSchema }; 