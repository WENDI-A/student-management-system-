// Student module constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
  ASSESSMENTS_PAGE_SIZE: 50, // Assessments typically have fewer items
  MATERIALS_PAGE_SIZE: 100,
  GRADES_PAGE_SIZE: 100,
} as const;

export const DATE_FORMATS = {
  DISPLAY: {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
  },
} as const;

export const ASSESSMENT_STATUS = {
  SUBMITTED: 'submitted',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const;

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
} as const;

export const GRADE_COLORS = {
  EXCELLENT: 'text-green-600 dark:text-green-400', // >= 90%
  GOOD: 'text-blue-600 dark:text-blue-400',        // >= 80%
  AVERAGE: 'text-yellow-600 dark:text-yellow-400', // >= 70%
  POOR: 'text-red-600 dark:text-red-400',          // < 70%
} as const;

export const FILE_SECURITY = {
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'],
  MAX_FILENAME_LENGTH: 100,
  UPLOAD_PATH_PREFIX: '/uploads/',
} as const;