"use client";

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { getVendorById } from '@/lib/ecommerce-service';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Store } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <main className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '16px', border: '1.5px solid #e5e7eb', maxWidth: '500px', margin: '0 auto' }}>
          <ShoppingBag size={56} color="var(--text-light)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: '24px' }}>
            Explore local agri-stores and add fertilizers, seeds or pesticides to your cart.
          </p>
          <Link href="/marketplace" className="btn btn-primary">
            Browse Marketplace →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '960px' }}>
        <div className="cart-header">
          <Link href="/marketplace" className="back-link">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <h1>Shopping Cart ({cartCount} Items)</h1>
        </div>

        <div className="cart-grid">
          {/* Cart Items List */}
          <div className="cart-items-container">
            {cart.map(item => {
              const vendor = getVendorById(item.product.vendorId);
              return (
                <div key={item.product.id} className="cart-item-card">
                  <div className="cart-item-info">
                    <span className="cart-item-cat">{item.product.category}</span>
                    <h3 className="cart-item-title">{item.product.name}</h3>
                    <p className="cart-item-brand">Brand: {item.product.brand}</p>
                    
                    {vendor && (
                      <Link href={`/store/${vendor.id}`} className="cart-vendor-link">
                        <Store size={14} /> {vendor.name} ({vendor.district})
                      </Link>
                    )}

                    <div className="cart-item-price">
                      ₹{item.product.price} <span className="cart-unit">{item.product.unit}</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="qty-btn">
                        <Minus size={14} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="qty-btn">
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="item-subtotal">
                      Subtotal: <strong>₹{(item.product.price * item.quantity).toLocaleString()}</strong>
                    </div>

                    <button onClick={() => removeFromCart(item.product.id)} className="remove-btn" title="Remove item">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={clearCart} className="btn btn-outline btn-sm">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Items Total ({cartCount}):</span>
              <strong>₹{cartTotal.toLocaleString()}</strong>
            </div>

            <div className="summary-row">
              <span>Estimated Delivery:</span>
              <strong style={{ color: '#22c55e' }}>FREE (Local Pickup / Delivery)</strong>
            </div>

            <div className="summary-row">
              <span>Payment Mode:</span>
              <strong>Cash on Delivery (COD)</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total Payable:</span>
              <strong className="total-price">₹{cartTotal.toLocaleString()}</strong>
            </div>

            <Link href="/checkout" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '20px' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <div className="cod-badge-box">
              💵 <strong>Cash on Delivery Available</strong> — Pay at your doorstep or shop upon receiving products.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
