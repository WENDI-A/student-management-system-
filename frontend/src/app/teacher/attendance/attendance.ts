"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import api from '@/lib/axios';
import React from 'react'; // Added missing import for React.useEffect

export function useAttendanceList(page = 1, perPage = 10, filter = {}) {
  return dataProvider.useListQuery('attendances', { page, perPage, filter });
}

export function useCreateAttendance(options: any) {
  return dataProvider.useCreateMutation('attendances', options);
}

export function useUpdateAttendance(options: any) {
  return dataProvider.useUpdateMutation('attendances', options);
}

export function useDeleteAttendance(options: any) {
  return dataProvider.useDeleteMutation('attendances', options);
}

// Get students by teacher's assigned classes
export function useStudentsByTeacherClasses() {
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  
  return dataProvider.useListQuery('students', {
    page: 1,
    perPage: 1000, // Get all students
    filter: teacherId ? { 
      class: { 
        courses: { 
          some: { 
            teachers: { 
              some: { teacherId } 
            } 
          } 
        } 
      } 
    } : {},
  });
}

// Get courses assigned to the teacher
export function useTeacherCourses() {
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  
  return dataProvider.useListQuery('courses', {
    page: 1,
    perPage: 100,
    filter: teacherId ? { 
      teachers: { 
        some: { teacherId } 
      } 
    } : {},
  });
}

// Get attendance for a specific date and course
export function useAttendanceByDateAndCourse(courseId: string, date: string) {
  return dataProvider.useListQuery('attendances', {
    page: 1,
    perPage: 1000,
    filter: { courseId, date }
  });
}

export function useAttendanceAdminState() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  
  const { data: studentsData, isLoading: studentsLoading } = useStudentsByTeacherClasses();
  const { data: coursesData, isLoading: coursesLoading } = useTeacherCourses();
  const { data: existingAttendanceData, refetch: refetchAttendance } = useAttendanceByDateAndCourse(selectedCourse, selectedDate);
  
  const students = studentsData?.data || [];
  const courses = coursesData?.data || [];
  const existingAttendance = existingAttendanceData?.data || [];

  // Get the selected course details
  const selectedCourseData = courses.find((course: any) => course.id === selectedCourse);

  // Filter students by selected course's class ID
  const filteredStudents = selectedCourse && selectedCourseData
    ? students.filter((student: any) => 
        student.classId === selectedCourseData.classId
      )
    : [];

  // Initialize student attendance from existing data
  const initializeAttendance = () => {
    const attendanceMap: Record<string, string> = {};
    
    // Set default status for all students
    filteredStudents.forEach((student: any) => {
      attendanceMap[student.id] = 'PRESENT';
    });
    
    // Override with existing attendance data
    existingAttendance.forEach((att: any) => {
      attendanceMap[att.studentId] = att.status;
    });
    
    setStudentAttendance(attendanceMap);
  };

  // Update attendance for a specific student
  const updateStudentAttendance = (studentId: string, status: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save all attendance for the selected date and course
  const saveAttendance = async () => {
    if (!selectedCourse || !selectedDate || isSaving) return;
    
    setIsSaving(true);
    try {
      // Delete existing attendance for this date and course
      for (const attendance of existingAttendance) {
        await dataProvider.delete('attendances', { id: attendance.id });
      }
      
      // Create new attendance records
      const attendancePromises = Object.entries(studentAttendance).map(([studentId, status]) => {
        return dataProvider.create('attendances', {
          data: {
            courseId: selectedCourse,
            studentId,
            date: selectedDate,
            status
          }
        });
      });
      
      await Promise.all(attendancePromises);
      
      // Refresh attendance data
      refetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize attendance when course or date changes
  React.useEffect(() => {
    if (selectedCourse && selectedDate) {
      initializeAttendance();
    }
  }, [selectedCourse, selectedDate, filteredStudents.length]);

  return {
    selectedCourse, setSelectedCourse,
    selectedDate, setSelectedDate,
    studentAttendance, updateStudentAttendance,
    isSaving, saveAttendance,
    students: filteredStudents, studentsLoading,
    courses, coursesLoading,
    existingAttendance,
  };
} 