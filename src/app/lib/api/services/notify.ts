import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for Product Notification Request
export interface ProductNotifyRequest {
  id: string;
  productId: string;
  productName: string;
  email?: string;
  userId?: string;
  phone?: string;
  status: string;
  createdAt: Date;
}

export interface CreateProductNotifyRequest {
  productId: string;
  productName: string;
  email?: string;
  phone?: string;
  userId?: string;
  status: string;
}

export interface UpdateProductNotifyRequest {
  productName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export const productNotifyService = {
  // Create notification request for a product (guest or user)
  create: async (productId: string, data: CreateProductNotifyRequest): Promise<ProductNotifyRequest> => {
    const endpoint = API_ENDPOINTS.PRODUCT_NOTIFY_CREATE.replace('{productId}', productId);
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  // Get all notification requests for a product
  list: async (productId: string): Promise<ProductNotifyRequest[]> => {
    const endpoint = API_ENDPOINTS.PRODUCT_NOTIFY_LIST.replace('{productId}', productId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Update notification request by id
  update: async (id: string, data: UpdateProductNotifyRequest): Promise<ProductNotifyRequest> => {
    const endpoint = API_ENDPOINTS.PRODUCT_NOTIFY_UPDATE.replace('{id}', id);
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },

  // Get notification request by id
  get: async (id: string): Promise<ProductNotifyRequest> => {
    const endpoint = API_ENDPOINTS.PRODUCT_NOTIFY_GET.replace('{id}', id);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Delete notification request by id
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.PRODUCT_NOTIFY_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};

export default productNotifyService;
