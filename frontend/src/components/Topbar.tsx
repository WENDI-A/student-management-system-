"use client";
import { Bell, Sun, Moon, Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function Topbar({ sidebarOpen, onSidebarToggle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b flex items-center justify-between px-4 md:px-6 h-16 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="md:hidden"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-semibold">
            Student Management System
          </h1>
          <Badge variant="outline" className="hidden md:flex">v1.0</Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
      
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <div className="py-2 px-3 hover:bg-accent cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">New assessment added</p>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  A new assessment has been added to your Mathematics course.
                </p>
              </div>
              <div className="py-2 px-3 hover:bg-accent cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Grade updated</p>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your grade for Physics has been updated.
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="outline" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}