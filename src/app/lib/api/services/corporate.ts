import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';


export interface CorporateDeal {
  id?: string | number;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  message?: string;
  status: string; // e.g., new, contacted, closed
  createdAt: Date;
}

export interface CreateCorporateDealRequest {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  message?: string;
}

export const corporateDealService = {
  /**
   * Get all corporate deals
   */
  getAll: async (): Promise<CorporateDeal[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CORPORATE_DEALS_GET);
    return response.data;
  },

  /**
   * Create a new corporate deal
   */
  create: async (data: CreateCorporateDealRequest): Promise<CorporateDeal> => {
    const response = await apiClient.post(API_ENDPOINTS.CORPORATE_DEALS_CREATE, data);
    return response.data;
  },

  /**
   * Get a corporate deal by ID
   */
  getById: async (id: string): Promise<CorporateDeal> => {
    const url = API_ENDPOINTS.CORPORATE_DEALS_GET_ONE.replace('{id}', id);
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Delete a corporate deal by ID
   */
  delete: async (id: string): Promise<void> => {
    const url = API_ENDPOINTS.CORPORATE_DEALS_DELETE.replace('{id}', id);
    await apiClient.delete(url);
  },
};

export default corporateDealService;
