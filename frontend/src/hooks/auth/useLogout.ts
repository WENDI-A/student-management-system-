import { useAuthStore } from '../../lib/auth-store';
import { useSnackbar } from 'notistack';

export function useLogout() {
  const { enqueueSnackbar } = useSnackbar();
  return () => {
    useAuthStore.getState().logout();
    enqueueSnackbar('Logged out successfully!', { variant: 'success' });
  };
} 