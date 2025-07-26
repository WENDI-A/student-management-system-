"use client";
import { Bell, Sun, Moon, Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

import { useUserNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  // const user = useAuthStore((s) => s.user);
  // const logout = useAuthStore((s) => s.logout);
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    formatTimeAgo
  } = useUserNotifications();

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
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[350px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notificationsLoading ? (
                <div className="py-4 text-center text-muted-foreground text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground text-sm">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`py-2 px-3 hover:bg-accent cursor-pointer rounded ${!notif.isRead ? 'bg-accent/30' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{getNotificationIcon(notif.type)}</span>
                        <p className="font-medium text-sm">{notif.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={markAllAsRead}
                disabled={notifications.length === 0 || unreadCount === 0}
              >
                Mark all as read
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
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