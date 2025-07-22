"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  GraduationCap,
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
    { label: "Grades", icon: GraduationCap, href: "/student/grade" },
  ],
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { label: "Course Material", icon: Book, href: "/teacher/course-material" },
    { label: "Assessment", icon: ClipboardList, href: "/teacher/assessment" },
    { label: "Attendance", icon: CheckCircle, href: "/teacher/attendance" },
    { label: "Grade", icon: GraduationCap, href: "/teacher/grade" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
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
    { label: "Assessment", icon: ClipboardList, href: "/parent/assessment" },
    { label: "Grade", icon: GraduationCap, href: "/parent/grade" },
  ],
  director: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/director" },
    { label: "Grade", icon: GraduationCap, href: "/director/grade" },
    { label: "Transcript", icon: FileText, href: "/director/transcript" },
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
  const [editOpen, setEditOpen] = React.useState(false);
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

  // Handle edit profile form submit
  function handleEditProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setEditOpen(false);
      // Here you would update the user in your store/backend
    }, 1200);
  }

  // Group navigation items by category
  const navigationGroups = React.useMemo(() => {
    const mainItems = items.filter(item =>
      ['Dashboard'].includes(item.label)
    );

    const academicItems = items.filter(item =>
      ['Course Material', 'Assessment', 'Grade', 'Grades', 'Attendance', 'Transcript'].includes(item.label)
    );

    const managementItems = items.filter(item =>
      ['Student', 'Teacher', 'Parent', 'Director', 'Course', 'Schedule'].includes(item.label)
    );

    const settingsItems = items.filter(item =>
      ['Notification', 'Setting'].includes(item.label)
    );

    return {
      main: mainItems,
      academic: academicItems.length > 0 ? academicItems : null,
      management: managementItems.length > 0 ? managementItems : null,
      settings: settingsItems.length > 0 ? settingsItems : null
    };
  }, [items]);

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Empty header space */}
      {/* <div className="px-4 py-4 h-16"></div> */}

      <ScrollArea className="flex-1 px-2">
        <div className="pb-12 pt-2">
          {/* Main Navigation */}
          <div className="space-y-4">
            {/* Main Group */}
            <div className="space-y-1">
              {navigationGroups.main.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            onSidebarToggle();
                          }
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="md:hidden">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Academic Group */}
            {navigationGroups.academic && (
              <>
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground">Academic</h3>
                </div>
                <div className="space-y-1">
                  {navigationGroups.academic.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                onSidebarToggle();
                              }
                            }}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="md:hidden">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </>
            )}

            {/* Management Group */}
            {navigationGroups.management && (
              <>
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground">Management</h3>
                </div>
                <div className="space-y-1">
                  {navigationGroups.management.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                onSidebarToggle();
                              }
                            }}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="md:hidden">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </>
            )}

            {/* Settings Group */}
            {navigationGroups.settings && (
              <>
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground">Settings</h3>
                </div>
                <div className="space-y-1">
                  {navigationGroups.settings.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                onSidebarToggle();
                              }
                            }}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="md:hidden">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="mt-auto border-t">
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-2"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Edit Profile</DialogTitle>
          <form className="space-y-4" onSubmit={handleEditProfile}>
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
            {success && (
              <div className="text-center text-sm text-emerald-500">
                Profile updated successfully!
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={onSidebarToggle}>
        <SheetContent
          side="left"
          className="p-0 w-72 border-r"
        >
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop: Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r bg-background sticky top-0">
        {SidebarContent}
      </aside>
    </>
  );
}