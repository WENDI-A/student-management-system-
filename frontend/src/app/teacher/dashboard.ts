"use client";
import { useMemo } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import dataProvider from '@/hooks/dataProvider';

// Hook to get teacher dashboard data
export function useTeacherDashboard() {
    const { data: identity } = useIdentity();
    const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;

    // Get teacher's assessments
    const { data: assessmentsData, isLoading: assessmentsLoading } = dataProvider.useListQuery('assessments', {
        page: 1,
        perPage: 1000,
        filter: teacherId ? { teacherId } : {},
        select: JSON.stringify({
            id: true,
            title: true,
            type: true,
            totalMarks: true,
            date: true,
            course: {
                select: {
                    id: true,
                    name: true,
                    code: true
                }
            }
        })
    });

    // Get teacher's courses with students
    const { data: coursesData, isLoading: coursesLoading } = dataProvider.useListQuery('courses', {
        page: 1,
        perPage: 1000,
        filter: teacherId ? {
            teachers: {
                some: { teacherId }
            }
        } : {},
        select: JSON.stringify({
            id: true,
            name: true,
            code: true,
            class: {
                select: {
                    id: true,
                    name: true,
                    students: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        })
    });

    // Get all grades for teacher's assessments
    const assessmentIds = assessmentsData?.data?.map((a: any) => a.id) || [];
    const { data: gradesData, isLoading: gradesLoading } = dataProvider.useListQuery('grades', {
        page: 1,
        perPage: 1000,
        filter: assessmentIds.length > 0 ? {
            assessmentId: { in: assessmentIds }
        } : {},
        select: JSON.stringify({
            id: true,
            value: true,
            assessmentId: true,
            studentId: true,
            assessment: {
                select: {
                    id: true,
                    title: true,
                    totalMarks: true,
                    course: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        })
    });

    // Calculate dashboard statistics
    const dashboardStats = useMemo(() => {
        const assessments = assessmentsData?.data || [];
        const courses = coursesData?.data || [];
        const grades = gradesData?.data || [];

        // Total students (unique across all courses)
        const allStudents = new Set();
        courses.forEach((course: any) => {
            course.class?.students?.forEach((student: any) => {
                allStudents.add(student.id);
            });
        });

        // Assessments count
        const totalAssessments = assessments.length;

        // Calculate average grade percentage
        const gradePercentages = grades.map((grade: any) =>
            (grade.value / grade.assessment.totalMarks) * 100
        );
        const averagePercentage = gradePercentages.length > 0
            ? gradePercentages.reduce((sum, grade) => sum + grade, 0) / gradePercentages.length
            : 0;

        // Convert percentage to letter grade
        const getLetterGrade = (percentage: number) => {
            if (percentage >= 90) return 'A';
            if (percentage >= 80) return 'B';
            if (percentage >= 70) return 'C';
            if (percentage >= 60) return 'D';
            return 'F';
        };

        // Count ungraded assessments (assessments with no grades)
        const gradedAssessmentIds = new Set(grades.map((g: any) => g.assessmentId));
        const ungradedAssessments = assessments.filter((a: any) => !gradedAssessmentIds.has(a.id));

        return {
            totalStudents: allStudents.size,
            totalAssessments,
            averageGrade: averagePercentage > 0 ? `${getLetterGrade(averagePercentage)} (${Math.round(averagePercentage)}%)` : 'N/A',
            pendingGrading: ungradedAssessments.length
        };
    }, [assessmentsData, coursesData, gradesData]);

    // Calculate course average grades for bar chart
    const courseAverages = useMemo(() => {
        const grades = gradesData?.data || [];
        const courseGrades: Record<string, { total: number; count: number; name: string }> = {};

        grades.forEach((grade: any) => {
            const courseName = grade.assessment.course.name;
            const percentage = (grade.value / grade.assessment.totalMarks) * 100;

            if (!courseGrades[courseName]) {
                courseGrades[courseName] = { total: 0, count: 0, name: courseName };
            }
            courseGrades[courseName].total += percentage;
            courseGrades[courseName].count += 1;
        });

        return Object.values(courseGrades).map(course => ({
            name: course.name,
            grade: course.count > 0 ? Math.round(course.total / course.count) : 0
        }));
    }, [gradesData]);

    // Calculate grade distribution for pie chart
    const gradeDistribution = useMemo(() => {
        const grades = gradesData?.data || [];
        const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

        grades.forEach((grade: any) => {
            const percentage = (grade.value / grade.assessment.totalMarks) * 100;
            if (percentage >= 90) distribution.A++;
            else if (percentage >= 80) distribution.B++;
            else if (percentage >= 70) distribution.C++;
            else if (percentage >= 60) distribution.D++;
            else distribution.F++;
        });

        return [
            { name: 'A (90-100%)', value: distribution.A },
            { name: 'B (80-89%)', value: distribution.B },
            { name: 'C (70-79%)', value: distribution.C },
            { name: 'D (60-69%)', value: distribution.D },
            { name: 'F (0-59%)', value: distribution.F }
        ].filter(item => item.value > 0); // Only show grades that exist
    }, [gradesData]);

    // Recent assessments for activity feed
    const recentAssessments = useMemo(() => {
        const assessments = assessmentsData?.data || [];
        return assessments
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [assessmentsData]);

    // Upcoming assessments (future dates)
    const upcomingAssessments = useMemo(() => {
        const assessments = assessmentsData?.data || [];
        const now = new Date();
        return assessments
            .filter((a: any) => new Date(a.date) > now)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [assessmentsData]);

    return {
        // Loading states
        isLoading: assessmentsLoading || coursesLoading || gradesLoading,

        // Raw data
        assessments: assessmentsData?.data || [],
        courses: coursesData?.data || [],
        grades: gradesData?.data || [],

        // Calculated stats
        dashboardStats,
        courseAverages,
        gradeDistribution,
        recentAssessments,
        upcomingAssessments,

        // Teacher info
        teacherId,
        identity
    };
}

// Hook for teacher profile/identity
export function useTeacherProfile() {
    const { data: identity, isLoading } = useIdentity();

    const teacherId = identity && typeof identity === 'object' && 'id' in identity
        ? (identity as any).id
        : '';

    const { data: teacherData, isLoading: teacherLoading } = dataProvider.useGetOneQuery('teachers', {
        id: teacherId, // Will be disabled if teacherId is empty due to enabled: !!id
        onError: () => { }, // Suppress default error message
        onSuccess: () => { } // Suppress default success message
    });

    return {
        teacher: teacherData?.data || null,
        identity,
        isLoading: isLoading || teacherLoading
    };
}
