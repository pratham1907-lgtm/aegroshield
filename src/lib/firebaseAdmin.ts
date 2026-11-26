import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  // Strip accidental surrounding quotes from env paste and normalize escaped newlines
  const cleaned = raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  if (!cleaned.includes('-----BEGIN') || !cleaned.includes('-----END')) {
    return undefined;
  }
  return cleaned;
}

/**
 * Singleton Firebase Admin App initialization.
 * Prevents re-initialization during Next.js HMR and falls back safely if cert keys are malformed.
 */
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'agrishield-ce28a'
  )
    .trim()
    .replace(/^["']|["']$/g, '');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, '');
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } catch (certErr) {
      console.warn('[FirebaseAdmin] Invalid service account certificate, falling back to projectId mode:', certErr);
    }
  }

  // Graceful fallback: verifyIdToken still validates ID tokens against Google public JWKS keys using projectId
  return initializeApp({
    projectId: projectId || 'agrishield-ce28a',
  });
}

const adminApp: App = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
export default adminApp;
