"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, File, Link2 } from "lucide-react";

const courseMaterials = [
  {
    course: "Math",
    materials: [
      { name: "Algebra.pdf", type: "pdf" },
      { name: "Geometry.ppt", type: "ppt" },
      { name: "Practice Link", type: "link" },
    ],
  },
  {
    course: "English",
    materials: [
      { name: "Poems.pdf", type: "pdf" },
      { name: "Essay Writing.ppt", type: "ppt" },
    ],
  },
  {
    course: "Science",
    materials: [
      { name: "Lab Manual.pdf", type: "pdf" },
      { name: "Experiment Video", type: "link" },
    ],
  },
];

export default function StudentCourseMaterial() {
  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseMaterials.map((course) => (
          <Card key={course.course} className="rounded-2xl shadow hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{course.course}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {course.materials.map((mat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {mat.type === "pdf" && <FileText className="w-4 h-4 text-red-500" />}
                    {mat.type === "ppt" && <File className="w-4 h-4 text-orange-500" />}
                    {mat.type === "link" && <Link2 className="w-4 h-4 text-blue-500" />}
                    <span className="truncate text-sm">{mat.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs capitalize">{mat.type}</Badge>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">View All</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 