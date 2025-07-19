import axios from 'axios';
import { useAuthStore } from './auth-store';
import { BASE_URL } from './apiPaths';

// This will be set by the glass overlay logic
let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (cb: () => void) => { onUnauthorized = cb; };

const instance = axios.create({
  baseURL: BASE_URL, // Use the config base URL
  withCredentials: true,
});

// Attach JWT token from Zustand
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default instance; 