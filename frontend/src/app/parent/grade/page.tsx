"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const grades = [
  { course: "Math", final: 92, breakdown: { assignment: 30, quiz: 30, exam: 40 } },
  { course: "English", final: 85, breakdown: { assignment: 40, quiz: 20, exam: 40 } },
  { course: "Science", final: 78, breakdown: { assignment: 25, quiz: 25, exam: 50 } },
];
const GPA = 3.45;

export default function ParentGradePage() {
  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <Card className="rounded-2xl shadow mb-6">
        <CardHeader>
          <CardTitle>Your Child’s GPA Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-700 dark:text-blue-400">{GPA.toFixed(2)}</div>
          <div className="text-gray-500 dark:text-gray-400">Current GPA</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Your Child’s Grades by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grades.map((g, idx) => (
              <Card key={g.course} className="rounded-xl shadow bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="font-semibold text-base">{g.course}</CardTitle>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Final Grade: <span className={
                    g.final >= 85 ? "text-green-600" : g.final >= 70 ? "text-yellow-500" : "text-red-600"
                  }>{g.final}</span></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-24">Assignment</span>
                      <ProgressBar value={g.breakdown.assignment} color={g.breakdown.assignment >= 85 ? 'green' : g.breakdown.assignment >= 70 ? 'yellow' : 'red'} />
                      <span className="w-10 text-right">{g.breakdown.assignment}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-24">Quiz</span>
                      <ProgressBar value={g.breakdown.quiz} color={g.breakdown.quiz >= 85 ? 'green' : g.breakdown.quiz >= 70 ? 'yellow' : 'red'} />
                      <span className="w-10 text-right">{g.breakdown.quiz}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-24">Exam</span>
                      <ProgressBar value={g.breakdown.exam} color={g.breakdown.exam >= 85 ? 'green' : g.breakdown.exam >= 70 ? 'yellow' : 'red'} />
                      <span className="w-10 text-right">{g.breakdown.exam}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: 'green' | 'yellow' | 'red' }) {
  const colorClass = color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-3 ${colorClass}`} style={{ width: `${value}%` }}></div>
    </div>
  );
} 