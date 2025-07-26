import type { Grade } from './useGrades';

/**
 * Type guard to check if identity has a valid id
 */
export const hasValidId = (identity: unknown): identity is { id: string } => {
  return (
    typeof identity === 'object' &&
    identity !== null &&
    'id' in identity &&
    typeof (identity as any).id === 'string' &&
    (identity as any).id.length > 0
  );
};

/**
 * Type guard to check if a grade has valid assessment data
 */
export const hasValidAssessment = (grade: Grade): grade is Grade & {
  assessment: NonNullable<Grade['assessment']> & {
    totalMarks: number;
    course: NonNullable<Grade['assessment']['course']>;
  };
} => {
  return !!(
    grade.assessment &&
    typeof grade.assessment.totalMarks === 'number' &&
    grade.assessment.totalMarks > 0 &&
    grade.assessment.course &&
    grade.assessment.course.id &&
    grade.assessment.course.name
  );
};

/**
 * Type guard to check if a value is a valid numeric grade
 */
export const isValidGradeValue = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};