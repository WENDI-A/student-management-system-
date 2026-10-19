"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIdentity } from "@/hooks/auth/useIdentity";
import dataProvider from "@/hooks/dataProvider";

export default function ParentAssessment() {
  // Get the current parent's identity
  const { data: identity, isLoading: identityLoading } = useIdentity();

  // Extract parentId from identity
  const parentId =
    typeof identity === "object" && identity !== null && "id" in identity
      ? (identity as any).id
      : undefined;

  // Only send filter if parentId is defined
  const filter = parentId ? { parentId } : undefined;

  // Use select instead of include
  const select = {
    student: true,
    grade: true,
    courseName: true,
    title: true,
    dueDate: true,
    status: true,
  };

  // Fetch assessments for the parent
  const {
    data,
    isLoading: assessmentsLoading,
    error,
  } = dataProvider.useListQuery(
    "assessments",
    {
      filter,
      page: 1,
      perPage: 10,
      select: JSON.stringify(select),
    },
    {
      enabled: !!parentId,
    }
  );

  const isLoading = identityLoading || assessmentsLoading;
  const assessments = data?.data || [];

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Your Child’s Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading assessments...</p>
          ) : error ? (
            <p className="text-red-500">Failed to load assessments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900">
                    <th className="px-3 py-2 text-left">Student</th>
                    <th className="px-3 py-2 text-left">Course</th>
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-left">Due Date</th>
                    <th className="px-3 py-2 text-left">Grade</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a: any, idx: number) => {
                    const daysLeft = Math.ceil(
                      (new Date(a.dueDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={idx} className="border-b">
                        <td className="px-3 py-2 font-medium">
                          {a.student?.name || "N/A"}
                        </td>
                        <td className="px-3 py-2 font-medium">{a.courseName}</td>
                        <td className="px-3 py-2">{a.title}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              daysLeft <= 3 ? "text-red-600 font-semibold" : ""
                            }
                          >
                            {a.dueDate}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {a.grade?.value ?? "Not graded"}
                        </td>
                        <td className="px-3 py-2">
                          {a.status === "Submitted" ? (
                            <Badge variant="outline">Submitted</Badge>
                          ) : daysLeft <= 3 ? (
                            <Badge variant="destructive">Due Soon</Badge>
                          ) : (
                            <Badge variant="outline">Upcoming</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}