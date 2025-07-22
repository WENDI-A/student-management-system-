"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, Star, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const summaryCards = [
  {
    title: "Total Students",
    value: 420,
    icon: <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
    color: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    title: "Grade Distribution",
    value: "A: 120, B: 180, C: 90, D: 30",
    icon: <BarChart3 className="w-7 h-7 text-green-600 dark:text-green-400" />,
    color: "bg-green-50 dark:bg-green-900/30",
  },
  {
    title: "Top Performing Class",
    value: "Grade 10A - Math",
    icon: <Star className="w-7 h-7 text-yellow-500 dark:text-yellow-400" />,
    color: "bg-yellow-50 dark:bg-yellow-900/30",
  },
];

const gradeTrends = [
  { month: "Jan", A: 30, B: 40, C: 20, D: 10 },
  { month: "Feb", A: 35, B: 38, C: 18, D: 9 },
  { month: "Mar", A: 32, B: 42, C: 15, D: 11 },
  { month: "Apr", A: 40, B: 35, C: 18, D: 7 },
  { month: "May", A: 38, B: 37, C: 20, D: 5 },
  { month: "Jun", A: 42, B: 33, C: 18, D: 7 },
];

const activities = [
  { icon: <Activity className="w-4 h-4 text-blue-500" />, text: "Grades submitted by Teacher Ruth (Grade 10A)" },
  { icon: <Activity className="w-4 h-4 text-green-500" />, text: "Transcript reviewed for Student John Doe" },
  { icon: <Activity className="w-4 h-4 text-yellow-500" />, text: "New assessment created for Grade 9B" },
  { icon: <Activity className="w-4 h-4 text-purple-500" />, text: "Grade distribution updated for Grade 11C" },
];

export default function DirectorDashboard() {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className={`rounded-2xl shadow-md flex flex-row items-center gap-4 ${card.color}`}>
            <div className="p-4 flex items-center justify-center">{card.icon}</div>
            <div className="flex-1">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</CardContent>
            </div>
          </Card>
        ))}
      </div>
      {/* Grade Trends Chart */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Grade Trends (Monthly)</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeTrends}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="A" fill="#22c55e" name="A" />
              <Bar dataKey="B" fill="#2563eb" name="B" />
              <Bar dataKey="C" fill="#facc15" name="C" />
              <Bar dataKey="D" fill="#ef4444" name="D" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Recent Activities */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Academic Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {activities.map((a, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-200 text-base">
                {a.icon}
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
} 