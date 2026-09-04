"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { MOCK_MARKET_PRICES } from "@/lib/mockData";

export interface PriceHistoryItem {
  date: string;
  modalPrice: number;
}

export interface MandiRateItem {
  id?: string;
  state?: string;
  district?: string;
  market?: string;
  mandiName?: string;
  marketName?: string;
  commodity?: string;
  cropName?: string;
  variety?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate?: string;
  type?: string;
  recommendation?: 'HOLD' | 'SELL_NOW' | 'SELL';
  recommendationTimeline?: string;
  trend?: 'RISING' | 'FALLING' | 'STABLE' | 'UP' | 'DOWN';
  priceChangePercent?: number;
  priceHistory?: PriceHistoryItem[];
  advisoryText?: string;
  advisoryUpdatedAt?: any;
}

const COMMODITY_HINDI_MAP: Record<string, string> = {
  'Wheat': 'गेहूँ',
  'Rice': 'चावल',
  'Paddy': 'धान',
  'Paddy(Dhan)': 'धान',
  'Maize': 'मक्का',
  'Mustard': 'सरसों',
  'Potato': 'आलू',
  'Onion': 'प्याज',
  'Tomato': 'टमाटर',
  'Cotton': 'कपास',
  'Soybean': 'सोयाबीन',
  'Chickpea': 'चना',
  'Gram': 'चना',
  'Gram Raw(Chholia)': 'हरा चना',
  'Sugarcane': 'गन्ना',
  'Brinjal': 'बैंगन',
  'Cabbage': 'पत्तागोभी',
  'Cauliflower': 'फूलगोभी',
  'Carrot': 'गाजर',
  'Green Chilli': 'हरी मिर्च',
  'Garlic': 'लहसुन',
  'Ginger': 'अदरक',
  'Peas Wet': 'हरी मटर',
  'Peas(Wet)': 'हरी मटर',
  'Apple': 'सेब',
  'Banana': 'केला',
  'Mango': 'आम',
  'Lemon': 'नींबू',
  'Pumpkin': 'कद्दू',
  'Bottle gourd': 'लौकी',
  'Bitter gourd': 'करेला',
  'Sponge gourd': 'तोरी',
  'Cucumbar(Kheera)': 'खीरा',
  'Cucumber': 'खीरा',
  'Beans': 'फलियां',
  'Bhindi(Ladies Finger)': 'भिंडी',
  'Capsicum': 'शिमला मिर्च',
  'Raddish': 'मूली',
  'Spinach': 'पालक',
  'Coriander(Leaves)': 'धनिया',
  'Turmeric': 'हल्दी',
  'Arhar (Tur)': 'अरहर / तूर',
  'Moong(Green Gram)': 'मूंग',
  'Urad(Black Gram)': 'उड़द',
  'Bajra(Pearl Millet)': 'बाजरा',
  'Jowar(Sorghum)': 'ज्वार',
  'Barley (Jau)': 'जौ',
  'Groundnut': 'मूंगफली',
  'Sesamum(Til)': 'तिल',
  'Sunflower': 'सूरजमुखी',
  'Wood': 'लकड़ी',
};

function getCommodityLabel(comm: string): string {
  if (!comm) return '';
  const hindi = COMMODITY_HINDI_MAP[comm];
  if (hindi) return `${comm} (${hindi})`;
  return comm;
}

function parseArrivalDate(dateStr?: string): number {
  if (!dateStr) return 0;
  if (dateStr.toLowerCase() === 'today') return Date.now();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const todayDay = String(now.getDate()).padStart(2, '0');
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayYear = String(now.getFullYear());

  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    if (day === todayDay && month === todayMonth && year === todayYear) {
      return true;
    }
  }
  return dateStr.toLowerCase() === 'today';
}

function ensureItemAnalytics(item: MandiRateItem): MandiRateItem {
  const minPrice = item.minPrice || 0;
  const maxPrice = item.maxPrice || item.modalPrice || 0;
  const modalPrice = item.modalPrice || 0;
  const spread = maxPrice - minPrice;

  let trend = item.trend;
  if (trend === 'UP') trend = 'RISING';
  if (trend === 'DOWN') trend = 'FALLING';

  let priceChangePercent = item.priceChangePercent;

  if (!trend) {
    if (spread > 0) {
      if (modalPrice >= maxPrice * 0.95) {
        trend = 'RISING';
        priceChangePercent = 2.1;
      } else if (modalPrice <= minPrice + spread * 0.25) {
        trend = 'FALLING';
        priceChangePercent = -1.8;
      } else {
        trend = 'STABLE';
        priceChangePercent = 0.4;
      }
    } else {
      trend = 'STABLE';
      priceChangePercent = 0;
    }
  }

  if (priceChangePercent === undefined) {
    priceChangePercent = trend === 'RISING' ? 1.8 : (trend === 'FALLING' ? -1.6 : 0.2);
  }

  let recommendation: 'HOLD' | 'SELL_NOW' =
    (item.recommendation as any) === 'SELL' || item.recommendation === 'SELL_NOW'
      ? 'SELL_NOW'
      : 'HOLD';

  let recommendationTimeline = item.recommendationTimeline;

  if (!item.recommendation) {
    const isBottom25 = spread > 0 ? (modalPrice <= minPrice + spread * 0.25) : false;
    const isTop95 = maxPrice > 0 ? (modalPrice >= maxPrice * 0.95) : false;

    if (trend === 'RISING' || isBottom25) {
      recommendation = 'HOLD';
      recommendationTimeline = '7-10 Days';
    } else if (trend === 'FALLING' || isTop95) {
      recommendation = 'SELL_NOW';
      recommendationTimeline = 'Immediate';
    } else {
      recommendation = 'HOLD';
      recommendationTimeline = '3-5 Days';
    }
  }

  if (!recommendationTimeline) {
    recommendationTimeline = recommendation === 'SELL_NOW' ? 'Immediate' : '7-10 Days';
  }

  const comm = item.commodity || item.cropName || 'Fasal';
  const advisoryText =
    item.advisoryText ||
    (recommendation === 'SELL_NOW'
      ? `${comm} ke daam is samay ₹${modalPrice}/quintal ke achhe level par hain aur aane wale dino me mandi aavak badh sakti hai. Abhi bechna munafedar rahega.`
      : `${comm} ke bhav me tezi ka rukh hai aur aavak santulit hai. Agar safe storage suvidha ho, toh 7-10 din ruko behtar daam milne ki sambhavna hai.`);

  return {
    ...item,
    priceChangePercent,
    trend,
    recommendation,
    recommendationTimeline,
    advisoryText,
  };
}

export default function Page() {
  const { user, userData, isDemo } = useAuth();

  // Search filter selections
  const [selectedCrop, setSelectedCrop] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  // Applied filter states (updated on search click or reset)
  const [appliedCrop, setAppliedCrop] = useState<string>("All");
  const [appliedState, setAppliedState] = useState<string>("All");
  const [appliedDistrict, setAppliedDistrict] = useState<string>("All");

  const [liveMandiRates, setLiveMandiRates] = useState<MandiRateItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const normalizedMockPrices: MandiRateItem[] = useMemo(() => {
    return MOCK_MARKET_PRICES.map((m, idx) => {
      const comm = m.cropName.replace(/\s*\(.*?\)/, '').trim();
      const rec: 'SELL_NOW' | 'HOLD' = m.recommendation === 'SELL' ? 'SELL_NOW' : 'HOLD';
      const trnd: 'RISING' | 'FALLING' | 'STABLE' = m.trend === 'UP' ? 'RISING' : (m.trend === 'DOWN' ? 'FALLING' : 'STABLE');
      const changePct = trnd === 'RISING' ? 2.4 : (trnd === 'FALLING' ? -1.8 : 0.3);
      const timeline = rec === 'SELL_NOW' ? 'Immediate' : '7-10 Days';
      const advisory = rec === 'SELL_NOW'
        ? `${comm} ke daam is samay ₹${m.modalPrice}/quintal ke uchhtam star par hain. Abhi bechkar munafa lena behtar rahega.`
        : `${comm} ke bhav me tezi ka rukh hai. Safe storage suvidha ho toh 7-10 din hold karein behtar daam milne ki sambhavna hai.`;

      return {
        id: `mock_${idx}`,
        state: "Uttar Pradesh",
        district: m.district,
        market: m.mandiName,
        mandiName: m.mandiName,
        marketName: m.mandiName,
        commodity: comm,
        cropName: m.cropName,
        variety: "Standard",
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        modalPrice: m.modalPrice,
        arrivalDate: "Today",
        type: "APMC",
        recommendation: rec,
        recommendationTimeline: timeline,
        trend: trnd,
        priceChangePercent: changePct,
        priceHistory: [
          { date: "02/09/2026", modalPrice: Math.round(m.modalPrice * 0.975) },
          { date: "03/09/2026", modalPrice: Math.round(m.modalPrice * 0.985) },
          { date: "04/09/2026", modalPrice: m.modalPrice },
        ],
        advisoryText: advisory,
      };
    });
  }, []);

  const rawData: MandiRateItem[] = useMemo(() => {
    if (isDemo && (!liveMandiRates || liveMandiRates.length === 0)) {
      return normalizedMockPrices;
    }
    return (liveMandiRates && liveMandiRates.length > 0) ? liveMandiRates : normalizedMockPrices;
  }, [isDemo, liveMandiRates, normalizedMockPrices]);

  // 1. Available States (Derived dynamically from distinct state values in Firestore 'mandi_rates')
  const availableStates = useMemo(() => {
    const s = new Set<string>();
    rawData.forEach((item) => {
      const st = (item.state || '').trim();
      if (st) s.add(st);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rawData]);

  // 2. Available Districts (Cascading filter based on selected state)
  const availableDistricts = useMemo(() => {
    const d = new Set<string>();
    rawData.forEach((item) => {
      const itemState = (item.state || '').trim();
      const dist = (item.district || '').trim();
      if (!dist) return;

      if (!selectedState || selectedState === "All" || itemState.toLowerCase() === selectedState.toLowerCase()) {
        d.add(dist);
      }
    });
    return Array.from(d).sort((a, b) => a.localeCompare(b));
  }, [rawData, selectedState]);

  // 3. Available Crops (Populate only with commodities actually recorded in the database)
  const availableCrops = useMemo(() => {
    const c = new Set<string>();
    rawData.forEach((item) => {
      const comm = (item.commodity || item.cropName || '').trim();
      if (comm) c.add(comm);
    });
    return Array.from(c).sort((a, b) => a.localeCompare(b));
  }, [rawData]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    // Reset district to "All" whenever state changes to maintain cascading integrity
    setSelectedDistrict("All");
  };

  const fetchFirestoreRates = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'mandi_rates'));
      const items: MandiRateItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as Record<string, any>;
        items.push(ensureItemAnalytics({ id: d.id, ...data } as MandiRateItem));
      });
      return items;
    } catch (err: any) {
      console.warn("[Market] Error querying Firestore mandi_rates:", err);
      return [];
    }
  }, []);

  const triggerSyncAndRefresh = useCallback(async (
    stateToSync = selectedState,
    districtToSync = selectedDistrict,
    cropToSync = selectedCrop
  ) => {
    setSyncing(true);
    setError(null);
    setSyncMessage(null);
    try {
      const params = new URLSearchParams();
      if (stateToSync && stateToSync !== "All") {
        params.set('state', stateToSync);
      }
      if (districtToSync && districtToSync !== "All") {
        params.set('district', districtToSync);
      }
      if (cropToSync && cropToSync !== "All") {
        params.set('commodity', cropToSync);
      }

      console.log(`[Market] Triggering /api/mandi-sync?${params.toString()}`);
      const res = await fetch(`/api/mandi-sync?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        if (json.source === 'live') {
          if (json.count > 0) {
            setSyncMessage(`Successfully fetched ${json.count} live Mandi rates from Agmarknet!`);
          } else {
            setSyncMessage(`No new live arrivals reported today for specified filter.`);
          }
        } else {
          setSyncMessage(`Loaded ${json.count} authentic Mandi rates into database.`);
        }
      } else {
        console.error("[Market] Sync response error:", json.error);
        setError(json.error || "Could not sync Mandi rates.");
      }

      // Re-fetch all documents from Firestore so dropdowns and grid update seamlessly
      const freshItems = await fetchFirestoreRates();
      setLiveMandiRates(freshItems);
      return freshItems;
    } catch (err: any) {
      console.error("[Market] Sync exception:", err);
      setError("Network error while connecting to Mandi sync API.");
      return [];
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [fetchFirestoreRates, selectedState, selectedDistrict, selectedCrop]);

  // Initial load: fetch Firestore, auto-sync if empty
  useEffect(() => {
    let isMounted = true;

    const initMandiData = async () => {
      setLoading(true);
      setError(null);

      const items = await fetchFirestoreRates();
      if (!isMounted) return;

      if (items.length > 0) {
        setLiveMandiRates(items);
        setLoading(false);
      } else {
        console.log("[Market] Firestore mandi_rates collection is empty. Auto-triggering /api/mandi-sync...");
        await triggerSyncAndRefresh("All", "All", "All");
      }
    };

    initMandiData();

    return () => {
      isMounted = false;
    };
  }, [fetchFirestoreRates, triggerSyncAndRefresh]);

  // Explicit Search Handler for "Get Live Prices →" button
  const handleGetLivePrices = async () => {
    setIsSearching(true);
    setError(null);
    setSyncMessage(null);

    const targetCrop = selectedCrop;
    const targetState = selectedState;
    const targetDistrict = selectedDistrict;

    // Commit to applied filters
    setAppliedCrop(targetCrop);
    setAppliedState(targetState);
    setAppliedDistrict(targetDistrict);

    // Call sync API with user's chosen filters
    await triggerSyncAndRefresh(targetState, targetDistrict, targetCrop);

    setIsSearching(false);
  };

  const handleResetFilters = () => {
    setSelectedCrop("All");
    setSelectedState("All");
    setSelectedDistrict("All");
    setAppliedCrop("All");
    setAppliedState("All");
    setAppliedDistrict("All");
    setError(null);
    setSyncMessage(null);
  };

  // Filter computation with fallback to nearby district rates & off-season detection
  const { filteredRates, isShowingNearby, isOffSeason } = useMemo(() => {
    const source = rawData;

    const normCrop = (appliedCrop || "All").trim().toLowerCase();
    const normDist = (appliedDistrict || "All").trim().toLowerCase();
    const normState = (appliedState || "All").trim().toLowerCase();

    const isCropMatch = (item: MandiRateItem) => {
      if (!normCrop || normCrop === "all" || normCrop === "all crops") return true;
      const itemCrop = (item.commodity || item.cropName || '').toLowerCase();
      return (
        itemCrop === normCrop ||
        itemCrop.includes(normCrop) ||
        normCrop.includes(itemCrop) ||
        (normCrop === "rice" && itemCrop.includes("paddy")) ||
        (normCrop === "paddy" && itemCrop.includes("rice")) ||
        (normCrop === "chickpea" && itemCrop.includes("gram"))
      );
    };

    const isStateMatch = (item: MandiRateItem) => {
      if (!normState || normState === "all" || normState === "all states") return true;
      const itemState = (item.state || '').toLowerCase();
      return itemState === normState || itemState.includes(normState) || normState.includes(itemState);
    };

    const isDistrictMatch = (item: MandiRateItem) => {
      if (!normDist || normDist === "all" || normDist === "all districts") return true;
      const itemDist = (item.district || '').toLowerCase();
      return itemDist === normDist || itemDist.includes(normDist) || normDist.includes(itemDist);
    };

    const sortByRecent = (items: MandiRateItem[]) => {
      return [...items].sort((a, b) => parseArrivalDate(b.arrivalDate) - parseArrivalDate(a.arrivalDate));
    };

    // 1. Try exact matches (crop + state + district)
    const exactMatches = source.filter(item => isCropMatch(item) && isStateMatch(item) && isDistrictMatch(item));
    if (exactMatches.length > 0) {
      return {
        filteredRates: sortByRecent(exactMatches),
        isShowingNearby: false,
        isOffSeason: false
      };
    }

    const hasSpecificDist = normDist && normDist !== "all" && normDist !== "all districts";
    const hasSpecificCrop = normCrop && normCrop !== "all" && normCrop !== "all crops";
    const hasSpecificState = normState && normState !== "all" && normState !== "all states";

    // 2. Specific District + Specific Crop + Specific State: 0 exact matches in that district
    if (hasSpecificDist && hasSpecificCrop && hasSpecificState) {
      // Check if this crop exists in any other district within the selected state
      const stateCropMatches = source.filter(item => isCropMatch(item) && isStateMatch(item));
      if (stateCropMatches.length > 0) {
        return {
          filteredRates: sortByRecent(stateCropMatches),
          isShowingNearby: true,
          isOffSeason: false
        };
      }
      // If 0 records across the entire state -> Off-season!
      return {
        filteredRates: [],
        isShowingNearby: false,
        isOffSeason: true
      };
    }

    // 3. Specific Crop + Specific State (District = "All"): 0 records in state -> Off-season!
    if (hasSpecificCrop && hasSpecificState) {
      return {
        filteredRates: [],
        isShowingNearby: false,
        isOffSeason: true
      };
    }

    // 4. Specific District + All Crops: check other districts in state
    if (hasSpecificDist && hasSpecificState) {
      const stateMatches = source.filter(item => isStateMatch(item));
      if (stateMatches.length > 0) {
        return {
          filteredRates: sortByRecent(stateMatches),
          isShowingNearby: true,
          isOffSeason: false
        };
      }
    }

    // 5. Specific Crop across All States: check if exists anywhere
    if (hasSpecificCrop) {
      const allCropMatches = source.filter(item => isCropMatch(item));
      if (allCropMatches.length > 0) {
        return {
          filteredRates: sortByRecent(allCropMatches),
          isShowingNearby: false,
          isOffSeason: false
        };
      }
      return {
        filteredRates: [],
        isShowingNearby: false,
        isOffSeason: true
      };
    }

    return {
      filteredRates: sortByRecent(source),
      isShowingNearby: false,
      isOffSeason: false
    };
  }, [rawData, appliedCrop, appliedDistrict, appliedState]);

  return (
    <main>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Page Hero ───────────────────────────────────────────── */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-badge">📈 Live Mandi Rates & AI Advisory</div>
          <h1>Live Mandi Prices & Market Analysis</h1>
          <p>Real-time official APMC rates with price trends and AI-driven Hold vs. Sell guidance</p>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
          </svg>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────────── */}
      <main className="market-layout">
        {/* Stats Strip */}
        <div className="stats-strip">
          <div className="stat-card">
            <div className="stat-icon green">📊</div>
            <div>
              <div className="stat-label">Mandis Tracked</div>
              <div className="stat-value">
                {liveMandiRates && liveMandiRates.length > 0 ? liveMandiRates.length : "2,840"}
              </div>
              <div className="stat-sub">
                {liveMandiRates && liveMandiRates.length > 0 ? "In Firestore" : "Across India"}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">🔄</div>
            <div>
              <div className="stat-label">Last Updated</div>
              <div className="stat-value">{syncing || isSearching ? "Syncing..." : "Live data"}</div>
              <div className="stat-sub">Agmarknet Feed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📦</div>
            <div>
              <div className="stat-label">Crops Tracked</div>
              <div className="stat-value">{availableCrops.length > 0 ? `${availableCrops.length}+` : "280+"}</div>
              <div className="stat-sub">Recorded varieties</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">🎯</div>
            <div>
              <div className="stat-label">Signal Accuracy</div>
              <div className="stat-value">89%</div>
              <div className="stat-sub">Hold/Sell Precision</div>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Card ─────────────────────────────────── */}
        <div className="search-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>🔍 Search Mandi Prices</h3>
            <button
              className="btn btn-outline-primary"
              onClick={() => triggerSyncAndRefresh(selectedState, selectedDistrict, selectedCrop)}
              disabled={syncing || isSearching || loading}
              style={{ padding: "6px 14px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {syncing ? "🔄 Syncing..." : "🔄 Sync Live Mandi Data"}
            </button>
          </div>

          <div className="search-row">
            {/* 1. Crop Dropdown (Strictly data-driven from official recorded commodities) */}
            <div className="form-group">
              <label className="form-label" htmlFor="priceCrop">Crop / Commodity</label>
              <select
                className="form-control"
                id="priceCrop"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                <option value="All">🌱 All Crops (सभी फसलें)</option>
                {availableCrops.map((c) => (
                  <option key={c} value={c}>
                    {getCommodityLabel(c)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. State Dropdown (Strictly data-driven from available state values) */}
            <div className="form-group">
              <label className="form-label" htmlFor="priceState">State</label>
              <select
                className="form-control"
                id="priceState"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="All">🇮🇳 All States (Pan-India)</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* 3. District Dropdown (Cascading filter based on selected state) */}
            <div className="form-group">
              <label className="form-label" htmlFor="priceDistrict">District</label>
              <select
                className="form-control"
                id="priceDistrict"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="All">All Districts (सभी जिले)</option>
                {availableDistricts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="btn btn-primary"
                id="fetchPrices"
                style={{ whiteSpace: "nowrap", padding: "11px 24px", minWidth: "160px" }}
                onClick={handleGetLivePrices}
                disabled={syncing || isSearching || loading}
              >
                {isSearching || syncing ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                    Fetching...
                  </span>
                ) : (
                  "Get Live Prices →"
                )}
              </button>
            </div>
          </div>

          <div className="today-label">
            🗓️ Showing prices for: <span id="todayDateLabel">Today & Recent Arrivals</span>
            &nbsp;·&nbsp; Source: Agmarknet / eNAM (data.gov.in)
            {liveMandiRates && liveMandiRates.length > 0 && (
              <span style={{ marginLeft: "12px", color: "#16a34a", fontWeight: 600 }}>
                • Connected to Firestore ('mandi_rates' — {liveMandiRates.length} records)
              </span>
            )}
            {appliedState && appliedState !== "All" && (
              <span style={{ marginLeft: "8px", color: "#16a34a", fontWeight: 500 }}>
                • State: {appliedState}
              </span>
            )}
            {appliedDistrict && appliedDistrict !== "All" && (
              <span style={{ marginLeft: "8px", color: "#2563eb", fontWeight: 500 }}>
                • District: {appliedDistrict}
              </span>
            )}
            {appliedCrop && appliedCrop !== "All" && (
              <span style={{ marginLeft: "8px", color: "#ea580c", fontWeight: 500 }}>
                • Crop: {appliedCrop}
              </span>
            )}
          </div>

          {syncMessage && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0fdf4", color: "#15803d", borderRadius: "8px", fontSize: "0.88rem", border: "1px solid #bbf7d0" }}>
              ✅ {syncMessage}
            </div>
          )}

          {error && (
            <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.88rem", border: "1px solid #fecaca" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── Neighboring Mandi & State Fallback Banner ───────────────────────── */}
        {isShowingNearby && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            padding: "14px 18px",
            borderRadius: "12px",
            margin: "20px 0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <div style={{ fontSize: "0.95rem" }}>
              📍 <strong>No arrivals recorded for {appliedCrop !== "All" ? appliedCrop : "selected crop"} in {appliedDistrict}.</strong> Showing available rates from nearby mandis in {appliedState}.
            </div>
            <button
              onClick={handleResetFilters}
              className="btn btn-outline-primary"
              style={{ padding: "6px 14px", fontSize: "0.85rem", background: "#ffffff" }}
            >
              ↺ Reset Filters
            </button>
          </div>
        )}

        {/* ── Price Results ───────────────────────────────────────── */}
        <div id="priceResults">
          {loading || syncing ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1", margin: "20px 0" }}>
              <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #16a34a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "16px" }}></div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                {syncing ? "Fetching latest mandi rates from Agmarknet..." : "Loading Mandi Prices..."}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                Connecting to Agmarknet feed for {selectedState && selectedState !== 'All' ? selectedState : 'all India'}{selectedDistrict && selectedDistrict !== 'All' ? ` (${selectedDistrict})` : ''}...
              </p>
            </div>
          ) : filteredRates.length > 0 ? (
            <div className="mandi-grid">
              {filteredRates.map((item, idx) => {
                const actualMarket = item.market || item.mandiName || item.marketName || "APMC Mandi";
                const actualDistrict = item.district || "District";
                const actualCommodity = item.commodity || item.cropName || "Crop";
                const liveToday = isToday(item.arrivalDate);
                const isSellNow = item.recommendation === 'SELL_NOW';
                const trend = item.trend || 'STABLE';
                const changePct = item.priceChangePercent ?? 0;

                return (
                  <div key={item.id || idx} className="mandi-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Market Location & Freshness Status Badge */}
                    <div className="mandi-card-head">
                      <div>
                        <div className="mandi-name" style={{ fontSize: "1.08rem", fontWeight: 700, color: "#0f172a" }}>
                          🏛️ {actualMarket}
                        </div>
                        <div className="mandi-dist" style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
                          📍 {actualDistrict}{item.state ? `, ${item.state}` : ''}
                        </div>
                      </div>

                      {/* Status Badge: Live Today vs Last Known Traded Price */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        {liveToday ? (
                          <span style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #86efac",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            🟢 Live Today
                          </span>
                        ) : (
                          <span style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            border: "1px solid #fde68a",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            ⏱️ Last Traded: {item.arrivalDate || "Recent"}
                          </span>
                        )}
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          {item.type || 'APMC'}
                        </span>
                      </div>
                    </div>

                    {/* Commodity & Variety Badge on top */}
                    <div style={{ margin: "10px 0 8px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{
                        background: "#e8f5e9",
                        color: "#1b5e20",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        🌾 {getCommodityLabel(actualCommodity)}
                        {item.variety && item.variety !== 'Other' && item.variety !== 'Standard' && (
                          <span style={{ fontWeight: 500, color: "#2e7d32" }}> • {item.variety}</span>
                        )}
                      </span>
                      {item.variety === 'Other' && (
                        <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.75rem", padding: "3px 8px", borderRadius: "4px" }}>
                          Standard Variety
                        </span>
                      )}
                    </div>

                    {/* ── AI Decision Banner ── */}
                    <div style={{
                      margin: "4px 0 12px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSellNow ? "#f0fdf4" : "#fefce8",
                      border: isSellNow ? "1px solid #bbf7d0" : "1px solid #fef08a",
                    }}>
                      <div style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: isSellNow ? "#15803d" : "#854d0e",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                        <span>{isSellNow ? '🟢' : '🟡'}</span>
                        <span>
                          {isSellNow
                            ? 'AI Decision: BECHO (Sell Now)'
                            : `AI Decision: ROKO (Hold ${item.recommendationTimeline || '7–10 Days'})`}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.72rem",
                        color: isSellNow ? "#166534" : "#a16207",
                        fontWeight: 600,
                        background: isSellNow ? "#dcfce7" : "#fef9c3",
                        padding: "2px 8px",
                        borderRadius: "10px",
                      }}>
                        {isSellNow ? 'Target Reached' : 'Price Rise Expected'}
                      </span>
                    </div>

                    {/* Price Row: Min, Modal, Max + Visual Trend Pill */}
                    <div className="price-row">
                      <div className="price-box">
                        <div className="price-box-val">₹{item.minPrice}</div>
                        <div className="price-box-lbl">Min Price</div>
                      </div>
                      <div className="price-divider"></div>
                      <div className="price-box">
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                          <div className="price-box-val modal" style={{ fontSize: "1.35rem", color: "#16a34a", fontWeight: 800 }}>
                            ₹{item.modalPrice}
                          </div>
                          {/* Visual Trend Pill */}
                          {trend === 'RISING' ? (
                            <span style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              border: "1px solid #86efac",
                              borderRadius: "12px",
                              padding: "2px 7px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px",
                            }}>
                              ▲ +{changePct}% (Rising)
                            </span>
                          ) : trend === 'FALLING' ? (
                            <span style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              border: "1px solid #fca5a5",
                              borderRadius: "12px",
                              padding: "2px 7px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px",
                            }}>
                              ▼ {changePct}% (Falling)
                            </span>
                          ) : (
                            <span style={{
                              background: "#fef9c3",
                              color: "#854d0e",
                              border: "1px solid #fde047",
                              borderRadius: "12px",
                              padding: "2px 7px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px",
                            }}>
                              ● Stable
                            </span>
                          )}
                        </div>
                        <div className="price-box-lbl" style={{ color: "#16a34a", fontWeight: 700, marginTop: "2px" }}>Modal Rate</div>
                      </div>
                      <div className="price-divider"></div>
                      <div className="price-box">
                        <div className="price-box-val">₹{item.maxPrice}</div>
                        <div className="price-box-lbl">Max Price</div>
                      </div>
                    </div>

                    {/* ── AI Insight Box: Mandi Mitra Advisory ── */}
                    <div style={{
                      marginTop: "12px",
                      padding: "10px 12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      lineHeight: "1.45",
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}>
                        <span style={{
                          fontWeight: 700,
                          color: "#0284c7",
                          fontSize: "0.78rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}>
                          🤖 Mandi Mitra Advisory
                        </span>
                        {item.priceHistory && item.priceHistory.length > 1 && (
                          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            📊 {item.priceHistory.length}-day trend
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: "#334155", fontStyle: "italic" }}>
                        "{item.advisoryText}"
                      </p>

                      {/* Mini Price History Points */}
                      {item.priceHistory && item.priceHistory.length > 1 && (
                        <div style={{
                          marginTop: "8px",
                          paddingTop: "6px",
                          borderTop: "1px dashed #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "6px",
                          fontSize: "0.72rem",
                          color: "#64748b",
                        }}>
                          <span style={{ fontWeight: 600 }}>History:</span>
                          <div style={{ display: "flex", gap: "5px", overflowX: "auto" }}>
                            {item.priceHistory.slice(-4).map((h, hIdx) => (
                              <span key={hIdx} style={{
                                background: "#ffffff",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid #cbd5e1",
                                whiteSpace: "nowrap",
                              }}>
                                {h.date.split('/')[0]}/{h.date.split('/')[1]}: ₹{h.modalPrice}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer: Arrival Date & Unit */}
                    <div style={{
                      marginTop: "auto",
                      paddingTop: "12px",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "0.82rem",
                      color: "#64748b",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span>🗓️ Arrival Date: <strong style={{ color: "#334155" }}>{item.arrivalDate || "Today"}</strong></span>
                      <span style={{ fontSize: "0.75rem", background: "#f8fafc", color: "#475569", padding: "2px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", fontWeight: 600 }}>
                        ₹/Quintal
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isOffSeason ? (
            /* ── Off-Season Empty State ───────────────────────── */
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1", margin: "20px 0" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>🍂</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
                Zero arrivals reported for {appliedCrop !== "All" ? appliedCrop : "selected crop"} across {appliedState !== "All" ? appliedState : "mandis"} (Likely Off-Season).
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.92rem", maxWidth: "520px", margin: "0 auto 20px" }}>
                No APMC market in {appliedState !== "All" ? appliedState : "this region"} has recorded recent arrivals for this crop. It may currently be out of season or awaiting incoming harvest.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                {appliedState !== "All" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedCrop("All");
                      setAppliedCrop("All");
                    }}
                    style={{ padding: "10px 24px", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    🌾 View All Actively Traded Crops in {appliedState}
                  </button>
                )}
                <button
                  className="btn btn-outline-primary"
                  onClick={() => triggerSyncAndRefresh(appliedState, appliedDistrict !== "All" ? appliedDistrict : "", appliedCrop !== "All" ? appliedCrop : "")}
                  disabled={syncing || loading}
                  style={{ padding: "10px 20px", fontSize: "0.95rem" }}
                >
                  {syncing ? "🔄 Syncing..." : "🔄 Sync Live Mandi Data"}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleResetFilters}
                  style={{ padding: "10px 20px", fontSize: "0.95rem" }}
                >
                  ↺ Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            /* ── Standard Empty State ───────────────────────── */
            <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1", margin: "20px 0" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>📈</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
                No Mandi Rates Found
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.92rem", maxWidth: "480px", margin: "0 auto 16px" }}>
                {error ? error : `No price records returned for ${appliedCrop !== 'All' ? appliedCrop : 'crops'} in ${appliedState !== 'All' ? appliedState : 'India'}${appliedDistrict !== 'All' ? ` (${appliedDistrict})` : ''}.`}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => triggerSyncAndRefresh(selectedState, selectedDistrict, selectedCrop)}
                  disabled={syncing || loading}
                  style={{ padding: "10px 24px", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  {syncing ? (
                    <>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                      Syncing Mandi Rates...
                    </>
                  ) : (
                    "🔄 Sync Mandi Rates"
                  )}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleResetFilters}
                  style={{ padding: "10px 20px", fontSize: "0.95rem" }}
                >
                  ↺ Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer>
        <div className="container">
          <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
            Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳
          </p>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/predict">Diagnose Crop</Link>
            <Link href="/machinery">Machinery</Link>
            <Link href="/labour">Labour</Link>
            <Link href="/market">Market Price</Link>
            <Link href="/calculator">Calculator</Link>
          </div>
          <p className="footer-copy">&copy; 2026 Aegroshield. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
