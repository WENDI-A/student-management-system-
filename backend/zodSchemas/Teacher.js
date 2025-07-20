const { z } = require("zod");

const TeacherSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

module.exports = { TeacherSchema }; 