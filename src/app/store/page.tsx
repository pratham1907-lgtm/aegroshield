"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/context/AuthContext';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { Store, ShoppingBag, Search, Plus, Check, Lock, Loader2 } from 'lucide-react';

export default function StoreCatalogPage() {
  const { addToCart, cartCount, openCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const isAuthenticated = Boolean(user || auth.currentUser);

  useEffect(() => {
    // Strict Auth Gate: Do NOT query database if unauthenticated
    if (!isAuthenticated) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.data || []);
        setProducts(items);
      })
      .catch(err => {
        console.warn('[Store] Failed to fetch live products:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleAddToCart = (p: any) => {
    const cartProduct = {
      id: p.id,
      vendorId: p.sellerId || p.seller?.id || 'v1',
      name: p.name,
      nameHi: p.name,
      category: p.category,
      price: Number(p.price),
      unit: p.unit || 'per unit',
      stock: Number(p.stock) === 0 ? 'Out of Stock' : Number(p.stock) <= 5 ? 'Low Stock' : 'In Stock',
      brand: p.seller?.storeName || 'Verified Store',
      description: p.description || '',
      forCrops: ['All Crops'],
      imageUrl: p.imageUrl || '',
    };

    addToCart(cartProduct as any);
    setAddedIds(prev => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)) || (p.seller?.storeName && p.seller.storeName.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <main className="storefront-page" style={{ minHeight: '80vh', paddingBottom: '80px' }}>
      {/* ── Header ── */}
      <section className="store-header-banner" style={{ background: 'linear-gradient(135deg, #15803d, #166534)', color: '#fff', padding: '48px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginBottom: '10px' }}>
                <Store size={16} /> Verified Agri-Stores & Sellers
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 8px 0' }}>AgriShield Live Store Catalog</h1>
              <p style={{ opacity: 0.9, margin: 0, fontSize: '1rem' }}>
                Browse genuine fertilizers, seeds, pesticides and tools directly from verified suppliers in Supabase database.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link href="/seller/dashboard" className="btn" style={{ background: '#fff', color: '#15803d', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <Plus size={16} /> Seller Dashboard
              </Link>
              <button onClick={openCart} className="btn" style={{ background: '#f59e0b', color: '#fff', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={16} /> Cart ({cartCount})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Strict Auth Barrier Check ── */}
      {authLoading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={36} className="spin" style={{ margin: '0 auto 12px', color: '#15803d' }} />
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>Verifying authentication...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="container" style={{ maxWidth: '540px', margin: '60px auto 100px', padding: '0 20px' }}>
          <div style={{ background: '#ffffff', padding: '48px 32px', borderRadius: '20px', textAlign: 'center', border: '1.5px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>
              <Lock size={32} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              Authentication Required
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
              Please sign in with your Google account to browse the marketplace and access live agricultural inventory.
            </p>
            <button
              onClick={() => signInWithGoogle()}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '13px 28px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              }}
            >
              Sign In with Google
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Search & Filter Controls ── */}
          <div className="container" style={{ maxWidth: '1200px', margin: '30px auto 20px', padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px' }}>
                <Search size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search products, brands, or seller stores..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Fertilizers', 'Seeds', 'Pesticides', 'Equipment'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedCategory === cat ? 'none' : '1px solid #e2e8f0',
                      background: selectedCategory === cat ? '#15803d' : '#f8fafc',
                      color: selectedCategory === cat ? '#fff' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Products Grid ── */}
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Available Products ({filtered.length})
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                ⚡ Supabase Live Inventory
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#15803d' }} />
                <p>Loading live catalog from database...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '0 0 12px 0' }}>
                  {search || selectedCategory !== 'All' ? 'No products found matching your search.' : 'No products available yet in the live database.'}
                </p>
                <Link href="/seller/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>
                  Add a Product via Seller Dashboard
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
                {filtered.map(p => {
                  const isAdded = Boolean(addedIds[p.id]);
                  const sellerName = p.seller?.storeName || 'Official Store';
                  const sellerDistrict = p.seller?.district || 'Meerut';
                  const inStock = Number(p.stock) > 0;

                  return (
                    <div
                      key={p.id}
                      style={{
                        background: '#fff',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ height: '170px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '2.5rem' }}>
                            🌱
                          </div>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: inStock ? '#dcfce7' : '#fee2e2',
                            color: inStock ? '#166534' : '#991b1b',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          {inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                          {p.category}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px 0', minHeight: '44px' }}>
                          {p.name}
                        </h3>

                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                          <div>🏪 {sellerName}</div>
                          <div>📍 {sellerDistrict}</div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                              {p.unit}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(p)}
                            disabled={!inStock}
                            style={{
                              background: !inStock ? '#cbd5e1' : isAdded ? '#16a34a' : '#15803d',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: inStock ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isAdded ? (
                              <>
                                <Check size={16} /> Added
                              </>
                            ) : (
                              'Add to Cart'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
