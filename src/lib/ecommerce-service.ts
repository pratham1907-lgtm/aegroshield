// ─── Aegroshield E-Commerce Data Service ────────────────────────────────────
// Manages Vendors, Products, Orders, and Vendor Auth using localStorage.

import { VENDORS as SEED_VENDORS, PRODUCTS as SEED_PRODUCTS, type Vendor, type Product, type Category } from './marketplace-data';

export type OrderStatus = 'Pending' | 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  pincode: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'Cash on Delivery (COD)';
  status: OrderStatus;
  createdAt: string;
}

const STORAGE_KEYS = {
  VENDORS: 'aegroshield_vendors',
  PRODUCTS: 'aegroshield_products',
  ORDERS: 'aegroshield_orders',
  CURRENT_VENDOR: 'aegroshield_current_vendor',
};

// Helper to safely get from localStorage
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Helper to safely set in localStorage
function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Initialize seed data if empty
export function initEcommerceStore(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    setStored(STORAGE_KEYS.VENDORS, SEED_VENDORS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStored(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setStored(STORAGE_KEYS.ORDERS, []);
  }
}

// ── VENDOR OPERATIONS ────────────────────────────────────────────────────────
export function getVendors(): Vendor[] {
  initEcommerceStore();
  return getStored<Vendor[]>(STORAGE_KEYS.VENDORS, SEED_VENDORS);
}

export function getVendorById(id: string): Vendor | undefined {
  const vendors = getVendors();
  return vendors.find(v => v.id === id);
}

export function registerVendor(data: Omit<Vendor, 'id' | 'rating' | 'verified'>): Vendor {
  const vendors = getVendors();
  const newVendor: Vendor = {
    ...data,
    id: 'v_' + Date.now(),
    rating: 5.0,
    verified: true,
  };
  vendors.push(newVendor);
  setStored(STORAGE_KEYS.VENDORS, vendors);
  // Auto login
  setCurrentVendor(newVendor);
  return newVendor;
}

export function vendorLogin(phone: string, license: string): Vendor | null {
  const vendors = getVendors();
  const cleanPhone = phone.replace(/\D/g, '');
  const vendor = vendors.find(v => {
    const vPhone = v.phone.replace(/\D/g, '');
    return vPhone.includes(cleanPhone) || v.license.toLowerCase() === license.trim().toLowerCase();
  });
  if (vendor) {
    setCurrentVendor(vendor);
    return vendor;
  }
  return null;
}

export function getCurrentVendor(): Vendor | null {
  return getStored<Vendor | null>(STORAGE_KEYS.CURRENT_VENDOR, null);
}

export function setCurrentVendor(vendor: Vendor | null): void {
  setStored(STORAGE_KEYS.CURRENT_VENDOR, vendor);
}

export function vendorLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_VENDOR);
}

// ── PRODUCT OPERATIONS ───────────────────────────────────────────────────────
export function getProducts(): Product[] {
  initEcommerceStore();
  return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
}

export function getProductsByVendorId(vendorId: string): Product[] {
  const products = getProducts();
  return products.filter(p => p.vendorId === vendorId);
}

export function addProduct(data: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...data,
    id: 'p_' + Date.now(),
  };
  products.unshift(newProduct);
  setStored(STORAGE_KEYS.PRODUCTS, products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    setStored(STORAGE_KEYS.PRODUCTS, products);
    return products[idx];
  }
  return null;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length !== products.length) {
    setStored(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }
  return false;
}

// ── ORDER OPERATIONS ──────────────────────────────────────────────────────────
export function getOrders(): Order[] {
  initEcommerceStore();
  return getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export function getOrdersByVendorId(vendorId: string): Order[] {
  const orders = getOrders();
  return orders.filter(o => o.vendorId === vendorId);
}

export function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...data,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  setStored(STORAGE_KEYS.ORDERS, orders);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setStored(STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  }
  return null;
}
