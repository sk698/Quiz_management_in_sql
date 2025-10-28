// src/api/auth.api.js
import axiosInstance from './axios.config';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/user/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/user/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await axiosInstance.post('/user/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const response = await axiosInstance.get('/user/refresh-token');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.post('/user/changePassword', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authAPI;