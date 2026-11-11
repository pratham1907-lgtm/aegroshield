"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  X,
  FileText,
  Printer,
} from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';

interface OrderItem {
  productId?: string;
  name?: string;
  title?: string;
  price?: number;
  unitPrice?: number;
  quantity?: number;
  unit?: string;
  category?: string;
  image?: string;
  imageUrl?: string;
  sellerId?: string;
}

interface OrderRecord {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  customerName?: string;
  customerPhone?: string;
  district?: string;
  pincode?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; labelHi: string; color: string; bg: string; border: string; step: number; icon: any }
> = {
  PENDING: {
    label: 'Order Placed',
    labelHi: 'ऑर्डर दर्ज हुआ',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
    step: 1,
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed by Seller',
    labelHi: 'दुकानदार द्वारा स्वीकृत',
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#bfdbfe',
    step: 2,
    icon: ShieldCheck,
  },
  DISPATCHED: {
    label: 'Dispatched / In Transit',
    labelHi: 'डिलीवरी के लिए रवाना',
    color: '#7c3aed',
    bg: '#ede9fe',
    border: '#ddd6fe',
    step: 3,
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    labelHi: 'सफलतापूर्वक प्राप्त',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
    step: 4,
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    labelHi: 'रद्द किया गया',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fecaca',
    step: 0,
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setLoading(true);
      setErrorMsg(null);

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch orders');
      }

      setOrders(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      console.error('[OrdersPage] Fetch error:', err);
      setErrorMsg(err?.message || 'Orders load nahi ho paye. Kripya punah prayas karein.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchOrders();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm(
      'Kya aap sach me is order ko cancel karna chahte hain? (Are you sure you want to cancel this order?)'
    );
    if (!confirmCancel) return;

    setCancellingId(orderId);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Authentication required');

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          status: 'CANCELLED',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Order cancellation failed');
      }

      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch (err: any) {
      alert('Cancellation error: ' + (err?.message || 'Server error'));
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'DISPATCHED'].includes(order.status);
    }
    if (filter === 'DELIVERED') return order.status === 'DELIVERED';
    if (filter === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>
      {/* ── Page Header ── */}
      <section style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: '#fff', padding: '36px 20px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Link href="/store" style={{ color: '#bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.86rem', textDecoration: 'none' }}>
                  <ArrowLeft size={16} /> Back to Agri-Store
                </Link>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                📦 My Orders &amp; Delivery Tracking
              </h1>
              <p style={{ color: '#dcfce7', fontSize: '0.95rem', margin: '6px 0 0' }}>
                Apne sabhi marketplace orders aur live dispatch status yahan track karein.
              </p>
            </div>

            <button
              onClick={() => fetchOrders()}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>

          {/* ── Filter Tabs ── */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '28px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Orders', count: orders.length },
              { id: 'ACTIVE', label: 'In Progress 🚚', count: orders.filter(o => ['PENDING', 'CONFIRMED', 'DISPATCHED'].includes(o.status)).length },
              { id: 'DELIVERED', label: 'Delivered ✅', count: orders.filter(o => o.status === 'DELIVERED').length },
              { id: 'CANCELLED', label: 'Cancelled ❌', count: orders.filter(o => o.status === 'CANCELLED').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  background: filter === tab.id ? '#ffffff' : 'rgba(255,255,255,0.14)',
                  color: filter === tab.id ? '#14532d' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
                <span style={{
                  background: filter === tab.id ? '#dcfce7' : 'rgba(0,0,0,0.2)',
                  color: filter === tab.id ? '#15803d' : '#fff',
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Orders Container ── */}
      <section style={{ maxWidth: '1000px', margin: '-24px auto 0', padding: '0 20px' }}>
        {/* Not Logged In State */}
        {isAuthenticated === false && (
          <div style={{ background: '#fff', borderRadius: '18px', padding: '50px 24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Sign In Required to View Orders
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Apne pichle orders aur delivery updates dekhne ke liye kripya apne registered account se login karein.
            </p>
            <Link
              href="/login"
              style={{
                background: '#15803d',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '10px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Sign In to Your Account →
            </Link>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && isAuthenticated !== false && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map(n => (
              <div key={n} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '20px', width: '35%', background: '#f1f5f9', borderRadius: '6px', marginBottom: '12px' }} />
                <div style={{ height: '14px', width: '20%', background: '#f8fafc', borderRadius: '4px', marginBottom: '20px' }} />
                <div style={{ height: '60px', width: '100%', background: '#f8fafc', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty Orders State */}
        {!loading && isAuthenticated && filteredOrders.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '18px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛒</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              {filter === 'ALL' ? 'Koi Order Darj Nahi Hai' : `No ${filter.toLowerCase()} orders found.`}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 24px' }}>
              Aapne abhi tak koi fasal beej ya khad ka order nahi lagaya hai. Local verified agri-stores se behtareen daam par order karein.
            </p>
            <Link
              href="/store"
              style={{
                background: '#15803d',
                color: '#fff',
                padding: '12px 26px',
                borderRadius: '10px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShoppingBag size={18} /> Explore Local Agri-Store
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && isAuthenticated && filteredOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Order Top Bar */}
                  <div
                    style={{
                      padding: '16px 22px',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '14px',
                          }}
                        >
                          <StatusIcon size={14} />
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                        Placed on {orderDate} • {order.paymentMethod || 'Cash on Delivery (COD)'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Total Amount
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Visual Stepper Tracker (for non-cancelled orders) */}
                  {order.status !== 'CANCELLED' && (
                    <div style={{ padding: '20px 24px 16px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative' }}>
                        {[
                          { step: 1, name: 'Placed', nameHi: 'दर्ज' },
                          { step: 2, name: 'Confirmed', nameHi: 'स्वीकृत' },
                          { step: 3, name: 'Dispatched', nameHi: 'रवाना' },
                          { step: 4, name: 'Delivered', nameHi: 'प्राप्त' },
                        ].map((s, idx) => {
                          const isDone = cfg.step >= s.step;
                          const isCurrent = cfg.step === s.step;

                          return (
                            <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  margin: '0 auto 6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  background: isDone ? '#16a34a' : '#e2e8f0',
                                  color: isDone ? '#ffffff' : '#64748b',
                                  boxShadow: isCurrent ? '0 0 0 4px #bbf7d0' : 'none',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {isDone ? '✓' : s.step}
                              </div>
                              <div style={{ fontSize: '0.76rem', fontWeight: isDone ? 700 : 500, color: isDone ? '#1e293b' : '#94a3b8' }}>
                                {s.name}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: isDone ? '#15803d' : '#94a3b8' }}>
                                {s.nameHi}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div style={{ padding: '18px 22px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Purchased Items ({items.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8fafc',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '8px',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              {item.image || item.imageUrl ? (
                                <img
                                  src={item.image || item.imageUrl}
                                  alt={item.name || item.title || 'Product'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                '🌾'
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>
                                {item.name || item.title || 'Agricultural Product'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Qty: {item.quantity || 1} • {item.unit || 'unit'} • ₹{Number(item.price || item.unitPrice || 0)} each
                              </div>
                            </div>
                          </div>

                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            ₹{Number((item.price || item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address & Actions Footer */}
                  <div
                    style={{
                      padding: '14px 22px',
                      background: '#f8fafc',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.84rem' }}>
                      <MapPin size={15} color="#15803d" />
                      <span>
                        Deliver to: <strong>{order.customerName || 'Customer'}</strong> ({order.shippingAddress})
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Download / Print Tax Invoice Action */}
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        style={{
                          fontSize: '0.82rem',
                          color: '#0f172a',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Printer size={13} color="#15803d" /> Invoice (रसीद)
                      </button>

                      {/* Help / WhatsApp Support */}
                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(`Namaste AegroShield, mujhe mere Order #${order.id.slice(-8).toUpperCase()} ke baare me jankari chahiye.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.82rem',
                          color: '#15803d',
                          textDecoration: 'none',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          background: '#f0fdf4',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Phone size={13} /> Support
                      </a>

                      {/* Cancel Order Action */}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={13} />
                          {cancellingId === order.id ? 'Cancelling…' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* Printable Tax Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </main>
  );
}
