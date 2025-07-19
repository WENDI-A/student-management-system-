import { useAuthStore } from './auth-store';
import { setOnUnauthorized } from './axios';

// Set up the global unauthorized handler for 401s
if (typeof window !== 'undefined') {
  setOnUnauthorized(() => {
    window.dispatchEvent(new CustomEvent('show-glass-overlay'));
    setTimeout(() => {
      window.location.href = '/login';
    }, 5000);
  });
}

export const getHeader = () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}; 