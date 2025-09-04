import axios from 'axios';

const Api = axios.create({
  baseURL: '/api',  // Usar el proxy de Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Api;
