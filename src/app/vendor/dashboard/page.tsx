"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCurrentVendor, vendorLogout, getProductsByVendorId, getOrdersByVendorId,
  addProduct, updateProduct, deleteProduct, updateOrderStatus,
  type Order, type OrderStatus
} from '@/lib/ecommerce-service';
import type { Product, Category, Vendor } from '@/lib/marketplace-data';
import { Store, Package, ShoppingBag, Plus, Trash2, Edit, LogOut, CheckCircle, Clock, Truck, ShieldCheck, Eye } from 'lucide-react';

const CATEGORIES: Category[] = ['Fertilizer', 'Pesticide', 'Seed', 'Equipment'];

export default function VendorDashboardPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form State
  const [pForm, setPForm] = useState({
    name: '',
    nameHi: '',
    category: 'Fertilizer' as Category,
    price: '',
    unit: 'per 50kg bag',
    stock: 'In Stock' as 'In Stock' | 'Low Stock' | 'Out of Stock',
    brand: '',
    description: '',
    forCrops: 'Wheat, Rice',
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const current = getCurrentVendor();
    if (!current) {
      router.push('/vendor/login');
      return;
    }
    setVendor(current);
    loadVendorData(current.id);
  }, [router]);

  const loadVendorData = (vendorId: string) => {
    setProducts(getProductsByVendorId(vendorId));
    setOrders(getOrdersByVendorId(vendorId));
  };

  const handleLogout = () => {
    vendorLogout();
    router.push('/vendor/login');
  };

  // Add / Edit Product Submit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    const cropsArray = pForm.forCrops.split(',').map(c => c.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: pForm.name,
        nameHi: pForm.nameHi || pForm.name,
        category: pForm.category,
        price: Number(pForm.price) || 0,
        unit: pForm.unit,
        stock: pForm.stock,
        brand: pForm.brand,
        description: pForm.description,
        forCrops: cropsArray,
      });
    } else {
      addProduct({
        vendorId: vendor.id,
        name: pForm.name,
        nameHi: pForm.nameHi || pForm.name,
        category: pForm.category,
        price: Number(pForm.price) || 0,
        unit: pForm.unit,
        stock: pForm.stock,
        brand: pForm.brand,
        description: pForm.description,
        forCrops: cropsArray,
      });
    }

    setShowAddModal(false);
    setEditingProduct(null);
    resetForm();
    loadVendorData(vendor.id);
  };

  const resetForm = () => {
    setPForm({
      name: '',
      nameHi: '',
      category: 'Fertilizer',
      price: '',
      unit: 'per 50kg bag',
      stock: 'In Stock',
      brand: '',
      description: '',
      forCrops: 'Wheat, Rice',
    });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setPForm({
      name: product.name,
      nameHi: product.nameHi,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock,
      brand: product.brand,
      description: product.description,
      forCrops: product.forCrops.join(', '),
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (productId: string) => {
    if (confirm('Are you sure you want to delete this product from your store catalog?')) {
      deleteProduct(productId);
      if (vendor) loadVendorData(vendor.id);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (vendor) loadVendorData(vendor.id);
  };

  if (!vendor) return null;

  return (
    <main className="vendor-dashboard-page">
      {/* ── Dashboard Top Header ── */}
      <header className="vd-header">
        <div className="container vd-header-inner">
          <div className="vd-store-badge">
            <div className="vd-store-icon"><Store size={24} /></div>
            <div>
              <h2>{vendor.name} <ShieldCheck size={18} className="verified-icon" color="#22c55e" /></h2>
              <p>Owner: {vendor.ownerName} • 📍 {vendor.district} • License: <code>{vendor.license}</code></p>
            </div>
          </div>

          <div className="vd-actions">
            <Link href={`/store/${vendor.id}`} className="btn btn-outline btn-sm">
              <Eye size={16} /> View Storefront
            </Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '30px 20px 80px' }}>
        {/* ── Metric Summary Cards ── */}
        <div className="vd-metrics">
          <div className="metric-card">
            <div className="metric-icon green"><Package size={22} /></div>
            <div>
              <div className="metric-val">{products.length}</div>
              <div className="metric-lbl">Total Listed Products</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon orange"><ShoppingBag size={22} /></div>
            <div>
              <div className="metric-val">{orders.length}</div>
              <div className="metric-lbl">Customer Orders</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon blue"><Clock size={22} /></div>
            <div>
              <div className="metric-val">{orders.filter(o => o.status === 'Pending').length}</div>
              <div className="metric-lbl">Pending Orders</div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="vd-tabs">
          <button
            className={`vd-tab-btn${activeTab === 'products' ? ' active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} /> Product Catalog ({products.length})
          </button>
          <button
            className={`vd-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Orders ({orders.length})
          </button>
          <button
            className={`vd-tab-btn${activeTab === 'profile' ? ' active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Store size={18} /> Store Info & License
          </button>
        </div>

        {/* ── TAB 1: Product Catalog ── */}
        {activeTab === 'products' && (
          <div className="vd-tab-content">
            <div className="vd-section-header">
              <h3>Inventory & Products</h3>
              <button onClick={() => { setEditingProduct(null); resetForm(); setShowAddModal(true); }} className="btn btn-primary">
                <Plus size={18} /> Add New Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="vd-empty">
                <Package size={48} color="var(--text-light)" />
                <h4>No products listed yet</h4>
                <p>Click "Add New Product" to list fertilizers, seeds or tools in your store.</p>
              </div>
            ) : (
              <div className="vd-product-table-wrap">
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price & Unit</th>
                      <th>Stock</th>
                      <th>Brand</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{p.nameHi}</div>
                        </td>
                        <td><span className="cat-pill">{p.category}</span></td>
                        <td><strong>₹{p.price}</strong> <span style={{ fontSize: '0.8rem', color: '#666' }}>{p.unit}</span></td>
                        <td>
                          <span className={`stock-pill ${p.stock.toLowerCase().replace(/\s+/g, '-')}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>{p.brand}</td>
                        <td>
                          <div className="vd-btn-group">
                            <button onClick={() => handleEditClick(p)} className="btn-icon blue" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteClick(p.id)} className="btn-icon red" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Orders ── */}
        {activeTab === 'orders' && (
          <div className="vd-tab-content">
            <div className="vd-section-header">
              <h3>Incoming Customer Orders</h3>
              <span className="orders-count">{orders.length} Total Orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="vd-empty">
                <ShoppingBag size={48} color="var(--text-light)" />
                <h4>No orders received yet</h4>
                <p>When local farmers place orders from your store page, they will show up here.</p>
              </div>
            ) : (
              <div className="vd-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">#{order.id}</span>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="order-status-selector">
                        <label>Status:</label>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`status-select ${order.status.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="order-card-body">
                      <div className="customer-info">
                        <strong>👤 {order.customerName}</strong>
                        <div>📞 Phone: <code>{order.customerPhone}</code></div>
                        <div>📍 Address: {order.deliveryAddress}, {order.district} - {order.pincode}</div>
                        <div>💳 Payment: <strong>{order.paymentMethod}</strong></div>
                      </div>

                      <div className="order-items-list">
                        <h5>Ordered Items:</h5>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>{item.quantity}x {item.product.name} ({item.product.unit})</span>
                            <strong>₹{item.unitPrice * item.quantity}</strong>
                          </div>
                        ))}
                        <div className="order-total-row">
                          <span>Total Amount:</span>
                          <strong>₹{order.totalAmount}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Store Profile ── */}
        {activeTab === 'profile' && (
          <div className="vd-tab-content">
            <div className="profile-card">
              <h3>Store Profile Details</h3>
              <div className="profile-grid">
                <div><strong>Store Name:</strong> {vendor.name}</div>
                <div><strong>Owner Name:</strong> {vendor.ownerName}</div>
                <div><strong>District:</strong> {vendor.district}</div>
                <div><strong>Address:</strong> {vendor.address}</div>
                <div><strong>Contact Phone:</strong> {vendor.phone}</div>
                <div><strong>License Number:</strong> <code>{vendor.license}</code></div>
                <div><strong>Verification Status:</strong> <span className="verified-badge">✅ Verified Seller</span></div>
                <div><strong>Store Rating:</strong> ⭐ {vendor.rating} / 5.0</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Product Modal ── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowAddModal(false)} className="close-modal-btn">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-group">
                <label>Product Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Neem Coated Urea"
                  value={pForm.name}
                  onChange={e => setPForm({ ...pForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Name (Hindi)</label>
                <input
                  type="text"
                  placeholder="e.g. नीम लेपित यूरिया"
                  value={pForm.nameHi}
                  onChange={e => setPForm({ ...pForm, nameHi: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={pForm.category}
                    onChange={e => setPForm({ ...pForm, category: e.target.value as Category })}
                    className="mp-select"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock Status *</label>
                  <select
                    value={pForm.stock}
                    onChange={e => setPForm({ ...pForm, stock: e.target.value as any })}
                    className="mp-select"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="266"
                    value={pForm.price}
                    onChange={e => setPForm({ ...pForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit Packaging *</label>
                  <input
                    type="text"
                    placeholder="e.g. per 45kg bag, per litre"
                    value={pForm.unit}
                    onChange={e => setPForm({ ...pForm, unit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Brand / Manufacturer *</label>
                <input
                  type="text"
                  placeholder="e.g. IFFCO, Bayer, Tata"
                  value={pForm.brand}
                  onChange={e => setPForm({ ...pForm, brand: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Recommended for Crops (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Wheat, Rice, Sugarcane"
                  value={pForm.forCrops}
                  onChange={e => setPForm({ ...pForm, forCrops: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of product benefits..."
                  value={pForm.description}
                  onChange={e => setPForm({ ...pForm, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
