"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { QuestionBuilderModal } from './QuestionBuilderModal';
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

interface Question {
  id?: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options?: string[];
  correctAnswer?: string;
  marks: number;
  order?: number;
}

interface Assessment {
  id?: string;
  title: string;
  type: 'EXAM' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'OTHER';
  courseId: string;
  teacherId?: string;
  date: string;
  totalMarks: number;
  questions?: Question[];
}

interface Course {
  id: string;
  name: string;
}

interface AssessmentBuilderProps {
  assessment: Assessment;
  questions: Question[];
  currentQuestion: Question;
  isEditing: boolean;
  editingQuestionIndex: number | null;
  totalMarks: number;
  courses: Course[];
  editingAssessment: Assessment | null;
  isLoading: boolean;
  setAssessment: (assessment: Assessment) => void;
  addQuestion: () => void;
  updateQuestion: (index: number) => void;
  editQuestion: (index: number) => void;
  deleteQuestion: (index: number) => void;
  moveQuestionUp: (index: number) => void;
  moveQuestionDown: (index: number) => void;
  updateCurrentQuestion: (field: string, value: any) => void;
  updateQuestionOption: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  resetCurrentQuestion: () => void;
  onSave: () => void;
  onCancel: () => void;
}

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
      return "bg-green-100 text-green-800 border-green-200";
    case "MULTIPLE_CHOICE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "FILL_BLANK":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "ESSAY":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function AssessmentBuilder({
  assessment,
  questions,
  currentQuestion,
  isEditing,
  editingQuestionIndex,
  totalMarks,
  courses,
  editingAssessment,
  isLoading,
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
  onSave,
  onCancel,
}: AssessmentBuilderProps) {
  const [questionModalOpen, setQuestionModalOpen] = React.useState(false);

  const handleAddQuestion = () => {
    setQuestionModalOpen(true);
  };

  const handleEditQuestion = (index: number) => {
    editQuestion(index);
    setQuestionModalOpen(true);
  };

  const handleQuestionSave = () => {
    if (isEditing && editingQuestionIndex !== null) {
      updateQuestion(editingQuestionIndex);
    } else {
      addQuestion();
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {editingAssessment ? "Edit Assessment" : "Create New Assessment"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {editingAssessment ? "Update your assessment details and questions" : "Build a new assessment with questions"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={assessment.title}
                onChange={(e) =>
                  setAssessment({ ...assessment, title: e.target.value })
                }
                placeholder="Enter assessment title"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={assessment.type}
                onValueChange={(value: any) =>
                  setAssessment({ ...assessment, type: value })
                }
              >
                <SelectTrigger className="w-full">
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
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select
                value={assessment.courseId}
                onValueChange={(value) =>
                  setAssessment({ ...assessment, courseId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses
                    .filter((course) => course.id && course.name)
                    .map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={assessment.date}
                onChange={(e) =>
                  setAssessment({ ...assessment, date: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary" className="text-base px-4 py-2">
              Total Marks: {totalMarks}
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2">
              Questions: {questions.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Section - Only show when no questions exist */}
      {questions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Add Questions to Your Assessment</h3>
                  <p className="text-muted-foreground mt-1">
                    Create different types of questions to build your assessment
                  </p>
                </div>
                <Button onClick={handleAddQuestion} size="lg" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>Questions ({questions.length})</CardTitle>
                {editingAssessment && (
                  <Badge variant="outline" className="text-xs">
                    Editing Mode
                  </Badge>
                )}
              </div>
              <Button onClick={handleAddQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {questions.map((question, index) => (
                <AccordionItem key={index} value={`question-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className={getQuestionTypeColor(question.type)}>
                          {getQuestionTypeIcon(question.type)}
                          <span className="ml-1 hidden sm:inline">
                            {question.type.replace('_', ' ')}
                          </span>
                        </Badge>
                        <span className="font-medium truncate">
                          {question.text.slice(0, 50)}{question.text.length > 50 ? '...' : ''}
                        </span>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {question.marks} marks
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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
                            onClick={() => handleEditQuestion(index)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQuestion(index)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-medium text-foreground">{question.text}</p>
                      {question.type === 'MULTIPLE_CHOICE' && question.options && Array.isArray(question.options) && (
                        <div className="ml-4 space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">Options:</div>
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className={option === question.correctAnswer ? 'font-semibold text-green-600' : ''}>
                                {option}
                              </span>
                              {option === question.correctAnswer && (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-xs text-green-600 font-medium">Correct</span>
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
                            <span className="text-sm font-medium text-muted-foreground">Correct Answer:</span>
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
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading || !assessment.title.trim() || !assessment.courseId || questions.length === 0}
          className="w-full sm:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Assessment"}
        </Button>
      </div>

      {/* Question Builder Modal */}
      <QuestionBuilderModal
        open={questionModalOpen}
        onOpenChange={setQuestionModalOpen}
        currentQuestion={currentQuestion}
        isEditing={isEditing}
        editingQuestionIndex={editingQuestionIndex}
        onSave={handleQuestionSave}
        onCancel={() => {
          resetCurrentQuestion();
          setQuestionModalOpen(false);
        }}
        updateCurrentQuestion={updateCurrentQuestion}
        updateQuestionOption={updateQuestionOption}
        addOption={addOption}
        removeOption={removeOption}
        isLoading={isLoading}
      />
    </div>
  );
}