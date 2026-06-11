// Centralized TypeScript domain models for Zestigo.

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  categoryIds: string[];
  rating: number;
  reviews: number;
  deliveryTime: number; // minutes
  deliveryFee: number;
  distance: number; // km
  priceRange: "₹" | "₹₹" | "₹₹₹";
  image: string;
  banner: string;
  address: string;
  promoted: boolean;
  description: string;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  popular: boolean;
  veg: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
}

export type OrderStatus = "placed" | "preparing" | "on-the-way" | "delivered";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  restaurantName: string;
  address: string;
}

export interface Address {
  id: string;
  label: string;
  line: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  label: string;
}

export interface Testimonial {
  name: string;
  text: string;
  role: string;
}

export interface Faq {
  q: string;
  a: string;
}
