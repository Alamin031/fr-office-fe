import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for Product Care Plan
export interface ProductCarePlan {
  id: string;
  productId: string;
  categoryId?: string;
  planName: string;
  price: number;
  duration?: string;
  description?: string;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductCarePlanRequest {
  productId: string;
  categoryId?: string;
  planName: string;
  price: number;
  duration?: string;
  description?: string;
  features?: string[];
}

export interface UpdateProductCarePlanRequest {
  planName?: string;
  price?: number;
  duration?: string;
  description?: string;
  categoryId?: string;
  features?: string[];
}

export const careService = {
  // Create a care plan for a product
  create: async (productId: string, data: CreateProductCarePlanRequest): Promise<ProductCarePlan> => {
    const endpoint = API_ENDPOINTS.PRODUCT_CARE_CREATE.replace('{productId}', productId);
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  // Get all care plans for a product
  list: async (productId: string): Promise<ProductCarePlan[]> => {
    const endpoint = API_ENDPOINTS.PRODUCT_CARE_LIST.replace('{productId}', productId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Update a care plan by id
  update: async (id: string, data: UpdateProductCarePlanRequest): Promise<ProductCarePlan> => {
    const endpoint = API_ENDPOINTS.PRODUCT_CARE_UPDATE.replace('{id}', id);
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },

  // Get a care plan by id
  get: async (id: string): Promise<ProductCarePlan> => {
    const endpoint = API_ENDPOINTS.PRODUCT_CARE_GET.replace('{id}', id);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Delete a care plan by id
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.PRODUCT_CARE_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};

export default careService;
