"use client";
import React, { useMemo } from "react";
import dataProvider from "@/hooks/dataProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const resourceList = [
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
  { key: "parents", label: "Parents" },
  { key: "courses", label: "Courses" },
];

export default function AdminDashboardPage() {
  // Fetch counts for each resource
  const { data: studentsData, isLoading: studentsLoading } = dataProvider.useListQuery("students", { page: 1, perPage: 1 });
  const { data: teachersData, isLoading: teachersLoading } = dataProvider.useListQuery("teachers", { page: 1, perPage: 1 });
  const { data: parentsData, isLoading: parentsLoading } = dataProvider.useListQuery("parents", { page: 1, perPage: 1 });
  const { data: coursesData, isLoading: coursesLoading } = dataProvider.useListQuery("courses", { page: 1, perPage: 1 });

  const stats = useMemo(() => [
    { label: "Students", value: studentsData?.total ?? 0, loading: studentsLoading },
    { label: "Teachers", value: teachersData?.total ?? 0, loading: teachersLoading },
    { label: "Parents", value: parentsData?.total ?? 0, loading: parentsLoading },
    { label: "Courses", value: coursesData?.total ?? 0, loading: coursesLoading },
  ], [studentsData, teachersData, parentsData, coursesData, studentsLoading, teachersLoading, parentsLoading, coursesLoading]);

  // For the bar graph
  const maxValue = Math.max(...stats.map(s => s.value), 1);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardHeader>
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {stat.loading ? <span className="animate-pulse">...</span> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Bar Graph with Recharts */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 14 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 