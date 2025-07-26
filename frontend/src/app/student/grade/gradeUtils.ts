import type { Grade, CourseGradeData } from './useGrades';

const COLORS = ["#22c55e", "#facc15", "#f59e42", "#ef4444"];

/**
 * Validates if a grade has valid assessment data
 */
export const isValidGrade = (grade: Grade): boolean => {
  return !!(
    grade &&
    typeof grade.value === 'number' &&
    !isNaN(grade.value) &&
    grade.assessment?.totalMarks &&
    grade.assessment.totalMarks > 0
  );
};

/**
 * Filters grades to only include valid ones
 */
export const filterValidGrades = (grades: Grade[]): Grade[] => {
  return grades.filter(isValidGrade);
};

/**
 * Calculates average percentage from grades
 */
export const calculateAverageGrade = (
  grades: Grade[],
  calculatePercentage: (grade: Grade) => number
): number => {
  if (grades.length === 0) return 0;

  const gradesWithPercentages = grades.map(g => ({
    ...g,
    percentage: calculatePercentage(g)
  }));

  const average = gradesWithPercentages.reduce((sum, g) => sum + g.percentage, 0) / gradesWithPercentages.length;
  return isNaN(average) ? 0 : average;
};

/**
 * Groups grades by course
 */
export const groupGradesByCourse = (
  grades: Grade[],
  calculatePercentage: (grade: Grade) => number
): Map<string, { name: string; grades: number[] }> => {
  const courseGradeMap = new Map<string, { name: string; grades: number[] }>();

  grades.forEach(grade => {
    const courseId = grade.assessment?.course?.id;
    const courseName = grade.assessment?.course?.name;

    if (courseId && courseName) {
      if (!courseGradeMap.has(courseId)) {
        courseGradeMap.set(courseId, { name: courseName, grades: [] });
      }
      courseGradeMap.get(courseId)!.grades.push(calculatePercentage(grade));
    }
  });

  return courseGradeMap;
};

/**
 * Gets color based on grade percentage
 */
export const getGradeColor = (percentage: number): string => {
  if (percentage >= 90) return COLORS[0];
  if (percentage >= 80) return COLORS[1];
  if (percentage >= 70) return COLORS[2];
  return COLORS[3];
};

/**
 * Calculates course grade data for charts
 */
export const calculateCourseGrades = (
  courseGradeMap: Map<string, { name: string; grades: number[] }>,
  getLetterGrade: (percentage: number) => string
): CourseGradeData[] => {
  return Array.from(courseGradeMap.entries())
    .map(([, { name, grades }]) => {
      const courseAverage = grades.length > 0
        ? grades.reduce((sum, g) => sum + g, 0) / grades.length
        : 0;

      const letterGrade = getLetterGrade(courseAverage);
      const color = getGradeColor(courseAverage);

      return {
        course: name,
        grade: Math.round(courseAverage || 0),
        letterGrade,
        color
      };
    })
    .filter(cg => cg.grade > 0); // Only show courses with grades
};

/**
 * Main function to calculate all grade statistics
 */
export const calculateGradeStatistics = (
  grades: Grade[],
  calculatePercentage: (grade: Grade) => number,
  getLetterGrade: (percentage: number) => string
) => {
  if (!grades || grades.length === 0) {
    return { averageGrade: 0, totalGrades: 0, courseGrades: [] };
  }

  const validGrades = filterValidGrades(grades);
  const averageGrade = calculateAverageGrade(validGrades, calculatePercentage);
  const courseGradeMap = groupGradesByCourse(validGrades, calculatePercentage);
  const courseGrades = calculateCourseGrades(courseGradeMap, getLetterGrade);

  return {
    averageGrade,
    totalGrades: validGrades.length,
    courseGrades
  };
};