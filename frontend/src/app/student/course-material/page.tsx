"use client";
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, FileText, BookOpen, ChevronDown, ChevronRight, User, CheckCircle } from "lucide-react";
import { useSnackbar } from 'notistack';
import { useCourseMaterials } from './useCourseMaterials';
import { LoadingCard } from '../components/LoadingCard';
import { ErrorCard } from '../components/ErrorCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FILE_SECURITY } from '../constants';

function StudentCourseMaterialContent() {
  const { coursesWithMaterials, isLoading, error, stats } = useCourseMaterials();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set());
  const { enqueueSnackbar } = useSnackbar();

  // Toggle course expansion - optimized to avoid unnecessary re-renders
  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses(prev => {
      if (prev.has(courseId)) {
        const newExpanded = new Set(prev);
        newExpanded.delete(courseId);
        return newExpanded;
      } else {
        return new Set([...prev, courseId]);
      }
    });
  }, []);

  // Handle file download with improved security and error handling
  const handleDownload = async (url: string, title: string, materialId: string) => {
    if (!url) {
      enqueueSnackbar('No file URL available', { variant: 'warning' });
      return;
    }
    
    try {
      // Validate URL format - only allow uploads path for security
      if (!url.startsWith('/uploads/')) {
        throw new Error('Invalid file URL format');
      }

      // Additional security: validate URL doesn't contain path traversal
      if (url.includes('..') || url.includes('//')) {
        throw new Error('Invalid file path detected');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
      // Enhanced filename sanitization with extension preservation
      const fileExtension = url.split('.').pop()?.toLowerCase() || '';
      
      // Whitelist allowed file extensions for security
      if (fileExtension && !FILE_SECURITY.ALLOWED_EXTENSIONS.includes(fileExtension as any)) {
        throw new Error('File type not allowed for download');
      }
      
      const sanitizedTitle = title
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Remove invalid and control characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .trim()
        .substring(0, FILE_SECURITY.MAX_FILENAME_LENGTH); // Limit filename length
      
      const filename = fileExtension ? `${sanitizedTitle}.${fileExtension}` : sanitizedTitle;
      
      // Create download link with security attributes
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}${url}?download=true`;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer nofollow';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up immediately
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      // Mark as downloaded and show success message
      setDownloadedFiles(prev => new Set([...prev, materialId]));
      enqueueSnackbar(`Downloaded: ${title}`, { variant: 'success' });
      
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };





  if (isLoading) {
    return <LoadingCard message="Loading course materials..." />;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  // Get total materials from stats
  const { totalMaterials, totalCourses } = stats;

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Course Materials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access materials from your enrolled courses
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {totalMaterials} Materials Available
        </Badge>
      </div>

      {/* Courses with Materials */}
      <div className="space-y-4">
        {coursesWithMaterials.length === 0 ? (
          <Card className="rounded-2xl shadow">
            <CardContent className="p-8">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses with materials available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Materials will appear here when your teachers upload them.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          coursesWithMaterials.map((course) => (
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
                          <p className="text-sm text-muted-foreground mt-1">
                            Course Code: {course.code}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {course.materials.length} {course.materials.length === 1 ? 'Material' : 'Materials'}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {course.materials.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No materials available for this course yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-900">
                              <th className="px-3 py-3 text-left font-medium">Title</th>
                              <th className="px-3 py-3 text-left font-medium">Teacher</th>
                              <th className="px-3 py-3 text-left font-medium">Downloaded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {course.materials.map((material) => (
                              <tr key={material.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <td className="px-3 py-4">
                                  <div>
                                    <p className="font-medium text-foreground">{material.title}</p>
                                    {material.description && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {material.description.replace(/<[^>]*>/g, '')}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {material.teacher 
                                        ? `${material.teacher.firstName} ${material.teacher.lastName}`
                                        : 'Unknown Teacher'
                                      }
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  {material.url ? (
                                    downloadedFiles.has(material.id) ? (
                                      <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Downloaded</span>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownload(material.url!, material.title, material.id)}
                                        className="flex items-center gap-2"
                                      >
                                        <Download className="h-4 w-4" />
                                        Download
                                      </Button>
                                    )
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No file</span>
                                  )}
                                </td>
                              </tr>
                            ))}
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

      {/* Summary Stats */}
      {totalMaterials > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMaterials}</p>
                  <p className="text-sm text-muted-foreground">Total Materials</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{downloadedFiles.size}</p>
                  <p className="text-sm text-muted-foreground">Downloaded Files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function StudentCourseMaterial() {
  return (
    <ErrorBoundary>
      <StudentCourseMaterialContent />
    </ErrorBoundary>
  );
}