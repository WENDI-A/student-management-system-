const { z } = require("zod");

const ScheduleSchema = z.object({
  id: z.string().cuid().optional(),
  courseId: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  location: z.string().optional().nullable()
});

module.exports = { ScheduleSchema }; 