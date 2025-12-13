/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  minDays: number;
  maxDays: number;
  extraFee: number;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeDeliveryMethod(raw: any): DeliveryMethod {
  return {
    id: String(raw.id || raw._id),
    name: String(raw.name),
    description: String(raw.description),
    minDays: Number(raw.minDays),
    maxDays: Number(raw.maxDays),
    extraFee: Number(raw.extraFee),
    ...(raw.createdAt && { createdAt: String(raw.createdAt) }),
    ...(raw.updatedAt && { updatedAt: String(raw.updatedAt) }),
  };
}

export const deliveryService = {
  /**
   * Get all delivery methods
   */
  getAll: async (): Promise<DeliveryMethod[]> => {
    const response = await apiClient.get(API_ENDPOINTS.DELIVERY_METHODS_GET);
    const data = response.data;
    return Array.isArray(data) ? data.map(normalizeDeliveryMethod) : [];
  },

  /**
   * Get delivery method by id
   */
  getById: async (id: string): Promise<DeliveryMethod> => {
    const endpoint = API_ENDPOINTS.DELIVERY_METHODS_GET_ONE.replace('{id}', id);
    const response = await apiClient.get(endpoint);
    return normalizeDeliveryMethod(response.data);
  },

  /**
   * Create delivery method
   */
  create: async (data: Omit<DeliveryMethod, 'id'>): Promise<DeliveryMethod> => {
    const response = await apiClient.post(API_ENDPOINTS.DELIVERY_METHODS_CREATE, data);
    return normalizeDeliveryMethod(response.data);
  },

  /**
   * Update delivery method
   */
  update: async (id: string, data: Partial<DeliveryMethod>): Promise<DeliveryMethod> => {
    const endpoint = API_ENDPOINTS.DELIVERY_METHODS_UPDATE.replace('{id}', id);
    const response = await apiClient.patch(endpoint, data);
    return normalizeDeliveryMethod(response.data);
  },

  /**
   * Delete delivery method
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.DELIVERY_METHODS_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};
