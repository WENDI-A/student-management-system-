import { useMutation } from '@tanstack/react-query';
import axios from '../../lib/axios';
import { useAuthStore } from '../../lib/auth-store';
import type { AuthState } from '../../lib/auth-store';
import { useSnackbar } from 'notistack';
import { z } from 'zod';
import { API_PATHS } from '../../lib/apiPaths';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
  password: z.string().min(3, 'Password is required'),
  tab: z.enum(['student', 'user']),
});

export function validateLoginInput({ identifier, password, tab }: { identifier: string; password: string; tab: 'student' | 'user' }) {
  const result = loginSchema.safeParse({ identifier, password, tab });
  const errors: { identifier?: string; password?: string } = {};
  if (!result.success) {
    if (result.error && Array.isArray(result.error.issues)) {
      for (const err of result.error.issues) {
        if (err.path[0] === 'identifier') errors.identifier = err.message;
        if (err.path[0] === 'password') errors.password = err.message;
      }
    }
  } else {
    // Custom format checks
    if (tab === 'student' && !/^\d{1,10}\/\d{1,10}$/.test(identifier)) {
      errors.identifier = 'Student ID must be in the format 1378/14';
    }
    if (tab === 'user' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) {
      errors.identifier = 'Please enter a valid email address.';
    }
  }
  return errors;
}

export function useLogin() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: async ({ identifier, password, tab }: { identifier: string; password: string; tab: 'student' | 'user' }) => {
      const errors = validateLoginInput({ identifier, password, tab });
      if (errors.identifier || errors.password) {
        throw new Error(errors.identifier || errors.password);
      }
      const { data } = await axios.post(API_PATHS.login, { identifier, password });
      return data;
    },
    onSuccess: (data: { token: string; user: AuthState['user'] }) => {
      if (data && data.token && data.user) {
        useAuthStore.getState().login(data.user, data.token);
        enqueueSnackbar('Login successful!', { variant: 'success' });
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Login failed', { variant: 'error' });
    },
  });
} 