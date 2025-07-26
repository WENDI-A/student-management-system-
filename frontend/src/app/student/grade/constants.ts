// Grade calculation constants
export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
} as const;

export const GRADE_COLORS = {
  EXCELLENT: "#22c55e", // Green for A grades (90+)
  GOOD: "#facc15",      // Yellow for B grades (80-89)
  AVERAGE: "#f59e42",   // Orange for C grades (70-79)
  POOR: "#ef4444",      // Red for D/F grades (<70)
} as const;

// API pagination constants
export const PAGINATION_LIMITS = {
  COURSES: 100,
  GRADES: 100,
  DEFAULT: 10,
} as const;

// Chart display constants
export const CHART_CONFIG = {
  MIN_GRADE_TO_SHOW: 0,
  DECIMAL_PLACES: 1,
} as const;