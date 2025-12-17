import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface Flashsell {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  products: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashsellRequest {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  products: string[];
}

export interface UpdateFlashsellRequest {
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  products?: string[];
}

export const flashsellService = {
  create: async (data: CreateFlashsellRequest): Promise<Flashsell> => {
    const response = await apiClient.post<Flashsell>(API_ENDPOINTS.FLASHSELL_CREATE, data);
    return response.data;
  },
  findAll: async (): Promise<Flashsell[]> => {
    const response = await apiClient.get<Flashsell[]>(API_ENDPOINTS.FLASHSELL_GET_ALL);
    return response.data;
  },
  findOne: async (id: string): Promise<Flashsell> => {
    const endpoint = API_ENDPOINTS.FLASHSELL_GET_ONE.replace("{id}", id);
    const response = await apiClient.get<Flashsell>(endpoint);
    return response.data;
  },
  update: async (id: string, data: UpdateFlashsellRequest): Promise<Flashsell> => {
    const endpoint = API_ENDPOINTS.FLASHSELL_UPDATE.replace("{id}", id);
    const response = await apiClient.patch<Flashsell>(endpoint, data);
    return response.data;
  },
  remove: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.FLASHSELL_DELETE.replace("{id}", id);
    await apiClient.delete(endpoint);
  },
};

export default flashsellService;
