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
    const response = await apiClient.get(API_ENDPOINTS.POLICIES_GET);
    let policies: Policy[] = [];
    let pagination: unknown = undefined;

    if (Array.isArray(response.data)) {
      // API returns array directly
      policies = response.data;
    } else if (Array.isArray(response.data?.data)) {
      // API returns { data: [...] }
      policies = response.data.data;
      pagination = response.data.pagination;
    }

    // Ensure orderIndex is always a number
    const normalized = policies.map(p => ({
      ...p,
      orderIndex: typeof p.orderIndex === 'number' ? p.orderIndex : 0,
    }));

    return {data: normalized, pagination};
  },

  getById: async (id: string): Promise<Policy> => {
    const endpoint =
      API_ENDPOINTS.POLICIES_GET_ONE?.replace('{id}', id) || `/policies/${id}`;
    const response = await apiClient.get<Policy>(endpoint);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Policy> => {
    const endpoint =
      API_ENDPOINTS.POLICIES_GET_BY_SLUG?.replace('{slug}', slug) ||
      `/policies/slug/${slug}`;
    const response = await apiClient.get<Policy>(endpoint);
    return response.data;
  },

  update: async (id: string, data: UpdatePolicyRequest): Promise<Policy> => {
    const endpoint = API_ENDPOINTS.POLICIES_UPDATE.replace('{id}', id);
    const response = await apiClient.patch<Policy>(endpoint, data);
    return {
      ...response.data,
      orderIndex:
        typeof response.data.orderIndex === 'number'
          ? response.data.orderIndex
          : 0,
    };
  },

  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.POLICIES_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};

export default policiesService;
