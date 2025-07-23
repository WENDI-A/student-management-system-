"use client";
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Save,
  X,
  CheckCircle,
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

interface QuestionBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: Question;
  isEditing: boolean;
  editingQuestionIndex: number | null;
  onSave: () => void;
  onCancel: () => void;
  updateCurrentQuestion: (field: string, value: any) => void;
  updateQuestionOption: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  isLoading?: boolean;
}

export function QuestionBuilderModal({
  open,
  onOpenChange,
  currentQuestion,
  isEditing,
  editingQuestionIndex,
  onSave,
  onCancel,
  updateCurrentQuestion,
  updateQuestionOption,
  addOption,
  removeOption,
  isLoading = false,
}: QuestionBuilderModalProps) {
  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const isFormValid = () => {
    if (!currentQuestion.text.trim()) return false;
    if (currentQuestion.marks <= 0) return false;

    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      const validOptions = currentQuestion.options?.filter(opt => opt.trim() !== '') || [];
      if (validOptions.length < 2) return false;
      if (!currentQuestion.correctAnswer) return false;
    }

    if (currentQuestion.type === 'TRUE_FALSE' && !currentQuestion.correctAnswer) {
      return false;
    }

    if (currentQuestion.type === 'FILL_BLANK' && !currentQuestion.correctAnswer?.trim()) {
      return false;
    }

    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Question ${(editingQuestionIndex || 0) + 1}` : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Type and Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type *</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value: any) =>
                  updateCurrentQuestion("type", value)
                }
              >
                <SelectTrigger className="w-full">
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
            <div className="space-y-2">
              <Label htmlFor="marks">Marks *</Label>
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
                className="w-full"
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              value={currentQuestion.text}
              onChange={(e) => updateCurrentQuestion("text", e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Question Type Specific Fields */}
          {currentQuestion.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-4">
              <Label>Options *</Label>
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateQuestionOption(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={currentQuestion.options!.length <= 2}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addOption}
                className="w-full sm:w-auto"
                disabled={currentQuestion.options && currentQuestion.options.length >= 6}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>

              {currentQuestion.options &&
                currentQuestion.options.filter(
                  (option) => option.trim() !== ""
                ).length >= 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="correctAnswer">Correct Answer *</Label>
                    <Select
                      value={currentQuestion.correctAnswer}
                      onValueChange={(value) =>
                        updateCurrentQuestion("correctAnswer", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentQuestion.options
                          ?.filter((option) => option.trim() !== "")
                          .map((option, index) => (
                            <SelectItem key={index} value={option}>
                              <div className="flex items-center space-x-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + currentQuestion.options!.indexOf(option))}
                                </span>
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
                      <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

              {currentQuestion.options &&
                currentQuestion.options.filter(
                  (option) => option.trim() !== ""
                ).length < 2 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    Add at least 2 options to select a correct answer
                  </div>
                )}
            </div>
          )}

          {currentQuestion.type === "TRUE_FALSE" && (
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Correct Answer *</Label>
              <Select
                value={currentQuestion.correctAnswer}
                onValueChange={(value) =>
                  updateCurrentQuestion("correctAnswer", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
              {currentQuestion.correctAnswer && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {(currentQuestion.type === "FILL_BLANK" ||
            currentQuestion.type === "ESSAY") && (
              <div className="space-y-2">
                <Label htmlFor="correctAnswer">
                  {currentQuestion.type === "FILL_BLANK"
                    ? "Correct Answer *"
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
                  rows={3}
                  className="w-full resize-none"
                />
              </div>
            )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || isLoading}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : (isEditing ? "Update Question" : "Add Question")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}