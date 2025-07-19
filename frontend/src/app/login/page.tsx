"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";

const roleTabs = [
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "parent", label: "Parent" },
];

type LoginTab = "student" | "staff" | "parent";
type StaffRole = "teacher" | "admin";

export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("student");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (tab === "staff") {
      const staffRole = (document.getElementById("staff-role") as HTMLSelectElement)?.value as StaffRole | "";
      if (!staffRole) {
        setError("Please select a staff role.");
        return;
      }
      login(staffRole, name);
      router.push(`/${staffRole}`);
      return;
    }
    login(tab, name);
    router.push(`/${tab}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">School Management Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={v => setTab(v as LoginTab)} className="w-full">
            <TabsList className="w-full mb-4">
              {roleTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex-1">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="student">
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Student Name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                  value={tab === "student" ? name : ""}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={tab === "student"}
                />
                {error && tab === "student" && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full">Login as Student</Button>
              </form>
            </TabsContent>
            <TabsContent value="staff">
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Staff Name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                  value={tab === "staff" ? name : ""}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={tab === "staff"}
                />
                <select id="staff-role" className="w-full p-2 border rounded-md">
                  <option value="">Select Role</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                {error && tab === "staff" && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full">Login as Staff</Button>
              </form>
            </TabsContent>
            <TabsContent value="parent">
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Parent Name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                  value={tab === "parent" ? name : ""}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={tab === "parent"}
                />
                {error && tab === "parent" && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full">Login as Parent</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="w-full text-center text-xs text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} School Management System</div>
        </CardFooter>
      </Card>
    </div>
  );
} 