"use client";
import dataProvider from '@/hooks/dataProvider';
import { useIdentity as useTeacherIdentity } from '@/hooks/auth/useIdentity';

// Fetch all students enrolled in any course taught by the current teacher
export function useTeacherCourseEnrollmentList() {
  const { data: identity } = useTeacherIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  // Use advanced search: filter students by enrollments.some.course.teachers.some.teacherId = teacherId
  return dataProvider.useListQuery('students', {
    page: 1,
    perPage: 1000,
    filter: teacherId
      ? {
          enrollments: {
            some: {
              course: {
                teachers: {
                  some: { teacherId },
                },
              },
            },
          },
        }
      : {},
    include: JSON.stringify({ enrollments: { include: { course: { include: { teachers: true } } } } }),
  });
}

export { useTeacherIdentity }; 