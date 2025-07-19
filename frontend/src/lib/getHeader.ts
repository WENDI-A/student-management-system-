import { useAuthStore } from './auth-store';

export const getHeader = () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}; 