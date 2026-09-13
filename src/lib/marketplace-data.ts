// ─── Aegroshield Local Marketplace Data ──────────────────────────────────────
// Mock vendor & product data for UP districts.
// Replace with Firestore queries when a real DB is set up.

export type Category = 'Fertilizer' | 'Pesticide' | 'Seed' | 'Equipment';

export interface Vendor {
  id: string;
  name: string;
  ownerName: string;
  district: string;
  address: string;
  phone: string;       // WhatsApp number (with country code, no +)
  license: string;
  rating: number;      // 1-5
  verified: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  nameHi: string;      // Hindi name
  category: Category;
  price: number;       // INR
  unit: string;        // e.g. "per 50kg bag", "per litre", "per packet"
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  brand: string;
  description: string;
  forCrops: string[];  // Which crops this is recommended for
}

// ── Vendors ───────────────────────────────────────────────────────────────────
export const VENDORS: Vendor[] = [];

// ── Products ──────────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [];

// ── Helper Functions ──────────────────────────────────────────────────────────

export const ALL_DISTRICTS = [
  'Agra', 'Aligarh', 'Allahabad', 'Bareilly', 'Firozabad',
  'Ghaziabad', 'Hapur', 'Kanpur', 'Lucknow', 'Meerut'
];

export function getVendorById(id: string): Vendor | undefined {
  return VENDORS.find(v => v.id === id);
}

export function getProductsFiltered(district: string, category: string): Product[] {
  // First get vendor IDs for selected district
  const districtVendorIds = district === 'All'
    ? VENDORS.map(v => v.id)
    : VENDORS.filter(v => v.district === district).map(v => v.id);

  return PRODUCTS.filter(p => {
    const matchDistrict = districtVendorIds.includes(p.vendorId);
    const matchCategory = category === 'All' || p.category === category;
    return matchDistrict && matchCategory;
  });
}
