import axios from 'axios';
import { useAuthStore } from './auth-store';
import { BASE_URL } from './apiPaths';
import { getHeader } from './getHeader';
import type { AxiosRequestHeaders } from 'axios';

// This will be set by the glass overlay logic
let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (cb: () => void) => { onUnauthorized = cb; };

const instance = axios.create({
  baseURL: BASE_URL, // Use the config base URL
  withCredentials: true,
});

// Attach JWT token and identity-aware headers
instance.interceptors.request.use((config) => {
  let baseHeaders = {};
  if (config.headers && typeof config.headers === 'object' && !(config.headers instanceof Array)) {
    baseHeaders = { ...config.headers };
  }
  config.headers = { ...baseHeaders, ...getHeader() } as AxiosRequestHeaders;
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