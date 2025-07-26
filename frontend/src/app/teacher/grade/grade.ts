"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState, useMemo, useEffect } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';

interface Grade {
  id?: string;
  studentId: string;
  assessmentId: string;
  value: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  email: string;
  classId: string;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
  courseId: string;
  teacherId: string;
  date: string;
  totalMarks: number;
  course: {
    id: string;
    name: string;
    code: string;
    classId: string;
    class: {
      id: string;
      name: string;
      section: string;
    };
  };
}

// Get assessments by teacher with course info
export function useAssessmentsByTeacher() {
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;

  return dataProvider.useListQuery('assessments', {
    page: 1,
    perPage: 100,
    filter: teacherId ? { teacherId } : {},
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
          name: true,
          code: true,
          classId: true,
          class: {
            select: {
              id: true,
              name: true,
              section: true
            }
          }
        }
      }
    })
  });
}

// Get students by course (for the selected assessment's course)
export function useStudentsByCourse(courseId: string) {
  const shouldFetch = courseId && courseId.trim() !== '';
  
  return dataProvider.useListQuery('students', {
    page: 1,
    perPage: shouldFetch ? 1000 : 0,
    filter: shouldFetch ? { 
      class: { 
        courses: { 
          some: { 
            id: courseId
          } 
        } 
      } 
    } : {},
    select: JSON.stringify({
      id: true,
      firstName: true,
      lastName: true,
      code: true,
      email: true,
      classId: true
    })
  });
}

// Get existing grades for an assessment
export function useGradesByAssessment(assessmentId: string) {
  const shouldFetch = assessmentId && assessmentId.trim() !== '';
  
  return dataProvider.useListQuery('grades', {
    page: 1,
    perPage: shouldFetch ? 1000 : 0,
    filter: shouldFetch ? { assessmentId } : {},
    select: JSON.stringify({
      id: true,
      assessmentId: true,
      studentId: true,
      value: true,
      createdAt: true,
      updatedAt: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          code: true,
          email: true
        }
      }
    })
  });
}

// Get students with their grades for a specific assessment
export function useStudentsWithGrades(courseId: string, assessmentId: string) {
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useStudentsByCourse(courseId);
  const { data: gradesData, isLoading: gradesLoading, refetch: refetchGrades } = useGradesByAssessment(assessmentId);
  
  const students = studentsData?.data || [];
  const grades = gradesData?.data || [];
  
  const studentsWithGrades = useMemo(() => {
    return students.map((student: Student) => {
      const existingGrade = grades.find((grade: any) => grade.studentId === student.id);
      return {
        ...student,
        grade: existingGrade || null,
        hasGrade: !!existingGrade,
        gradeValue: existingGrade ? existingGrade.value : null
      };
    });
  }, [students, grades]);
  
  return {
    data: studentsWithGrades,
    isLoading: studentsLoading || gradesLoading,
    students,
    grades,
    refetchStudents,
    refetchGrades
  };
}

// Create grade
export function useCreateGrade(options: any) {
  return dataProvider.useCreateMutation('grades', options);
}

// Update grade
export function useUpdateGrade(options: any) {
  return dataProvider.useUpdateMutation('grades', options);
}

// Main grade management hook
export function useGradeManagement() {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessments
  const { data: assessmentsData, isLoading: assessmentsLoading } = useAssessmentsByTeacher();
  const assessments = assessmentsData?.data || [];

  // Get selected assessment
  const selectedAssessment = useMemo(() => {
    return assessments.find((a: Assessment) => a.id === selectedAssessmentId) || null;
  }, [assessments, selectedAssessmentId]);

  // Fetch students with grades for selected assessment
  const courseId = selectedAssessment?.courseId || "";
  const { 
    data: studentsWithGrades, 
    isLoading: studentsLoading, 
    students, 
    grades: existingGrades,
    refetchStudents,
    refetchGrades
  } = useStudentsWithGrades(courseId, selectedAssessmentId);

  // Create and update mutations
  const createGradeMutation = useCreateGrade({
    onSuccess: () => {
      console.log('Grade created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating grade:', error);
    }
  });

  const updateGradeMutation = useUpdateGrade({
    onSuccess: () => {
      console.log('Grade updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating grade:', error);
    }
  });

  // Initialize grades when assessment changes
  useEffect(() => {
    if (!selectedAssessmentId) {
      setGrades({});
      return;
    }

    // Clear grades when assessment changes
    setGrades({});
  }, [selectedAssessmentId]);

  // Initialize grades when data is loaded - completely avoid infinite loops
  useEffect(() => {
    if (selectedAssessmentId && !studentsLoading) {
      // Use a timeout to ensure data is stable
      const timeoutId = setTimeout(() => {
        console.log('Initializing grades for assessment:', selectedAssessmentId);
        // Initialize with empty grades - the component will populate them from studentsWithGrades data
        setGrades({});
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedAssessmentId, studentsLoading]);

  // Update individual grade
  const updateGrade = (studentId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  // Submit all grades
  const submitGrades = async () => {
    if (!selectedAssessmentId) {
      throw new Error("No assessment selected");
    }

    setIsSubmitting(true);
    try {
      const gradePromises: Promise<any>[] = [];

      // Process each student's grade using studentsWithGrades
      for (const student of studentsWithGrades) {
        const gradeValue = grades[student.id];
        
        // Skip if no grade entered
        if (!gradeValue || gradeValue.trim() === "") {
          continue;
        }

        const numericGrade = parseFloat(gradeValue);
        if (isNaN(numericGrade)) {
          continue;
        }

        // Check if grade already exists using the student's grade property
        if (student.hasGrade && student.grade) {
          // Update existing grade
          gradePromises.push(
            updateGradeMutation.mutateAsync({
              id: student.grade.id,
              data: {
                value: numericGrade
              }
            })
          );
        } else {
          // Create new grade
          gradePromises.push(
            createGradeMutation.mutateAsync({
              data: {
                assessmentId: selectedAssessmentId,
                studentId: student.id,
                value: numericGrade
              }
            })
          );
        }
      }

      // Execute all grade operations
      await Promise.all(gradePromises);
      
      // Force refetch both grades and students to get updated data
      await Promise.all([
        refetchGrades(),
        refetchStudents()
      ]);
      
      return {
        message: `Successfully submitted grades for ${gradePromises.length} students`
      };
    } catch (error) {
      console.error('Error submitting grades:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setGrades({});
    setSelectedAssessmentId("");
  };

  // Reset grades when assessment changes
  useEffect(() => {
    if (selectedAssessmentId) {
      console.log('Assessment changed, resetting grades for:', selectedAssessmentId);
    }
  }, [selectedAssessmentId]);

  return {
    // State
    selectedAssessmentId,
    setSelectedAssessmentId,
    grades,
    isSubmitting,
    
    // Data
    assessments,
    assessmentsLoading,
    students: studentsWithGrades,
    studentsLoading,
    selectedAssessment,
    existingGrades,
    
    // Actions
    updateGrade,
    submitGrades,
    resetForm
  };
}