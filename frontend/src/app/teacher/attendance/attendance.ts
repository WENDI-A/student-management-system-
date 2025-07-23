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
    filter: { courseId, date },
    select: JSON.stringify({
      id: true,
      date: true,
      status: true,
      studentId: true,
      courseId: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          code: true
        }
      }
    })
  });
}

// Get attendance for a date range
export function useAttendanceByDateRange(courseId: string, startDate: string, endDate: string) {
  return dataProvider.useListQuery('attendances', {
    page: 1,
    perPage: 1000,
    filter: { 
      courseId, 
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    select: JSON.stringify({
      id: true,
      date: true,
      status: true,
      studentId: true,
      courseId: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          code: true
        }
      }
    }),
    orderBy: JSON.stringify({ date: 'desc' })
  });
}

export function useAttendanceAdminState() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [dateRange, setDateRange] = useState<{startDate: string, endDate: string}>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], // Last 7 days
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  
  const { data: studentsData, isLoading: studentsLoading } = useStudentsByTeacherClasses();
  const { data: coursesData, isLoading: coursesLoading } = useTeacherCourses();
  const { data: existingAttendanceData, refetch: refetchAttendance } = useAttendanceByDateAndCourse(selectedCourse, selectedDate);
  const { data: dateRangeAttendanceData, refetch: refetchDateRangeAttendance } = useAttendanceByDateRange(
    selectedCourse, 
    dateRange.startDate, 
    dateRange.endDate
  );
  
  const students = studentsData?.data || [];
  const courses = coursesData?.data || [];
  const existingAttendance = existingAttendanceData?.data || [];
  const dateRangeAttendance = dateRangeAttendanceData?.data || [];

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
    
    // Only set attendance for students with existing data
    // Don't set default values - leave unmarked students truly unmarked
    existingAttendance.forEach((att: any) => {
      attendanceMap[att.studentId] = att.status;
    });
    
    setStudentAttendance(attendanceMap);
  };

  // Update attendance for a specific student and save automatically
  const updateStudentAttendance = async (studentId: string, status: string) => {
    if (!selectedCourse || !selectedDate) return;
    
    setIsSaving(true);
    try {
      // Update local state
      setStudentAttendance(prev => ({
        ...prev,
        [studentId]: status
      }));
      
      // Find if there's existing attendance for this student
      const existingRecord = existingAttendance.find(att => att.studentId === studentId);
      
      if (existingRecord) {
        // Update existing record
        await dataProvider.update('attendances', {
          id: existingRecord.id,
          data: {
            status
          }
        });
      } else {
        // Create new record
        await dataProvider.create('attendances', {
          data: {
            courseId: selectedCourse,
            studentId,
            date: new Date(selectedDate).toISOString(),
            status
          }
        });
      }
      
      // Refresh attendance data
      await refetchAttendance();
      await refetchDateRangeAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk save all attendance for the selected date and course
  const bulkSaveAttendance = async () => {
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
            date: new Date(selectedDate).toISOString(),
            status
          }
        });
      });
      
      await Promise.all(attendancePromises);
      
      // Refresh attendance data
      await refetchAttendance();
      await refetchDateRangeAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update date range for attendance history
  const updateDateRange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    refetchDateRangeAttendance();
  };

  // Get attendance statistics for the date range
  const getAttendanceStats = () => {
    if (!dateRangeAttendance.length) return {};
    
    const stats: Record<string, {present: number, absent: number, late: number, excused: number, total: number}> = {};
    
    // Initialize stats for each student
    filteredStudents.forEach((student: any) => {
      stats[student.id] = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0
      };
    });
    
    // Count attendance by status
    dateRangeAttendance.forEach((att: any) => {
      if (stats[att.studentId]) {
        stats[att.studentId][att.status.toLowerCase()]++;
        stats[att.studentId].total++;
      }
    });
    
    return stats;
  };

  // Initialize attendance when course or date changes
  React.useEffect(() => {
    if (selectedCourse && selectedDate) {
      initializeAttendance();
    }
  }, [selectedCourse, selectedDate, filteredStudents.length, existingAttendance.length]);

  return {
    selectedCourse, setSelectedCourse,
    selectedDate, setSelectedDate,
    studentAttendance, updateStudentAttendance,
    isSaving,
    bulkSaveAttendance, // Renamed from saveAttendance to bulkSaveAttendance
    students: filteredStudents, studentsLoading,
    courses, coursesLoading,
    existingAttendance,
    dateRange, updateDateRange,
    dateRangeAttendance,
    getAttendanceStats
  };
} 