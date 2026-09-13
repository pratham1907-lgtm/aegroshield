"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  MapPin,
  RefreshCw,
  Calendar,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  ShieldCheck,
  Package,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import type { MandiRecord, DetailedAdvisory } from '@/app/api/mandi/route';

const CROP_ICONS: Record<string, string> = {
  Wheat: '🌾',
  Mustard: '🌼',
  Paddy: '🍚',
  Potato: '🥔',
  Maize: '🌽',
  Bajra: '🌾',
  Soybean: '🫘',
  Chickpea: '🌱',
  Gram: '🌱',
  Onion: '🧅',
  Cotton: '⚪',
};

const CATEGORY_TABS = [
  { key: 'All', labelEn: 'All Crops', labelHi: 'सभी फसलें' },
  { key: 'Cereals', labelEn: 'Cereals (अनाज)', labelHi: 'अनाज' },
  { key: 'Oilseeds', labelEn: 'Oilseeds (तिलहन)', labelHi: 'तिलहन' },
  { key: 'Vegetables', labelEn: 'Vegetables (सब्जियां)', labelHi: 'सब्जियां' },
];

export default function MandiRatesPage() {
  const { lang } = useLanguage();

  // Data State
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [districts, setDistricts] = useState<string[]>(['All']);
  const [commodities, setCommodities] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Filters State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trendFilter, setTrendFilter] = useState<'ALL' | 'UP' | 'DOWN' | 'STABLE'>('ALL');

  // View Mode: 'cards' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Expanded card IDs for detailed advisory
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand or Collapse All Advisories
  const toggleExpandAll = () => {
    const allExpanded = records.every((r) => expandedCards[r.id]);
    const newState: Record<string, boolean> = {};
    records.forEach((r) => {
      newState[r.id] = !allExpanded;
    });
    setExpandedCards(newState);
  };

  // Fetch Mandi Data from /api/mandi
  const fetchMandiData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== 'All') params.set('district', selectedDistrict);
      if (selectedCommodity !== 'All') params.set('commodity', selectedCommodity);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/mandi?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        if (json.districts) setDistricts(json.districts);
        if (json.commodities) setCommodities(json.commodities);
        setLastUpdated(
          json.lastUpdated
            ? new Date(json.lastUpdated).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''
        );
      }
    } catch (err) {
      console.error('[MandiPage] Failed to fetch live mandi rates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDistrict, selectedCommodity, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchMandiData();
  }, [fetchMandiData]);

  // Client-side trend filtering
  const filteredRecords = useMemo(() => {
    if (trendFilter === 'ALL') return records;
    return records.filter((r) => r.priceTrend === trendFilter);
  }, [records, trendFilter]);

  // Highlights Metrics
  const metrics = useMemo(() => {
    const totalCount = records.length;
    const risingCount = records.filter((r) => r.priceTrend === 'UP').length;
    const fallingCount = records.filter((r) => r.priceTrend === 'DOWN').length;

    // Top value commodity
    const topPriced =
      records.length > 0
        ? [...records].sort((a, b) => b.modalPrice - a.modalPrice)[0]
        : null;

    // Average wheat modal price
    const wheatRecords = records.filter((r) => r.commodity === 'Wheat');
    const avgWheat =
      wheatRecords.length > 0
        ? Math.round(
            wheatRecords.reduce((acc, r) => acc + r.modalPrice, 0) /
              wheatRecords.length
          )
        : 2420;

    return { totalCount, risingCount, fallingCount, topPriced, avgWheat };
  }, [records]);

  const isHindi = lang === 'hi';

  return (
    <main className="marketplace-page" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
      {/* ── Page Hero ── */}
      <section
        className="mp-hero"
        style={{
          background: 'linear-gradient(135deg, #1b3826 0%, #2D5F3F 100%)',
          color: '#fff',
          padding: '44px 0 36px',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 14px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '14px',
            }}
          >
            <Sparkles size={16} color="#facc15" /> Live APMC Mandi Rates & AI Advisory
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '10px' }}>
            {isHindi ? 'दैनिक मंडी भाव व विशेषज्ञ सलाह' : 'Live Mandi Rates & Market Advisory'}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', marginBottom: '24px' }}>
            {isHindi
              ? 'उत्तर प्रदेश की प्रमुख मंडियों (अलीगढ़, मेरठ, आगरा, बुलंदशहर, मथुरा आदि) के लाइव न्यूनतम, अधिकतम व मॉडल भाव। AI मार्केट सेंटीमेंट, प्राइस टारगेट और सुरक्षित भंडारण सुझावों के साथ।'
              : 'Real-time APMC wholesale prices across major Uttar Pradesh mandis (Aligarh, Meerut, Agra, Bulandshahr, Mathura) with AI-powered price targets, sentiment analysis, and storage recommendations.'}
          </p>

          {/* Instant Search Bar */}
          <div style={{ position: 'relative', maxWidth: '660px' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
            <input
              type="text"
              placeholder={
                isHindi
                  ? 'फसल, मंडी या जिले का नाम खोजें (जैसे: गेहूँ, अलीगढ़, Mustard, आगरा)...'
                  : 'Search by crop, commodity, mandi or district (e.g. Wheat, Aligarh, Mustard, Agra)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                color: '#1e293b',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-20px' }}>
        {/* ── Key Highlights Strip ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Total Quotes */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#dbeafe',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                {metrics.totalCount} Quotes
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Live APMC Mandis Tracked</div>
            </div>
          </div>

          {/* Upward Trend */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
                +{metrics.risingCount} Mandis
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Rising Trend (तेज़ी)</div>
            </div>
          </div>

          {/* Average Wheat Rate */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🌾
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                ₹{metrics.avgWheat} / Qtl
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Avg Wheat Rate (UP)</div>
            </div>
          </div>

          {/* Top Value Commodity */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ffedd5',
                color: '#c2410c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🌼
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c2410c' }}>
                ₹{metrics.topPriced ? metrics.topPriced.modalPrice.toLocaleString('en-IN') : '5,710'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Top: {metrics.topPriced ? `${metrics.topPriced.commodity} (${metrics.topPriced.district})` : 'Mustard'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters & Controls Toolbar ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '18px 22px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left: District & Commodity dropdowns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {/* District Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="var(--primary)" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="All">📍 All UP Districts (सभी जिले)</option>
                {districts
                  .filter((d) => d !== 'All')
                  .map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
              </select>
            </div>

            {/* Commodity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem' }}>🌾</span>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="All">🌾 All Commodities (सभी फसलें)</option>
                {commodities
                  .filter((c) => c !== 'All')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            {/* Trend Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setTrendFilter('ALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: trendFilter === 'ALL' ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                  background: trendFilter === 'ALL' ? '#e8f3ec' : '#fff',
                  color: trendFilter === 'ALL' ? 'var(--primary)' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                All Trends
              </button>
              <button
                type="button"
                onClick={() => setTrendFilter('UP')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: trendFilter === 'UP' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  background: trendFilter === 'UP' ? '#dcfce7' : '#fff',
                  color: trendFilter === 'UP' ? '#15803d' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <TrendingUp size={14} /> Rising
              </button>
              <button
                type="button"
                onClick={() => setTrendFilter('DOWN')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: trendFilter === 'DOWN' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  background: trendFilter === 'DOWN' ? '#fee2e2' : '#fff',
                  color: trendFilter === 'DOWN' ? '#b91c1c' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <TrendingDown size={14} /> Falling
              </button>
            </div>
          </div>

          {/* Right: Toggle Expand All, View Mode & Live Sync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="Expand/Collapse all AI advisories"
            >
              <Sparkles size={14} color="#eab308" />
              {records.every((r) => expandedCards[r.id]) ? 'Collapse Advisories' : 'Expand Advisories'}
            </button>

            {/* View Switcher */}
            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '7px 12px',
                  background: viewMode === 'cards' ? 'var(--primary)' : '#fff',
                  color: viewMode === 'cards' ? '#fff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
                title="Cards View"
              >
                <LayoutGrid size={15} /> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '7px 12px',
                  background: viewMode === 'table' ? 'var(--primary)' : '#fff',
                  color: viewMode === 'table' ? '#fff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
                title="Table View"
              >
                <TableIcon size={15} /> Table
              </button>
            </div>

            {/* Live Sync button */}
            <button
              onClick={() => fetchMandiData(true)}
              disabled={refreshing}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Sync latest live prices"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '9px 18px',
                borderRadius: '30px',
                border: selectedCategory === cat.key ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                background: selectedCategory === cat.key ? 'var(--primary)' : '#fff',
                color: selectedCategory === cat.key ? '#fff' : '#475569',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {isHindi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        {/* ── Section Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
              {selectedDistrict !== 'All' ? `${selectedDistrict} District APMC Mandis` : 'Uttar Pradesh APMC Mandis'}
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b', marginLeft: '10px' }}>
                ({filteredRecords.length} quotes loaded from Firestore)
              </span>
            </h2>
          </div>
          {lastUpdated && (
            <span
              style={{
                fontSize: '0.82rem',
                color: '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={13} /> Updated Today at {lastUpdated} IST
            </span>
          )}
        </div>

        {/* ── Loading Skeletons ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <div style={{ height: '24px', width: '60%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '12px' }} />
                <div style={{ height: '16px', width: '40%', background: '#f1f5f9', borderRadius: '6px', marginBottom: '20px' }} />
                <div style={{ height: '50px', width: '80%', background: '#e2e8f0', borderRadius: '10px', marginBottom: '16px' }} />
                <div style={{ height: '36px', width: '100%', background: '#f1f5f9', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          /* ── Empty State ── */
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '64px 20px',
              textAlign: 'center',
              border: '1.5px dashed #cbd5e1',
              maxWidth: '540px',
              margin: '30px auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.8rem',
              }}
            >
              🌾
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              {isHindi ? 'कोई मंडी भाव नहीं मिला' : 'No Mandi Rates Found'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '22px' }}>
              {isHindi
                ? 'आपके द्वारा चुने गए फिल्टर या खोज शब्द के लिए कोई फसल दर्ज नहीं है।'
                : 'No APMC records matched your current district, commodity or search query.'}
            </p>
            <button
              onClick={() => {
                setSelectedDistrict('All');
                setSelectedCommodity('All');
                setSelectedCategory('All');
                setSearchQuery('');
                setTrendFilter('ALL');
              }}
              className="btn btn-primary"
            >
              Reset All Filters (सभी फिल्टर हटाएं)
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* ── COMMODITY CARDS VIEW WITH EXPANDABLE INSIGHTS ── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '22px',
            }}
          >
            {filteredRecords.map((item) => {
              const isExpanded = Boolean(expandedCards[item.id]);
              const cropEmoji = CROP_ICONS[item.commodity] || '🌱';
              const spread = item.maxPrice - item.minPrice;
              const progressPct =
                spread > 0
                  ? Math.min(100, Math.max(0, ((item.modalPrice - item.minPrice) / spread) * 100))
                  : 50;

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    border: '1.5px solid #e2e8f0',
                    padding: '24px',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top: Header & Trend */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '2rem' }}>{cropEmoji}</span>
                        <div>
                          <h3
                            style={{
                              fontSize: '1.3rem',
                              fontWeight: 800,
                              color: '#1e293b',
                              lineHeight: 1.2,
                            }}
                          >
                            {item.commodity}{' '}
                            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>
                              ({item.commodityHi})
                            </span>
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                            Variety: <strong>{item.variety}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Trend Badge */}
                      {item.priceTrend === 'UP' ? (
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <TrendingUp size={14} /> +{item.priceChangePercent}% तेज़ी
                        </span>
                      ) : item.priceTrend === 'DOWN' ? (
                        <span
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <TrendingDown size={14} /> {item.priceChangePercent}% मंदी
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Minus size={14} /> स्थिर Stable
                        </span>
                      )}
                    </div>

                    {/* Mandi Market & District */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.88rem',
                        color: '#475569',
                        marginBottom: '16px',
                      }}
                    >
                      <MapPin size={15} color="var(--primary)" />
                      <span>
                        <strong>{item.market}</strong>, {item.district}
                      </span>
                    </div>

                    {/* Modal Price Box */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '18px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                          मॉडल भाव (Modal Price)
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          आवक: {item.arrivalQuantity}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 900,
                          color: 'var(--primary)',
                          marginTop: '4px',
                        }}
                      >
                        ₹{item.modalPrice.toLocaleString('en-IN')}{' '}
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>
                          / क्विंटल (Qtl)
                        </span>
                      </div>

                      {/* Min-Max Range Bar */}
                      <div style={{ marginTop: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.78rem',
                            color: '#475569',
                            fontWeight: 600,
                            marginBottom: '6px',
                          }}
                        >
                          <span>Min: ₹{item.minPrice.toLocaleString('en-IN')}</span>
                          <span>Max: ₹{item.maxPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div
                          style={{
                            height: '7px',
                            width: '100%',
                            background: '#e2e8f0',
                            borderRadius: '4px',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${progressPct}%`,
                              background:
                                item.priceTrend === 'UP'
                                  ? '#16a34a'
                                  : item.priceTrend === 'DOWN'
                                  ? '#dc2626'
                                  : 'var(--primary)',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Expandable AI/Expert Advisory Insight Badge ── */}
                    <div
                      style={{
                        background: isExpanded ? '#f0fdf4' : '#f8fafc',
                        borderRadius: '14px',
                        border: isExpanded ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Insight Header Button */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: '#dcfce7',
                              color: '#15803d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Sparkles size={14} />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                            AI Market Advisory & Insights
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                            {isExpanded ? 'Hide' : 'Details'}
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {/* Collapsed Preview */}
                      {!isExpanded && (
                        <div
                          style={{
                            padding: '0 14px 12px 14px',
                            fontSize: '0.8rem',
                            color: '#475569',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.advisoryText}
                        </div>
                      )}

                      {/* Expanded Full Insights */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: '4px 14px 14px 14px',
                            borderTop: '1px solid #bbf7d0',
                            fontSize: '0.83rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          {/* Advisory Text */}
                          <div style={{ color: '#1e293b', fontWeight: 500, lineHeight: 1.45 }}>
                            {item.advisoryText}
                          </div>

                          {/* Price Target */}
                          {item.detailedAdvisory?.priceTarget && (
                            <div
                              style={{
                                background: '#fff',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid #bbf7d0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                              }}
                            >
                              <Target size={16} color="#15803d" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <strong style={{ color: '#15803d' }}>Price Target:</strong>{' '}
                                <span style={{ color: '#1e293b' }}>{item.detailedAdvisory.priceTarget}</span>
                              </div>
                            </div>
                          )}

                          {/* Sentiment */}
                          {item.detailedAdvisory?.sentiment && (
                            <div
                              style={{
                                background: '#fff',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid #bbf7d0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                              }}
                            >
                              <Sparkles size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <strong style={{ color: '#b45309' }}>Market Sentiment:</strong>{' '}
                                <span style={{ color: '#334155' }}>{item.detailedAdvisory.sentiment}</span>
                              </div>
                            </div>
                          )}

                          {/* Storage Recommendation */}
                          {item.detailedAdvisory?.storage && (
                            <div
                              style={{
                                background: '#fff',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid #bbf7d0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                              }}
                            >
                              <Package size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <strong style={{ color: '#1d4ed8' }}>Storage Advice:</strong>{' '}
                                <span style={{ color: '#334155' }}>{item.detailedAdvisory.storage}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: item.recommendation === 'HOLD' ? '#fef3c7' : '#dcfce7',
                        color: item.recommendation === 'HOLD' ? '#b45309' : '#15803d',
                      }}
                    >
                      {item.recommendation === 'HOLD' ? '🛡️ HOLD (रोकें)' : '⚡ SELL NOW (तुरंत बेचें)'}
                    </span>

                    <Link
                      href={`/market`}
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Mandi Deep Dive <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── COMPACT TABLE VIEW ── */
          <div
            className="vd-product-table-wrap"
            style={{
              background: '#fff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
            }}
          >
            <table className="vd-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Commodity & Crop</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Mandi & District</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Modal Price</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Min - Max Range</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Trend</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', minWidth: '280px' }}>
                    AI Advisory & Price Target
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Arrival Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const cropEmoji = CROP_ICONS[item.commodity] || '🌱';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.4rem' }}>{cropEmoji}</span>
                          <div>
                            <strong style={{ color: '#1e293b' }}>{item.commodity}</strong>{' '}
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              ({item.commodityHi})
                            </span>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.variety}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#1e293b' }}>{item.market}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          📍 {item.district}, {item.state}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
                          ₹{item.modalPrice.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}> / Qtl</span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                          ₹{item.minPrice} - ₹{item.maxPrice}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        {item.priceTrend === 'UP' ? (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <TrendingUp size={13} /> +{item.priceChangePercent}% UP
                          </span>
                        ) : item.priceTrend === 'DOWN' ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <TrendingDown size={13} /> {item.priceChangePercent}% DOWN
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Minus size={13} /> STABLE
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: item.recommendation === 'HOLD' ? '#b45309' : '#15803d',
                            }}
                          >
                            {item.recommendation === 'HOLD' ? '🛡️ HOLD' : '⚡ SELL NOW'} •{' '}
                            {item.detailedAdvisory?.priceTarget || item.advisoryText}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.detailedAdvisory?.sentiment}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          padding: '14px 18px',
                          textAlign: 'right',
                          fontSize: '0.82rem',
                          color: '#64748b',
                        }}
                      >
                        {item.arrivalDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
