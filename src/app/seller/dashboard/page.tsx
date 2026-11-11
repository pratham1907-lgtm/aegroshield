"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Layers,
  Image as ImageIcon,
  Check,
  Building2,
  Truck,
  Phone,
  ShoppingBag,
  Clock,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import FileUploader from '@/components/FileUploader';

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


  // Inventory State
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED'>('ALL');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
      setError('Unable to load products. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, sellerSession]);

  // Fetch vendor-specific incoming customer orders from /api/orders?asSeller=true
  const fetchSellerOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/orders?asSeller=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('[SellerDashboard] Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchSellerOrders();
  }, [fetchProducts, fetchSellerOrders]);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Authentication required');
      const token = await currentUser.getIdToken();

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }

      showToast(`Order status updated to ${nextStatus}!`, 'success');
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

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

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'ALL') return orders;
    return orders.filter(o => o.status === orderFilter);
  }, [orders, orderFilter]);

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
      const token = await auth.currentUser?.getIdToken();

      if (editingProduct) {
        if (!token) {
          showToast('Authentication required: Please sign in to edit products.', 'error');
          return;
        }

        // PUT update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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

        if (!token) {
          showToast('Authentication required: Please sign in as a verified seller to add products.', 'error');
          return;
        }

        const activeUid = auth.currentUser?.uid || user?.uid || sessionUser?.id || '';
        const activeEmail = auth.currentUser?.email || user?.email || sessionUser?.email || '';
        const activeName = auth.currentUser?.displayName || user?.displayName || sessionSeller?.ownerName || sessionUser?.name || 'Store Owner';
        const activePhone = sessionSeller?.phone || sessionUser?.phone || '';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
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


  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        showToast('Authentication required: Please sign in to delete products.', 'error');
        return;
      }

      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();

      if (json.success) {
        showToast(`Product "${deletingProduct.name}" deleted successfully.`);
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
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        showToast('Authentication required: Please sign in to adjust stock.', 'error');
        return;
      }

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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


  // Resolve authentic seller profile from live inventory, seller session, or user details
  const activeSeller =
    products.find(p => p.seller)?.seller ||
    sellerSession?.seller ||
    sellerDoc;

  const userRealName =
    activeSeller?.ownerName ||
    userData?.name ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Store Owner';

  const sellerStoreName =
    activeSeller?.storeName ||
    userData?.storeName ||
    sellerSession?.seller?.storeName ||
    (userRealName && userRealName !== 'Store Owner' ? `${userRealName}'s Farm Store` : 'AgriShield Farm Store');

  const sellerOwner = userRealName;

  const sellerDistrict =
    activeSeller?.district ||
    userData?.district ||
    sellerSession?.seller?.district ||
    'Meerut';

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
                Owner: <strong>{sellerOwner}</strong> • 📍 {sellerDistrict}
              </p>
            </div>
          </div>

          <div className="vd-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchProducts(true)}
              disabled={refreshing}
              className="btn btn-outline btn-sm"
              title="Refresh store inventory"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Sync'}
            </button>

            <button
              onClick={handleOpenAddModal}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '28px' }}>
        {/* ── Dashboard Tab Selector ── */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.98rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'products' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'products' ? '#16a34a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginBottom: '-2px',
            }}
          >
            <Package size={18} />
            <span>Product Inventory ({products.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              if (orders.length === 0) fetchSellerOrders();
            }}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.98rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'orders' ? '#16a34a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginBottom: '-2px',
            }}
          >
            <ShoppingBag size={18} />
            <span>Customer Orders ({orders.length})</span>
            {orders.filter(o => o.status === 'PENDING').length > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {orders.filter(o => o.status === 'PENDING').length} new
              </span>
            )}
          </button>
        </div>

        {activeTab === 'products' && (
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
          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
            ⚡ Synchronized with Live Store Inventory
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

        {/* ── Tab 2: Orders Fulfillment ── */}
        {activeTab === 'orders' && (
          <div>
            {/* Orders Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div className="metric-card">
                <div className="metric-icon blue">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="metric-val">{orders.length}</div>
                  <div className="metric-lbl">Total Orders Received</div>
                </div>
              </div>

              <div className="metric-card">
                <div
                  className="metric-icon"
                  style={{
                    background: orders.filter(o => o.status === 'PENDING').length > 0 ? '#fef3c7' : '#f1f5f9',
                    color: '#d97706',
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <div
                    className="metric-val"
                    style={{
                      color: orders.filter(o => o.status === 'PENDING').length > 0 ? '#d97706' : undefined,
                    }}
                  >
                    {orders.filter(o => o.status === 'PENDING').length}
                  </div>
                  <div className="metric-lbl">Action Required (Pending)</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon purple" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                  <Truck size={22} />
                </div>
                <div>
                  <div className="metric-val">{orders.filter(o => o.status === 'DISPATCHED').length}</div>
                  <div className="metric-lbl">In Transit / Dispatched</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon green">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="metric-val">{orders.filter(o => o.status === 'DELIVERED').length}</div>
                  <div className="metric-lbl">Fulfilled / Delivered</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon orange">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className="metric-val">
                    ₹{orders
                      .filter(o => o.status !== 'CANCELLED')
                      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="metric-lbl">Total Order Volume</div>
                </div>
              </div>
            </div>

            {/* Orders Filter & Actions Bar */}
            <div
              style={{
                background: '#fff',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['ALL', 'PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'] as const).map(st => {
                  const count = st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length;
                  const isActive = orderFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isActive ? '1px solid #16a34a' : '1px solid #cbd5e1',
                        background: isActive ? '#16a34a' : '#fff',
                        color: isActive ? '#fff' : '#475569',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{st === 'ALL' ? 'All Orders' : st}</span>
                      <span
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                          color: isActive ? '#fff' : '#64748b',
                          padding: '1px 7px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={fetchSellerOrders}
                disabled={ordersLoading}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={ordersLoading ? 'animate-spin' : ''} />
                {ordersLoading ? 'Loading...' : 'Refresh Orders'}
              </button>
            </div>

            {/* Orders List */}
            {ordersLoading && orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#16a34a' }} />
                <p style={{ fontWeight: 600 }}>Loading incoming customer orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '50px 20px',
                  textAlign: 'center',
                }}
              >
                <ShoppingBag size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  No orders found in this category
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                  When farmers and customers place orders for items listed in your inventory, they will appear here with full delivery details and instant status updates.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map(order => {
                  const isUpdating = updatingOrderId === order.id;
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const customerPhone = order.user?.phone || '';
                  const customerName = order.user?.name || 'Customer / Farmer';
                  const cleanPhone = customerPhone.replace(/\D/g, '');
                  const itemsList = Array.isArray(order.items) ? order.items : [];

                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'PENDING':
                        return { label: 'Pending Acceptance', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
                      case 'CONFIRMED':
                        return { label: 'Confirmed & Packing', bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
                      case 'DISPATCHED':
                        return { label: 'Dispatched / In Transit', bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
                      case 'DELIVERED':
                        return { label: 'Delivered & Completed', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
                      case 'CANCELLED':
                        return { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
                      default:
                        return { label: status, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
                    }
                  };

                  const badge = getStatusBadge(order.status);

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      {/* Order Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '14px',
                          marginBottom: '16px',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>
                              Order #{order.id.slice(-8).toUpperCase()}
                            </span>
                            <span
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            Placed on {orderDate}
                          </div>
                        </div>

                        {/* Customer Direct Contact */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {cleanPhone && (
                            <>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="btn btn-outline btn-xs"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '0.8rem',
                                  padding: '5px 10px',
                                }}
                              >
                                <Phone size={13} />
                                <span>Call {customerPhone}</span>
                              </a>
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                  `Namaste ${customerName}, this is regarding your order #${order.id.slice(-6).toUpperCase()} on AegroShield.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-xs"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '0.8rem',
                                  padding: '5px 10px',
                                  color: '#16a34a',
                                  borderColor: '#86efac',
                                  background: '#f0fdf4',
                                }}
                              >
                                <MessageSquare size={13} />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Customer & Delivery Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '16px',
                          background: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          marginBottom: '16px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                            Customer Details
                          </div>
                          <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>{customerName}</div>
                          {order.user?.email && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.user.email}</div>
                          )}
                          {customerPhone && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Phone: {customerPhone}</div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                            Delivery Destination
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                            <MapPin size={15} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                              {order.shippingAddress || 'Store Pickup / Counter Delivery'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                            Payment & Value
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#16a34a', marginTop: '2px' }}>
                            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Method: <span style={{ fontWeight: 600, color: '#334155' }}>{order.paymentMethod || 'COD'}</span> • Status:{' '}
                            <span
                              style={{
                                fontWeight: 700,
                                color: order.paymentStatus === 'PAID' ? '#16a34a' : '#d97706',
                              }}
                            >
                              {order.paymentStatus || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Items in this Order ({itemsList.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {itemsList.map((item: any, idx: number) => (
                            <div
                              key={item.id || idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '0.88rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={15} style={{ color: '#16a34a' }} />
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                  {item.name || item.title || 'Product Item'}
                                </span>
                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                  × {item.quantity || 1}
                                </span>
                              </div>
                              <div style={{ fontWeight: 700, color: '#334155' }}>
                                ₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Fulfillment Action Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '14px',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Order Fulfillment Actions:
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {order.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                                disabled={isUpdating}
                                className="btn btn-outline btn-xs"
                                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                              >
                                Cancel Order
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                disabled={isUpdating}
                                className="btn btn-primary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                {isUpdating ? (
                                  <RefreshCw size={14} className="animate-spin" />
                                ) : (
                                  <Check size={15} />
                                )}
                                Accept & Confirm Order
                              </button>
                            </>
                          )}

                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'DISPATCHED')}
                              disabled={isUpdating}
                              className="btn btn-primary btn-sm"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#7e22ce',
                                borderColor: '#7e22ce',
                              }}
                            >
                              {isUpdating ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Truck size={15} />
                              )}
                              Dispatch / Out for Delivery
                            </button>
                          )}

                          {order.status === 'DISPATCHED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                              disabled={isUpdating}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              {isUpdating ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={15} />
                              )}
                              Mark as Delivered & Fulfilled
                            </button>
                          )}

                          {order.status === 'DELIVERED' && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#15803d',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                              }}
                            >
                              <CheckCircle2 size={16} /> Order Successfully Fulfilled
                            </div>
                          )}

                          {order.status === 'CANCELLED' && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#dc2626',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                              }}
                            >
                              <X size={16} /> Order Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

              {/* Product Photo Upload with preset picker */}
              <div className="form-group">
                <FileUploader
                  label="Product Photo (Optional)"
                  accept="image/*"
                  folder="products"
                  currentValue={formData.imageUrl}
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  onClear={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  helperText="Upload clear photo or packaging image (Max 5MB)"
                  allowManualUrl={true}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Or select a quick stock image:</span>
                  {PRESET_IMAGES.map(img => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: img.url }))}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        background: formData.imageUrl === img.url ? '#e8f5d6' : '#f1f5f9',
                        color: formData.imageUrl === img.url ? '#15803d' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: formData.imageUrl === img.url ? 600 : 400,
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
              the live store inventory.
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
    </main>
  );
}
