"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/context/AuthContext';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import {
  ShoppingBag,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Truck,
  CreditCard,
  QrCode,
  Loader2,
  Database,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, deliveryFee, grandTotal, clearCart, isLoaded } = useCart();
  const { user, userData } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    district: ALL_DISTRICTS[0] || 'Meerut',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery (COD)' | 'UPI / Pay on Delivery'>('Cash on Delivery (COD)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Auto-fill from user authentication session if available
  useEffect(() => {
    if (user || userData) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || userData?.name || user?.displayName || '',
        phone: prev.phone || userData?.phone || '',
      }));
    }
  }, [user, userData]);

  // If cart is still loading from localStorage, show brief loader instead of empty cart screen
  if (!isLoaded && !placedOrder) {
    return (
      <main className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <Loader2 size={36} className="spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500' }}>Loading your cart...</p>
      </main>
    );
  }

  if (cart.length === 0 && !placedOrder) {
    return (
      <main className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '16px', border: '1.5px solid #e5e7eb', maxWidth: '500px', margin: '0 auto' }}>
          <ShoppingBag size={56} color="var(--text-light)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: '24px' }}>
            Please add seeds, fertilizers or equipment to your cart before proceeding to checkout.
          </p>
          <Link href="/store" className="btn btn-primary">
            Browse Store →
          </Link>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMsg('Please fill in your name, mobile phone number, and delivery address.');
      return;
    }

    if (!cart || cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add products to your cart before proceeding.');
      return;
    }

    if (!auth.currentUser) {
      const wantsSignIn = confirm("A verified Google Account is required to place your order. Would you like to sign in with Google now?");
      if (wantsSignIn) {
        try {
          await signInWithGoogle();
        } catch (signInErr: any) {
          if (signInErr?.code !== 'auth/popup-closed-by-user') {
            alert("Google Sign-In failed: " + (signInErr?.message || "Please sign in to proceed."));
          }
          return;
        }
      } else {
        const signinReqMsg = "Sign-in required: Please sign in with Google to confirm your order.";
        setErrorMsg(signinReqMsg);
        alert(signinReqMsg);
        return;
      }
    }

    if (!auth.currentUser) {
      setErrorMsg("Sign-in required: Please sign in with Google to confirm your order.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Snapshot cart items with complete product details: productId, title, price, quantity, image
      const itemsSnapshot = cart.map(item => {
        const p = item.product;
        const imageUrl = (p as any).imageUrl || (p as any).image || '';
        return {
          productId: p.id,
          title: p.name,
          price: Number(p.price),
          quantity: Number(item.quantity),
          image: imageUrl,
          id: p.id,
          name: p.name,
          category: p.category || 'General',
          brand: p.brand || '',
          unit: p.unit || 'unit',
          vendorId: p.vendorId || '',
        };
      });

      const token = await auth.currentUser?.getIdToken();
      const activeUid = auth.currentUser?.uid || '';
      const activeEmail = auth.currentUser?.email || '';
      const activeName = auth.currentUser?.displayName || formData.name.trim() || 'Google User';
      const activePhone = formData.phone.trim() || auth.currentUser?.phoneNumber || '';

      const payload = {
        customerName: activeName,
        customerPhone: activePhone,
        shippingAddress: formData.address.trim(),
        district: formData.district,
        pincode: formData.pincode.trim() || '250001',
        paymentMethod: paymentMethod,
        items: itemsSnapshot,
        totalAmount: grandTotal,
        userId: activeUid,
        firebaseUid: activeUid,
        email: activeEmail,
        name: activeName,
        phone: activePhone,
      };

      console.log("[Checkout] Submitting order payload with Google user:", payload);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-firebase-uid': auth.currentUser?.uid || '',
          'x-user-email': auth.currentUser?.email || '',
          'x-user-name': encodeURIComponent(auth.currentUser?.displayName || formData.name || 'Google User'),
          'x-user-phone': activePhone,
        },
        body: JSON.stringify(payload),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error('[Checkout] Response JSON parse error:', parseErr);
        throw new Error(`Server returned status ${res.status}: ${res.statusText || 'Unexpected response'}`);
      }

      console.log("[Checkout] /api/orders response:", res.status, json);

      if (!res.ok || !json?.success) {
        const serverError = json?.error || `Order placement failed with status ${res.status}`;
        throw new Error(serverError);
      }

      setPlacedOrder(json.data);
      // Clear cart only after confirmed API success
      clearCart();
    } catch (err: any) {
      console.error('[Checkout] Order placement error:', err);
      const rawReason = err?.message || 'An unexpected error occurred while placing your order.';
      const formattedMessage = rawReason.startsWith('Failed:') ? rawReason : `Failed: ${rawReason}`;
      setErrorMsg(formattedMessage);
      alert(formattedMessage);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Confirmation Modal / Screen ──
  if (placedOrder) {
    const orderItems: any[] = Array.isArray(placedOrder.items) ? placedOrder.items : [];
    const formattedDate = placedOrder.createdAt
      ? new Date(placedOrder.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString();

    return (
      <main className="checkout-success-page" style={{ padding: '60px 20px', minHeight: '100vh', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="success-card" style={{ background: '#fff', borderRadius: '24px', padding: '36px', border: '1px solid #bbf7d0', boxShadow: '0 12px 36px rgba(34,197,94,0.1)' }}>
            
            {/* Header Icon */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.15)',
                }}
              >
                <CheckCircle size={46} />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#14532d', marginBottom: '6px' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                Thank you, <strong>{placedOrder.customerName}</strong>! Your order is registered and will be prepared by the seller.
              </p>
            </div>

            {/* Persistence & Order ID Banner */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '600', display: 'block' }}>
                  ORDER ID
                </span>
                <code style={{ fontSize: '1rem', fontWeight: '800', color: '#15803d' }}>
                  #{placedOrder.id}
                </code>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={14} color="#16a34a" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px' }}>
                  Saved in Supabase PostgreSQL
                </span>
              </div>
            </div>

            {/* Order Details Breakdown */}
            <div className="summary-box" style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                Delivery & Payment Summary
              </h4>

              <div className="sb-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{placedOrder.customerName} ({placedOrder.customerPhone})</strong>
              </div>

              <div className="sb-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Delivery Address:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%', color: '#1e293b', fontWeight: '600' }}>
                  {placedOrder.shippingAddress}
                </span>
              </div>

              <div className="sb-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <strong style={{ color: '#166534' }}>{placedOrder.paymentMethod}</strong>
              </div>

              <div className="sb-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Order Status:</span>
                <span className="status-badge pending" style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                  {placedOrder.status || 'PENDING'}
                </span>
              </div>

              <div className="sb-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Date:</span>
                <span style={{ color: '#1e293b' }}>{formattedDate}</span>
              </div>
            </div>

            {/* Items Ordered List */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                Items Ordered ({orderItems.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orderItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#1e293b' }}>{item.quantity}x {item.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                        {item.brand || item.category || 'Agri Product'} • ₹{item.price} / {item.unit || 'unit'}
                      </span>
                    </div>
                    <strong style={{ color: '#166534' }}>
                      ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '2px solid #e2e8f0',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  color: '#1e293b',
                }}
              >
                <span>Total Payable:</span>
                <span style={{ color: '#2D5F3F', fontSize: '1.35rem' }}>
                  ₹{Number(placedOrder.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/store"
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                }}
              >
                Continue Shopping
              </Link>
              <Link
                href="/market"
                className="btn btn-outline"
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                }}
              >
                Check Mandi Rates
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Checkout Form ──
  return (
    <main className="checkout-page">
      <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '920px' }}>
        <div className="cart-header">
          <Link href="/cart" className="back-link">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <h1>Checkout & Delivery Details</h1>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b',
              marginBottom: '20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        <div className="checkout-grid">
          {/* Delivery Details Form */}
          <form onSubmit={handlePlaceOrder} className="checkout-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Farmer Delivery Address</h3>
              {user && (
                <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                  Authenticated User
                </span>
              )}
            </div>

            <div className="form-group">
              <label><User size={15} /> Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label><Phone size={15} /> Mobile Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label><MapPin size={15} /> District *</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="mp-select"
                  disabled={isSubmitting}
                >
                  {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 250001"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Village / Landmark / Field Address *</label>
              <textarea
                rows={3}
                placeholder="e.g. Near Primary School, Village Dabathwa, Meerut"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Payment Options Selection */}
            <div className="payment-method-box" style={{ marginTop: '12px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                Select Payment Option
              </h4>

              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: paymentMethod === 'Cash on Delivery (COD)' ? '2px solid #2D5F3F' : '1px solid #cbd5e1',
                  backgroundColor: paymentMethod === 'Cash on Delivery (COD)' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery (COD)'}
                  onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <label htmlFor="cod" style={{ cursor: 'pointer', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#1e293b', fontSize: '0.92rem' }}>💵 Cash on Delivery (COD)</strong>
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '8px', fontWeight: '700' }}>
                      RECOMMENDED
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                    Pay in cash directly to delivery personnel upon inspection at your farm.
                  </p>
                </label>
              </div>

              {/* UPI Option */}
              <div
                onClick={() => setPaymentMethod('UPI / Pay on Delivery')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: paymentMethod === 'UPI / Pay on Delivery' ? '2px solid #2D5F3F' : '1px solid #cbd5e1',
                  backgroundColor: paymentMethod === 'UPI / Pay on Delivery' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  id="upi"
                  name="payment"
                  checked={paymentMethod === 'UPI / Pay on Delivery'}
                  onChange={() => setPaymentMethod('UPI / Pay on Delivery')}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <label htmlFor="upi" style={{ cursor: 'pointer', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#1e293b', fontSize: '0.92rem' }}>📱 UPI / Pay on Delivery</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                    Scan QR code via Google Pay, PhonePe, or Paytm when products are handed over.
                  </p>
                </label>
              </div>
            </div>

            {errorMsg && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #ef4444',
                  borderRadius: '10px',
                  color: '#991b1b',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
                }}
              >
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-full btn-lg"
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.75 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Placing Order in Database...</span>
                </>
              ) : (
                <span>Confirm & Place Order (₹{grandTotal.toLocaleString()})</span>
              )}
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="cart-summary-card">
            <h3>Items in Order ({cart.length})</h3>

            <div className="checkout-items-mini" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {cart.map(item => (
                <div key={item.product.id} className="mini-item-row" style={{ paddingBottom: '8px', borderBottom: '1px dashed #f1f5f9' }}>
                  <div>
                    <strong>{item.quantity}x {item.product.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#666' }}>
                      ₹{item.product.price} {item.product.unit} • {item.product.category}
                    </div>
                  </div>
                  <strong>₹{(item.product.price * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Items Subtotal:</span>
              <strong>₹{cartTotal.toLocaleString()}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery Charges:</span>
              {deliveryFee === 0 ? (
                <strong style={{ color: '#22c55e' }}>FREE (Orders ₹500+)</strong>
              ) : (
                <strong>₹{deliveryFee}</strong>
              )}
            </div>

            <div className="summary-row total">
              <span>Total Payable:</span>
              <strong className="total-price">₹{grandTotal.toLocaleString()}</strong>
            </div>

            <div className="cod-badge-box">
              <ShieldCheck size={20} color="#22c55e" />
              <span>
                Orders are processed and fulfilled by verified local Kisan Seva stores with genuine product certificates.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
