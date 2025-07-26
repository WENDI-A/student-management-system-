"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, Users } from "lucide-react";
import { useSnackbar } from "notistack";
import { useGradeManagement } from "./grade";

export default function TeacherGrade() {
  const { enqueueSnackbar } = useSnackbar();

  const {
    selectedAssessmentId,
    setSelectedAssessmentId,
    grades,
    isSubmitting,
    assessments,
    assessmentsLoading,
    students,
    studentsLoading,
    selectedAssessment,
    existingGrades,
    updateGrade,
    submitGrades,
    resetForm
  } = useGradeManagement();

  // Initialize grades with existing values when students data is available
  useMemo(() => {
    if (selectedAssessmentId && students.length > 0 && !studentsLoading) {
      const currentGradeKeys = Object.keys(grades);
      const studentIds = students.map((s: any) => s.id);

      // Check if grades need to be initialized
      if (currentGradeKeys.length === 0 || !studentIds.every(id => currentGradeKeys.includes(id))) {
        const gradeMap: Record<string, string> = {};
        students.forEach((student: any) => {
          gradeMap[student.id] = student.gradeValue !== null ? student.gradeValue.toString() : "";
        });

        // Only update if different from current grades
        const isDifferent = Object.keys(gradeMap).some(key => grades[key] !== gradeMap[key]) ||
          Object.keys(grades).length !== Object.keys(gradeMap).length;

        if (isDifferent) {
          console.log('Initializing grades from component:', gradeMap);
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            Object.keys(gradeMap).forEach(studentId => {
              if (grades[studentId] !== gradeMap[studentId]) {
                updateGrade(studentId, gradeMap[studentId]);
              }
            });
          }, 0);
        }
      }
    }
  }, [selectedAssessmentId, students, studentsLoading, grades, updateGrade]);

  // Check if all grades are entered
  const allGradesEntered = useMemo(() => {
    if (!students.length) return false;
    return students.every((s: any) => {
      const grade = grades[s.id];
      return grade && grade.trim() !== "" && !isNaN(parseFloat(grade));
    });
  }, [grades, students]);

  // Check if grades are valid (within range)
  const allGradesValid = useMemo(() => {
    if (!students.length || !selectedAssessment) return true;
    return students.every((s: any) => {
      const grade = grades[s.id];
      if (!grade || grade.trim() === "") return true; // Allow empty for now
      const numGrade = parseFloat(grade);
      return !isNaN(numGrade) && numGrade >= 0 && numGrade <= selectedAssessment.totalMarks;
    });
  }, [grades, students, selectedAssessment]);

  // Handle grade submission
  const handleSubmit = async () => {
    if (!selectedAssessmentId) {
      enqueueSnackbar("Please select an assessment.", { variant: "error" });
      return;
    }
    if (!allGradesEntered) {
      enqueueSnackbar("Please enter all grades before submitting.", { variant: "error" });
      return;
    }
    if (!allGradesValid) {
      enqueueSnackbar("Please enter valid grades within the assessment's total marks.", { variant: "error" });
      return;
    }

    try {
      const result = await submitGrades();
      enqueueSnackbar(result.message, { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to submit grades.", { variant: "error" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Grade Management
          </h1>
          <p className="text-muted-foreground mt-1">Assign and manage student grades for assessments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assign Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Assessment Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Select Assessment</label>
            <Select
              value={selectedAssessmentId}
              onValueChange={setSelectedAssessmentId}
              disabled={assessmentsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={assessmentsLoading ? "Loading assessments..." : "Choose an assessment"} />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{a.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {a.type} • {a.course?.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assessment Info */}
          {selectedAssessment && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Assessment:</span> {selectedAssessment.title}
                </div>
                <div>
                  <span className="font-medium">Course:</span> {selectedAssessment.course?.name}
                </div>
                <div>
                  <span className="font-medium">Total Marks:</span> {selectedAssessment.totalMarks}
                </div>
              </div>
            </div>
          )}

          {/* Students Table */}
          {studentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Loading students...</span>
            </div>
          ) : students.length === 0 && selectedAssessmentId ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No students found for this assessment's class.</p>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Student Grades ({students.length} students)</h3>
                {existingGrades.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {existingGrades.length} grades already recorded
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">Student Name</th>
                      <th className="px-4 py-3 text-left font-medium">Student Code</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Grade (Max: {selectedAssessment?.totalMarks || 100})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student: any, index: number) => {
                      const grade = grades[student.id] || "";
                      const numGrade = parseFloat(grade);
                      const isInvalid = grade && (isNaN(numGrade) || numGrade < 0 || numGrade > (selectedAssessment?.totalMarks || 100));

                      return (
                        <tr key={student.id} className="border-b hover:bg-muted/25">
                          <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{student.code}</td>
                          <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0}
                              max={selectedAssessment?.totalMarks || 100}
                              step="0.5"
                              value={grade}
                              onChange={(e) => updateGrade(student.id, e.target.value)}
                              className={`w-32 ${isInvalid ? 'border-red-500' : ''}`}
                              placeholder="0"
                            />
                            {isInvalid && (
                              <span className="text-xs text-red-500 mt-1 block">
                                Invalid grade (0-{selectedAssessment?.totalMarks})
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Submit Button */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {students.length > 0 && (
                <span>
                  {Object.values(grades).filter(g => g && g.trim() !== "").length} of {students.length} grades entered
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {selectedAssessmentId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAssessmentId("");
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!selectedAssessmentId || !allGradesEntered || !allGradesValid || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Grades"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 