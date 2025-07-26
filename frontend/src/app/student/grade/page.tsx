"use client";
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useGrades } from './useGrades';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingCard } from '../components/LoadingCard';
import { ErrorCard } from '../components/ErrorCard';
import { getGradeColor } from '../utils/gradeUtils';

function StudentGradeContent() {
  const { 
    grades, 
    studentCourses, 
    isLoading, 
    error, 
    calculatePercentage, 
    getLetterGrade 
  } = useGrades();

  // State for collapsible courses
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set());

  // Toggle course collapse
  const toggleCourseCollapse = (courseId: string) => {
    setCollapsedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };



  // Group grades by course - memoized for performance
  const gradesByCourse = useMemo(() => {
    return studentCourses.map(course => {
      const courseGrades = grades.filter(grade => 
        grade.assessment?.course?.id === course.id
      );
      
      const totalPoints = courseGrades.reduce((sum, grade) => sum + grade.value, 0);
      const totalPossible = courseGrades.reduce((sum, grade) => sum + (grade.assessment?.totalMarks || 0), 0);
      const courseAverage = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0;
      
      return {
        course,
        grades: courseGrades,
        totalPoints,
        totalPossible,
        courseAverage,
        letterGrade: getLetterGrade(courseAverage)
      };
    }).filter(courseData => courseData.grades.length > 0); // Only show courses with grades
  }, [studentCourses, grades, getLetterGrade]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalEarned = gradesByCourse.reduce((sum, course) => sum + course.totalPoints, 0);
    const totalPossible = gradesByCourse.reduce((sum, course) => sum + course.totalPossible, 0);
    const totalAssessments = gradesByCourse.reduce((sum, course) => sum + course.grades.length, 0);
    const overallAverage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    
    return {
      totalEarned,
      totalPossible,
      totalAssessments,
      overallAverage,
      overallGrade: getLetterGrade(overallAverage)
    };
  }, [gradesByCourse, getLetterGrade]);

  if (isLoading) {
    return <LoadingCard message="Loading grades..." />;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Grades by Course</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your grades organized by course with totals and averages
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          {gradesByCourse.length} Courses with Grades
        </Badge>
      </div>

      {/* Overall Statistics Summary */}
      {gradesByCourse.length > 0 && (
        <Card className="rounded-2xl shadow bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Overall Academic Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-foreground">
                  {overallStats.totalEarned}/{overallStats.totalPossible}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Overall Average</p>
                <p className={`text-2xl font-bold ${getGradeColor(overallStats.overallAverage)}`}>
                  {overallStats.overallAverage.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Overall Grade</p>
                <Badge variant="outline" className="text-xl px-4 py-2">
                  {overallStats.overallGrade}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold text-foreground">
                  {overallStats.totalAssessments}
                </p>
              </div>
            </div>
            <Progress value={overallStats.overallAverage} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Grades by Course */}
      <div className="space-y-6">
        {gradesByCourse.length === 0 ? (
          <Card className="rounded-2xl shadow">
            <CardContent className="p-8">
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No grades available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Grades will appear here when your teachers grade your assessments.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          gradesByCourse.map((courseData) => (
            <Card key={courseData.course.id} className="rounded-2xl shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">{courseData.course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Course Code: {courseData.course.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-muted-foreground">Course Average</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getGradeColor(courseData.courseAverage)}`}>
                          {courseData.courseAverage.toFixed(1)}%
                        </span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {courseData.letterGrade}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-muted-foreground">Total Points</p>
                      <p className="text-lg font-semibold">
                        {courseData.totalPoints}/{courseData.totalPossible}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCourseCollapse(courseData.course.id)}
                      className="flex items-center gap-2"
                    >
                      {collapsedCourses.has(courseData.course.id) ? (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Details
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Progress value={courseData.courseAverage} className="mt-4" />
              </CardHeader>
              
              {!collapsedCourses.has(courseData.course.id) && (
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground mb-3">
                      Assessment Grades ({courseData.grades.length} assessments)
                    </h4>
                    
                    {/* Mobile-friendly responsive layout */}
                    <div className="space-y-3">
                      {courseData.grades.map((grade) => {
                        const percentage = calculatePercentage(grade);
                        return (
                          <div key={grade.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <h5 className="font-medium text-foreground">
                                    {grade.assessment?.title || 'Assessment'}
                                  </h5>
                                  {grade.assessment?.type && (
                                    <Badge variant="outline" className="capitalize w-fit">
                                      {grade.assessment.type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                <div className="text-center sm:text-right">
                                  <p className="text-xs text-muted-foreground">Score</p>
                                  <p className="font-medium">
                                    {grade.value}/{grade.assessment?.totalMarks || 0}
                                  </p>
                                </div>
                                <div className="text-center sm:text-right">
                                  <p className="text-xs text-muted-foreground">Percentage</p>
                                  <p className={`text-lg font-bold ${getGradeColor(percentage)}`}>
                                    {percentage.toFixed(1)}%
                                  </p>
                                </div>
                                <div className="text-center sm:text-right">
                                  <p className="text-xs text-muted-foreground">Grade</p>
                                  <Badge variant="outline" className="text-base px-2 py-1">
                                    {getLetterGrade(percentage)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function StudentGradePage() {
  return (
    <ErrorBoundary>
      <StudentGradeContent />
    </ErrorBoundary>
  );
}