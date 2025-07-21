"use client";
import { useState, useEffect } from "react";
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
import axios from '@/lib/axios';
import { getHeader } from '@/lib/getHeader';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function AdminDirector() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [directors, setDirectors] = useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      password?: string;
    }>
  >([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDirector, setEditDirector] = useState<null | (typeof directors)[0]>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const directorsPerPage = 10;
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // Calculate pagination
  const totalPages = Math.ceil(directors.length / directorsPerPage);
  const startIndex = (currentPage - 1) * directorsPerPage;
  const endIndex = startIndex + directorsPerPage;
  const currentDirectors = directors.slice(startIndex, endIndex);

  async function fetchDirectors() {
    try {
      const headers = getHeader();
      const res = await axios.get('/directors', { headers });
      // Defensive: filter out any undefined/null or malformed entries
      const validDirectors = Array.isArray(res.data.data)
        ? res.data.data.filter((d: any) => d && d.firstName && d.lastName && d.email)
        : [];
      setDirectors(validDirectors);
    } catch (err) {
      // Optionally handle error (e.g., show a message)
      setDirectors([]);
    }
  }

  useEffect(() => {
    fetchDirectors();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      alert('You must be logged in as an admin to register a director.');
      router.push('/login');
      return;
    }
    setSaving(true);
    try {
      const headers = getHeader();
      console.log('DEBUG: Authorization header for director registration:', headers);
      const res = await axios.post('/directors', { firstName, lastName, email }, { headers });
      setDirectors((prev) => [...prev, res.data.data]);
      setSuccess(true);
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCurrentPage(1);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex === null || !editDirector || typeof editDirector !== 'object') return;
    setEditLoading(true);
    try {
      const headers = getHeader();
      const id = directors[editIndex]?.id;
      if (!id) return;
      // Remove password from updateData if present
      const { password, ...updateData } = editDirector;
      await axios.put(`/directors/${id}`, updateData, { headers });
      setEditIndex(null);
      setEditDirector(null);
      fetchDirectors();
    } finally {
      setEditLoading(false);
    }
  }
  
  function handleDelete(idx: number) {
    setDeleteIndex(idx);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (deleteIndex === null) return;
    setDeleteLoading(true);
    try {
      const headers = getHeader();
      const id = directors[deleteIndex]?.id;
      if (!id) return;
      await axios.delete(`/directors/${id}`, { headers });
      setDeleteDialogOpen(false);
      setDeleteIndex(null);
      fetchDirectors();
    } finally {
      setDeleteLoading(false);
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Directors</CardTitle>
          <Button
            onClick={() => setOpen(true)}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
        </CardHeader>
        <CardContent>
          {directors.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No directors yet.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="min-w-[400px] bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentDirectors.map((d, i) => {
                    if (!d || !d.firstName || !d.lastName || !d.email) return null;
                    return (
                      <tr
                        key={startIndex + i}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                          {startIndex + i + 1}
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                          {d.firstName}
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                          {d.lastName}
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                          {d.email}
                        </td>
                        <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              setEditIndex(startIndex + i);
                              setEditDirector({ ...d, password: "" });
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
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2 sm:px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, directors.length)} of {directors.length} directors
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
              Director created!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Director Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Director</DialogTitle>
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

      {/* Edit Director Dialog */}
      <Dialog
        open={editIndex !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditIndex(null);
            setEditDirector(null);
          }
        }}
      >
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Edit Director</DialogTitle>
          </DialogHeader>
          {editDirector && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    value={editDirector.firstName}
                    onChange={(e) =>
                      setEditDirector({
                        ...editDirector,
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
                    value={editDirector.lastName}
                    onChange={(e) =>
                      setEditDirector({
                        ...editDirector,
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
                  value={editDirector.email}
                  onChange={(e) =>
                    setEditDirector({ ...editDirector, email: e.target.value })
                  }
                  required
                />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this director?</div>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 