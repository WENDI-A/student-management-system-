const { z } = require("zod");

const ClassSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  section: z.string().optional().nullable()
});

module.exports = { ClassSchema }; 