"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import {
  PRODUCTS, ALL_DISTRICTS,
  getProductsFiltered, getVendorById,
  type Category, type Product
} from '@/lib/marketplace-data';
import { ShoppingBag, Store, Check, Search, MapPin } from 'lucide-react';

const CATEGORIES = ['All', 'Fertilizer', 'Pesticide', 'Seed', 'Equipment'] as const;
type CategoryFilter = typeof CATEGORIES[number];

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

export default function MarketplacePage() {
  const { t, lang } = useLanguage();
  const { addToCart, cartCount } = useCart();
  const [district, setDistrict] = useState('All');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let results = getProductsFiltered(district, category === 'All' ? 'All' : category);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameHi.includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.forCrops.some(c => c.toLowerCase().includes(q))
      );
    }
    return results;
  }, [district, category, search]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <main className="marketplace-page">
      {/* ── Page Hero ── */}
      <section className="mp-hero">
        <div className="container">
          <p className="page-hero-badge" style={{ background: '#e8f5d6', color: 'var(--primary)', display: 'inline-flex', marginBottom: '14px' }}>
            🛒 Multi-Vendor Agri-Marketplace
          </p>
          <h1 className="mp-title">
            Buy Essential<br /><em>Agri-Inputs Locally</em>
          </h1>
          <p className="mp-subtitle">
            Browse verified fertilizers, seeds, pesticides & tools from local shops in your district with Cash on Delivery (COD).
          </p>

          {/* ── Search Bar ── */}
          <div className="mp-search-bar">
            <Search size={20} className="mp-search-icon" />
            <input
              type="text"
              className="mp-search-input"
              placeholder="Search product, crop, brand or pincode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── Filters ── */}
        <div className="mp-filters">
          <div className="mp-filter-group">
            <label className="mp-filter-label"><MapPin size={14} /> District</label>
            <select
              className="mp-select"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            >
              <option value="All">All Districts (UP)</option>
              {ALL_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category Tabs */}
          <div className="mp-cat-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`mp-cat-btn${category === cat ? ' active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="mp-results-info">
          <strong>{filtered.length}</strong> products available
          {district !== 'All' && <span> in <strong>{district}</strong></span>}
          {category !== 'All' && <span> › <strong>{category}</strong></span>}
        </div>

        {/* ── Product Grid ── */}
        {filtered.length === 0 ? (
          <div className="mp-empty">
            <span style={{ fontSize: '3rem' }}>📭</span>
            <h3>No products found</h3>
            <p>Try selecting a different district or category.</p>
          </div>
        ) : (
          <div className="mp-product-grid">
            {filtered.map(product => {
              const vendor = getVendorById(product.vendorId);
              const isAdded = addedIds[product.id];
              const isHindi = lang === 'hi';
              return (
                <div key={product.id} className="mp-product-card">
                  {/* Category badge */}
                  <div className="mp-card-header">
                    <span className="mp-cat-badge">{CATEGORY_ICONS[product.category]} {product.category}</span>
                    <span className="mp-stock-badge" style={{ color: STOCK_COLORS[product.stock] }}>
                      ● {product.stock}
                    </span>
                  </div>

                  {/* Product Info */}
                  <h3 className="mp-product-name">{isHindi ? product.nameHi : product.name}</h3>
                  <p className="mp-product-brand">Brand: {product.brand}</p>
                  <p className="mp-product-desc">{product.description}</p>

                  {/* Crops */}
                  <div className="mp-crops">
                    {product.forCrops.slice(0, 3).map(crop => (
                      <span key={crop} className="mp-crop-tag">🌿 {crop}</span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mp-price-row">
                    <span className="mp-price">₹{product.price.toLocaleString()}</span>
                    <span className="mp-unit">{product.unit}</span>
                  </div>

                  {/* Vendor info with Store Link */}
                  {vendor && (
                    <div className="mp-vendor-row">
                      <Store size={18} color="var(--primary)" />
                      <div className="mp-vendor-info">
                        <span className="mp-vendor-name">{vendor.name}</span>
                        <span className="mp-vendor-loc">📍 {vendor.district}</span>
                      </div>
                      <Link href={`/store/${vendor.id}`} className="view-store-link">
                        View Store →
                      </Link>
                    </div>
                  )}

                  {/* Add to Cart CTA */}
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

      {/* Floating Cart FAB */}
      {cartCount > 0 && (
        <Link href="/cart" className="floating-cart-fab">
          <ShoppingBag size={20} /> View Cart ({cartCount})
        </Link>
      )}
    </main>
  );
}
