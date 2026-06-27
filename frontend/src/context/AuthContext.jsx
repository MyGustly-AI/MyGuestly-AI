import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// API base URL (from environment variables)
const API_URL = process.env.REACT_APP_API_URL || 'https://myguestly-ai.onrender.com/api';

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ----- Login with email/password -----
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // ----- Signup with email/password -----
  const signup = async (userData) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // ----- Google OAuth login (called from useGoogleAuth) -----
  const googleLogin = async (accessToken) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/google`, { accessToken });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // ----- Logout -----
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  };

  // ----- Forgot password -----
  const forgotPassword = async (email) => {
    setError(null);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset request failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // ----- Reset password with token -----
  const resetPassword = async (token, newPassword) => {
    setError(null);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Value object to provide
  const value = {
    user,
    loading,
    error,
    setError,
    login,
    signup,
    googleLogin,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
