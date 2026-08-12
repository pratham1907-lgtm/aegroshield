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
export const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Kisan Seva Kendra', ownerName: 'Ramesh Gupta', district: 'Meerut', address: 'Near Bus Stand, Meerut', phone: '919876543210', license: 'UP-AGR-2021-1421', rating: 4.5, verified: true },
  { id: 'v2', name: 'Jai Kisan Agro Store', ownerName: 'Suresh Yadav', district: 'Agra', address: 'Sanjay Place, Agra', phone: '919812345678', license: 'UP-AGR-2020-0987', rating: 4.2, verified: true },
  { id: 'v3', name: 'Green Field Agro', ownerName: 'Mohit Sharma', district: 'Lucknow', address: 'Aliganj, Lucknow', phone: '919823456789', license: 'UP-AGR-2022-2210', rating: 4.7, verified: true },
  { id: 'v4', name: 'Bharat Krishi Bhandar', ownerName: 'Dinesh Tiwari', district: 'Kanpur', address: 'Govind Nagar, Kanpur', phone: '919834567890', license: 'UP-AGR-2019-0654', rating: 4.0, verified: false },
  { id: 'v5', name: 'Unnati Agro Center', ownerName: 'Pradeep Verma', district: 'Allahabad', address: 'Civil Lines, Allahabad', phone: '919845678901', license: 'UP-AGR-2021-1789', rating: 4.3, verified: true },
  { id: 'v6', name: 'Krishi Vikas Kendra', ownerName: 'Arun Mishra', district: 'Bareilly', address: 'Subhash Nagar, Bareilly', phone: '919856789012', license: 'UP-AGR-2020-1345', rating: 4.1, verified: true },
  { id: 'v7', name: 'Sona Mati Agro', ownerName: 'Harish Chandra', district: 'Aligarh', address: 'Ramghat Road, Aligarh', phone: '919867890123', license: 'UP-AGR-2022-2890', rating: 4.6, verified: true },
  { id: 'v8', name: 'Fasal Mitra Store', ownerName: 'Gopal Das', district: 'Ghaziabad', address: 'Raj Nagar Extension, Ghaziabad', phone: '919878901234', license: 'UP-AGR-2021-1567', rating: 4.4, verified: true },
  { id: 'v9', name: 'Khetibadi Agro', ownerName: 'Vijay Singh', district: 'Hapur', address: 'Main Market, Hapur', phone: '919889012345', license: 'UP-AGR-2023-3100', rating: 3.9, verified: false },
  { id: 'v10', name: 'Annadata Krishi Store', ownerName: 'Santosh Kumar', district: 'Firozabad', address: 'Shikohabad Road, Firozabad', phone: '919890123456', license: 'UP-AGR-2020-0821', rating: 4.2, verified: true },
];

// ── Products ──────────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  // ── Fertilizers ───
  { id: 'p1', vendorId: 'v1', name: 'Urea (46% N)', nameHi: 'यूरिया', category: 'Fertilizer', price: 266, unit: 'per 45kg bag', stock: 'In Stock', brand: 'IFFCO', description: 'High-nitrogen fertilizer, ideal for all cereal crops.', forCrops: ['Wheat', 'Rice', 'Maize', 'Sugarcane'] },
  { id: 'p2', vendorId: 'v2', name: 'DAP (Di-Ammonium Phosphate)', nameHi: 'डीएपी', category: 'Fertilizer', price: 1350, unit: 'per 50kg bag', stock: 'In Stock', brand: 'IFFCO', description: 'Rich in phosphorus and nitrogen. Essential for root development.', forCrops: ['Wheat', 'Rice', 'Mustard', 'Cotton'] },
  { id: 'p3', vendorId: 'v3', name: 'NPK 12-32-16', nameHi: 'एनपीके 12-32-16', category: 'Fertilizer', price: 1450, unit: 'per 50kg bag', stock: 'In Stock', brand: 'Coromandel', description: 'Balanced nutrient fertilizer suitable for all crops.', forCrops: ['Wheat', 'Rice', 'Vegetables', 'Fruits'] },
  { id: 'p4', vendorId: 'v4', name: 'Potash (MOP)', nameHi: 'पोटाश', category: 'Fertilizer', price: 900, unit: 'per 50kg bag', stock: 'Low Stock', brand: 'IPL', description: 'Improves fruit quality and disease resistance.', forCrops: ['Potato', 'Sugarcane', 'Banana', 'Tomato'] },
  { id: 'p5', vendorId: 'v5', name: 'Neem Coated Urea', nameHi: 'नीम लेपित यूरिया', category: 'Fertilizer', price: 280, unit: 'per 45kg bag', stock: 'In Stock', brand: 'NFL', description: 'Slow-release urea coated with neem oil — reduces nitrogen loss.', forCrops: ['Rice', 'Wheat', 'Maize'] },
  { id: 'p6', vendorId: 'v6', name: 'Zinc Sulphate', nameHi: 'जिंक सल्फेट', category: 'Fertilizer', price: 180, unit: 'per kg', stock: 'In Stock', brand: 'Tata Rallis', description: 'Corrects zinc deficiency. Improves yield in paddy and wheat.', forCrops: ['Rice', 'Wheat'] },
  { id: 'p7', vendorId: 'v7', name: 'SSP (Single Super Phosphate)', nameHi: 'एसएसपी', category: 'Fertilizer', price: 420, unit: 'per 50kg bag', stock: 'In Stock', brand: 'GSFC', description: 'Provides phosphorus and sulphur. Good for oilseeds.', forCrops: ['Mustard', 'Groundnut', 'Soybean'] },
  { id: 'p8', vendorId: 'v8', name: 'Bio-Compost (Organic)', nameHi: 'जैव खाद', category: 'Fertilizer', price: 350, unit: 'per 25kg bag', stock: 'In Stock', brand: 'Local Organic', description: 'Rich organic compost to improve soil health naturally.', forCrops: ['All Crops'] },

  // ── Pesticides ───
  { id: 'p9', vendorId: 'v1', name: 'Chlorpyrifos 20% EC', nameHi: 'क्लोरपायरीफॉस', category: 'Pesticide', price: 320, unit: 'per litre', stock: 'In Stock', brand: 'Bayer', description: 'Broad-spectrum insecticide for soil & foliar pests.', forCrops: ['Cotton', 'Rice', 'Wheat', 'Vegetables'] },
  { id: 'p10', vendorId: 'v2', name: 'Imidacloprid 17.8% SL', nameHi: 'इमिडाक्लोप्रिड', category: 'Pesticide', price: 450, unit: 'per 250ml', stock: 'In Stock', brand: 'Bayer', description: 'Systemic insecticide — kills sucking pests (aphids, whitefly).', forCrops: ['Cotton', 'Rice', 'Chilli', 'Tomato'] },
  { id: 'p11', vendorId: 'v3', name: 'Mancozeb 75% WP', nameHi: 'मैंकोजेब', category: 'Pesticide', price: 280, unit: 'per 500g', stock: 'In Stock', brand: 'UPL', description: 'Broad-spectrum fungicide for late blight and leaf spot.', forCrops: ['Potato', 'Tomato', 'Wheat', 'Grapes'] },
  { id: 'p12', vendorId: 'v4', name: 'Glyphosate 41% SL', nameHi: 'ग्लाइफोसेट', category: 'Pesticide', price: 520, unit: 'per litre', stock: 'Low Stock', brand: 'Dow AgroSciences', description: 'Non-selective herbicide for weed management.', forCrops: ['Wheat', 'Sugarcane', 'Orchard'] },
  { id: 'p13', vendorId: 'v5', name: 'Cypermethrin 25% EC', nameHi: 'साइपरमेथ्रिन', category: 'Pesticide', price: 380, unit: 'per litre', stock: 'In Stock', brand: 'Syngenta', description: 'Knockdown insecticide for caterpillars and borers.', forCrops: ['Cotton', 'Vegetables', 'Soybean'] },
  { id: 'p14', vendorId: 'v6', name: 'Propiconazole 25% EC', nameHi: 'प्रोपिकोनाज़ोल', category: 'Pesticide', price: 600, unit: 'per litre', stock: 'In Stock', brand: 'Syngenta', description: 'Systemic fungicide for rust, powdery mildew and leaf diseases.', forCrops: ['Wheat', 'Rice', 'Maize'] },
  { id: 'p15', vendorId: 'v7', name: 'Neem Oil (Organic)', nameHi: 'नीम तेल', category: 'Pesticide', price: 250, unit: 'per litre', stock: 'In Stock', brand: 'Agroneem', description: 'Organic biopesticide — safe for humans and environment.', forCrops: ['Vegetables', 'Fruits', 'All Crops'] },

  // ── Seeds ───
  { id: 'p16', vendorId: 'v8', name: 'Wheat Seeds HD-2967', nameHi: 'गेहूँ बीज HD-2967', category: 'Seed', price: 70, unit: 'per kg', stock: 'In Stock', brand: 'IARI', description: 'High-yielding wheat variety for North India plains.', forCrops: ['Wheat'] },
  { id: 'p17', vendorId: 'v9', name: 'Hybrid Paddy Seeds (Arize)', nameHi: 'धान बीज (अराइज़)', category: 'Seed', price: 290, unit: 'per 4kg bag', stock: 'In Stock', brand: 'Bayer', description: 'High-yield hybrid paddy — suitable for direct seeding.', forCrops: ['Rice'] },
  { id: 'p18', vendorId: 'v10', name: 'Mustard Seeds (Pusa Bold)', nameHi: 'सरसों बीज', category: 'Seed', price: 150, unit: 'per kg', stock: 'In Stock', brand: 'IARI', description: 'Bold grain, early-maturing mustard variety.', forCrops: ['Mustard'] },
  { id: 'p19', vendorId: 'v1', name: 'Maize Hybrid Seeds (DKC-9144)', nameHi: 'मक्का बीज', category: 'Seed', price: 1100, unit: 'per 4kg bag', stock: 'Low Stock', brand: 'Dekalb', description: 'Drought-tolerant high-yield hybrid maize.', forCrops: ['Maize'] },
  { id: 'p20', vendorId: 'v2', name: 'Tomato Hybrid Seeds (Arka Rakshak)', nameHi: 'टमाटर बीज', category: 'Seed', price: 180, unit: 'per 10g packet', stock: 'In Stock', brand: 'IIHR', description: 'Disease-resistant variety for high yield.', forCrops: ['Tomato'] },
  { id: 'p21', vendorId: 'v3', name: 'Onion Seeds (Bhima Super)', nameHi: 'प्याज बीज', category: 'Seed', price: 220, unit: 'per 500g', stock: 'In Stock', brand: 'NHRDF', description: 'Short-day, high-yield onion variety for Rabi season.', forCrops: ['Onion'] },
  { id: 'p22', vendorId: 'v4', name: 'Potato Seeds (Kufri Jyoti)', nameHi: 'आलू बीज', category: 'Seed', price: 40, unit: 'per kg', stock: 'In Stock', brand: 'CPRI', description: 'Popular potato variety — early-maturing and high-yielding.', forCrops: ['Potato'] },

  // ── Equipment ───
  { id: 'p23', vendorId: 'v5', name: 'Knapsack Sprayer (16L)', nameHi: 'नेपसैक स्प्रेयर', category: 'Equipment', price: 1200, unit: 'per unit', stock: 'In Stock', brand: 'Neptune', description: '16-litre manual sprayer for pesticide application.', forCrops: ['All Crops'] },
  { id: 'p24', vendorId: 'v6', name: 'Battery Sprayer (12L)', nameHi: 'बैटरी स्प्रेयर', category: 'Equipment', price: 2800, unit: 'per unit', stock: 'In Stock', brand: 'Fuji', description: '12-litre battery-operated sprayer — saves time and effort.', forCrops: ['All Crops'] },
  { id: 'p25', vendorId: 'v7', name: 'Soil Testing Kit (Multi-parameter)', nameHi: 'मिट्टी परीक्षण किट', category: 'Equipment', price: 650, unit: 'per kit', stock: 'Low Stock', brand: 'Kelway', description: 'Tests pH, NPK levels of your field soil at home.', forCrops: ['All Crops'] },
  { id: 'p26', vendorId: 'v8', name: 'Drip Irrigation Kit (1 acre)', nameHi: 'ड्रिप सिंचाई किट', category: 'Equipment', price: 12000, unit: 'per acre kit', stock: 'In Stock', brand: 'Jain Irrigation', description: 'Complete drip irrigation setup for 1 acre — saves 60% water.', forCrops: ['Vegetables', 'Sugarcane', 'Banana'] },
];

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
