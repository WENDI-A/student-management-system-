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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "@/lib/axios";

// Helper to convert 'HH:mm' to ISO string for today
function getTodayISOStringWithTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":");
  const now = new Date();
  now.setHours(Number(hours), Number(minutes), 0, 0);
  return now.toISOString();
}

export default function AdminSchedule() {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [schedules, setSchedules] = useState<Array<any>>([]);
  const [courses, setCourses] = useState<Array<any>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const schedulesPerPage = 10;
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [day, setDay] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchSchedules = () => {
    axios.get("/schedules").then((res) => {
      setSchedules(res.data.data || []);
    });
  };

  // Fetch schedules from backend
  useEffect(() => {
    fetchSchedules();
    axios.get("/courses")
      .then((res) => {
        setCourses(res.data.data || []);
      });
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(schedules.length / schedulesPerPage);
  const startIndex = (currentPage - 1) * schedulesPerPage;
  const endIndex = startIndex + schedulesPerPage;
  const currentSchedules = schedules.slice(startIndex, endIndex);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post("/schedules", {
        courseId,
        startTime: getTodayISOStringWithTime(startTime),
        endTime: getTodayISOStringWithTime(endTime),
        location,
        day,
      });
      if (res.status === 200 || res.status === 201) {
        fetchSchedules();
        setSuccess(true);
        setOpen(false);
        setCourseId("");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setDay("");
        setCurrentPage(1);
        setTimeout(() => setSuccess(false), 2000);
      }
    } finally {
      setSaving(false);
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
      const id = schedules[deleteIndex]?.id;
      if (!id) return;
      await axios.delete(`/schedules/${id}`);
      setDeleteDialogOpen(false);
      setDeleteIndex(null);
      fetchSchedules();
    } finally {
      setDeleteLoading(false);
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Schedules</CardTitle>
          <Button
            onClick={() => setOpen(true)}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No schedules yet.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="min-w-[600px] bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">ID</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Course</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Day</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Start Time</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">End Time</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Room</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSchedules
                    .filter((s) => s && s.courseId)
                    .map((s, i) => (
                      <tr
                        key={startIndex + i}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap font-medium text-gray-600 dark:text-gray-400">
                          {startIndex + i + 1}
                        </td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{courses.find((c) => c.id === s.courseId)?.name || s.courseId}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{s.day}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{s.location || '—'}</td>
                        <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              setEditIndex(startIndex + i);
                              setEditSchedule({
                                ...s,
                                startTime: s.startTime ? new Date(s.startTime).toISOString().substring(11, 16) : '',
                                endTime: s.endTime ? new Date(s.endTime).toISOString().substring(11, 16) : '',
                                location: s.location || '',
                              });
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2 sm:px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, schedules.length)} of {schedules.length} schedules
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
              Schedule created!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Schedule Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course
                </label>
                <Select value={courseId} onValueChange={setCourseId} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Time
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Day of Week
                </label>
                <Select value={day} onValueChange={setDay} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
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

      {/* Edit Schedule Dialog */}
      <Dialog open={editIndex !== null} onOpenChange={v => {
        if (!v) {
          setEditIndex(null);
          setEditSchedule(null);
        }
      }}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          {editSchedule && (
            <form onSubmit={async e => {
              e.preventDefault();
              setEditLoading(true);
              try {
                await axios.put(`/schedules/${editSchedule.id}`, {
                  courseId: editSchedule.courseId,
                  startTime: getTodayISOStringWithTime(editSchedule.startTime),
                  endTime: getTodayISOStringWithTime(editSchedule.endTime),
                  location: editSchedule.location,
                  day: editSchedule.day,
                });
                setEditIndex(null);
                setEditSchedule(null);
                fetchSchedules();
              } finally {
                setEditLoading(false);
              }
            }} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                  <Select value={editSchedule.courseId} onValueChange={v => setEditSchedule({ ...editSchedule, courseId: v })} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                  <Input type="time" value={editSchedule.startTime} onChange={e => setEditSchedule({ ...editSchedule, startTime: e.target.value })} required />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                  <Input type="time" value={editSchedule.endTime} onChange={e => setEditSchedule({ ...editSchedule, endTime: e.target.value })} required />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <Input type="text" value={editSchedule.location} onChange={e => setEditSchedule({ ...editSchedule, location: e.target.value })} placeholder="e.g., Room 101" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day of Week</label>
                  <Select value={editSchedule.day} onValueChange={v => setEditSchedule({ ...editSchedule, day: v })} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this schedule?</div>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 