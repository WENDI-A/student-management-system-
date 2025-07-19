import { create } from "zustand";

export type UserRole = "student" | "teacher" | "admin" | "parent" | null;

export type AuthState = {
  user: null | { firstName: string; lastName: string; role: UserRole; email: string };
  token: string | null;
  login: (user: AuthState["user"], token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
})); 