const { z } = require("zod");

const ParentSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
});

module.exports = { ParentSchema }; 