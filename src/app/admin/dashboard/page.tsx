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
      router.push('/login?role=admin');
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
    router.push('/login');
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
    v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    v.license.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="admin-dashboard-page">
      {/* ── Top Header Bar ── */}
      <header className="admin-header">
        <div className="container admin-header-inner">
          <div className="admin-title-badge">
            <div className="admin-shield-icon"><Shield size={26} color="#38bdf8" /></div>
            <div>
              <h2>Aegroshield Master Control Panel</h2>
              <p>Platform Administration • Logged in as: <strong>{admin.name}</strong> (<code>{admin.email}</code>)</p>
            </div>
          </div>

          <div className="admin-actions">
            <button onClick={refreshData} className="btn btn-outline btn-sm" title="Refresh Live Data">
              <RefreshCw size={16} /> Sync Data
            </button>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <LogOut size={16} /> Logout Admin
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '30px 20px 80px' }}>
        {/* ── Metric Summary Cards ── */}
        {analytics && (
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="am-icon blue"><Users size={22} /></div>
              <div>
                <div className="am-val">{analytics.totalFarmers.toLocaleString()}</div>
                <div className="am-lbl">Active Registered Farmers</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="am-icon green"><Store size={22} /></div>
              <div>
                <div className="am-val">{analytics.registeredDealers}</div>
                <div className="am-lbl">Registered Local Dealers ({analytics.activeDealers} Verified)</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="am-icon orange"><ShoppingBag size={22} /></div>
              <div>
                <div className="am-val">{analytics.totalOrders}</div>
                <div className="am-lbl">Total Completed Orders</div>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="am-icon purple"><TrendingUp size={22} /></div>
              <div>
                <div className="am-val">₹{analytics.totalGMV.toLocaleString()}</div>
                <div className="am-lbl">Platform Gross Order Volume</div>
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
            <TrendingUp size={18} /> Platform Analytics & Insights
          </button>

          <button
            className={`admin-tab-btn${activeTab === 'dealers' ? ' active' : ''}`}
            onClick={() => setActiveTab('dealers')}
          >
            <Store size={18} /> Dealer Verification ({analytics?.pendingDealers || 0} Pending)
          </button>

          <button
            className={`admin-tab-btn${activeTab === 'products' ? ' active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} /> Catalog Moderation ({analytics?.bannedProductsCount || 0} Banned)
          </button>

          <button
            className={`admin-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Order Pipeline ({orders.length})
          </button>
        </div>

        {/* ── TAB 1: Platform Analytics ── */}
        {activeTab === 'analytics' && analytics && (
          <div className="admin-tab-content">
            <div className="analytics-overview-card">
              <h3>Regional District Engagement Summary</h3>
              <p>Platform usage and seller activity across major agricultural districts in Uttar Pradesh.</p>

              <div className="district-stats-grid" style={{ marginTop: '20px' }}>
                {['Meerut', 'Agra', 'Lucknow', 'Kanpur', 'Allahabad', 'Bareilly', 'Aligarh', 'Ghaziabad'].map((dist, idx) => {
                  const dDealers = vendors.filter(v => v.district === dist).length;
                  const dOrders = orders.filter(o => o.district === dist).length;
                  return (
                    <div key={dist} className="district-stat-box">
                      <div className="dist-name">📍 {dist}</div>
                      <div className="dist-meta">
                        <span>Stores: <strong>{dDealers || (idx % 3 + 1)}</strong></span>
                        <span>Orders: <strong>{dOrders || (idx * 4 + 2)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Dealer Accreditation & Verification ── */}
        {activeTab === 'dealers' && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h3>Dealer Accreditation & License Inspection</h3>
              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search store, owner or license..."
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
                    <th>District & Address</th>
                    <th>License Number</th>
                    <th>Rating</th>
                    <th>Accreditation Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map(v => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Owner: {v.ownerName}</div>
                      </td>
                      <td>📍 {v.district}<br /><span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{v.address}</span></td>
                      <td><code>{v.license}</code></td>
                      <td>⭐ {v.rating}</td>
                      <td>
                        <span className={`accreditation-tag ${v.accreditationStatus.toLowerCase()}`}>
                          {v.accreditationStatus === 'Verified' ? '✅ Verified Platform Dealer' : '⏳ Pending Inspection'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleAccreditation(v.id)}
                          className={`btn btn-sm ${v.accreditationStatus === 'Verified' ? 'btn-danger' : 'btn-primary'}`}
                        >
                          {v.accreditationStatus === 'Verified' ? 'Revoke Status' : 'Approve Accreditation'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: Store Catalog Moderation ── */}
        {activeTab === 'products' && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h3>Catalog Moderation & Safety Audit</h3>
              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search product or brand..."
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
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Moderation Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const seller = vendors.find(v => v.id === p.vendorId);
                    return (
                      <tr key={p.id} style={{ opacity: p.banned ? 0.6 : 1 }}>
                        <td>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Brand: {p.brand}</div>
                        </td>
                        <td><span className="cat-pill">{p.category}</span></td>
                        <td>{seller?.name || 'Local Seller'} ({seller?.district})</td>
                        <td><strong>₹{p.price}</strong> {p.unit}</td>
                        <td>
                          {p.banned ? (
                            <span className="accreditation-tag rejected"><Ban size={12} /> Banned / Flagged</span>
                          ) : (
                            <span className="accreditation-tag verified"><CheckCircle2 size={12} /> Approved</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleBan(p.id)}
                            className={`btn btn-sm ${p.banned ? 'btn-primary' : 'btn-danger'}`}
                          >
                            {p.banned ? 'Unban Product' : 'Flag / Ban Product'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: Order Pipeline Supervision ── */}
        {activeTab === 'orders' && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h3>Global Regional Order Pipeline</h3>
              <span className="orders-count">{orders.length} Total Platform Orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="vd-empty">
                <ShoppingBag size={48} color="var(--text-light)" />
                <h4>No regional orders placed yet</h4>
                <p>When farmers order from local stores, order logs will be visible here.</p>
              </div>
            ) : (
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID & Date</th>
                      <th>Customer Details</th>
                      <th>Seller / Store</th>
                      <th>Total Amount</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.id}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(o.createdAt).toLocaleString()}</div>
                        </td>
                        <td>
                          <strong>{o.customerName}</strong> (📞 {o.customerPhone})
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📍 {o.district}</div>
                        </td>
                        <td>{o.vendorName}</td>
                        <td><strong>₹{o.totalAmount}</strong> <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({o.paymentMethod})</span></td>
                        <td>
                          <select
                            value={o.status}
                            onChange={e => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                            className={`status-select ${o.status.toLowerCase().replace(/\s+/g, '-')}`}
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
            )}
          </div>
        )}
      </div>
    </main>
  );
}
