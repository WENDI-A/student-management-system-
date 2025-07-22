"use client";
import { useParentAdminState } from './adminparent';
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
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function AdminParent() {
  const state = useParentAdminState();
  const {
    open,
    setOpen,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    editId,
    setEditId,
    editParent,
    setEditParent,
    currentPage,
    setCurrentPage,
    parentsPerPage,
    parents,
    total,
    totalPages,
    startIndex,
    endIndex,
    createParent,
    updateParent,
    deleteParent,
    goToPage,
    allStudents,
    studentsLoading,
    selectedStudentIds,
    setSelectedStudentIds,
  } = state;

  // Local state for student search
  const [studentSearch, setStudentSearch] = useState("");

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return allStudents;
    return allStudents.filter((student: any) =>
      `${student.firstName} ${student.lastName} ${student.email}`
        .toLowerCase()
        .includes(studentSearch.toLowerCase())
    );
  }, [allStudents, studentSearch]);

  // Get selected students data
  const selectedStudents = useMemo(() => {
    return allStudents.filter((student: any) => 
      selectedStudentIds.includes(student.id)
    );
  }, [allStudents, selectedStudentIds]);

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  // Handle student removal from selected
  const handleStudentRemove = (studentId: string) => {
    setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
  };

  // Use a default password for creation
  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createParent.mutate({
      data: {
        firstName,
        lastName,
        email,
        password: "changeme123", // Default password for new parents
        parentLinks: selectedStudentIds.map(studentId => ({ studentId })),
      },
    });
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId || !editParent) return;
    updateParent.mutate({
      id: editId,
      data: {
        firstName: editParent.firstName,
        lastName: editParent.lastName,
        email: editParent.email,
        parentLinks: selectedStudentIds.map(studentId => ({ studentId })),
      },
    });
  }

  function handleDelete(id: string) {
    deleteParent.mutate({ id });
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Parents</CardTitle>
          <Button
            onClick={() => {
              setOpen(true);
              setEditId(null);
              setEditParent(null);
              setSelectedStudentIds([]);
              setStudentSearch("");
            }}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
      </CardHeader>
        <CardContent>
          {parents.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No parents yet.
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
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Students</th>
                      <th className="px-1 sm:px-2 py-1 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {parents.map((p, i) => (
                    <tr
                      key={startIndex + i}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                        {startIndex + i + 1}
                      </td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{p.firstName}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{p.lastName}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">{p.email}</td>
                        <td className="px-1 sm:px-2 py-1 whitespace-nowrap">
                          {p.parentLinks && p.parentLinks.length > 0 ? (
                            <ul className="list-disc ml-2">
                              {p.parentLinks.map((link: any) => (
                                <li key={link.student?.id} className="text-xs">
                                  {link.student?.firstName} {link.student?.lastName} ({link.student?.email})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                      </td>
                        <td className="px-1 sm:px-2 py-1 flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                              setEditId(p.id);
                            setEditParent(p);
                              setOpen(true);
                              // Set selected students for edit
                              setSelectedStudentIds(
                                p.parentLinks?.map((link: any) => link.student?.id) || []
                              );
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full sm:w-auto"
                            onClick={() => handleDelete(p.id)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} parents
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
      {/* Create/Edit Parent Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Parent" : "Add New Parent"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editId ? handleEditSave : handleSave} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <Input
                  value={editId ? editParent?.firstName || "" : firstName}
                  onChange={e =>
                    editId
                      ? setEditParent({ ...editParent, firstName: e.target.value })
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
                  value={editId ? editParent?.lastName || "" : lastName}
                  onChange={e =>
                    editId
                      ? setEditParent({ ...editParent, lastName: e.target.value })
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
                value={editId ? editParent?.email || "" : email}
                onChange={e =>
                  editId
                    ? setEditParent({ ...editParent, email: e.target.value })
                    : setEmail(e.target.value)
                }
                required
              />
            </div>
            
            {/* Student Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Students
              </label>
              
              {/* Selected Students Display */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      <span>{student.firstName} {student.lastName}</span>
                      <button
                        type="button"
                        onClick={() => handleStudentRemove(student.id)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
            </div>
              )}
              
              {/* Student Search and Selection */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {/* Student List */}
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {studentsLoading ? (
                  <div className="p-2 text-center text-gray-500">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">
                    {studentSearch ? "No students found" : "No students available"}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredStudents.map((student: any) => (
                      <div
                        key={student.id}
                        className={`p-2 cursor-pointer hover:bg-gray-50 ${
                          selectedStudentIds.includes(student.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleStudentSelect(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                          {selectedStudentIds.includes(student.id) && (
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
              </div>
            </div>
                    ))}
                  </div>
                )}
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
                disabled={createParent.isPending || updateParent.isPending}
              >
                {createParent.isPending || updateParent.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 