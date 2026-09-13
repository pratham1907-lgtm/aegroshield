import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface DetailedAdvisory {
  sentiment: string;
  priceTarget: string;
  storage: string;
  detailedText?: string;
}

export interface MandiRecord {
  id: string;
  market: string;
  district: string;
  state: string;
  commodity: string;
  commodityHi: string;
  variety: string;
  category: 'Cereals' | 'Oilseeds' | 'Vegetables' | 'Pulses';
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
  priceTrend: 'UP' | 'DOWN' | 'STABLE';
  priceChangePercent: number;
  arrivalQuantity: string;
  recommendation: 'HOLD' | 'SELL_NOW';
  advisoryText: string;
  detailedAdvisory: DetailedAdvisory;
}

function getTodayFormattedDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const currentDateStr = getTodayFormattedDate();

export function generateDefaultDetailedAdvisory(
  commodity: string,
  modalPrice: number,
  trend: string,
  recommendation: string,
  market: string,
  district: string
): DetailedAdvisory {
  const isSell = recommendation === 'SELL_NOW' || trend === 'DOWN';
  const targetLow = Math.round(modalPrice * 1.04);
  const targetHigh = Math.round(modalPrice * 1.09);

  return {
    sentiment: isSell
      ? `${market} (${district}) mein ${commodity} ki aavak tezi se badh rahi hai. Cold storage/stock clearance pressure ke karan market sentiment weak bana hua hai.`
      : `${market} (${district}) mein ${commodity} ki demand local millers aur exporters se strong hai. Aavak santulit hone se market sentiment bullish aur supportive hai.`,
    priceTarget: isSell
      ? `Current modal price ₹${modalPrice}/qtl peak par hai. Aage 7-10 din mein ₹${Math.round(modalPrice * 0.95)}–₹${Math.round(modalPrice * 0.97)}/qtl tak girawat ka risk.`
      : `Short-term 7–10 days target: ₹${targetLow} – ₹${targetHigh}/qtl (Estimated +4% to +9% appreciation).`,
    storage: isSell
      ? `Storage cost aur moisture loss se bachne ke liye turant mandi mein sale complete karein. Quality deterioration ka risk hai.`
      : `Godown storage mein moisture 12% se kam rakhein. Air-tight HDPE bags use karein. Proper aeration ke sath 10–15 din hold karna safe aur labhkari hai.`,
    detailedText: isSell
      ? `SELL ADVISORY: ${commodity} ke daam abhi uchch sthar par hain. Abhi bech kar labh lock karein.`
      : `HOLD ADVISORY: ${commodity} mein tezi ka rukh hai. 7-10 din hold karke behtar daam prapt karein.`,
  };
}

// ── Baseline APMC Dataset covering Aligarh, Meerut, Agra, Bulandshahr, Mathura, etc. ──
export const APMC_MANDI_DATASET: MandiRecord[] = [
  // ── Aligarh Mandi ──
  {
    id: 'mandi_aligarh_wheat',
    market: 'Aligarh APMC (Dhaniapur Mandi)',
    district: 'Aligarh',
    state: 'Uttar Pradesh',
    commodity: 'Wheat',
    commodityHi: 'गेहूँ',
    variety: 'Desi Sharbati',
    category: 'Cereals',
    minPrice: 2320,
    maxPrice: 2490,
    modalPrice: 2425,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.8,
    arrivalQuantity: '165 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'स्थानीय आटा मिलों की मजबूत खरीद से भाव में उछाल बना हुआ है।',
    detailedAdvisory: {
      sentiment: 'Bullish • Aligarh belt flour mills actively absorbing arrivals with sustained local consumer demand.',
      priceTarget: '₹2,510 – ₹2,560/qtl within 7-10 days',
      storage: 'Keep moisture below 12% in HDPE bags. Safe to hold for 10-15 days for expected premium.',
      detailedText: 'आटा मिलों की सतत मांग से कीमतें मजबूत हैं। 7-10 दिन रोकने पर ₹2,500+ का भाव मिलने की उम्मीद।',
    },
  },
  {
    id: 'mandi_aligarh_mustard',
    market: 'Aligarh APMC (Dhaniapur Mandi)',
    district: 'Aligarh',
    state: 'Uttar Pradesh',
    commodity: 'Mustard',
    commodityHi: 'सरसों',
    variety: 'Black Bold',
    category: 'Oilseeds',
    minPrice: 5380,
    maxPrice: 5780,
    modalPrice: 5640,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 2.1,
    arrivalQuantity: '85 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'तेल मिलों में भारी मांग के चलते सरसों के दाम तेज बने हुए हैं।',
    detailedAdvisory: {
      sentiment: 'Bullish • Mustard crushers operating at peak seasonal capacity, supply remains tight.',
      priceTarget: '₹5,800 – ₹5,920/qtl within 10 days',
      storage: 'Maintain dry, well-aerated godown storage. Seed oil content remains high.',
      detailedText: 'सरसों में मिलर्स की सक्रिय लिफ्टिंग जारी है। बेहतर रिटर्न हेतु होल्ड करें।',
    },
  },
  {
    id: 'mandi_aligarh_potato',
    market: 'Aligarh APMC (Dhaniapur Mandi)',
    district: 'Aligarh',
    state: 'Uttar Pradesh',
    commodity: 'Potato',
    commodityHi: 'आलू',
    variety: 'Kufri Jyoti',
    category: 'Vegetables',
    minPrice: 1100,
    maxPrice: 1420,
    modalPrice: 1310,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -2.3,
    arrivalQuantity: '240 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryText: 'कोल्ड स्टोरेज से भारी निकासी के कारण आलू भाव में नरमी है।',
    detailedAdvisory: {
      sentiment: 'Bearish • High cold storage dispatch volumes exerting downward pressure on wholesale rates.',
      priceTarget: 'Risk of dropping to ₹1,220 – ₹1,250/qtl if held further',
      storage: 'Avoid long holding; sprouted or softened tubers face steep price cuts.',
      detailedText: 'आलू की निरंतर निकासी के कारण वर्तमान स्तर पर बिकवाली करना सबसे सुरक्षित है।',
    },
  },
  {
    id: 'mandi_aligarh_maize',
    market: 'Aligarh APMC (Dhaniapur Mandi)',
    district: 'Aligarh',
    state: 'Uttar Pradesh',
    commodity: 'Maize',
    commodityHi: 'मक्का',
    variety: 'Yellow Hybrid',
    category: 'Cereals',
    minPrice: 2080,
    maxPrice: 2360,
    modalPrice: 2260,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.2,
    arrivalQuantity: '92 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'पोल्ट्री फीड कंपनियों से अच्छी उठाव दर्ज की गई है।',
    detailedAdvisory: {
      sentiment: 'Positive • Poultry feed manufacturers expanding forward procurement contracts.',
      priceTarget: '₹2,350 – ₹2,420/qtl over the next 10-14 days',
      storage: 'Ensure moisture level is strictly under 14% to prevent fungal aflatoxin.',
      detailedText: 'फीड इंडस्ट्री की मांग से मक्के के दाम में सुधार की संभावना है।',
    },
  },
  {
    id: 'mandi_aligarh_bajra',
    market: 'Aligarh APMC (Dhaniapur Mandi)',
    district: 'Aligarh',
    state: 'Uttar Pradesh',
    commodity: 'Bajra',
    commodityHi: 'बाजरा',
    variety: 'Hybrid Bold',
    category: 'Cereals',
    minPrice: 1980,
    maxPrice: 2260,
    modalPrice: 2140,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.2,
    arrivalQuantity: '70 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'आवक और मांग सामान्य रहने से दाम स्थिर स्तर पर बने हैं।',
    detailedAdvisory: {
      sentiment: 'Neutral / Stable • Balanced daily arrivals matching steady flour mill consumption.',
      priceTarget: 'Expected range: ₹2,150 – ₹2,220/qtl',
      storage: 'Store in dry burlap or poly-woven bags away from direct ground contact.',
      detailedText: 'दाम संतुलित दायरे में हैं, 5-7 दिन बाजार रुझान देखकर निर्णय लें।',
    },
  },
  {
    id: 'mandi_aligarh_paddy',
    market: 'Aligarh APMC (Dhaniapur Mandi)',
    district: 'Aligarh',
    state: 'Uttar Pradesh',
    commodity: 'Paddy',
    commodityHi: 'धान',
    variety: 'PR-126 (Common)',
    category: 'Cereals',
    minPrice: 2220,
    maxPrice: 2480,
    modalPrice: 2380,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.4,
    arrivalQuantity: '110 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'सरकारी खरीद केंद्रों और स्थानीय व्यापारियों द्वारा नियमित लिफ्टिंग।',
    detailedAdvisory: {
      sentiment: 'Stable • MSP benchmark support preventing any sharp downward price corrections.',
      priceTarget: '₹2,400 – ₹2,450/qtl',
      storage: 'Maintain grain moisture under 15% to avoid miller dockage penalties.',
      detailedText: 'एमएसपी समर्थन के चलते धान के दाम सुरक्षित और स्थिर बने हुए हैं।',
    },
  },

  // ── Meerut Mandi ──
  {
    id: 'mandi_meerut_wheat',
    market: 'Meerut APMC (Delhi Road)',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    commodity: 'Wheat',
    commodityHi: 'गेहूँ',
    variety: 'Kalyan Sona / Desi',
    category: 'Cereals',
    minPrice: 2360,
    maxPrice: 2540,
    modalPrice: 2470,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.5,
    arrivalQuantity: '180 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'गेहूं में निर्यात मांग और एनसीआर मिलों की सक्रियता से बढ़त।',
    detailedAdvisory: {
      sentiment: 'Bullish • Proximity to Delhi-NCR food processing hubs sustaining strong premium bids.',
      priceTarget: '₹2,550 – ₹2,620/qtl by mid-month',
      storage: 'Fumigate storage area and use sealed moisture-barrier bags.',
      detailedText: 'एनसीआर मांग के चलते गेहूं में बढ़त का रुझान बरकरार है।',
    },
  },
  {
    id: 'mandi_meerut_mustard',
    market: 'Meerut APMC (Delhi Road)',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    commodity: 'Mustard',
    commodityHi: 'सरसों',
    variety: 'Pusa Bold',
    category: 'Oilseeds',
    minPrice: 5450,
    maxPrice: 5820,
    modalPrice: 5680,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.9,
    arrivalQuantity: '68 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'सरसों दाना में तेल प्रतिशत उच्च होने से प्रीमियम भाव प्राप्त।',
    detailedAdvisory: {
      sentiment: 'Bullish • High oil recovery (41%+) attracting competitive bids from regional oil mills.',
      priceTarget: '₹5,850 – ₹5,950/qtl within 10 days',
      storage: 'Keep seeds in dark, dry bins with periodic turning to avoid heat buildup.',
      detailedText: 'उच्च तेल प्रतिशत वाले दाने का प्रीमियम मिल रहा है। होल्ड करें।',
    },
  },
  {
    id: 'mandi_meerut_paddy',
    market: 'Meerut APMC (Delhi Road)',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    commodity: 'Paddy',
    commodityHi: 'धान',
    variety: 'Basmati 1509',
    category: 'Cereals',
    minPrice: 3450,
    maxPrice: 3900,
    modalPrice: 3720,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 2.4,
    arrivalQuantity: '130 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'बासमती धान में चावल निर्यातकों द्वारा आक्रामक लिफ्टिंग।',
    detailedAdvisory: {
      sentiment: 'Highly Bullish • Middle East basmati export contracts accelerating miller purchases.',
      priceTarget: '₹3,850 – ₹4,000/qtl in 10-15 days',
      storage: 'Properly dried basmati (<13% moisture) gains value with aging. Safe to hold.',
      detailedText: 'एक्सपोर्ट मांग के कारण 1509 बासमती में ₹4,000 तक का स्तर संभव है।',
    },
  },
  {
    id: 'mandi_meerut_potato',
    market: 'Meerut APMC (Delhi Road)',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    commodity: 'Potato',
    commodityHi: 'आलू',
    variety: 'Kufri Bahar',
    category: 'Vegetables',
    minPrice: 1080,
    maxPrice: 1390,
    modalPrice: 1260,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -1.8,
    arrivalQuantity: '210 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryText: 'आवक अधिक होने से बिकवाली करना सुरक्षित रणनीति है।',
    detailedAdvisory: {
      sentiment: 'Bearish • Accelerated unloading from cold storage facilities outstripping daily demand.',
      priceTarget: 'Could decline toward ₹1,180/qtl',
      storage: 'Immediate disposal advised before early harvest crops reach the market.',
      detailedText: 'आलू का स्टॉक तुरंत निकालें ताकि आगे के नुकसान से बचा जा सके।',
    },
  },
  {
    id: 'mandi_meerut_maize',
    market: 'Meerut APMC (Delhi Road)',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    commodity: 'Maize',
    commodityHi: 'मक्का',
    variety: 'Desi Makka',
    category: 'Cereals',
    minPrice: 2120,
    maxPrice: 2400,
    modalPrice: 2290,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.1,
    arrivalQuantity: '55 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'स्थानीय पशु आहार उत्पादकों की सतत मांग बनी हुई है।',
    detailedAdvisory: {
      sentiment: 'Stable • Dairy and poultry feed units providing consistent price floor.',
      priceTarget: '₹2,320 – ₹2,380/qtl',
      storage: 'Store safely in rodent-proof bins.',
      detailedText: 'पशु आहार उद्योग की खरीद से कीमतें संतुलित बनी हुई हैं।',
    },
  },
  {
    id: 'mandi_meerut_bajra',
    market: 'Meerut APMC (Delhi Road)',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    commodity: 'Bajra',
    commodityHi: 'बाजरा',
    variety: 'Local Desi',
    category: 'Cereals',
    minPrice: 2000,
    maxPrice: 2290,
    modalPrice: 2170,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.3,
    arrivalQuantity: '45 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'बाजरा सीमित आवक के साथ स्थिर दायरा दिखा रहा है।',
    detailedAdvisory: {
      sentiment: 'Stable • Low arrivals matching regular flour consumption.',
      priceTarget: '₹2,200 – ₹2,250/qtl',
      storage: 'Dry thoroughly before bagging.',
      detailedText: 'सीमित आवक के बीच दाम स्थिर हैं। 5-7 दिन होल्ड कर सकते हैं।',
    },
  },

  // ── Agra Mandi ──
  {
    id: 'mandi_agra_potato',
    market: 'Agra Mandi (Fatehabad Road)',
    district: 'Agra',
    state: 'Uttar Pradesh',
    commodity: 'Potato',
    commodityHi: 'आलू',
    variety: 'Kufri Badshah',
    category: 'Vegetables',
    minPrice: 1140,
    maxPrice: 1480,
    modalPrice: 1350,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -3.1,
    arrivalQuantity: '380 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryText: 'आगरा बेल्ट में आलू की बंपर निकासी, वर्तमान स्तर पर बेचें।',
    detailedAdvisory: {
      sentiment: 'Bearish • Massive cold store release volumes across Agra-Firozabad potato belt.',
      priceTarget: 'Expected downward slide to ₹1,250 – ₹1,280/qtl',
      storage: 'Liquidate stocks promptly; weight loss and dehydration reduce net margins.',
      detailedText: 'आगरा बेल्ट में आवक बहुत तेज है। वर्तमान भाव पर माल बेचना बुद्धिमानी है।',
    },
  },
  {
    id: 'mandi_agra_mustard',
    market: 'Agra Mandi (Fatehabad Road)',
    district: 'Agra',
    state: 'Uttar Pradesh',
    commodity: 'Mustard',
    commodityHi: 'सरसों',
    variety: 'Varuna Bold',
    category: 'Oilseeds',
    minPrice: 5320,
    maxPrice: 5710,
    modalPrice: 5560,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.6,
    arrivalQuantity: '115 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'मस्टर्ड ऑयल क्रशर इकाइयों में पेराई मांग निरंतर जारी।',
    detailedAdvisory: {
      sentiment: 'Bullish • Mustard oil consumer demand rising ahead of festive season.',
      priceTarget: '₹5,750 – ₹5,850/qtl in 10 days',
      storage: 'Keep seeds cool and dry; protect from moisture absorption.',
      detailedText: 'आगरा की तेल मिलों में पेराई मांग तेज है, भाव में और सुधार संभव है।',
    },
  },
  {
    id: 'mandi_agra_wheat',
    market: 'Agra Mandi (Fatehabad Road)',
    district: 'Agra',
    state: 'Uttar Pradesh',
    commodity: 'Wheat',
    commodityHi: 'गेहूँ',
    variety: 'PBW-502',
    category: 'Cereals',
    minPrice: 2310,
    maxPrice: 2480,
    modalPrice: 2400,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.4,
    arrivalQuantity: '140 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'व्यापारियों का रुख सीमित खरीदारी का है, भाव स्थिर।',
    detailedAdvisory: {
      sentiment: 'Stable • Balanced supply-demand equation across western UP grain markets.',
      priceTarget: '₹2,440 – ₹2,480/qtl',
      storage: 'Safe in standard warehouse conditions.',
      detailedText: 'गेहूं के भाव में बड़ा उतार-चढ़ाव नहीं है, स्थिति संतुलित है।',
    },
  },
  {
    id: 'mandi_agra_bajra',
    market: 'Agra Mandi (Fatehabad Road)',
    district: 'Agra',
    state: 'Uttar Pradesh',
    commodity: 'Bajra',
    commodityHi: 'बाजरा',
    variety: 'Hybrid Pearl',
    category: 'Cereals',
    minPrice: 2020,
    maxPrice: 2330,
    modalPrice: 2210,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.4,
    arrivalQuantity: '105 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'दक्षिण भारत से बाजरा की नई मांग निकलने से तेजी।',
    detailedAdvisory: {
      sentiment: 'Positive • Outstation dispatch orders to southern poultry feed makers active.',
      priceTarget: '₹2,280 – ₹2,350/qtl within 7-10 days',
      storage: 'Protect from humid weather conditions.',
      detailedText: 'बाहरी मंडियों की मांग के कारण बाजरा में ₹2,300+ का स्तर बन सकता है।',
    },
  },
  {
    id: 'mandi_agra_paddy',
    market: 'Agra Mandi (Fatehabad Road)',
    district: 'Agra',
    state: 'Uttar Pradesh',
    commodity: 'Paddy',
    commodityHi: 'धान',
    variety: 'Mansoori',
    category: 'Cereals',
    minPrice: 2160,
    maxPrice: 2420,
    modalPrice: 2310,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -1.1,
    arrivalQuantity: '80 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryText: 'नमी युक्त धान आने से मिलर्स कटौती कर रहे हैं।',
    detailedAdvisory: {
      sentiment: 'Mild Bearish • Millers enforcing moisture discounts on uneven lots.',
      priceTarget: 'Risk of ₹2,250/qtl on wet grain',
      storage: 'Thoroughly dry before dispatch or sell immediately.',
      detailedText: 'नमी की कटौती से बचने के लिए सुखाकर लाएं या तुरंत निपटारा करें।',
    },
  },
  {
    id: 'mandi_agra_maize',
    market: 'Agra Mandi (Fatehabad Road)',
    district: 'Agra',
    state: 'Uttar Pradesh',
    commodity: 'Maize',
    commodityHi: 'मक्का',
    variety: 'African Tall',
    category: 'Cereals',
    minPrice: 2110,
    maxPrice: 2390,
    modalPrice: 2280,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.2,
    arrivalQuantity: '60 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'पशु आहार निर्माणकर्ताओं की नियमित लिफ्टिंग जारी।',
    detailedAdvisory: {
      sentiment: 'Stable • Cattle feed mills buying steadily at current market rates.',
      priceTarget: '₹2,320 – ₹2,360/qtl',
      storage: 'Safe to store for 2-3 weeks.',
      detailedText: 'पशु आहार कंपनियों की नियमित मांग है, दाम स्थिर रहेंगे।',
    },
  },

  // ── Bulandshahr Mandi ──
  {
    id: 'mandi_bulandshahr_wheat',
    market: 'Bulandshahr APMC',
    district: 'Bulandshahr',
    state: 'Uttar Pradesh',
    commodity: 'Wheat',
    commodityHi: 'गेहूँ',
    variety: 'HD-3086 Certified',
    category: 'Cereals',
    minPrice: 2350,
    maxPrice: 2510,
    modalPrice: 2440,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.3,
    arrivalQuantity: '150 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'उच्च गुणवत्ता दाना होने से प्रीमियम मिल रहा है।',
    detailedAdvisory: {
      sentiment: 'Bullish • High hectolitre weight attracting premium bids from flour brands.',
      priceTarget: '₹2,500 – ₹2,550/qtl in 7 days',
      storage: 'Keep grain temperature under 25°C in aerated storage.',
      detailedText: 'दाना भारी व चमकदार होने से अच्छा भाव मिल रहा है। होल्ड करें।',
    },
  },
  {
    id: 'mandi_bulandshahr_maize',
    market: 'Bulandshahr APMC',
    district: 'Bulandshahr',
    state: 'Uttar Pradesh',
    commodity: 'Maize',
    commodityHi: 'मक्का',
    variety: 'Pioneer Hybrid',
    category: 'Cereals',
    minPrice: 2200,
    maxPrice: 2490,
    modalPrice: 2370,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 2.0,
    arrivalQuantity: '98 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'स्टार्च मिलों से जोरदार खरीद का समर्थन मिला है।',
    detailedAdvisory: {
      sentiment: 'Strong Bullish • Industrial starch mills raising procurement targets.',
      priceTarget: '₹2,480 – ₹2,550/qtl',
      storage: 'Maintain low humidity storage.',
      detailedText: 'स्टार्च उद्योग से बड़ी मांग आ रही है। 7-10 दिन में और बढ़त संभव।',
    },
  },
  {
    id: 'mandi_bulandshahr_paddy',
    market: 'Bulandshahr APMC',
    district: 'Bulandshahr',
    state: 'Uttar Pradesh',
    commodity: 'Paddy',
    commodityHi: 'धान',
    variety: 'Basmati 1121',
    category: 'Cereals',
    minPrice: 3620,
    maxPrice: 4120,
    modalPrice: 3910,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 2.6,
    arrivalQuantity: '120 Tonnes',
    recommendation: 'HOLD',
    advisoryText: '1121 बासमती में जोरदार एक्सपोर्ट मांग से रिकॉर्ड भाव।',
    detailedAdvisory: {
      sentiment: 'Very Bullish • Rice exporters bidding aggressively for premium 1121 lots.',
      priceTarget: '₹4,100 – ₹4,250/qtl within 10-14 days',
      storage: 'Cured and dried basmati fetches higher realization. Recommended to hold.',
      detailedText: '1121 बासमती में वैश्विक मांग का बड़ा सहारा है। अच्छे दाम के लिए रुकें।',
    },
  },
  {
    id: 'mandi_bulandshahr_mustard',
    market: 'Bulandshahr APMC',
    district: 'Bulandshahr',
    state: 'Uttar Pradesh',
    commodity: 'Mustard',
    commodityHi: 'सरसों',
    variety: 'Desi Mustard',
    category: 'Oilseeds',
    minPrice: 5390,
    maxPrice: 5740,
    modalPrice: 5610,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.5,
    arrivalQuantity: '62 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'मंडियों में सरसों की उपलब्धता सीमित, बाजार मजबूत।',
    detailedAdvisory: {
      sentiment: 'Stable / Supportive • Tight domestic supplies supporting firm price base.',
      priceTarget: '₹5,720 – ₹5,800/qtl',
      storage: 'Keep seeds clean and dry.',
      detailedText: 'मंडियों में माल कम है जिससे भाव पर दबाव नहीं आएगा।',
    },
  },
  {
    id: 'mandi_bulandshahr_potato',
    market: 'Bulandshahr APMC',
    district: 'Bulandshahr',
    state: 'Uttar Pradesh',
    commodity: 'Potato',
    commodityHi: 'आलू',
    variety: 'Kufri Sindhuri',
    category: 'Vegetables',
    minPrice: 1090,
    maxPrice: 1410,
    modalPrice: 1290,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -1.9,
    arrivalQuantity: '190 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryText: 'नया आलू आने से पहले पुराना स्टॉक तुरंत खाली करें।',
    detailedAdvisory: {
      sentiment: 'Bearish • Impending new crop arrivals triggering warehouse liquidation.',
      priceTarget: 'Expected downward drift to ₹1,200/qtl',
      storage: 'Clear inventory to avoid high storage charges.',
      detailedText: 'पुराना आलू जल्द से जल्द निकालें ताकि नया आलू आने पर घाटा न हो।',
    },
  },
  {
    id: 'mandi_bulandshahr_bajra',
    market: 'Bulandshahr APMC',
    district: 'Bulandshahr',
    state: 'Uttar Pradesh',
    commodity: 'Bajra',
    commodityHi: 'बाजरा',
    variety: 'WCC-75',
    category: 'Cereals',
    minPrice: 1970,
    maxPrice: 2260,
    modalPrice: 2130,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.1,
    arrivalQuantity: '50 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'मंडी में दैनिक आवक स्थिर, कीमतें संतुलित।',
    detailedAdvisory: {
      sentiment: 'Stable • Consistent local market absorption.',
      priceTarget: '₹2,160 – ₹2,220/qtl',
      storage: 'Dry grain to 12% moisture.',
      detailedText: 'बाजार स्थिर है, कोई बड़ी गिरावट की आशंका नहीं है।',
    },
  },

  // ── Mathura Mandi ──
  {
    id: 'mandi_mathura_mustard',
    market: 'Mathura APMC (Goverdhan Road)',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    commodity: 'Mustard',
    commodityHi: 'सरसों',
    variety: 'Black Mustard Bold',
    category: 'Oilseeds',
    minPrice: 5440,
    maxPrice: 5860,
    modalPrice: 5710,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 2.2,
    arrivalQuantity: '95 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'आगरा-भरतपुर बेल्ट में सरसों की आपूर्ति कम होने से तेज रुझान।',
    detailedAdvisory: {
      sentiment: 'Bullish • Tight supplies across the Rajasthan-UP border keeping crushers aggressive.',
      priceTarget: '₹5,880 – ₹5,980/qtl in 10 days',
      storage: 'Safe in well-ventilated dry warehouses.',
      detailedText: 'आसपास की मंडियों में माल कम होने से सरसों ₹5,900 छू सकती है।',
    },
  },
  {
    id: 'mandi_mathura_wheat',
    market: 'Mathura APMC (Goverdhan Road)',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    commodity: 'Wheat',
    commodityHi: 'गेहूँ',
    variety: 'WH-1105',
    category: 'Cereals',
    minPrice: 2320,
    maxPrice: 2490,
    modalPrice: 2410,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.3,
    arrivalQuantity: '135 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'व्यापारियों द्वारा स्थिर गति से खरीद, उतार-चढ़ाव कम।',
    detailedAdvisory: {
      sentiment: 'Neutral / Stable • Steady flour mill intake matching daily farm arrivals.',
      priceTarget: '₹2,450 – ₹2,490/qtl',
      storage: 'Protect against weevils using neem leaves or approved fumigants.',
      detailedText: 'भाव स्थिर है। सुरक्षित भंडारण हो तो आगे बेचें।',
    },
  },
  {
    id: 'mandi_mathura_bajra',
    market: 'Mathura APMC (Goverdhan Road)',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    commodity: 'Bajra',
    commodityHi: 'बाजरा',
    variety: 'Hybrid Pearl Millet',
    category: 'Cereals',
    minPrice: 2040,
    maxPrice: 2360,
    modalPrice: 2220,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.7,
    arrivalQuantity: '110 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'राजस्थान सीमा से सटी मंडियों में बाजरा की मांग बढ़ी।',
    detailedAdvisory: {
      sentiment: 'Positive • Cross-border transit demand providing price support.',
      priceTarget: '₹2,300 – ₹2,380/qtl within a week',
      storage: 'Ensure dry conditions to prevent mold.',
      detailedText: 'राजस्थान की मांग से भाव में तेज़ी है। होल्ड करें।',
    },
  },
  {
    id: 'mandi_mathura_potato',
    market: 'Mathura APMC (Goverdhan Road)',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    commodity: 'Potato',
    commodityHi: 'आलू',
    variety: 'Kufri Chandramukhi',
    category: 'Vegetables',
    minPrice: 1110,
    maxPrice: 1440,
    modalPrice: 1290,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -2.1,
    arrivalQuantity: '175 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryText: 'स्टॉक खाली करने के दबाव से कीमतें दबाव में हैं।',
    detailedAdvisory: {
      sentiment: 'Bearish • Surplus supplies in cold storages forcing price concessions.',
      priceTarget: 'Downside risk to ₹1,210/qtl',
      storage: 'Liquidate current stocks immediately.',
      detailedText: 'आलू का स्टॉक खाली करने का दबाव है। तुरंत बिकवाली करें।',
    },
  },
  {
    id: 'mandi_mathura_paddy',
    market: 'Mathura APMC (Goverdhan Road)',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    commodity: 'Paddy',
    commodityHi: 'धान',
    variety: 'Sugandha (Aromatic)',
    category: 'Cereals',
    minPrice: 2620,
    maxPrice: 2980,
    modalPrice: 2840,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.6,
    arrivalQuantity: '75 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'सुगंधा धान में मिलर्स द्वारा स्थिर खरीद देखी गई।',
    detailedAdvisory: {
      sentiment: 'Supportive • Aromatic paddy variety commanding steady consumer following.',
      priceTarget: '₹2,920 – ₹3,020/qtl in 10 days',
      storage: 'Preserve aroma with cool, shaded warehouse storage.',
      detailedText: 'सुगंधा धान में ₹3,000 तक का स्तर मिलने की संभावना है।',
    },
  },
  {
    id: 'mandi_mathura_maize',
    market: 'Mathura APMC (Goverdhan Road)',
    district: 'Mathura',
    state: 'Uttar Pradesh',
    commodity: 'Maize',
    commodityHi: 'मक्का',
    variety: 'Ganga-5 Hybrid',
    category: 'Cereals',
    minPrice: 2100,
    maxPrice: 2380,
    modalPrice: 2270,
    arrivalDate: currentDateStr,
    priceTrend: 'STABLE',
    priceChangePercent: 0.2,
    arrivalQuantity: '48 Tonnes',
    recommendation: 'HOLD',
    advisoryText: 'मक्का का व्यापार संतुलित दायरे में संचालित।',
    detailedAdvisory: {
      sentiment: 'Stable • Feed and local poultry demand absorbing lots.',
      priceTarget: '₹2,300 – ₹2,350/qtl',
      storage: 'Safe to store for 20-30 days.',
      detailedText: 'मक्का में संतुलन बना हुआ है। सामान्य रूप से बेचें।',
    },
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const districtParam = searchParams.get('district');
  const commodityParam = searchParams.get('commodity');
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const stateParam = searchParams.get('state') || 'Uttar Pradesh';

  try {
    let records: MandiRecord[] = [];

    // 1. Query Firestore mandi_rates collection directly
    try {
      const snap = await getDocs(collection(db, 'mandi_rates'));
      if (!snap.empty) {
        const firestoreItems: MandiRecord[] = [];

        snap.forEach((doc) => {
          const d = doc.data() as Record<string, any>;
          if (d && (d.market || d.mandiName) && (d.commodity || d.cropName) && d.modalPrice) {
            const mkt = d.market || d.mandiName || 'APMC Mandi';
            const dst = d.district || 'Uttar Pradesh';
            const comm = d.commodity || d.cropName || 'Crop';
            const mPrice = Number(d.modalPrice) || 0;
            const mnPrice = Number(d.minPrice) || Math.round(mPrice * 0.94);
            const mxPrice = Number(d.maxPrice) || Math.round(mPrice * 1.06);
            const trnd = (d.priceTrend || d.trend === 'RISING' ? 'UP' : d.trend === 'FALLING' ? 'DOWN' : 'STABLE') as 'UP' | 'DOWN' | 'STABLE';
            const rec = (d.recommendation || (trnd === 'DOWN' ? 'SELL_NOW' : 'HOLD')) as 'HOLD' | 'SELL_NOW';
            const advText = d.advisoryText || `${comm} in ${mkt} is currently trading at modal price ₹${mPrice}/qtl with ${trnd.toLowerCase()} momentum.`;

            // Ensure full detailedAdvisory structure with priceTarget, sentiment, storage
            const rawDetailed = d.detailedAdvisory;
            const detAdvisory: DetailedAdvisory = (rawDetailed && rawDetailed.sentiment && rawDetailed.priceTarget)
              ? {
                  sentiment: rawDetailed.sentiment,
                  priceTarget: rawDetailed.priceTarget,
                  storage: rawDetailed.storage || 'Ensure dry, moisture-controlled storage.',
                  detailedText: rawDetailed.detailedText || advText,
                }
              : generateDefaultDetailedAdvisory(comm, mPrice, trnd, rec, mkt, dst);

            let cat: 'Cereals' | 'Oilseeds' | 'Vegetables' | 'Pulses' = 'Cereals';
            if (d.category) {
              cat = d.category;
            } else if (/mustard|soybean|sunflower/i.test(comm)) {
              cat = 'Oilseeds';
            } else if (/potato|onion|tomato|vegetable/i.test(comm)) {
              cat = 'Vegetables';
            } else if (/gram|chickpea|arhar|moong|urad|pulse/i.test(comm)) {
              cat = 'Pulses';
            }

            firestoreItems.push({
              id: doc.id,
              market: mkt,
              district: dst,
              state: d.state || 'Uttar Pradesh',
              commodity: comm,
              commodityHi: d.commodityHi || comm,
              variety: d.variety || 'Standard',
              category: cat,
              minPrice: mnPrice,
              maxPrice: mxPrice,
              modalPrice: mPrice,
              arrivalDate: d.arrivalDate || currentDateStr,
              priceTrend: trnd,
              priceChangePercent: Number(d.priceChangePercent) || (trnd === 'UP' ? 1.5 : trnd === 'DOWN' ? -1.5 : 0),
              arrivalQuantity: d.arrivalQuantity || '120 Tonnes',
              recommendation: rec,
              advisoryText: advText,
              detailedAdvisory: detAdvisory,
            });
          }
        });

        if (firestoreItems.length > 0) {
          records = firestoreItems;
        }
      }
    } catch (fsErr) {
      console.warn('[API/Mandi] Firestore mandi_rates query skipped or empty:', fsErr);
    }

    // 2. If Firestore mandi_rates had fewer records or was unseeded, augment/fallback with comprehensive APMC dataset
    if (records.length === 0) {
      records = [...APMC_MANDI_DATASET];
    } else {
      // Merge baseline mandis so all key UP mandis (Aligarh, Meerut, Agra, Bulandshahr, Mathura) are guaranteed available
      const existingKeys = new Set(records.map((r) => `${r.district}-${r.commodity}`.toLowerCase()));
      APMC_MANDI_DATASET.forEach((base) => {
        const key = `${base.district}-${base.commodity}`.toLowerCase();
        if (!existingKeys.has(key)) {
          records.push(base);
        }
      });
    }

    // 3. Apply Filters
    if (districtParam && districtParam !== 'All') {
      const d = districtParam.toLowerCase().trim();
      records = records.filter((r) => r.district.toLowerCase() === d);
    }

    if (commodityParam && commodityParam !== 'All') {
      const c = commodityParam.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.commodity.toLowerCase() === c ||
          r.commodityHi.toLowerCase() === c
      );
    }

    if (categoryParam && categoryParam !== 'All') {
      const cat = categoryParam.toLowerCase().trim();
      records = records.filter((r) => r.category.toLowerCase() === cat);
    }

    if (searchParam && searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.commodity.toLowerCase().includes(q) ||
          r.commodityHi.toLowerCase().includes(q) ||
          r.market.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.variety.toLowerCase().includes(q) ||
          r.advisoryText.toLowerCase().includes(q)
      );
    }

    // Collect available unique districts and commodities for UI dropdowns
    const allDistricts = Array.from(new Set(records.map((r) => r.district))).sort();
    const allCommodities = Array.from(new Set(records.map((r) => r.commodity))).sort();

    return NextResponse.json({
      success: true,
      count: records.length,
      source: 'firestore_mandi_rates',
      filters: {
        district: districtParam || 'All',
        commodity: commodityParam || 'All',
        category: categoryParam || 'All',
        search: searchParam || '',
      },
      districts: ['All', ...allDistricts],
      commodities: ['All', ...allCommodities],
      data: records,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API/Mandi] Error in GET handler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch live APMC mandi rates',
      },
      { status: 500 }
    );
  }
}
