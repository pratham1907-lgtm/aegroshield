import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * AegroShield High-Concurrency Load & Stress Test Suite (k6)
 *
 * Usage:
 *   npm run test:load
 *   k6 run --env BASE_URL=https://aegroshield.vercel.app load-tests/k6-stress-test.js
 *   k6 run --env BASE_URL=http://127.0.0.1:3000 --env K6_SMOKE=1 load-tests/k6-stress-test.js
 */

const BASE_URL = (__ENV.BASE_URL || 'https://aegroshield.vercel.app').replace(/\/+$/, '');
const IS_SMOKE = __ENV.K6_SMOKE === '1';

// Custom telemetry metrics
const customErrorRate = new Rate('aegroshield_error_rate');
const ttfbProducts = new Trend('ttfb_products', true);
const ttfbMandi = new Trend('ttfb_mandi', true);
const ttfbMachinery = new Trend('ttfb_machinery', true);
const ttfbLabour = new Trend('ttfb_labour', true);
const ttfbChat = new Trend('ttfb_chat', true);

export const options = {
  stages: IS_SMOKE
    ? [
        { duration: '10s', target: 50 },
        { duration: '15s', target: 50 },
        { duration: '5s', target: 0 },
      ]
    : [
        // 1. Warmup stage: 1,000 concurrent virtual users
        { duration: '30s', target: 1000 },
        { duration: '30s', target: 1000 },
        // 2. Normal peak stage: 10,000 concurrent virtual users
        { duration: '1m', target: 10000 },
        { duration: '1m', target: 10000 },
        // 3. Stress test stage: 50,000 -> 100,000 concurrent virtual users
        { duration: '1m', target: 50000 },
        { duration: '1m30s', target: 100000 },
        { duration: '1m', target: 100000 },
        // 4. Graceful cooldown
        { duration: '30s', target: 0 },
      ],
  thresholds: {
    // TTFB (Time to First Byte) must remain fast across edge & Redis layers
    http_req_waiting: ['p(95)<200', 'avg<100'],
    // End-to-end request duration p95 < 200ms
    http_req_duration: ['p(95)<200'],
    // Overall HTTP error rate < 1%
    http_req_failed: ['rate<0.01'],
    // Custom functional validation error rate < 1%
    aegroshield_error_rate: ['rate<0.01'],
    // Per-endpoint TTFB targets
    ttfb_products: ['p(95)<200'],
    ttfb_mandi: ['p(95)<200'],
    ttfb_machinery: ['p(95)<200'],
    ttfb_labour: ['p(95)<200'],
    ttfb_chat: ['p(95)<2500'],
  },
  discardResponseBodies: false,
};

const PRODUCT_QUERIES = [
  '',
  '?category=Seeds',
  '?category=Fertilizers',
  '?state=Uttar%20Pradesh',
  '?state=Punjab&district=Ludhiana',
];

const MANDI_QUERIES = [
  '',
  '?state=Punjab',
  '?state=Uttar%20Pradesh',
  '?commodity=Wheat',
  '?category=Cereals',
];

const MACHINERY_QUERIES = [
  '',
  '?machineType=Tractor',
  '?state=Uttar%20Pradesh',
  '?state=Punjab',
];

const LABOUR_QUERIES = [
  '',
  '?state=Uttar%20Pradesh',
  '?taskType=Harvesting',
];

const CHAT_PROMPTS = [
  { text: 'wheat fertilizer dose', lang: 'en' },
  { text: 'urea per acre in paddy', lang: 'en' },
  { text: 'gehu me urea ki matra kitni daalein', lang: 'hi-en' },
  { text: 'आज के ताज़ा मंडी भाव क्या हैं', lang: 'hi' },
  { text: 'kisan helpline number', lang: 'hi-en' },
];

function getSimulatedFarmerIp() {
  const octet2 = (__VU % 250) + 1;
  const octet3 = (__ITER % 250) + 1;
  const octet4 = ((__VU * 7 + __ITER) % 250) + 1;
  return `10.${octet2}.${octet3}.${octet4}`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function () {
  const farmerIp = getSimulatedFarmerIp();
  const baseHeaders = {
    'X-Forwarded-For': farmerIp,
    Accept: 'application/json',
  };

  // Weighted farmer journey distribution simulating 100k concurrent traffic
  const roll = Math.random();

  if (roll < 0.30) {
    group('Storefront Catalog (/api/products)', () => {
      const q = pickRandom(PRODUCT_QUERIES);
      const res = http.get(`${BASE_URL}/api/products${q}`, {
        headers: baseHeaders,
        tags: { endpoint: 'products' },
      });
      ttfbProducts.add(res.timings.waiting);

      const ok = check(res, {
        'products status 200': r => r.status === 200,
        'products valid JSON array': r => {
          try {
            return Array.isArray(JSON.parse(r.body));
          } catch {
            return false;
          }
        },
      });
      customErrorRate.add(!ok);
    });
  } else if (roll < 0.60) {
    group('Live APMC Mandi Rates (/api/mandi)', () => {
      const q = pickRandom(MANDI_QUERIES);
      const res = http.get(`${BASE_URL}/api/mandi${q}`, {
        headers: baseHeaders,
        tags: { endpoint: 'mandi' },
      });
      ttfbMandi.add(res.timings.waiting);

      const ok = check(res, {
        'mandi status 200': r => r.status === 200,
        'mandi payload success': r => {
          try {
            const parsed = JSON.parse(r.body);
            return parsed.success === true && Array.isArray(parsed.data);
          } catch {
            return false;
          }
        },
      });
      customErrorRate.add(!ok);
    });
  } else if (roll < 0.78) {
    group('Machinery Rentals (/api/machinery)', () => {
      const q = pickRandom(MACHINERY_QUERIES);
      const res = http.get(`${BASE_URL}/api/machinery${q}`, {
        headers: baseHeaders,
        tags: { endpoint: 'machinery' },
      });
      ttfbMachinery.add(res.timings.waiting);

      const ok = check(res, {
        'machinery status 200': r => r.status === 200,
        'machinery payload success': r => {
          try {
            const parsed = JSON.parse(r.body);
            return parsed.success === true && Array.isArray(parsed.data);
          } catch {
            return false;
          }
        },
      });
      customErrorRate.add(!ok);
    });
  } else if (roll < 0.90) {
    group('Farm Labour Board (/api/labour)', () => {
      const q = pickRandom(LABOUR_QUERIES);
      const res = http.get(`${BASE_URL}/api/labour${q}`, {
        headers: baseHeaders,
        tags: { endpoint: 'labour' },
      });
      ttfbLabour.add(res.timings.waiting);

      const ok = check(res, {
        'labour status 200': r => r.status === 200,
        'labour payload success': r => {
          try {
            const parsed = JSON.parse(r.body);
            return parsed.success === true && Array.isArray(parsed.data);
          } catch {
            return false;
          }
        },
      });
      customErrorRate.add(!ok);
    });
  } else {
    group('AI Sahayak Semantic Query (/api/v1/chat)', () => {
      const prompt = pickRandom(CHAT_PROMPTS);
      const payload = JSON.stringify({
        messages: [{ role: 'user', parts: [{ text: prompt.text }] }],
        context: {
          language: prompt.lang,
          crop: 'Wheat',
          district: 'Meerut',
          currentPage: '/market',
        },
      });

      const res = http.post(`${BASE_URL}/api/v1/chat`, payload, {
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/json',
        },
        tags: { endpoint: 'chat' },
      });
      ttfbChat.add(res.timings.waiting);

      const ok = check(res, {
        'chat status 200 or rate-limited 429': r => r.status === 200 || r.status === 429,
        'chat valid JSON reply': r => {
          if (r.status === 429) return true;
          try {
            const parsed = JSON.parse(r.body);
            return parsed.success === true && typeof parsed.message === 'string' && parsed.message.length > 0;
          } catch {
            return false;
          }
        },
      });
      customErrorRate.add(!ok);
    });
  }

  // Realistic farmer think-time between actions
  sleep(Math.random() * 1.5 + 0.5);
}
