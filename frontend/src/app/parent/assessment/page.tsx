"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const assessments = [
  { course: "Math", title: "Quiz 1", due: "2024-07-24", daysLeft: 2, status: "Upcoming" },
  { course: "English", title: "Essay", due: "2024-07-26", daysLeft: 4, status: "Submitted" },
  { course: "Science", title: "Lab Report", due: "2024-07-23", daysLeft: 1, status: "Upcoming" },
];

export default function ParentAssessment() {
  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Your Child’s Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900">
                  <th className="px-3 py-2 text-left">Course</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Due Date</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2 font-medium">{a.course}</td>
                    <td className="px-3 py-2">{a.title}</td>
                    <td className="px-3 py-2">
                      <span className={
                        a.daysLeft <= 3
                          ? "text-red-600 font-semibold"
                          : ""
                      }>
                        {a.due}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {a.status === "Submitted" ? (
                        <Badge variant="outline">Submitted</Badge>
                      ) : a.daysLeft <= 3 ? (
                        <Badge variant="destructive">Due Soon</Badge>
                      ) : (
                        <Badge variant="outline">Upcoming</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 