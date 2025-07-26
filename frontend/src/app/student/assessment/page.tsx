"use client";
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ClipboardList, 
  Calendar, 
  BookOpen, 
  User,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAssessments } from './useAssessments';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AssessmentStatusBadge } from './components/AssessmentStatusBadge';
import { LoadingCard } from '../components/LoadingCard';
import { ErrorCard } from '../components/ErrorCard';
import { DATE_FORMATS } from '../constants';

function StudentAssessmentContent() {
  const { assessments, isLoading, error } = useAssessments();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Format date using project constants - memoized for performance
  const formatDate = useMemo(() => (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', DATE_FORMATS.DISPLAY);
  }, []);

  // Check if assessment is overdue
  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  // Toggle course expansion
  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  // Group assessments by course - memoized for performance
  const coursesWithAssessments = useMemo(() => {
    const courseMap = new Map<string, {
      id: string;
      name: string;
      assessments: typeof assessments;
    }>();
    
    assessments.forEach((assessment) => {
      const courseId = assessment.course?.id || 'unknown';
      const courseName = assessment.course?.name || 'Unknown Course';
      
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          id: courseId,
          name: courseName,
          assessments: []
        });
      }
      
      courseMap.get(courseId)!.assessments.push(assessment);
    });
    
    return Array.from(courseMap.values());
  }, [assessments]);

  if (isLoading) {
    return <LoadingCard message="Loading assessments..." />;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  const totalAssessments = assessments.length;

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and track your course assessments
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          {totalAssessments} Assessments
        </Badge>
      </div>

      {/* Courses with Assessments */}
      <div className="space-y-4">
        {coursesWithAssessments.length === 0 ? (
          <Card className="rounded-2xl shadow">
            <CardContent className="p-8">
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assessments available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Assessments will appear here when your teachers create them.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          coursesWithAssessments.map((course) => (
            <Card key={course.id} className="rounded-2xl shadow">
              <Collapsible
                open={expandedCourses.has(course.id)}
                onOpenChange={() => toggleCourse(course.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCourses.has(course.id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {course.name}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {course.assessments.length} {course.assessments.length === 1 ? 'Assessment' : 'Assessments'}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {course.assessments.length === 0 ? (
                      <div className="text-center py-6">
                        <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No assessments available for this course yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-900">
                              <th className="px-3 py-3 text-left font-medium">Title</th>
                              <th className="px-3 py-3 text-left font-medium">Type</th>
                              <th className="px-3 py-3 text-left font-medium">Teacher</th>
                              <th className="px-3 py-3 text-left font-medium">Date</th>
                              <th className="px-3 py-3 text-left font-medium">Marks</th>
                              <th className="px-3 py-3 text-left font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {course.assessments.map((assessment) => {
                              const hasAnswers = (assessment._count?.questions ?? 0) > 0;
                              const isOverdueAssessment = isOverdue(assessment.date);
                              
                              return (
                                <tr key={assessment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                  <td className="px-3 py-4">
                                    <p className="font-medium text-foreground">{assessment.title}</p>
                                  </td>
                                  <td className="px-3 py-4">
                                    <Badge variant="outline" className="capitalize">
                                      {assessment.type}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        {assessment.teacher 
                                          ? `${assessment.teacher.firstName} ${assessment.teacher.lastName}`
                                          : 'Unknown Teacher'
                                        }
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span className={isOverdueAssessment ? 'text-red-600' : ''}>
                                        {formatDate(assessment.date)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <span className="font-medium">{assessment.totalMarks}</span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <AssessmentStatusBadge 
                                      isSubmitted={hasAnswers}
                                      isOverdue={isOverdueAssessment}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function StudentAssessment() {
  return (
    <ErrorBoundary>
      <StudentAssessmentContent />
    </ErrorBoundary>
  );
}