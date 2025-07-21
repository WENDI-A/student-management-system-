"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSnackbar } from "notistack";
import { useAssessmentsByTeacher, useAssessmentById } from "../assessment/assessment";
import dataProvider from "@/hooks/dataProvider";

export default function TeacherGrade() {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch teacher's assessments
  const { data: assessmentsData, isLoading: assessmentsLoading } = useAssessmentsByTeacher(1, 100);
  const assessments = assessmentsData?.data || [];

  // 2. Fetch selected assessment details
  const { data: assessmentDetail } = useAssessmentById(selectedAssessmentId || "");
  const selectedAssessment = assessmentDetail?.data;
  const courseId = selectedAssessment?.courseId;

  // 3. Fetch course to get classId
  const { data: courseDetail } = dataProvider.useGetOneQuery('courses', courseId ? { id: courseId } : { id: "" });
  const classId = courseDetail?.data?.classId;

  // 4. Fetch students for the class
  const studentsQuery = classId
    ? dataProvider.useListQuery("students", { page: 1, perPage: 100, filter: { classId } })
    : { data: { data: [] }, isLoading: false };
  const studentsData = studentsQuery.data;
  const studentsLoading = studentsQuery.isLoading;
  const students = studentsData?.data || [];

  // 5. Handle grade input change
  const handleGradeChange = (studentId: string, value: string) => {
    setGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  // 6. Validate all grades are entered
  const allGradesEntered = useMemo(() => {
    if (!students.length) return false;
    return students.every((s: any) => grades[s.id] && grades[s.id].trim() !== "");
  }, [grades, students]);

  // 7. Submit grades
  const handleSubmit = async () => {
    if (!selectedAssessmentId) {
      enqueueSnackbar("Please select an assessment.", { variant: "error" });
      return;
    }
    if (!allGradesEntered) {
      enqueueSnackbar("Please enter all grades before submitting.", { variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      // Prepare payload: [{ studentId, assessmentId, grade }]
      const payload = students.map((s: any) => ({
        studentId: s.id,
        assessmentId: selectedAssessmentId,
        grade: grades[s.id],
      }));
      // Assume a 'grade' resource exists in dataProvider
      await Promise.all(
        payload.map((entry) =>
          dataProvider.create("grade", { data: entry })
        )
      );
      enqueueSnackbar("Grades submitted successfully!", { variant: "success" });
      setGrades({});
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to submit grades.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Grades</CardTitle>
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
              <SelectValue placeholder="Choose an assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((a: any) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title} ({a.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        {studentsLoading ? (
          <div>Loading students...</div>
        ) : students.length === 0 && selectedAssessmentId ? (
          <div>No students found for this assessment's class.</div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900">
                  <th className="px-3 py-2 text-left">Student Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any) => (
                  <tr key={student.id} className="border-b">
                    <td className="px-3 py-2">{student.firstName} {student.lastName}</td>
                    <td className="px-3 py-2">{student.email}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={selectedAssessment?.totalMarks || 100}
                        value={grades[student.id] || ""}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        className="w-24"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!selectedAssessmentId || !allGradesEntered || submitting}
            className="bg-blue-700 hover:bg-blue-600"
          >
            {submitting ? "Submitting..." : "Submit Grades"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 