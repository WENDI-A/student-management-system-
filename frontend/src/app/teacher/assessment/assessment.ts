"use client";
import dataProvider from '@/hooks/dataProvider';
import { useState, useEffect } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';

export interface Question {
  id?: string;
  text: string;
  type: 'TRUE_FALSE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY';
  marks: number;
  options?: string[];
  correctAnswer?: string;
  order: number;
}

export interface Assessment {
  id?: string;
  title: string;
  type: 'EXAM' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'OTHER';
  courseId: string;
  teacherId?: string;
  date: string;
  totalMarks: number;
  questions?: Question[];
}

// Get assessments by teacher
export function useAssessmentsByTeacher(page = 1, perPage = 10) {
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  
  return dataProvider.useListQuery('assessments', {
    page,
    perPage,
    filter: teacherId ? { teacherId } : {},
    include: JSON.stringify({ course: true, questions: true }),
  });
}

// Get assessment by ID with questions
export function useAssessmentById(id: string) {
  return dataProvider.useGetOneQuery('assessments', { id });
}

// Create assessment
export function useCreateAssessment(options: any) {
  return dataProvider.useCreateMutation('assessments', options);
}

// Update assessment
export function useUpdateAssessment(options: any) {
  return dataProvider.useUpdateMutation('assessments', options);
}

// Delete assessment
export function useDeleteAssessment(options: any) {
  return dataProvider.useDeleteMutation('assessments', options);
}

// Create question
export function useCreateQuestion(options: any) {
  return dataProvider.useCreateMutation('questions', options);
}

// Update question
export function useUpdateQuestion(options: any) {
  return dataProvider.useUpdateMutation('questions', options);
}

// Delete question
export function useDeleteQuestion(options: any) {
  return dataProvider.useDeleteMutation('questions', options);
}

// Get questions by assessment ID
export function useQuestionsByAssessmentId(assessmentId: string) {
  return dataProvider.useListQuery('questions', {
    page: 1,
    perPage: 100,
    filter: { assessmentId },
  });
}

// Get all questions for a list of assessment IDs
export function useAllQuestionsForTeacherAssessments(assessmentIds: string[]) {
  return dataProvider.useListQuery('questions', {
    page: 1,
    perPage: 1000,
    filter: assessmentIds && assessmentIds.length > 0 ? { assessmentId: { in: assessmentIds } } : {},
  });
}

// Get teacher's courses
export function useTeacherCourses() {
  const { data: identity } = useIdentity();
  const teacherId = typeof identity === 'object' && identity !== null && 'id' in identity ? (identity as any).id : undefined;
  
  return dataProvider.useListQuery('courses', {
    page: 1,
    perPage: 100,
    filter: teacherId ? { 
      courseTeachers: { 
        some: { teacherId } 
      } 
    } : {},
  });
}

// Assessment builder state management
export function useAssessmentBuilder() {
  const [assessment, setAssessment] = useState<Assessment>({
    title: '',
    type: 'QUIZ',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    totalMarks: 0,
    questions: []
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: '',
    type: 'MULTIPLE_CHOICE',
    marks: 1,
    options: ['', '', '', ''],
    correctAnswer: '',
    order: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Calculate total marks
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  // Update assessment total marks when questions change
  useEffect(() => {
    setAssessment(prev => ({
      ...prev,
      totalMarks
    }));
  }, [totalMarks]);

  // Add new question
  const addQuestion = () => {
    const newQuestion: Question = {
      ...currentQuestion,
      order: questions.length,
      id: undefined
    };
    
    setQuestions([...questions, newQuestion]);
    resetCurrentQuestion();
  };

  // Update existing question
  const updateQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...currentQuestion,
      order: index
    };
    setQuestions(updatedQuestions);
    setIsEditing(false);
    setEditingQuestionIndex(null);
    resetCurrentQuestion();
  };

  // Edit question
  const editQuestion = (index: number) => {
    const question = questions[index];
    setCurrentQuestion({
      ...question,
      options: question.options || ['', '', '', '']
    });
    setIsEditing(true);
    setEditingQuestionIndex(index);
  };

  // Delete question
  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Reorder questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      order: i
    }));
    setQuestions(reorderedQuestions);
  };

  // Move question up
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[index - 1]] = [updatedQuestions[index - 1], updatedQuestions[index]];
    // Update order
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });
    setQuestions(updatedQuestions);
  };

  // Move question down
  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[index + 1]] = [updatedQuestions[index + 1], updatedQuestions[index]];
    // Update order
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });
    setQuestions(updatedQuestions);
  };

  // Reset current question form
  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      text: '',
      type: 'MULTIPLE_CHOICE',
      marks: 1,
      options: ['', '', '', ''],
      correctAnswer: '',
      order: 0
    });
  };

  // Update current question field
  const updateCurrentQuestion = (field: keyof Question, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update question options for multiple choice
  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ['', '', '', ''])];
    newOptions[index] = value;
    
    // Clear correct answer if it's no longer valid
    let newCorrectAnswer = currentQuestion.correctAnswer;
    if (newCorrectAnswer && !newOptions.includes(newCorrectAnswer)) {
      newCorrectAnswer = '';
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    }));
  };

  // Add option to multiple choice
  const addOption = () => {
    const newOptions = [...(currentQuestion.options || []), ''];
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Remove option from multiple choice
  const removeOption = (index: number) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index) || [];
    
    // Clear correct answer if the removed option was the correct answer
    let newCorrectAnswer = currentQuestion.correctAnswer;
    if (currentQuestion.correctAnswer === currentQuestion.options?.[index]) {
      newCorrectAnswer = '';
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    }));
  };

  // Validate assessment
  const validateAssessment = () => {
    if (!assessment.title.trim()) return 'Assessment title is required';
    if (!assessment.courseId) return 'Please select a course';
    if (!assessment.date) return 'Please select a date';
    if (questions.length === 0) return 'At least one question is required';
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} text is required`;
      if (q.marks <= 0) return `Question ${i + 1} marks must be greater than 0`;
      
      if (q.type === 'MULTIPLE_CHOICE') {
        if (!q.options || q.options.length < 2) return `Question ${i + 1} must have at least 2 options`;
        if (!q.correctAnswer) return `Question ${i + 1} must have a correct answer`;
      }
      
      if (q.type === 'TRUE_FALSE' && !q.correctAnswer) {
        return `Question ${i + 1} must have a correct answer`;
      }
      
      if (q.type === 'FILL_BLANK' && !q.correctAnswer) {
        return `Question ${i + 1} must have a correct answer`;
      }
    }
    
    return null; // No errors
  };

  // Load assessment for editing
  const loadAssessment = (assessmentData: Assessment) => {
    setAssessment(assessmentData);
    setQuestions(assessmentData.questions || []);
  };

  // Reset form
  const resetForm = () => {
    setAssessment({
      title: '',
      type: 'QUIZ',
      courseId: '',
      date: new Date().toISOString().split('T')[0],
      totalMarks: 0,
      questions: []
    });
    setQuestions([]);
    resetCurrentQuestion();
    setIsEditing(false);
    setEditingQuestionIndex(null);
  };

  return {
    // State
    assessment,
    questions,
    currentQuestion,
    isEditing,
    editingQuestionIndex,
    totalMarks,
    
    // Actions
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
    resetForm
  };
} 