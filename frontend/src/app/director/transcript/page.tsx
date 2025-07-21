"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Search } from "lucide-react";

const students = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Alice Brown" },
];

const transcriptData = {
  "2023-2024": [
    { subject: "Math", grade: "A", teacher: "Ms. Ruth", term: "Term 1" },
    { subject: "English", grade: "B+", teacher: "Mr. Lee", term: "Term 1" },
    { subject: "Science", grade: "A-", teacher: "Dr. Green", term: "Term 1" },
  ],
  "2022-2023": [
    { subject: "Math", grade: "B", teacher: "Ms. Ruth", term: "Term 2" },
    { subject: "English", grade: "A", teacher: "Mr. Lee", term: "Term 2" },
    { subject: "Science", grade: "B+", teacher: "Dr. Green", term: "Term 2" },
  ],
};

export default function DirectorTranscriptPage() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="rounded-2xl shadow-md mb-6">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <CardTitle className="text-lg font-semibold">Transcript Search</CardTitle>
          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <Input
                placeholder="Search student..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 md:w-64"
              />
            </div>
            <Button
              variant="outline"
              className="hidden md:inline-flex"
              onClick={() => setSearch("")}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filteredStudents.map(s => (
              <Button
                key={s.id}
                variant={selectedStudent === s.id ? "default" : "outline"}
                onClick={() => setSelectedStudent(s.id)}
                className="rounded-full px-4"
              >
                {s.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {selectedStudent && (
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Transcript for {students.find(s => s.id === selectedStudent)?.name}</CardTitle>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download Transcript
            </Button>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {Object.entries(transcriptData).map(([year, records]) => (
                <AccordionItem key={year} value={year} className="border-b">
                  <AccordionTrigger className="text-base font-semibold">{year}</AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm mb-4">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-900">
                            <th className="px-3 py-2 text-left">Subject</th>
                            <th className="px-3 py-2 text-left">Grade</th>
                            <th className="px-3 py-2 text-left">Teacher</th>
                            <th className="px-3 py-2 text-left">Term</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((rec, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="px-3 py-2 font-medium">{rec.subject}</td>
                              <td className="px-3 py-2">{rec.grade}</td>
                              <td className="px-3 py-2">{rec.teacher}</td>
                              <td className="px-3 py-2">{rec.term}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </>
  );
} 