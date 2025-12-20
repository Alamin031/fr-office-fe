/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../client"
import {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderInvoiceResponse,
  CalculateEMIRequest,
  CalculateEMIResponse,
} from "../types"
import { API_ENDPOINTS } from "../config"

export const ordersService = {
  /**
   * Create a new order
   */
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>(API_ENDPOINTS.ORDERS_CREATE, data)
    return response.data
  },

  /**
   * Get all orders (Admin/Management only)
   */
  getAll: async (page = 1, limit = 20): Promise<{ data: Order[]; pagination: unknown }> => {
    const response = await apiClient.get<{ data: Order[]; pagination: unknown }>(API_ENDPOINTS.ORDERS_GET, {
      params: { page, limit },
    })
    return response.data
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const endpoint = API_ENDPOINTS.ORDERS_GET_ONE.replace("{id}", id)
    const response = await apiClient.get<Order>(endpoint)
    return response.data
  },

  /**
   * Update order status (Admin/Management only)
   */
  updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<Order> => {
    const endpoint = API_ENDPOINTS.ORDERS_UPDATE_STATUS.replace("{id}", id)
    const response = await apiClient.patch<Order>(endpoint, data)
    return response.data
  },

  /**
   * Get order tracking info by order number
   */
  getByOrderNumber: async (orderNumber: string): Promise<Order> => {
    const endpoint = API_ENDPOINTS.ORDERS_TRACKING.replace("{orderNumber}", orderNumber);
    const response = await apiClient.get<Order>(endpoint);
    return response.data;
  },

  /**
   * Cancel order
   */
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const endpoint = `/orders/${id}/cancel`
    const response = await apiClient.post<Order>(endpoint, { reason })
    return response.data
  },

  /**
   * Generate invoice for order
   */
  generateInvoice: async (id: string): Promise<any> => {
    const endpoint = API_ENDPOINTS.ORDERS_INVOICE.replace("{id}", id)
    const response = await apiClient.get<any>(endpoint)
    return response.data
  },

  /**
   * Calculate EMI for amount
   */
  calculateEMI: async (data: CalculateEMIRequest): Promise<CalculateEMIResponse> => {
    const response = await apiClient.post<CalculateEMIResponse>(API_ENDPOINTS.ORDERS_CALCULATE_EMI, data)
    return response.data
  },

  /**
   * Track order (new backend endpoint)
   */
  track: async (id: string): Promise<any> => {
    const endpoint = API_ENDPOINTS.ORDERS_GET_ONE.replace("{id}", id);
    const response = await apiClient.get(endpoint);

    // Return full order data for detail page
    const data = response.data;
    return {
      id: data.id,
      orderNumber: data.orderNumber,
      status: data.status,
      paymentStatus: data.paymentStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      // Customer/Shipping address
      customer: data.customer,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      division: data.division,
      district: data.district,
      upzila: data.upzila,
      postCode: data.postCode,
      address: data.address,
      shippingAddress: data.shippingAddress,

      // Payment info
      paymentMethod: data.paymentMethod,
      deliveryMethod: data.deliveryMethod,
      subtotal: data.subtotal,
      discount: data.discount,
      total: data.total,
      paymentSummary: data.paymentSummary,

      // Items
      orderItems: data.orderItems,
      items: data.items,

      // Timeline/tracking
      timeline: data.timeline,
      statusHistory: data.statusHistory,
      estimatedDelivery: data.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      trackingNumber: data.trackingNumber || data.orderNumber,
      carrier: data.carrier || "Standard Delivery",
    };
  },
}

export default ordersService
