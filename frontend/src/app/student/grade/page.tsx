"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const grades = [
  { course: "Math", grade: 92 },
  { course: "English", grade: 85 },
  { course: "Science", grade: 78 },
  { course: "History", grade: 67 },
];

const GPA = 3.45;
const COLORS = ["#22c55e", "#facc15", "#f59e42", "#ef4444"];

export default function StudentGradePage() {
  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <Card className="rounded-2xl shadow mb-6">
        <CardHeader>
          <CardTitle>GPA Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-700 dark:text-blue-400">{GPA.toFixed(2)}</div>
          <div className="text-gray-500 dark:text-gray-400">Current GPA</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Grades by Course</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grades}>
              <XAxis dataKey="course" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="grade">
                {grades.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.grade >= 90 ? COLORS[0] :
                      entry.grade >= 80 ? COLORS[1] :
                      entry.grade >= 70 ? COLORS[2] :
                      COLORS[3]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 