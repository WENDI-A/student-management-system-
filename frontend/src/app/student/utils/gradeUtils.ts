import { GRADE_COLORS, GRADE_THRESHOLDS } from '../constants';

/**
 * Get the appropriate color class for a grade percentage
 */
export const getGradeColor = (percentage: number): string => {
  if (percentage >= GRADE_THRESHOLDS.A) return GRADE_COLORS.EXCELLENT;
  if (percentage >= GRADE_THRESHOLDS.B) return GRADE_COLORS.GOOD;
  if (percentage >= GRADE_THRESHOLDS.C) return GRADE_COLORS.AVERAGE;
  return GRADE_COLORS.POOR;
};

/**
 * Get letter grade from percentage
 */
export const getLetterGrade = (percentage: number): string => {
  if (percentage >= GRADE_THRESHOLDS.A) return 'A';
  if (percentage >= GRADE_THRESHOLDS.B) return 'B';
  if (percentage >= GRADE_THRESHOLDS.C) return 'C';
  if (percentage >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
};

/**
 * Calculate percentage from grade value and total marks
 */
export const calculatePercentage = (value: number, totalMarks: number): number => {
  if (!totalMarks || totalMarks === 0) return 0;
  return (value / totalMarks) * 100;
};

/**
 * Format percentage for display
 */
export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Check if a grade is passing based on threshold
 */
export const isPassingGrade = (percentage: number, passingThreshold: number = GRADE_THRESHOLDS.D): boolean => {
  return percentage >= passingThreshold;
};