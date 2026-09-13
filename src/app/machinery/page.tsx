"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { MOCK_MACHINERY } from "@/lib/mockData";

export default function Page() {
  const { user, userData, isDemo } = useAuth();
  const [liveMachinery, setLiveMachinery] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'find' | 'register'>('find');
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [listingId, setListingId] = useState('');

  // Booking Modal State
  const [bookingMachine, setBookingMachine] = useState<any | null>(null);
  const [bookingHours, setBookingHours] = useState<number>(4);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  const isDemoUser = Boolean(isDemo || !user);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/machinery?isDemo=${isDemoUser}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setLiveMachinery(json.data);
        } else {
          setLiveMachinery(MOCK_MACHINERY);
        }
      })
      .catch((err) => {
        console.warn('[Machinery] Error fetching machinery from API:', err);
        setLiveMachinery(MOCK_MACHINERY);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isDemo, isDemoUser]);

  const handleRegisterEquipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMachine = {
      title: (formData.get('postMachineName') as string) || '',
      model: (formData.get('postMachineName') as string) || '',
      equipmentType: (formData.get('postMachineType') as string) || 'Tractor',
      machineType: (formData.get('postMachineType') as string) || 'Tractor',
      ratePerHour: Number(formData.get('postHourlyRate')) || 400,
      district: (formData.get('postDistrict') as string) || 'Meerut',
      state: (formData.get('postState') as string) || 'Uttar Pradesh',
      contactPhone: (formData.get('postPhone') as string) || '',
      chcName: (formData.get('postOwnerName') as string) || 'Private Owner',
      firebaseUid: user?.uid || null,
      available: true,
      createdAt: new Date().toISOString(),
    };

    const newId = 'MCH-' + Math.floor(100000 + Math.random() * 900000);
    setListingId(newId);

    try {
      const res = await fetch('/api/machinery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMachine),
      });
      const data = await res.json();
      if (data?.data?.id) {
        setListingId(data.data.id);
      }
    } catch (err) {
      console.warn('[Machinery] Error saving equipment via API:', err);
    }

    setLiveMachinery((prev) => [{ id: newId, ...newMachine }, ...(prev || [])]);
    setPostSubmitted(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingMachine) return;
    setBookingStatus('booking');
    try {
      const rate = bookingMachine.ratePerHour || bookingMachine.rate || 400;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'MACHINERY',
          targetId: String(bookingMachine.id || 'mach-' + Date.now()),
          totalAmount: rate * bookingHours,
          bookingDate: new Date().toISOString(),
          firebaseUid: user?.uid || null,
          userName: userData?.name || user?.displayName || 'Farmer',
          userPhone: userData?.phone || user?.phoneNumber || '',
          userEmail: user?.email || '',
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setConfirmedBookingId(data.data.id);
        setBookingStatus('success');
      } else {
        setBookingStatus('error');
      }
    } catch (err) {
      console.warn('Booking error:', err);
      setBookingStatus('error');
    }
  };

  const displayMachinery = useMemo(() => {
    if (liveMachinery !== null) {
      return liveMachinery;
    }
    return MOCK_MACHINERY;
  }, [liveMachinery]);

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
{/*  ── Main ──────────────────────────────────────────────────  */}
<main className="machinery-layout">

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
    {displayMachinery.length > 0 ? (
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
            <h3 className="mc-title">{machine.equipmentType || machine.model || 'Farm Machine'}</h3>
            <p className="mc-chc">🏭 {machine.chcName || 'Local Hiring Centre'}</p>
            <div className="mc-specs">
              <span className="spec-pill">⚙️ {machine.model || 'Standard'}</span>
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
      <div style={{ gridColumn: '1 / -1', padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🚜</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No machinery listings available yet</h3>
        <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto' }}>
          Be the first to list your tractor or harvester using the Register Equipment tab.
        </p>
      </div>
    )}
  </div>

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



{/*  ── Machinery Booking Modal ──  */}
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
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{bookingMachine.title || bookingMachine.equipmentType}</h4>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>📍 {bookingMachine.district} • 📞 {bookingMachine.contactPhone || 'Contact CHC'}</p>
            <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
              ₹{bookingMachine.ratePerHour || bookingMachine.rate || 400}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>/hour</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
              ₹{(bookingMachine.ratePerHour || bookingMachine.rate || 400) * bookingHours}
            </span>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={bookingStatus === 'booking'}
            className="btn btn-primary cursor-pointer"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', cursor: 'pointer' }}
          >
            {bookingStatus === 'booking' ? 'Confirming Booking...' : '⚡ Confirm & Place Booking'}
          </button>
        </div>
      )}
    </div>
  </div>
)}

    </main>
  );
}
