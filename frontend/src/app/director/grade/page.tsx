"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Download } from "lucide-react";

const classes = [
  { id: "10A", name: "Grade 10A - Ms. Ruth" },
  { id: "11B", name: "Grade 11B - Mr. Lee" },
];
const subjects = ["Math", "English", "Science", "History"];
const years = ["2023-2024", "2022-2023", "2021-2022"];

const students = [
  { name: "John Doe", subject: "Math", grade: 92, status: "Passed" },
  { name: "Jane Smith", subject: "Math", grade: 67, status: "Failed" },
  { name: "Alice Brown", subject: "Math", grade: 85, status: "Passed" },
  { name: "Bob Lee", subject: "Math", grade: 74, status: "Passed" },
];

export default function DirectorGradePage() {
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedYear, setSelectedYear] = useState(years[0]);
  return (
    <>
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Grades Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Class</label>
              <select
                className="rounded-md border px-3 py-2 text-base bg-white dark:bg-slate-900"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Subject</label>
              <select
                className="rounded-md border px-3 py-2 text-base bg-white dark:bg-slate-900"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Academic Year</label>
              <select
                className="rounded-md border px-3 py-2 text-base bg-white dark:bg-slate-900"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex justify-end w-full">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> Export as CSV
              </Button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900">
                  <th className="px-3 py-2 text-left">Student Name</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2">{s.subject}</td>
                    <td className="px-3 py-2">
                      <span className={
                        s.grade >= 85 ? "text-green-600 font-semibold" : s.grade >= 70 ? "text-yellow-500 font-semibold" : "text-red-600 font-semibold"
                      }>{s.grade}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={s.status === "Passed" ? "outline" : "destructive"}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 