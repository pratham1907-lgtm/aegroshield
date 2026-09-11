"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MOCK_LABOUR } from "@/lib/mockData";

export default function Page() {
  const { user, userData, isDemo } = useAuth();
  const [liveLabour, setLiveLabour] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [userBookings, setUserBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user && !isDemo) {
      setLoading(true);
      const fetchLabour = async () => {
        try {
          const snap1 = await getDocs(collection(db, 'labour'));
          const snap2 = await getDocs(collection(db, 'workerListings'));
          const items: any[] = [];
          snap1.forEach(d => items.push({ id: d.id, ...d.data() }));
          snap2.forEach(d => items.push({ id: d.id, ...d.data() }));
          setLiveLabour(items);
        } catch (err) {
          console.warn("[Labour] Error fetching Firestore labour:", err);
          setLiveLabour([]);
        } finally {
          setLoading(false);
        }
      };
      const fetchUserBookings = async () => {
        try {
          const q = query(collection(db, 'labourBookings'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          const items: any[] = [];
          snap.forEach(d => items.push({ id: d.id, ...d.data() }));
          setUserBookings(items);
        } catch (err) {
          console.warn("[Labour] Error fetching user bookings:", err);
          setUserBookings([]);
        }
      };
      fetchLabour();
      fetchUserBookings();
    } else {
      setLiveLabour(null);
      setUserBookings([]);
    }
  }, [user, isDemo]);

  const isRealAccount = Boolean(user && !isDemo);

  const displayLabour = useMemo(() => {
    if (isRealAccount) {
      return liveLabour || [];
    }
    return MOCK_LABOUR;
  }, [isRealAccount, liveLabour]);

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
    <button className="tab-toggle active" id="findLabourTab" onClick={() => {}}>
      🔍 Find Workers
    </button>
    <button className="tab-toggle" id="postLabourTab" onClick={() => {}}>
      📢 Post Availability
    </button>
  </div>

  {/*  ════════════════════════════════════════════════════════  */}
  {/*  TAB 1: FIND LABOUR                                        */}
  {/*  ════════════════════════════════════════════════════════  */}
  <div className="tab-content active" id="findLabourSection">

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
      {displayLabour.length > 0 ? (
        displayLabour.map((item, idx) => (
          <div key={item.id || idx} className="labour-card">
            <div className="lc-avatar">{(item.teamLeaderName || item.workerName || 'WK').slice(0, 2).toUpperCase()}</div>
            <div className="lc-body">
              <div className="lc-top">
                <div>
                  <div className="lc-name">{item.teamLeaderName || item.workerName || 'Work Group'}</div>
                  <div className="lc-location">📍 {item.district || 'Nearby'}</div>
                </div>
                <span className="lc-avail available">● Available</span>
              </div>
              <div className="lc-skills">
                <span className="skill-pill">🌾 {item.specialization || item.tasks || 'Farm Work'}</span>
              </div>
              <div className="lc-info">
                <div className="lc-info-item">👥 Group of <span className="li-val">{item.teamSize || item.groupSize || 1}</span></div>
                <div className="lc-info-item">💰 <span className="li-val">₹{item.dailyRatePerWorker || item.dailyRate || 400}</span>/day</div>
                <div className="lc-info-item">📞 <span className="li-val">{item.contactPhone || item.phone || 'Contact Provider'}</span></div>
              </div>
              <div className="lc-actions" style={{ marginTop: '12px' }}>
                <button className="btn-send-request">📩 Send Request</button>
                <button className="btn-call">📞 Call</button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', margin: '20px 0' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>👥</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No labour postings available in your area yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 16px' }}>
            Post your availability or request workers for harvesting, weeding, or sowing using the Post Availability tab.
          </p>
        </div>
      )}
    </div>

    {/*  MY BOOKINGS  */}
    <div id="myBookings" className="my-bookings-section">
      <div className="section-header">
        <h2>📁 My Bookings</h2>
        <span style={{"fontSize":".85rem","color":"var(--gray-400)"}}>Recent labour history</span>
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
              <span className={`status-badge ${b.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                {b.status === 'Completed' ? '✅ Work Completed' : '⏳ Booking Confirmed'}
              </span>
            </div>
            <div className="bhc-body">
              <div className="bhc-meta-grid">
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val">{b.task || 'Wheat Harvesting'}</div>
                  <div className="bhc-meta-lbl">Task</div>
                </div>
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val">{b.date || 'N/A'}</div>
                  <div className="bhc-meta-lbl">Date</div>
                </div>
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val">{b.hours || 8} hrs · {b.teamSize || b.workersCount || 1} workers</div>
                  <div className="bhc-meta-lbl">Hours Worked</div>
                </div>
                <div className="bhc-meta-item">
                  <div className="bhc-meta-val" style={{ color: "var(--primary)" }}>₹{(b.totalPaid || b.dailyRate || 0).toLocaleString()}</div>
                  <div className="bhc-meta-lbl">Total Paid</div>
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
    </div>{/*  #myBookings  */}

  </div>{/*  #findSection  */}

  {/*  ════════════════════════════════════════════════════════  */}
  {/*  TAB 2: POST AVAILABILITY                                  */}
  {/*  ════════════════════════════════════════════════════════  */}
  <div className="tab-content" id="postSection">

    <div className="post-form-card">
      <div className="post-form-head">
        <h3>📢 Post Your Availability</h3>
        <p>Farmers in your area will see your listing and contact you directly within hours.</p>
      </div>
      <div className="post-form-body">

        {/*  Post Success  */}
        <div className="post-success" id="postSuccess">
          <div className="post-success-icon">📢</div>
          <div style={{"fontSize":"1.4rem","fontWeight":"900","color":"var(--primary)","marginBottom":"8px"}}>Listing Posted!</div>
          <div style={{"color":"var(--gray-600)","fontSize":".95rem","marginBottom":"24px"}}>Your availability is now visible to farmers in your district. You'll receive calls within a few hours.</div>
          <div style={{"background":"#e8f5d6","borderRadius":"12px","padding":"16px 24px","display":"inline-block","marginBottom":"28px"}}>
            <div style={{"fontSize":".82rem","color":"var(--gray-400)","fontWeight":"600","textTransform":"uppercase","letterSpacing":".05em"}}>Listing ID</div>
            <div id="listingId" style={{"fontSize":"1.8rem","fontWeight":"900","color":"var(--primary)","letterSpacing":".1em"}}>—</div>
          </div>
          <div><button className="btn btn-outline" onClick={() => {}}>+ Post Another Listing</button></div>
        </div>

        {/*  Post Form  */}
        <form id="postAvailForm" className="post-form-grid" onSubmit={(e) => e.preventDefault()}>

          <div className="form-group">
            <label className="form-label" htmlFor="postName">Worker / Group Name <span>*</span></label>
            <input type="text" className="form-control" id="postName" placeholder="e.g. Ramesh Kumar or Bajrang Group" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postPhone">Mobile Number <span>*</span></label>
            <input type="tel" className="form-control" id="postPhone" placeholder="10-digit number" maxLength={10} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postDistrict">District <span>*</span></label>
            <select className="form-control" id="postDistrict" required>
              <option defaultValue="" disabled selected>Select district…</option>
              <option>Agra</option><option>Aligarh</option><option>Allahabad</option>
              <option>Bareilly</option><option>Firozabad</option><option>Ghaziabad</option>
              <option>Hapur</option><option>Kanpur</option><option>Lucknow</option>
              <option>Mathura</option><option>Meerut</option><option>Moradabad</option>
              <option>Muzaffarnagar</option><option>Noida</option><option>Saharanpur</option>
              <option>Varanasi</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postRate">Daily Rate (₹ per person) <span>*</span></label>
            <input type="number" className="form-control" id="postRate" placeholder="e.g. 400" min="100" max="2000" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postFromDate">Available From <span>*</span></label>
            <input type="date" className="form-control" id="postFromDate" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postToDate">Available Until <span>*</span></label>
            <input type="date" className="form-control" id="postToDate" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postGroupSize">Group Size (no. of workers) <span>*</span></label>
            <input type="number" className="form-control" id="postGroupSize" placeholder="1–20" min="1" max="20" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postVillage">Village / Area</label>
            <input type="text" className="form-control" id="postVillage" placeholder="Village name (optional)" />
          </div>

          {/*  Task Types checkboxes  */}
          <div className="form-group full">
            <label className="form-label">Task Types <span>*</span></label>
            <div className="checkbox-grid" id="taskCheckboxes">
              <label className="checkbox-option" onClick={() => {}}>
                <input type="checkbox" name="tasks" defaultValue="Weeding" />
                <span className="checkbox-check">✓</span> 🪴 Weeding
              </label>
              <label className="checkbox-option" onClick={() => {}}>
                <input type="checkbox" name="tasks" defaultValue="Harvesting" />
                <span className="checkbox-check">✓</span> 🌾 Harvesting
              </label>
              <label className="checkbox-option" onClick={() => {}}>
                <input type="checkbox" name="tasks" defaultValue="Spraying" />
                <span className="checkbox-check">✓</span> 🧪 Spraying
              </label>
              <label className="checkbox-option" onClick={() => {}}>
                <input type="checkbox" name="tasks" defaultValue="Sowing" />
                <span className="checkbox-check">✓</span> 🌱 Sowing
              </label>
              <label className="checkbox-option" onClick={() => {}}>
                <input type="checkbox" name="tasks" defaultValue="Transplanting" />
                <span className="checkbox-check">✓</span> 🌿 Transplanting
              </label>
              <label className="checkbox-option" onClick={() => {}}>
                <input type="checkbox" name="tasks" defaultValue="Packing" />
                <span className="checkbox-check">✓</span> 📦 Packing
              </label>
            </div>
          </div>

          <div className="form-group full" style={{"marginTop":"8px"}}>
            <button type="submit" className="btn btn-primary btn-lg" id="postAvailability"
              style={{"width":"100%","justifyContent":"center"}}>
              📢 Post My Availability
            </button>
            <p style={{"textAlign":"center","fontSize":".8rem","color":"var(--gray-400)","marginTop":"10px"}}>
              🔒 Your phone number is shared only with verified farmers · Free to post
            </p>
          </div>

        </form>

      </div>{/*  .post-form-body  */}
    </div>{/*  .post-form-card  */}

  </div>{/*  #postSection  */}

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



    </main>
  );
}
