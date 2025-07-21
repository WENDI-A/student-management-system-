import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "student" | "teacher" | "admin" | "parent" | "director" | null;

export type AuthState = {
  user: null | { firstName: string; lastName: string; role: UserRole; email: string };
  token: string | null;
  login: (user: AuthState["user"], token: string) => void;
  logout: () => void;
  isInitialized: boolean;
  setInitialized: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isInitialized: false,
      login: (user, token) => {
        set({ user, token });
        // Also store in localStorage for immediate access
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(user));
        }
      },
      logout: () => {
        set({ user: null, token: null });
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      },
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);

// Initialize auth state from localStorage on app startup
export function initializeAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        useAuthStore.getState().login(user, token);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        useAuthStore.getState().logout();
      }
    }
    
    useAuthStore.getState().setInitialized();
  }
} 