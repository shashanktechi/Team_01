import apiClient from './apiClient';

export const adminApi = {
  getPendingStores: async () => {
    const response = await apiClient.get('/admin/stores/pending');
    return response.data;
  },
  verifyStore: async (storeId, status) => {
    // status: APPROVED, REJECTED
    const response = await apiClient.put(`/admin/stores/${storeId}/verify`, { status });
    return response.data;
  },
  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  getAllStores: async () => {
    const response = await apiClient.get('/admin/stores');
    return response.data;
  },
  getPendingDeliveryPartners: async () => {
    const response = await apiClient.get('/admin/delivery-partners/pending');
    return response.data;
  },
  verifyDeliveryPartner: async (id, status) => {
    const response = await apiClient.put(`/admin/delivery-partners/${id}/verify`, { status });
    return response.data;
  },
};
