"use client";
import React, { useState } from "react";
import {
  useAssessmentBuilder,
  useAssessmentsByTeacher,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useTeacherCourses,
  Question,
  Assessment
} from './assessment';
import { useSnackbar } from "notistack";
import { useIdentity } from '@/hooks/auth/useIdentity';
import { AssessmentList } from './components/AssessmentList';
import { AssessmentBuilder } from './components/AssessmentBuilder';

export default function AssessmentPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  const [isCreating, setIsCreating] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(
    null
  );

  const {
    assessment,
    questions,
    currentQuestion,
    isEditing,
    editingQuestionIndex,
    totalMarks,
    setAssessment,
    addQuestion,
    updateQuestion,
    editQuestion,
    deleteQuestion,
    moveQuestionUp,
    moveQuestionDown,
    updateCurrentQuestion,
    updateQuestionOption,
    addOption,
    removeOption,
    resetCurrentQuestion,
    validateAssessment,
    loadAssessment,
    resetForm,
  } = useAssessmentBuilder();

  const {
    data: assessmentsData,
    isLoading: assessmentsLoading,
    refetch,
  } = useAssessmentsByTeacher();
  const { data: coursesData, isLoading: coursesLoading } = useTeacherCourses();

  const createMutation = useCreateAssessment({
    onSuccess: async () => {
      enqueueSnackbar("Assessment created successfully!", {
        variant: "success",
      });
      setIsCreating(false);
      resetForm();
      // Ensure refetch is awaited and force refresh
      await refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to create assessment", { variant: "error" });
    },
  });

  const updateMutation = useUpdateAssessment({
    onSuccess: async () => {
      enqueueSnackbar("Assessment updated successfully!", {
        variant: "success",
      });
      setIsCreating(false);
      setEditingAssessment(null);
      resetForm();
      // Ensure refetch is awaited and force refresh
      await refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to update assessment", { variant: "error" });
    },
  });

  const deleteMutation = useDeleteAssessment({
    onSuccess: async () => {
      enqueueSnackbar("Assessment deleted successfully!", {
        variant: "success",
      });
      // Ensure refetch is awaited and force refresh
      await refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to delete assessment", { variant: "error" });
    },
  });



  const assessments = assessmentsData?.data || [];
  const courses = coursesData?.data || [];

  // Since we're now getting assessments with questions included, we can directly use them
  // Group questions by assessmentId for easy access and parse JSON options
  const questionsByAssessment: Record<string, any[]> = {};
  const assessmentsWithUpdatedMarks = assessments.map((assessment: any) => {
    const questions = (assessment.questions || []).map((question: any) => {
      // Parse options if it's a JSON string
      let parsedOptions = question.options;
      if (typeof question.options === 'string') {
        try {
          parsedOptions = JSON.parse(question.options);
        } catch (error) {
          console.warn('Failed to parse question options:', question.options);
          parsedOptions = [];
        }
      }
      
      return {
        ...question,
        options: parsedOptions
      };
    });
    
    // Store processed questions for easy access
    questionsByAssessment[assessment.id] = questions;
    
    // Calculate total marks from questions
    const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
    return {
      ...assessment,
      questions, // Use processed questions
      totalMarks: totalMarks || assessment.totalMarks || 0
    };
  });

  const handleSaveAssessment = async () => {
    const error = validateAssessment();
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    try {
      // Prepare assessment data with questions for the custom backend endpoint
      const assessmentData = {
        title: assessment.title,
        type: assessment.type,
        courseId: assessment.courseId,
        teacherId,
        date: new Date(assessment.date).toISOString(),
        totalMarks: parseFloat(totalMarks.toString()) || 0,
        questions: questions.map((q, index) => ({
          text: q.text,
          type: q.type,
          marks: parseFloat(q.marks.toString()) || 1,
          options: q.type === 'MULTIPLE_CHOICE' && q.options 
            ? q.options.filter(opt => opt.trim() !== '') 
            : null,
          correctAnswer: q.correctAnswer || null,
          order: index,
        })),
      };

      if (editingAssessment) {
        // Update existing assessment using custom PUT endpoint
        await updateMutation.mutateAsync({
          id: editingAssessment.id!,
          data: assessmentData,
        });
      } else {
        // Create new assessment using custom POST endpoint
        await createMutation.mutateAsync({ 
          data: assessmentData 
        });
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      enqueueSnackbar('Failed to save assessment', { variant: 'error' });
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    
    // Get existing questions for this assessment
    const existingQuestions = questionsByAssessment[assessment.id!] || [];
    
    // Load assessment with existing questions
    loadAssessment(assessment, existingQuestions);
    setIsCreating(true);
  };

  const handleDeleteAssessment = async (id: string) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingAssessment(null);
    resetForm();
  };

  if (isCreating) {
    return (
      <AssessmentBuilder
        assessment={assessment}
        questions={questions}
        currentQuestion={currentQuestion}
        isEditing={isEditing}
        editingQuestionIndex={editingQuestionIndex}
        totalMarks={totalMarks}
        courses={courses}
        editingAssessment={editingAssessment}
        isLoading={
          createMutation.isPending || 
          updateMutation.isPending
        }
        setAssessment={setAssessment}
        addQuestion={addQuestion}
        updateQuestion={updateQuestion}
        editQuestion={editQuestion}
        deleteQuestion={deleteQuestion}
        moveQuestionUp={moveQuestionUp}
        moveQuestionDown={moveQuestionDown}
        updateCurrentQuestion={updateCurrentQuestion}
        updateQuestionOption={updateQuestionOption}
        addOption={addOption}
        removeOption={removeOption}
        resetCurrentQuestion={resetCurrentQuestion}
        onSave={handleSaveAssessment}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <AssessmentList
      assessments={assessmentsWithUpdatedMarks}
      questionsByAssessment={questionsByAssessment}
      isLoading={assessmentsLoading}
      onEdit={handleEditAssessment}
      onDelete={handleDeleteAssessment}
      onCreate={() => setIsCreating(true)}
    />
  );
} 
