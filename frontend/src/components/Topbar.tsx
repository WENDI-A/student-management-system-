"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Sun, Moon, LogOut, User as UserIcon, Pencil } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth-store";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState(user?.name || "");
  const [editEmail, setEditEmail] = React.useState(""); // No user.email, just local state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // Toggle menu on button click
  const handleProfileClick = () => setMenuOpen((open) => !open);

  // Close menu on click outside
  React.useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      const menu = document.getElementById("profile-menu");
      if (menu && !menu.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  // Handle edit profile form submit (mock)
  function handleEditProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setEditOpen(false);
      setMenuOpen(false);
      // Here you would update the user in your store/backend
    }, 1200);
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-background border-b border-gray-200 dark:border-border flex items-center justify-between px-6 h-16 shadow-sm">
      <div className="flex items-center gap-3 relative">
        <button
          className="flex items-center gap-2 focus:outline-none"
          onClick={handleProfileClick}
          aria-label="Open user menu"
        >
          <Avatar>
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.name || "User"}</span>
        </button>
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          {menuOpen && (
            <div id="profile-menu" className="absolute left-0 top-12 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg shadow-lg min-w-[200px] p-2 z-50">
              <div className="flex items-center gap-2 px-2 py-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</span>
              </div>
              <div className="px-2 pb-2 text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
              <button
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600"
                onClick={() => { setEditOpen(true); setMenuOpen(false); }}
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                onClick={() => { logout(); setMenuOpen(false); window.location.href = "/login"; }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </Dialog>
        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          {editOpen && (
            <DialogContent showCloseButton>
              <DialogTitle>Edit Profile</DialogTitle>
              <form className="space-y-4" onSubmit={handleEditProfile}>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-600 w-full sm:w-auto" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </div>
                {success && <div className="text-emerald-500 text-center mt-2">Profile updated!</div>}
              </form>
            </DialogContent>
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