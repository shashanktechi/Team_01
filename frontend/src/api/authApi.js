import apiClient from './apiClient';

export const authApi = {
  sendOtp: async (target) => {
    const payload = target.includes('@') ? { email: target } : { phone: target };
    const response = await apiClient.post('/auth/otp/send', payload);
    return response.data;
  },
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
};
