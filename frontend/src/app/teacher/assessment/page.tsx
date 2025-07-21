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
  Assessment,
  useQuestionsByAssessmentId,
  useAllQuestionsForTeacherAssessments
} from './assessment';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSnackbar } from "notistack";
import {
  Plus,
  Edit,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Type,
  Hash
} from 'lucide-react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

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
    onSuccess: () => {
      enqueueSnackbar("Assessment created successfully!", {
        variant: "success",
      });
      setIsCreating(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to create assessment", { variant: "error" });
    },
  });

  const updateMutation = useUpdateAssessment({
    onSuccess: () => {
      enqueueSnackbar("Assessment updated successfully!", {
        variant: "success",
      });
      setIsCreating(false);
      setEditingAssessment(null);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to update assessment", { variant: "error" });
    },
  });

  const deleteMutation = useDeleteAssessment({
    onSuccess: () => {
      enqueueSnackbar("Assessment deleted successfully!", {
        variant: "success",
      });
      refetch();
    },
    onError: (error: any) => {
      enqueueSnackbar("Failed to delete assessment", { variant: "error" });
    },
  });

  const assessments = assessmentsData?.data || [];
  const courses = coursesData?.data || [];

  // Fetch all questions for all assessments at once (TOP LEVEL, not inside map)
  const assessmentIds = assessments.map((a: any) => a.id);
  const { data: allQuestionsData, isLoading: allQuestionsLoading } = useAllQuestionsForTeacherAssessments(assessmentIds);
  const allQuestions = allQuestionsData?.data || [];
  // Group questions by assessmentId
  const questionsByAssessment: Record<string, any[]> = {};
  allQuestions.forEach((q: any) => {
    if (!questionsByAssessment[q.assessmentId]) questionsByAssessment[q.assessmentId] = [];
    questionsByAssessment[q.assessmentId].push(q);
  });

  const handleSaveAssessment = async () => {
    const error = validateAssessment();
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    const assessmentData = {
      ...assessment,
      teacherId,
      questions: questions.map((q, index) => ({
        ...q,
        order: index,
      })),
    };

    if (editingAssessment) {
      await updateMutation.mutateAsync({
        id: editingAssessment.id!,
        data: assessmentData,
      });
    } else {
      await createMutation.mutateAsync({ data: assessmentData });
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    loadAssessment(assessment);
    setIsCreating(true);
  };

  const handleDeleteAssessment = async (id: string) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "TRUE_FALSE":
        return <CheckCircle className="w-4 h-4" />;
      case "MULTIPLE_CHOICE":
        return <AlertCircle className="w-4 h-4" />;
      case "FILL_BLANK":
        return <Hash className="w-4 h-4" />;
      case "ESSAY":
        return <FileText className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "TRUE_FALSE":
        return "bg-green-100 text-green-800";
      case "MULTIPLE_CHOICE":
        return "bg-blue-100 text-blue-800";
      case "FILL_BLANK":
        return "bg-yellow-100 text-yellow-800";
      case "ESSAY":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isCreating) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {editingAssessment ? "Edit Assessment" : "Create New Assessment"}
          </h1>
          <Button
            variant="outline"
            onClick={() => {
              setIsCreating(false);
              setEditingAssessment(null);
              resetForm();
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Assessment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={assessment.title}
                  onChange={(e) =>
                    setAssessment({ ...assessment, title: e.target.value })
                  }
                  placeholder="Enter assessment title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={assessment.type}
                  onValueChange={(value: any) =>
                    setAssessment({ ...assessment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Select
                  value={assessment.courseId}
                  onValueChange={(value) =>
                    setAssessment({ ...assessment, courseId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter((course: any) => course.id && course.name)
                      .map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={assessment.date}
                  onChange={(e) =>
                    setAssessment({ ...assessment, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Total Marks: {totalMarks}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Question Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Question Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value: any) =>
                    updateCurrentQuestion("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="FILL_BLANK">
                      Fill in the Blank
                    </SelectItem>
                    <SelectItem value="ESSAY">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  value={currentQuestion.marks}
                  onChange={(e) =>
                    updateCurrentQuestion(
                      "marks",
                      parseFloat(e.target.value) || 1
                    )
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={
                    isEditing
                      ? () => updateQuestion(editingQuestionIndex!)
                      : addQuestion
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditing ? "Update Question" : "Add Question"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                value={currentQuestion.text}
                onChange={(e) => updateCurrentQuestion("text", e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>

            {/* Question Type Specific Fields */}
            {currentQuestion.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-3">
                <Label>Options</Label>
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateQuestionOption(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={currentQuestion.options!.length <= 2}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addOption}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
                {currentQuestion.options &&
                  currentQuestion.options.filter(
                    (option) => option.trim() !== ""
                  ).length >= 2 && (
                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Select
                        value={currentQuestion.correctAnswer}
                        onValueChange={(value) =>
                          updateCurrentQuestion("correctAnswer", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentQuestion.options
                            ?.filter((option) => option.trim() !== "")
                            .map((option, index) => (
                              <SelectItem key={index} value={option}>
                                <div className="flex items-center space-x-2">
                                  <span>{option}</span>
                                  {option === currentQuestion.correctAnswer && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {currentQuestion.correctAnswer && (
                        <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Correct answer selected:{" "}
                            <strong>{currentQuestion.correctAnswer}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                {currentQuestion.options &&
                  currentQuestion.options.filter(
                    (option) => option.trim() !== ""
                  ).length < 2 && (
                    <p className="text-sm text-amber-600">
                      Add at least 2 options to select a correct answer
                    </p>
                  )}
              </div>
            )}

            {currentQuestion.type === "TRUE_FALSE" && (
              <div>
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <Select
                  value={currentQuestion.correctAnswer}
                  onValueChange={(value) =>
                    updateCurrentQuestion("correctAnswer", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                {currentQuestion.correctAnswer && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Correct answer selected:{" "}
                      <strong>{currentQuestion.correctAnswer}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {(currentQuestion.type === "FILL_BLANK" ||
              currentQuestion.type === "ESSAY") && (
              <div>
                <Label htmlFor="correctAnswer">
                  {currentQuestion.type === "FILL_BLANK"
                    ? "Correct Answer"
                    : "Sample Answer (Optional)"}
                </Label>
                <Textarea
                  id="correctAnswer"
                  value={currentQuestion.correctAnswer || ""}
                  onChange={(e) =>
                    updateCurrentQuestion("correctAnswer", e.target.value)
                  }
                  placeholder={
                    currentQuestion.type === "FILL_BLANK"
                      ? "Enter the correct answer"
                      : "Enter a sample answer for reference"
                  }
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions List */}
        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {questions.map((question, index) => (
                  <AccordionItem key={index} value={`question-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center space-x-2">
                        <Badge className={getQuestionTypeColor(question.type)}>
                          {getQuestionTypeIcon(question.type)}
                          <span className="ml-1">{question.type.replace('_', ' ')}</span>
                        </Badge>
                        <span className="font-medium">{question.text.slice(0, 40)}{question.text.length > 40 ? '...' : ''}</span>
                        <Badge variant="outline">{question.marks} marks</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getQuestionTypeColor(question.type)}>
                              {getQuestionTypeIcon(question.type)}
                              <span className="ml-1">{question.type.replace('_', ' ')}</span>
                            </Badge>
                            <Badge variant="outline">{question.marks} marks</Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveQuestionUp(index)}
                              disabled={index === 0}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveQuestionDown(index)}
                              disabled={index === questions.length - 1}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editQuestion(index)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteQuestion(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-medium">{question.text}</p>
                        {question.type === 'MULTIPLE_CHOICE' && question.options && (
                          <div className="ml-4 space-y-1">
                            <div className="text-sm font-medium text-gray-700 mb-2">Options:</div>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <span className="w-4 h-4 rounded-full border flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className={option === question.correctAnswer ? 'font-semibold text-green-600' : ''}>
                                  {option}
                                </span>
                                {option === question.correctAnswer && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">Correct Answer</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {(question.type === 'TRUE_FALSE' || question.type === 'FILL_BLANK') && question.correctAnswer && (
                          <div className="ml-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                              <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                {question.correctAnswer}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreating(false);
              setEditingAssessment(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAssessment}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : "Save Assessment"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {assessmentsLoading ? (
        <div className="text-center py-8">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              No assessments found. Create your first assessment!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment: any) => {
            const questions = questionsByAssessment[assessment.id] || [];
            return (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow border-2 border-gray-100">
      <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span>{assessment.title}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{assessment.type}</Badge>
                        <Badge variant="secondary">{assessment.totalMarks || 0} marks</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAssessment(assessment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAssessment(assessment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
      </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Course:</span>
                      <span>{assessment.course?.name || <span className="text-red-500">N/A</span>}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Date:</span>
                      <span>{assessment.date ? new Date(assessment.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Questions:</span>
                      <span>{questions.length}</span>
                    </div>
                  </div>
                </CardContent>
    </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
