"use client";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useState } from "react";

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col font-sans">
      <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <Sidebar
          role="director"
          sidebarOpen={sidebarOpen}
          onSidebarToggle={handleSidebarToggle}
        />
        <main className="flex-1 w-full max-w-full p-2 sm:p-4 md:p-6 space-y-8 overflow-x-auto bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
} 