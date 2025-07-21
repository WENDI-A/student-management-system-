"use client";
import { useTeacherAdminState } from './adminteacher';
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
  const state = useTeacherAdminState();

  // Destructure and use state just like in the student admin page
  const {
    open,
    setOpen,
        firstName,
    setFirstName,
        lastName,
    setLastName,
        email,
    setEmail,
    selectedCourse,
    setSelectedCourse,
    editId,
    setEditId,
    editTeacher,
    setEditTeacher,
    currentPage,
    setCurrentPage,
    teachersPerPage,
    teachers,
    total,
    totalPages,
    startIndex,
    endIndex,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    goToPage,
  } = state;

  const courses = state.courses;

  function handleDelete(id: string) {
    deleteTeacher.mutate({ id });
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Teachers</CardTitle>
          <Button
            onClick={() => {
              setOpen(true);
              setEditId(null);
              setEditTeacher(null);
            }}
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
              <div className="w-full">
                <table className="w-full bg-white dark:bg-background rounded-lg shadow mt-4 text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">No</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">First Name</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Last Name</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Email</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, i) => (
                    <tr
                      key={startIndex + i}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                        {startIndex + i + 1}
                      </td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{t.firstName}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{t.lastName}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{t.email}</td>
                        <td className="px-1 sm:px-2 py-1 flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setEditId(t.id);
                            setEditTeacher(t);
                              setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full sm:w-auto"
                          onClick={() => handleDelete(t.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2 sm:px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} teachers
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
        </CardContent>
      </Card>

      {/* Create Teacher Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editId ? state.handleEditSave : state.handleSave} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <Input
                  value={editId ? editTeacher?.firstName || "" : firstName}
                  onChange={e =>
                    editId
                      ? setEditTeacher({ ...editTeacher, firstName: e.target.value })
                      : setFirstName(e.target.value)
                  }
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <Input
                  value={editId ? editTeacher?.lastName || "" : lastName}
                  onChange={e =>
                    editId
                      ? setEditTeacher({ ...editTeacher, lastName: e.target.value })
                      : setLastName(e.target.value)
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
                value={editId ? editTeacher?.email || "" : email}
                onChange={e =>
                  editId
                    ? setEditTeacher({ ...editTeacher, email: e.target.value })
                    : setEmail(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Courses
              </label>
              <Select
                value={editId ? (editTeacher?.courses?.[0]?.id || "") : selectedCourse}
                onValueChange={value =>
                  editId
                    ? setEditTeacher({
                        ...editTeacher,
                        courses: [{ id: value }],
                      })
                    : setSelectedCourse(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {state.courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
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
                disabled={createTeacher.isPending || updateTeacher.isPending}
              >
                {createTeacher.isPending || updateTeacher.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 