import * as fs from 'fs';
import * as path from 'path';

// Load .env or .env.local if running directly outside Next.js
function loadEnv() {
  const envFiles = ['.env.local', '.env.production', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { prisma } from '../src/lib/prisma';

function getScriptAdminAuth() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'agrishield-ce28a';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
    } else {
      initializeApp({ projectId });
    }
  }
  return getAuth(getApps()[0]);
}

const adminAuth = getScriptAdminAuth();

async function main() {
  const targetUid = process.argv[2] || process.env.ADMIN_UID;

  if (!targetUid || !targetUid.trim()) {
    console.error('Error: Target Firebase UID is required.');
    console.error('Usage: npm run admin:grant <FIREBASE_UID>');
    console.error('   or: npx tsx scripts/set-admin.ts <FIREBASE_UID>');
    console.error('   or: set ADMIN_UID=<FIREBASE_UID>');
    process.exit(1);
  }

  const cleanUid = targetUid.trim();

  console.log(`Setting admin custom claim { admin: true } for Firebase UID: "${cleanUid}"...`);

  try {
    // 1. Grant Firebase Auth custom claim { admin: true }
    await adminAuth.setCustomUserClaims(cleanUid, { admin: true });
    console.log(`✓ Firebase custom claims updated: { admin: true } granted to UID: ${cleanUid}`);

    // 2. Fetch user details from Firebase to confirm
    let userEmail: string | null = null;
    let userName: string | null = null;
    try {
      const firebaseUser = await adminAuth.getUser(cleanUid);
      userEmail = firebaseUser.email || null;
      userName = firebaseUser.displayName || 'Platform Administrator';
      console.log(`✓ Verified Firebase User: ${userEmail || userName || cleanUid}`);
    } catch (fbErr: any) {
      console.warn(`Note: Could not retrieve Firebase profile details (${fbErr?.message}), proceeding with database update...`);
    }

    // 3. Upsert / update user role in Prisma database to 'ADMIN'
    const dbUser = await prisma.user.upsert({
      where: { firebaseUid: cleanUid },
      update: { role: 'ADMIN' },
      create: {
        firebaseUid: cleanUid,
        email: userEmail,
        name: userName || 'Platform Administrator',
        role: 'ADMIN',
        isDemo: false,
      },
    });

    console.log(`✓ Supabase User record updated to role 'ADMIN' (Database ID: ${dbUser.id})`);
    console.log(`\n🎉 Admin setup successful! User "${cleanUid}" now has cryptographic admin privileges.`);
  } catch (err: any) {
    console.error('Failed to grant admin privileges:', err?.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
