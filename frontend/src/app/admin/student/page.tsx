"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TableHeader } from "@/components/ui/TableHeader";
import { TableRow } from "@/components/ui/TableRow";

function getToday() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function AdminStudent() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [enrollment, setEnrollment] = useState(getToday());
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [students, setStudents] = useState<
    Array<{
      firstName: string;
      lastName: string;
      email: string;
      dob: string;
      enrollment: string;
      grade: string;
    }>
  >([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editStudent, setEditStudent] = useState<null | (typeof students)[0]>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const today = getToday();

  // Calculate pagination
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setOpen(false);
      setStudents((prev) => [
        ...prev,
        { firstName, lastName, email, dob, enrollment, grade },
      ]);
      setTimeout(() => setSuccess(false), 2000);
      setFirstName("");
      setLastName("");
      setEmail("");
      setDob("");
      setEnrollment(today);
      setGrade("");
      // Reset to first page when adding new student
      setCurrentPage(1);
    }, 1200);
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex === null || !editStudent) return;
    setStudents((prev) =>
      prev.map((s, i) => (i === editIndex ? editStudent : s))
    );
    setEditIndex(null);
    setEditStudent(null);
  }

  function handleDelete(idx: number) {
    setStudents((prev) => prev.filter((_, i) => i !== idx));
    // Adjust current page if we're on the last page and it becomes empty
    if (currentStudents.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Students</CardTitle>
          <Button
            onClick={() => setOpen(true)}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
        </CardHeader>

        <CardContent>
          {students.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No students yet.
            </div>
          ) : (
            <div className="overflow-x-auto scroll-smooth rounded-lg">
              <div className="min-w-[900px]">
                {" "}
                {/* 👈 Forces table to be scrollable on smaller screens */}
                <table className="w-full bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
                  <TableHeader
                    headers={[
                      "ID",
                      "First Name",
                      "Last Name",
                      "Email",
                      "Date of Birth",
                      "Enrollment",
                      "Grade",
                      "Actions",
                    ]}
                  />
                  <tbody>
                    {currentStudents.map((s, i) => (
                      <TableRow
                        key={startIndex + i}
                        cells={[
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {startIndex + i + 1}
                          </span>,
                          s.firstName,
                          s.lastName,
                          s.email,
                          s.dob,
                          s.enrollment,
                          s.grade,
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                setEditIndex(startIndex + i);
                                setEditStudent(s);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full sm:w-auto"
                              onClick={() => handleDelete(startIndex + i)}
                            >
                              Delete
                            </Button>
                          </div>,
                        ]}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2 sm:px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, students.length)} of {students.length}{" "}
                    students
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="text-emerald-500 text-center mt-2">
              Student created!
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Enrollment
                </label>
                <Input
                  type="date"
                  value={enrollment}
                  min={today}
                  onChange={(e) => setEnrollment(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grade
              </label>
              <Select value={grade} onValueChange={setGrade} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem
                      key={i + 1}
                      value={(i + 1).toString()}
                    >{`Grade ${i + 1}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={editIndex !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditIndex(null);
            setEditStudent(null);
          }
        }}
      >
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editStudent && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    value={editStudent.firstName}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    value={editStudent.lastName}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={editStudent.email}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={editStudent.dob}
                    onChange={(e) =>
                      setEditStudent({ ...editStudent, dob: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Enrollment
                  </label>
                  <Input
                    type="date"
                    value={editStudent.enrollment}
                    min={today}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        enrollment: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grade
                </label>
                <Select
                  value={editStudent.grade}
                  onValueChange={(v) =>
                    setEditStudent({ ...editStudent, grade: v })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem
                        key={i + 1}
                        value={(i + 1).toString()}
                      >{`Grade ${i + 1}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto"
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
