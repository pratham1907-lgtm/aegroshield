"use client";
import Link from "next/link";
export default function Page() {
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
  <div className="grid-4" style={{"marginBottom":"28px"}}>
    <div className="stat-card">
      <div className="stat-icon green">👷</div>
      <div><div className="stat-label">Workers Available</div><div className="stat-value">186</div><div className="stat-sub">In your area</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon amber">📋</div>
      <div><div className="stat-label">Active Requests</div><div className="stat-value">42</div><div className="stat-sub">Posted today</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon blue">💰</div>
      <div><div className="stat-label">Avg. Daily Wage</div><div className="stat-value">₹420</div><div className="stat-sub">Meerut district</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon green">⚡</div>
      <div><div className="stat-label">Response Time</div><div className="stat-value">&lt; 2 hrs</div><div className="stat-sub">Workers reply fast</div></div>
    </div>
  </div>

  {/*  ── Tab Toggle ───────────────────────────────────────────  */}
  <div className="tab-bar">
    <button className="tab-toggle active" id="findTab" onClick={() => {}}>
      🔍 Find Labour
    </button>
    <button className="tab-toggle" id="postTab" onClick={() => {}}>
      📢 Post Availability
    </button>
  </div>

  {/*  ════════════════════════════════════════════════════════  */}
  {/*  TAB 1: FIND LABOUR                                        */}
  {/*  ════════════════════════════════════════════════════════  */}
  <div className="tab-content active" id="findSection">

    {/*  Search Filters  */}
    <div className="search-card">
      <h3>🔍 Find Available Workers</h3>
      <div className="search-row">
        <div className="form-group">
          <label className="form-label" htmlFor="labourDistrict">District</label>
          <input type="text" className="form-control" id="labourDistrict" placeholder="e.g. Meerut, Hapur…" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="taskType">Task Type</label>
          <select className="form-control" id="taskType">
            <option defaultValue="">All Tasks</option>
            <option>Weeding</option>
            <option>Harvesting</option>
            <option>Spraying</option>
            <option>Sowing</option>
            <option>Transplanting</option>
            <option>Packing</option>
            <option>Land Preparation</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="labourDate">Date Needed</label>
          <input type="date" className="form-control" id="labourDate" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="workersNeeded">Workers Needed</label>
          <input type="number" className="form-control" id="workersNeeded"
            placeholder="How many workers?" min="1" max="100" />
        </div>
        <div style={{"display":"flex","alignItems":"flex-end"}}>
          <button className="btn btn-primary" id="searchLabour" style={{"whiteSpace":"nowrap","width":"100%"}}
            onClick={() => {}}>
            Find Available Workers
          </button>
        </div>
      </div>
    </div>

    {/*  Results header  */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"16px","flexWrap":"wrap","gap":"10px"}}>
      <div style={{"fontWeight":"800","fontSize":"1rem","color":"var(--gray-800)"}}>
        Showing <span style={{"color":"var(--primary)"}} id="labourCount">4</span> groups & workers near you
      </div>
      <select className="sort-select" style={{"padding":"7px 12px","borderRadius":"8px","border":"1.5px solid var(--gray-200)","fontSize":".86rem","background":"var(--white)","cursor":"pointer"}}>
        <option>Sort: Nearest First</option>
        <option>Sort: Price: Low to High</option>
        <option>Sort: Highest Rated</option>
        <option>Sort: Group Size: Largest</option>
      </select>
    </div>

    {/*  Labour Results  */}
    <div id="labourResults">

      {/*  Card 1: Ramswaroop Group  */}
      <div className="labour-card" data-id="1">
        <div className="lc-avatar">RK</div>
        <div className="lc-body">
          <div className="lc-top">
            <div>
              <div className="lc-name">Ramswaroop Group</div>
              <div className="lc-location">📍 Muzaffarnagar, Uttar Pradesh</div>
            </div>
            <span className="lc-avail available">● Available 12–18 Jun</span>
          </div>
          <div className="lc-skills">
            <span className="skill-pill">🌾 Harvesting</span>
            <span className="skill-pill">🪴 Weeding</span>
          </div>
          <div className="lc-info">
            <div className="lc-info-item">👥 Group of <span className="li-val">8</span></div>
            <div className="lc-info-item">💰 <span className="li-val">₹380</span>/day per person</div>
            <div className="lc-info-item">⭐ <span className="li-val">4.8</span> (34 jobs done)</div>
            <div className="lc-info-item">📍 <span className="li-val">22 km</span> away</div>
          </div>
          <div className="lc-actions">
            <button className="btn-send-request" id="sendRequest-1" onClick={() => {}}>📩 Send Request</button>
            <button className="btn-call">📞 Call</button>
          </div>
        </div>
      </div>

      {/*  Card 2: Sita Devi & Team  */}
      <div className="labour-card" data-id="2">
        <div className="lc-avatar" style={{"background":"linear-gradient(135deg,#BA7517,#e09020)"}}>SD</div>
        <div className="lc-body">
          <div className="lc-top">
            <div>
              <div className="lc-name">Sita Devi & Team</div>
              <div className="lc-location">📍 Meerut, Uttar Pradesh</div>
            </div>
            <span className="lc-avail available">● Available 10–20 Jun</span>
          </div>
          <div className="lc-skills">
            <span className="skill-pill">🌱 Transplanting</span>
            <span className="skill-pill">📦 Packing</span>
          </div>
          <div className="lc-info">
            <div className="lc-info-item">👥 Group of <span className="li-val">5</span> <span style={{"fontSize":".76rem","color":"var(--gray-400)"}}>(women workers)</span></div>
            <div className="lc-info-item">💰 <span className="li-val">₹320</span>/day per person</div>
            <div className="lc-info-item">⭐ <span className="li-val">4.5</span> (21 jobs done)</div>
            <div className="lc-info-item">📍 <span className="li-val">6.4 km</span> away</div>
          </div>
          <div className="lc-actions">
            <button className="btn-send-request" id="sendRequest-2" onClick={() => {}}>📩 Send Request</button>
            <button className="btn-call">📞 Call</button>
          </div>
        </div>
      </div>

      {/*  Card 3: Bajrang Labour Group  */}
      <div className="labour-card" data-id="3">
        <div className="lc-avatar" style={{"background":"linear-gradient(135deg,#993C1D,#c04d28)"}}>BL</div>
        <div className="lc-body">
          <div className="lc-top">
            <div>
              <div className="lc-name">Bajrang Labour Group</div>
              <div className="lc-location">📍 Hapur, Uttar Pradesh</div>
            </div>
            <span className="lc-avail available">● Available 8–25 Jun</span>
          </div>
          <div className="lc-skills">
            <span className="skill-pill all-tasks">⚡ All Tasks</span>
            <span className="skill-pill">🌾 Harvesting</span>
            <span className="skill-pill">🌱 Sowing</span>
            <span className="skill-pill">🪴 Weeding</span>
          </div>
          <div className="lc-info">
            <div className="lc-info-item">👥 Group of <span className="li-val">12</span></div>
            <div className="lc-info-item">💰 <span className="li-val">₹420</span>/day per person</div>
            <div className="lc-info-item">⭐ <span className="li-val">4.7</span> (58 jobs done)</div>
            <div className="lc-info-item">📍 <span className="li-val">18.2 km</span> away</div>
          </div>
          <div className="lc-actions">
            <button className="btn-send-request" id="sendRequest-3" onClick={() => {}}>📩 Send Request</button>
            <button className="btn-call">📞 Call</button>
          </div>
        </div>
      </div>

      {/*  Card 4: Mohan Kumar  */}
      <div className="labour-card" data-id="4">
        <div className="lc-avatar" style={{"background":"linear-gradient(135deg,#0066cc,#3399ff)"}}>MK</div>
        <div className="lc-body">
          <div className="lc-top">
            <div>
              <div className="lc-name">Mohan Kumar</div>
              <div className="lc-location">📍 Ghaziabad, Uttar Pradesh</div>
            </div>
            <span className="lc-avail booked">⏳ Booked till 13 Jun</span>
          </div>
          <div className="lc-skills">
            <span className="skill-pill">🧪 Spraying</span>
            <span style={{"fontSize":".77rem","color":"var(--gray-400)","alignSelf":"center","marginLeft":"4px"}}>Specialist only</span>
          </div>
          <div className="lc-info">
            <div className="lc-info-item">👤 <span className="li-val">1</span> skilled operator</div>
            <div className="lc-info-item">💰 <span className="li-val">₹600</span>/day</div>
            <div className="lc-info-item">⭐ <span className="li-val">4.9</span> (72 jobs done)</div>
            <div className="lc-info-item">📍 <span className="li-val">31 km</span> away</div>
          </div>
          <div className="lc-actions">
            <button className="btn-send-request" id="sendRequest-4" onClick={() => {}}>📩 Send Request</button>
            <button className="btn-call">📞 Call</button>
          </div>
        </div>
      </div>

    </div>{/*  #labourResults  */}

    {/*  ════════════════════════════════════════════════════  */}
    {/*  MY BOOKINGS                                           */}
    {/*  ════════════════════════════════════════════════════  */}
    <div id="myBookings" className="my-bookings-section">
      <div className="section-header">
        <h2>📁 My Bookings</h2>
        <span style={{"fontSize":".85rem","color":"var(--gray-400)"}}>Recent labour history</span>
      </div>

      {/*  Booking History Card  */}
      <div className="booking-history-card">
        <div className="bhc-header">
          <div className="bhc-worker">
            <div style={{"width":"36px","height":"36px","borderRadius":"10px","background":"linear-gradient(135deg,var(--primary),var(--mid))","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"900","fontSize":".85rem"}}>RK</div>
            Ramswaroop Group
          </div>
          <span className="status-badge status-completed">✅ Work Completed</span>
        </div>
        <div className="bhc-body">
          <div className="bhc-meta-grid">
            <div className="bhc-meta-item">
              <div className="bhc-meta-val">Wheat Harvesting</div>
              <div className="bhc-meta-lbl">Task</div>
            </div>
            <div className="bhc-meta-item">
              <div className="bhc-meta-val">5 June 2024</div>
              <div className="bhc-meta-lbl">Date</div>
            </div>
            <div className="bhc-meta-item">
              <div className="bhc-meta-val">7 hrs · 8 workers</div>
              <div className="bhc-meta-lbl">Hours Worked</div>
            </div>
            <div className="bhc-meta-item">
              <div className="bhc-meta-val" style={{"color":"var(--primary)"}}>₹3,040</div>
              <div className="bhc-meta-lbl">Total Paid</div>
            </div>
          </div>

          {/*  Rating Form  */}
          <div className="rating-form" id="ratingForm">
            <div className="rating-label">⭐ Rate this team</div>
            <div className="stars-row" id="starsRow">
              <button className="star-btn" data-val="1" onClick={() => {}}>★</button>
              <button className="star-btn" data-val="2" onClick={() => {}}>★</button>
              <button className="star-btn" data-val="3" onClick={() => {}}>★</button>
              <button className="star-btn" data-val="4" onClick={() => {}}>★</button>
              <button className="star-btn" data-val="5" onClick={() => {}}>★</button>
            </div>
            <div className="rating-meta-row">
              <div className="form-group" style={{"margin":"0"}}>
                <label className="form-label" htmlFor="attendanceCount">Workers who showed up</label>
                <input type="number" className="form-control" id="attendanceCount"
                  placeholder="e.g. 8" min="0" max="50" defaultValue="8" />
              </div>
              <div className="form-group" style={{"margin":"0"}}>
                <label className="form-label" htmlFor="feedbackText">Work quality feedback</label>
                <input type="text" className="form-control" id="feedbackText"
                  placeholder="How was the work quality?" />
              </div>
            </div>
            <button className="btn btn-primary" id="saveRating"
              style={{"marginTop":"14px"}} onClick={() => {}}>
              💾 Save Rating & Attendance
            </button>
            <div className="rating-success" id="ratingSuccess">
              ✅ Thank you! Rating saved. Farmers like you help build trust in the community.
            </div>
          </div>

        </div>
      </div>{/*  .booking-history-card  */}
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
            <input type="tel" className="form-control" id="postPhone" placeholder="10-digit number" maxLength="10" required />
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
