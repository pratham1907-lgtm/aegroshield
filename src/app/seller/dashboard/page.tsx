"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth, db, signInWithGoogle } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Store,
  Package,
  Plus,
  Trash2,
  Edit,
  Eye,
  Search,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Check,
  Building2,
  Tractor,
  Users,
  Phone,
  MapPin,
} from 'lucide-react';

export interface SellerProduct {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string | null;
  description?: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    storeName: string;
    ownerName: string;
    district: string;
    phone: string;
    isVerified: boolean;
  };
}

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'General'] as const;

const PRESET_UNITS = [
  'per 50kg bag',
  'per 45kg bag',
  'per 25kg bag',
  'per 1L bottle',
  'per 500ml bottle',
  'per 100g packet',
  'per kg',
  'per piece',
  'per quintal',
];

const PRESET_IMAGES = [
  { label: 'Fertilizer Bag', url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400&q=80' },
  { label: 'Organic Seeds', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07?w=400&q=80' },
  { label: 'Pesticide Sprayer', url: 'https://images.unsplash.com/photo-1599818497672-887e0fa0c1ef?w=400&q=80' },
  { label: 'Farm Equipment', url: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&q=80' },
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, userData } = useAuth();

  // Phone-authenticated seller session from localStorage
  const [sellerSession, setSellerSession] = useState<{ user?: any; seller?: any } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aegroshield_seller_session');
      if (stored) {
        setSellerSession(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('[SellerDashboard] Error reading seller session:', e);
    }
  }, []);

  // Seller Profile Doc from Firestore 'sellers' collection
  const [sellerDoc, setSellerDoc] = useState<any | null>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid || user?.uid;
    if (!uid) return;
    getDoc(doc(db, 'sellers', uid))
      .then(snap => {
        if (snap.exists()) {
          setSellerDoc(snap.data());
        }
      })
      .catch(err => console.warn('[SellerDashboard] Error loading seller document from sellers collection:', err));
  }, [user]);

  // Dashboard Tabs: 'products' | 'machinery' | 'labour'
  const [dashboardTab, setDashboardTab] = useState<'products' | 'machinery' | 'labour'>('products');
  const [machineryList, setMachineryList] = useState<any[]>([]);
  const [labourList, setLabourList] = useState<any[]>([]);
  const [showAddMachineryModal, setShowAddMachineryModal] = useState(false);
  const [showAddLabourModal, setShowAddLabourModal] = useState(false);

  // Machinery form state
  const [machineryForm, setMachineryForm] = useState({
    title: '',
    machineType: 'Tractor',
    ratePerHour: '',
    district: '',
    contactPhone: '',
  });

  // Labour form state
  const [labourForm, setLabourForm] = useState({
    leaderName: '',
    groupSize: '5',
    primarySkill: 'Harvesting, Sowing',
    wagePerDay: '400',
    district: '',
    phone: '',
  });

  // Inventory State
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<SellerProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Seeds',
    price: '',
    unit: 'per 50kg bag',
    stock: '',
    description: '',
    imageUrl: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch products from PostgreSQL database API
  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const sessionSellerId = sellerSession?.seller?.id;
      const sessionPhone = sellerSession?.seller?.phone || sellerSession?.user?.phone;
      const uid = auth.currentUser?.uid || user?.uid;

      let url = '/api/products';
      if (sessionSellerId) {
        url = `/api/products?sellerId=${encodeURIComponent(sessionSellerId)}`;
      } else if (sessionPhone) {
        url = `/api/products?phone=${encodeURIComponent(sessionPhone)}`;
      } else if (uid) {
        url = `/api/products?firebaseUid=${encodeURIComponent(uid)}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();

      if (Array.isArray(json)) {
        setProducts(json);
      } else if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      } else {
        setProducts([]);
        if (json.error) setError(json.error);
      }
    } catch (err: any) {
      console.error('[SellerDashboard] Failed to fetch inventory:', err);
      setError('Unable to load products from database. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, sellerSession]);

  // Fetch machinery from PostgreSQL database API
  const fetchMachinery = useCallback(async () => {
    const sessionPhone = sellerSession?.seller?.phone || sellerSession?.user?.phone;
    const uid = auth.currentUser?.uid || user?.uid;
    const query = sessionPhone
      ? `phone=${encodeURIComponent(sessionPhone)}`
      : `firebaseUid=${encodeURIComponent(uid || '')}`;

    try {
      const res = await fetch(`/api/machinery?${query}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMachineryList(json.data);
      }
    } catch (err) {
      console.warn('[SellerDashboard] Failed to fetch machinery:', err);
    }
  }, [user, sellerSession]);

  // Fetch labour posts from PostgreSQL database API
  const fetchLabour = useCallback(async () => {
    const sessionPhone = sellerSession?.seller?.phone || sellerSession?.user?.phone;
    const uid = auth.currentUser?.uid || user?.uid;
    const query = sessionPhone
      ? `phone=${encodeURIComponent(sessionPhone)}`
      : `firebaseUid=${encodeURIComponent(uid || '')}`;

    try {
      const res = await fetch(`/api/labour?${query}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLabourList(json.data);
      }
    } catch (err) {
      console.warn('[SellerDashboard] Failed to fetch labour:', err);
    }
  }, [user, sellerSession]);

  useEffect(() => {
    fetchProducts();
    fetchMachinery();
    fetchLabour();
  }, [fetchProducts, fetchMachinery, fetchLabour]);

  // Inventory Metrics
  const metrics = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
    const inStock = products.filter(p => Number(p.stock) > 5).length;
    const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
    const outOfStock = products.filter(p => Number(p.stock) === 0).length;

    return { totalItems, totalValue, inStock, lowStock, outOfStock };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);

      // Category filter
      const matchesCategory = selectedCategory === 'All' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = Number(p.stock) > 5;
      else if (stockFilter === 'low_stock') matchesStock = Number(p.stock) > 0 && Number(p.stock) <= 5;
      else if (stockFilter === 'out_of_stock') matchesStock = Number(p.stock) === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Handle Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Product title / name is required.';
    if (!formData.category) errors.category = 'Please select a category.';

    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Please enter a valid price greater than 0.';
    }

    const stockNum = Number(formData.stock);
    if (formData.stock === '' || isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.stock = 'Please enter a valid non-negative integer stock quantity.';
    }

    if (!formData.unit.trim()) errors.unit = 'Unit measurement is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Seeds',
      price: '',
      unit: 'per 50kg bag',
      stock: '',
      description: '',
      imageUrl: '',
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (product: SellerProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || 'Seeds',
      price: String(product.price),
      unit: product.unit || 'per unit',
      stock: String(product.stock),
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Save (Create or Update) Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            category: formData.category,
            price: Number(formData.price),
            stock: Number(formData.stock),
            unit: formData.unit.trim(),
            description: formData.description.trim() || null,
            imageUrl: formData.imageUrl.trim() || null,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          showToast(`Updated "${json.data.name}" successfully!`);
          setProducts(prev => prev.map(p => (p.id === editingProduct.id ? json.data : p)));
          setShowAddModal(false);
          setEditingProduct(null);
        } else {
          showToast(json.error || 'Failed to update product', 'error');
        }
      } else {
        // POST create
        const sessionUser = sellerSession?.user;
        const sessionSeller = sellerSession?.seller;

        if (!auth.currentUser && !sessionUser) {
          const wantsSignIn = confirm("A verified Google Account or Phone login is required to add inventory. Sign in now?");
          if (wantsSignIn) {
            router.push('/vendor/login');
          }
          return;
        }

        const token = await auth.currentUser?.getIdToken();
        const activeUid = auth.currentUser?.uid || user?.uid || sessionUser?.id || '';
        const activeEmail = auth.currentUser?.email || user?.email || sessionUser?.email || '';
        const activeName = auth.currentUser?.displayName || user?.displayName || sessionSeller?.ownerName || sessionUser?.name || 'Store Owner';
        const activePhone = sessionSeller?.phone || sessionUser?.phone || '';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (activeUid) headers['x-firebase-uid'] = activeUid;
        if (activeEmail) headers['x-user-email'] = activeEmail;
        if (activeName) headers['x-user-name'] = encodeURIComponent(activeName);
        if (activePhone) headers['x-user-phone'] = activePhone;

        const res = await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: formData.name.trim(),
            category: formData.category,
            price: Number(formData.price),
            stock: Number(formData.stock),
            unit: formData.unit.trim(),
            description: formData.description.trim() || null,
            imageUrl: formData.imageUrl.trim() || null,
            userId: activeUid,
            firebaseUid: activeUid,
            sellerId: sessionSeller?.id || undefined,
            phone: activePhone,
            storeName: sessionSeller?.storeName || undefined,
            district: sessionSeller?.district || undefined,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          showToast(`Added "${json.data.name}" to your live inventory!`);
          setProducts(prev => [json.data, ...prev]);
          if (json.data.seller && !sessionSeller?.id) {
            const updated = {
              user: { id: json.data.seller.userId, name: json.data.seller.ownerName, phone: json.data.seller.phone },
              seller: json.data.seller,
            };
            setSellerSession(updated);
            try {
              localStorage.setItem('aegroshield_seller_session', JSON.stringify(updated));
            } catch (e) {}
          }
          setShowAddModal(false);
        } else {
          showToast(json.error || 'Failed to create product', 'error');
        }
      }
    } catch (err: any) {
      console.error('[SellerDashboard] Save error:', err);
      showToast(err?.message || 'Network error saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Machinery to Supabase (POST /api/machinery)
  const handleSaveMachinery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineryForm.title.trim() || !machineryForm.ratePerHour) {
      showToast('Please provide an equipment name and hourly rate.', 'error');
      return;
    }

    const sessionUser = sellerSession?.user;
    const sessionSeller = sellerSession?.seller;

    if (!auth.currentUser && !sessionUser) {
      const wantsSignIn = confirm("A verified Account is required to add machinery. Sign in now?");
      if (wantsSignIn) {
        router.push('/vendor/login');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const activeUid = auth.currentUser?.uid || user?.uid || sessionUser?.id || '';
      const activeEmail = auth.currentUser?.email || user?.email || sessionUser?.email || '';
      const activeName = auth.currentUser?.displayName || user?.displayName || sessionSeller?.ownerName || sessionUser?.name || 'Equipment Partner';
      const activePhone = machineryForm.contactPhone.trim() || sessionSeller?.phone || sessionUser?.phone || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (activeUid) headers['x-firebase-uid'] = activeUid;
      if (activeEmail) headers['x-user-email'] = activeEmail;
      if (activeName) headers['x-user-name'] = encodeURIComponent(activeName);
      if (activePhone) headers['x-user-phone'] = activePhone;

      const res = await fetch('/api/machinery', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: machineryForm.title.trim(),
          machineType: machineryForm.machineType,
          ratePerHour: Number(machineryForm.ratePerHour),
          district: machineryForm.district.trim() || sessionSeller?.district || 'Meerut',
          contactPhone: activePhone,
          phone: activePhone,
          ownerId: activeUid,
          userId: activeUid,
          firebaseUid: activeUid,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        showToast(`Added machinery "${json.data.title}" successfully!`);
        setMachineryList(prev => [json.data, ...prev]);
        setShowAddMachineryModal(false);
        setMachineryForm({
          title: '',
          machineType: 'Tractor',
          ratePerHour: '',
          district: '',
          contactPhone: '',
        });
      } else {
        showToast(json.error || 'Failed to add machinery to database', 'error');
      }
    } catch (err: any) {
      console.error('[SellerDashboard] Machinery save error:', err);
      showToast(err?.message || 'Network error saving machinery', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Labour Post to Supabase (POST /api/labour)
  const handleSaveLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labourForm.leaderName.trim() || !labourForm.wagePerDay) {
      showToast('Please provide a team leader name and daily wage.', 'error');
      return;
    }

    const sessionUser = sellerSession?.user;
    const sessionSeller = sellerSession?.seller;

    if (!auth.currentUser && !sessionUser) {
      const wantsSignIn = confirm("A verified Account is required to post labour. Sign in now?");
      if (wantsSignIn) {
        router.push('/vendor/login');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const activeUid = auth.currentUser?.uid || user?.uid || sessionUser?.id || '';
      const activeEmail = auth.currentUser?.email || user?.email || sessionUser?.email || '';
      const activeName = auth.currentUser?.displayName || user?.displayName || sessionSeller?.ownerName || sessionUser?.name || 'Labour Leader';
      const activePhone = labourForm.phone.trim() || sessionSeller?.phone || sessionUser?.phone || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (activeUid) headers['x-firebase-uid'] = activeUid;
      if (activeEmail) headers['x-user-email'] = activeEmail;
      if (activeName) headers['x-user-name'] = encodeURIComponent(activeName);
      if (activePhone) headers['x-user-phone'] = activePhone;

      const res = await fetch('/api/labour', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          leaderName: labourForm.leaderName.trim(),
          groupSize: Number(labourForm.groupSize) || 5,
          primarySkill: labourForm.primarySkill.trim() || 'Harvesting, Sowing',
          wagePerDay: Number(labourForm.wagePerDay) || 400,
          district: labourForm.district.trim() || sessionSeller?.district || 'Meerut',
          phone: activePhone,
          contactPhone: activePhone,
          userId: activeUid,
          leaderId: activeUid,
          firebaseUid: activeUid,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        showToast(`Added labour group "${json.data.leaderName}" successfully!`);
        setLabourList(prev => [json.data, ...prev]);
        setShowAddLabourModal(false);
        setLabourForm({
          leaderName: '',
          groupSize: '5',
          primarySkill: 'Harvesting, Sowing',
          wagePerDay: '400',
          district: '',
          phone: '',
        });
      } else {
        showToast(json.error || 'Failed to add labour post to database', 'error');
      }
    } catch (err: any) {
      console.error('[SellerDashboard] Labour save error:', err);
      showToast(err?.message || 'Network error saving labour post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        showToast(`Product "${deletingProduct.name}" deleted from database.`);
        setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
        setDeletingProduct(null);
      } else {
        showToast(json.error || 'Failed to delete product', 'error');
      }
    } catch (err: any) {
      console.error('[SellerDashboard] Delete error:', err);
      showToast(err?.message || 'Network error deleting product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Stock Adjustment (+10 or -5)
  const handleQuickStockAdjust = async (product: SellerProduct, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(prev => prev.map(p => (p.id === product.id ? json.data : p)));
        showToast(`Stock updated to ${newStock} for "${product.name}"`);
      }
    } catch (err) {
      console.error('[SellerDashboard] Stock update failed:', err);
    }
  };

  const sellerStoreName = sellerDoc?.storeName || userData?.storeName || (user?.displayName ? `${user.displayName}'s Store` : 'Kisan Seva Kendra');
  const sellerOwner = sellerDoc?.ownerName || userData?.name || user?.displayName || 'Ramesh Patel';
  const sellerDistrict = sellerDoc?.district || userData?.district || 'Ahmedabad';

  return (
    <main className="vendor-dashboard-page" style={{ paddingBottom: '90px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'success' ? '#15803d' : '#b91c1c',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.95rem',
            fontWeight: 500,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Top Dashboard Header ── */}
      <header className="vd-header">
        <div className="container vd-header-inner">
          <div className="vd-store-badge">
            <div className="vd-store-icon">
              <Store size={26} />
            </div>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sellerStoreName}
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={14} /> Verified Seller
                </span>
              </h2>
              <p>
                Owner: <strong>{sellerOwner}</strong> • 📍 {sellerDistrict} • PostgreSQL Supabase Inventory
              </p>
            </div>
          </div>

          <div className="vd-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchProducts(true)}
              disabled={refreshing}
              className="btn btn-outline btn-sm"
              title="Refresh database records"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Sync'}
            </button>

            <Link
              href="/marketplace"
              target="_blank"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={15} /> Public Storefront
            </Link>

            {dashboardTab === 'products' && (
              <button
                onClick={handleOpenAddModal}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Product
              </button>
            )}
            {dashboardTab === 'machinery' && (
              <button
                onClick={() => setShowAddMachineryModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#15803d', color: '#fff' }}
              >
                <Plus size={16} /> Add Machinery
              </button>
            )}
            {dashboardTab === 'labour' && (
              <button
                onClick={() => setShowAddLabourModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#15803d', color: '#fff' }}
              >
                <Plus size={16} /> Add Labour Post
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '28px' }}>
        {/* ── Dashboard Navigation Tabs ── */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '28px', overflowX: 'auto' }}>
          <button
            onClick={() => setDashboardTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: dashboardTab === 'products' ? '#15803d' : '#64748b',
              borderBottom: dashboardTab === 'products' ? '3px solid #15803d' : '3px solid transparent',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
            }}
          >
            <Package size={18} />
            Products Inventory ({products.length})
          </button>

          <button
            onClick={() => setDashboardTab('machinery')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: dashboardTab === 'machinery' ? '#15803d' : '#64748b',
              borderBottom: dashboardTab === 'machinery' ? '3px solid #15803d' : '3px solid transparent',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
            }}
          >
            <Tractor size={18} />
            CHC Machinery ({machineryList.length})
          </button>

          <button
            onClick={() => setDashboardTab('labour')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: dashboardTab === 'labour' ? '#15803d' : '#64748b',
              borderBottom: dashboardTab === 'labour' ? '3px solid #15803d' : '3px solid transparent',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
            }}
          >
            <Users size={18} />
            Labour Workforce ({labourList.length})
          </button>
        </div>

        {dashboardTab === 'products' && (
          <>
        {/* ── Metric Summary Cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            marginBottom: '28px',
          }}
        >
          {/* Total Catalog Items */}
          <div className="metric-card">
            <div className="metric-icon green">
              <Package size={22} />
            </div>
            <div>
              <div className="metric-val">{metrics.totalItems}</div>
              <div className="metric-lbl">Total Catalog Items</div>
            </div>
          </div>

          {/* Total Stock Value */}
          <div className="metric-card">
            <div className="metric-icon orange">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="metric-val">₹{metrics.totalValue.toLocaleString('en-IN')}</div>
              <div className="metric-lbl">Total Stock Value</div>
            </div>
          </div>

          {/* Healthy Stock */}
          <div className="metric-card">
            <div className="metric-icon blue">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="metric-val">{metrics.inStock}</div>
              <div className="metric-lbl">In Stock (&gt; 5 units)</div>
            </div>
          </div>

          {/* Low or Out of Stock */}
          <div className="metric-card">
            <div
              className="metric-icon"
              style={{ background: metrics.lowStock + metrics.outOfStock > 0 ? '#fee2e2' : '#f1f5f9', color: '#dc2626' }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="metric-val" style={{ color: metrics.lowStock + metrics.outOfStock > 0 ? '#dc2626' : undefined }}>
                {metrics.lowStock + metrics.outOfStock}
              </div>
              <div className="metric-lbl">Low / Out of Stock</div>
            </div>
          </div>
        </div>

        {/* ── Filter & Search Toolbar ── */}
        <div
          style={{
            background: '#fff',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search product title, category or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                background: '#fff',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                background: '#fff',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock (&gt;5)</option>
              <option value="low_stock">Low Stock (1-5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* ── Inventory Section ── */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>
            Live Store Products ({filteredProducts.length})
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Synchronized with Supabase PostgreSQL
          </span>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            {[1, 2, 3, 4].map(idx => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: idx < 4 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '40%', height: '16px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ width: '25%', height: '12px', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                </div>
                <div style={{ width: '80px', height: '24px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '60px', height: '24px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div
            className="vd-empty"
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '60px 20px',
              border: '1.5px dashed #cbd5e1',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#64748b',
              }}
            >
              <Package size={32} />
            </div>
            <h4 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700, marginBottom: '6px' }}>
              {products.length === 0 ? 'No products listed yet' : 'No products match your filters'}
            </h4>
            <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.92rem' }}>
              {products.length === 0
                ? 'Your online store catalog is empty. Click "Add New Product" to list seeds, fertilizers, pesticides, or machinery tools in the marketplace.'
                : 'Try clearing your search query or switching to a different category filter.'}
            </p>
            {products.length === 0 ? (
              <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Your First Product
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStockFilter('all');
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Product Inventory Table */
          <div className="vd-product-table-wrap">
            <table className="vd-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '240px' }}>Product</th>
                  <th>Category</th>
                  <th>Price & Unit</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const isOutOfStock = Number(product.stock) === 0;
                  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: '44px',
                                height: '44px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '8px',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                flexShrink: 0,
                              }}
                            >
                              <Package size={22} />
                            </div>
                          )}

                          <div>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                              {product.name}
                              {product.isDemo ? (
                                <span
                                  style={{
                                    marginLeft: '8px',
                                    fontSize: '0.7rem',
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                  }}
                                >
                                  Demo
                                </span>
                              ) : (
                                <span
                                  style={{
                                    marginLeft: '8px',
                                    fontSize: '0.7rem',
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Live Item
                                </span>
                              )}
                            </div>
                            {product.description && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#64748b',
                                  marginTop: '2px',
                                  maxWidth: '280px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="cat-pill">{product.category}</span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{product.unit}</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.stock} units</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(product, -5)}
                              title="Decrease stock by 5"
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(product, 10)}
                              title="Increase stock by 10"
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      <td>
                        {isOutOfStock ? (
                          <span className="stock-pill out-of-stock">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="stock-pill low-stock">Low Stock</span>
                        ) : (
                          <span className="stock-pill in-stock">In Stock</span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="vd-btn-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="btn-icon blue"
                            title="Edit Product Details"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="btn-icon red"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </>
        )}

        {dashboardTab === 'machinery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                  Your Custom Hiring Centre (CHC) Machinery
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                  Equipment registered here is saved in Supabase and available for farmers to book on <Link href="/machinery" style={{ color: '#15803d', fontWeight: 600 }}>/machinery</Link>.
                </p>
              </div>
              <button
                onClick={() => setShowAddMachineryModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#15803d', color: '#fff' }}
              >
                <Plus size={16} /> Add Machinery
              </button>
            </div>

            {machineryList.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                <Tractor size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                  No machinery registered yet
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                  List your tractors, harvesters, or tillers to start receiving hourly bookings from farmers across your district.
                </p>
                <button
                  onClick={() => setShowAddMachineryModal(true)}
                  className="btn btn-primary"
                  style={{ background: '#15803d', color: '#fff' }}
                >
                  <Plus size={16} /> Register First Equipment
                </button>
              </div>
            ) : (
              <div className="vd-table-card">
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Equipment / Model</th>
                      <th>Machine Type</th>
                      <th>Rate per Hour</th>
                      <th>District</th>
                      <th>Contact Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineryList.map((m: any) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>
                            {m.title}
                            <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                              ✓ Supabase Live
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: {m.id}</div>
                        </td>
                        <td>
                          <span className="cat-pill">{m.machineType}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1.05rem' }}>
                            ₹{m.ratePerHour}
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}> / hr</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.88rem' }}>
                            <MapPin size={14} /> {m.district}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.88rem' }}>
                            <Phone size={14} /> {m.contactPhone || '—'}
                          </div>
                        </td>
                        <td>
                          <span className="stock-pill in-stock">
                            {m.available ? 'Available' : 'Booked'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {dashboardTab === 'labour' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                  Your Agricultural Labour Workforce Posts
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                  Labour groups registered here are saved in Supabase and available for hiring on <Link href="/labour" style={{ color: '#15803d', fontWeight: 600 }}>/labour</Link>.
                </p>
              </div>
              <button
                onClick={() => setShowAddLabourModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#15803d', color: '#fff' }}
              >
                <Plus size={16} /> Add Labour Post
              </button>
            </div>

            {labourList.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                <Users size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                  No labour groups listed yet
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                  Post availability for your farm labour squad or harvesting team to receive verified bookings from farmers.
                </p>
                <button
                  onClick={() => setShowAddLabourModal(true)}
                  className="btn btn-primary"
                  style={{ background: '#15803d', color: '#fff' }}
                >
                  <Plus size={16} /> Post Worker Availability
                </button>
              </div>
            ) : (
              <div className="vd-table-card">
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Leader / Squad Name</th>
                      <th>Group Size</th>
                      <th>Primary Specialization</th>
                      <th>Daily Wage / Worker</th>
                      <th>District</th>
                      <th>Contact Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labourList.map((l: any) => (
                      <tr key={l.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>
                            {l.leaderName || l.teamLeaderName}
                            <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                              ✓ Supabase Live
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: {l.id}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <Users size={14} color="#15803d" />
                            {l.groupSize || l.teamSize} workers
                          </div>
                        </td>
                        <td>
                          <span className="cat-pill">{l.primarySkill || l.specialization}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1.05rem' }}>
                            ₹{l.wagePerDay || l.dailyRatePerWorker}
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}> / day</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.88rem' }}>
                            <MapPin size={14} /> {l.district}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.88rem' }}>
                            <Phone size={14} /> {l.phone || l.contactPhone || '—'}
                          </div>
                        </td>
                        <td>
                          <span className="stock-pill in-stock">Available</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Product Modal ── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                {editingProduct ? 'Edit Inventory Product' : 'Add New Product to Store'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              {/* Product Title / Name */}
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                  Product Title / Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certified Wheat Seeds HD-3086"
                  value={formData.name}
                  onChange={e => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Category & Unit in Two Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Category <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      background: '#fff',
                      outline: 'none',
                    }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Unit Packaging <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. per 50kg bag"
                    value={formData.unit}
                    onChange={e => {
                      setFormData({ ...formData, unit: e.target.value });
                      if (formErrors.unit) setFormErrors({ ...formErrors, unit: '' });
                    }}
                    list="preset-units"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formErrors.unit ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <datalist id="preset-units">
                    {PRESET_UNITS.map(u => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                  {formErrors.unit && (
                    <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px' }}>
                      {formErrors.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Stock in Two Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Price per Unit (₹) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 450"
                    value={formData.price}
                    onChange={e => {
                      setFormData({ ...formData, price: e.target.value });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formErrors.price ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  {formErrors.price && (
                    <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px' }}>
                      {formErrors.price}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Available Stock Quantity <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 25"
                    value={formData.stock}
                    onChange={e => {
                      setFormData({ ...formData, stock: e.target.value });
                      if (formErrors.stock) setFormErrors({ ...formErrors, stock: '' });
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formErrors.stock ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  {formErrors.stock && (
                    <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px' }}>
                      {formErrors.stock}
                    </span>
                  )}
                </div>
              </div>

              {/* Image URL with preset picker */}
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} /> Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/product-image.jpg"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Quick Presets:</span>
                  {PRESET_IMAGES.map(img => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        background: formData.imageUrl === img.url ? '#e8f5d6' : '#f1f5f9',
                        color: formData.imageUrl === img.url ? '#15803d' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                  Product Description & Usage Benefits
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details on dosage, target crops, seed germination rate, or storage tips..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Actions */}
              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ minWidth: '130px' }}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update Product'
                    : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deletingProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '32px 24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Delete Product?
            </h3>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>? This will remove the item from
              the live database and public storefront.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Machinery Modal (POST /api/machinery) ── */}
      {showAddMachineryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Register CHC Farm Machinery
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Persists to Supabase Machinery table linked to your authenticated owner account.
                </p>
              </div>
              <button
                onClick={() => setShowAddMachineryModal(false)}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMachinery} className="modal-form">
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                  Equipment Model / Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra 575 DI Tractor with Rotavator"
                  value={machineryForm.title}
                  onChange={e => setMachineryForm({ ...machineryForm, title: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Machine Type
                  </label>
                  <select
                    value={machineryForm.machineType}
                    onChange={e => setMachineryForm({ ...machineryForm, machineType: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#fff',
                    }}
                  >
                    <option value="Tractor">Tractor</option>
                    <option value="Combine Harvester">Combine Harvester</option>
                    <option value="Rotavator">Rotavator</option>
                    <option value="Power Tiller">Power Tiller</option>
                    <option value="Laser Land Leveller">Laser Land Leveller</option>
                    <option value="Seed Drill">Seed Drill</option>
                    <option value="Boom Sprayer">Boom Sprayer</option>
                    <option value="Agri Drone">Agri Drone</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Hourly Rate (₹) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    placeholder="e.g. 500"
                    value={machineryForm.ratePerHour}
                    onChange={e => setMachineryForm({ ...machineryForm, ratePerHour: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    District / Operating Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Meerut"
                    value={machineryForm.district}
                    onChange={e => setMachineryForm({ ...machineryForm, district: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Contact Phone Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={machineryForm.contactPhone}
                    onChange={e => setMachineryForm({ ...machineryForm, contactPhone: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMachineryModal(false)}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ minWidth: '150px', background: '#15803d', color: '#fff' }}
                >
                  {isSubmitting ? 'Saving...' : 'Register Machinery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Labour Post Modal (POST /api/labour) ── */}
      {showAddLabourModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Post Farm Labour Squad
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Persists to Supabase LabourPost table linked to your authenticated provider account.
                </p>
              </div>
              <button
                onClick={() => setShowAddLabourModal(false)}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLabour} className="modal-form">
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                  Squad / Team Leader Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar Harvesting Team"
                  value={labourForm.leaderName}
                  onChange={e => setLabourForm({ ...labourForm, leaderName: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Group Size (Workers) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 6"
                    value={labourForm.groupSize}
                    onChange={e => setLabourForm({ ...labourForm, groupSize: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Wage per Worker/Day (₹) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 400"
                    value={labourForm.wagePerDay}
                    onChange={e => setLabourForm({ ...labourForm, wagePerDay: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                  Primary Specialization / Skills <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wheat Harvesting, Paddy Transplantation, Weeding"
                  value={labourForm.primarySkill}
                  onChange={e => setLabourForm({ ...labourForm, primarySkill: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    District / Operating Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Meerut"
                    value={labourForm.district}
                    onChange={e => setLabourForm({ ...labourForm, district: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    Contact Phone Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={labourForm.phone}
                    onChange={e => setLabourForm({ ...labourForm, phone: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddLabourModal(false)}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ minWidth: '150px', background: '#15803d', color: '#fff' }}
                >
                  {isSubmitting ? 'Posting...' : 'Post Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
