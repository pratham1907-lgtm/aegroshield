"use client";

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getVendorById, getProductsByVendorId } from '@/lib/ecommerce-service';
import type { Vendor, Product } from '@/lib/marketplace-data';
import { useCart } from '@/lib/cart-context';
import { Store, ShieldCheck, MapPin, Phone, Star, ShoppingBag, ArrowLeft, Check } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  All: '🛒',
  Fertilizer: '🌱',
  Pesticide: '🧪',
  Seed: '🌾',
  Equipment: '⚙️',
};

const STOCK_COLORS: Record<string, string> = {
  'In Stock': '#22c55e',
  'Low Stock': '#f59e0b',
  'Out of Stock': '#ef4444',
};

export default function VendorStorefrontPage({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = use(params);
  const { addToCart, cartCount } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const v = getVendorById(vendorId);
    if (v) {
      setVendor(v);
      setProducts(getProductsByVendorId(vendorId));
    }
  }, [vendorId]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (!vendor) {
    return (
      <main className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Store Not Found</h2>
        <p>The vendor store you are looking for does not exist or has been removed.</p>
        <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="storefront-page">
      {/* ── Vendor Store Header ── */}
      <section className="store-header-banner">
        <div className="container">
          <Link href="/marketplace" className="back-link">
            <ArrowLeft size={16} /> Back to All Stores & Marketplace
          </Link>

          <div className="store-profile-card">
            <div className="store-avatar">
              <Store size={36} color="var(--primary)" />
            </div>

            <div className="store-details">
              <div className="store-title-row">
                <h1>{vendor.name}</h1>
                {vendor.verified && (
                  <span className="verified-badge">
                    <ShieldCheck size={16} /> Verified License
                  </span>
                )}
              </div>

              <p className="store-owner">Owner: <strong>{vendor.ownerName}</strong></p>

              <div className="store-meta-grid">
                <div><MapPin size={15} /> {vendor.address}, {vendor.district}</div>
                <div><Phone size={15} /> +{vendor.phone}</div>
                <div><Star size={15} color="var(--warning)" fill="var(--warning)" /> {vendor.rating} Rating</div>
                <div>📄 License: <code>{vendor.license}</code></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Store Catalog Section ── */}
      <div className="container" style={{ padding: '40px 20px 80px' }}>
        <div className="store-catalog-header">
          <h2>Store Catalog ({products.length} Items)</h2>
          <p>Buy authentic fertilizers, pesticides and seeds directly from <strong>{vendor.name}</strong>.</p>
        </div>

        {products.length === 0 ? (
          <div className="mp-empty">
            <span style={{ fontSize: '3rem' }}>📦</span>
            <h3>No products available in this store currently</h3>
            <p>Check back later or browse other stores in {vendor.district}.</p>
          </div>
        ) : (
          <div className="mp-product-grid">
            {products.map(product => {
              const isAdded = addedIds[product.id];
              return (
                <div key={product.id} className="mp-product-card">
                  <div className="mp-card-header">
                    <span className="mp-cat-badge">{CATEGORY_ICONS[product.category]} {product.category}</span>
                    <span className="mp-stock-badge" style={{ color: STOCK_COLORS[product.stock] }}>
                      ● {product.stock}
                    </span>
                  </div>

                  <h3 className="mp-product-name">{product.name}</h3>
                  <p className="mp-product-brand">Brand: {product.brand}</p>
                  <p className="mp-product-desc">{product.description}</p>

                  <div className="mp-crops">
                    {product.forCrops.map(crop => (
                      <span key={crop} className="mp-crop-tag">🌿 {crop}</span>
                    ))}
                  </div>

                  <div className="mp-price-row">
                    <span className="mp-price">₹{product.price.toLocaleString()}</span>
                    <span className="mp-unit">{product.unit}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 'Out of Stock'}
                    className={`btn ${isAdded ? 'btn-success' : 'btn-primary'} btn-full`}
                    style={{ marginTop: 'auto' }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={18} /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <Link href="/cart" className="floating-cart-fab">
          <ShoppingBag size={20} /> View Cart ({cartCount})
        </Link>
      )}
    </main>
  );
}
