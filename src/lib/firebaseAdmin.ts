import crypto from 'node:crypto';

export interface DecodedFirebaseToken {
  uid: string;
  email?: string;
  name?: string;
  phone_number?: string;
  admin?: boolean;
  [key: string]: any;
}

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> | null = null;
let certsExpiresAt = 0;

async function fetchGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && now < certsExpiresAt) {
    return cachedCerts;
  }

  const res = await fetch(GOOGLE_CERTS_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch Firebase public certificates (${res.status})`);
  }

  const certs = (await res.json()) as Record<string, string>;
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

  cachedCerts = certs;
  certsExpiresAt = now + maxAgeSec * 1000;
  return certs;
}

function getExpectedProjectIds(): string[] {
  const ids = new Set<string>();
  const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["']|["']$/g, '');
  const pubProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim().replace(/^["']|["']$/g, '');
  if (envProjectId) ids.add(envProjectId);
  if (pubProjectId) ids.add(pubProjectId);
  if (ids.size === 0) ids.add('agrishield-ce28a');
  return Array.from(ids);
}

/**
 * Cryptographically verifies a Firebase ID token (JWT RS256) against Google's
 * official public X.509 certificates using Node's native crypto module.
 * Eliminates heavy/fragile native SDK bundling overhead in serverless lambdas.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedFirebaseToken> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Firebase ID token must be a non-empty string');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Firebase ID token: expected 3 JWT segments');
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header: { alg?: string; kid?: string };
  let payload: Record<string, any>;
  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Failed to decode Firebase ID token JSON segments');
  }

  if (header.alg !== 'RS256') {
    throw new Error(`Unsupported JWT algorithm "${header.alg}" (expected RS256)`);
  }
  if (!header.kid) {
    throw new Error('Missing key ID (kid) in Firebase ID token header');
  }

  const certs = await fetchGooglePublicCerts();
  let certPem = certs[header.kid];
  if (!certPem) {
    // Force refresh once in case Google rotated keys
    certsExpiresAt = 0;
    const freshCerts = await fetchGooglePublicCerts();
    certPem = freshCerts[header.kid];
  }
  if (!certPem) {
    throw new Error(`No matching Firebase public certificate found for kid "${header.kid}"`);
  }

  const signingInput = `${headerB64}.${payloadB64}`;
  const isSignatureValid = crypto
    .createVerify('RSA-SHA256')
    .update(signingInput)
    .verify(certPem, signatureB64, 'base64url');

  if (!isSignatureValid) {
    throw new Error('Invalid Firebase ID token signature');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('Firebase ID token has expired');
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) {
    throw new Error('Firebase ID token issued-at timestamp is invalid');
  }

  const validProjectIds = getExpectedProjectIds();
  if (typeof payload.aud !== 'string' || !validProjectIds.includes(payload.aud)) {
    throw new Error(`Invalid token audience "${payload.aud}"`);
  }
  const expectedIssuer = `https://securetoken.google.com/${payload.aud}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error(`Invalid token issuer "${payload.iss}"`);
  }

  if (typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128) {
    throw new Error('Invalid token subject (uid)');
  }

  return {
    ...payload,
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    phone_number: typeof payload.phone_number === 'string' ? payload.phone_number : undefined,
    admin: payload.admin === true,
  };
}

/**
 * Auth verifier facade compatible with test mocks (e2e-audit) while keeping
 * serverless API lambdas completely free of firebase-admin native tracing.
 */
export const adminAuth = {
  verifyIdToken: verifyFirebaseIdToken,
};
