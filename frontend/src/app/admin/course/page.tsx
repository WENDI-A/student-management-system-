"use client";
import { useCourseAdminState } from './courseadmin';
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

export default function AdminCourse() {
  const state = useCourseAdminState();
  const {
    open,
    setOpen,
    name,
    setName,
    code,
    setCode,
    classId,
    setClassId,
    editId,
    setEditId,
    editCourse,
    setEditCourse,
    currentPage,
    setCurrentPage,
    coursesPerPage,
    courses,
    total,
    totalPages,
    startIndex,
    endIndex,
    createCourse,
    updateCourse,
    deleteCourse,
    goToPage,
    classes,
    classLoading,
    handleSave,
    handleEditSave,
    handleDelete,
  } = state;

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Courses</CardTitle>
          <Button
            onClick={() => {
              setOpen(true);
              setEditId(null);
              setEditCourse(null);
            }}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No courses yet.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <div className="w-full">
                <table className="w-full bg-white dark:bg-background rounded-lg shadow mt-4 text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">No</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Name</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Code</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Class</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {courses.map((c, i) => (
                    <tr
                      key={startIndex + i}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                        {startIndex + i + 1}
                      </td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{c.name}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{c.code}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{classes.find((cl: any) => cl.id === c.classId)?.name || ''}</td>
                        <td className="px-1 sm:px-2 py-1 flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                              setEditId(c.id);
                            setEditCourse(c);
                              setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full sm:w-auto"
                            onClick={() => handleDelete(c.id)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} courses
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
      {/* Create/Edit Course Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editId ? handleEditSave : handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <Input
                value={editId ? editCourse?.name || "" : name}
                onChange={e =>
                  editId
                    ? setEditCourse({ ...editCourse, name: e.target.value })
                    : setName(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code
              </label>
              <Input
                value={editId ? editCourse?.code || "" : code}
                onChange={e =>
                  editId
                    ? setEditCourse({ ...editCourse, code: e.target.value })
                    : setCode(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Class
                </label>
              <Select
                value={editId ? editCourse?.classId || "" : classId}
                onValueChange={value =>
                  editId
                    ? setEditCourse({ ...editCourse, classId: value })
                    : setClassId(value)
                }
                required
              >
                  <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                  {classes.map((cl: any) => (
                    <SelectItem key={cl.id} value={cl.id}>
                      {cl.name}
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
                disabled={createCourse.isPending || updateCourse.isPending}
              >
                {createCourse.isPending || updateCourse.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 