import { VariantType } from 'notistack';

export interface GradeError {
  code: string;
  message: string;
  userMessage: string;
  severity: VariantType;
}

export const GRADE_ERRORS = {
  FETCH_COURSES_FAILED: {
    code: 'FETCH_COURSES_FAILED',
    message: 'Failed to fetch student courses',
    userMessage: 'Unable to load your enrolled courses. Please refresh the page.',
    severity: 'error' as VariantType,
  },
  FETCH_GRADES_FAILED: {
    code: 'FETCH_GRADES_FAILED',
    message: 'Failed to fetch grades',
    userMessage: 'Unable to load your grades. Please check your connection and try again.',
    severity: 'error' as VariantType,
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network request failed',
    userMessage: 'Connection problem. Please check your internet and try again.',
    severity: 'error' as VariantType,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'User not authenticated',
    userMessage: 'Please log in to view your grades.',
    severity: 'warning' as VariantType,
  },
} as const;

export const handleGradeError = (error: unknown, context: string): GradeError => {
  console.error(`Error in ${context}:`, error);
  
  // Check for specific error types
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return GRADE_ERRORS.UNAUTHORIZED;
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return GRADE_ERRORS.NETWORK_ERROR;
    }
  }
  
  // Default to context-specific error
  if (context.includes('courses')) {
    return GRADE_ERRORS.FETCH_COURSES_FAILED;
  }
  
  return GRADE_ERRORS.FETCH_GRADES_FAILED;
};