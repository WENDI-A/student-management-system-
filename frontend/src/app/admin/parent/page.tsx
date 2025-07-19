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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminParent() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [occupation, setOccupation] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [parents, setParents] = useState<
    Array<{
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      phoneNumber: string;
      relationship: string;
      occupation: string;
      selectedStudent: string;
    }>
  >([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editParent, setEditParent] = useState<null | (typeof parents)[0]>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const parentsPerPage = 10;

  // Mock students data - in real app this would come from API
  const mockStudents = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Mike Johnson" },
    { id: "4", name: "Sarah Wilson" },
    { id: "5", name: "David Brown" },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(parents.length / parentsPerPage);
  const startIndex = (currentPage - 1) * parentsPerPage;
  const endIndex = startIndex + parentsPerPage;
  const currentParents = parents.slice(startIndex, endIndex);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setOpen(false);
      setParents((prev) => [
        ...prev,
        { firstName, lastName, email, address, phoneNumber, relationship, occupation, selectedStudent },
      ]);
      setTimeout(() => setSuccess(false), 2000);
      setFirstName("");
      setLastName("");
      setEmail("");
      setAddress("");
      setPhoneNumber("");
      setRelationship("");
      setOccupation("");
      setSelectedStudent("");
      // Reset to first page when adding new parent
      setCurrentPage(1);
    }, 1200);
  }

  function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex === null || !editParent) return;
    setParents((prev) =>
      prev.map((s, i) => (i === editIndex ? editParent : s))
    );
    setEditIndex(null);
    setEditParent(null);
  }
  
  function handleDelete(idx: number) {
    setParents((prev) => prev.filter((_, i) => i !== idx));
    // Adjust current page if we're on the last page and it becomes empty
    if (currentParents.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getStudentName = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Parents</CardTitle>
          <Button
            onClick={() => setOpen(true)}
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
              <table className="min-w-[800px] bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
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
                      Email
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Phone Number
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Relationship
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Occupation
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Student
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentParents.map((p, i) => (
                    <tr
                      key={startIndex + i}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {p.firstName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {p.lastName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {p.email}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {p.phoneNumber}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {p.relationship}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {p.occupation}
                      </td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                        {getStudentName(p.selectedStudent)}
                      </td>
                      <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setEditIndex(startIndex + i);
                            setEditParent(p);
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
                    Showing {startIndex + 1} to {Math.min(endIndex, parents.length)} of {parents.length} parents
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
              Parent created!
            </div>
          )}
        </CardContent>
    </Card>

      {/* Create Parent Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Parent</DialogTitle>
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
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
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Relationship
                </label>
                <Select value={relationship} onValueChange={setRelationship} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Grandparent">Grandparent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Occupation
                </label>
                <Input
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Student
                </label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
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
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Parent Dialog */}
      <Dialog
        open={editIndex !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditIndex(null);
            setEditParent(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
          </DialogHeader>
          {editParent && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    value={editParent.firstName}
                    onChange={(e) =>
                      setEditParent({
                        ...editParent,
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
                    value={editParent.lastName}
                    onChange={(e) =>
                      setEditParent({
                        ...editParent,
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
                  value={editParent.email}
                  onChange={(e) =>
                    setEditParent({ ...editParent, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <Textarea
                  value={editParent.address}
                  onChange={(e) =>
                    setEditParent({ ...editParent, address: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={editParent.phoneNumber}
                    onChange={(e) =>
                      setEditParent({ ...editParent, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship
                  </label>
                  <Select
                    value={editParent.relationship}
                    onValueChange={(v) =>
                      setEditParent({ ...editParent, relationship: v })
                    }
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Grandparent">Grandparent</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Occupation
                  </label>
                  <Input
                    value={editParent.occupation}
                    onChange={(e) =>
                      setEditParent({ ...editParent, occupation: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Student
                  </label>
                  <Select
                    value={editParent.selectedStudent}
                    onValueChange={(v) =>
                      setEditParent({ ...editParent, selectedStudent: v })
                    }
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
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