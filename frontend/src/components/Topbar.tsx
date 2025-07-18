"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Sun, Moon, LogOut, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth-store";
import * as React from "react";
import { Dialog } from "@/components/ui/dialog";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-background border-b border-gray-200 dark:border-border flex items-center justify-between px-6 h-16 shadow-sm">
      <div className="flex items-center gap-3 relative">
        <button
          className="flex items-center gap-2 focus:outline-none"
          onClick={() => setMenuOpen(true)}
          aria-label="Open user menu"
        >
          <Avatar>
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.name || "User"}</span>
        </button>
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          {menuOpen && (
            <div className="absolute left-0 top-12 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg shadow-lg min-w-[180px] p-2 z-50">
              <div className="flex items-center gap-2 px-2 py-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</span>
              </div>
              <div className="px-2 pb-2 text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
              <button
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                onClick={() => { logout(); setMenuOpen(false); window.location.href = "/login"; }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </Dialog>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
} 