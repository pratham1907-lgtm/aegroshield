// ─── Aegroshield E-Commerce & Multi-Role Service ────────────────────────────
// Manages Vendors, Products, Orders, Machinery, Labour, Mandi Rates, User & Admin Auth, and Platform Analytics.
// SEPARATES Demo Mode (sample evaluation data) from Real Account Mode (isolated clean database storage).

import {
  MOCK_VENDORS, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_MACHINERY, MOCK_LABOUR, MOCK_MARKET_PRICES,
  type MockMachinery, type MockLabour, type MockMarketPrice
} from './mockData';
import type { Category, Vendor, Product } from './marketplace-data';

export type Role = 'user' | 'vendor' | 'admin';
export type OrderStatus = 'Pending' | 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface ExtendedVendor extends Vendor {
  accreditationStatus: 'Verified' | 'Pending' | 'Rejected';
  createdAt?: string;
  isDemo?: boolean;
}

export interface ExtendedProduct extends Product {
  banned?: boolean;
  imageUrl?: string;
  isDemo?: boolean;
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
  isDemo?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  district?: string;
  isDemo?: boolean;
}

const KEYS = {
  IS_DEMO: 'aegroshield_is_demo_mode',
  
  // Real Account Collections (Clean DB)
  REAL_VENDORS: 'aegroshield_real_vendors',
  REAL_PRODUCTS: 'aegroshield_real_products',
  REAL_ORDERS: 'aegroshield_real_orders',
  REAL_USERS: 'aegroshield_real_users',
  REAL_MACHINERY: 'aegroshield_real_machinery',
  REAL_LABOUR: 'aegroshield_real_labour',
  REAL_MARKET_PRICES: 'aegroshield_real_market_prices',

  // Demo Collections (Sample Evaluation DB)
  DEMO_VENDORS: 'aegroshield_demo_vendors',
  DEMO_PRODUCTS: 'aegroshield_demo_products',
  DEMO_ORDERS: 'aegroshield_demo_orders',
  DEMO_MACHINERY: 'aegroshield_demo_machinery',
  DEMO_LABOUR: 'aegroshield_demo_labour',

  // Sessions
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

// ── DEMO MODE CONTROLS ───────────────────────────────────────────────────────
export function isDemoMode(): boolean {
  return getStored<boolean>(KEYS.IS_DEMO, false);
}

export function isDemoSessionActive(): boolean {
  if (!isDemoMode()) return false;
  const user = getCurrentUser();
  const vendor = getCurrentVendor();
  const admin = getCurrentAdmin();
  return !!(user || vendor || admin);
}

export function enableDemoMode(forceReset = false): void {
  setStored(KEYS.IS_DEMO, true);
  initDemoStore(forceReset);
}

export function disableDemoMode(): void {
  setStored(KEYS.IS_DEMO, false);
}

export function initDemoStore(forceReset = false): void {
  if (typeof window === 'undefined') return;
  if (forceReset || !localStorage.getItem(KEYS.DEMO_VENDORS)) {
    setStored(KEYS.DEMO_VENDORS, MOCK_VENDORS);
  }
  if (forceReset || !localStorage.getItem(KEYS.DEMO_PRODUCTS)) {
    setStored(KEYS.DEMO_PRODUCTS, MOCK_PRODUCTS);
  }
  if (forceReset || !localStorage.getItem(KEYS.DEMO_ORDERS)) {
    setStored(KEYS.DEMO_ORDERS, MOCK_ORDERS);
  }
  if (forceReset || !localStorage.getItem(KEYS.DEMO_MACHINERY)) {
    setStored(KEYS.DEMO_MACHINERY, MOCK_MACHINERY);
  }
  if (forceReset || !localStorage.getItem(KEYS.DEMO_LABOUR)) {
    setStored(KEYS.DEMO_LABOUR, MOCK_LABOUR);
  }
}

function getVendorsKey(): string {
  return isDemoMode() ? KEYS.DEMO_VENDORS : KEYS.REAL_VENDORS;
}

function getProductsKey(): string {
  return isDemoMode() ? KEYS.DEMO_PRODUCTS : KEYS.REAL_PRODUCTS;
}

function getOrdersKey(): string {
  return isDemoMode() ? KEYS.DEMO_ORDERS : KEYS.REAL_ORDERS;
}

// ── VENDOR OPERATIONS ────────────────────────────────────────────────────────
export function getVendors(): ExtendedVendor[] {
  if (isDemoMode()) {
    initDemoStore();
    return getStored<ExtendedVendor[]>(KEYS.DEMO_VENDORS, MOCK_VENDORS);
  }
  return getStored<ExtendedVendor[]>(KEYS.REAL_VENDORS, []);
}

export function getVendorById(id: string): ExtendedVendor | undefined {
  const vendors = getVendors();
  return vendors.find(v => v.id === id);
}

export function registerVendor(data: Omit<Vendor, 'id' | 'rating' | 'verified'>): ExtendedVendor {
  disableDemoMode(); // Real registration creates a real account in real collection!
  const vendors = getStored<ExtendedVendor[]>(KEYS.REAL_VENDORS, []);
  const newVendor: ExtendedVendor = {
    ...data,
    id: 'real_v_' + Date.now(),
    rating: 5.0,
    verified: true,
    accreditationStatus: 'Verified',
    createdAt: new Date().toISOString(),
    isDemo: false,
  };
  vendors.unshift(newVendor);
  setStored(KEYS.REAL_VENDORS, vendors);
  setCurrentVendor(newVendor);
  return newVendor;
}

export function vendorLogin(phone: string, license: string, isDemoCall = false): ExtendedVendor | null {
  if (isDemoCall) {
    enableDemoMode(true);
    const demoVendor = MOCK_VENDORS[0]; // Kisan Seva Kendra
    setCurrentVendor(demoVendor);
    return demoVendor;
  }

  disableDemoMode(); // Standard login operates on real DB
  const vendors = getStored<ExtendedVendor[]>(KEYS.REAL_VENDORS, []);
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
  return getStored<ExtendedVendor | null>(KEYS.CURRENT_VENDOR, null);
}

export function setCurrentVendor(vendor: ExtendedVendor | null): void {
  setStored(KEYS.CURRENT_VENDOR, vendor);
}

export function vendorLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.CURRENT_VENDOR);
  disableDemoMode();
}

export function toggleVendorVerification(vendorId: string): ExtendedVendor | null {
  const key = getVendorsKey();
  const vendors = getStored<ExtendedVendor[]>(key, isDemoMode() ? MOCK_VENDORS : []);
  const idx = vendors.findIndex(v => v.id === vendorId);
  if (idx !== -1) {
    const nextStatus = vendors[idx].accreditationStatus === 'Verified' ? 'Pending' : 'Verified';
    vendors[idx].accreditationStatus = nextStatus;
    vendors[idx].verified = nextStatus === 'Verified';
    setStored(key, vendors);
    return vendors[idx];
  }
  return null;
}

// ── PRODUCT OPERATIONS ───────────────────────────────────────────────────────
export function getProducts(): ExtendedProduct[] {
  if (isDemoMode()) {
    initDemoStore();
    return getStored<ExtendedProduct[]>(KEYS.DEMO_PRODUCTS, MOCK_PRODUCTS);
  }
  return getStored<ExtendedProduct[]>(KEYS.REAL_PRODUCTS, []);
}

export function getActiveProducts(): ExtendedProduct[] {
  return getProducts().filter(p => !p.banned);
}

export function getProductsByVendorId(vendorId: string): ExtendedProduct[] {
  const products = getProducts();
  return products.filter(p => p.vendorId === vendorId);
}

export function addProduct(data: Omit<ExtendedProduct, 'id'>): ExtendedProduct {
  const key = getProductsKey();
  const products = getStored<ExtendedProduct[]>(key, []);
  const newProduct: ExtendedProduct = {
    ...data,
    id: 'p_' + Date.now(),
    banned: false,
    isDemo: isDemoMode(),
  };
  products.unshift(newProduct);
  setStored(key, products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<ExtendedProduct>): ExtendedProduct | null {
  const key = getProductsKey();
  const products = getStored<ExtendedProduct[]>(key, isDemoMode() ? MOCK_PRODUCTS : []);
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    setStored(key, products);
    return products[idx];
  }
  return null;
}

export function deleteProduct(id: string): boolean {
  const key = getProductsKey();
  const products = getStored<ExtendedProduct[]>(key, isDemoMode() ? MOCK_PRODUCTS : []);
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length !== products.length) {
    setStored(key, filtered);
    return true;
  }
  return false;
}

export function toggleProductBanned(id: string): ExtendedProduct | null {
  const key = getProductsKey();
  const products = getStored<ExtendedProduct[]>(key, isDemoMode() ? MOCK_PRODUCTS : []);
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx].banned = !products[idx].banned;
    setStored(key, products);
    return products[idx];
  }
  return null;
}

// ── ORDER OPERATIONS ──────────────────────────────────────────────────────────
export function getOrders(): Order[] {
  if (isDemoMode()) {
    initDemoStore();
    return getStored<Order[]>(KEYS.DEMO_ORDERS, MOCK_ORDERS);
  }
  return getStored<Order[]>(KEYS.REAL_ORDERS, []);
}

export function getOrdersByVendorId(vendorId: string): Order[] {
  const orders = getOrders();
  return orders.filter(o => o.vendorId === vendorId);
}

export function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
  const key = getOrdersKey();
  const orders = getStored<Order[]>(key, []);
  const newOrder: Order = {
    ...data,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    isDemo: isDemoMode(),
  };
  orders.unshift(newOrder);
  setStored(key, orders);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const key = getOrdersKey();
  const orders = getStored<Order[]>(key, isDemoMode() ? MOCK_ORDERS : []);
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setStored(key, orders);
    return orders[idx];
  }
  return null;
}

// ── MACHINERY OPERATIONS ─────────────────────────────────────────────────────
export function getMachineryListings(): MockMachinery[] {
  if (isDemoMode()) {
    initDemoStore();
    return getStored<MockMachinery[]>(KEYS.DEMO_MACHINERY, MOCK_MACHINERY);
  }
  return getStored<MockMachinery[]>(KEYS.REAL_MACHINERY, []);
}

export function addMachineryListing(data: Omit<MockMachinery, 'id' | 'isDemo'>): MockMachinery {
  const key = isDemoMode() ? KEYS.DEMO_MACHINERY : KEYS.REAL_MACHINERY;
  const list = getStored<MockMachinery[]>(key, []);
  const newMachinery: MockMachinery = {
    ...data,
    id: 'mach_' + Date.now(),
    isDemo: isDemoMode(),
  };
  list.unshift(newMachinery);
  setStored(key, list);
  return newMachinery;
}

export function toggleMachineryAvailability(id: string): MockMachinery | null {
  const isDemo = isDemoMode();
  const key = isDemo ? KEYS.DEMO_MACHINERY : KEYS.REAL_MACHINERY;
  const list = getStored<MockMachinery[]>(key, isDemo ? MOCK_MACHINERY : []);
  const idx = list.findIndex(m => m.id === id);
  if (idx !== -1) {
    list[idx].available = !list[idx].available;
    setStored(key, list);
    return list[idx];
  }
  return null;
}

// ── LABOUR OPERATIONS ────────────────────────────────────────────────────────
export function getLabourListings(): MockLabour[] {
  if (isDemoMode()) {
    initDemoStore();
    return getStored<MockLabour[]>(KEYS.DEMO_LABOUR, MOCK_LABOUR);
  }
  return getStored<MockLabour[]>(KEYS.REAL_LABOUR, []);
}

export function addLabourListing(data: Omit<MockLabour, 'id' | 'isDemo'>): MockLabour {
  const key = isDemoMode() ? KEYS.DEMO_LABOUR : KEYS.REAL_LABOUR;
  const list = getStored<MockLabour[]>(key, []);
  const newLabour: MockLabour = {
    ...data,
    id: 'lab_' + Date.now(),
    isDemo: isDemoMode(),
  };
  list.unshift(newLabour);
  setStored(key, list);
  return newLabour;
}

export function toggleLabourAvailability(id: string): MockLabour | null {
  const isDemo = isDemoMode();
  const key = isDemo ? KEYS.DEMO_LABOUR : KEYS.REAL_LABOUR;
  const list = getStored<MockLabour[]>(key, isDemo ? MOCK_LABOUR : []);
  const idx = list.findIndex(l => l.id === id);
  if (idx !== -1) {
    list[idx].available = !list[idx].available;
    setStored(key, list);
    return list[idx];
  }
  return null;
}

// ── MARKET PRICES OPERATIONS ─────────────────────────────────────────────────
export function getMarketPrices(): MockMarketPrice[] {
  if (isDemoMode()) {
    return MOCK_MARKET_PRICES;
  }
  return getStored<MockMarketPrice[]>(KEYS.REAL_MARKET_PRICES, []);
}

// ── USER AUTH OPERATIONS ─────────────────────────────────────────────────────
export function userRegister(name: string, email: string): UserProfile {
  disableDemoMode();
  const users = getStored<UserProfile[]>(KEYS.REAL_USERS, []);
  const newUser: UserProfile = {
    id: 'real_u_' + Date.now(),
    name,
    email,
    role: 'user',
    isDemo: false,
  };
  users.push(newUser);
  setStored(KEYS.REAL_USERS, users);
  setStored(KEYS.CURRENT_USER, newUser);
  return newUser;
}

export function userLogin(email: string, isDemoCall = false): UserProfile {
  if (isDemoCall) {
    enableDemoMode(true);
    const demoUser: UserProfile = {
      id: 'u_demo',
      name: 'Demo Farmer',
      email: 'demo@aegroshield.in',
      role: 'user',
      district: 'Meerut',
      isDemo: true,
    };
    setStored(KEYS.CURRENT_USER, demoUser);
    return demoUser;
  }

  disableDemoMode(); // Real user sign in
  const users = getStored<UserProfile[]>(KEYS.REAL_USERS, []);
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = userRegister(email.split('@')[0], email);
  } else {
    setStored(KEYS.CURRENT_USER, user);
  }
  return user;
}

export function getCurrentUser(): UserProfile | null {
  return getStored<UserProfile | null>(KEYS.CURRENT_USER, null);
}

export function userLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.CURRENT_USER);
  disableDemoMode();
}

// ── ADMIN AUTH & ANALYTICS ──────────────────────────────────────────────────
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  isDemo?: boolean;
}

export function adminLogin(email: string, pass: string, isDemoCall = false): AdminProfile | null {
  if (isDemoCall) {
    enableDemoMode(true);
  } else {
    disableDemoMode();
  }
  
  const admin: AdminProfile = {
    id: 'admin_master',
    name: 'Platform Administrator',
    email: email || 'admin@aegroshield.in',
    role: 'admin',
    isDemo: isDemoMode(),
  };
  setStored(KEYS.CURRENT_ADMIN, admin);
  return admin;
}

export function getCurrentAdmin(): AdminProfile | null {
  return getStored<AdminProfile | null>(KEYS.CURRENT_ADMIN, null);
}

export function adminLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.CURRENT_ADMIN);
  disableDemoMode();
}

export function getPlatformAnalytics() {
  if (isDemoMode()) {
    initDemoStore(false);
  }
  const vendors = getVendors();
  const products = getProducts();
  const orders = getOrders();
  const machinery = getMachineryListings();
  const labour = getLabourListings();

  const marketplaceGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const machineryGMV = machinery.reduce((sum, m) => sum + (m.ratePerHour * 8), 0); // 8-hr rental estimate
  const totalGMV = marketplaceGMV + machineryGMV;

  const activeDealers = vendors.filter(v => v.accreditationStatus === 'Verified').length;
  const pendingDealers = vendors.filter(v => v.accreditationStatus === 'Pending').length;
  const bannedProductsCount = products.filter(p => p.banned).length;

  return {
    totalFarmers: isDemoMode() ? 50420 + orders.length : orders.length,
    registeredDealers: vendors.length,
    activeDealers,
    pendingDealers,
    totalProducts: products.length,
    bannedProductsCount,
    totalOrders: orders.length,
    totalMachinery: machinery.length,
    totalLabour: labour.length,
    totalGMV,
    isDemoMode: isDemoMode(),
  };
}
