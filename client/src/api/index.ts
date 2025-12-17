import axios from 'axios';
import { User, Event, Seat, Order, AdminStats, Coupon, CouponValidation, Favorite, CommentsResponse, Comment } from '../types';

// Use environment variable for API URL, with fallback for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = async (username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  const res = await api.post('/api/auth/login', { username, password });
  return res.data;
};

// Feature 1: Registration
export const register = async (username: string, password: string, name: string, email: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  const res = await api.post('/api/auth/register', { username, password, name, email });
  return res.data;
};

// Events
export const getEvents = async (search?: string, category?: string): Promise<Event[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  const res = await api.get(`/api/events?${params.toString()}`);
  return res.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const res = await api.get(`/api/events/${id}`);
  return res.data;
};

// Seats
export const getSeats = async (eventId: string): Promise<Seat[]> => {
  const res = await api.get(`/api/events/${eventId}/seats`);
  return res.data;
};

export const lockSeat = async (seatId: string, userId: string): Promise<{ success: boolean; seat?: Seat; message?: string }> => {
  const res = await api.post(`/api/seats/${seatId}/lock`, { userId });
  return res.data;
};

export const unlockSeat = async (seatId: string, userId: string): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`/api/seats/${seatId}/unlock`, { userId });
  return res.data;
};

// Feature 5: Release expired locks
export const releaseExpiredLocks = async (): Promise<{ success: boolean; releasedCount: number }> => {
  const res = await api.post('/api/seats/release-expired');
  return res.data;
};

// Orders
export const createOrder = async (userId: string, seatIds: string[]): Promise<{ success: boolean; order?: Order; message?: string }> => {
  const res = await api.post('/api/orders', { userId, seatIds });
  return res.data;
};

// Feature 2: Order with coupon
export const createOrderWithCoupon = async (userId: string, seatIds: string[], couponCode?: string): Promise<{ success: boolean; order?: Order; message?: string }> => {
  const res = await api.post('/api/orders/with-coupon', { userId, seatIds, couponCode });
  return res.data;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const res = await api.get(`/api/users/${userId}/orders`);
  return res.data;
};

// Feature 3: Cancel order
export const cancelOrder = async (orderId: string, userId: string): Promise<{ success: boolean; message?: string; refundAmount?: number }> => {
  const res = await api.post(`/api/orders/${orderId}/cancel`, { userId });
  return res.data;
};

// Feature 2: Coupons
export const getCoupons = async (): Promise<Coupon[]> => {
  const res = await api.get('/api/coupons');
  return res.data;
};

export const validateCoupon = async (code: string, totalAmount: number): Promise<{ success: boolean; coupon?: CouponValidation; message?: string }> => {
  const res = await api.post('/api/coupons/validate', { code, totalAmount });
  return res.data;
};

// Feature 4: Favorites
export const addFavorite = async (userId: string, eventId: string): Promise<{ success: boolean; favorite?: Favorite; message?: string }> => {
  const res = await api.post('/api/favorites', { userId, eventId });
  return res.data;
};

export const removeFavorite = async (eventId: string, userId: string): Promise<{ success: boolean; message?: string }> => {
  const res = await api.delete(`/api/favorites/${eventId}`, { data: { userId } });
  return res.data;
};

export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {
  const res = await api.get(`/api/users/${userId}/favorites`);
  return res.data;
};

// Feature 6: Profile management
export const updateProfile = async (userId: string, data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; user?: User; message?: string }> => {
  const res = await api.put(`/api/users/${userId}`, data);
  return res.data;
};

// Feature 7: Comments & Ratings
export const getEventComments = async (eventId: string): Promise<CommentsResponse> => {
  const res = await api.get(`/api/events/${eventId}/comments`);
  return res.data;
};

export const addComment = async (eventId: string, userId: string, rating: number, content: string): Promise<{ success: boolean; comment?: Comment; message?: string }> => {
  const res = await api.post(`/api/events/${eventId}/comments`, { userId, rating, content });
  return res.data;
};

// Admin
export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

export const resetSystem = async (): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post('/api/admin/reset');
  return res.data;
};

export const getAdminOrders = async (): Promise<Order[]> => {
  const res = await api.get('/api/admin/orders');
  return res.data;
};

