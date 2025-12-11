/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface BlogPost {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  publishedAt?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogRequest {
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  status?: 'draft' | 'published';
  tags?: string[];
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {}

export interface BlogListResponse {
  data: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}

const blogsService = {
  // Get all blogs with pagination and filters
  getAll: async (filters?: any, page: number = 1, pageSize: number = 20): Promise<BlogListResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.status && { status: filters.status }),
      });

      const response = await apiClient.get(`/blogs?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get single blog by ID
  getById: async (id: string): Promise<BlogPost> => {
    try {
      const response = await apiClient.get(`/blogs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  },

  // Get blog by slug
  getBySlug: async (slug: string): Promise<BlogPost> => {
    try {
      const response = await apiClient.get(`/blogs/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blog by slug:', error);
      throw error;
    }
  },

  // Create new blog
  create: async (data: CreateBlogRequest): Promise<BlogPost> => {
    try {
      const response = await apiClient.post(`/blogs`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update blog
  update: async (id: string, data: UpdateBlogRequest): Promise<BlogPost> => {
    try {
      const response = await apiClient.put(`/blogs/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Delete blog
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/blogs/${id}`);
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Get blogs by category
  getByCategory: async (category: string, page: number = 1, pageSize: number = 20): Promise<BlogListResponse> => {
    try {
      const response = await apiClient.get(`/blogs?category=${category}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching blogs by category:', error);
      throw error;
    }
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get(`/blogs/categories`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default blogsService;
