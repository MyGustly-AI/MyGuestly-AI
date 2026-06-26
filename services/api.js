// src/services/api.js
import axios from 'axios';

// Use environment variable for the base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://myguestly-ai.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 503 specifically
    if (error.response?.status === 503) {
      console.error('API is currently unavailable. Please try again later.');
      // You could show a user-friendly notification here
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API Service Methods
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
};

export const guestService = {
  getAll: (eventId) => api.get(`/events/${eventId}/guests`),
  add: (eventId, guestData) => api.post(`/events/${eventId}/guests`, guestData),
  update: (eventId, guestId, guestData) => api.put(`/events/${eventId}/guests/${guestId}`, guestData),
  delete: (eventId, guestId) => api.delete(`/events/${eventId}/guests/${guestId}`),
};

export const invitationService = {
  send: (eventId, guestIds) => api.post(`/events/${eventId}/invitations`, { guestIds }),
  resend: (eventId, invitationId) => api.post(`/events/${eventId}/invitations/${invitationId}/resend`),
};

export const galleryService = {
  getAll: (eventId) => api.get(`/events/${eventId}/gallery`),
  upload: (eventId, formData) => api.post(`/events/${eventId}/gallery`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (eventId, imageId) => api.delete(`/events/${eventId}/gallery/${imageId}`),
};

export default api;
