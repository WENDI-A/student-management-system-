"use client";
import { useCourseMaterialAdminState } from './coursematerial';
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CourseMaterialAdmin() {
  const state = useCourseMaterialAdminState();
  const {
    open,
    setOpen,
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    courseId,
    setCourseId,
    editId,
    setEditId,
    editMaterial,
    setEditMaterial,
    currentPage,
    setCurrentPage,
    materialsPerPage,
    materials,
    total,
    totalPages,
    startIndex,
    endIndex,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    goToPage,
    courses,
    courseLoading,
  } = state;

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createMaterial.mutate({
      data: {
        title,
        description,
        file,
        courseId,
      },
    });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editMaterial) return;
    updateMaterial.mutate({
      id: editId,
      data: {
        title: editMaterial.title,
        description: editMaterial.description,
        file: editMaterial.file,
        courseId: editMaterial.courseId,
      },
    });
  }

  function handleDelete(id: string) {
    deleteMaterial.mutate({ id });
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Course Materials</CardTitle>
          <Button
            onClick={() => {
              setOpen(true);
              setEditId(null);
              setEditMaterial(null);
            }}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
      </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No course materials yet.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <div className="w-full">
                <table className="w-full bg-white dark:bg-background rounded-lg shadow mt-4 text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">No</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Title</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Description</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">File</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Course ID</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Teacher ID</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m, i) => (
                      <tr
                        key={startIndex + i}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                          {startIndex + i + 1}
                        </td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{m.title}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{m.description}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">
                          {m.url ? (
                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                              {m.url.split('/').pop()}
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{m.courseId}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{m.teacherId}</td>
                        <td className="px-1 sm:px-2 py-1 flex flex-col sm:flex-row gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              setEditId(m.id);
                              setEditMaterial(m);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full sm:w-auto"
                            onClick={() => handleDelete(m.id)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} course materials
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
      {/* Create/Edit Course Material Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Course Material" : "Add New Course Material"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editId ? handleEditSave : handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <Input
                value={editId ? editMaterial?.title || "" : title}
                onChange={e =>
                  editId
                    ? setEditMaterial({ ...editMaterial, title: e.target.value })
                    : setTitle(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <Input
                value={editId ? editMaterial?.description || "" : description}
                onChange={e =>
                  editId
                    ? setEditMaterial({ ...editMaterial, description: e.target.value })
                    : setDescription(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                File (ppt, pdf, doc, etc.)
              </label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="block w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  if (editId) {
                    setEditMaterial({ ...editMaterial, file });
                  } else {
                    setFile(file);
                  }
                }}
              />
              {/* Show the file name if available */}
              {(editId ? editMaterial?.file : file) && (
                <span className="text-xs text-gray-600">{(editId ? editMaterial.file?.name : file?.name) || ''}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course
                </label>
                <Select
                  value={editId ? editMaterial?.courseId || "" : courseId}
                  onValueChange={value =>
                    editId
                      ? setEditMaterial({ ...editMaterial, courseId: value })
                      : setCourseId(value)
                  }
                  required
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
                disabled={createMaterial.isPending || updateMaterial.isPending}
              >
                {createMaterial.isPending || updateMaterial.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 