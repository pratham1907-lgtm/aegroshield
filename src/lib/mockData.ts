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

export const MOCK_VENDORS: MockVendor[] = [
  {
    id: 'v_meerut_1',
    name: 'Kisan Seva Kendra',
    ownerName: 'Ramesh Gupta',
    district: 'Meerut',
    address: 'Near Main Bus Stand, Meerut Road',
    phone: '9876543210',
    license: 'UP-AGR-2021-1421',
    rating: 4.8,
    verified: true,
    accreditationStatus: 'Verified',
    isDemo: true,
  },
  {
    id: 'v_agra_1',
    name: 'Agra Krishi Udyog',
    ownerName: 'Suresh Verma',
    district: 'Agra',
    address: 'Fatehabad Road, Agra',
    phone: '9876543211',
    license: 'UP-AGR-2022-8841',
    rating: 4.6,
    verified: true,
    accreditationStatus: 'Verified',
    isDemo: true,
  },
  {
    id: 'v_lucknow_1',
    name: 'Avadh Agri Inputs',
    ownerName: 'Mahesh Singh',
    district: 'Lucknow',
    address: 'Sitapur Bypass, Lucknow',
    phone: '9876543212',
    license: 'UP-AGR-2020-5512',
    rating: 4.9,
    verified: true,
    accreditationStatus: 'Verified',
    isDemo: true,
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p_1',
    vendorId: 'v_meerut_1',
    name: 'Neem Coated Urea (45kg)',
    nameHi: 'नीम कोटेड यूरिया',
    category: 'Fertilizer',
    price: 266,
    unit: 'per 45kg bag',
    stock: 'In Stock',
    brand: 'IFFCO',
    description: 'Government subsidized Neem Coated Urea for nitrogen supply.',
    forCrops: ['Wheat', 'Rice', 'Sugarcane'],
    banned: false,
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'p_2',
    vendorId: 'v_meerut_1',
    name: 'DAP Fertilizer (50kg)',
    nameHi: 'डीएपी उर्वरक',
    category: 'Fertilizer',
    price: 1350,
    unit: 'per 50kg bag',
    stock: 'In Stock',
    brand: 'KRIBHCO',
    description: 'Di-Ammonium Phosphate for root development and crop growth.',
    forCrops: ['Wheat', 'Mustard', 'Potato'],
    banned: false,
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'p_3',
    vendorId: 'v_meerut_1',
    name: 'Wheat Seeds HD-2967 (40kg)',
    nameHi: 'गेहूं बीज HD-2967',
    category: 'Seed',
    price: 1450,
    unit: 'per 40kg bag',
    stock: 'In Stock',
    brand: 'Nandi Seeds',
    description: 'High-yielding certified wheat seed variety resistant to yellow rust.',
    forCrops: ['Wheat'],
    banned: false,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'p_4',
    vendorId: 'v_agra_1',
    name: 'Bio Neem Oil Spray (1L)',
    nameHi: 'जैविक नीम तेल',
    category: 'Pesticide',
    price: 280,
    unit: 'per liter',
    stock: 'In Stock',
    brand: 'Organic India',
    description: '100% natural organic pesticide for aphid and whitefly control.',
    forCrops: ['Vegetables', 'Cotton', 'Mustard'],
    banned: false,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop',
    isDemo: true,
  },
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ORD-941028',
    vendorId: 'v_meerut_1',
    vendorName: 'Kisan Seva Kendra',
    customerName: 'Ram Singh',
    customerPhone: '9812345678',
    deliveryAddress: 'Village Mawana, Meerut',
    district: 'Meerut',
    pincode: '250001',
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 2, unitPrice: 266 },
      { product: MOCK_PRODUCTS[1], quantity: 1, unitPrice: 1350 },
    ],
    totalAmount: 1882,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'ORD-840192',
    vendorId: 'v_meerut_1',
    vendorName: 'Kisan Seva Kendra',
    customerName: 'Harish Kumar',
    customerPhone: '9898765432',
    deliveryAddress: 'Sardhana Road, Meerut',
    district: 'Meerut',
    pincode: '250002',
    items: [
      { product: MOCK_PRODUCTS[2], quantity: 1, unitPrice: 1450 },
    ],
    totalAmount: 1450,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'Delivered',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isDemo: true,
  },
];

export const MOCK_MACHINERY: MockMachinery[] = [
  {
    id: 'mach_1',
    chcName: 'Meerut Kisan CHC',
    equipmentType: 'Tractor (50 HP - Mahindra)',
    model: 'Mahindra 575 DI',
    ratePerHour: 600,
    location: 'Sardhana, Meerut',
    district: 'Meerut',
    contactPhone: '9876543210',
    available: true,
    isDemo: true,
  },
  {
    id: 'mach_2',
    chcName: 'Mawana CHC Centre',
    equipmentType: 'Combine Harvester',
    model: 'Preet 987',
    ratePerHour: 1500,
    location: 'Mawana, Meerut',
    district: 'Meerut',
    contactPhone: '9876543211',
    available: true,
    isDemo: true,
  },
  {
    id: 'mach_3',
    chcName: 'Agra Krishi CHC',
    equipmentType: 'Rotavator / Tiller (6 Feet)',
    model: 'Shaktiman Heavy Duty',
    ratePerHour: 450,
    location: 'Fatehabad, Agra',
    district: 'Agra',
    contactPhone: '9876543212',
    available: true,
    isDemo: true,
  },
];

export const MOCK_LABOUR: MockLabour[] = [
  {
    id: 'lab_1',
    teamLeaderName: 'Surendra Pal & Group',
    teamSize: 8,
    specialization: 'Wheat & Paddy Harvesting',
    dailyRatePerWorker: 450,
    district: 'Meerut',
    contactPhone: '9811223344',
    available: true,
    isDemo: true,
  },
  {
    id: 'lab_2',
    teamLeaderName: 'Vikram Singh Labor Squad',
    teamSize: 5,
    specialization: 'Pesticide Spraying & Sowing',
    dailyRatePerWorker: 400,
    district: 'Agra',
    contactPhone: '9822334455',
    available: true,
    isDemo: true,
  },
];

export const MOCK_MARKET_PRICES: MockMarketPrice[] = [
  {
    cropName: 'Wheat (गेहूं)',
    mandiName: 'Meerut Mandi',
    district: 'Meerut',
    minPrice: 2275,
    maxPrice: 2450,
    modalPrice: 2380,
    recommendation: 'SELL',
    trend: 'UP',
    isDemo: true,
  },
  {
    cropName: 'Paddy / Rice (धान)',
    mandiName: 'Agra Mandi',
    district: 'Agra',
    minPrice: 2100,
    maxPrice: 2320,
    modalPrice: 2240,
    recommendation: 'HOLD',
    trend: 'STABLE',
    isDemo: true,
  },
  {
    cropName: 'Mustard (सरसों)',
    mandiName: 'Lucknow Mandi',
    district: 'Lucknow',
    minPrice: 5350,
    maxPrice: 5700,
    modalPrice: 5580,
    recommendation: 'SELL',
    trend: 'UP',
    isDemo: true,
  },
];
