import axiosClient from './axiosClient';

/**
 * Service encapsulating all Authentication API calls.
 */
export const authService = {
  // Login user with email & password
  async login(email, password) {
    const response = await axiosClient.post('/auth/login/', { email, password });
    return response.data;
  },

  // Register new user (BUYER or SUPPLIER)
  async register({ name, email, password, role }) {
    const response = await axiosClient.post('/auth/register/', {
      name,
      email,
      password,
      role,
    });
    return response.data;
  },

  // Fetch current authenticated user details
  async getCurrentUser() {
    const response = await axiosClient.get('/auth/me/');
    return response.data;
  },

  // Refresh JWT Access Token
  async refreshToken(refresh) {
    const response = await axiosClient.post('/auth/refresh/', { refresh });
    return response.data;
  },
};

export default authService;
