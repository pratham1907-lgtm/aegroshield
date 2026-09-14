"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, auth, signInWithGoogle } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { Lock, Loader2 } from "lucide-react";

export default function Page() {
  const { user, userData, loading: authLoading } = useAuth();
  const [liveMachinery, setLiveMachinery] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'find' | 'register'>('find');
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [listingId, setListingId] = useState('');

  // Booking Modal State
  const [bookingMachine, setBookingMachine] = useState<any | null>(null);
  const [bookingHours, setBookingHours] = useState<number>(4);
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingCustomerName, setBookingCustomerName] = useState<string>('');
  const [bookingContactPhone, setBookingContactPhone] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [bookingErrorMessage, setBookingErrorMessage] = useState<string>('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const isAuthenticated = Boolean(user || auth.currentUser);

  const fetchBookings = async () => {
    if (!user?.uid && !auth.currentUser?.uid) return;
    try {
      const activeUid = auth.currentUser?.uid || user?.uid;
      const res = await fetch(`/api/bookings?firebaseUid=${activeUid}`, { cache: 'no-store' });
      const json = await res.json();
      if (json?.data) {
        setMyBookings(json.data.filter((b: any) => b.bookingType === 'MACHINERY' || !b.bookingType));
      }
    } catch (err) {
      console.warn('[Machinery] Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    // Strict Auth Gate: Do NOT query database if unauthenticated
    if (!isAuthenticated) {
      setLiveMachinery([]);
      setLoading(false);
      return;
    }

    // Authenticated User: Query live database records via Prisma API
    setLoading(true);
    fetch('/api/machinery', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setLiveMachinery(json.data);
        } else {
          setLiveMachinery([]);
        }
      })
      .catch((err) => {
        console.warn('[Machinery] Error fetching machinery from API:', err);
        setLiveMachinery([]);
      })
      .finally(() => {
        setLoading(false);
      });

    fetchBookings();
  }, [isAuthenticated]);

  const handleRegisterEquipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth.currentUser) {
      const wantsSignIn = confirm("A verified Google Account is required to register equipment. Sign in with Google now?");
      if (wantsSignIn) {
        try {
          await signInWithGoogle();
        } catch (err: any) {
          if (err?.code !== 'auth/popup-closed-by-user') {
            alert("Google Sign-In failed: " + (err?.message || "Please sign in to proceed."));
          }
          return;
        }
      } else {
        alert("Sign-in required: Please sign in with Google to register machinery.");
        return;
      }
    }

    if (!auth.currentUser) return;

    const formData = new FormData(e.currentTarget);
    const token = await auth.currentUser?.getIdToken();
    const activeUid = auth.currentUser.uid;
    const activeEmail = auth.currentUser.email || '';
    const activeName = auth.currentUser.displayName || (formData.get('postOwnerName') as string) || 'Equipment Owner';
    const activePhone = (formData.get('postPhone') as string) || auth.currentUser.phoneNumber || '';

    const newMachine = {
      title: (formData.get('postMachineName') as string) || '',
      model: (formData.get('postMachineName') as string) || '',
      equipmentType: (formData.get('postMachineType') as string) || 'Tractor',
      machineType: (formData.get('postMachineType') as string) || 'Tractor',
      ratePerHour: Number(formData.get('postHourlyRate')) || 400,
      district: (formData.get('postDistrict') as string) || 'Meerut',
      state: (formData.get('postState') as string) || 'Uttar Pradesh',
      contactPhone: activePhone,
      chcName: (formData.get('postOwnerName') as string) || 'Private Owner',
      ownerId: activeUid,
      firebaseUid: activeUid,
      available: true,
    };

    try {
      const res = await fetch('/api/machinery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-firebase-uid': activeUid,
          ...(activeEmail ? { 'x-user-email': activeEmail } : {}),
          'x-user-name': encodeURIComponent(activeName),
          ...(activePhone ? { 'x-user-phone': activePhone } : {}),
        },
        body: JSON.stringify(newMachine),
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.data?.id) {
        setListingId(data.data.id);
        setPostSubmitted(true);
        // Refresh catalog immediately from database
        fetch('/api/machinery')
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && Array.isArray(d.data)) setLiveMachinery(d.data);
          });
      } else {
        alert("Failed to register machinery: " + (data?.error || `Server returned ${res.status}`));
      }
    } catch (err: any) {
      console.error('[Machinery] Error saving equipment via API:', err);
      alert("Error saving equipment: " + (err?.message || "Network error"));
    }
  };

  const handleConfirmBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingMachine) return;

    const rate = Number(bookingMachine.ratePerHour || bookingMachine.pricePerHour || bookingMachine.rate || 400);
    const targetId = String(bookingMachine.id || 'mach-' + Date.now());
    const startDateObj = bookingDate ? new Date(bookingDate) : new Date();
    const endDateObj = new Date(startDateObj.getTime() + bookingHours * 60 * 60 * 1000);
    const startDate = startDateObj.toISOString();
    const endDate = endDateObj.toISOString();
    const totalAmount = rate * bookingHours;

    if (!auth.currentUser) {
      const wantsSignIn = confirm("A verified Google Account is required to book farm machinery. Sign in with Google now?");
      if (wantsSignIn) {
        try {
          await signInWithGoogle();
        } catch (err: any) {
          if (err?.code !== 'auth/popup-closed-by-user') {
            alert("Google Sign-In failed: " + (err?.message || "Please sign in to proceed."));
          }
          return;
        }
      } else {
        const msg = "Sign-in required: Please sign in with Google to confirm your machinery booking.";
        setBookingErrorMessage(msg);
        setBookingStatus('error');
        alert(msg);
        return;
      }
    }

    if (!auth.currentUser) {
      const msg = "Sign-in required: Please sign in with Google to confirm your machinery booking.";
      setBookingErrorMessage(msg);
      setBookingStatus('error');
      return;
    }

    setBookingStatus('booking');
    setBookingErrorMessage('');
    try {
      const rate = Number(bookingMachine.ratePerHour || bookingMachine.pricePerHour || bookingMachine.rate || 400);
      const targetId = String(bookingMachine.id || 'mach-' + Date.now());
      const token = await auth.currentUser?.getIdToken();
      const activeUid = auth.currentUser.uid;
      const activeEmail = auth.currentUser.email || null;
      const customerName = (bookingCustomerName || auth.currentUser.displayName || userData?.name || user?.displayName || 'AgriShield Farmer').trim();
      const customerPhone = (bookingContactPhone || auth.currentUser.phoneNumber || userData?.phone || user?.phoneNumber || '').trim();
      const totalAmount = rate * bookingHours;

      const startDateObj = bookingDate ? new Date(bookingDate) : new Date();
      const endDateObj = new Date(startDateObj.getTime() + bookingHours * 60 * 60 * 1000);
      const startDate = startDateObj.toISOString();
      const endDate = endDateObj.toISOString();

      const payload = {
        bookingType: 'MACHINERY',
        machineryId: targetId,
        targetId: targetId,
        title: bookingMachine.title || bookingMachine.model || 'Tractor',
        machineType: bookingMachine.machineType || bookingMachine.equipmentType || 'Tractor',
        ratePerHour: rate,
        district: bookingMachine.district || 'Meerut',
        contactPhone: bookingMachine.contactPhone || customerPhone,
        startDate: startDate,
        endDate: endDate,
        bookingDate: startDate,
        totalAmount: totalAmount,
        pricePerHour: rate,
        hours: bookingHours,
        status: 'PENDING',
        customerName: customerName,
        customerPhone: customerPhone,
        userId: activeUid,
        firebaseUid: activeUid,
        email: activeEmail,
        name: customerName,
        phone: customerPhone,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-firebase-uid': activeUid,
          ...(activeEmail ? { 'x-user-email': activeEmail } : {}),
          'x-user-name': encodeURIComponent(customerName),
          ...(customerPhone ? { 'x-user-phone': customerPhone } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data?.success && data?.data?.id) {
        setConfirmedBookingId(data.data.id);
        setBookingStatus('success');
        setBookingErrorMessage('');
        // Refresh My Bookings immediately from database
        fetchBookings();
      } else {
        const reason = data?.error || `Booking failed with status ${res.status}`;
        const formatted = `Failed: ${reason}`;
        setBookingErrorMessage(formatted);
        setBookingStatus('error');
        alert(formatted);
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      const rawReason = err?.message || 'Network error occurred. Please try again.';
      const formatted = rawReason.startsWith('Failed:') ? rawReason : `Failed: ${rawReason}`;
      setBookingErrorMessage(formatted);
      setBookingStatus('error');
      alert(formatted);
    }
  };

  const displayMachinery = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }
    return liveMachinery || [];
  }, [isAuthenticated, liveMachinery]);

  return (
    <main>
{/*  ── Navbar ────────────────────────────────────────────────  */}
  
  

{/*  ── Page Hero ─────────────────────────────────────────────  */}
<div className="page-hero">
  <div className="container">
    <div className="page-hero-badge">🚜 CHC Equipment Hire</div>
    <h1>Book Farm Machinery Near You</h1>
    <p>Find tractors, harvesters, tillers and more from nearby Custom Hiring Centres</p>
  </div>

  <div className="hero-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
    </svg>
  </div>
</div>

{/* ── Strict Auth Barrier Check ── */}
{authLoading ? (
  <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
    <Loader2 size={36} className="spin" style={{ margin: '0 auto 12px', color: '#15803d', animation: 'spin 1s linear infinite' }} />
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
        Please sign in with your Google account to browse the marketplace and access live machinery equipment.
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
<div className="machinery-layout">

  {/*  ── Stats Strip ───────────────────────────────────────────  */}
  <div className="stats-strip">
    <div className="stat-card">
      <div className="stat-icon green">🚜</div>
      <div><div className="stat-label">Available Now</div><div className="stat-value">{displayMachinery.length}</div><div className="stat-sub">Equipment units</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon amber">🏭</div>
      <div><div className="stat-label">CHC Centres</div><div className="stat-value">{displayMachinery.length > 0 ? '7' : '0'}</div><div className="stat-sub">In your district</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon blue">💰</div>
      <div><div className="stat-label">Avg. Saving</div><div className="stat-value">42%</div><div className="stat-sub">vs. private hire</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon green">⭐</div>
      <div><div className="stat-label">Avg. Rating</div><div className="stat-value">4.6/5</div><div className="stat-sub">840 reviews</div></div>
    </div>
  </div>

  {/*  ── Tab Toggle ───────────────────────────────────────────  */}
  <div className="tab-bar">
    <button
      className={`tab-toggle cursor-pointer ${activeTab === 'find' ? 'active' : ''}`}
      style={{ cursor: 'pointer' }}
      id="findTab"
      onClick={() => setActiveTab('find')}
    >
      🔍 Find Machinery
    </button>
    <button
      className={`tab-toggle cursor-pointer ${activeTab === 'register' ? 'active' : ''}`}
      style={{ cursor: 'pointer' }}
      id="postTab"
      onClick={() => setActiveTab('register')}
    >
      📢 Register Equipment
    </button>
  </div>

  {activeTab === 'find' && (
    <div className="tab-content active" id="findSection">



  {/*  ── Search Card ───────────────────────────────────────────  */}
  <div className="search-card">
    <h2>🔍 Search Available Machinery</h2>
    <div className="search-grid">

      <div className="form-group">
        <label className="form-label" htmlFor="machineType">Machine Type</label>
        <select className="form-control" id="machineType">
          <option defaultValue="">All Types</option>
          <option defaultValue="Tractor">🚜 Tractor</option>
          <option defaultValue="Harvester">🌾 Harvester</option>
          <option defaultValue="Rotavator">🔄 Rotavator</option>
          <option defaultValue="Thresher">⚙️ Thresher</option>
          <option defaultValue="Sprayer">💦 Sprayer</option>
          <option defaultValue="Seed Drill">🌱 Seed Drill</option>
          <option defaultValue="Baler">📦 Baler</option>
          <option defaultValue="Plough">🪵 Plough</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="machineState">State</label>
        <select className="form-control" id="machineState">
          <option defaultValue="">Select State</option>
          <option>Andhra Pradesh</option><option>Arunachal Pradesh</option>
          <option>Assam</option><option>Bihar</option><option>Chhattisgarh</option>
          <option>Goa</option><option>Gujarat</option><option>Haryana</option>
          <option>Himachal Pradesh</option><option>Jharkhand</option>
          <option>Karnataka</option><option>Kerala</option>
          <option>Madhya Pradesh</option><option>Maharashtra</option>
          <option>Manipur</option><option>Meghalaya</option><option>Mizoram</option>
          <option>Nagaland</option><option>Odisha</option><option>Punjab</option>
          <option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option>
          <option>Telangana</option><option>Tripura</option>
          <option>Uttar Pradesh</option><option>Uttarakhand</option>
          <option>West Bengal</option><option>Delhi</option>
          <option>Jammu &amp; Kashmir</option><option>Ladakh</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="machineDistrict">District</label>
        <input type="text" className="form-control" id="machineDistrict" placeholder="Enter your district" />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="bookingDate">Booking Date</label>
        <input type="date" className="form-control" id="bookingDate" />
      </div>

    </div>
  </div>

  {/*  ── Machinery Grid ────────────────────────────────────────  */}
  <div className="machinery-grid" id="machineryGrid">
    {loading ? (
      <div style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Querying live machinery records from Supabase...</p>
      </div>
    ) : displayMachinery.length > 0 ? (
      displayMachinery.map((machine, idx) => (
        <div key={machine.id || idx} className="machine-card">
          <div className="mc-head">
            <div className="mc-icon">🚜</div>
            <div className="mc-badges">
              <span className="badge badge-chc">CHC Accredited</span>
              <span className="badge badge-avail">Available Today</span>
            </div>
          </div>
          <div className="mc-body">
            <h3 className="mc-title">{machine.equipmentType || machine.model || machine.title || 'Farm Machine'}</h3>
            <p className="mc-chc">🏭 {machine.chcName || (machine.owner?.name ? `${machine.owner.name}'s Centre` : 'Local Hiring Centre')}</p>
            <div className="mc-specs">
              <span className="spec-pill">⚙️ {machine.model || machine.title || 'Standard'}</span>
              <span className="spec-pill">📍 {machine.district || 'Meerut'}</span>
            </div>
            <div className="mc-pricing">
              <div className="mc-rate">
                <span className="mc-rate-val">₹{machine.ratePerHour || machine.rate || 400}</span>
                <span className="mc-rate-unit">/hour</span>
              </div>
              <div className="mc-sub">Incl. fuel &amp; operator</div>
            </div>
          </div>
          <div className="mc-foot">
            <div className="mc-rating">⭐ 4.8 <span>(42)</span></div>
            <button
              onClick={() => {
                setBookingMachine(machine);
                setBookingStatus('idle');
                setConfirmedBookingId('');
                setBookingCustomerName(userData?.name || user?.displayName || 'AgriShield Farmer');
                setBookingContactPhone(userData?.phone || user?.phoneNumber || '');
              }}
              className="btn btn-primary btn-sm cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              ⚡ Book Now
            </button>
          </div>
        </div>
      ))
    ) : (
      <div style={{ gridColumn: '1 / -1', padding: '56px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🚜</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No machinery listings available yet in your area</h3>
        <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px' }}>
          There are currently 0 records in the live database. Be the first to register equipment or view your listings from the seller dashboard.
        </p>
        <button
          onClick={() => setActiveTab('register')}
          className="btn btn-primary cursor-pointer"
          style={{ padding: '9px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Register Equipment
        </button>
      </div>
    )}
  </div>

  {/*  ── My Machinery Bookings Section ──  */}
  {myBookings.length > 0 && (
    <div style={{ marginTop: '36px', background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>📁 My Equipment Bookings</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Recent machinery reservations from Custom Hiring Centres</p>
        </div>
        <button
          onClick={fetchBookings}
          className="cursor-pointer"
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {myBookings.map((b) => (
          <div key={b.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                🚜 {b.itemTitle || b.machinery?.title || b.targetId}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: b.status === 'CONFIRMED' ? '#dcfce7' : '#fef9c3', color: b.status === 'CONFIRMED' ? '#15803d' : '#854d0e' }}>
                {b.status === 'CONFIRMED' ? 'Confirmed' : '⏳ ' + b.status}
              </span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>
              ₹{(b.totalAmount || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Date: {b.startDate ? new Date(b.startDate).toLocaleDateString() : (b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'Today')} {b.duration ? `• ${b.duration}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  </div>
  )}

  {/*  TAB 2: REGISTER EQUIPMENT  */}
  {activeTab === 'register' && (
    <div className="tab-content active" id="postSection">
      <div className="post-form-card">
        <div className="post-form-head">
          <h3>📢 Register Your Equipment</h3>
          <p>List your tractor, harvester, or other machinery to get booking requests from nearby farmers.</p>
        </div>
        <div className="post-form-body">
          {postSubmitted ? (
            <div className="post-success" id="postSuccess" style={{ display: 'block' }}>
              <div className="post-success-icon">🚜</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>Equipment Registered!</div>
              <div style={{ color: 'var(--gray-600)', fontSize: '.95rem', marginBottom: '24px' }}>Your machinery is now listed and visible to farmers in your district. You'll receive calls for bookings.</div>
              <div style={{ background: '#e8f5d6', borderRadius: '12px', padding: '16px 24px', display: 'inline-block', marginBottom: '28px' }}>
                <div style={{ fontSize: '.82rem', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.05em' }}>Machine Listing ID</div>
                <div id="listingId" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '.1em' }}>{listingId}</div>
              </div>
              <div>
                <button className="btn btn-outline cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => setPostSubmitted(false)}>
                  + Register Another Machine
                </button>
              </div>
            </div>
          ) : (
            <form id="postEquipmentForm" className="post-form-grid" onSubmit={handleRegisterEquipment}>
              <div className="form-group">
                <label className="form-label" htmlFor="postMachineName">Machine Model Name <span>*</span></label>
                <input type="text" className="form-control" id="postMachineName" name="postMachineName" placeholder="e.g. Mahindra 575 DI Tractor" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postMachineType">Machine Type <span>*</span></label>
                <select className="form-control" id="postMachineType" name="postMachineType" required>
                  <option value="" disabled selected>Select type…</option>
                  <option value="Tractor">🚜 Tractor</option>
                  <option value="Harvester">🌾 Harvester</option>
                  <option value="Rotavator">🔄 Rotavator</option>
                  <option value="Thresher">⚙️ Thresher</option>
                  <option value="Sprayer">💦 Sprayer</option>
                  <option value="Seed Drill">🌱 Seed Drill</option>
                  <option value="Baler">📦 Baler</option>
                  <option value="Plough">🪵 Plough</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postOwnerName">Owner / Provider Name <span>*</span></label>
                <input type="text" className="form-control" id="postOwnerName" name="postOwnerName" placeholder="e.g. Ramesh Kumar" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postPhone">Mobile Number <span>*</span></label>
                <input type="tel" className="form-control" id="postPhone" name="postPhone" placeholder="10-digit number" maxLength={10} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postState">State <span>*</span></label>
                <select className="form-control" id="postState" name="postState" required>
                  <option value="" disabled selected>Select state…</option>
                  <option>Uttar Pradesh</option>
                  <option>Punjab</option>
                  <option>Haryana</option>
                  <option>Madhya Pradesh</option>
                  <option>Rajasthan</option>
                  <option>Bihar</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postDistrict">District <span>*</span></label>
                <input type="text" className="form-control" id="postDistrict" name="postDistrict" placeholder="e.g. Meerut, Hapur…" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postHourlyRate">Hourly Rate (₹ per hour) <span>*</span></label>
                <input type="number" className="form-control" id="postHourlyRate" name="postHourlyRate" placeholder="e.g. 400" min="50" max="5000" required />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", height: "100%", paddingTop: "28px" }}>
                <label className="checkbox-option cursor-pointer" style={{ width: "100%", cursor: 'pointer' }}>
                  <input type="checkbox" id="postOperator" name="operator" defaultValue="true" />
                  <span className="checkbox-check">✓</span> 👨‍🌾 Includes Operator
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postSpecs">Specifications (optional)</label>
                <input type="text" className="form-control" id="postSpecs" name="postSpecs" placeholder="e.g. 50 HP, 2022 Model, etc." />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postVillage">Village / Area</label>
                <input type="text" className="form-control" id="postVillage" name="postVillage" placeholder="Village name (optional)" />
              </div>

              <div className="form-group full" style={{ marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary btn-lg cursor-pointer" style={{ width: "100%", justifyContent: "center", cursor: 'pointer' }}>
                  📢 Register My Equipment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )}

  {/*  CHC helpline  */}
  <div style={{"textAlign":"center","color":"var(--gray-400)","fontSize":".9rem","marginTop":"8px"}}>
    📞 CHC Helpline: <strong style={{"color":"var(--primary)"}}>1800-180-1551</strong> (Toll Free) · Mon–Sat 8AM–6PM
  </div>

</div>
)}

{/*  ── Footer ────────────────────────────────────────────────  */}
  <footer>
    <div className="container">
      <p style={{"fontSize":"16px","fontWeight":"600","marginBottom":"16px"}}>Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳</p>
      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/predict">Diagnose Crop</a>
        <a href="/machinery">Machinery</a>
        <a href="/labour">Labour</a>
        <a href="/market">Market Price</a>
        <a href="/calculator">Calculator</a>
      </div>
      <p className="footer-copy">&copy; 2026 Aegroshield. All rights reserved.</p>
    </div>
  </footer>




{/*  ── Firebase Integration ────────────────────────────────  */}





{/*  ── Aegroshield AI Chatbot Widget ──  */}
<div id="chatbotWidget">
  <button id="chatToggle" className="chat-toggle" title="Chat with Aegroshield AI" aria-label="Open chat">💬</button>
  <div id="chatWindow" className="chat-window">
    <div className="chat-header">
      <span className="chat-title">🌱 Aegroshield Assistant</span>
      <select id="languageSelector" className="language-selector" aria-label="Select language">
        <option defaultValue="en">English</option>
        <option defaultValue="hi">हिन्दी</option>
        <option defaultValue="pa">ਪੰਜਾਬੀ</option>
        <option defaultValue="hi-en">Hinglish</option>
        <option defaultValue="te">తెలుగు</option>
        <option defaultValue="ta">தமிழ்</option>
        <option defaultValue="kn">ಕನ್ನಡ</option>
        <option defaultValue="mr">मराठी</option>
        <option defaultValue="gu">ગુજરાતી</option>
        <option defaultValue="bn">বাংলা</option>
        <option defaultValue="or">ଓଡ଼ିଆ</option>
        <option defaultValue="ml">മലയാളം</option>
        <option defaultValue="as">অসমীয়া</option>
        <option defaultValue="ur">اردو</option>
        <option defaultValue="sd">سندھی</option>
      </select>
      <button id="closeChat" className="close-btn" aria-label="Close chat">✕</button>
    </div>
    <div id="messagesContainer" className="messages-container">
      <div className="welcome-message" id="welcomeMsg"></div>
    </div>
    <div className="input-area">
      <input type="text" id="userInput" className="user-input" placeholder="Type your question..." autoComplete="off" aria-label="Chat input" />
      <button id="sendButton" className="send-btn" aria-label="Send message">➤</button>
    </div>
  </div>
</div>

{bookingMachine && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
    <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
      {bookingStatus === 'success' ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Booking Request Sent!</h3>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
            Your machinery booking for <strong>{bookingMachine.title || bookingMachine.equipmentType}</strong> has been registered in <strong>PENDING</strong> status.
          </p>
          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Booking Reference: <strong>{confirmedBookingId}</strong></span>
          </div>
          <button
            onClick={() => setBookingMachine(null)}
            className="btn btn-primary cursor-pointer"
            style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Book Farm Machinery</h3>
            <button onClick={() => setBookingMachine(null)} style={{ border: 'none', background: 'transparent', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h4 style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{bookingMachine.title || bookingMachine.equipmentType}</h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                ID: {bookingMachine.id || 'MCH-01'}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>📍 {bookingMachine.district} • 📞 {bookingMachine.contactPhone || 'Contact CHC'}</p>
            <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
              ₹{bookingMachine.ratePerHour || bookingMachine.pricePerHour || bookingMachine.rate || 400}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>/hour</span>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Your Full Name:
            </label>
            <input
              type="text"
              value={bookingCustomerName}
              onChange={(e) => setBookingCustomerName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Booking Date:
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Contact Phone:
              </label>
              <input
                type="tel"
                value={bookingContactPhone}
                onChange={(e) => setBookingContactPhone(e.target.value)}
                placeholder="10-digit mobile"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Select Required Hours:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 4, 6, 8].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setBookingHours(h)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: bookingHours === h ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: bookingHours === h ? '#f0fdf4' : '#fff',
                    fontWeight: 600,
                    color: bookingHours === h ? '#166534' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {h} hrs
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Estimated Total:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              ₹{(Number(bookingMachine.ratePerHour || bookingMachine.pricePerHour || bookingMachine.rate || 400)) * bookingHours}
            </span>
          </div>

          {bookingStatus === 'error' && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️ <strong>{bookingErrorMessage || 'Failed: Booking could not be registered.'}</strong></span>
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={bookingStatus === 'booking'}
            className="btn btn-primary cursor-pointer"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {bookingStatus === 'booking' ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
                </svg>
                <span>Confirming Booking...</span>
              </>
            ) : (
              '⚡ Confirm & Place Booking'
            )}
          </button>
        </div>
      )}
    </div>
  </div>
)}

    </main>
  );
}
