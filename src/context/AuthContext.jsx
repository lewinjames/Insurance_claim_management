import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api.js';

// Create the Auth Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('insurance_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on startup if token exists
  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authAPI.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // If token expired, clear it
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  // Handle user login
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('insurance_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Quick 1-click login for college demo presentation
  const quickLogin = async (role) => {
    setError(null);
    const credentials = {
      Admin: { email: 'admin@insurance.edu', password: 'Admin@123' },
      'Claim Officer': { email: 'officer@insurance.edu', password: 'Officer@123' },
      Policyholder: { email: 'policyholder@insurance.edu', password: 'User@123' }
    };

    const creds = credentials[role];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  // Handle user registration
  const register = async (userData) => {
    setError(null);
    try {
      const data = await authAPI.register(userData);
      if (data.success) {
        localStorage.setItem('insurance_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem('insurance_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Value provided to consumers
  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    quickLogin,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isOfficer: user?.role === 'Claim Officer',
    isPolicyholder: user?.role === 'Policyholder'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to consume AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
