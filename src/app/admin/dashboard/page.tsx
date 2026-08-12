"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCurrentAdmin, adminLogout, getVendors, getProducts, getOrders,
  toggleVendorVerification, toggleProductBanned, updateOrderStatus, getPlatformAnalytics,
  type ExtendedVendor, type ExtendedProduct, type Order, type OrderStatus
} from '@/lib/ecommerce-service';
import { Shield, Users, Store, Package, ShoppingBag, TrendingUp, CheckCircle2, AlertTriangle, Ban, LogOut, Check, X, Search, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'dealers' | 'products' | 'orders'>('analytics');

  const [analytics, setAnalytics] = useState<any | null>(null);
  const [vendors, setVendors] = useState<ExtendedVendor[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const current = getCurrentAdmin();
    if (!current) {
      router.push('/'); // Redirect unauthorized direct access to home page
      return;
    }
    setAdmin(current);
    refreshData();
  }, [router]);

  const refreshData = () => {
    setAnalytics(getPlatformAnalytics());
    setVendors(getVendors());
    setProducts(getProducts());
    setOrders(getOrders());
  };

  const handleLogout = () => {
    adminLogout();
    router.push('/');
  };

  const handleToggleAccreditation = (vendorId: string) => {
    toggleVendorVerification(vendorId);
    refreshData();
  };

  const handleToggleBan = (productId: string) => {
    toggleProductBanned(productId);
    refreshData();
  };

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    refreshData();
  };

  if (!admin) return null;

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase()) ||
    v.license.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="admin-dashboard-page">
      {/* ── Admin Header ── */}
      <header className="admin-header">
        <div className="container admin-header-inner">
          <div className="admin-title-badge">
            <div className="admin-shield-icon">
              <Shield size={28} color="#38bdf8" />
            </div>
            <div>
              <h2>Platform Admin Master Panel</h2>
              <p>Statewide Accreditation, Product Quality Audit & Regional Pipeline Control</p>
            </div>
          </div>

          <div className="admin-actions">
            <button onClick={refreshData} className="btn btn-outline btn-sm" style={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
              <RefreshCw size={16} /> Sync Live Data
            </button>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <LogOut size={16} /> Exit Admin Panel
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '30px 20px 80px' }}>
        {/* ── Metric Summary Overview Cards ── */}
        {analytics && (
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="am-icon blue"><Users size={24} /></div>
              <div>
                <div className="am-val">{analytics.totalFarmers.toLocaleString()}</div>
                <div className="am-lbl">Total Registered Farmers</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="am-icon green"><Store size={24} /></div>
              <div>
                <div className="am-val">{analytics.activeDealers} / {analytics.registeredDealers}</div>
                <div className="am-lbl">Accredited Local Dealers</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="am-icon orange"><ShoppingBag size={24} /></div>
              <div>
                <div className="am-val">{analytics.totalOrders.toLocaleString()}</div>
                <div className="am-lbl">Regional Platform Orders</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="am-icon purple"><TrendingUp size={24} /></div>
              <div>
                <div className="am-val">₹{analytics.totalGMV.toLocaleString()}</div>
                <div className="am-lbl">Platform Gross Volume</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation Tabs ── */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn${activeTab === 'analytics' ? ' active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={18} /> Regional Analytics
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'dealers' ? ' active' : ''}`}
            onClick={() => setActiveTab('dealers')}
          >
            <Store size={18} /> Dealer Accreditation ({vendors.length})
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'products' ? ' active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} /> Catalog Moderation ({products.length})
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Order Supervision ({orders.length})
          </button>
        </div>

        {/* ── TAB 1: Analytics Overview ── */}
        {activeTab === 'analytics' && analytics && (
          <div className="analytics-overview-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#f8fafc' }}>
              📊 Uttar Pradesh Regional Engagement & District Breakdown
            </h3>
            <div className="district-stats-grid">
              <div className="district-stat-box">
                <div className="dist-name">📍 Meerut District</div>
                <div className="dist-meta">
                  <span>Dealers: <strong>3 Active</strong></span>
                  <span>Volume: <strong>₹1,45,200</strong></span>
                  <span>Farmers: <strong>14,200</strong></span>
                </div>
              </div>

              <div className="district-stat-box">
                <div className="dist-name">📍 Agra District</div>
                <div className="dist-meta">
                  <span>Dealers: <strong>2 Active</strong></span>
                  <span>Volume: <strong>₹98,500</strong></span>
                  <span>Farmers: <strong>11,400</strong></span>
                </div>
              </div>

              <div className="district-stat-box">
                <div className="dist-name">📍 Lucknow District</div>
                <div className="dist-meta">
                  <span>Dealers: <strong>2 Active</strong></span>
                  <span>Volume: <strong>₹1,12,000</strong></span>
                  <span>Farmers: <strong>12,800</strong></span>
                </div>
              </div>

              <div className="district-stat-box">
                <div className="dist-name">📍 Kanpur District</div>
                <div className="dist-meta">
                  <span>Dealers: <strong>1 Pending</strong></span>
                  <span>Volume: <strong>₹64,300</strong></span>
                  <span>Farmers: <strong>8,900</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Dealer Accreditation ── */}
        {activeTab === 'dealers' && (
          <div>
            <div className="admin-section-header">
              <h3>Dealer Accreditation & License Verification</h3>
              <div className="admin-search-wrap">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search store, district or license..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Store Name & Owner</th>
                    <th>District</th>
                    <th>License Number</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map(v => (
                    <tr key={v.id}>
                      <td>
                        <strong style={{ color: '#f8fafc' }}>{v.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Owner: {v.ownerName} • 📞 {v.phone}</div>
                      </td>
                      <td>📍 {v.district}</td>
                      <td><code style={{ background: '#0f172a', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' }}>{v.license}</code></td>
                      <td>
                        <span className={`accreditation-tag ${v.accreditationStatus.toLowerCase()}`}>
                          {v.accreditationStatus === 'Verified' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          {v.accreditationStatus}
                        </span>
                      </td>
                      <td>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => handleToggleAccreditation(v.id)}
                          className={`btn btn-sm ${v.accreditationStatus === 'Verified' ? 'btn-danger' : 'btn-primary'}`}
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        >
                          {v.accreditationStatus === 'Verified' ? 'Revoke Status' : 'Approve & Grant Accreditation'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: Catalog Moderation ── */}
        {activeTab === 'products' && (
          <div>
            <div className="admin-section-header">
              <h3>Catalog Moderation & Banned Chemical Audit</h3>
              <div className="admin-search-wrap">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search product or chemical..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Brand</th>
                    <th>Safety Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#f8fafc' }}>{p.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.nameHi}</div>
                      </td>
                      <td><span className="cat-pill">{p.category}</span></td>
                      <td><strong>₹{p.price}</strong> <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.unit}</span></td>
                      <td>{p.brand}</td>
                      <td>
                        {p.banned ? (
                          <span className="accreditation-tag rejected"><Ban size={13} /> Flagged / Banned</span>
                        ) : (
                          <span className="accreditation-tag verified"><CheckCircle2 size={13} /> Passed Safety Audit</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleBan(p.id)}
                          className={`btn btn-sm ${p.banned ? 'btn-success' : 'btn-danger'}`}
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        >
                          {p.banned ? 'Unban & Restore' : 'Flag & Ban Product'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: Order Supervision ── */}
        {activeTab === 'orders' && (
          <div>
            <div className="admin-section-header">
              <h3>Global Order Pipeline Supervision</h3>
              <div className="admin-search-wrap">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search order ID or customer..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer & Address</th>
                    <th>Seller Store</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Supervision Override</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{ color: '#38bdf8' }}>#{o.id}</strong></td>
                      <td>
                        <strong style={{ color: '#f8fafc' }}>{o.customerName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {o.district} • 📞 {o.customerPhone}</div>
                      </td>
                      <td>{o.vendorName}</td>
                      <td><strong>₹{o.totalAmount}</strong></td>
                      <td>
                        <span className={`status-badge ${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={e => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                          className="status-select"
                          style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
