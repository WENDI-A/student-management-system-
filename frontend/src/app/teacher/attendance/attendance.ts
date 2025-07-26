"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState, useMemo } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';

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

// Get students by specific course
export function useStudentsByCourse(courseId: string) {
  const shouldFetch = courseId && courseId.trim() !== '';
  
  return dataProvider.useListQuery('students', {
    page: 1,
    perPage: shouldFetch ? 1000 : 0, // Get all students for the course
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
      classId: true,
      class: {
        select: {
          id: true,
          name: true
        }
      }
    })
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
    select: JSON.stringify({
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
    })
  });
}

// Get attendance for a specific date and course
export function useAttendanceByDateAndCourse(courseId: string, date: string) {
  // Convert date to exact midnight UTC for precise matching
  const exactDate = new Date(date + 'T00:00:00.000Z').toISOString();
  
  // Only include the filter when we have a valid courseId
  const shouldFetch = courseId && courseId.trim() !== '';
  
  return dataProvider.useListQuery('attendances', {
    page: 1,
    perPage: shouldFetch ? 1000 : 0, // Use 0 to prevent fetching when no courseId
    filter: shouldFetch ? {
      courseId,
      // Filter by exact date only
      date: {
        gte: exactDate,
        lt: new Date(new Date(exactDate).getTime() + 24 * 60 * 60 * 1000).toISOString()
      }
    } : {}, // Empty filter when no courseId
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



export function useAttendanceAdminState() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: studentsData, isLoading: studentsLoading } = useStudentsByCourse(selectedCourse);
  const { data: coursesData, isLoading: coursesLoading } = useTeacherCourses();
  const { data: existingAttendanceData, isLoading: attendanceLoading, refetch: refetchAttendance } = useAttendanceByDateAndCourse(selectedCourse, selectedDate);
  
  const students = studentsData?.data || [];
  const courses = coursesData?.data || [];
  const existingAttendance = useMemo(() => existingAttendanceData?.data || [], [existingAttendanceData?.data]);

  // Get the selected course details
  const selectedCourseData = courses.find((course: any) => course.id === selectedCourse);

  // Helper function to get attendance status for a specific student on the current date
  const getStudentAttendanceStatus = (studentId: string) => {
    // First check local state (for immediate UI updates)
    if (studentAttendance[studentId]) {
      return studentAttendance[studentId];
    }
    
    // Then check existing attendance data from database
    const existingRecord = existingAttendance.find(att => 
      att.studentId === studentId && 
      att.courseId === selectedCourse &&
      new Date(att.date).toISOString().split('T')[0] === selectedDate
    );
    
    return existingRecord ? existingRecord.status : null;
  };

  // Helper function to check if a student is marked for the current date
  const isStudentMarked = (studentId: string) => {
    return getStudentAttendanceStatus(studentId) !== null;
  };



  // Update attendance for a specific student and save automatically
  const updateStudentAttendance = async (studentId: string, status: string) => {
    if (!selectedCourse || !selectedDate) {
      console.log('Missing course or date:', { selectedCourse, selectedDate });
      return;
    }
    
    setIsSaving(true);
    try {
      console.log(`Updating attendance for student ${studentId} to ${status} on ${selectedDate}`);
      
      // Update local state immediately for UI responsiveness
      setStudentAttendance(prev => ({
        ...prev,
        [studentId]: status
      }));
      
      // Find if there's existing attendance for this student on this specific date and course
      const existingRecord = existingAttendance.find(att => 
        att.studentId === studentId && 
        att.courseId === selectedCourse &&
        new Date(att.date).toISOString().split('T')[0] === selectedDate
      );
      
      if (existingRecord) {
        // Update existing record
        console.log(`Updating existing attendance record ${existingRecord.id}`);
        await dataProvider.update('attendances', {
          id: existingRecord.id,
          data: {
            status
          }
        });
        console.log(`Successfully updated attendance record ${existingRecord.id}`);
      } else {
        // Create new record
        console.log(`Creating new attendance record for student ${studentId}`);
        const newRecord = await dataProvider.create('attendances', {
          data: {
            courseId: selectedCourse,
            studentId,
            date: new Date(selectedDate + 'T00:00:00.000Z').toISOString(),
            status
          }
        });
        console.log(`Successfully created new attendance record:`, newRecord);
      }
      
      // Refresh attendance data to get the latest state
      await refetchAttendance();
      console.log(`Refreshed attendance data after update`);
      
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Revert local state on error
      setStudentAttendance(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
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
            date: new Date(selectedDate + 'T00:00:00.000Z').toISOString(),
            status
          }
        });
      });
      
      await Promise.all(attendancePromises);
      
      // Refresh attendance data
      await refetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };



  // Initialize attendance when course or date changes
  React.useEffect(() => {
    console.log('Date/Course changed:', { selectedCourse, selectedDate, existingAttendanceCount: existingAttendance.length });
    
    // Always clear previous attendance when course or date changes
    setStudentAttendance({});
    
    // Only populate attendance if we have valid course, date, and attendance data
    if (selectedCourse && selectedDate && existingAttendance.length > 0) {
      const attendanceMap: Record<string, string> = {};
      
      // Only set attendance for students with existing records for this specific date and course
      existingAttendance.forEach((att: any) => {
        // Double-check that this attendance record is for the current date
        const attDate = new Date(att.date).toISOString().split('T')[0];
        const currentDate = selectedDate;
        
        if (attDate === currentDate && att.courseId === selectedCourse) {
          attendanceMap[att.studentId] = att.status;
          console.log(`Setting attendance for student ${att.studentId}: ${att.status} on ${attDate}`);
        }
      });
      
      setStudentAttendance(attendanceMap);
      console.log('Final attendance map:', attendanceMap);
    } else {
      console.log('No existing attendance data or missing course/date');
    }
  }, [selectedCourse, selectedDate, existingAttendance]);

  // Force refetch when date or course changes
  React.useEffect(() => {
    if (selectedCourse && selectedDate) {
      console.log('Refetching attendance for:', { selectedCourse, selectedDate });
      refetchAttendance();
    }
  }, [selectedCourse, selectedDate, refetchAttendance]);

  return {
    selectedCourse, setSelectedCourse,
    selectedDate, setSelectedDate,
    studentAttendance, updateStudentAttendance,
    isSaving,
    bulkSaveAttendance, // Renamed from saveAttendance to bulkSaveAttendance
    students, studentsLoading,
    courses, coursesLoading,
    existingAttendance,
    attendanceLoading,
    selectedCourseData,
    getStudentAttendanceStatus,
    isStudentMarked
  };
} 