import { z } from 'zod';

export const AssessmentSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1),
  type: z.string().min(1),
  courseId: z.string().cuid(),
  teacherId: z.string().cuid(),
  date: z.string().datetime(),
  totalMarks: z.number().positive(),
  course: z.object({
    id: z.string().cuid(),
    name: z.string().min(1)
  }).optional(),
  teacher: z.object({
    id: z.string().cuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
  }).optional(),
  _count: z.object({
    questions: z.number().nonnegative()
  }).optional()
});

export const AssessmentArraySchema = z.array(AssessmentSchema);

export type ValidatedAssessment = z.infer<typeof AssessmentSchema>;