const { z } = require("zod");

const NotificationSchema = z.object({
  id: z.string().cuid().optional(),
  studentId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  adminId: z.string().optional().nullable(),
  directorId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  type: z.string(),
  content: z.string(),
  fileUrl: z.string().optional().nullable(),
  createdAt: z.date().optional()
});

module.exports = { NotificationSchema }; 