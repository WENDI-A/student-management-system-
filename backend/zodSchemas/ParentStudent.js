const { z } = require("zod");

const ParentStudentSchema = z.object({
  id: z.string().cuid().optional(),
  parentId: z.string(),
  studentId: z.string()
});

module.exports = { ParentStudentSchema }; 