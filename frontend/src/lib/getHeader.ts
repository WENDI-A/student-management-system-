import { useAuthStore } from './auth-store';

export const getHeader = () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}; 