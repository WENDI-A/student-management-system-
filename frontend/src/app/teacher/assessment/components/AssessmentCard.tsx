"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, FileText, Calendar, BookOpen, HelpCircle } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  type: 'EXAM' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'OTHER';
  courseId: string;
  teacherId?: string;
  date: string;
  totalMarks: number;
  course?: {
    id: string;
    name: string;
  };
}

interface AssessmentCardProps {
  assessment: Assessment;
  questionsCount: number;
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'EXAM':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'QUIZ':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ASSIGNMENT':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PROJECT':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return null;
  }
};

export function AssessmentCard({ assessment, questionsCount, onEdit, onDelete }: AssessmentCardProps) {
  const formattedDate = formatDate(assessment.date);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <CardTitle className="text-lg flex items-start gap-2 leading-tight">
              <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="break-words">{assessment.title}</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getTypeColor(assessment.type)}>
                {assessment.type}
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {assessment.totalMarks || 0} marks
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(assessment)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(assessment.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Course Info */}
          {assessment.course?.name && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-muted-foreground">Course:</span>
              <span className="text-foreground truncate">{assessment.course.name}</span>
            </div>
          )}
          
          {/* Date Info */}
          {formattedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-muted-foreground">Date:</span>
              <span className="text-foreground">{formattedDate}</span>
            </div>
          )}
          
          {/* Questions Count */}
          <div className="flex items-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-muted-foreground">Questions:</span>
            <span className="text-foreground">{questionsCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}