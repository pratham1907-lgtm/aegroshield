"use client";

import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  PRODUCTS, ALL_DISTRICTS,
  getProductsFiltered, getVendorById,
  type Category, type Product
} from '@/lib/marketplace-data';

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

function buildWhatsAppLink(product: Product, vendor: ReturnType<typeof getVendorById>, district: string, t: (k: string) => string) {
  if (!vendor) return '#';
  const text = encodeURIComponent(
    `🌾 Aegroshield Order Request\n\n${t('mp.wa.greeting')} ${vendor.ownerName} ji,\n\n${t('mp.wa.want')}\n📦 Product: ${product.name}\n💰 Price: ₹${product.price} ${product.unit}\n📍 District: ${district === 'All' ? 'Not specified' : district}\n\n${t('mp.wa.confirm')}\n\n– Aegroshield Farmer App`
  );
  return `https://wa.me/${vendor.phone}?text=${text}`;
}

export default function MarketplacePage() {
  const { t, lang } = useLanguage();
  const [district, setDistrict] = useState('All');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [search, setSearch] = useState('');

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

  return (
    <main className="marketplace-page">
      {/* ── Page Hero ── */}
      <section className="mp-hero">
        <div className="container">
          <p className="page-hero-badge" style={{ background: '#e8f5d6', color: 'var(--primary)', display: 'inline-flex', marginBottom: '14px' }}>
            {t('mp.badge')}
          </p>
          <h1 className="mp-title">
            {t('mp.title1')}<br /><em>{t('mp.title2')}</em>
          </h1>
          <p className="mp-subtitle">{t('mp.subtitle')}</p>

          {/* ── Search Bar ── */}
          <div className="mp-search-bar">
            <span className="mp-search-icon">🔍</span>
            <input
              type="text"
              className="mp-search-input"
              placeholder={t('mp.search')}
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
            <label className="mp-filter-label">{t('mp.district.label')}</label>
            <select
              className="mp-select"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            >
              <option value="All">{t('mp.district.all')}</option>
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
          <strong>{filtered.length}</strong> {t('mp.results')}
          {district !== 'All' && <span> {t('mp.results.in')} <strong>{district}</strong></span>}
          {category !== 'All' && <span> › <strong>{category}</strong></span>}
        </div>

        {/* ── Product Grid ── */}
        {filtered.length === 0 ? (
          <div className="mp-empty">
            <span style={{ fontSize: '3rem' }}>📭</span>
            <h3>{t('mp.empty.title')}</h3>
            <p>{t('mp.empty.sub')}</p>
          </div>
        ) : (
          <div className="mp-product-grid">
            {filtered.map(product => {
              const vendor = getVendorById(product.vendorId);
              const waLink = buildWhatsAppLink(product, vendor, district, t);
              const isHindi = lang === 'hi';
              return (
                <div key={product.id} className="mp-product-card">
                  {/* Category badge */}
                  <div className="mp-card-header">
                    <span className="mp-cat-badge">{CATEGORY_ICONS[product.category]} {product.category}</span>
                    <span className="mp-stock-badge" style={{ color: STOCK_COLORS[product.stock] }}>
                      ● {product.stock === 'Out of Stock' ? t('mp.out_of_stock') : product.stock}
                    </span>
                  </div>

                  {/* Product Info */}
                  <h3 className="mp-product-name">{isHindi ? product.nameHi : product.name}</h3>
                  {isHindi && <p className="mp-product-name-sub">{product.name}</p>}
                  <p className="mp-product-brand">{t('mp.brand')} {product.brand}</p>
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

                  {/* Vendor info */}
                  {vendor && (
                    <div className="mp-vendor-row">
                      <span className="mp-vendor-icon">{vendor.verified ? '✅' : '🏪'}</span>
                      <div className="mp-vendor-info">
                        <span className="mp-vendor-name">{vendor.name}</span>
                        <span className="mp-vendor-loc">📍 {vendor.district}</span>
                      </div>
                      <div className="mp-vendor-rating">
                        {'⭐'.repeat(Math.floor(vendor.rating))} {vendor.rating}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mp-wa-btn${product.stock === 'Out of Stock' ? ' disabled' : ''}`}
                    onClick={e => product.stock === 'Out of Stock' && e.preventDefault()}
                  >
                    <span>📲</span>
                    {product.stock === 'Out of Stock' ? t('mp.out_of_stock') : t('mp.order.wa')}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── How it works ── */}
      <section className="mp-how" id="how-it-works">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('mp.how.title')}</h2>
          <p className="section-sub" style={{ textAlign: 'center', marginBottom: '40px' }}>
            {t('mp.how.sub')}
          </p>
          <div className="mp-how-grid">
            <div className="mp-how-card">
              <div className="mp-how-num">1</div>
              <h4>{t('mp.how.1.title')}</h4>
              <p>{t('mp.how.1.body')}</p>
            </div>
            <div className="mp-how-card">
              <div className="mp-how-num">2</div>
              <h4>{t('mp.how.2.title')}</h4>
              <p>{t('mp.how.2.body')}</p>
            </div>
            <div className="mp-how-card">
              <div className="mp-how-num">3</div>
              <h4>{t('mp.how.3.title')}</h4>
              <p>{t('mp.how.3.body')}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
