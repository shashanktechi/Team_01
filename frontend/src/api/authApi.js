import apiClient from './apiClient';

export const authApi = {

  register: async (registerData) => {
    // registerData contains: phone, email, password, name, role (CUSTOMER, STORE_ADMIN, DELIVERY_PARTNER, SYSTEM_ADMIN)
    // plus storeName, storeAddress, storeLat, storeLng if STORE_ADMIN
    const response = await apiClient.post('/auth/register', registerData);
    return response.data;
  },
  login: async (loginData) => {
    // loginData contains: phone/email, password/otp
    const response = await apiClient.post('/auth/login', loginData);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  verifyResetOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
  },
  resetPassword: async (email, resetToken, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { email, resetToken, newPassword });
    return response.data;
  },

};