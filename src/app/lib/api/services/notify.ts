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
  userName?: string;
  title?: string;
  message?: string;
  status: string;
  createdAt: Date;
}

export interface CreateProductNotifyRequest {
  productId: string;
  productName: string;
  email?: string;
  phone?: string;
  userId?: string;
  title?: string;
  message?: string;
  status: string;
}

export interface UpdateProductNotifyRequest {
  productName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

// NotificationType enum
export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PROMOTION = 'PROMOTION',
  GIVEAWAY = 'GIVEAWAY',
  SYSTEM = 'SYSTEM',
  PRODUCT_STOCK_OUT = 'PRODUCT_STOCK_OUT',
}

// Notification entity type
export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  title?: string;
  message?: string;
  productId?: string;
  link?: string;
  read?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create notification request type
export interface CreateNotificationRequest {
  userId?: string;
  type: NotificationType;
  title?: string;
  message?: string;
  productId?: string;
  link?: string;
}

// Service
export const notificationService = {
  /**
   * Delete a notification by ID
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },

  /**
   * Resolve a notification by ID
   */
  resolve: async (id: string): Promise<Notification> => {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS_RESOLVE.replace('{id}', id);
    const response = await apiClient.patch(endpoint);
    return response.data;
  },

  /**
   * Fetch all notifications
   */
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS_ALL);
    return response.data;
  },

  /**
   * Fetch unread notifications (all users)
   */
  getUnread: async (): Promise<Notification[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD);
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS_MARK_READ.replace('{id}', id);
    const response = await apiClient.patch(endpoint);
    return response.data;
  },

  /**
   * Create a notification
   */
  create: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_CREATE, data);
    return response.data;
  },

  /**
   * Fetch notifications by userId and/or productId
   * @param params Object with userId and/or productId
   */
  getBy: async (params: { userId?: string; productId?: string }): Promise<Notification[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS_BY, {
      params,
    });
    return response.data;
  },

  /**
   * Fetch notifications for a specific user
   */
  getByUser: async (userId: string): Promise<Notification[]> => {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS_BY_USER.replace('{userId}', userId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Fetch unread notifications for a specific user
   */
  getUserUnread: async (userId: string): Promise<Notification[]> => {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS_USER_UNREAD.replace('{userId}', userId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Fetch notifications for header (summary/quick view)
   */
  getHeader: async (): Promise<Notification[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS_HEADER);
    return response.data;
  },

  /**
   * Create stock out notification
   */
  createStockOut: async (productId: string, userId?: string): Promise<Notification> => {
    const response = await apiClient.post(
      API_ENDPOINTS.NOTIFICATIONS_STOCK_OUT,
      { productId, userId }
    );
    return response.data;
  },
};

export const productNotifyService = {
  // Create notification request for a product (guest or user)
  create: async (productId: string, data: CreateProductNotifyRequest): Promise<ProductNotifyRequest> => {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS_STOCK_OUT.replace('{productId}', productId);
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },
};

export default productNotifyService;
