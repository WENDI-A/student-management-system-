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
import axios from "@/lib/axios";
import { useAuthStore } from "@/lib/auth-store";

const assessmentTypes = ["EXAM", "QUIZ", "ASSIGNMENT", "PROJECT", "OTHER"];

export default function TeacherAssessment() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [mark, setMark] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [assessments, setAssessments] = useState<Array<any>>([]);
  const [courses, setCourses] = useState<Array<any>>([]);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Fetch teacher's courses
    axios.get("/courses", { params: { teacherId: user?.id } })
      .then(res => setCourses(res.data.data || []));
    // Fetch assessments for this teacher
    fetchAssessments();
  }, [user?.id]);

  const fetchAssessments = () => {
    axios.get("/assessments", { params: { teacherId: user?.id } })
      .then(res => setAssessments(res.data.data || []));
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post("/assessments", {
        title,
        type,
        courseId,
        teacherId: user?.id,
        date: new Date(date),
        mark: parseFloat(mark),
      });
      setOpen(false);
      setTitle("");
      setType("");
      setCourseId("");
      setDate("");
      setMark("");
      setSuccess(true);
      fetchAssessments();
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-2xl">Assessments</CardTitle>
          <Button
            onClick={() => setOpen(true)}
            variant="link"
            className="text-blue-700 dark:text-blue-400 w-full sm:w-auto"
          >
            + Create
          </Button>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No assessments yet.
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="min-w-[600px] bg-white dark:bg-background rounded-lg shadow mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Title</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Type</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Course</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Date</th>
                    <th className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a, i) => (
                    <tr key={a.id || i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{a.title}</td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{a.type}</td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{courses.find(c => c.id === a.courseId)?.name || a.courseId}</td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap">{a.mark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {success && (
            <div className="text-emerald-500 text-center mt-2">
              Assessment created!
            </div>
          )}
        </CardContent>
      </Card>
      {/* Create Assessment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full px-2 sm:px-6">
          <DialogHeader>
            <DialogTitle>Add New Assessment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
              <Select value={courseId} onValueChange={setCourseId} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mark</label>
              <Input type="number" value={mark} onChange={e => setMark(e.target.value)} required min="0" step="0.01" />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 