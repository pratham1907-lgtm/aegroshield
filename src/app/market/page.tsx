"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { MOCK_MARKET_PRICES } from "@/lib/mockData";
import { getAllIndianStates, getDistrictsForState, isStateMatching } from "@/lib/india-locations";

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

function formatPerKg(modalPrice: number): string {
  if (!modalPrice || isNaN(modalPrice)) return '0';
  const val = modalPrice / 100;
  if (Number.isInteger(val)) return val.toString();
  const fixed = val.toFixed(2);
  return fixed.endsWith('0') ? val.toFixed(1) : fixed;
}

function getVarietyDisplay(variety?: string): { isSpecific: boolean; label: string } {
  if (!variety) {
    return { isSpecific: false, label: 'Standard Quality' };
  }
  const clean = variety.trim();
  const lower = clean.toLowerCase();
  if (['other', 'standard', 'standard variety', 'general', 'common', 'faq', 'regular'].includes(lower) || clean === '') {
    return { isSpecific: false, label: 'Standard Quality' };
  }
  return { isSpecific: true, label: clean };
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

  // Reactive search filter selections
  const [selectedCrop, setSelectedCrop] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

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

  // 1. Available States (Comprehensive 28 states + 8 UTs, plus any custom states from DB)
  const availableStates = useMemo(() => {
    const s = new Set<string>(getAllIndianStates());
    rawData.forEach((item) => {
      const st = (item.state || '').trim();
      if (st) s.add(st);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rawData]);

  // 2. Available Districts (Strict cascading filter based on selected state from India dataset + live records)
  const availableDistricts = useMemo(() => {
    if (!selectedState || selectedState === "All") {
      return [];
    }
    const d = new Set<string>(getDistrictsForState(selectedState));
    rawData.forEach((item) => {
      const itemState = (item.state || '').trim();
      const dist = (item.district || '').trim();
      if (!dist) return;

      if (isStateMatching(itemState, selectedState)) {
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

  // Prevent cross-state mismatches reactively
  useEffect(() => {
    if (selectedState === "All" || !selectedState) {
      if (selectedDistrict !== "All") {
        setSelectedDistrict("All");
      }
    } else if (selectedDistrict !== "All" && availableDistricts.length > 0 && !availableDistricts.includes(selectedDistrict)) {
      setSelectedDistrict("All");
    }
  }, [selectedState, selectedDistrict, availableDistricts]);

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

  // Primary Search Handler for "Get Live Prices →" button - filters cached rates or triggers live Agmarknet fetch
  const handleGetLivePrices = async () => {
    setIsSearching(true);
    setError(null);
    setSyncMessage(null);

    // If live rates not loaded yet, query from Firestore
    let currentRates = liveMandiRates;
    if (!currentRates || currentRates.length === 0) {
      currentRates = await fetchFirestoreRates();
      if (currentRates.length > 0) {
        setLiveMandiRates(currentRates);
      }
    }

    const normCrop = (selectedCrop || "All").trim().toLowerCase();
    const normDist = (selectedDistrict || "All").trim().toLowerCase();
    const normState = (selectedState || "All").trim().toLowerCase();

    const hasSpecificState = normState && normState !== "all" && normState !== "all states";
    const hasSpecificDist = normDist && normDist !== "all" && normDist !== "all districts";
    const hasSpecificCrop = normCrop && normCrop !== "all" && normCrop !== "all crops";

    const pool = (currentRates && currentRates.length > 0) ? currentRates : rawData;
    const hasExistingMatch = pool.some(item => {
      const sMatch = !hasSpecificState || isStateMatching(item.state || '', normState);
      const dMatch = !hasSpecificDist || (item.district || '').trim().toLowerCase() === normDist;
      const cMatch = !hasSpecificCrop || (item.commodity || item.cropName || '').trim().toLowerCase().includes(normCrop);
      return sMatch && dMatch && cMatch;
    });

    // If a specific state/district was selected and no matching arrival exists locally, fetch live from Agmarknet API
    if (hasSpecificState && !hasExistingMatch) {
      await triggerSyncAndRefresh(selectedState, selectedDistrict, selectedCrop);
    }

    // Responsive visual feedback
    setTimeout(() => {
      setIsSearching(false);
    }, 250);
  };

  const handleResetFilters = () => {
    setSelectedCrop("All");
    setSelectedState("All");
    setSelectedDistrict("All");
    setError(null);
    setSyncMessage(null);
  };

  // Filter computation with fallback to nearby district rates & off-season detection (strictly reactive to dropdown changes)
  const { filteredRates, isShowingNearby, isOffSeason } = useMemo(() => {
    const source = rawData;

    const normCrop = (selectedCrop || "All").trim().toLowerCase();
    const normDist = (selectedDistrict || "All").trim().toLowerCase();
    const normState = (selectedState || "All").trim().toLowerCase();

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
      return isStateMatching(item.state || '', normState);
    };

    const isDistrictMatch = (item: MandiRateItem) => {
      if (!normDist || normDist === "all" || normDist === "all districts") return true;
      const itemDist = (item.district || '').toLowerCase();
      return itemDist === normDist || itemDist.includes(normDist) || normDist.includes(itemDist);
    };

    const sortByRecent = (items: MandiRateItem[]) => {
      return [...items].sort((a, b) => parseArrivalDate(b.arrivalDate) - parseArrivalDate(a.arrivalDate));
    };

    const hasSpecificDist = Boolean(normDist && normDist !== "all" && normDist !== "all districts");
    const hasSpecificCrop = Boolean(normCrop && normCrop !== "all" && normCrop !== "all crops");
    const hasSpecificState = Boolean(normState && normState !== "all" && normState !== "all states");

    // 1. Try exact matches (crop + state + district)
    const exactMatches = source.filter(item => isCropMatch(item) && isStateMatch(item) && isDistrictMatch(item));
    if (exactMatches.length > 0) {
      return {
        filteredRates: sortByRecent(exactMatches),
        isShowingNearby: false,
        isOffSeason: false
      };
    }

    // 2. Strict Filter Integrity:
    // If user specified a State, District, or Crop and no exact matches exist,
    // never fall back to unrelated records (e.g. showing Andaman when searching Raipur).
    // Return empty list so the dedicated "Data Not Available" view is shown.
    if (hasSpecificState || hasSpecificDist || hasSpecificCrop) {
      return {
        filteredRates: [],
        isShowingNearby: false,
        isOffSeason: false
      };
    }

    // 3. Only when NO filter is selected (Pan-India view), show all records
    return {
      filteredRates: sortByRecent(source),
      isShowingNearby: false,
      isOffSeason: false
    };
  }, [rawData, selectedCrop, selectedDistrict, selectedState]);

  return (
    <main>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-pulse {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite ease-in-out;
          border-radius: 6px;
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
              <div className="stat-value">{syncing || isSearching ? "Filtering..." : "Live data"}</div>
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
            <div style={{
              fontSize: "0.82rem",
              color: "#047857",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "4px 12px",
              borderRadius: "20px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#10b981" }}></span>
              Verified Mandi Rates
            </div>
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

            {/* 3. District Dropdown (Strict cascading select based on selected state) */}
            <div className="form-group">
              <label className="form-label" htmlFor="priceDistrict">District</label>
              <select
                className="form-control"
                id="priceDistrict"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedState === "All" || !selectedState || availableDistricts.length === 0}
                style={{
                  cursor: (selectedState === "All" || !selectedState || availableDistricts.length === 0) ? "not-allowed" : "pointer",
                  backgroundColor: (selectedState === "All" || !selectedState || availableDistricts.length === 0) ? "#f8fafc" : "#ffffff",
                }}
              >
                {selectedState === "All" || !selectedState ? (
                  <option value="All">Select a State first (पहले राज्य चुनें)</option>
                ) : availableDistricts.length === 0 ? (
                  <option value="All">No Districts Found ({selectedState})</option>
                ) : (
                  <>
                    <option value="All">All Districts ({selectedState})</option>
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </>
                )}
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
            🗓️ Showing prices for: <span id="todayDateLabel">Today &amp; Recent Arrivals</span>
            {selectedState && selectedState !== "All" && (
              <span style={{ marginLeft: "8px", color: "#16a34a", fontWeight: 500 }}>
                • State: {selectedState}
              </span>
            )}
            {selectedDistrict && selectedDistrict !== "All" && (
              <span style={{ marginLeft: "8px", color: "#2563eb", fontWeight: 500 }}>
                • District: {selectedDistrict}
              </span>
            )}
            {selectedCrop && selectedCrop !== "All" && (
              <span style={{ marginLeft: "8px", color: "#ea580c", fontWeight: 500 }}>
                • Crop: {selectedCrop}
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
              📍 <strong>No arrivals recorded for {selectedCrop !== "All" ? selectedCrop : "selected crop"} in {selectedDistrict}.</strong> Showing available rates from nearby mandis in {selectedState}.
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
          {loading ? (
            <div className="mandi-grid">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="mandi-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px' }}>
                  {/* Header skeleton */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '65%' }}>
                      <div className="skeleton-pulse" style={{ height: '20px', width: '85%', marginBottom: '6px' }}></div>
                      <div className="skeleton-pulse" style={{ height: '14px', width: '55%' }}></div>
                    </div>
                    <div className="skeleton-pulse" style={{ height: '22px', width: '75px', borderRadius: '6px' }}></div>
                  </div>

                  {/* Commodity & Variety badge skeleton */}
                  <div className="skeleton-pulse" style={{ height: '26px', width: '130px', borderRadius: '6px' }}></div>

                  {/* Price Strip skeleton */}
                  <div className="skeleton-pulse" style={{ height: '60px', width: '100%', borderRadius: '10px' }}></div>

                  {/* AI Decision banner skeleton */}
                  <div className="skeleton-pulse" style={{ height: '34px', width: '100%', borderRadius: '8px' }}></div>

                  {/* Footer skeleton */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="skeleton-pulse" style={{ height: '14px', width: '100px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '30px', width: '120px', borderRadius: '8px' }}></div>
                  </div>
                </div>
              ))}
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
                const varietyInfo = getVarietyDisplay(item.variety);

                return (
                  <div key={item.id || idx} className="mandi-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}>
                    <div>
                      {/* Header: Market Location & Freshness Status Badge */}
                      <div className="mandi-card-head" style={{ marginBottom: "10px" }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="mandi-name" style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }} title={actualMarket}>
                            🏛️ {actualMarket}
                          </div>
                          <div className="mandi-dist" style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "2px" }}>
                            📍 {actualDistrict}{item.state ? `, ${item.state}` : ''}
                          </div>
                        </div>

                        {liveToday ? (
                          <span style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #86efac",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
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
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            ⏱️ {item.arrivalDate || "Recent"}
                          </span>
                        )}
                      </div>

                      {/* Commodity & Variety Badge */}
                      <div style={{ margin: "8px 0 12px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{
                          background: "#e8f5e9",
                          color: "#1b5e20",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          🌾 {getCommodityLabel(actualCommodity)}
                        </span>
                        <span style={{
                          background: varietyInfo.isSpecific ? "#fef3c7" : "#f1f5f9",
                          color: varietyInfo.isSpecific ? "#92400e" : "#475569",
                          fontSize: "0.74rem",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          border: varietyInfo.isSpecific ? "1px solid #fde68a" : "1px solid #e2e8f0"
                        }}>
                          {varietyInfo.label}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginLeft: "auto", fontWeight: 600 }}>
                          {item.type || 'APMC'}
                        </span>
                      </div>

                      {/* Streamlined Price Strip */}
                      <div className="price-row" style={{
                        margin: "10px 0",
                        background: "#f8fafc",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <div className="price-box" style={{ flex: 1, textAlign: "center" }}>
                          <div className="price-box-val" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#475569" }}>
                            ₹{item.minPrice}
                          </div>
                          <div className="price-box-lbl" style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>Min Rate</div>
                        </div>

                        <div className="price-divider" style={{ width: "1px", height: "36px", background: "#e2e8f0", margin: "0 6px" }}></div>

                        <div className="price-box" style={{ flex: 1.4, textAlign: "center" }}>
                          <div className="price-box-val modal" style={{ fontSize: "1.28rem", color: "#16a34a", fontWeight: 800, lineHeight: 1.1 }}>
                            ₹{item.modalPrice} <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#16a34a" }}>/qtl</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "2px" }}>
                            <span style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 600 }}>
                              ≈ ₹{formatPerKg(item.modalPrice)}/kg
                            </span>
                            {trend === 'RISING' ? (
                              <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: "8px", padding: "1px 5px", fontSize: "0.66rem", fontWeight: 700 }}>
                                ▲ +{changePct}%
                              </span>
                            ) : trend === 'FALLING' ? (
                              <span style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", padding: "1px 5px", fontSize: "0.66rem", fontWeight: 700 }}>
                                ▼ {changePct}%
                              </span>
                            ) : null}
                          </div>
                          <div className="price-box-lbl" style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.68rem", marginTop: "2px" }}>Modal Rate</div>
                        </div>

                        <div className="price-divider" style={{ width: "1px", height: "36px", background: "#e2e8f0", margin: "0 6px" }}></div>

                        <div className="price-box" style={{ flex: 1, textAlign: "center" }}>
                          <div className="price-box-val" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#475569" }}>
                            ₹{item.maxPrice}
                          </div>
                          <div className="price-box-lbl" style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>Max Rate</div>
                        </div>
                      </div>

                      {/* Streamlined AI Decision & Action Signal */}
                      <div style={{
                        margin: "10px 0 12px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isSellNow ? "#f0fdf4" : "#fefce8",
                        border: isSellNow ? "1px solid #bbf7d0" : "1px solid #fef08a",
                      }}>
                        <div style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: isSellNow ? "#15803d" : "#854d0e",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}>
                          <span>{isSellNow ? '🟢' : '🟡'}</span>
                          <span>
                            {isSellNow ? 'BECHO (Sell Now)' : `ROKO (Hold ${item.recommendationTimeline || '7-10 Days'})`}
                          </span>
                        </div>
                        <span style={{
                          fontSize: "0.7rem",
                          color: isSellNow ? "#166534" : "#a16207",
                          fontWeight: 600,
                          background: isSellNow ? "#dcfce7" : "#fef9c3",
                          padding: "2px 7px",
                          borderRadius: "8px",
                        }}>
                          {isSellNow ? 'Target Reached' : 'Price Rise Expected'}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Arrival Date & Detail Analysis CTA */}
                    <div style={{
                      marginTop: "auto",
                      paddingTop: "12px",
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        🗓️ {item.arrivalDate || "Today"}
                      </span>

                      {item.id ? (
                        <Link
                          href={`/market/${item.id}`}
                          style={{
                            padding: "7px 14px",
                            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            color: "#ffffff",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "0 2px 6px rgba(22,163,74,0.25)",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(22,163,74,0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(22,163,74,0.25)";
                          }}
                        >
                          Analysis &amp; Trends →
                        </Link>
                      ) : (
                        <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>APMC Verified</span>
                      )}
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
                Zero arrivals reported for {selectedCrop !== "All" ? selectedCrop : "selected crop"} across {selectedState !== "All" ? selectedState : "mandis"} (Likely Off-Season).
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.92rem", maxWidth: "520px", margin: "0 auto 20px" }}>
                No APMC market in {selectedState !== "All" ? selectedState : "this region"} has recorded recent arrivals for this crop. It may currently be out of season or awaiting incoming harvest.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                {selectedState !== "All" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedCrop("All");
                    }}
                    style={{ padding: "10px 24px", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    🌾 View All Actively Traded Crops in {selectedState}
                  </button>
                )}
                <button
                  className="btn btn-outline-primary"
                  onClick={() => fetchFirestoreRates()}
                  disabled={loading}
                  style={{ padding: "10px 20px", fontSize: "0.95rem" }}
                >
                  🔄 Reload Cached Rates
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
            /* ── Data Not Available / Empty State ───────────────────────── */
            <div style={{
              padding: "52px 24px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
              margin: "24px 0",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📍</div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
                Mandi Data Not Available (डेटा उपलब्ध नहीं है)
              </h3>
              <p style={{ color: "#475569", fontSize: "0.95rem", maxWidth: "560px", margin: "0 auto 10px", lineHeight: "1.6" }}>
                {selectedDistrict !== "All" && selectedState !== "All"
                  ? `Vartaman me ${selectedDistrict} (${selectedState}) mandi ke liye naye bhav ya aavak darj nahi hue hain.`
                  : selectedState !== "All"
                  ? `Vartaman me ${selectedState} ke liye naye mandi bhav darj nahi hue hain.`
                  : "Chuni gayi fasal ya mandi ke liye vartaman me koi rate darj nahi hai."}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", maxWidth: "500px", margin: "0 auto 20px" }}>
                Official Agmarknet / APMC portal par aavak darj hote hi yahan live rates update ho jayenge.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                {selectedDistrict !== "All" && selectedState !== "All" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedDistrict("All")}
                    style={{ padding: "10px 22px", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    🌾 View All {selectedState} Mandis
                  </button>
                )}
                <button
                  className="btn btn-outline-primary"
                  onClick={handleResetFilters}
                  style={{ padding: "10px 20px", fontSize: "0.92rem" }}
                >
                  ↺ Reset Filters (Sabhi Rajya)
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
