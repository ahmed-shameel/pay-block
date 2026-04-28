import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const axiosInstance = axios.create({ baseURL: BASE_URL });

// Attach stored JWT to every request
axiosInstance.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('pb_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  get: async <T>(url: string): Promise<T> => {
    const { data } = await axiosInstance.get<T>(url);
    return data;
  },
  post: async <T>(url: string, body?: unknown): Promise<T> => {
    const { data } = await axiosInstance.post<T>(url, body);
    return data;
  },
};
