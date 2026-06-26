// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'https://myguestly-ai.onrender.com/api';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      // Set default auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async ({ email, password }) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUser(user);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 503) {
        setError('The server is currently unavailable. Please try again later.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      throw err;
    }
  };

  // Signup function
  const signup = async (userData) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUser(user);
      return user;
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response?.status === 503) {
        setError('The server is currently unavailable. Please try again later.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err.response?.status === 503) {
        setError('The server is currently unavailable. Please try again later.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
      return response.data;
    } catch (err) {
      console.error('Reset password error:', err);
      
      if (err.response?.status === 503) {
        setError('The server is currently unavailable. Please try again later.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    error,
    setError,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
