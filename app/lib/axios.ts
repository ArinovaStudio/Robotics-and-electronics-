import axios from 'axios';
import { useAdminStore } from '@/store/adminStore';

const api = axios.create();

api.interceptors.request.use(
  (config) => {
    const token = useAdminStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;