// ─── Aegroshield E-Commerce & Multi-Role Service ────────────────────────────
// Manages Vendors, Products, Orders, User & Admin Auth, and Platform Analytics.

import { VENDORS as SEED_VENDORS, PRODUCTS as SEED_PRODUCTS, type Vendor, type Product, type Category } from './marketplace-data';

export type Role = 'user' | 'vendor' | 'admin';
export type OrderStatus = 'Pending' | 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface ExtendedVendor extends Vendor {
  accreditationStatus: 'Verified' | 'Pending' | 'Rejected';
  createdAt?: string;
}

export interface ExtendedProduct extends Product {
  banned?: boolean;
  imageUrl?: string;
}

export interface OrderItem {
  product: ExtendedProduct;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  district?: string;
}

const STORAGE_KEYS = {
  VENDORS: 'aegroshield_vendors',
  PRODUCTS: 'aegroshield_products',
  ORDERS: 'aegroshield_orders',
  USERS: 'aegroshield_users',
  CURRENT_USER: 'aegroshield_current_user',
  CURRENT_VENDOR: 'aegroshield_current_vendor',
  CURRENT_ADMIN: 'aegroshield_current_admin',
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

// Seed Vendors with Accreditation Status
const INITIAL_VENDORS: ExtendedVendor[] = SEED_VENDORS.map((v, i) => ({
  ...v,
  accreditationStatus: i % 4 === 3 ? 'Pending' : 'Verified',
  createdAt: new Date(Date.now() - (i * 86400000 * 3)).toISOString(),
}));

const INITIAL_PRODUCTS: ExtendedProduct[] = SEED_PRODUCTS.map(p => ({
  ...p,
  banned: false,
  imageUrl: '',
}));

// Initialize seed data if empty
export function initEcommerceStore(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    setStored(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setStored(STORAGE_KEYS.ORDERS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStored(STORAGE_KEYS.USERS, [
      { id: 'u_demo', name: 'Demo Farmer', email: 'demo@aegroshield.in', role: 'user', district: 'Meerut' }
    ]);
  }
}

// ── VENDOR OPERATIONS ────────────────────────────────────────────────────────
export function getVendors(): ExtendedVendor[] {
  initEcommerceStore();
  return getStored<ExtendedVendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
}

export function getVendorById(id: string): ExtendedVendor | undefined {
  const vendors = getVendors();
  return vendors.find(v => v.id === id);
}

export function registerVendor(data: Omit<Vendor, 'id' | 'rating' | 'verified'>): ExtendedVendor {
  const vendors = getVendors();
  const newVendor: ExtendedVendor = {
    ...data,
    id: 'v_' + Date.now(),
    rating: 5.0,
    verified: true,
    accreditationStatus: 'Verified',
    createdAt: new Date().toISOString(),
  };
  vendors.unshift(newVendor);
  setStored(STORAGE_KEYS.VENDORS, vendors);
  setCurrentVendor(newVendor);
  return newVendor;
}

export function vendorLogin(phone: string, license: string): ExtendedVendor | null {
  const vendors = getVendors();
  const cleanPhone = phone.replace(/\D/g, '');
  const vendor = vendors.find(v => {
    const vPhone = v.phone.replace(/\D/g, '');
    return (vPhone.length > 5 && vPhone.includes(cleanPhone)) || v.license.toLowerCase() === license.trim().toLowerCase();
  });
  if (vendor) {
    setCurrentVendor(vendor);
    return vendor;
  }
  return null;
}

export function getCurrentVendor(): ExtendedVendor | null {
  return getStored<ExtendedVendor | null>(STORAGE_KEYS.CURRENT_VENDOR, null);
}

export function setCurrentVendor(vendor: ExtendedVendor | null): void {
  setStored(STORAGE_KEYS.CURRENT_VENDOR, vendor);
}

export function vendorLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_VENDOR);
}

export function toggleVendorVerification(vendorId: string): ExtendedVendor | null {
  const vendors = getVendors();
  const idx = vendors.findIndex(v => v.id === vendorId);
  if (idx !== -1) {
    const nextStatus = vendors[idx].accreditationStatus === 'Verified' ? 'Pending' : 'Verified';
    vendors[idx].accreditationStatus = nextStatus;
    vendors[idx].verified = nextStatus === 'Verified';
    setStored(STORAGE_KEYS.VENDORS, vendors);
    return vendors[idx];
  }
  return null;
}

// ── PRODUCT OPERATIONS ───────────────────────────────────────────────────────
export function getProducts(): ExtendedProduct[] {
  initEcommerceStore();
  return getStored<ExtendedProduct[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function getActiveProducts(): ExtendedProduct[] {
  return getProducts().filter(p => !p.banned);
}

export function getProductsByVendorId(vendorId: string): ExtendedProduct[] {
  const products = getProducts();
  return products.filter(p => p.vendorId === vendorId);
}

export function addProduct(data: Omit<ExtendedProduct, 'id'>): ExtendedProduct {
  const products = getProducts();
  const newProduct: ExtendedProduct = {
    ...data,
    id: 'p_' + Date.now(),
    banned: false,
  };
  products.unshift(newProduct);
  setStored(STORAGE_KEYS.PRODUCTS, products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<ExtendedProduct>): ExtendedProduct | null {
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

export function toggleProductBanned(id: string): ExtendedProduct | null {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx].banned = !products[idx].banned;
    setStored(STORAGE_KEYS.PRODUCTS, products);
    return products[idx];
  }
  return null;
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

// ── USER AUTH OPERATIONS ─────────────────────────────────────────────────────
export function userRegister(name: string, email: string): UserProfile {
  const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
  const newUser: UserProfile = {
    id: 'u_' + Date.now(),
    name,
    email,
    role: 'user',
  };
  users.push(newUser);
  setStored(STORAGE_KEYS.USERS, users);
  setStored(STORAGE_KEYS.CURRENT_USER, newUser);
  return newUser;
}

export function userLogin(email: string): UserProfile {
  const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = userRegister(email.split('@')[0], email);
  } else {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  }
  return user;
}

export function getCurrentUser(): UserProfile | null {
  return getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function userLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ── ADMIN AUTH & ANALYTICS ──────────────────────────────────────────────────
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export function adminLogin(email: string, pass: string): AdminProfile | null {
  if (email.toLowerCase().includes('admin') || pass === 'AdminPass@123') {
    const admin: AdminProfile = {
      id: 'admin_master',
      name: 'Platform Administrator',
      email: email || 'admin@aegroshield.in',
      role: 'admin',
    };
    setStored(STORAGE_KEYS.CURRENT_ADMIN, admin);
    return admin;
  }
  return null;
}

export function getCurrentAdmin(): AdminProfile | null {
  return getStored<AdminProfile | null>(STORAGE_KEYS.CURRENT_ADMIN, null);
}

export function adminLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
}

export function getPlatformAnalytics() {
  const vendors = getVendors();
  const products = getProducts();
  const orders = getOrders();

  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeDealers = vendors.filter(v => v.accreditationStatus === 'Verified').length;
  const pendingDealers = vendors.filter(v => v.accreditationStatus === 'Pending').length;
  const bannedProductsCount = products.filter(p => p.banned).length;

  return {
    totalFarmers: 50420 + orders.length,
    registeredDealers: vendors.length,
    activeDealers,
    pendingDealers,
    totalProducts: products.length,
    bannedProductsCount,
    totalOrders: orders.length,
    totalGMV,
  };
}
