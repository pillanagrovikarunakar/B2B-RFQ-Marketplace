import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// Normalize base URL: Ensure it ends with /api if not specified, and trim trailing slashes
let API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL += '/api';
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh Token on 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints themselves
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          if (res.status === 200 && res.data.access) {
            localStorage.setItem('access_token', res.data.access);
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed -> Clear session
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
