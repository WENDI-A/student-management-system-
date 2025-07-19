"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Book,
  FileText,
  Bell,
  Settings,
  Users,
  User,
  Calendar,
  ClipboardList,
  CheckCircle,
  FileQuestion,
  GraduationCap,
  Menu,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useAuthStore } from "@/lib/auth-store";

const sidebarConfig = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/student" },
    { label: "Course Material", icon: Book, href: "/student/course-material" },
    { label: "Assessment", icon: ClipboardList, href: "/student/assessment" },
    { label: "Exam", icon: FileText, href: "/student/exam" },
    { label: "Notification", icon: Bell, href: "/student/notification" },
    { label: "Setting", icon: Settings, href: "/student/setting" },
  ],
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { label: "Course Material", icon: Book, href: "/teacher/course-material" },
    {
      label: "Course Enrollment",
      icon: Users,
      href: "/teacher/course-enrollment",
    },
    { label: "Assessment", icon: ClipboardList, href: "/teacher/assessment" },
    { label: "Attendance", icon: CheckCircle, href: "/teacher/attendance" },
    { label: "Grade", icon: GraduationCap, href: "/teacher/grade" },
    { label: "Question", icon: FileQuestion, href: "/teacher/question" },
    { label: "Notification", icon: Bell, href: "/teacher/notification" },
    { label: "Setting", icon: Settings, href: "/teacher/setting" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Student", icon: User, href: "/admin/student" },
    { label: "Teacher", icon: Users, href: "/admin/teacher" },
    { label: "Parent", icon: User, href: "/admin/parent" },
    { label: "Director", icon: User, href: "/admin/director" },
    { label: "Course", icon: Book, href: "/admin/course" },
    { label: "Schedule", icon: Calendar, href: "/admin/schedule" },
    { label: "Notification", icon: Bell, href: "/admin/notification" },
    { label: "Setting", icon: Settings, href: "/admin/setting" },
  ],
  parent: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/parent" },
    { label: "Course", icon: Book, href: "/parent/course" },
    { label: "Assessment", icon: ClipboardList, href: "/parent/assessment" },
    { label: "Exam", icon: FileText, href: "/parent/exam" },
    { label: "Grade", icon: GraduationCap, href: "/parent/grade" },
    { label: "Notification", icon: Bell, href: "/parent/notification" },
    { label: "Setting", icon: Settings, href: "/parent/setting" },
  ],
};

type SidebarProps = {
  role: keyof typeof sidebarConfig;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = sidebarConfig[role];
  const [open, setOpen] = React.useState(false);
  const logout = useAuthStore((s) => s.logout);

  const SidebarContent = (
    <nav className="flex flex-col h-full justify-between">
      {/* Navigation - top and left-aligned */}
      <div className="flex-1 mt-10">
        <NavigationMenu className="flex flex-col items-start gap-2 w-full px-2 mt-0">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium text-gray-900 dark:text-sidebar-foreground hover:bg-blue-50 dark:hover:bg-blue-900/30 w-full",
                  active &&
                    "bg-white dark:bg-background text-blue-700 font-semibold shadow border border-blue-100 dark:border-blue-900"
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="w-5 h-5 opacity-80" />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </NavigationMenu>
      </div>
      {/* Footer/Logout */}
      <div className="px-4 py-6 mt-2 border-t border-gray-200 dark:border-border flex flex-col gap-2">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium justify-center"
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile: Sheet sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="md:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-white dark:bg-background shadow-lg border border-gray-200 dark:border-border"
            aria-label="Open sidebar"
          >
            <Menu className="w-7 h-7" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-gray-100 dark:bg-sidebar h-full shadow-lg rounded-r-2xl overflow-y-auto max-h-screen"
        >
          <DialogTitle asChild>
            <VisuallyHidden>Sidebar Navigation</VisuallyHidden>
          </DialogTitle>
          {SidebarContent}
        </SheetContent>
      </Sheet>
      {/* Desktop: Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-gray-100 dark:bg-sidebar shadow-lg rounded-r-2xl border-r border-gray-200 dark:border-border sticky top-0">
        <div className="flex-1 overflow-y-auto max-h-screen">{SidebarContent}</div>
      </aside>
    </>
  );
}
