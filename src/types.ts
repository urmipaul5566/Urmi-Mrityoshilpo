/**
 * Shared Type Definitions for উর্মি মৃৎশিল্প (Urmi Mrityoshilpo)
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  division?: string;
  district?: string;
  address?: string;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  category: string;
  subCategory?: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  stock: number;
  SKU: string;
  weight: string;
  size: string;
  color: string;
  material: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  images: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  reply?: string;
  date: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  nameBangla: string;
  nameEnglish: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  division: string;
  district: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  couponDiscount: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  trackingNumber: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface SliderItem {
  id: string;
  titleBangla: string;
  titleEnglish: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  gridArea: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
