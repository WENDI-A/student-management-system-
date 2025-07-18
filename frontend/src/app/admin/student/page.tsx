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
  const today = getToday();

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
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Students</CardTitle>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto"
          >
            Create Student
          </Button>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No students yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      First Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Last Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Date of Birth
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Enrollment
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Grade
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {s.firstName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {s.lastName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {s.email}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {s.dob}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {s.enrollment}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {s.grade}
                      </td>
                      <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setEditIndex(i);
                            setEditStudent(s);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full sm:w-auto"
                          onClick={() => handleDelete(i)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
