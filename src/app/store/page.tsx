"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import { Store, ShieldCheck, MapPin, ShoppingBag, Search, Plus, ExternalLink, Check, Lock } from 'lucide-react';

export default function StoreCatalogPage() {
  const { addToCart, cartCount, openCart } = useCart();
  const { user, isDemo, loginAsDemo } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const isGuest = !user && !isDemo;
  const isRealUser = Boolean(user && !isDemo);

  useEffect(() => {
    if (isGuest) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setLoading(true);
      fetch('/api/products?isDemo=true')
        .then(res => res.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setProducts(json.data);
          }
        })
        .catch(err => console.warn('[Store] Failed to fetch demo products:', err))
        .finally(() => setLoading(false));
      return;
    }

    // Authenticated real user: fetch ONLY from database via Prisma
    setLoading(true);
    fetch('/api/products?isDemo=false')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.warn('[Store] Failed to fetch live products:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [user, isDemo, isGuest]);

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

      {/* ── Demo Notice ── */}
      {isDemo && (
        <div className="container" style={{ maxWidth: '1200px', margin: '20px auto 0', padding: '0 20px' }}>
          <div style={{ padding: '14px 20px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', fontSize: '0.92rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🧪</span>
              <div>
                <strong>Demo Mode Active</strong>: Viewing sample evaluation catalog.
                <div style={{ fontSize: '0.82rem', color: '#b45309' }}>Actions taken in demo mode are simulated and isolated from the Supabase database.</div>
              </div>
            </div>
            <button
              onClick={() => signInWithGoogle()}
              style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}

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
            Available Products ({isGuest ? 0 : filtered.length})
          </h2>
          <span style={{ fontSize: '0.85rem', color: isDemo ? '#b45309' : '#15803d', fontWeight: 600 }}>
            {isDemo ? '🧪 Demo Sample Inventory' : '⚡ Supabase Live Inventory'}
          </span>
        </div>

        {isGuest ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem' }}>
              🔒
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Sign in to view verified agri-store products
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
              Connect with licensed input dealers, official fertilizer distributors, and seed suppliers in your district.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => signInWithGoogle()}
                className="btn btn-primary cursor-pointer"
                style={{ padding: '10px 22px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', background: '#15803d', color: '#fff', border: 'none' }}
              >
                Sign in with Google
              </button>
              <button
                onClick={() => loginAsDemo('farmer')}
                className="btn btn-outline cursor-pointer"
                style={{ padding: '10px 22px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', border: '1px solid #cbd5e1', background: '#fff', color: '#334155' }}
              >
                Explore in Demo Mode
              </button>
            </div>
          </div>
        ) : loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <p>Loading {isDemo ? 'sample demo products' : 'live catalog from database'}...</p>
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
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Image */}
                  <div style={{ height: '170px', background: '#f1f5f9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '2.5rem' }}>📦</div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      {p.category}
                    </span>
                    {!p.isDemo && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#15803d',
                          color: '#fff',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                        }}
                      >
                        ✓ Live
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Store size={13} /> {sellerName} • 📍 {sellerDistrict}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {p.name}
                    </h3>

                    {p.description && (
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px 0', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                          ₹{Number(p.price).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {p.unit || 'per unit'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={!inStock}
                        style={{
                          background: isAdded ? '#16a34a' : inStock ? '#15803d' : '#cbd5e1',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: inStock ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={15} /> Added
                          </>
                        ) : inStock ? (
                          <>
                            <ShoppingBag size={15} /> Add
                          </>
                        ) : (
                          'Out of Stock'
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
    </main>
  );
}
