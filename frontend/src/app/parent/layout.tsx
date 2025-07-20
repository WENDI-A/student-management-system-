"use client";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { RouteProtection } from "@/lib/routeProtection";
import { useState } from "react";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <RouteProtection requiredRole="parent">
      <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
        <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
        <div className="flex flex-1">
          <Sidebar role="parent" sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
          <main className="flex-1 p-4 md:p-6 space-y-6">{children}</main>
        </div>
      </div>
    </RouteProtection>
  );
} 