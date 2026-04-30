import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const axiosInstance = axios.create({ baseURL: BASE_URL });
const GENERIC_ERROR_MESSAGE = 'Something went wrong please try again';

function shouldMaskBackendMessage(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('invalid api key') ||
    /\bsk_(test|live)_[a-z0-9_*]+\b/i.test(message)
  );
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;

    if (Array.isArray(message)) {
      const joined = message.join(', ');
      return shouldMaskBackendMessage(joined) ? GENERIC_ERROR_MESSAGE : joined;
    }

    if (typeof message === 'string' && message.trim()) {
      return shouldMaskBackendMessage(message)
        ? GENERIC_ERROR_MESSAGE
        : message;
    }

    if (typeof err.message === 'string' && err.message.trim()) {
      return shouldMaskBackendMessage(err.message)
        ? GENERIC_ERROR_MESSAGE
        : err.message;
    }
  }

  if (err instanceof Error && err.message.trim()) {
    return shouldMaskBackendMessage(err.message)
      ? GENERIC_ERROR_MESSAGE
      : err.message;
  }

  return GENERIC_ERROR_MESSAGE;
}

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
