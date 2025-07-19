import { useMutation } from '@tanstack/react-query';
import axios from '../../lib/axios';
import { useAuthStore } from '../../lib/auth-store';
import { useSnackbar } from 'notistack';
import { API_PATHS } from '../../lib/apiPaths';

export function useRefreshToken() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: async () => {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No token');
      const { data } = await axios.get(`${API_PATHS.refreshToken}/${token}`);
      return data;
    },
    onSuccess: (data: { token: string }) => {
      if (data && data.token) {
        // Only update token, keep user
        useAuthStore.setState((state) => ({ ...state, token: data.token }));
        enqueueSnackbar('Session refreshed!', { variant: 'info' });
      }
    },
    onError: (error: any) => {
      enqueueSnackbar('Session refresh failed', { variant: 'error' });
    },
  });
} 