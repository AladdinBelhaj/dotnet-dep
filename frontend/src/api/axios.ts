import axios from 'axios';

// In dev, call the local ASP.NET API directly (launchSettings.json uses 5165).
// In Docker (nginx), call the same-origin reverse-proxied API.
export const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5165/api'
  : '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
