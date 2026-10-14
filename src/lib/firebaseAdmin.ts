import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Singleton Firebase Admin App initialization.
 * Prevents re-initialization during Next.js Hot Module Replacement (HMR).
 */
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Properly format escaped newlines from environment variables
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  // Graceful fallback for environments where service account keys are pending
  // or during static analysis / Next.js build-time prerendering
  return initializeApp({
    projectId: projectId || 'agrishield-ce28a',
  });
}

const adminApp: App = getFirebaseAdminApp();
export const adminAuth: Auth = getAuth(adminApp);
export default adminApp;
