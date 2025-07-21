"use client";
import { useAttendanceAdminState } from './attendance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Save, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttendanceAdmin() {
  const {
    selectedCourse,
    setSelectedCourse,
    selectedDate,
    setSelectedDate,
    studentAttendance,
    updateStudentAttendance,
    isSaving,
    saveAttendance,
    students,
    studentsLoading,
    courses,
    coursesLoading,
  } = useAttendanceAdminState();

  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find((c: any) => c.id === courseId);
    return course ? course.name : 'Select Course';
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl">Student Attendance</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </CardHeader>
        
        <CardContent>
          {!selectedCourse ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Select a Course
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a course to start marking attendance
              </p>
            </div>
          ) : studentsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Students Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No students are enrolled in the selected course
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      {getCourseName(selectedCourse)}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {formatDate(selectedDate)} • {students.length} students
                    </p>
                  </div>
                  <Button
                    onClick={saveAttendance}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Attendance"}
                  </Button>
                </div>
              </div>

              {/* Students List */}
              <div className="grid gap-3">
                {students.map((student: any, index: number) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStudentAttendance(student.id, status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            studentAttendance[student.id] === status
                              ? getStatusColor(status)
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Status Legend</h4>
                <div className="flex flex-wrap gap-3">
                  {[
                    { status: 'PRESENT', label: 'Present' },
                    { status: 'LATE', label: 'Late' },
                    { status: 'ABSENT', label: 'Absent' },
                    { status: 'EXCUSED', label: 'Excused' }
                  ].map(({ status, label }) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
    </Card>
    </div>
  );
} 