import {apiClient} from '../client';
import {Policy, CreatePolicyRequest, UpdatePolicyRequest} from '../types';
import {API_ENDPOINTS} from '../config';

export const policiesService = {
  create: async (data: CreatePolicyRequest): Promise<Policy> => {
    const response = await apiClient.post<Policy>(
      API_ENDPOINTS.POLICIES_CREATE,
      data,
    );
    return response.data;
  },

  getAll: async (): Promise<{data: Policy[]; pagination: unknown}> => {
    const response = await apiClient.get<{data: Policy[]; pagination: unknown}>(
      API_ENDPOINTS.POLICIES_GET,
    );
    return response.data;
  },

  getById: async (id: string): Promise<Policy> => {
    const endpoint =
      API_ENDPOINTS.POLICIES_GET_ONE?.replace('{id}', id) || `/policies/${id}`;
    const response = await apiClient.get<Policy>(endpoint);
    return response.data;
  },

  getPublished: async (): Promise<Policy[]> => {
    const endpoint = API_ENDPOINTS.POLICIES_PUBLISHED || '/policies/published';
    const response = await apiClient.get<Policy[]>(endpoint);
    return response.data;
  },

  update: async (id: string, data: UpdatePolicyRequest): Promise<Policy> => {
    const endpoint = API_ENDPOINTS.POLICIES_UPDATE.replace('{id}', id);
    const response = await apiClient.patch<Policy>(endpoint, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.POLICIES_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};

export default policiesService;
