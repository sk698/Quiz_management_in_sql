// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const navigate = useNavigate();

  const login = async (credentials) => {
    // credentials should be { email: '...', password: '...' } or { username: '...', password: '...' }
    const response = await api.post('/user/login', credentials);
    const userData = response.data.data.user;
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Navigate based on role
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const register = async (userData) => {
    // userData: { fullName, email, username, password }
    // The backend login controller doesn't log the user in, so we just navigate to login
    await api.post('/user/register', userData);
    navigate('/login');
  };

  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch (error) {
      console.error("Logout failed, but clearing client state anyway.", error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};