import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = 'https://dce-server.vercel.app';

export const userAPI = {
  createUser: (userData) => {
    return axios.post(`${API_BASE_URL}/users`, userData);
  },

  getUser: (email) => {
    return axios.get(`${API_BASE_URL}/users/${email}`);
  },

  updateUser: (email, userData) => {
    return axios.put(`${API_BASE_URL}/users/${email}`, userData);
  }
};