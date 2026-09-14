"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { getVendorById } from '@/lib/ecommerce-service';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Store,
} from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    cartCount,
    cartTotal,
    deliveryFee,
    grandTotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 500;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);
  const deliveryProgressPercent = Math.min(100, (cartTotal / freeDeliveryThreshold) * 100);

  const handleCheckoutClick = () => {
    closeCart();
    router.push('/checkout');
  };

  const handleViewCartClick = () => {
    closeCart();
    router.push('/cart');
  };

  return (
    <div
      className="cart-drawer-overlay"
      onClick={closeCart}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        ref={drawerRef}
        className="cart-drawer-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#2D5F3F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ShoppingBag size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Shopping Cart
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
              </span>
            </div>
          </div>

          <button
            onClick={closeCart}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            title="Close drawer (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Threshold Bar */}
        <div
          style={{
            padding: '10px 20px',
            background: cartTotal >= freeDeliveryThreshold ? '#ecfdf5' : '#f0fdf4',
            borderBottom: '1px solid #dcfce7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Truck size={15} color="#16a34a" />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#15803d' }}>
              {cartTotal >= freeDeliveryThreshold
                ? '🎉 Congratulations! Free Delivery unlocked!'
                : `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery`}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${deliveryProgressPercent}%`,
                height: '100%',
                backgroundColor: '#22c55e',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Drawer Body: Cart Items or Empty State */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 10px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  marginBottom: '16px',
                }}
              >
                <ShoppingBag size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '260px', marginBottom: '20px' }}>
                Explore quality seeds, fertilizers, and equipment from verified local sellers.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  router.push('/store');
                }}
                className="btn btn-primary"
                style={{
                  padding: '10px 22px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                Browse Marketplace →
              </button>
            </div>
          ) : (
            cart.map(item => {
              const vendor = getVendorById(item.product.vendorId);
              return (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          color: '#2D5F3F',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {item.product.category}
                      </span>
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: '#1e293b',
                          margin: '2px 0 4px',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.product.name}
                      </h4>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Store size={12} />
                        <span>{vendor?.name || item.product.brand || 'Verified Seller'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        padding: '4px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                      paddingTop: '8px',
                      borderTop: '1px dashed #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#f1f5f9',
                        padding: '3px 6px',
                        borderRadius: '8px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        title="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        title="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: '700', color: '#166534' }}>
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                        ₹{item.product.price} / {item.product.unit || 'unit'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer (Only when items exist) */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569' }}>
              <span>Items Subtotal:</span>
              <strong style={{ color: '#1e293b' }}>₹{cartTotal.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569' }}>
              <span>Delivery Fee:</span>
              {deliveryFee === 0 ? (
                <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE</span>
              ) : (
                <span style={{ color: '#1e293b', fontWeight: '600' }}>₹{deliveryFee}</span>
              )}
            </div>

            <div
              style={{
                height: '1px',
                backgroundColor: '#e2e8f0',
                margin: '2px 0',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.05rem',
                fontWeight: '700',
                color: '#111827',
              }}
            >
              <span>Total Payable:</span>
              <span style={{ color: '#2D5F3F', fontSize: '1.25rem' }}>
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={handleCheckoutClick}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#2D5F3F',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(45, 95, 63, 0.25)',
                  transition: 'background 0.2s',
                }}
              >
                Proceed to Checkout <ArrowRight size={17} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '4px',
              }}
            >
              <button
                onClick={handleViewCartClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2D5F3F',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                View Full Cart Page
              </button>

              <button
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Clear Cart
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: '#166534',
                backgroundColor: '#f0fdf4',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #dcfce7',
              }}
            >
              <ShieldCheck size={13} />
              <span>Cash on Delivery & UPI Pay on Delivery Supported</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
