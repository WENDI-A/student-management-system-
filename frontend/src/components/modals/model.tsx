"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";

export interface CourseMaterialFormData {
  title: string;
  description: string;
  file: File | null;
  courseId: string;
}

export interface CourseMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: CourseMaterialFormData;
  onFormDataChange: (field: keyof CourseMaterialFormData, value: any) => void;
  courses: Array<{ id: string; name: string }>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  errors?: {
    title?: string;
    description?: string;
    file?: string;
    courseId?: string;
  };
  isEdit?: boolean;
  editMaterial?: any;
  // Customization props for reusability
  maxWidth?: string;
  showDescription?: boolean;
  showFile?: boolean;
  showCourse?: boolean;
  fileAccept?: string;
  fileLabel?: string;
  titleLabel?: string;
  descriptionLabel?: string;
  courseLabel?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function CourseMaterialModal({
  open,
  onOpenChange,
  title,
  formData,
  onFormDataChange,
  courses,
  onSubmit,
  isLoading = false,
  errors = {},
  isEdit = false,
  editMaterial = null,
  // Customization props with defaults
  maxWidth = "max-w-lg",
  showDescription = true,
  showFile = true,
  showCourse = true,
  fileAccept = ".pdf,.ppt,.pptx,.doc,.docx",
  fileLabel = "File (PDF, PPT, DOC, etc.)",
  titleLabel = "Title",
  descriptionLabel = "Description",
  courseLabel = "Course",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: CourseMaterialModalProps) {
  const getValue = (field: keyof CourseMaterialFormData) => {
    if (isEdit && editMaterial) {
      return editMaterial[field] || "";
    }
    return formData[field] || "";
  };

  const handleInputChange = (field: keyof CourseMaterialFormData, value: any) => {
    if (isEdit && editMaterial) {
      // For edit mode, we need to update the editMaterial object
      onFormDataChange(field, { ...editMaterial, [field]: value });
    } else {
      onFormDataChange(field, value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} w-[95vw] sm:w-full mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader className="flex-shrink-0 space-y-2 pb-4 border-b">
          <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                {titleLabel} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={getValue("title")}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`h-10 sm:h-11 text-sm sm:text-base ${
                  errors?.title ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                placeholder={`Enter ${titleLabel.toLowerCase()}`}
                required
                disabled={isLoading}
              />
              {errors?.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-destructive rounded-full"></span>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description Field */}
            {showDescription && (
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  {descriptionLabel}
                </Label>
                <Textarea
                  id="description"
                  value={getValue("description")}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none ${
                    errors?.description ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  placeholder={`Enter ${descriptionLabel.toLowerCase()} (optional)`}
                  disabled={isLoading}
                />
                {errors?.description && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.description}
                  </p>
                )}
              </div>
            )}

            {/* File Upload Field */}
            {showFile && (
              <div className="space-y-2">
                <Label htmlFor="file" className="text-sm font-medium text-foreground">
                  {fileLabel}
                </Label>
                <div className="relative">
                  <input
                    id="file"
                    type="file"
                    accept={fileAccept}
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleInputChange("file", file);
                    }}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="file"
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      errors?.file 
                        ? "border-destructive bg-destructive/5 hover:bg-destructive/10" 
                        : "border-muted-foreground/25 bg-muted/20 hover:bg-muted/30"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {fileAccept.replace(/\./g, '').toUpperCase()}
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* Selected file display */}
                {getValue("file") && (
                  <div className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {getValue("file")?.name || "File selected"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={() => handleInputChange("file", null)}
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {errors?.file && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.file}
                  </p>
                )}
              </div>
            )}

            {/* Course Selection */}
            {showCourse && (
              <div className="space-y-2">
                <Label htmlFor="course" className="text-sm font-medium text-foreground">
                  {courseLabel} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={getValue("courseId")}
                  onValueChange={(value) => handleInputChange("courseId", value)}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    id="course"
                    className={`h-10 sm:h-11 text-sm sm:text-base ${
                      errors?.courseId ? "border-destructive focus:ring-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder={`Select a ${courseLabel.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {courses.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No courses available
                      </div>
                    ) : (
                      courses.map((course) => (
                        <SelectItem 
                          key={course.id} 
                          value={course.id} 
                          className="text-sm sm:text-base"
                        >
                          {course.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors?.courseId && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.courseId}
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={onSubmit}
            className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
