"use client";
import { Bell, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth-store";

interface TopbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function Topbar({ sidebarOpen, onSidebarToggle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-background border-b border-gray-200 dark:border-border flex items-center justify-between px-4 md:px-6 h-16 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onSidebarToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
        
        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Student Management System
        </h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        {/* User Name - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            ({user?.role})
          </span>
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        {/* Theme Toggle */}
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
} 