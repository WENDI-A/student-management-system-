import { useState, useEffect, useMemo } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import dataProvider from '@/hooks/dataProvider';
import { useSnackbar } from 'notistack';
import { extractStudentId } from '@/utils/identity';
import { PAGINATION } from '../constants';
import { handleAssessmentError } from './errorHandling';

export interface StudentAnswer {
  id: string;
  studentId: string;
  answer: string;
}

export interface AssessmentQuestion {
  id: string;
  studentAnswers: StudentAnswer[];
}

export interface Assessment {
  id: string;
  title: string;
  type: string;
  courseId: string;
  teacherId: string;
  date: string;
  totalMarks: number;
  course?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  questions?: AssessmentQuestion[];
  _count?: {
    questions: number;
  };
}

export const useAssessments = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: identity } = useIdentity();
  const { enqueueSnackbar } = useSnackbar();
  const studentId = extractStudentId(identity);



  // Load data with optimized single query
  useEffect(() => {
    const loadData = async () => {
      if (!studentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Optimized query to get assessments for student's enrolled courses
        // Use _count to check for answer existence without fetching data
        const response = await dataProvider.getList('assessments', {
          pagination: { page: PAGINATION.DEFAULT_PAGE, perPage: PAGINATION.ASSESSMENTS_PAGE_SIZE },
          filter: {
            course: {
              enrollments: { some: { studentId } }
            }
          },
          select: JSON.stringify({
            id: true,
            title: true,
            type: true,
            courseId: true,
            teacherId: true,
            date: true,
            totalMarks: true,
            course: {
              select: {
                id: true,
                name: true
              }
            },
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                questions: {
                  where: {
                    studentAnswers: {
                      some: { studentId }
                    }
                  }
                }
              }
            }
          }),
          orderBy: JSON.stringify({ date: 'desc' })
        });

        setAssessments(response.data);

      } catch (err) {
        const assessmentError = handleAssessmentError(err, 'loadData');
        setError(assessmentError.userMessage);
        enqueueSnackbar(assessmentError.userMessage, { variant: assessmentError.severity });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId, enqueueSnackbar]);

  // Helper function to check if assessment is submitted
  const hasStudentAnswers = (assessment: Assessment): boolean => {
    return (assessment._count?.questions ?? 0) > 0;
  };

  // Memoized statistics calculation
  const stats = useMemo(() => {
    return assessments.reduce(
      (acc, assessment) => {
        const hasAnswers = hasStudentAnswers(assessment);
        const isOverdue = assessment.date && new Date(assessment.date) < new Date();

        acc.total++;
        if (hasAnswers) {
          acc.submitted++;
        } else {
          acc.pending++;
          if (isOverdue) {
            acc.overdue++;
          }
        }
        return acc;
      },
      { total: 0, submitted: 0, pending: 0, overdue: 0 }
    );
  }, [assessments]);

  return {
    assessments,
    isLoading,
    error,
    studentId,
    stats
  };
};