
export const API_URL = 'http://localhost:3001/api';
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
};

export const USER_ENDPOINTS = {
  PROFILE: `${API_URL}/users/profile`,
  UPDATE_PROFILE: `${API_URL}/users/profile`,
};

export const TOKEN_ENDPOINTS = (token) => {
   return `${API_URL}/auth/token-refresh/${token}`
};

export const API_ENDPOINT = {
  LIST: `${API_URL}/list`,
  DETAILS: (id) => `${API_URL}/details/${id}`,
  CREATE: `${API_URL}/create`,
  UPDATE: (id) => `${API_URL}/update/${id}`,
  DELETE: (id) => `${API_URL}/delete/${id}`,
};

export default {
  API_URL,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  API_ENDPOINT,
    TOKEN_ENDPOINTS,
};