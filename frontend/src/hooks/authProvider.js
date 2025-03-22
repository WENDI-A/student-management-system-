import { redirect } from "react-router-dom";
import axios from "axios";

// Base URL for API calls
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Authentication provider for React-Admin
const authProvider = {
  login: async ({ username, password, userType }) => {
    try {
      // Make API call to backend for authentication
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
        userType
      });
      
      // Extract data from response
      const { token, user } = response.data;
      
      if (token && user) {
        // Store authentication data in localStorage
        localStorage.setItem('auth', JSON.stringify({ 
          isAuthenticated: true, 
          token,
          user
        }));
        
        // Track the time of login for session management
        localStorage.setItem('authTime', Date.now().toString());
        
        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Return success with redirect info and message
        return Promise.resolve({
          redirectTo: '/',
          message: `Welcome, ${user.fullName}!`
        });
      }
      
      return Promise.reject({
        message: 'Authentication failed'
      });
    } catch (error) {
      console.error("Login error:", error);
      return Promise.reject({
        message: error.response?.data?.message || 'Invalid username or password'
      });
    }
  },
  
  logout: () => {
    // Remove auth data from localStorage
    localStorage.removeItem('auth');
    localStorage.removeItem('authTime');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    return Promise.resolve();
  },
  
  checkError: (error) => {
    const status = error.status || error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      localStorage.removeItem('authTime');
      delete axios.defaults.headers.common['Authorization'];
      
      return Promise.reject({
        message: 'Your session has expired or you are not authorized'
      });
    }
    return Promise.resolve();
  },
  
  checkAuth: () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    
    // Check if auth exists
    if (!auth || !auth.isAuthenticated || !auth.token) {
      return Promise.reject({
        message: 'You must be logged in to access this page'
      });
    }
    
    // Set Authorization header if it exists in localStorage but not in axios defaults
    if (auth.token && !axios.defaults.headers.common['Authorization']) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    }
    
    // Optional: Add session timeout (e.g., 2 hours)
    const authTime = localStorage.getItem('authTime');
    if (authTime) {
      const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const currentTime = Date.now();
      
      if (currentTime - parseInt(authTime) > sessionDuration) {
        // Session timeout
        localStorage.removeItem('auth');
        localStorage.removeItem('authTime');
        delete axios.defaults.headers.common['Authorization'];
        
        return Promise.reject({
          message: 'Session expired. Please login again.'
        });
      }
    }
    
    // Verify token with backend
    return axios.get(`${API_URL}/auth/verify-token`)
      .then(() => Promise.resolve())
      .catch((error) => {
        // If token verification fails, log the user out
        localStorage.removeItem('auth');
        localStorage.removeItem('authTime');
        delete axios.defaults.headers.common['Authorization'];
        
        return Promise.reject({
          message: 'Session invalid. Please login again.'
        });
      });
  },
  
  getPermissions: async () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth) {
      return Promise.reject({
        message: 'No permissions available'
      });
    }
    
    try {
      // Optional: You can make an API call to get fresh permissions
      // const response = await axios.get(`${API_URL}/auth/permissions`);
      // return Promise.resolve(response.data.role);
      
      // Or just use the stored role
      return Promise.resolve(auth.user.role);
    } catch (error) {
      console.error("Permissions error:", error);
      return Promise.reject({
        message: 'Failed to retrieve permissions'
      });
    }
  },
  
  getIdentity: () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth) return Promise.reject({
      message: 'No user found'
    });
    
    return Promise.resolve({
      id: auth.user.id,
      fullName: auth.user.fullName,
      role: auth.user.role,
      // Add other user data as needed
      ...auth.user
    });
  }
};

export default authProvider;
