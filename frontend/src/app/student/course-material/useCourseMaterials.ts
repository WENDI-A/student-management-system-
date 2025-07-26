import { useState, useEffect, useMemo } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import dataProvider from '@/hooks/dataProvider';
import { useSnackbar } from 'notistack';
import { extractStudentId } from '@/utils/identity';
import { PAGINATION } from '../constants';

export interface CourseMaterial {
  id: string;
  title: string;
  description?: string;
  url?: string;
  courseId: string;
  teacherId: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  course?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface CourseWithMaterials extends Course {
  materials: CourseMaterial[];
}

// Internal types for API responses
interface MaterialResponse {
  id: string;
  title: string;
  description?: string;
  url?: string;
  courseId: string;
  teacherId: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface CourseWithMaterialsResponse {
  id: string;
  name: string;
  code: string;
  materials: MaterialResponse[];
}



export const useCourseMaterials = () => {
  const [coursesWithMaterials, setCoursesWithMaterials] = useState<CourseWithMaterials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: identity } = useIdentity();
  const { enqueueSnackbar } = useSnackbar();
  const studentId = extractStudentId(identity);



  // Optimized single query to fetch courses with materials
  const fetchCoursesWithMaterials = async () => {
    if (!studentId) return [];

    try {
      const response = await dataProvider.getList('courses', {
        pagination: { page: PAGINATION.DEFAULT_PAGE, perPage: PAGINATION.DEFAULT_PAGE_SIZE },
        filter: {
          enrollments: { some: { studentId } }
        },
        select: JSON.stringify({
          id: true,
          name: true,
          code: true,
          materials: {
            select: {
              id: true,
              title: true,
              description: true,
              url: true,
              courseId: true,
              teacherId: true,
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { title: 'asc' }
          }
        }),
        orderBy: JSON.stringify({ name: 'asc' })
      });

      // Transform the data to match expected structure
      return response.data.map((course: CourseWithMaterialsResponse) => ({
        id: course.id,
        name: course.name,
        code: course.code,
        materials: course.materials.map((material: MaterialResponse) => ({
          ...material,
          course: {
            id: course.id,
            name: course.name,
            code: course.code
          }
        }))
      }));
    } catch (err) {
      console.error('Error fetching courses with materials:', err);
      throw new Error('Failed to fetch course materials');
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!studentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const coursesWithMaterials = await fetchCoursesWithMaterials();
        setCoursesWithMaterials(coursesWithMaterials);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load course materials';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
        console.error('Course materials loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId, enqueueSnackbar]);

  // Memoized statistics calculation
  const stats = useMemo(() => {
    const totalMaterials = coursesWithMaterials.reduce((total, course) => total + course.materials.length, 0);
    const totalCourses = coursesWithMaterials.length;
    const materialsWithFiles = coursesWithMaterials.reduce((total, course) =>
      total + course.materials.filter(m => m.url).length, 0
    );

    return {
      totalMaterials,
      totalCourses,
      materialsWithFiles
    };
  }, [coursesWithMaterials]);

  return {
    coursesWithMaterials,
    isLoading,
    error,
    studentId,
    stats
  };
};