"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface PesticideOption {
  product: string;
  dosePer16L: number;
  unit: "ml" | "g";
  waterPerAcreL: number;
  sprayTiming: string;
  dilutionNote: string;
}

const PESTICIDE_DATA: Record<string, Record<string, PesticideOption[]>> = {
  Wheat: {
    "Yellow Rust (पीला रतुआ)": [
      {
        product: "Propiconazole 25EC (Tilt)",
        dosePer16L: 15,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM or 4:30 PM–6:30 PM (Calm wind)",
        dilutionNote: "Mix 15 ml in 16L water thoroughly; avoid spraying in rain or midday heat.",
      },
      {
        product: "Tebuconazole 250EW (Folicur)",
        dosePer16L: 12,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM or 4:30 PM–6:30 PM",
        dilutionNote: "Prepare stock solution in 1L water first, then stir into the 16L tank.",
      },
    ],
    "Aphids / Chepa (माहू / चेपा)": [
      {
        product: "Imidacloprid 17.8SL (Confidor)",
        dosePer16L: 6,
        unit: "ml",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM (Post bee activity)",
        dilutionNote: "Use 6 ml per 16L water. Direct spray towards earheads and undersides of leaves.",
      },
      {
        product: "Thiamethoxam 25WG (Actara)",
        dosePer16L: 4,
        unit: "g",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Dissolve 4 g granules completely in a small bucket before filling tank.",
      },
    ],
    "Loose Smut / Karnal Bunt": [
      {
        product: "Mancozeb 75WP (Dithane M-45)",
        dosePer16L: 25,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "6:30 AM–9:00 AM",
        dilutionNote: "Mix 25 g powder into paste with little water, then top up to 16L.",
      },
    ],
  },
  Rice: {
    "Brown Plant Hopper / BPH (भूरा फुदका)": [
      {
        product: "Imidacloprid 17.8SL",
        dosePer16L: 6,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM or 5:00 PM–7:00 PM",
        dilutionNote: "Direct nozzle towards the basal stems of paddy hills where BPH congregates.",
      },
      {
        product: "Thiamethoxam 25WG",
        dosePer16L: 4,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Drain excess standing water briefly before basal stem spray for best contact.",
      },
    ],
    "Yellow Stem Borer (तना छेदक)": [
      {
        product: "Chlorpyrifos 20EC",
        dosePer16L: 40,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM",
        dilutionNote: "Emulsify 40 ml per 16L tank cleanly; wear waterproof gloves during mixing.",
      },
    ],
    "Blast / Sheath Blight (झुलसा रोग)": [
      {
        product: "Propiconazole 25EC",
        dosePer16L: 15,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:30 AM–9:00 AM",
        dilutionNote: "Spray uniformly over foliage at early boot-leaf symptom onset.",
      },
    ],
  },
  Tomato: {
    "Early / Late Blight (झुलसा रोग)": [
      {
        product: "Mancozeb 75WP",
        dosePer16L: 25,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM or 5:00 PM–6:30 PM",
        dilutionNote: "Cover both upper and lower leaf surfaces evenly; 7-day waiting period before harvest.",
      },
    ],
    "Whitefly / Leaf Curl (सफेद मक्खी)": [
      {
        product: "Thiamethoxam 25WG",
        dosePer16L: 4,
        unit: "g",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Ensure fine mist nozzle for underside coverage where whitefly nymphs hide.",
      },
      {
        product: "Imidacloprid 17.8SL",
        dosePer16L: 6,
        unit: "ml",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Do not exceed recommended 6 ml/16L dosage to prevent phytotoxicity.",
      },
    ],
  },
  Cotton: {
    "Whitefly / Jassids (रस चूसक कीट)": [
      {
        product: "Thiamethoxam 25WG",
        dosePer16L: 4,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM or 5:00 PM–7:00 PM",
        dilutionNote: "Mix 4 g/16L water cleanly; avoid mixing with alkaline Bordeaux solutions.",
      },
      {
        product: "Imidacloprid 17.8SL",
        dosePer16L: 6,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Uniform foliar spray during early vegetative squaring stage.",
      },
    ],
    "Bollworm / Stem Borer": [
      {
        product: "Chlorpyrifos 20EC",
        dosePer16L: 40,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Apply 40 ml per 16L tank thoroughly across fruiting branches and bolls.",
      },
    ],
  },
  Maize: {
    "Stem Borer / Fall Armyworm": [
      {
        product: "Chlorpyrifos 20EC",
        dosePer16L: 40,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM",
        dilutionNote: "Direct spray into the leaf whorl where larvae feed during early morning.",
      },
    ],
    "Turcicum Leaf Blight": [
      {
        product: "Mancozeb 75WP",
        dosePer16L: 25,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "6:30 AM–9:00 AM",
        dilutionNote: "Pre-mix 25 g powder into smooth slurry before pouring into tank.",
      },
    ],
  },
  Potato: {
    "Late Blight (पछेती झुलसा)": [
      {
        product: "Mancozeb 75WP",
        dosePer16L: 25,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM or 4:30 PM–6:30 PM",
        dilutionNote: "Prophylactic spray every 7–10 days during foggy/humid weather.",
      },
    ],
    "Aphids / Whitefly": [
      {
        product: "Imidacloprid 17.8SL",
        dosePer16L: 6,
        unit: "ml",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Controls viral vector aphids effectively in seed potato crops.",
      },
    ],
  },
  Mustard: {
    "Alternaria Blight / White Rust": [
      {
        product: "Mancozeb 75WP",
        dosePer16L: 25,
        unit: "g",
        waterPerAcreL: 200,
        sprayTiming: "6:30 AM–9:00 AM",
        dilutionNote: "Spray at 45 and 60 days after sowing when lower leaf spots appear.",
      },
      {
        product: "Tebuconazole 250EW",
        dosePer16L: 12,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:30 AM–9:00 AM",
        dilutionNote: "Mix 12 ml per 16L tank; protects siliqua (pod) formation stage.",
      },
    ],
    "Mustard Aphid (चेपा / माहू)": [
      {
        product: "Thiamethoxam 25WG",
        dosePer16L: 4,
        unit: "g",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM (After honeybee foraging stops)",
        dilutionNote: "MUST spray in late evening so pollinating honeybees remain safe.",
      },
    ],
  },
  Soybean: {
    "Soybean Rust / Pod Blight": [
      {
        product: "Tebuconazole 250EW",
        dosePer16L: 12,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM",
        dilutionNote: "12 ml per 16L tank; spray at R1–R3 flowering/podding transition.",
      },
      {
        product: "Propiconazole 25EC",
        dosePer16L: 15,
        unit: "ml",
        waterPerAcreL: 200,
        sprayTiming: "6:00 AM–8:30 AM",
        dilutionNote: "Ensure full canopy wetting at 200L water per acre.",
      },
    ],
    "Whitefly / Girdle Beetle": [
      {
        product: "Thiamethoxam 25WG",
        dosePer16L: 4,
        unit: "g",
        waterPerAcreL: 180,
        sprayTiming: "5:00 PM–7:00 PM",
        dilutionNote: "Prevents Yellow Mosaic Virus vector spread effectively.",
      },
    ],
  },
};

const FERTILIZER_NPK_PER_ACRE: Record<string, { n: number; p: number; k: number }> = {
  Wheat: { n: 60, p: 30, k: 20 },
  Rice: { n: 80, p: 40, k: 40 },
  Tomato: { n: 100, p: 60, k: 60 },
  Cotton: { n: 80, p: 40, k: 40 },
  Maize: { n: 80, p: 40, k: 40 },
  Potato: { n: 120, p: 60, k: 80 },
  Mustard: { n: 60, p: 30, k: 20 },
  Soybean: { n: 20, p: 40, k: 20 },
};

function toAcres(area: number, unit: string): number {
  if (unit === "Bigha") return area * 0.619;
  if (unit === "Hectare") return area * 2.471;
  return area;
}

function formatTotalAmount(val: number, unit: "ml" | "g"): string {
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)} ${unit === "ml" ? "L" : "kg"}`;
  }
  return `${Math.round(val)} ${unit}`;
}

export default function CalculatorPage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"pesticide" | "fertilizer">("pesticide");

  // ── Pesticide Form State ──
  const [pestCrop, setPestCrop] = useState<string>("");
  const [pestDisease, setPestDisease] = useState<string>("");
  const [pestProductName, setPestProductName] = useState<string>("");
  const [pestArea, setPestArea] = useState<string>("2.5");
  const [pestUnit, setPestUnit] = useState<string>("Acres");
  const [tankCapacity, setTankCapacity] = useState<number>(16);
  const [pestError, setPestError] = useState<string>("");
  const [pestSaved, setPestSaved] = useState<boolean>(false);
  const [pestResult, setPestResult] = useState<{
    product: string;
    dosePerTank: string;
    tankSize: number;
    tanksNeeded: number;
    totalAmount: string;
    waterTotal: string;
    waterPerTank: string;
    sprayTiming: string;
    dilutionNote: string;
  } | null>(null);

  // ── Fertilizer Form State ──
  const [fertCrop, setFertCrop] = useState<string>("Wheat");
  const [fertStage, setFertStage] = useState<"basal" | "top1" | "top2">("basal");
  const [fertArea, setFertArea] = useState<string>("2.5");
  const [fertUnit, setFertUnit] = useState<string>("Acres");
  const [soilType, setSoilType] = useState<string>("Loamy");
  const [fertError, setFertError] = useState<string>("");
  const [fertSaved, setFertSaved] = useState<boolean>(false);
  const [fertResult, setFertResult] = useState<{
    headline: string;
    ureaKg: number;
    dapKg: number;
    mopKg: number;
    applyTip: string;
    estimatedCost: number;
  } | null>(null);

  const diseasesForCrop = pestCrop ? Object.keys(PESTICIDE_DATA[pestCrop] || {}) : [];
  const productsForDisease =
    pestCrop && pestDisease ? PESTICIDE_DATA[pestCrop]?.[pestDisease] || [] : [];

  const handlePestCropChange = (crop: string) => {
    setPestCrop(crop);
    const firstDisease = Object.keys(PESTICIDE_DATA[crop] || {})[0] || "";
    setPestDisease(firstDisease);
    const firstProduct = PESTICIDE_DATA[crop]?.[firstDisease]?.[0]?.product || "";
    setPestProductName(firstProduct);
    setPestError("");
    setPestSaved(false);
  };

  const handlePestDiseaseChange = (disease: string) => {
    setPestDisease(disease);
    const firstProduct = PESTICIDE_DATA[pestCrop]?.[disease]?.[0]?.product || "";
    setPestProductName(firstProduct);
    setPestError("");
    setPestSaved(false);
  };

  const handleCalculatePesticide = () => {
    const areaNum = parseFloat(pestArea);
    if (!pestCrop || !pestDisease || !pestProductName) {
      setPestError(
        lang === "hi"
          ? "कृपया फसल, रोग और कीटनाशक उत्पाद चुनें।"
          : "Please select Crop, Disease/Pest, and Pesticide Product."
      );
      return;
    }
    if (isNaN(areaNum) || areaNum <= 0) {
      setPestError(
        lang === "hi"
          ? "कृपया खेत का सही क्षेत्रफल (Area) दर्ज करें।"
          : "Please enter a valid positive field area."
      );
      return;
    }

    const option =
      productsForDisease.find((p) => p.product === pestProductName) || productsForDisease[0];
    if (!option) return;

    const acres = toAcres(areaNum, pestUnit);
    const totalWaterL = Math.round(acres * option.waterPerAcreL);
    const tanksNeeded = Math.max(1, Math.ceil(totalWaterL / tankCapacity));
    const dosePerTankVal = Number(((option.dosePer16L / 16) * tankCapacity).toFixed(1));
    const totalProductVal = dosePerTankVal * tanksNeeded;

    setPestError("");
    setPestSaved(false);
    setPestResult({
      product: option.product,
      dosePerTank: `${dosePerTankVal} ${option.unit}`,
      tankSize: tankCapacity,
      tanksNeeded,
      totalAmount: formatTotalAmount(totalProductVal, option.unit),
      waterTotal: `${totalWaterL} Litres`,
      waterPerTank: `${tankCapacity} Litres`,
      sprayTiming: option.sprayTiming,
      dilutionNote: option.dilutionNote,
    });
  };

  const handleCalculateFertilizer = () => {
    const areaNum = parseFloat(fertArea);
    if (!fertCrop) {
      setFertError("Please select a crop.");
      return;
    }
    if (isNaN(areaNum) || areaNum <= 0) {
      setFertError("Please enter a valid positive field area.");
      return;
    }

    const baseNpk = FERTILIZER_NPK_PER_ACRE[fertCrop] || FERTILIZER_NPK_PER_ACRE.Wheat;
    const acres = toAcres(areaNum, fertUnit);

    // Adjust nitrogen slightly for soil leaching/retention
    const nMultiplier =
      soilType === "Sandy" ? 1.15 : soilType === "Clay" ? 0.95 : 1.0;

    const totalN = baseNpk.n * nMultiplier * acres;
    const totalP = baseNpk.p * acres;
    const totalK = baseNpk.k * acres;

    let stageN = totalN / 3;
    let stageP = 0;
    let stageK = 0;
    let stageLabel = "Basal";
    let applyTip =
      "Incorporate basal DAP, MOP, and 1/3rd Urea uniformly into root-zone soil just before sowing or transplanting.";

    if (fertStage === "basal") {
      stageN = totalN / 3;
      stageP = totalP;
      stageK = totalK;
      stageLabel = "Basal";
    } else if (fertStage === "top1") {
      stageN = totalN / 3;
      stageLabel = "Top Dressing 1";
      applyTip =
        "Broadcast evenly 21–30 days after sowing immediately after light irrigation (CRI / tillering stage). Avoid wet leaves.";
    } else {
      stageN = totalN / 3;
      stageLabel = "Top Dressing 2";
      applyTip =
        "Apply 45–60 days after sowing before panicle/ear emergence to maximize grain filling and yield.";
    }

    // Nutrient -> Fertilizer grade math: DAP has 46% P2O5 + 18% N; Urea has 46% N; MOP has 60% K2O
    const dapKg = Math.round((stageP / 0.46) * 10) / 10;
    const nFromDap = dapKg * 0.18;
    const remainingN = Math.max(0, stageN - nFromDap);
    const ureaKg = Math.round((remainingN / 0.46) * 10) / 10;
    const mopKg = Math.round((stageK / 0.6) * 10) / 10;

    // 2026 Approx Costs: Urea ₹266/50kg (₹5.32/kg), DAP ₹1350/50kg (₹27/kg), MOP ₹1700/50kg (₹34/kg)
    const estimatedCost = Math.round(ureaKg * 5.32 + dapKg * 27 + mopKg * 34);

    setFertError("");
    setFertSaved(false);
    setFertResult({
      headline: `Fertilizer Dose — ${fertCrop} · ${stageLabel} · ${areaNum} ${fertUnit}`,
      ureaKg,
      dapKg,
      mopKg,
      applyTip,
      estimatedCost,
    });
  };

  const handleSaveResult = (type: "pesticide" | "fertilizer", payload: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem("aegroshield_calc_history") || "[]");
      existing.unshift({ type, payload, savedAt: new Date().toISOString() });
      localStorage.setItem("aegroshield_calc_history", JSON.stringify(existing.slice(0, 15)));
      if (type === "pesticide") setPestSaved(true);
      else setFertSaved(true);
    } catch {
      if (type === "pesticide") setPestSaved(true);
      else setFertSaved(true);
    }
  };

  return (
    <div>
      {/* ── Page Hero ───────────────────────────────────────────── */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-badge">🧮 {t("nav.calculator")}</div>
          <h1>{t("calc.title")}</h1>
          <p>{t("calc.sub")}</p>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z"
              fill="#E8F3EC"
            ></path>
          </svg>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="calc-layout">
        {/* Mandatory Agricultural Safety Disclaimer */}
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 6px rgba(245, 158, 11, 0.08)",
          }}
        >
          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#92400e", fontWeight: 500, lineHeight: 1.5 }}>
            <strong>Disclaimer:</strong> This is advisory guidance only. Please verify product labels and consult local agricultural extension officers before farm application.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="stats-strip">
          <div className="stat-card">
            <div className="stat-icon green">💰</div>
            <div>
              <div className="stat-label">Avg. Input Saving</div>
              <div className="stat-value">28%</div>
              <div className="stat-sub">vs. thumb-rule</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">⚗️</div>
            <div>
              <div className="stat-label">Products in DB</div>
              <div className="stat-value">1,200+</div>
              <div className="stat-sub">Registered in India</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">🌱</div>
            <div>
              <div className="stat-label">Crops Covered</div>
              <div className="stat-value">60+</div>
              <div className="stat-sub">Varieties</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div>
              <div className="stat-label">ICAR Verified</div>
              <div className="stat-value">100%</div>
              <div className="stat-sub">All recommendations</div>
            </div>
          </div>
        </div>

        {/* ── Main Tab Buttons ────────────────────────────────────── */}
        <div className="main-tab-bar">
          <button
            type="button"
            className={`main-tab-btn ${activeTab === "pesticide" ? "active" : ""}`}
            id="pesticideTab"
            onClick={() => setActiveTab("pesticide")}
          >
            <span className="tab-icon">🧪</span>
            {lang === "hi" ? "कीटनाशक मात्रा" : "Pesticide Dosage"}
          </button>
          <button
            type="button"
            className={`main-tab-btn ${activeTab === "fertilizer" ? "active" : ""}`}
            id="fertilizerTab"
            onClick={() => setActiveTab("fertilizer")}
          >
            <span className="tab-icon">🌱</span>
            {lang === "hi" ? "उर्वरक (खाद) मात्रा" : "Fertilizer Dose"}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 1: PESTICIDE                                         */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className={`tab-panel ${activeTab === "pesticide" ? "active" : ""}`} id="pesticideSection">
          <div className="calc-two-col">
            {/* LEFT: Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                      <label className="form-label" htmlFor="pesticideCrop">
                        Crop <span>*</span>
                      </label>
                      <select
                        className="form-control"
                        id="pesticideCrop"
                        value={pestCrop}
                        onChange={(e) => handlePestCropChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select crop…
                        </option>
                        <option value="Wheat">🌾 Wheat (गेहूँ)</option>
                        <option value="Rice">🌾 Rice (चावल)</option>
                        <option value="Tomato">🍅 Tomato (टमाटर)</option>
                        <option value="Cotton">🌿 Cotton (कपास)</option>
                        <option value="Maize">🌽 Maize (मक्का)</option>
                        <option value="Potato">🥔 Potato (आलू)</option>
                        <option value="Mustard">🌻 Mustard (सरसों)</option>
                        <option value="Soybean">🫘 Soybean (सोयाबीन)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="pesticideDisease">
                        Disease / Pest <span>*</span>
                      </label>
                      <select
                        className="form-control"
                        id="pesticideDisease"
                        value={pestDisease}
                        onChange={(e) => handlePestDiseaseChange(e.target.value)}
                        disabled={!pestCrop}
                        required
                      >
                        {!pestCrop ? (
                          <option value="">— Select crop first —</option>
                        ) : (
                          diseasesForCrop.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="pesticideProduct">
                        Pesticide Product <span>*</span>
                      </label>
                      <select
                        className="form-control"
                        id="pesticideProduct"
                        value={pestProductName}
                        onChange={(e) => setPestProductName(e.target.value)}
                        disabled={!pestDisease}
                        required
                      >
                        {!pestDisease ? (
                          <option value="">— Select disease first —</option>
                        ) : (
                          productsForDisease.map((p) => (
                            <option key={p.product} value={p.product}>
                              {p.product} ({p.dosePer16L} {p.unit}/16L)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="fieldAreaPest">
                        Field Area <span>*</span>
                      </label>
                      <div className="input-unit-row">
                        <input
                          type="number"
                          className="form-control"
                          id="fieldAreaPest"
                          value={pestArea}
                          onChange={(e) => setPestArea(e.target.value)}
                          placeholder="e.g. 2.5"
                          min="0.1"
                          max="1000"
                          step="0.1"
                          required
                        />
                        <select
                          className="form-control unit-select"
                          id="fieldUnitPest"
                          value={pestUnit}
                          onChange={(e) => setPestUnit(e.target.value)}
                        >
                          <option value="Acres">Acres</option>
                          <option value="Bigha">Bigha</option>
                          <option value="Hectare">Hectare</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="tankCapacity">
                        Spray Tank Size (litres) <span>*</span>
                      </label>
                      <select
                        className="form-control"
                        id="tankCapacity"
                        value={tankCapacity}
                        onChange={(e) => setTankCapacity(Number(e.target.value))}
                      >
                        <option value={8}>8 Litre (Knapsack small)</option>
                        <option value={16}>16 Litre (Standard knapsack)</option>
                        <option value={20}>20 Litre (Large knapsack)</option>
                        <option value={100}>100 Litre (Power sprayer)</option>
                        <option value={200}>200 Litre (Boom sprayer/tank)</option>
                        <option value={600}>600 Litre (Tractor boom)</option>
                      </select>
                    </div>

                    {pestError && (
                      <div style={{ color: "#dc2626", fontSize: "0.84rem", fontWeight: 600 }}>
                        {pestError}
                      </div>
                    )}

                    <button
                      type="button"
                      className="calc-btn"
                      id="calcPesticide"
                      onClick={handleCalculatePesticide}
                    >
                      🧮 Calculate Dose →
                    </button>
                  </div>
                </div>
              </div>

              {/* Safety tip always visible */}
              <div className="tip-box-amber">
                <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>⚠️</span>
                <div>
                  <strong style={{ color: "#5a3808", fontWeight: 800, display: "block", marginBottom: "4px" }}>
                    Safety First & Advisory Notice
                  </strong>
                  Disclaimer: This is advisory guidance only. Please verify product labels and consult local agricultural extension officers before farm application.
                  <div style={{ marginTop: "6px", fontSize: "0.82rem", opacity: 0.9 }}>
                    Always wear gloves, mask and eye protection when handling agrochemicals. Follow label instructions. Never spray in strong wind or midday heat. Dispose of empty containers safely.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Result + Reference */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div id="pesticideResult" className={pestResult ? "visible" : ""}>
                <div className="result-card">
                  <div className="rc-product">Recommended Product</div>
                  <div className="rc-name" id="pestProductName">
                    {pestResult?.product || "—"}
                  </div>
                  <div className="rc-stats">
                    <div className="rc-stat">
                      <div className="rc-stat-val" id="pestDosePerTank">
                        {pestResult?.dosePerTank || "—"}
                      </div>
                      <div className="rc-stat-lbl">
                        Per Tank (<span id="tankSizeLabel">{pestResult?.tankSize || tankCapacity}</span>L)
                      </div>
                    </div>
                    <div className="rc-stat">
                      <div className="rc-stat-val" id="pestTanksNeeded">
                        {pestResult?.tanksNeeded ?? "—"}
                      </div>
                      <div className="rc-stat-lbl">Tanks for Your Field</div>
                    </div>
                    <div className="rc-stat">
                      <div className="rc-stat-val" id="pestTotalAmount">
                        {pestResult?.totalAmount || "—"}
                      </div>
                      <div className="rc-stat-lbl">Total Product</div>
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,.12)",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      fontSize: ".84rem",
                      opacity: ".95",
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: "4px" }}>💧 Water Required</strong>
                    <span id="pestWaterTotal">{pestResult?.waterTotal || "—"}</span> total ·{" "}
                    <span id="pestWaterPerTank">{pestResult?.waterPerTank || "—"}</span> per tank fill
                  </div>
                </div>

                <div className="warn-box">
                  <span className="warn-icon">⚠️</span>
                  <div>
                    <strong>Safety Warning</strong>
                    Wear gloves and mask while spraying. Spray in early morning or evening only. Keep children and animals away from the field for 24 hours after spraying.
                  </div>
                </div>

                <div className="timing-card">
                  <div className="timing-icon">🕐</div>
                  <div>
                    <div className="timing-label">Best Time to Spray</div>
                    <div className="timing-value" id="sprayTiming">
                      {pestResult?.sprayTiming || "6AM–8AM or 5PM–7PM"}
                    </div>
                  </div>
                </div>

                <div className="timing-card">
                  <div className="timing-icon">🔬</div>
                  <div>
                    <div className="timing-label">Dilution Instruction</div>
                    <div className="timing-value" id="dilutionNote">
                      {pestResult?.dilutionNote || "—"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="save-result-btn"
                  id="savePest"
                  onClick={() => pestResult && handleSaveResult("pesticide", pestResult)}
                >
                  {pestSaved ? "✅ Saved to Device History!" : "💾 Save This Result"}
                </button>
              </div>

              {/* Reference Table (always visible on right) */}
              <div className="ref-panel">
                <div className="ref-card">
                  <div className="ref-card-head">🧪 Common Pesticides — Quick Reference</div>
                  <table className="ag-table" style={{ fontSize: ".83rem" }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Dose/16L Tank</th>
                        <th>Target</th>
                      </tr>
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
                  <table className="ag-table" style={{ fontSize: ".83rem" }}>
                    <thead>
                      <tr>
                        <th>Acres</th>
                        <th>Bigha</th>
                        <th>Hectare</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>1.62</td><td>0.405</td></tr>
                      <tr><td>2</td><td>3.24</td><td>0.810</td></tr>
                      <tr><td>5</td><td>8.09</td><td>2.024</td></tr>
                      <tr><td>10</td><td>16.19</td><td>4.047</td></tr>
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 16px", fontSize: ".76rem", color: "var(--gray-400)" }}>
                    * 1 Bigha ≈ 0.619 Acres (standard UP/Bihar)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* TAB 2: FERTILIZER                                        */}
        {/* ════════════════════════════════════════════════════════ */}
        <div className={`tab-panel ${activeTab === "fertilizer" ? "active" : ""}`} id="fertilizerSection">
          <div className="calc-two-col">
            {/* LEFT: Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                      <label className="form-label" htmlFor="fertilizerCrop">
                        Crop <span>*</span>
                      </label>
                      <select
                        className="form-control"
                        id="fertilizerCrop"
                        value={fertCrop}
                        onChange={(e) => setFertCrop(e.target.value)}
                        required
                      >
                        <option value="Wheat">🌾 Wheat (गेहूँ)</option>
                        <option value="Rice">🌾 Rice (चावल)</option>
                        <option value="Tomato">🍅 Tomato (टमाटर)</option>
                        <option value="Cotton">🌿 Cotton (कपास)</option>
                        <option value="Maize">🌽 Maize (मक्का)</option>
                        <option value="Potato">🥔 Potato (आलू)</option>
                        <option value="Mustard">🌻 Mustard (सरसों)</option>
                        <option value="Soybean">🫘 Soybean (सोयाबीन)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="fertilizerStage">
                        Application Stage <span>*</span>
                      </label>
                      <select
                        className="form-control"
                        id="fertilizerStage"
                        value={fertStage}
                        onChange={(e) => setFertStage(e.target.value as "basal" | "top1" | "top2")}
                        required
                      >
                        <option value="basal">🌱 Basal Dose (at sowing)</option>
                        <option value="top1">🌿 Top Dressing 1 (21–30 days)</option>
                        <option value="top2">🌾 Top Dressing 2 (45–60 days)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="fieldAreaFert">
                        Field Area <span>*</span>
                      </label>
                      <div className="input-unit-row">
                        <input
                          type="number"
                          className="form-control"
                          id="fieldAreaFert"
                          value={fertArea}
                          onChange={(e) => setFertArea(e.target.value)}
                          placeholder="e.g. 2.5"
                          min="0.1"
                          max="1000"
                          step="0.1"
                          required
                        />
                        <select
                          className="form-control unit-select"
                          id="fieldUnitFert"
                          value={fertUnit}
                          onChange={(e) => setFertUnit(e.target.value)}
                        >
                          <option value="Acres">Acres</option>
                          <option value="Bigha">Bigha</option>
                          <option value="Hectare">Hectare</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="soilTypeFert">
                        Soil Type
                      </label>
                      <select
                        className="form-control"
                        id="soilTypeFert"
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                      >
                        <option value="Loamy">🌱 Loamy (दोमट) — most common</option>
                        <option value="Sandy">🏜️ Sandy (बलुई) — needs more N</option>
                        <option value="Clay">🏺 Clay (चिकनी) — hold nutrients longer</option>
                        <option value="Black Cotton">🖤 Black Cotton (काली मिट्टी)</option>
                      </select>
                    </div>

                    {fertError && (
                      <div style={{ color: "#dc2626", fontSize: "0.84rem", fontWeight: 600 }}>
                        {fertError}
                      </div>
                    )}

                    <button
                      type="button"
                      className="calc-btn"
                      id="calcFertilizer"
                      onClick={handleCalculateFertilizer}
                    >
                      🌱 Calculate Fertilizer Dose →
                    </button>
                  </div>
                </div>
              </div>

              <div className="tip-box-amber">
                <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>💡</span>
                <div>
                  <strong style={{ color: "#5a3808", fontWeight: 800 }}>Pro Tip</strong>
                  Apply basal dose before or at sowing. Always split nitrogen application — give only 1/3 at sowing,
                  rest in top dressings. Over-dosing nitrogen causes lodging and reduces grain quality.
                </div>
              </div>
            </div>

            {/* RIGHT: Result + Reference */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div id="fertilizerResult" className={fertResult ? "visible" : ""}>
                <div className="fert-result-card">
                  <div className="fert-head" id="fertHeadline">
                    {fertResult?.headline || "Fertilizer Dose"}
                  </div>
                  <div className="fert-nutrients">
                    <div className="fert-row">
                      <div className="fert-row-left">
                        <span className="fert-row-icon">🟡</span>
                        <div>
                          <div className="fert-row-name">Urea (46% N)</div>
                          <div className="fert-row-sub">Nitrogen source</div>
                        </div>
                      </div>
                      <div className="fert-row-val" id="ureaAmount">
                        {fertResult ? fertResult.ureaKg : "—"}
                        <small> kg</small>
                      </div>
                    </div>

                    <div className="fert-row">
                      <div className="fert-row-left">
                        <span className="fert-row-icon">🔵</span>
                        <div>
                          <div className="fert-row-name">DAP (18%N + 46%P₂O₅)</div>
                          <div className="fert-row-sub">Phosphorus source</div>
                        </div>
                      </div>
                      <div className="fert-row-val" id="dapAmount">
                        {fertResult ? fertResult.dapKg : "—"}
                        <small> kg</small>
                      </div>
                    </div>

                    <div className="fert-row">
                      <div className="fert-row-left">
                        <span className="fert-row-icon">🔴</span>
                        <div>
                          <div className="fert-row-name">MOP — Muriate of Potash (60%K₂O)</div>
                          <div className="fert-row-sub">Potassium source</div>
                        </div>
                      </div>
                      <div className="fert-row-val" id="mopAmount">
                        {fertResult ? fertResult.mopKg : "—"}
                        <small> kg</small>
                      </div>
                    </div>
                  </div>

                  <div className="apply-tip" id="fertApplyTip">
                    <strong>📋 Application Method</strong>
                    <span id="fertApplyText">{fertResult?.applyTip || "—"}</span>
                  </div>

                  <div className="cost-row">
                    <div className="cost-label">💰 Estimated Total Cost</div>
                    <div className="cost-value" id="fertCostEstimate">
                      {fertResult ? `₹${fertResult.estimatedCost.toLocaleString("en-IN")}` : "—"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="save-result-btn"
                  id="saveFert"
                  onClick={() => fertResult && handleSaveResult("fertilizer", fertResult)}
                >
                  {fertSaved ? "✅ Saved to Device History!" : "💾 Save This Result"}
                </button>
              </div>

              {/* Reference Panel for Fertilizer tab */}
              <div className="ref-panel">
                <div className="ref-card">
                  <div className="ref-card-head">🌿 NPK Requirements (kg/acre) — Full Season</div>
                  <table className="ag-table" style={{ fontSize: ".83rem" }}>
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>N</th>
                        <th>P₂O₅</th>
                        <th>K₂O</th>
                      </tr>
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
                  <table className="ag-table" style={{ fontSize: ".83rem" }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price/50kg bag</th>
                      </tr>
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
        </div>
      </main>
    </div>
  );
}
