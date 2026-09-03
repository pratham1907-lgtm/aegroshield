import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBhToIfOHC91I6KaleLev3pO_6oMYYR9FQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "agrishield-ce28a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "agrishield-ce28a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "agrishield-ce28a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "744928980155",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:744928980155:web:5fa014be531e77bb280d9e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3NBB5YWM5K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);


export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  return signOut(auth);
}

export function onAuthChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

const COL = {
  BOOKINGS:      'bookings',
  WORKER_LISTINGS: 'workerListings',
  LABOUR_REQUESTS: 'labourRequests',
  WORKER_RATINGS:  'workerRatings',
  CALCULATIONS:    'savedCalculations',
  MACHINE_LISTINGS: 'machineListings',
};

async function saveDoc(col: string, data: Record<string, any>) {
  try {
    const ref = await addDoc(collection(db, col), {
      ...data,
      createdAt: serverTimestamp(),
      platform:  'web',
      appVersion: '1.0',
    });
    console.info(`[Aegroshield ✅] ${col}/${ref.id}`);
    return ref.id;
  } catch (err: any) {
    console.warn(`[Aegroshield ⚠️] Firestore write failed (${col}):`, err?.message);
    return null;
  }
}

export async function saveBooking({
  machineId, machineName, provider, ratePerHour,
  farmerName, farmerPhone, slotTime, bookingDate,
  durationHours, totalCost, refNumber,
}: Record<string, any>) {
  if (analytics) logEvent(analytics, 'machinery_booked', { machine_name: machineName, rate_per_hour: ratePerHour });
  return saveDoc(COL.BOOKINGS, { machineId, machineName, provider, ratePerHour: Number(ratePerHour), farmerName, farmerPhone, slotTime, bookingDate, durationHours: Number(durationHours), totalCost: Number(totalCost), refNumber, status: 'confirmed' });
}

export async function saveWorkerListing({ workerName, phone, district, village, fromDate, toDate, groupSize, dailyRate, tasks }: Record<string, any>) {
  if (analytics) logEvent(analytics, 'worker_listing_posted', { district });
  return saveDoc(COL.WORKER_LISTINGS, { workerName, phone, district, village: village || '', fromDate, toDate, groupSize: Number(groupSize), dailyRate: Number(dailyRate), tasks, status: 'active' });
}

export async function saveMachineListing({ machineName, machineType, provider, phone, state, district, village, hourlyRate, operator }: Record<string, any>) {
  if (analytics) logEvent(analytics, 'machine_listing_posted', { district });
  return saveDoc(COL.MACHINE_LISTINGS, { machineName, machineType, provider, phone, state, district, village: village || '', hourlyRate: Number(hourlyRate), operator: Boolean(operator), status: 'active' });
}

export async function saveLabourRequest({ workerId, workerName, workerLocation, taskType, requestDate, workersNeeded }: Record<string, any>) {
  if (analytics) logEvent(analytics, 'labour_request_sent', { worker_id: String(workerId) });
  return saveDoc(COL.LABOUR_REQUESTS, { workerId: Number(workerId), workerName, workerLocation, taskType: taskType || 'Any', requestDate: requestDate || '', workersNeeded: Number(workersNeeded) || 1, status: 'sent' });
}

export async function saveWorkerRating({ workerId, workerName, starRating, attendance, feedback, totalPaid }: Record<string, any>) {
  if (analytics) logEvent(analytics, 'worker_rated', { worker_id: String(workerId), rating: starRating });
  return saveDoc(COL.WORKER_RATINGS, { workerId: Number(workerId), workerName, starRating: Number(starRating), attendance: Number(attendance), feedback: feedback || '', totalPaid: Number(totalPaid) });
}

export async function saveCalculation({ calcType, crop, disease, product, stage, soilType, fieldArea, fieldUnit, results }: Record<string, any>) {
  if (analytics) logEvent(analytics, 'calculation_saved', { calc_type: calcType, crop });
  return saveDoc(COL.CALCULATIONS, { calcType, crop, disease: disease || null, product: product || null, stage: stage || null, soilType: soilType || null, fieldArea: Number(fieldArea), fieldUnit, results });
}

export async function getLiveMachinery() {
  try {
    const snap = await getDocs(collection(db, 'machineListings'));
    const list: any[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (e) {
    console.warn('[firebase] Firestore live machinery query failed:', e);
    return [];
  }
}

export async function getLiveLabour() {
  try {
    const snap = await getDocs(collection(db, 'workerListings'));
    const list: any[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (e) {
    console.warn('[firebase] Firestore live labour query failed:', e);
    return [];
  }
}

export function logPageView(pageName: string) {
  if (analytics) logEvent(analytics, 'page_view', { page_title: pageName });
}


