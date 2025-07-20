"use client";
import { useStudentAdminState, getToday, Student } from './adminstudent';
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


export default function AdminStudent() {
  const state = useStudentAdminState();

  // Destructure all needed state/handlers from the hook
  const {
    open, setOpen,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    code, setCode,
    classId, setClassId,
    editId, setEditId,
    editStudent, setEditStudent,
    currentPage, setCurrentPage,
    studentsPerPage,
    today,
    isLoading, error,
    createStudent, updateStudent, deleteStudent,
    classLoading, classes,
    students, total, totalPages, startIndex, endIndex,
    handleSave, handleEditSave, handleDelete, goToPage,
  } = state;

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
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">Error loading students.</div>
          ) : students.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No students yet.</div>
          ) : (
            <div className="overflow-x-auto scroll-smooth rounded-lg">
              <div className="min-w-[600px] sm:min-w-[700px]">
                <table className="w-full bg-white dark:bg-background rounded-lg shadow mt-4 text-xs sm:text-sm">
                  <TableHeader
                    headers={[
                      "No",
                      "First Name",
                      "Last Name",
                      "Email",
                      "Code",
                      "Actions",
                    ]}
                  />
                  <tbody>
                    {students.map((s, i) => (
                      <TableRow
                        key={s.id || i}
                        cells={[
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {startIndex + i + 1}
                          </span>,
                          s.firstName,
                          s.lastName,
                          s.email,
                          s.code,
                          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full min-w-[100px]">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                setEditId(s.id || "");
                                setEditStudent(s);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full sm:w-auto"
                              onClick={() => handleDelete(s.id || "")}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} students
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
                            variant={currentPage === page ? "default" : "outline"}
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
        </CardContent>
      </Card>
      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Student Code
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="1378/14"
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full"
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
                  className="w-full"
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
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Class
              </label>
              <Select value={classId} onValueChange={setClassId} required disabled={classLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={classLoading ? "Loading classes..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}{cls.section ? ` (${cls.section})` : ""}
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
                disabled={createStudent.isPending}
              >
                {createStudent.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog
        open={editId !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditId(null);
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Student Code
                </label>
                <Input
                  value={editStudent.code || ""}
                  onChange={(e) => setEditStudent({ ...editStudent, code: e.target.value })}
                  required
                  placeholder="1378/14"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    value={editStudent.firstName}
                    onChange={(e) => setEditStudent({ ...editStudent, firstName: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    value={editStudent.lastName}
                    onChange={(e) => setEditStudent({ ...editStudent, lastName: e.target.value })}
                    required
                    className="w-full"
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
                  onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class
                </label>
                <Select
                  value={editStudent.classId || ""}
                  onValueChange={(v) => setEditStudent({ ...editStudent, classId: v })}
                  required
                  disabled={classLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={classLoading ? "Loading classes..." : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}{cls.section ? ` (${cls.section})` : ""}
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
                  disabled={updateStudent.isPending}
                >
                  {updateStudent.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
