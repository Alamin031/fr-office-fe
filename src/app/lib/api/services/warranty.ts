import {apiClient} from '../client';
import {
  Warranty,
  ActivateWarrantyRequest,
  WarrantyLookupResponse,
  WarrantyLog,
} from '../types';
import {API_ENDPOINTS} from '../config';

export const warrantyService = {
  /**
   * Activate warranty (Admin/Management only)
   */
  activate: async (data: ActivateWarrantyRequest): Promise<Warranty> => {
    const response = await apiClient.post<Warranty>(
      API_ENDPOINTS.WARRANTY_ACTIVATE,
      data,
    );
    return response.data;
  },

  /**
   * Lookup warranty by IMEI
   */
  lookup: async (imei: string): Promise<WarrantyLookupResponse> => {
    const response = await apiClient.post<WarrantyLookupResponse>(
      API_ENDPOINTS.WARRANTY_LOOKUP,
      {imei},
    );
    return response.data;
  },

  /**
   * Get warranty by ID
   */
  getById: async (id: string): Promise<Warranty> => {
    const endpoint = API_ENDPOINTS.WARRANTY_LOGS.replace('/logs', '').replace(
      '{id}',
      id,
    );
    const response = await apiClient.get<Warranty>(endpoint);
    return response.data;
  },

  /**
   * Get warranty logs (Admin/Management only)
   */
  getLogs: async (
    id: string,
    page = 1,
    limit = 10,
  ): Promise<{data: WarrantyLog[]; pagination: unknown}> => {
    const endpoint = API_ENDPOINTS.WARRANTY_LOGS.replace('{id}', id);
    const response = await apiClient.get<{
      data: WarrantyLog[];
      pagination: unknown;
    }>(endpoint, {
      params: {page, limit},
    });
    return response.data;
  },

  /**
   * Claim warranty
   */
  claim: async (id: string, description: string): Promise<Warranty> => {
    const response = await apiClient.post<Warranty>(
      `/api/warranty/${id}/claim`,
      {description},
    );
    return response.data;
  },

  /**
   * Get user warranties
   */
  getUserWarranties: async (userId: string): Promise<Warranty[]> => {
    const response = await apiClient.get<Warranty[]>(
      `/api/warranty/user/${userId}`,
    );
    return response.data;
  },

  /**
   * Get order warranties
   */
  getOrderWarranties: async (orderId: string): Promise<Warranty[]> => {
    const response = await apiClient.get<Warranty[]>(
      `/api/warranty/order/${orderId}`,
    );
    return response.data;
  },

  /**
   * Add warranty (Admin/Management only)
   */
  add: async (data: Partial<Warranty>): Promise<Warranty> => {
    const response = await apiClient.post<Warranty>(
      API_ENDPOINTS.WARRANTY_ADD,
      data,
    );
    return response.data;
  },

  /**
   * Update warranty (Admin/Management only)
   */
  update: async (id: string, data: Partial<Warranty>): Promise<Warranty> => {
    const endpoint = API_ENDPOINTS.WARRANTY_UPDATE.replace('{id}', id);
    const response = await apiClient.post<Warranty>(endpoint, data);
    return response.data;
  },

  /**
   * Delete warranty (Admin/Management only)
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.WARRANTY_DELETE.replace('{id}', id);
    await apiClient.post(endpoint);
  },
};

export default warrantyService;
