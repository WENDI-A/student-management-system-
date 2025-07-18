"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useAuthStore } from "@/lib/auth-store";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== "admin") redirect("/login");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar role="admin" />
        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
} 