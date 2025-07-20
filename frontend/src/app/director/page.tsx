"use client";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";

export default function DirectorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        role="director"
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
      />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-4">Director Dashboard</h1>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 min-h-[300px] flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-lg">Welcome, Director! (Dashboard content goes here)</span>
        </div>
      </main>
    </div>
  );
} 