"use client";
import Link from "next/link";
export default function Page() {
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
      <div><div className="stat-label">Available Now</div><div className="stat-value">24</div><div className="stat-sub">Equipment units</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon amber">🏭</div>
      <div><div className="stat-label">CHC Centres</div><div className="stat-value">7</div><div className="stat-sub">In your district</div></div>
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
    <button className="tab-toggle active" id="findTab" onClick={() => {}}>
      🔍 Find Machinery
    </button>
    <button className="tab-toggle" id="postTab" onClick={() => {}}>
      📢 Register Equipment
    </button>
  </div>

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

      <div className="form-group">
        <label className="form-label" htmlFor="durationHours">Hours Needed</label>
        <input type="number" className="form-control" id="durationHours"
          placeholder="Hours needed" min="1" max="24" defaultValue="4" />
      </div>

    </div>{/*  .search-grid  */}

    <div style={{"marginTop":"18px","display":"flex","justifyContent":"flex-end"}}>
      <button className="btn btn-primary btn-lg" id="searchMachinery">
        🔍 Search Available Machinery →
      </button>
    </div>
  </div>{/*  .search-card  */}

  {/*  ── Filter Pills ──────────────────────────────────────────  */}
  <div className="filter-pills-bar">
    <span className="filter-pills-label">Filter:</span>
    <button className="filter-pill active" data-filter="all">All</button>
    <button className="filter-pill" data-filter="available-today">✅ Available Today</button>
    <button className="filter-pill" data-filter="within-10km">📍 Within 10 km</button>
    <button className="filter-pill" data-filter="under-500">💰 Under ₹500/hr</button>
    <button className="filter-pill" data-filter="with-operator">👨‍🌾 With Operator</button>
  </div>

  {/*  ── Results Header ────────────────────────────────────────  */}
  <div className="results-header">
    <div className="results-count">Showing <span id="resultsCount">4</span> results near Meerut, UP</div>
    <select className="sort-select" id="sortSelect">
      <option>Sort: Nearest First</option>
      <option>Sort: Price: Low to High</option>
      <option>Sort: Highest Rated</option>
      <option>Sort: Available Today</option>
    </select>
  </div>

  {/*  ── Machinery Results ─────────────────────────────────────  */}
  <div id="machineryResults">

    {/*  Card 1: Mahindra 575 DI Tractor  */}
    <div className="machine-card"
         data-id="1"
         data-available="true"
         data-km="3.1"
         data-rate="400"
         data-operator="true"
         data-filter-tags="available-today within-10km under-500 with-operator">
      <div className="mc-icon-circle tractor">🚜</div>
      <div className="mc-body">
        <div className="mc-top">
          <div>
            <div className="mc-name">Mahindra 575 DI Tractor</div>
            <div className="mc-provider">👤 <strong>Ramesh Kumar</strong> — CHC Meerut · Modipuram Branch</div>
          </div>
          <span className="mc-badge available">● Available</span>
        </div>
        <div className="mc-pills">
          <span className="mc-pill">📍 3.1 km away</span>
          <span className="mc-pill highlight">₹400/hr</span>
          <span className="mc-pill">⭐ 4.8 (41 reviews)</span>
          <span className="mc-pill">🐎 47 HP</span>
          <span className="mc-pill">📅 2023 model</span>
        </div>
        <span className="mc-operator-tag">👨‍🌾 Includes operator</span>
        <div className="mc-actions">
          <button className="btn-view-slots" onClick={() => {}}>📅 View Slots</button>
          <button className="btn-book-now" onClick={() => {}}>🚜 Book Now</button>
        </div>
      </div>
    </div>

    {/*  Card 2: John Deere Harvester  */}
    <div className="machine-card"
         data-id="2"
         data-available="true"
         data-km="7.4"
         data-rate="1200"
         data-operator="true"
         data-filter-tags="available-today within-10km with-operator">
      <div className="mc-icon-circle harvester">🌾</div>
      <div className="mc-body">
        <div className="mc-top">
          <div>
            <div className="mc-name">John Deere W70 Combine Harvester</div>
            <div className="mc-provider">👤 <strong>Suresh Agro Services</strong> — CHC Sardhana</div>
          </div>
          <span className="mc-badge available">● Available</span>
        </div>
        <div className="mc-pills">
          <span className="mc-pill">📍 7.4 km away</span>
          <span className="mc-pill highlight">₹1,200/hr</span>
          <span className="mc-pill">⭐ 4.6 (19 reviews)</span>
          <span className="mc-pill">🐎 140 HP</span>
          <span className="mc-pill">📅 2024 model</span>
        </div>
        <span className="mc-operator-tag">👨‍🌾 Includes operator</span>
        <div className="mc-actions">
          <button className="btn-view-slots" onClick={() => {}}>📅 View Slots</button>
          <button className="btn-book-now" onClick={() => {}}>🌾 Book Now</button>
        </div>
      </div>
    </div>

    {/*  Card 3: Sonalika Rotavator — Booked  */}
    <div className="machine-card booked-card"
         data-id="3"
         data-available="false"
         data-km="5.8"
         data-rate="350"
         data-operator="false"
         data-filter-tags="within-10km under-500">
      <div className="mc-icon-circle rotavator">🔄</div>
      <div className="mc-body">
        <div className="mc-top">
          <div>
            <div className="mc-name">Sonalika 60 Rotavator (6 ft)</div>
            <div className="mc-provider">👤 <strong>Kisan Seva Kendra</strong> — CHC Ghaziabad North</div>
          </div>
          <span className="mc-badge booked">⏳ Booked Today</span>
        </div>
        <div className="mc-pills">
          <span className="mc-pill">📍 5.8 km away</span>
          <span className="mc-pill">₹350/hr</span>
          <span className="mc-pill">⭐ 4.3 (12 reviews)</span>
          <span className="mc-pill">🐎 60 HP</span>
          <span className="mc-pill" style={{"background":"#fde8e8","borderColor":"#f5c0b0","color":"var(--danger)"}}>Next Free: 11 Jun 8AM</span>
        </div>
        <div className="mc-actions">
          <button className="btn-view-slots" onClick={() => {}}>📅 View Slots</button>
          <button className="btn-book-now" disabled>⏳ Booked Today</button>
        </div>
      </div>
    </div>

    {/*  Card 4: Kirloskar Power Sprayer  */}
    <div className="machine-card"
         data-id="4"
         data-available="true"
         data-km="2.2"
         data-rate="200"
         data-operator="false"
         data-filter-tags="available-today within-10km under-500">
      <div className="mc-icon-circle sprayer">💦</div>
      <div className="mc-body">
        <div className="mc-top">
          <div>
            <div className="mc-name">Kirloskar Power Sprayer (600L Boom)</div>
            <div className="mc-provider">👤 <strong>Vinod Kumar Farms</strong> — CHC Meerut · Pallavpuram</div>
          </div>
          <span className="mc-badge available">● Available</span>
        </div>
        <div className="mc-pills">
          <span className="mc-pill">📍 2.2 km away</span>
          <span className="mc-pill highlight">₹200/hr</span>
          <span className="mc-pill">⭐ 4.9 (57 reviews)</span>
          <span className="mc-pill">🛢️ 600 L tank</span>
          <span className="mc-pill">📅 2025 model</span>
        </div>
        <div className="mc-actions">
          <button className="btn-view-slots" onClick={() => {}}>📅 View Slots</button>
          <button className="btn-book-now" onClick={() => {}}>💦 Book Now</button>
        </div>
      </div>
    </div>

  </div>{/*  #machineryResults  */}

  {/*  ── Booking Section ───────────────────────────────────────  */}
  <div id="bookingSection">

    {/*  Success state (shown after confirm)  */}
    <div id="bookingSuccess">
      <div className="success-checkmark">✅</div>
      <div className="success-title">Booking Confirmed! 🎉</div>
      <div className="success-sub">The provider will call you within 2 hours to confirm details.</div>
      <div className="booking-ref-box">
        <div className="ref-label">Booking Reference</div>
        <div className="ref-number" id="refNumber">—</div>
      </div>
      <div className="booking-details-chips" id="successChips"></div>
      <div style={{"display":"flex","gap":"12px","justifyContent":"center","flexWrap":"wrap"}}>
        <button className="btn btn-outline" onClick={() => {}}>🔄 Book Another Machine</button>
        <a href="/calculator" className="btn btn-primary">🧪 Calculate Input Dose</a>
      </div>
    </div>

    {/*  Booking form state  */}
    <div id="bookingForm">
      {/*  Header  */}
      <div className="bs-header">
        <div className="bs-header-left">
          <div className="bs-machine-icon" id="bsMachineIcon">🚜</div>
          <div>
            <div className="bs-machine-name" id="bsMachineName">Machine Name</div>
            <div className="bs-provider" id="bsProvider">Provider Name</div>
          </div>
        </div>
        <button id="cancelBooking" onClick={() => {}}>✕ Cancel</button>
      </div>

      <div className="bs-body">

        {/*  Time Slot Selector  */}
        <div className="bs-section-label">
          🕐 Select Start Time <span>— for <span id="bsDateDisplay">selected date</span></span>
        </div>
        <div className="time-slots" id="timeSlots">
          <button className="time-slot-btn" data-time="6:00 AM"  onClick={() => {}}>6 AM<small>Morning</small></button>
          <button className="time-slot-btn" data-time="8:00 AM"  onClick={() => {}}>8 AM<small>Morning</small></button>
          <button className="time-slot-btn" data-time="10:00 AM" onClick={() => {}}>10 AM<small>Late Morn</small></button>
          <button className="time-slot-btn slot-booked"          data-time="12:00 PM">12 PM<small>Midday</small></button>
          <button className="time-slot-btn" data-time="2:00 PM"  onClick={() => {}}>2 PM<small>Afternoon</small></button>
          <button className="time-slot-btn" data-time="4:00 PM"  onClick={() => {}}>4 PM<small>Evening</small></button>
        </div>

        {/*  Pricing Display  */}
        <div className="bs-section-label">💰 Cost Summary</div>
        <div className="pricing-display">
          <div className="pd-item">
            <div className="pd-val" id="pdHours">4</div>
            <div className="pd-lbl">Hours</div>
          </div>
          <div className="pd-divider"></div>
          <div className="pd-item">
            <div className="pd-val" id="pdRate">₹400</div>
            <div className="pd-lbl">Per Hour</div>
          </div>
          <div className="pd-divider"></div>
          <div className="pd-item">
            <div className="pd-val">×</div>
            <div className="pd-lbl">&nbsp;</div>
          </div>
          <div className="pd-divider"></div>
          <div className="pd-item pd-total">
            <div className="pd-val" id="pdTotal">₹1,600</div>
            <div className="pd-lbl">Total (incl. GST)</div>
          </div>
        </div>

        {/*  Farmer Details Form  */}
        <div className="bs-section-label">👤 Your Details</div>
        <div className="bs-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="farmerName">Full Name <span>*</span></label>
            <input type="text" className="form-control" id="farmerName" placeholder="e.g. Ramesh Kumar" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="farmerPhone">Mobile Number <span>*</span></label>
            <input type="tel" className="form-control" id="farmerPhone"
              placeholder="10-digit number" maxLength="10" pattern="[0-9]{10}" required />
          </div>
          <div className="form-group full">
            <label className="form-label" htmlFor="farmerInstructions">Special Instructions <span style={{"color":"var(--gray-400)","fontWeight":"400"}}>(optional)</span></label>
            <textarea className="form-control" id="farmerInstructions" rows="3"
              placeholder="e.g. Field is 2.5 acres, access from north side of village road. Need early morning start…"></textarea>
          </div>
        </div>

        {/*  Confirm Button  */}
        <button id="confirmBooking" onClick={() => {}}>
          ✅ Confirm Booking
        </button>

        <p style={{"textAlign":"center","fontSize":".8rem","color":"var(--gray-400)","marginTop":"12px"}}>
          🔒 Payment collected on delivery · No advance required · Free cancellation up to 2 hrs before
        </p>

      </div>{/*  .bs-body  */}
    </div>{/*  #bookingForm  */}

  </div>{/*  #bookingSection  */}

  </div>{/*  #findSection  */}

  {/*  ════════════════════════════════════════════════════════  */}
  {/*  TAB 2: REGISTER EQUIPMENT                                  */}
  {/*  ════════════════════════════════════════════════════════  */}
  <div className="tab-content" id="postSection">

    <div className="post-form-card">
      <div className="post-form-head">
        <h3>📢 Register Your Equipment</h3>
        <p>List your tractor, harvester, or other machinery to get booking requests from nearby farmers.</p>
      </div>
      <div className="post-form-body">

        {/*  Post Success  */}
        <div className="post-success" id="postSuccess">
          <div className="post-success-icon">🚜</div>
          <div style={{"fontSize":"1.4rem","fontWeight":"900","color":"var(--primary)","marginBottom":"8px"}}>Equipment Registered!</div>
          <div style={{"color":"var(--gray-600)","fontSize":".95rem","marginBottom":"24px"}}>Your machinery is now listed and visible to farmers in your district. You'll receive calls for bookings.</div>
          <div style={{"background":"#e8f5d6","borderRadius":"12px","padding":"16px 24px","display":"inline-block","marginBottom":"28px"}}>
            <div style={{"fontSize":".82rem","color":"var(--gray-400)","fontWeight":"600","textTransform":"uppercase","letterSpacing":".05em"}}>Machine Listing ID</div>
            <div id="listingId" style={{"fontSize":"1.8rem","fontWeight":"900","color":"var(--primary)","letterSpacing":".1em"}}>—</div>
          </div>
          <div><button className="btn btn-outline" onClick={() => {}}>+ Register Another Machine</button></div>
        </div>

        {/*  Post Form  */}
        <form id="postEquipmentForm" className="post-form-grid" onSubmit={(e) => e.preventDefault()}>

          <div className="form-group">
            <label className="form-label" htmlFor="postMachineName">Machine Model Name <span>*</span></label>
            <input type="text" className="form-control" id="postMachineName" placeholder="e.g. Mahindra 575 DI Tractor" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postMachineType">Machine Type <span>*</span></label>
            <select className="form-control" id="postMachineType" required>
              <option defaultValue="" disabled selected>Select type…</option>
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
            <label className="form-label" htmlFor="postOwnerName">Owner / Provider Name <span>*</span></label>
            <input type="text" className="form-control" id="postOwnerName" placeholder="e.g. Ramesh Kumar" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postPhone">Mobile Number <span>*</span></label>
            <input type="tel" className="form-control" id="postPhone" placeholder="10-digit number" maxLength="10" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postState">State <span>*</span></label>
            <select className="form-control" id="postState" required>
              <option defaultValue="" disabled selected>Select state…</option>
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
            <label className="form-label" htmlFor="postDistrict">District <span>*</span></label>
            <input type="text" className="form-control" id="postDistrict" placeholder="e.g. Meerut, Hapur…" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postHourlyRate">Hourly Rate (₹ per hour) <span>*</span></label>
            <input type="number" className="form-control" id="postHourlyRate" placeholder="e.g. 400" min="50" max="5000" required />
          </div>
          <div className="form-group" style={{"display":"flex","alignItems":"center","height":"100%","paddingTop":"28px"}}>
            <label className="checkbox-option" id="operatorLabel" onClick={() => {}} style={{"width":"100%"}}>
              <input type="checkbox" id="postOperator" name="operator" defaultValue="true" />
              <span className="checkbox-check">✓</span> 👨‍🌾 Includes Operator
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postSpecs">Specifications (optional)</label>
            <input type="text" className="form-control" id="postSpecs" placeholder="e.g. 50 HP, 2022 Model, etc." />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postVillage">Village / Area</label>
            <input type="text" className="form-control" id="postVillage" placeholder="Village name (optional)" />
          </div>

          <div className="form-group full" style={{"marginTop":"12px"}}>
            <button type="submit" className="btn btn-primary btn-lg" id="postEquipment" style={{"width":"100%","justifyContent":"center"}}>
              📢 Register My Equipment
            </button>
            <p style={{"textAlign":"center","fontSize":".8rem","color":"var(--gray-400)","marginTop":"10px"}}>
              🔒 Your details are shared only with farmers requesting booking · Free to list
            </p>
          </div>

        </form>

      </div>{/*  .post-form-body  */}
    </div>{/*  .post-form-card  */}

  </div>{/*  #postSection  */}

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



    </main>
  );
}
