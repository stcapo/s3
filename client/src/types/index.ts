export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  venue: string;
  date: string;
  time: string;
  image: string;
  category: string;
}

export interface Seat {
  id: string;
  eventId: string;
  row: string;
  col: number;
  seatNumber: string;
  status: 'available' | 'locked' | 'sold';
  price: number;
  lockedBy: string | null;
  lockedAt: string | null;
}

export interface Order {
  id: string;
  userId: string;
  seatIds: string[];
  eventId: string;
  originalPrice?: number;
  discount?: number;
  couponCode?: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  cancelledAt?: string;
  refundAmount?: number;
  event?: Event;
  seats?: Seat[];
}

export interface AdminStats {
  totalSeats: number;
  soldSeats: number;
  lockedSeats: number;
  availableSeats: number;
  totalRevenue: number;
  totalOrders: number;
  eventStats: EventStats[];
  lastUpdated: string;
}

export interface EventStats {
  eventId: string;
  eventName: string;
  totalSeats: number;
  soldSeats: number;
  revenue: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
}

export interface CouponValidation {
  id: string;
  code: string;
  description: string;
  discount: number;
  finalAmount: number;
}

export interface Favorite {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event?: Event;
}

export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface CommentsResponse {
  comments: Comment[];
  averageRating: number;
  totalComments: number;
}

