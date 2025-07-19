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

export default function AdminTeacher() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teachers, setTeachers] = useState<
    Array<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      grade: string;
    }>
  >([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTeacher, setEditTeacher] = useState<null | (typeof teachers)[0]>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(teachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;
  const currentTeachers = teachers.slice(startIndex, endIndex);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setOpen(false);
      setTeachers((prev) => [
        ...prev,
        { firstName, lastName, phoneNumber, email, grade },
      ]);
      setTimeout(() => setSuccess(false), 2000);
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
      setGrade("");
      // Reset to first page when adding new teacher
      setCurrentPage(1);
    }, 1200);
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex === null || !editTeacher) return;
    setTeachers((prev) =>
      prev.map((s, i) => (i === editIndex ? editTeacher : s))
    );
    setEditIndex(null);
    setEditTeacher(null);
  }
  
  function handleDelete(idx: number) {
    setTeachers((prev) => prev.filter((_, i) => i !== idx));
    // Adjust current page if we're on the last page and it becomes empty
    if (currentTeachers.length === 1 && currentPage > 1) {
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
          <CardTitle className="text-2xl">Teachers</CardTitle>
          <Button
            onClick={() => setOpen(true)}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No teachers yet.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="min-w-[600px] bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      First Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Last Name
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Phone Number
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Email
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
                  {currentTeachers.map((t, i) => (
                    <tr
                      key={startIndex + i}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {t.firstName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {t.lastName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {t.phoneNumber}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {t.email}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {t.grade}
                      </td>
                      <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setEditIndex(startIndex + i);
                            setEditTeacher(t);
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2 sm:px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, teachers.length)} of {teachers.length} teachers
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
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
              Teacher created!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Teacher Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
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
                Phone Number
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
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

      {/* Edit Teacher Dialog */}
      <Dialog
        open={editIndex !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditIndex(null);
            setEditTeacher(null);
          }
        }}
      >
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          {editTeacher && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    value={editTeacher.firstName}
                    onChange={(e) =>
                      setEditTeacher({
                        ...editTeacher,
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
                    value={editTeacher.lastName}
                    onChange={(e) =>
                      setEditTeacher({
                        ...editTeacher,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={editTeacher.phoneNumber}
                  onChange={(e) =>
                    setEditTeacher({ ...editTeacher, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={editTeacher.email}
                  onChange={(e) =>
                    setEditTeacher({ ...editTeacher, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grade
                </label>
                <Select
                  value={editTeacher.grade}
                  onValueChange={(v) =>
                    setEditTeacher({ ...editTeacher, grade: v })
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