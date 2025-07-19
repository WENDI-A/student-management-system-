import { useAuthStore } from './auth-store';
import { setOnUnauthorized } from './axios';

export const getHeader = () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    if (typeof window !== 'undefined') {
      // Dispatch a custom event to show the glass overlay
      window.dispatchEvent(new CustomEvent('show-glass-overlay'));
      setTimeout(() => {
        window.location.href = '/login';
      }, 5000);
    }
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}; 