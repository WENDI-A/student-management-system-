"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { AssessmentCard } from './AssessmentCard';

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

interface AssessmentListProps {
  assessments: Assessment[];
  questionsByAssessment: Record<string, any[]>;
  isLoading: boolean;
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function AssessmentList({
  assessments,
  questionsByAssessment,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
}: AssessmentListProps) {
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading assessments...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assessments and questions
          </p>
        </div>
        <Button onClick={onCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Content */}
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No assessments found</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first assessment to get started
                </p>
              </div>
              <Button onClick={onCreate} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {assessments.map((assessment) => {
            const questions = questionsByAssessment[assessment.id] || [];
            return (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                questionsCount={questions.length}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}