// src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  // Your backend's base URL
  baseURL: 'http://localhost:8000/api/v1',
  
  // This is crucial for sending/receiving cookies
  withCredentials: true,
});

export default api;