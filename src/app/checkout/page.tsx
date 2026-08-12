"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { createOrder } from '@/lib/ecommerce-service';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import { ShoppingBag, CheckCircle, ArrowLeft, ShieldCheck, MapPin, Phone, User } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    district: ALL_DISTRICTS[0],
    pincode: '',
  });

  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  if (cart.length === 0 && !placedOrder) {
    return (
      <main className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Cart is Empty</h2>
        <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Marketplace
        </Link>
      </main>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in your delivery details.');
      return;
    }

    // Group cart items by Vendor ID (create separate orders per vendor)
    const itemsByVendor: Record<string, typeof cart> = {};
    cart.forEach(item => {
      const vId = item.product.vendorId;
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    let lastCreatedOrder = null;

    Object.entries(itemsByVendor).forEach(([vendorId, vendorItems]) => {
      const orderItems = vendorItems.map(i => ({
        product: i.product,
        quantity: i.quantity,
        unitPrice: i.product.price,
      }));

      const vTotal = orderItems.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);

      lastCreatedOrder = createOrder({
        vendorId,
        vendorName: vendorItems[0].product.brand || 'Local Store',
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
        district: formData.district,
        pincode: formData.pincode || '250001',
        items: orderItems,
        totalAmount: vTotal,
        paymentMethod: 'Cash on Delivery (COD)',
      });
    });

    setPlacedOrder(lastCreatedOrder);
    clearCart();
  };

  if (placedOrder) {
    return (
      <main className="checkout-success-page">
        <div className="container" style={{ maxWidth: '520px', padding: '60px 20px', textAlign: 'center' }}>
          <div className="success-card">
            <div className="success-icon-box">
              <CheckCircle size={60} color="#22c55e" />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-id-label">Order ID: <code>#{placedOrder.id}</code></p>
            <p className="success-msg">
              Thank you, <strong>{placedOrder.customerName}</strong>! Your order has been sent to the local store for verification.
            </p>

            <div className="summary-box">
              <div className="sb-row"><span>Total Amount:</span> <strong>₹{placedOrder.totalAmount}</strong></div>
              <div className="sb-row"><span>Payment Method:</span> <strong>Cash on Delivery (COD)</strong></div>
              <div className="sb-row"><span>Delivery Address:</span> {placedOrder.deliveryAddress}, {placedOrder.district}</div>
              <div className="sb-row"><span>Status:</span> <span className="status-badge pending">Pending Vendor Acceptance</span></div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/marketplace" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '880px' }}>
        <div className="cart-header">
          <Link href="/cart" className="back-link">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <h1>Checkout & Delivery Details</h1>
        </div>

        <div className="checkout-grid">
          {/* Form */}
          <form onSubmit={handlePlaceOrder} className="checkout-form-card">
            <h3>Farmer Delivery Address</h3>

            <div className="form-group">
              <label><User size={15} /> Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label><Phone size={15} /> Mobile Phone Number *</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label><MapPin size={15} /> District *</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="mp-select"
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
                />
              </div>
            </div>

            <div className="form-group">
              <label>Village / Full Field Address *</label>
              <textarea
                rows={3}
                placeholder="e.g. Near Primary School, Village Dabathwa, Meerut"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="payment-method-box">
              <h4>Payment Option</h4>
              <div className="cod-radio-option">
                <input type="radio" id="cod" name="payment" defaultChecked />
                <label htmlFor="cod">
                  <strong>💵 Cash on Delivery (COD)</strong>
                  <p>Pay cash when the store delivers to your farm or when you pick it up.</p>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '20px' }}>
              Place Order (Cash on Delivery)
            </button>
          </form>

          {/* Order Summary sidebar */}
          <div className="cart-summary-card">
            <h3>Items in Order</h3>

            <div className="checkout-items-mini">
              {cart.map(item => (
                <div key={item.product.id} className="mini-item-row">
                  <div>
                    <strong>{item.quantity}x {item.product.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>₹{item.product.price} {item.product.unit}</div>
                  </div>
                  <strong>₹{item.product.price * item.quantity}</strong>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total Amount:</span>
              <strong className="total-price">₹{cartTotal.toLocaleString()}</strong>
            </div>

            <div className="cod-badge-box">
              <ShieldCheck size={20} color="#22c55e" /> Verified Local Stores & Genuine Products Guaranteed.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
