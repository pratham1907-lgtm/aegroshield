"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, auth, signInWithGoogle } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { MOCK_LABOUR } from "@/lib/mockData";

export default function Page() {
  const { user, userData, isDemo, loginAsDemo } = useAuth();
  const [liveLabour, setLiveLabour] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'find' | 'register'>('find');
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [listingId, setListingId] = useState('');
  const [userBookings, setUserBookings] = useState<any[]>([]);

  // Booking Modal State
  const [bookingLabour, setBookingLabour] = useState<any | null>(null);
  const [bookingDays, setBookingDays] = useState<number>(1);
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingCustomerName, setBookingCustomerName] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [bookingErrorMessage, setBookingErrorMessage] = useState<string>('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  const isGuest = !user && !isDemo;
  const isRealUser = Boolean(user && !isDemo);

  const fetchUserBookings = async () => {
    if (!user?.uid && !auth.currentUser?.uid) return;
    try {
      const activeUid = auth.currentUser?.uid || user?.uid;
      const res = await fetch(`/api/bookings?firebaseUid=${activeUid}`);
      const json = await res.json();
      if (json?.data && json.data.length > 0) {
        setUserBookings(json.data.filter((b: any) => b.bookingType === 'LABOUR' || !b.bookingType));
      }
    } catch (err) {
      console.warn('[Labour] Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    if (isGuest) {
      setLiveLabour([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setLiveLabour(MOCK_LABOUR);
      setLoading(false);
      return;
    }

    // Authenticated Real User: Query ONLY live database records via Prisma
    setLoading(true);
    fetch('/api/labour?isDemo=false')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setLiveLabour(json.data);
        } else {
          setLiveLabour([]);
        }
      })
      .catch((err) => {
        console.warn('[Labour] Error fetching labour from API:', err);
        setLiveLabour([]);
      })
      .finally(() => {
        setLoading(false);
      });

    fetchUserBookings();
  }, [user, isDemo, isGuest]);

  const handlePostAvailability = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDemo) {
      const demoListingId = 'DEMO-LBR-' + Math.floor(100000 + Math.random() * 900000);
      setListingId(demoListingId);
      setPostSubmitted(true);
      return;
    }

    if (!auth.currentUser) {
      const wantsSignIn = confirm("A verified Google Account is required to post labour availability. Sign in with Google now?");
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
        alert("Sign-in required: Please sign in with Google to post labour availability.");
        return;
      }
    }

    if (!auth.currentUser) return;

    const formData = new FormData(e.currentTarget);
    const checkedTasks: string[] = [];
    const taskCheckboxes = e.currentTarget.querySelectorAll('input[name="tasks"]:checked');
    taskCheckboxes.forEach((cb: any) => checkedTasks.push(cb.value));

    const token = await auth.currentUser?.getIdToken();
    const activeUid = auth.currentUser.uid;
    const activeEmail = auth.currentUser.email || '';
    const activeName = auth.currentUser.displayName || (formData.get('postName') as string) || 'Labour Leader';
    const activePhone = (formData.get('postPhone') as string) || auth.currentUser.phoneNumber || '';

    const newLabour = {
      leaderName: (formData.get('postName') as string) || 'Worker Group',
      teamLeaderName: (formData.get('postName') as string) || 'Worker Group',
      phone: activePhone,
      contactPhone: activePhone,
      district: (formData.get('postDistrict') as string) || 'Meerut',
      wagePerDay: Number(formData.get('postRate')) || 400,
      dailyRatePerWorker: Number(formData.get('postRate')) || 400,
      groupSize: Number(formData.get('postGroupSize')) || 5,
      teamSize: Number(formData.get('postGroupSize')) || 5,
      primarySkill: checkedTasks.join(', ') || 'Harvesting, Sowing',
      specialization: checkedTasks.join(', ') || 'Harvesting, Sowing',
      userId: activeUid,
      leaderId: activeUid,
      firebaseUid: activeUid,
      available: true,
    };

    try {
      const res = await fetch('/api/labour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-firebase-uid': activeUid,
          ...(activeEmail ? { 'x-user-email': activeEmail } : {}),
          'x-user-name': encodeURIComponent(activeName),
          ...(activePhone ? { 'x-user-phone': activePhone } : {}),
        },
        body: JSON.stringify(newLabour),
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.data?.id) {
        setListingId(data.data.id);
        setPostSubmitted(true);
        // Refresh catalog immediately from database
        fetch('/api/labour?isDemo=false')
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && Array.isArray(d.data)) setLiveLabour(d.data);
          });
      } else {
        alert("Failed to post labour: " + (data?.error || `Server returned ${res.status}`));
      }
    } catch (err: any) {
      console.error('[Labour] Error saving worker availability via API:', err);
      alert("Error saving labour post: " + (err?.message || "Network error"));
    }
  };

  const handleConfirmLabourBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingLabour) return;

    const dailyRate = Number(bookingLabour.dailyRatePerWorker || bookingLabour.wagePerDay || bookingLabour.dailyRate || 400);
    const groupSize = Number(bookingLabour.teamSize || bookingLabour.groupSize || 5);
    const totalAmount = dailyRate * groupSize * bookingDays;
    const targetId = String(bookingLabour.id || 'lab-' + Date.now());
    const startDateObj = bookingDate ? new Date(bookingDate) : new Date();
    const endDateObj = new Date(startDateObj.getTime() + bookingDays * 24 * 60 * 60 * 1000);
    const startDate = startDateObj.toISOString();
    const endDate = endDateObj.toISOString();

    // In demo mode: simulate booking locally without polluting PostgreSQL
    if (isDemo) {
      const demoBkId = 'DEMO-LBR-BK-' + Math.floor(100000 + Math.random() * 900000);
      setConfirmedBookingId(demoBkId);
      setBookingStatus('success');
      setBookingErrorMessage('');
      setUserBookings((prev) => [
        {
          id: demoBkId,
          teamLeaderName: bookingLabour.leaderName || bookingLabour.teamLeaderName || 'Demo Squad',
          totalAmount: totalAmount,
          bookingDate: startDate,
          status: 'CONFIRMED (DEMO)',
        },
        ...prev,
      ]);
      return;
    }

    if (!auth.currentUser) {
      const wantsSignIn = confirm("A verified Google Account is required to book farm labour. Sign in with Google now?");
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
        const msg = "Sign-in required: Please sign in with Google to confirm your labour booking.";
        setBookingErrorMessage(msg);
        setBookingStatus('error');
        alert(msg);
        return;
      }
    }

    if (!auth.currentUser) {
      const msg = "Sign-in required: Please sign in with Google to confirm your labour booking.";
      setBookingErrorMessage(msg);
      setBookingStatus('error');
      return;
    }

    setBookingStatus('booking');
    setBookingErrorMessage('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const activeUid = auth.currentUser.uid;
      const activeEmail = auth.currentUser.email || null;
      const customerName = (bookingCustomerName || auth.currentUser.displayName || userData?.name || user?.displayName || 'AgriShield Farmer').trim();
      const customerPhone = (bookingPhone || auth.currentUser.phoneNumber || userData?.phone || user?.phoneNumber || '').trim();

      const payload = {
        bookingType: 'LABOUR',
        labourPostId: targetId,
        targetId: targetId,
        leaderName: bookingLabour.leaderName || bookingLabour.teamLeaderName || 'Worker Group',
        groupSize: groupSize,
        primarySkill: bookingLabour.primarySkill || bookingLabour.specialization || 'Harvesting, Sowing',
        wagePerDay: dailyRate,
        district: bookingLabour.district || 'Meerut',
        leaderPhone: bookingLabour.phone || bookingLabour.contactPhone || customerPhone,
        startDate: startDate,
        endDate: endDate,
        bookingDate: startDate,
        totalAmount: totalAmount,
        pricePerHour: dailyRate,
        days: bookingDays,
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
        fetchUserBookings();
      } else {
        const reason = data?.error || `Booking failed with status ${res.status}`;
        const formatted = `Failed: ${reason}`;
        setBookingErrorMessage(formatted);
        setBookingStatus('error');
        alert(formatted);
      }
    } catch (err: any) {
      console.error('Booking labour error:', err);
      const rawReason = err?.message || 'Network error occurred. Please try again.';
      const formatted = rawReason.startsWith('Failed:') ? rawReason : `Failed: ${rawReason}`;
      setBookingErrorMessage(formatted);
      setBookingStatus('error');
      alert(formatted);
    }
  };

  const displayLabour = useMemo(() => {
    if (isGuest) {
      return [];
    }
    if (isDemo) {
      return MOCK_LABOUR;
    }
    return liveLabour || [];
  }, [isGuest, isDemo, liveLabour]);

  return (
    <main>
{/*  ── Navbar ────────────────────────────────────────────────  */}
  
  

{/*  ── Page Hero ─────────────────────────────────────────────  */}
<div className="page-hero">
  <div className="container">
    <div className="page-hero-badge">👥 Farm Labour Board</div>
    <h1>Farm Labour Board</h1>
    <p>Find workers for your field or post your availability</p>
  </div>

  <div className="hero-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
    </svg>
  </div>
</div>
{/*  ── Main ──────────────────────────────────────────────────  */}
<main className="labour-layout">

  {/*  Stats Strip  */}
  <div className="stats-strip" style={{"marginBottom":"28px"}}>
    <div className="stat-card">
      <div className="stat-icon green">👥</div>
      <div><div className="stat-label">Available Workers</div><div className="stat-value">{displayLabour.length * 5}</div><div className="stat-sub">Across {displayLabour.length} teams</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon amber">🌾</div>
      <div><div className="stat-label">Active Groups</div><div className="stat-value">{displayLabour.length}</div><div className="stat-sub">In Meerut district</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon blue">💰</div>
      <div><div className="stat-label">Avg. Wage</div><div className="stat-value">₹400</div><div className="stat-sub">/day per worker</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon green">⭐</div>
      <div><div className="stat-label">Rating</div><div className="stat-value">4.7/5</div><div className="stat-sub">113 verified jobs</div></div>
    </div>
  </div>

  {/*  ── Tab Toggle ───────────────────────────────────────────  */}
  <div className="tab-bar">
    <button
      className={`tab-toggle cursor-pointer ${activeTab === 'find' ? 'active' : ''}`}
      style={{ cursor: 'pointer' }}
      id="findLabourTab"
      onClick={() => setActiveTab('find')}
    >
      🔍 Find Workers
    </button>
    <button
      className={`tab-toggle cursor-pointer ${activeTab === 'register' ? 'active' : ''}`}
      style={{ cursor: 'pointer' }}
      id="postLabourTab"
      onClick={() => setActiveTab('register')}
    >
      📢 Post Availability
    </button>
  </div>

  {activeTab === 'find' && (
    <div className="tab-content active" id="findLabourSection">

    {/*  ── Demo Mode Notice ──  */}
    {isDemo && (
      <div style={{ marginBottom: '20px', padding: '14px 20px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', fontSize: '0.92rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🧪</span>
          <div>
            <strong>Demo Mode Active</strong>: Viewing sample labour squads (Surendra Pal & Group, Ram Prasad & Team, etc.).
            <div style={{ fontSize: '0.82rem', color: '#b45309' }}>Actions and bookings taken in demo mode are simulated locally and isolated from the database.</div>
          </div>
        </div>
        <button
          onClick={() => signInWithGoogle()}
          className="cursor-pointer"
          style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Sign in with Google
        </button>
      </div>
    )}

    {/*  Search Card  */}
    <div className="search-card">
      <h2>🔍 Search Available Labour Groups</h2>
      <div className="search-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="taskType">Task Required</label>
          <select className="form-control" id="taskType">
            <option defaultValue="">All Tasks</option>
            <option defaultValue="Harvesting">🌾 Harvesting</option>
            <option defaultValue="Sowing">🌱 Sowing &amp; Planting</option>
            <option defaultValue="Weeding">🪴 Weeding &amp; Hoeing</option>
            <option defaultValue="Spraying">🧪 Pesticide Spraying</option>
            <option defaultValue="Irrigation">💦 Irrigation Work</option>
            <option defaultValue="Loading">📦 Loading / Packing</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="labourState">State</label>
          <select className="form-control" id="labourState">
            <option defaultValue="">Select State</option>
            <option>Uttar Pradesh</option><option>Haryana</option>
            <option>Punjab</option><option>Bihar</option>
            <option>Madhya Pradesh</option><option>Rajasthan</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="labourDistrict">District</label>
          <input type="text" className="form-control" id="labourDistrict" placeholder="e.g. Meerut, Hapur" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="workDate">Work Start Date</label>
          <input type="date" className="form-control" id="workDate" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="workersNeeded">Workers Needed</label>
          <input type="number" className="form-control" id="workersNeeded" placeholder="e.g. 5" min="1" max="50" defaultValue="4" />
        </div>
      </div>
      <div style={{"marginTop":"18px","display":"flex","justifyContent":"flex-end"}}>
        <button className="btn btn-primary btn-lg" id="searchLabour">
          🔍 Search Available Labour →
        </button>
      </div>
    </div>

    {/*  Filter Pills  */}
    <div className="filter-pills-bar">
      <span className="filter-pills-label">Filter:</span>
      <button className="filter-pill active" data-filter="all">All</button>
      <button className="filter-pill" data-filter="available-today">✅ Available Now</button>
      <button className="filter-pill" data-filter="under-400">💰 Under ₹400/day</button>
      <button className="filter-pill" data-filter="harvesting">🌾 Harvesting</button>
      <button className="filter-pill" data-filter="group">👥 Groups (5+)</button>
    </div>

    {/*  Results Header  */}
    <div className="results-header">
      <div className="results-count">Showing <span id="labourResultsCount">{displayLabour.length}</span> labour groups near Meerut, UP</div>
      <select className="sort-select">
        <option>Sort: Nearest First</option>
        <option>Sort: Price: Low to High</option>
        <option>Sort: Highest Rated</option>
        <option>Sort: Group Size: Large to Small</option>
      </select>
    </div>

    {/*  Labour Results  */}
    <div id="labourResults">
      {isGuest ? (
        <div style={{ padding: '56px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', margin: '20px 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem' }}>
            🔒
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Sign in to view local labour squads
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
            Connect with verified agricultural workers, harvesting groups, and sowing teams across your district with real wages and transparent booking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => signInWithGoogle()}
              className="btn btn-primary cursor-pointer"
              style={{ padding: '10px 22px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in with Google
            </button>
            <button
              onClick={() => loginAsDemo('farmer')}
              className="btn btn-outline cursor-pointer"
              style={{ padding: '10px 22px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Explore in Demo Mode
            </button>
          </div>
        </div>
      ) : loading ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Querying live labour squads from Supabase...</p>
        </div>
      ) : displayLabour.length > 0 ? (
        displayLabour.map((item, idx) => (
          <div key={item.id || idx} className="labour-card">
            <div className="lc-avatar">{(item.teamLeaderName || item.workerName || 'WK').slice(0, 2).toUpperCase()}</div>
            <div className="lc-body">
              <div className="lc-top">
                <div>
                  <div className="lc-name">{item.teamLeaderName || item.workerName || item.leaderName || 'Work Group'}</div>
                  <div className="lc-location">📍 {item.district || 'Nearby'}</div>
                </div>
                <span className="lc-avail available">● Available</span>
              </div>
              <div className="lc-skills">
                <span className="skill-pill">🌾 {item.specialization || item.primarySkill || 'Farm Work'}</span>
              </div>
              <div className="lc-info">
                <div className="lc-info-item">👥 Group of <span className="li-val">{item.teamSize || item.groupSize || 1}</span></div>
                <div className="lc-info-item">💰 <span className="li-val">₹{item.dailyRatePerWorker || item.wagePerDay || 400}</span>/day</div>
                <div className="lc-info-item">📞 <span className="li-val">{item.contactPhone || item.phone || 'Contact Provider'}</span></div>
              </div>
              <div className="lc-actions" style={{ marginTop: '12px' }}>
                <button
                  onClick={() => {
                    setBookingLabour(item);
                    setBookingStatus('idle');
                    setConfirmedBookingId('');
                    setBookingCustomerName(userData?.name || user?.displayName || 'AgriShield Farmer');
                    setBookingPhone(userData?.phone || user?.phoneNumber || '');
                  }}
                  className="btn-send-request cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  📩 Book Workers
                </button>
                <a
                  href={`tel:${item.contactPhone || item.phone || '9876543210'}`}
                  className="btn-call cursor-pointer"
                  style={{ cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  📞 Call
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '56px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1', margin: '20px 0' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>👥</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No labour postings available in your area yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px' }}>
            There are currently 0 records in the live database. Be the first to list your squad or post worker availability.
          </p>
          <button
            onClick={() => setActiveTab('register')}
            className="btn btn-primary cursor-pointer"
            style={{ padding: '9px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Post Worker Availability
          </button>
        </div>
      )}
    </div>

    {/*  MY BOOKINGS  */}
    <div id="myBookings" className="my-bookings-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📁 My Bookings</h2>
          <span style={{"fontSize":".85rem","color":"var(--gray-400)"}}>Recent labour history and pending requests</span>
        </div>
        <button
          type="button"
          onClick={fetchUserBookings}
          className="cursor-pointer"
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>

      {userBookings.length > 0 ? (
        userBookings.map((b) => (
          <div key={b.id} className="booking-history-card">
            <div className="bhc-header">
              <div className="bhc-worker">
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,var(--primary),var(--mid))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: ".85rem" }}>
                  {(b.teamLeaderName || b.workerName || 'WK').slice(0, 2).toUpperCase()}
                </div>
                {b.teamLeaderName || b.workerName || 'Labour Group'}
              </div>
              <span className={`status-badge ${b.status === 'Completed' || b.status === 'CONFIRMED' ? 'status-completed' : 'status-pending'}`}>
                {b.status === 'Completed' || b.status === 'CONFIRMED' ? '✅ Confirmed' : '⏳ ' + (b.status || 'Pending')}
              </span>
            </div>
            <div className="bhc-body">
              <div className="bhc-meta-grid">
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val">{b.task || b.targetId || 'Farm Work Squad'}</div>
                  <div className="bhc-meta-lbl">Target</div>
                </div>
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val">{b.date || (b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'Today')}</div>
                  <div className="bhc-meta-lbl">Date</div>
                </div>
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val">{b.hours ? `${b.hours} hrs` : 'Full Day'} · {b.teamSize || b.workersCount || 5} workers</div>
                  <div className="bhc-meta-lbl">Duration</div>
                </div>
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val" style={{ color: "var(--primary)" }}>₹{(b.totalAmount || b.totalPaid || b.dailyRate || 0).toLocaleString()}</div>
                  <div className="bhc-meta-lbl">Total Amount</div>
                </div>
              </div>

              {/* Rating Form */}
              <div className="rating-form" id={`ratingForm-${b.id}`}>
                <div className="rating-label">⭐ Rate this team</div>
                <div className="stars-row">
                  <button className="star-btn" data-val="1" onClick={() => {}}>★</button>
                  <button className="star-btn" data-val="2" onClick={() => {}}>★</button>
                  <button className="star-btn" data-val="3" onClick={() => {}}>★</button>
                  <button className="star-btn" data-val="4" onClick={() => {}}>★</button>
                  <button className="star-btn" data-val="5" onClick={() => {}}>★</button>
                </div>
                <div className="rating-meta-row">
                  <div className="form-group" style={{ margin: "0" }}>
                    <label className="form-label">Workers who showed up</label>
                    <input type="number" className="form-control" placeholder="e.g. 8" min="0" max="50" defaultValue={b.workersCount || 8} />
                  </div>
                  <div className="form-group" style={{ margin: "0" }}>
                    <label className="form-label">Work quality feedback</label>
                    <input type="text" className="form-control" placeholder="How was the work quality?" />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: "14px" }} onClick={() => {}}>
                  💾 Save Rating & Attendance
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-bookings-card" style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px dashed #cbd5e1',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '12px' }}>📋</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Abhi tak koi labour booking nahi hai
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
            Apne khet ke kaam ke liye upar दिए गए labour groups ko book karein.
          </p>
        </div>
      )}
    </div>{/* #myBookings */}
  </div>
  )}

  {/* TAB 2: POST AVAILABILITY */}
  {activeTab === 'register' && (
    <div className="tab-content active" id="postSection">
      <div className="post-form-card">
        <div className="post-form-head">
          <h3>📢 Post Your Availability</h3>
          <p>Farmers in your area will see your listing and contact you directly within hours.</p>
        </div>
        <div className="post-form-body">
          {postSubmitted ? (
            <div className="post-success" id="postSuccess" style={{ display: 'block' }}>
              <div className="post-success-icon">📢</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>Listing Posted!</div>
              <div style={{ color: 'var(--gray-600)', fontSize: '.95rem', marginBottom: '24px' }}>Your availability is now visible to farmers in your district. You'll receive calls within a few hours.</div>
              <div style={{ background: '#e8f5d6', borderRadius: '12px', padding: '16px 24px', display: 'inline-block', marginBottom: '28px' }}>
                <div style={{ fontSize: '.82rem', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.05em' }}>Listing ID</div>
                <div id="listingId" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '.1em' }}>{listingId}</div>
              </div>
              <div>
                <button className="btn btn-outline cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => setPostSubmitted(false)}>
                  + Post Another Listing
                </button>
              </div>
            </div>
          ) : (
            <form id="postAvailForm" className="post-form-grid" onSubmit={handlePostAvailability}>
              <div className="form-group">
                <label className="form-label" htmlFor="postName">Worker / Group Name <span>*</span></label>
                <input type="text" className="form-control" id="postName" name="postName" placeholder="e.g. Ramesh Kumar or Bajrang Group" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postPhone">Mobile Number <span>*</span></label>
                <input type="tel" className="form-control" id="postPhone" name="postPhone" placeholder="10-digit number" maxLength={10} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postDistrict">District <span>*</span></label>
                <select className="form-control" id="postDistrict" name="postDistrict" required>
                  <option value="" disabled selected>Select district…</option>
                  <option>Agra</option>
                  <option>Aligarh</option>
                  <option>Allahabad</option>
                  <option>Bareilly</option>
                  <option>Firozabad</option>
                  <option>Ghaziabad</option>
                  <option>Hapur</option>
                  <option>Kanpur</option>
                  <option>Lucknow</option>
                  <option>Mathura</option>
                  <option>Meerut</option>
                  <option>Moradabad</option>
                  <option>Muzaffarnagar</option>
                  <option>Noida</option>
                  <option>Saharanpur</option>
                  <option>Varanasi</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postRate">Daily Rate (₹ per person) <span>*</span></label>
                <input type="number" className="form-control" id="postRate" name="postRate" placeholder="e.g. 400" min="100" max="2000" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postFromDate">Available From <span>*</span></label>
                <input type="date" className="form-control" id="postFromDate" name="postFromDate" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postToDate">Available Until <span>*</span></label>
                <input type="date" className="form-control" id="postToDate" name="postToDate" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postGroupSize">Group Size (no. of workers) <span>*</span></label>
                <input type="number" className="form-control" id="postGroupSize" name="postGroupSize" placeholder="1–20" min="1" max="20" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postVillage">Village / Area</label>
                <input type="text" className="form-control" id="postVillage" name="postVillage" placeholder="Village name (optional)" />
              </div>

              {/* Task Types checkboxes */}
              <div className="form-group full">
                <label className="form-label">Task Types <span>*</span></label>
                <div className="checkbox-grid" id="taskCheckboxes">
                  <label className="checkbox-option cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="tasks" value="Weeding" />
                    <span className="checkbox-check">✓</span> 🪴 Weeding
                  </label>
                  <label className="checkbox-option cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="tasks" value="Harvesting" />
                    <span className="checkbox-check">✓</span> 🌾 Harvesting
                  </label>
                  <label className="checkbox-option cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="tasks" value="Spraying" />
                    <span className="checkbox-check">✓</span> 🧪 Spraying
                  </label>
                  <label className="checkbox-option cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="tasks" value="Sowing" />
                    <span className="checkbox-check">✓</span> 🌱 Sowing
                  </label>
                  <label className="checkbox-option cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="tasks" value="Transplanting" />
                    <span className="checkbox-check">✓</span> 🌿 Transplanting
                  </label>
                  <label className="checkbox-option cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="tasks" value="Packing" />
                    <span className="checkbox-check">✓</span> 📦 Packing
                  </label>
                </div>
              </div>

              <div className="form-group full" style={{ marginTop: "8px" }}>
                <button type="submit" className="btn btn-primary btn-lg cursor-pointer" id="postAvailability" style={{ width: "100%", justifyContent: "center", cursor: 'pointer' }}>
                  📢 Post My Availability
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )}

</main>

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



{/*  ── Labour Booking Modal ──  */}
{bookingLabour && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
    <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
      {bookingStatus === 'success' ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Labour Request Confirmed!</h3>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
            Your request for <strong>{bookingLabour.teamLeaderName || bookingLabour.leaderName || 'Worker Group'}</strong> has been sent and registered in <strong>PENDING</strong> status.
          </p>
          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Booking Reference: <strong>{confirmedBookingId}</strong></span>
          </div>
          <button
            onClick={() => setBookingLabour(null)}
            className="btn btn-primary cursor-pointer"
            style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Book Farm Labour Squad</h3>
            <button onClick={() => setBookingLabour(null)} style={{ border: 'none', background: 'transparent', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h4 style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{bookingLabour.teamLeaderName || bookingLabour.leaderName || 'Agricultural Worker Squad'}</h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                ID: {bookingLabour.id || 'LAB-01'}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>📍 {bookingLabour.district || 'Nearby'} • 👥 Group of {bookingLabour.teamSize || bookingLabour.groupSize || 5} workers</p>
            <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
              ₹{bookingLabour.dailyRatePerWorker || bookingLabour.wagePerDay || bookingLabour.dailyRate || 400}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>/day per worker</span>
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
                Start Date:
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
                value={bookingPhone}
                onChange={(e) => setBookingPhone(e.target.value)}
                placeholder="10-digit mobile"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Select Number of Days:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 5, 7].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setBookingDays(d)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: bookingDays === d ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: bookingDays === d ? '#f0fdf4' : '#fff',
                    fontWeight: 600,
                    color: bookingDays === d ? '#166534' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {d} {d === 1 ? 'day' : 'days'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Estimated Total:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              ₹{(Number(bookingLabour.dailyRatePerWorker || bookingLabour.wagePerDay || bookingLabour.dailyRate || 400)) * (Number(bookingLabour.teamSize || bookingLabour.groupSize || 5)) * bookingDays}
            </span>
          </div>

          {bookingStatus === 'error' && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '10px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️ <strong>{bookingErrorMessage || 'Failed: Labour request could not be registered.'}</strong></span>
            </div>
          )}

          <button
            onClick={handleConfirmLabourBooking}
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
                <span>Sending Request...</span>
              </>
            ) : (
              '⚡ Confirm & Send Request'
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
