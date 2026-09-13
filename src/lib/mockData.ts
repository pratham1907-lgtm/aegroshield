// ─── Aegroshield Mock Dataset for Evaluation Demo Mode ────────────────────────
// Sample Vendors, Products, Orders, Machinery, Labour, and Market Rates used strictly during Demo Sign-In.

export interface MockVendor {
  id: string;
  name: string;
  ownerName: string;
  district: string;
  address: string;
  phone: string;
  license: string;
  rating: number;
  verified: boolean;
  accreditationStatus: 'Verified' | 'Pending' | 'Rejected';
  isDemo: boolean;
}

export interface MockProduct {
  id: string;
  vendorId: string;
  name: string;
  nameHi: string;
  category: 'Fertilizer' | 'Seed' | 'Pesticide' | 'Equipment';
  price: number;
  unit: string;
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  brand: string;
  description: string;
  forCrops: string[];
  banned: boolean;
  imageUrl?: string;
  isDemo: boolean;
}

export interface MockOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  pincode: string;
  items: Array<{
    product: MockProduct;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery (COD)';
  status: 'Pending' | 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  isDemo: boolean;
}

export interface MockMachinery {
  id: string;
  chcName: string;
  equipmentType: string;
  model: string;
  ratePerHour: number;
  location: string;
  district: string;
  contactPhone: string;
  available: boolean;
  isDemo: boolean;
}

export interface MockLabour {
  id: string;
  teamLeaderName: string;
  teamSize: number;
  specialization: string;
  dailyRatePerWorker: number;
  district: string;
  contactPhone: string;
  available: boolean;
  isDemo: boolean;
}

export interface MockMarketPrice {
  cropName: string;
  mandiName: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  recommendation: 'SELL' | 'HOLD';
  trend: 'UP' | 'DOWN' | 'STABLE';
  isDemo: boolean;
}

export const MOCK_VENDORS: MockVendor[] = [];
export const MOCK_PRODUCTS: MockProduct[] = [];
export const MOCK_ORDERS: MockOrder[] = [];
export const MOCK_MACHINERY: MockMachinery[] = [];
export const MOCK_LABOUR: MockLabour[] = [];
export const MOCK_MARKET_PRICES: MockMarketPrice[] = [];
