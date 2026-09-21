import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore & verify session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (err) {
          console.error("Session restoration failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      const { access, refresh, user: userData } = data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(access);
      setRefreshToken(refresh);
      setUser(userData);
      setLoading(false);

      return userData;
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register handler
  const register = async ({ name, email, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({ name, email, password, role });
      const { access, refresh, user: userData } = data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(access);
      setRefreshToken(refresh);
      setUser(userData);
      setLoading(false);

      return userData;
    } catch (err) {
      setLoading(false);
      const errData = err.response?.data;
      let errorMessage = 'Registration failed. Please check your inputs.';

      if (errData) {
        if (typeof errData === 'string') {
          errorMessage = errData;
        } else if (errData.detail) {
          errorMessage = errData.detail;
        } else if (errData.email) {
          errorMessage = `Email: ${errData.email[0]}`;
        } else if (errData.password) {
          errorMessage = `Password: ${errData.password[0]}`;
        } else if (errData.non_field_errors) {
          errorMessage = errData.non_field_errors[0];
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated: !!accessToken && !!user,
    login,
    register,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to consume AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
