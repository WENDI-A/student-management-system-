import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import dataProvider from '@/hooks/dataProvider';
import { useSnackbar } from 'notistack';
import { calculateGradeStatistics } from './gradeUtils';
import { GRADE_THRESHOLDS, PAGINATION_LIMITS } from './constants';
import { handleGradeError } from './errorHandling';
import { hasValidId } from './typeGuards';

export interface Grade {
  id: string;
  assessmentId: string;
  studentId: string;
  value: number;
  assessment?: {
    id: string;
    title: string;
    type: string;
    totalMarks: number;
    course?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface StudentCourse {
  id: string;
  name: string;
  code: string;
}

export interface CourseGradeData {
  course: string;
  grade: number;
  letterGrade: string;
  color: string;
}

export const useGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: identity } = useIdentity();
  const { enqueueSnackbar } = useSnackbar();
  const studentId = hasValidId(identity) ? identity.id : undefined;

  // Stable error handler with useCallback
  const handleError = useCallback((error: unknown, context: string) => {
    const gradeError = handleGradeError(error, context);
    setError(gradeError.userMessage);
    enqueueSnackbar(gradeError.userMessage, { variant: gradeError.severity });
  }, [enqueueSnackbar]);

  // Fetch student's enrolled courses
  const fetchStudentCourses = useCallback(async () => {
    if (!studentId) return [];
    
    try {
      const response = await dataProvider.getList('courses', {
        pagination: { page: 1, perPage: PAGINATION_LIMITS.COURSES },
        filter: {
          enrollments: { some: { studentId } }
        },
        select: JSON.stringify({
          id: true,
          name: true,
          code: true
        })
      });
      return response.data;
    } catch (err) {
      const gradeError = handleGradeError(err, 'fetchStudentCourses');
      throw new Error(gradeError.message);
    }
  }, [studentId]);

  // Fetch grades for student with advanced search
  const fetchGrades = useCallback(async () => {
    if (!studentId) return [];

    try {
      const response = await dataProvider.getList('grades', {
        pagination: { page: 1, perPage: PAGINATION_LIMITS.GRADES },
        filter: {
          studentId
        },
        select: JSON.stringify({
          id: true,
          assessmentId: true,
          studentId: true,
          value: true,
          assessment: {
            select: { 
              id: true, 
              title: true, 
              type: true,
              totalMarks: true,
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }),
        orderBy: JSON.stringify({ 
          assessment: { 
            course: { name: 'asc' },
            createdAt: 'desc' 
          } 
        })
      });
      return response.data;
    } catch (err) {
      const gradeError = handleGradeError(err, 'fetchGrades');
      throw new Error(gradeError.message);
    }
  }, [studentId]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!studentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch both courses and grades in parallel
        const [courses, gradesData] = await Promise.all([
          fetchStudentCourses(),
          fetchGrades()
        ]);
        
        setStudentCourses(courses);
        setGrades(gradesData);

      } catch (err) {
        handleError(err, 'loadData');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId, fetchStudentCourses, fetchGrades, handleError]);

  // Calculate percentage from grade value and total marks
  const calculatePercentage = (grade: Grade): number => {
    if (!grade.assessment?.totalMarks || grade.assessment.totalMarks === 0) return 0;
    return (grade.value / grade.assessment.totalMarks) * 100;
  };

  // Get letter grade from percentage
  const getLetterGrade = (percentage: number): string => {
    if (percentage >= GRADE_THRESHOLDS.A) return 'A';
    if (percentage >= GRADE_THRESHOLDS.B) return 'B';
    if (percentage >= GRADE_THRESHOLDS.C) return 'C';
    if (percentage >= GRADE_THRESHOLDS.D) return 'D';
    return 'F';
  };

  // Calculate statistics with memoization
  const stats = useMemo(() => {
    return calculateGradeStatistics(grades, calculatePercentage, getLetterGrade);
  }, [grades]);

  return {
    grades,
    studentCourses,
    isLoading,
    error,
    studentId,
    stats,
    calculatePercentage,
    getLetterGrade
  };
};