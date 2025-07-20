"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin, validateLoginInput } from "@/hooks/auth/useLogin";
import { useSnackbar } from "notistack";
import { ROLE_REDIRECTS } from "@/lib/roleRedirects";

const roleTabs = [
  { value: "student", label: "Student" },
  { value: "user", label: "User" },
];

type LoginTab = "student" | "user";

export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const { enqueueSnackbar } = useSnackbar();
  const loginMutation = useLogin();
  const router = useRouter();

  function handleInput(field: "identifier" | "password", value: string) {
    if (field === "identifier") setIdentifier(value);
    if (field === "password") setPassword(value);
    const next = {
      identifier: field === "identifier" ? value : identifier,
      password: field === "password" ? value : password,
      tab,
    };
    setErrors(validateLoginInput(next));
  }

  function handleTabChange(v: string) {
    setTab(v as LoginTab);
    setErrors(validateLoginInput({ identifier, password, tab: v as LoginTab }));
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validation = validateLoginInput({ identifier, password, tab });
    setErrors(validation);
    if (validation.identifier || validation.password) {
      enqueueSnackbar(validation.identifier || validation.password, { variant: "error" });
      return;
    }
    loginMutation.mutate(
      { identifier, password, tab },
      {
        onSuccess: (data) => {
          const userRole = data.user?.role;
          if (userRole) {
            ROLE_REDIRECTS.redirectToRole(userRole, router);
          } else {
            // Show error for unknown role instead of fallback
            enqueueSnackbar('Login successful but user role is unknown. Please contact administrator.', { variant: 'warning' });
            // Stay on login page instead of redirecting
          }
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0 dark:border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">School Management Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full mb-4">
              {roleTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex-1">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="student">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Student ID (e.g. 1378/14)"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 border-0 dark:border-0"
                  value={tab === "student" ? identifier : ""}
                  onInput={e => handleInput("identifier", (e.target as HTMLInputElement).value)}
                  autoFocus={tab === "student"}
                />
                {errors.identifier && <div className="text-red-500 text-xs">{errors.identifier}</div>}
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 border-0 dark:border-0"
                  value={tab === "student" ? password : ""}
                  onInput={e => handleInput("password", (e.target as HTMLInputElement).value)}
                />
                {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
                <Button type="submit" className="w-full" disabled={loginMutation.status === 'pending' || !!errors.identifier || !!errors.password}>
                  {loginMutation.status === 'pending' ? "Logging in..." : "Login as Student"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="user">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 border-0 dark:border-0"
                  value={tab === "user" ? identifier : ""}
                  onInput={e => handleInput("identifier", (e.target as HTMLInputElement).value)}
                  autoFocus={tab === "user"}
                />
                {errors.identifier && <div className="text-red-500 text-xs">{errors.identifier}</div>}
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 border-0 dark:border-0"
                  value={tab === "user" ? password : ""}
                  onInput={e => handleInput("password", (e.target as HTMLInputElement).value)}
                />
                {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
                <Button type="submit" className="w-full" disabled={loginMutation.status === 'pending' || !!errors.identifier || !!errors.password}>
                  {loginMutation.status === 'pending' ? "Logging in..." : "Login as User"}
                </Button>
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