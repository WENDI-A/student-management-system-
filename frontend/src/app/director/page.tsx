"use client";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { Topbar } from "@/components/Topbar";

export default function DirectorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <Sidebar
          role="director"
          sidebarOpen={sidebarOpen}
          onSidebarToggle={handleSidebarToggle}
        />
        <main className="flex-1 w-full max-w-full p-2 sm:p-4 md:p-6 space-y-6 overflow-x-auto">
          <h1 className="text-2xl font-bold mb-4">Director Dashboard</h1>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 min-h-[300px] flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-lg">Welcome, Director! (Dashboard content goes here)</span>
          </div>
        </main>
      </div>
    </div>
  );
} 