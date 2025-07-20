"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { RouteProtection } from "@/lib/routeProtection";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <RouteProtection requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
        <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
        <div className="flex-1 flex flex-col md:flex-row w-full">
          {/* Sidebar overlays on mobile, static on desktop */}
          <Sidebar role="admin" sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
          <main className="flex-1 w-full max-w-full p-2 sm:p-4 md:p-6 space-y-6 overflow-x-auto">{children}</main>
        </div>
      </div>
    </RouteProtection>
  );
} 