const { z } = require("zod");

const DirectorSchema = z.object({
  id: z.string().cuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().optional(), // Make password optional
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable()
});

module.exports = { DirectorSchema }; 