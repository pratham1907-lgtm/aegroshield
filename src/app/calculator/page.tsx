"use client";
import Link from "next/link";
export default function Page() {
  return (
    <main>
{/*  ── Navbar ────────────────────────────────────────────────  */}
  
  

{/*  ── Page Hero ─────────────────────────────────────────────  */}
<div className="page-hero">
  <div className="container">
    <div className="page-hero-badge">🧮 Smart Calculator</div>
    <h1>Smart Input Calculator</h1>
    <p>Calculate exact pesticide and fertilizer doses for your field — no waste, no under-dosing</p>
  </div>

  <div className="hero-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
    </svg>
  </div>
</div>
{/*  ── Main ──────────────────────────────────────────────────  */}
<main className="calc-layout">

  {/*  Stats Strip  */}
  <div className="stats-strip">
    <div className="stat-card">
      <div className="stat-icon green">💰</div>
      <div><div className="stat-label">Avg. Input Saving</div><div className="stat-value">28%</div><div className="stat-sub">vs. thumb-rule</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon amber">⚗️</div>
      <div><div className="stat-label">Products in DB</div><div className="stat-value">1,200+</div><div className="stat-sub">Registered in India</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon blue">🌱</div>
      <div><div className="stat-label">Crops Covered</div><div className="stat-value">60+</div><div className="stat-sub">Varieties</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon green">✅</div>
      <div><div className="stat-label">ICAR Verified</div><div className="stat-value">100%</div><div className="stat-sub">All recommendations</div></div>
    </div>
  </div>

  {/*  ── Main Tab Buttons ──────────────────────────────────────  */}
  <div className="main-tab-bar">
    <button className="main-tab-btn active" id="pesticideTab" onClick={() => {}}>
      <span className="tab-icon">🧪</span>
      Pesticide Dosage
    </button>
    <button className="main-tab-btn" id="fertilizerTab" onClick={() => {}}>
      <span className="tab-icon">🌱</span>
      Fertilizer Dose
    </button>
  </div>

  {/*  ════════════════════════════════════════════════════════  */}
  {/*  TAB 1: PESTICIDE                                          */}
  {/*  ════════════════════════════════════════════════════════  */}
  <div className="tab-panel active" id="pesticideSection">
    <div className="calc-two-col">

      {/*  LEFT: Form  */}
      <div style={{"display":"flex","flexDirection":"column","gap":"18px"}}>
        <div className="form-card">
          <div className="form-card-head">
            <div className="form-card-head-icon">🧪</div>
            <div>
              <h3>Pesticide Dosage Calculator</h3>
              <p>Select crop, disease, and product for exact spray dose</p>
            </div>
          </div>
          <div className="form-card-body">
            <div className="form-stack">

              <div className="form-group">
                <label className="form-label" htmlFor="pesticideCrop">Crop <span>*</span></label>
                <select className="form-control" id="pesticideCrop" onChange={() => {}} required>
                  <option defaultValue="" disabled selected>Select crop…</option>
                  <option defaultValue="Wheat">🌾 Wheat (गेहूँ)</option>
                  <option defaultValue="Rice">🌾 Rice (चावल)</option>
                  <option defaultValue="Tomato">🍅 Tomato (टमाटर)</option>
                  <option defaultValue="Cotton">🌿 Cotton (कपास)</option>
                  <option defaultValue="Maize">🌽 Maize (मक्का)</option>
                  <option defaultValue="Potato">🥔 Potato (आलू)</option>
                  <option defaultValue="Mustard">🌻 Mustard (सरसों)</option>
                  <option defaultValue="Soybean">🫘 Soybean (सोयाबीन)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pesticideDisease">Disease / Pest <span>*</span></label>
                <select className="form-control" id="pesticideDisease" onChange={() => {}} disabled required>
                  <option defaultValue="" disabled selected>— Select crop first —</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pesticideProduct">Pesticide Product <span>*</span></label>
                <select className="form-control" id="pesticideProduct" disabled required>
                  <option defaultValue="" disabled selected>— Select disease first —</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fieldAreaPest">Field Area <span>*</span></label>
                <div className="input-unit-row">
                  <input type="number" className="form-control" id="fieldAreaPest"
                    placeholder="e.g. 2.5" min="0.1" max="1000" step="0.1" required />
                  <select className="form-control unit-select" id="fieldUnitPest">
                    <option defaultValue="Acres">Acres</option>
                    <option defaultValue="Bigha">Bigha</option>
                    <option defaultValue="Hectare">Hectare</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tankCapacity">Spray Tank Size (litres) <span>*</span></label>
                <select className="form-control" id="tankCapacity">
                  <option defaultValue="8">8 Litre (Knapsack small)</option>
                  <option defaultValue="16" selected>16 Litre (Standard knapsack)</option>
                  <option defaultValue="20">20 Litre (Large knapsack)</option>
                  <option defaultValue="100">100 Litre (Power sprayer)</option>
                  <option defaultValue="200">200 Litre (Boom sprayer/tank)</option>
                  <option defaultValue="600">600 Litre (Tractor boom)</option>
                </select>
              </div>

              <button className="calc-btn" id="calcPesticide" onClick={() => {}}>
                🧮 Calculate Dose →
              </button>

            </div>
          </div>
        </div>

        {/*  Safety tip always visible  */}
        <div className="tip-box-amber">
          <span style={{"fontSize":"1.3rem","flexShrink":"0"}}>⚠️</span>
          <div>
            <strong style={{"color":"#5a3808","fontWeight":"800"}}>Safety First</strong>
            Always wear gloves, mask and eye protection when handling pesticides.
            Follow label instructions. Never spray in strong wind or midday heat.
            Dispose of empty containers safely — do NOT burn them.
          </div>
        </div>
      </div>

      {/*  RIGHT: Result + Reference  */}
      <div style={{"display":"flex","flexDirection":"column","gap":"18px"}}>

        {/*  PESTICIDE RESULT (hidden until calculated)  */}
        <div id="pesticideResult">

          {/*  Main result card  */}
          <div className="result-card">
            <div className="rc-product">Recommended Product</div>
            <div className="rc-name" id="pestProductName">—</div>
            <div className="rc-stats">
              <div className="rc-stat">
                <div className="rc-stat-val" id="pestDosePerTank">—</div>
                <div className="rc-stat-lbl">Per Tank (<span id="tankSizeLabel">16</span>L)</div>
              </div>
              <div className="rc-stat">
                <div className="rc-stat-val" id="pestTanksNeeded">—</div>
                <div className="rc-stat-lbl">Tanks for Your Field</div>
              </div>
              <div className="rc-stat">
                <div className="rc-stat-val" id="pestTotalAmount">—</div>
                <div className="rc-stat-lbl">Total Product</div>
              </div>
            </div>
            <div style={{"background":"rgba(255,255,255,.12)","borderRadius":"10px","padding":"12px 16px","fontSize":".84rem","opacity":".9"}}>
              <strong style={{"display":"block","marginBottom":"4px"}}>💧 Water Required</strong>
              <span id="pestWaterTotal">—</span> total · <span id="pestWaterPerTank">—</span> per tank fill
            </div>
          </div>

          {/*  Warning box  */}
          <div className="warn-box">
            <span className="warn-icon">⚠️</span>
            <div>
              <strong>Safety Warning</strong>
              Wear gloves and mask while spraying. Spray in early morning or evening only. Keep children and animals away from the field for 24 hours after spraying.
            </div>
          </div>

          {/*  Spray timing  */}
          <div className="timing-card">
            <div className="timing-icon">🕐</div>
            <div>
              <div className="timing-label">Best Time to Spray</div>
              <div className="timing-value" id="sprayTiming">6AM–8AM or 5PM–7PM</div>
            </div>
          </div>

          {/*  Dilution instruction  */}
          <div className="timing-card">
            <div className="timing-icon">🔬</div>
            <div>
              <div className="timing-label">Dilution Instruction</div>
              <div className="timing-value" id="dilutionNote">—</div>
            </div>
          </div>

          {/*  Save button  */}
          <button className="save-result-btn" id="savePest" onClick={() => {}}>
            💾 Save This Result
          </button>

        </div>{/*  #pesticideResult  */}

        {/*  Reference Table (always visible on right)  */}
        <div className="ref-panel">
          <div className="ref-card">
            <div className="ref-card-head">🧪 Common Pesticides — Quick Reference</div>
            <table className="ag-table" style={{"fontSize":".83rem"}}>
              <thead>
                <tr><th>Product</th><th>Dose/16L Tank</th><th>Target</th></tr>
              </thead>
              <tbody>
                <tr><td>Propiconazole 25EC</td><td>15 ml</td><td>Yellow Rust</td></tr>
                <tr><td>Mancozeb 75WP</td><td>25 g</td><td>Blight, Rust</td></tr>
                <tr><td>Imidacloprid 17.8SL</td><td>6 ml</td><td>Aphids, BPH</td></tr>
                <tr><td>Chlorpyrifos 20EC</td><td>40 ml</td><td>Stem borer</td></tr>
                <tr><td>Tebuconazole 250EW</td><td>12 ml</td><td>Rusts, Smut</td></tr>
                <tr><td>Thiamethoxam 25WG</td><td>4 g</td><td>Whitefly</td></tr>
              </tbody>
            </table>
          </div>

          <div className="ref-card">
            <div className="ref-card-head">📐 Area Quick Converter</div>
            <table className="ag-table" style={{"fontSize":".83rem"}}>
              <thead>
                <tr><th>Acres</th><th>Bigha</th><th>Hectare</th></tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>1.62</td><td>0.405</td></tr>
                <tr><td>2</td><td>3.24</td><td>0.810</td></tr>
                <tr><td>5</td><td>8.09</td><td>2.024</td></tr>
                <tr><td>10</td><td>16.19</td><td>4.047</td></tr>
              </tbody>
            </table>
            <div style={{"padding":"10px 16px","fontSize":".76rem","color":"var(--gray-400)"}}>* 1 Bigha ≈ 0.619 Acres (standard UP/Bihar)</div>
          </div>
        </div>

      </div>
    </div>
  </div>{/*  #pesticideSection  */}

  {/*  ════════════════════════════════════════════════════════  */}
  {/*  TAB 2: FERTILIZER                                         */}
  {/*  ════════════════════════════════════════════════════════  */}
  <div className="tab-panel" id="fertilizerSection">
    <div className="calc-two-col">

      {/*  LEFT: Form  */}
      <div style={{"display":"flex","flexDirection":"column","gap":"18px"}}>
        <div className="form-card">
          <div className="form-card-head">
            <div className="form-card-head-icon">🌱</div>
            <div>
              <h3>Fertilizer Dose Calculator</h3>
              <p>NPK recommendations based on crop stage and soil type</p>
            </div>
          </div>
          <div className="form-card-body">
            <div className="form-stack">

              <div className="form-group">
                <label className="form-label" htmlFor="fertilizerCrop">Crop <span>*</span></label>
                <select className="form-control" id="fertilizerCrop" required>
                  <option defaultValue="" disabled selected>Select crop…</option>
                  <option defaultValue="Wheat">🌾 Wheat (गेहूँ)</option>
                  <option defaultValue="Rice">🌾 Rice (चावल)</option>
                  <option defaultValue="Tomato">🍅 Tomato (टमाटर)</option>
                  <option defaultValue="Cotton">🌿 Cotton (कपास)</option>
                  <option defaultValue="Maize">🌽 Maize (मक्का)</option>
                  <option defaultValue="Potato">🥔 Potato (आलू)</option>
                  <option defaultValue="Mustard">🌻 Mustard (सरसों)</option>
                  <option defaultValue="Soybean">🫘 Soybean (सोयाबीन)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fertilizerStage">Application Stage <span>*</span></label>
                <select className="form-control" id="fertilizerStage" required>
                  <option defaultValue="basal">🌱 Basal Dose (at sowing)</option>
                  <option defaultValue="top1">🌿 Top Dressing 1 (21–30 days)</option>
                  <option defaultValue="top2">🌾 Top Dressing 2 (45–60 days)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fieldAreaFert">Field Area <span>*</span></label>
                <div className="input-unit-row">
                  <input type="number" className="form-control" id="fieldAreaFert"
                    placeholder="e.g. 2.5" min="0.1" max="1000" step="0.1" required />
                  <select className="form-control unit-select" id="fieldUnitFert">
                    <option defaultValue="Acres">Acres</option>
                    <option defaultValue="Bigha">Bigha</option>
                    <option defaultValue="Hectare">Hectare</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="soilTypeFert">Soil Type</label>
                <select className="form-control" id="soilTypeFert">
                  <option defaultValue="Loamy">🌱 Loamy (दोमट) — most common</option>
                  <option defaultValue="Sandy">🏜️ Sandy (बलुई) — needs more N</option>
                  <option defaultValue="Clay">🏺 Clay (चिकनी) — hold nutrients longer</option>
                  <option defaultValue="Black Cotton">🖤 Black Cotton (काली मिट्टी)</option>
                </select>
              </div>

              <button className="calc-btn" id="calcFertilizer" onClick={() => {}}>
                🌱 Calculate Fertilizer Dose →
              </button>

            </div>
          </div>
        </div>

        <div className="tip-box-amber">
          <span style={{"fontSize":"1.3rem","flexShrink":"0"}}>💡</span>
          <div>
            <strong style={{"color":"#5a3808","fontWeight":"800"}}>Pro Tip</strong>
            Apply basal dose before or at sowing. Always split nitrogen application — give only 1/3 at sowing,
            rest in top dressings. Over-dosing nitrogen causes lodging and reduces grain quality.
          </div>
        </div>
      </div>

      {/*  RIGHT: Result + Reference  */}
      <div style={{"display":"flex","flexDirection":"column","gap":"18px"}}>

        {/*  FERTILIZER RESULT  */}
        <div id="fertilizerResult">

          <div className="fert-result-card">
            <div className="fert-head" id="fertHeadline">Fertilizer Dose — Wheat · Basal · 2.5 Acres</div>
            <div className="fert-nutrients">

              <div className="fert-row">
                <div className="fert-row-left">
                  <span className="fert-row-icon">🟡</span>
                  <div>
                    <div className="fert-row-name">Urea (46% N)</div>
                    <div className="fert-row-sub">Nitrogen source</div>
                  </div>
                </div>
                <div className="fert-row-val" id="ureaAmount">—<small>kg</small></div>
              </div>

              <div className="fert-row">
                <div className="fert-row-left">
                  <span className="fert-row-icon">🔵</span>
                  <div>
                    <div className="fert-row-name">DAP (18%N + 46%P₂O₅)</div>
                    <div className="fert-row-sub">Phosphorus source</div>
                  </div>
                </div>
                <div className="fert-row-val" id="dapAmount">—<small>kg</small></div>
              </div>

              <div className="fert-row">
                <div className="fert-row-left">
                  <span className="fert-row-icon">🔴</span>
                  <div>
                    <div className="fert-row-name">MOP — Muriate of Potash (60%K₂O)</div>
                    <div className="fert-row-sub">Potassium source</div>
                  </div>
                </div>
                <div className="fert-row-val" id="mopAmount">—<small>kg</small></div>
              </div>

            </div>

            <div className="apply-tip" id="fertApplyTip">
              <strong>📋 Application Method</strong>
              <span id="fertApplyText">—</span>
            </div>

            <div className="cost-row">
              <div className="cost-label">💰 Estimated Total Cost</div>
              <div className="cost-value" id="fertCostEstimate">—</div>
            </div>
          </div>

          {/*  Save button  */}
          <button className="save-result-btn" id="saveFert" onClick={() => {}}>
            💾 Save This Result
          </button>

        </div>{/*  #fertilizerResult  */}

        {/*  Reference Panel for Fertilizer tab  */}
        <div className="ref-panel">
          <div className="ref-card">
            <div className="ref-card-head">🌿 NPK Requirements (kg/acre) — Full Season</div>
            <table className="ag-table" style={{"fontSize":".83rem"}}>
              <thead>
                <tr><th>Crop</th><th>N</th><th>P₂O₅</th><th>K₂O</th></tr>
              </thead>
              <tbody>
                <tr><td>🌾 Wheat</td><td>60</td><td>30</td><td>20</td></tr>
                <tr><td>🌾 Rice</td><td>80</td><td>40</td><td>40</td></tr>
                <tr><td>🍅 Tomato</td><td>100</td><td>60</td><td>60</td></tr>
                <tr><td>🌿 Cotton</td><td>80</td><td>40</td><td>40</td></tr>
                <tr><td>🌽 Maize</td><td>80</td><td>40</td><td>40</td></tr>
                <tr><td>🥔 Potato</td><td>120</td><td>60</td><td>80</td></tr>
                <tr><td>🌻 Mustard</td><td>60</td><td>30</td><td>20</td></tr>
                <tr><td>🫘 Soybean</td><td>20</td><td>40</td><td>20</td></tr>
              </tbody>
            </table>
          </div>
          <div className="ref-card">
            <div className="ref-card-head">💰 Fertilizer Prices (Approx. 2026)</div>
            <table className="ag-table" style={{"fontSize":".83rem"}}>
              <thead>
                <tr><th>Product</th><th>Price/50kg bag</th></tr>
              </thead>
              <tbody>
                <tr><td>Urea</td><td>₹266 (subsidised)</td></tr>
                <tr><td>DAP</td><td>₹1,350 (subsidised)</td></tr>
                <tr><td>MOP / SOP</td><td>₹1,700</td></tr>
                <tr><td>NPK 10-26-26</td><td>₹1,600</td></tr>
                <tr><td>SSP (16%P)</td><td>₹450</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>{/*  #fertilizerSection  */}

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
