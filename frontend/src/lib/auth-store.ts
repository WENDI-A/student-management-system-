import { create } from "zustand";

export type UserRole = "student" | "teacher" | "admin" | "parent" | null;

export type AuthState = {
  user: null | { name: string; role: UserRole };
  login: (role: UserRole, name: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (role, name) => set({ user: { name, role } }),
  logout: () => set({ user: null }),
})); 