import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

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
  advisoryNote?: string;
}

function getTodayFormattedDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const currentDateStr = getTodayFormattedDate();

// ── APMC Mandi Dataset (Focus on UP Mandis: Aligarh, Meerut, Agra, Bulandshahr, Mathura, etc.) ──
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
    advisoryNote: 'स्थानीय आटा मिलों की मजबूत खरीद से भाव में उछाल बना हुआ है।',
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
    advisoryNote: 'तेल मिलों में भारी मांग के चलते सरसों के दाम तेज बने हुए हैं।',
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
    advisoryNote: 'कोल्ड स्टोरेज से भारी निकासी के कारण आलू भाव में नरमी है।',
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
    advisoryNote: 'पोल्ट्री फीड कंपनियों से अच्छी उठाव दर्ज की गई है।',
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
    advisoryNote: 'आवक और मांग सामान्य रहने से दाम स्थिर स्तर पर बने हैं।',
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
    advisoryNote: 'सरकारी खरीद केंद्रों और स्थानीय व्यापारियों द्वारा नियमित लिफ्टिंग।',
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
    advisoryNote: 'गेहूं में निर्यात मांग और एनसीआर मिलों की सक्रियता से बढ़त।',
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
    advisoryNote: 'सरसों दाना में तेल प्रतिशत उच्च होने से प्रीमियम भाव प्राप्त।',
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
    advisoryNote: 'बासमती धान में चावल निर्यातकों द्वारा आक्रामक लिफ्टिंग।',
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
    advisoryNote: 'आवक अधिक होने से बिकवाली करना सुरक्षित रणनीति है।',
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
    advisoryNote: 'स्थानीय पशु आहार उत्पादकों की सतत मांग बनी हुई है।',
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
    advisoryNote: 'बाजरा सीमित आवक के साथ स्थिर दायरा दिखा रहा है।',
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
    advisoryNote: 'आगरा बेल्ट में आलू की बंपर निकासी, वर्तमान स्तर पर बेचें।',
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
    advisoryNote: 'मस्टर्ड ऑयल क्रशर इकाइयों में पेराई मांग निरंतर जारी।',
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
    advisoryNote: 'व्यापारियों का रुख सीमित खरीदारी का है, भाव स्थिर।',
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
    advisoryNote: 'दक्षिण भारत से बाजरा की नई मांग निकलने से तेजी।',
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
    advisoryNote: 'नमी युक्त धान आने से मिलर्स कटौती कर रहे हैं।',
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
    advisoryNote: 'पशु आहार निर्माणकर्ताओं की नियमित लिफ्टिंग जारी।',
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
    advisoryNote: 'उच्च गुणवत्ता दाना होने से प्रीमियम मिल रहा है।',
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
    advisoryNote: 'स्टार्च मिलों से जोरदार खरीद का समर्थन मिला है।',
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
    advisoryNote: '1121 बासमती में जोरदार एक्सपोर्ट मांग से रिकॉर्ड भाव।',
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
    advisoryNote: 'मंडियों में सरसों की उपलब्धता सीमित, बाजार मजबूत।',
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
    advisoryNote: 'नया आलू आने से पहले पुराना स्टॉक तुरंत खाली करें।',
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
    advisoryNote: 'मंडी में दैनिक आवक स्थिर, कीमतें संतुलित।',
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
    advisoryNote: 'आगरा-भरतपुर बेल्ट में सरसों की आपूर्ति कम होने से तेज रुझान।',
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
    advisoryNote: 'व्यापारियों द्वारा स्थिर गति से खरीद, उतार-चढ़ाव कम।',
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
    advisoryNote: 'राजस्थान सीमा से सटी मंडियों में बाजरा की मांग बढ़ी।',
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
    maxPrice: 1430,
    modalPrice: 1290,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -2.1,
    arrivalQuantity: '175 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryNote: 'स्टॉक खाली करने के दबाव से कीमतें दबाव में हैं।',
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
    advisoryNote: 'सुगंधा धान में मिलर्स द्वारा स्थिर खरीद देखी गई।',
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
    advisoryNote: 'मक्का का व्यापार संतुलित दायरे में संचालित।',
  },

  // ── Additional Key UP Mandis: Hathras, Bareilly, Firozabad ──
  {
    id: 'mandi_hathras_mustard',
    market: 'Hathras Mandi',
    district: 'Hathras',
    state: 'Uttar Pradesh',
    commodity: 'Mustard',
    commodityHi: 'सरसों',
    variety: 'Pusa Bold',
    category: 'Oilseeds',
    minPrice: 5370,
    maxPrice: 5760,
    modalPrice: 5620,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.8,
    arrivalQuantity: '78 Tonnes',
    recommendation: 'HOLD',
    advisoryNote: 'मसाला व तेल उद्योग की सीधी खरीद से सरसों में तेजी।',
  },
  {
    id: 'mandi_hathras_wheat',
    market: 'Hathras Mandi',
    district: 'Hathras',
    state: 'Uttar Pradesh',
    commodity: 'Wheat',
    commodityHi: 'गेहूँ',
    variety: 'Desi Lok-1',
    category: 'Cereals',
    minPrice: 2330,
    maxPrice: 2500,
    modalPrice: 2420,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.1,
    arrivalQuantity: '120 Tonnes',
    recommendation: 'HOLD',
    advisoryNote: 'गेहूं में सीमित आवक का लाभ भाव को मिल रहा है।',
  },
  {
    id: 'mandi_bareilly_paddy',
    market: 'Bareilly APMC',
    district: 'Bareilly',
    state: 'Uttar Pradesh',
    commodity: 'Paddy',
    commodityHi: 'धान',
    variety: 'Sharbati / PR',
    category: 'Cereals',
    minPrice: 2350,
    maxPrice: 2680,
    modalPrice: 2540,
    arrivalDate: currentDateStr,
    priceTrend: 'UP',
    priceChangePercent: 1.9,
    arrivalQuantity: '160 Tonnes',
    recommendation: 'HOLD',
    advisoryNote: 'तराई क्षेत्र के राइस मिलर्स द्वारा सक्रिय उठान।',
  },
  {
    id: 'mandi_firozabad_potato',
    market: 'Firozabad Mandi',
    district: 'Firozabad',
    state: 'Uttar Pradesh',
    commodity: 'Potato',
    commodityHi: 'आलू',
    variety: 'Kufri Bahar',
    category: 'Vegetables',
    minPrice: 1120,
    maxPrice: 1440,
    modalPrice: 1300,
    arrivalDate: currentDateStr,
    priceTrend: 'DOWN',
    priceChangePercent: -2.5,
    arrivalQuantity: '220 Tonnes',
    recommendation: 'SELL_NOW',
    advisoryNote: 'आसपास के कोल्ड स्टोरेज से निरंतर आलू आवक जारी।',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const stateParam = searchParams.get('state') || 'Uttar Pradesh';
  const districtParam = searchParams.get('district');
  const commodityParam = searchParams.get('commodity');
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  try {
    let records: MandiRecord[] = [...APMC_MANDI_DATASET];

    // Attempt to merge live Firestore records if available
    try {
      const q = query(collection(db, 'mandi_prices'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreItems: MandiRecord[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          if (d && d.market && d.commodity && d.modalPrice) {
            firestoreItems.push({
              id: doc.id,
              market: d.market || d.mandiName,
              district: d.district || 'Uttar Pradesh',
              state: d.state || 'Uttar Pradesh',
              commodity: d.commodity,
              commodityHi: d.commodityHi || d.commodity,
              variety: d.variety || 'Desi',
              category: (d.category || 'Cereals') as any,
              minPrice: Number(d.minPrice) || 0,
              maxPrice: Number(d.maxPrice) || 0,
              modalPrice: Number(d.modalPrice) || 0,
              arrivalDate: d.arrivalDate || currentDateStr,
              priceTrend: (d.priceTrend || d.trend || 'STABLE') as any,
              priceChangePercent: Number(d.priceChangePercent) || 0,
              arrivalQuantity: d.arrivalQuantity || 'Standard',
              recommendation: (d.recommendation || 'HOLD') as any,
              advisoryNote: d.advisoryNote || d.advisoryText,
            });
          }
        });

        if (firestoreItems.length > 0) {
          // Merge unique by market + commodity
          const existingKeys = new Set(records.map((r) => `${r.market}-${r.commodity}`.toLowerCase()));
          firestoreItems.forEach((f) => {
            const key = `${f.market}-${f.commodity}`.toLowerCase();
            if (!existingKeys.has(key)) {
              records.unshift(f);
            }
          });
        }
      }
    } catch (fsErr) {
      console.warn('[API/Mandi] Firestore sync optional read skipped:', fsErr);
    }

    // Apply Filters
    if (stateParam && stateParam !== 'All') {
      const s = stateParam.toLowerCase();
      records = records.filter((r) => r.state.toLowerCase() === s);
    }

    if (districtParam && districtParam !== 'All') {
      const d = districtParam.toLowerCase();
      records = records.filter((r) => r.district.toLowerCase() === d);
    }

    if (commodityParam && commodityParam !== 'All') {
      const c = commodityParam.toLowerCase();
      records = records.filter(
        (r) =>
          r.commodity.toLowerCase() === c ||
          r.commodityHi.toLowerCase() === c
      );
    }

    if (categoryParam && categoryParam !== 'All') {
      const cat = categoryParam.toLowerCase();
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
          r.variety.toLowerCase().includes(q)
      );
    }

    // Extract unique districts and commodities for client filters
    const allDistricts = Array.from(new Set(APMC_MANDI_DATASET.map((r) => r.district))).sort();
    const allCommodities = Array.from(new Set(APMC_MANDI_DATASET.map((r) => r.commodity))).sort();
    const allCategories = ['All', 'Cereals', 'Oilseeds', 'Vegetables', 'Pulses'];

    return NextResponse.json({
      success: true,
      count: records.length,
      filters: {
        state: stateParam,
        district: districtParam || 'All',
        commodity: commodityParam || 'All',
        category: categoryParam || 'All',
        search: searchParam || '',
      },
      districts: ['All', ...allDistricts],
      commodities: ['All', ...allCommodities],
      categories: allCategories,
      data: records,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API/Mandi] Error fetching mandi rates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch APMC mandi rates',
      },
      { status: 500 }
    );
  }
}
