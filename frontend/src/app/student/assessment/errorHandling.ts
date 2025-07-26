import { SnackbarMessage, VariantType } from 'notistack';

export interface AssessmentError {
  message: string;
  userMessage: string;
  severity: VariantType;
  context: string;
}

export const handleAssessmentError = (error: unknown, context: string): AssessmentError => {
  console.error(`Assessment error in ${context}:`, error);
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return {
        message: error.message,
        userMessage: 'Network error. Please check your connection and try again.',
        severity: 'error',
        context
      };
    }
    
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return {
        message: error.message,
        userMessage: 'Session expired. Please log in again.',
        severity: 'warning',
        context
      };
    }
    
    if (error.message.includes('Forbidden') || error.message.includes('403')) {
      return {
        message: error.message,
        userMessage: 'You do not have permission to access this resource.',
        severity: 'error',
        context
      };
    }
    
    return {
      message: error.message,
      userMessage: error.message,
      severity: 'error',
      context
    };
  }
  
  return {
    message: 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    severity: 'error',
    context
  };
};