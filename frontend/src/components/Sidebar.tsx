"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Pencil,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useAuthStore } from "@/lib/auth-store";

const sidebarConfig = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/student" },
    { label: "Course Material", icon: Book, href: "/student/course-material" },
    { label: "Assessment", icon: ClipboardList, href: "/student/assessment" },
    // { label: "Exam", icon: FileText, href: "/student/exam" }, // TEMPORARILY COMMENTED OUT
    // { label: "Notification", icon: Bell, href: "/student/notification" }, // TEMPORARILY COMMENTED OUT
    // { label: "Setting", icon: Settings, href: "/student/setting" }, // TEMPORARILY COMMENTED OUT
    { label: "Grades", icon: GraduationCap, href: "/student/grade" },
  ],
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { label: "Course Material", icon: Book, href: "/teacher/course-material" },
    // { label: "Course Enrollment", icon: Users, href: "/teacher/course-enrollment" }, // TEMPORARILY COMMENTED OUT
    { label: "Assessment", icon: ClipboardList, href: "/teacher/assessment" },
    { label: "Attendance", icon: CheckCircle, href: "/teacher/attendance" },
    { label: "Grade", icon: GraduationCap, href: "/teacher/grade" },
    // { label: "Question", icon: FileQuestion, href: "/teacher/question" }, // TEMPORARILY COMMENTED OUT
    // { label: "Notification", icon: Bell, href: "/teacher/notification" }, // TEMPORARILY COMMENTED OUT
    // { label: "Setting", icon: Settings, href: "/teacher/setting" }, // TEMPORARILY COMMENTED OUT
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
  director: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/director" },
    { label: "Grade", icon: GraduationCap, href: "/director/grade" },
  ],
};

type SidebarProps = {
  role: keyof typeof sidebarConfig;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
};

export function Sidebar({ role, sidebarOpen, onSidebarToggle }: SidebarProps) {
  const pathname = usePathname();
  const items = sidebarConfig[role];
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  // Remove collapsed state and collapse/expand button logic
  // Sidebar should always be expanded on desktop, only toggled on mobile via hamburger
  // Remove all references to 'collapsed', 'setCollapsed', and the arrow button
  // Sidebar width: w-60 min-w-[12rem] always on desktop
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Edit profile state
  const [editName, setEditName] = React.useState(user?.firstName || "");
  const [editEmail, setEditEmail] = React.useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // Handle edit profile form submit (mock)
  function handleEditProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setEditOpen(false);
      setProfileOpen(false);
      // Here you would update the user in your store/backend
    }, 1200);
  }

  const sidebarWidths = {
    expanded: "w-60 min-w-[12rem]",
    collapsed: "w-14 min-w-[3.5rem]",
  };

  const SidebarContent = (
    <nav
      className={cn(
        "relative flex flex-col h-full justify-between transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700",
        sidebarWidths.expanded
      )}
    >
      <div className="pt-4">
        <NavigationMenu
          className={cn(
            "flex flex-col gap-1 w-full transition-all duration-300",
            "px-2"
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={undefined}
                className={cn(
                  "group flex items-center transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 w-full",
                  "gap-3 px-3 py-3",
                  active &&
                    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600 dark:border-blue-400 shadow-sm"
                )}
                style={{ minHeight: '48px' }}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onSidebarToggle();
                  }
                }}
              >
                <span className={cn(
                  "flex items-center justify-center transition-colors duration-200",
                  "w-5 h-5"
                )}>
                  <Icon
                    className={cn(
                      "transition-colors duration-200",
                      active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}
                    style={{ width: 20, height: 20 } as React.CSSProperties}
                  />
                </span>
                <span className="text-sm font-medium ml-2">{item.label}</span>
              </Link>
            );
          })}
        </NavigationMenu>
      </div>
      {/* Profile Section - always at the bottom */}
      <div className={cn("px-4 py-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300", "px-2")}> 
        <div className="relative">
          <button
            className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                {user?.firstName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform duration-200",
                profileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                  {user?.role}
                </div>
              </div>
              <div className="p-2">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition-colors duration-200"
                  onClick={() => {
                    setEditOpen(true);
                    setProfileOpen(false);
                  }}
                >
                  <Pencil className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors duration-200"
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {editOpen && (
          <DialogContent showCloseButton>
            <DialogTitle>Edit Profile</DialogTitle>
            <form className="space-y-4" onSubmit={handleEditProfile}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
              {success && (
                <div className="text-emerald-500 text-center mt-2">
                  Profile updated!
                </div>
              )}
            </form>
          </DialogContent>
        )}
      </Dialog>
    </nav>
  );

  return (
    <>
      {/* Mobile: Sheet sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={onSidebarToggle}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-white dark:bg-gray-900 h-full shadow-xl border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-screen md:hidden"
        >
          {/* Mobile close button at top right */}
          <div className="flex items-center justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close sidebar"
              onClick={onSidebarToggle}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <DialogTitle asChild>
            <VisuallyHidden>Sidebar Navigation</VisuallyHidden>
          </DialogTitle>
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop: Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 sticky top-0 transition-all duration-300",
          "w-60 min-w-[12rem]"
        )}
      >
        <div className="flex-1 overflow-y-auto max-h-screen">
          {SidebarContent}
        </div>
      </aside>
    </>
  );
}
