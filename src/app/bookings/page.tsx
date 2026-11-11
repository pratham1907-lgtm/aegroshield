"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { auth, signInWithGoogle } from '@/lib/firebase';
import {
  Tractor,
  Users,
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';

interface BookingItem {
  id: string;
  userId: string;
  bookingType: string; // 'MACHINERY' | 'LABOUR'
  itemTitle?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  district?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  duration?: string | null;
  status: string; // 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number;
  createdAt: string;
  machinery?: {
    id: string;
    name: string;
    machineType: string;
    ratePerHour?: number | null;
    ratePerDay?: number | null;
    contactPhone?: string | null;
    ownerName?: string | null;
    district?: string | null;
    imageUrl?: string | null;
  } | null;
  labourPost?: {
    id: string;
    title: string;
    primarySkill: string;
    teamSize: number;
    dailyWage: number;
    phone?: string | null;
    leaderName?: string | null;
    district?: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; labelHi: string; color: string; bg: string; border: string }> = {
  PENDING: {
    label: 'Pending Confirmation',
    labelHi: 'स्वीकृति की प्रतीक्षा',
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  CONFIRMED: {
    label: 'Booking Confirmed',
    labelHi: 'बुकिंग स्वीकृत',
    color: '#15803d',
    bg: '#dcfce7',
    border: '#86efac',
  },
  COMPLETED: {
    label: 'Work Completed',
    labelHi: 'कार्य संपन्न',
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#bae6fd',
  },
  CANCELLED: {
    label: 'Cancelled',
    labelHi: 'रद्द',
    color: '#b91c1c',
    bg: '#fee2e2',
    border: '#fecaca',
  },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'MACHINERY' | 'LABOUR' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setLoading(true);
      setErrorMsg(null);

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/bookings?firebaseUid=${currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load bookings.');
      }

      setBookings(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      console.error('[Bookings] Fetch error:', err);
      setErrorMsg(err.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchBookings();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      'Kya aap sach me is booking ko cancel karna chahte hain? (Are you sure you want to cancel this booking?)'
    );
    if (!confirmCancel) return;

    setCancellingId(bookingId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Authentication required.');

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          status: 'CANCELLED',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel booking.');
      }

      // Update local state
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err: any) {
      alert(`Booking cancel karne me samasya aayi: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      fetchBookings();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('Sign-in failed. Please try again.');
      }
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (filter === 'ALL') return true;
    if (filter === 'MACHINERY') return b.bookingType?.toUpperCase() === 'MACHINERY';
    if (filter === 'LABOUR') return b.bookingType?.toUpperCase() === 'LABOUR';
    if (filter === 'ACTIVE') return b.status === 'PENDING' || b.status === 'CONFIRMED';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  const totalSpent = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const activeMachineryCount = bookings.filter(
    b => b.bookingType === 'MACHINERY' && (b.status === 'PENDING' || b.status === 'CONFIRMED')
  ).length;

  const activeLabourCount = bookings.filter(
    b => b.bookingType === 'LABOUR' && (b.status === 'PENDING' || b.status === 'CONFIRMED')
  ).length;

  return (
    <main style={{ minHeight: '85vh', backgroundColor: '#f8fafc', padding: '36px 16px 80px' }}>
      <section style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Breadcrumb / Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
              <Link href="/" style={{ color: '#15803d', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
              <ChevronRight size={14} />
              <span>Bookings</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              🚜 Machinery & Farm Labour Bookings
            </h1>
            <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.92rem' }}>
              Tractor, Harvester, Rotavator aur khet majdoor squads ki booking status aur details track karein.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/machinery"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)',
              }}
            >
              <Tractor size={16} /> Rent Machinery
            </Link>

            <Link
              href="/labour"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#15803d',
                border: '1.5px solid #15803d',
                textDecoration: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              <Users size={16} /> Hire Labour Squad
            </Link>

            <button
              onClick={fetchBookings}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
              title="Refresh Bookings"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Unauthenticated Prompt */}
        {!loading && isAuthenticated === false && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
              marginBottom: '32px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🔐</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Apni Bookings Dekhne Ke Liye Sign-in Karein
            </h2>
            <p style={{ color: '#475569', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.92rem' }}>
              Apne mobile number ya Google account se login karke rented machinery aur labour squads ki live tracking karein.
            </p>
            <button
              onClick={handleGoogleSignIn}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
              }}
            >
              Sign in with Google / Mobile
            </button>
          </div>
        )}

        {/* Stats Summary Cards */}
        {isAuthenticated && !loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Bookings</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {bookings.length}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Active Machinery Rentals</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                {activeMachineryCount}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Active Labour Squads</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {activeLabourCount}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Booking Spend</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        {isAuthenticated && !loading && bookings.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
            {[
              { id: 'ALL', label: `All Bookings (${bookings.length})` },
              { id: 'MACHINERY', label: `Machinery (${bookings.filter(b => b.bookingType === 'MACHINERY').length})` },
              { id: 'LABOUR', label: `Labour (${bookings.filter(b => b.bookingType === 'LABOUR').length})` },
              { id: 'ACTIVE', label: 'Active / Pending' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: filter === tab.id ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: filter === tab.id ? '#f0fdf4' : '#ffffff',
                  color: filter === tab.id ? '#15803d' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: filter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} color="#dc2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && isAuthenticated !== false && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map(n => (
              <div key={n} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '22px', width: '30%', background: '#f1f5f9', borderRadius: '6px', marginBottom: '12px' }} />
                <div style={{ height: '14px', width: '20%', background: '#f8fafc', borderRadius: '4px', marginBottom: '20px' }} />
                <div style={{ height: '70px', width: '100%', background: '#f8fafc', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && isAuthenticated && filteredBookings.length === 0 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '60px 24px',
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚜</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              {filter === 'ALL' ? 'Koi Booking Darj Nahi Hai' : `No ${filter.toLowerCase()} bookings found.`}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 24px' }}>
              Aapne abhi tak koi tractor, harvester ya labour squad book nahi kiya hai. Apne khet ke liye aasani se booking karein.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/machinery"
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  padding: '11px 22px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <Tractor size={16} /> Explore Farm Machinery
              </Link>
              <Link
                href="/labour"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#15803d',
                  border: '1.5px solid #15803d',
                  padding: '11px 22px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <Users size={16} /> Explore Labour Teams
              </Link>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {!loading && isAuthenticated && filteredBookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {filteredBookings.map(b => {
              const statusCfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
              const isMachinery = b.bookingType?.toUpperCase() === 'MACHINERY';
              const isLabour = b.bookingType?.toUpperCase() === 'LABOUR';

              const title =
                b.itemTitle ||
                b.machinery?.name ||
                b.labourPost?.title ||
                (isMachinery ? 'Agricultural Machinery' : 'Agricultural Labour Squad');

              const providerName =
                b.machinery?.ownerName || b.labourPost?.leaderName || 'Verified Equipment Provider';

              const providerPhone =
                b.machinery?.contactPhone || b.labourPost?.phone;

              const scheduledDate = b.startDate
                ? new Date(b.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Immediate / Upcoming';

              return (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isMachinery ? '#ecfdf5' : '#eff6ff',
                          color: isMachinery ? '#065f46' : '#1d4ed8',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          border: isMachinery ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isMachinery ? <Tractor size={12} /> : <Users size={12} />}
                        {isMachinery ? 'MACHINERY RENTAL' : 'LABOUR SQUAD'}
                      </span>
                      <code style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                        #{b.id.slice(0, 10).toUpperCase()}
                      </code>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                          border: `1px solid ${statusCfg.border}`,
                        }}
                      >
                        {statusCfg.label} ({statusCfg.labelHi})
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                          {title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#15803d" />
                          <span>District: <strong>{b.district || b.machinery?.district || b.labourPost?.district || 'Regional Mandi District'}</strong></span>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Estimated Booking Total:</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>
                          ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                        {b.duration && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Duration: {b.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        backgroundColor: '#f8fafc',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        marginTop: '16px',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.84rem',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Scheduled Date</span>
                        <strong style={{ color: '#0f172a' }}>{scheduledDate}</strong>
                      </div>

                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Provider</span>
                        <strong style={{ color: '#0f172a' }}>{providerName}</strong>
                      </div>

                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Farmer Contact</span>
                        <strong style={{ color: '#0f172a' }}>{b.customerPhone || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#f8fafc',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} color="#15803d" />
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                        AegroShield Assured Service Provider
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {providerPhone && (
                        <a
                          href={`tel:${providerPhone}`}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Phone size={13} color="#15803d" /> Call Provider
                        </a>
                      )}

                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(`Namaste AegroShield, mujhe mere Booking #${b.id.slice(0, 8).toUpperCase()} ke baare me jankari chahiye.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          color: '#15803d',
                          textDecoration: 'none',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          background: '#f0fdf4',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        Help & Support
                      </a>

                      {b.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={cancellingId === b.id}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={13} />
                          {cancellingId === b.id ? 'Cancelling…' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
