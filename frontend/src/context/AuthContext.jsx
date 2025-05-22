import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  // Sync role from localStorage on mount and when localStorage changes
  useEffect(() => {
    const syncRole = () => {
      const auth = JSON.parse(localStorage.getItem("auth"));
      setRole(auth?.user?.role || null);
    };
    syncRole();

    // Listen for changes to localStorage (e.g., login/logout in another tab)
    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, []);

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}; 