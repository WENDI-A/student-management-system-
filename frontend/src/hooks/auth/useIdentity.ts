import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/auth-store';
import { useSnackbar } from 'notistack';

export function useIdentity() {
  const { enqueueSnackbar } = useSnackbar();
  return useQuery({
    queryKey: ['identity'],
    queryFn: async () => {
      const user = useAuthStore.getState().user;
      if (!user) {
        enqueueSnackbar('No user identity found', { variant: 'warning' });
      }
      return user;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });
} 