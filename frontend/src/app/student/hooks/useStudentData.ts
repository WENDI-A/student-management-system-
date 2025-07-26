import { useState, useEffect, useCallback } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import { useSnackbar } from 'notistack';
import { extractStudentId } from '@/utils/identity';
import dataProvider from '@/hooks/dataProvider';

export interface UseStudentDataOptions<T> {
  resource: string;
  select?: Record<string, any>;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  pagination?: { page: number; perPage: number };
  transform?: (data: any[]) => T[];
  errorContext: string;
}

export interface UseStudentDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  studentId: string | undefined;
  refetch: () => Promise<void>;
}

/**
 * Base hook for student data fetching with consistent error handling and patterns
 */
export function useStudentData<T = any>(
  options: UseStudentDataOptions<T>
): UseStudentDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: identity } = useIdentity();
  const { enqueueSnackbar } = useSnackbar();
  const studentId = extractStudentId(identity);

  const fetchData = useCallback(async () => {
    if (!studentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await dataProvider.getList(options.resource as any, {
        pagination: options.pagination,
        filter: {
          ...options.filter,
          // Ensure we only get data for enrolled courses
          course: {
            enrollments: { some: { studentId } },
            ...options.filter?.course
          }
        },
        select: options.select ? JSON.stringify(options.select) : undefined,
        orderBy: options.orderBy ? JSON.stringify(options.orderBy) : undefined
      });

      const transformedData = options.transform 
        ? options.transform(response.data)
        : response.data;
      
      setData(transformedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${options.resource}`;
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      console.error(`Error in ${options.errorContext}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, options, enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    studentId,
    refetch: fetchData
  };
}