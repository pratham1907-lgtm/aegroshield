# AegroShield (एग्रोशील्ड)

> **Next-Generation Agricultural Operating System & Marketplace for Indian Farmers**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql)](https://supabase.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFA611?style=flat&logo=firebase)](https://firebase.google.com/)

---

## 🌾 Overview

**AegroShield** is a full-stack, enterprise-grade agri-tech platform designed to empower Indian farmers, verified agricultural input retailers, and farm machinery owners. By integrating trusted local agri-stores, mechanized equipment rentals, farm workforce booking, and real-time mandi intelligence into a single unified platform, AegroShield digitizes rural commerce while maintaining strict regulatory compliance and authoritative data security.

### 🚀 Core Platform Features

* **🛒 Pan-India Agri-Marketplace**: Multi-vendor storefront for seeds, certified fertilizers, and organic bio-inputs with authoritative server-side pricing, inventory validation, and Cash-on-Delivery (COD) checkout.
* **🚜 Machinery & Equipment Rental**: On-demand booking of tractors, combine harvesters, laser levelers, and spray drones with per-hour / per-acre transparent pricing and dispatch tracking.
* **👥 Farm Labour Network**: Community workforce coordination connecting farm labour contractors and workers with seasonal sowing, weeding, and harvesting jobs.
* **📈 Live Mandi Rates & Market Intelligence**: Daily APMC mandi arrival prices for over 280+ crop varieties across India, historical 7-day trend graphs, and algorithmic Hold/Sell recommendations.
* **🤖 Multilingual AI Chat & Advisory**: Context-aware farm assistant powered by Google Gemini, conversing in Hinglish, Hindi, Punjabi, and regional languages with autonomous platform navigation capabilities.
* **🧪 Crop Input Calculator**: Precise scientific dosage calculations for fertilizers and crop protection chemicals based on acreage, adhering to the Insecticides Act, 1968 and Pre-Harvest Intervals (PHI).
* **🛡️ Multi-Role Security & Admin Control**: Three distinct user roles (`FARMER`, `SELLER`, `ADMIN`) with dealer accreditation verification, document inspection, and server-side cryptographic claim enforcement.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | React Server Components (RSC), Turbopack compilation, Streaming UI |
| **Language** | **TypeScript 5.x** | Strict mode typing, zero build-time warnings |
| **Styling** | **Tailwind CSS v4** | Modern CSS styling, dynamic responsive layouts, custom design tokens |
| **Icons & UI** | **Lucide React** | Clean iconography across farmer, vendor, and admin interfaces |
| **Database & ORM** | **PostgreSQL (Supabase)** & **Prisma ORM** | Authoritative relational data modeling, connection pooling (PgBouncer) |
| **NoSQL Cache** | **Firebase Firestore** | 24-hour distributed caching for Mandi rates and AI-generated advisories |
| **Authentication** | **Firebase Authentication** | Unified role sign-in (Phone OTP / Email), Firebase Admin SDK token verification |
| **AI Intelligence** | **Google Gemini (GenAI SDK)** | `gemini-1.5-flash` for low-latency conversational advisory & tool calling |
| **Validation** | **Zod** | Strict schema validation on orders, bookings, seller registrations, and AI payloads |
| **Rate Limiting** | **In-Memory Sliding Window** | Tiered rate limit protection against endpoint quota abuse |
| **Observability** | **Sentry** | Full-stack performance tracking, error reporting, and distributed tracing |

---

## 📁 Repository Structure

```text
agrishield/
├── prisma/
│   ├── schema.prisma           # Prisma PostgreSQL data models & relations
│   └── seed.ts                 # Database seeding script for local development
├── public/                     # Static assets, branding, and icons
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login & registration workflows
│   │   ├── admin/              # Master Admin Portal (accreditation & approvals)
│   │   ├── api/                # Authoritative Next.js API Route Handlers
│   │   │   ├── admin/sellers/  # Seller accreditation & verification
│   │   │   ├── auth/sync-user/ # Firebase-to-Postgres user sync
│   │   │   ├── bookings/       # Machinery & labour booking lifecycle
│   │   │   ├── health/         # System & database health probe
│   │   │   ├── labour/         # Labour jobs & workforce listings
│   │   │   ├── machinery/      # Farm equipment catalog & rental slots
│   │   │   ├── mandi/          # Mandi arrival rates endpoint
│   │   │   ├── mandi-advisory/ # AI economic advisory for commodities
│   │   │   ├── orders/         # Authoritative marketplace order processing
│   │   │   ├── products/       # Product catalog CRUD (verified sellers only)
│   │   │   ├── seller/         # Seller authentication & session endpoints
│   │   │   └── v1/chat/        # Multilingual conversational AI assistant
│   │   ├── calculator/         # Input dosage & PHI safety calculator
│   │   ├── cart/ & checkout/   # Shopping cart and COD order completion
│   │   ├── farmer/home/        # Farmer personal portal and status hub
│   │   ├── labour/             # Labour hire directory
│   │   ├── machinery/          # Equipment rental marketplace
│   │   ├── market/             # APMC mandi rates & interactive charts
│   │   ├── seller/dashboard/   # Seller inventory & dispatch dashboard
│   │   └── store/              # Farmer marketplace storefront
│   ├── components/             # Reusable UI components & Chatbot widget
│   └── lib/                    # Shared libraries (auth, firebase, prisma, rateLimit, validations)
├── .env.example                # Sanitized template for environment variables
├── next.config.ts              # Next.js & Turbopack configuration
├── package.json                # Project dependencies and script definitions
└── tsconfig.json               # TypeScript compiler settings
```

---

## ⚙️ Environment Variables Template

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Ensure the following environment keys are populated:

```env
# ------------------------------------------------------------------------------
# 1. Google Gemini AI API
# ------------------------------------------------------------------------------
GEMINI_API_KEY=your_gemini_api_key

# ------------------------------------------------------------------------------
# 2. Administrative Credentials & Secrets
# ------------------------------------------------------------------------------
NEXT_PUBLIC_ADMIN_SECRET_KEY=your_admin_secret_key
ADMIN_SECRET_KEY=your_admin_secret_key

# ------------------------------------------------------------------------------
# 3. Supabase Configuration (PostgreSQL Database & Connection Pool)
# ------------------------------------------------------------------------------
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ------------------------------------------------------------------------------
# 4. Firebase Authentication (Client & Server Admin SDK)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# ------------------------------------------------------------------------------
# 5. Automated Jobs & Security
# ------------------------------------------------------------------------------
CRON_SECRET=your_secure_cron_secret_key
DATA_GOV_API_KEY=your_data_gov_api_key
DATA_GOV_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070

# ------------------------------------------------------------------------------
# 6. Sentry Observability (Optional)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SENTRY_DSN=your_sentry_public_dsn
SENTRY_DSN=your_sentry_server_dsn
```

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: v20.x or higher
* **npm**: v10.x or higher
* **PostgreSQL**: Local instance or Supabase project

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/pratham1907-lgtm/aegroshield.git
cd aegroshield
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your connection strings and API keys:

```bash
cp .env.example .env
```

### 3. Synchronize Database Schema

Generate the Prisma client and push the schema directly to your database:

```bash
# Push Prisma schema to PostgreSQL database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

*(Optional)* Seed sample products, machinery, and mandi rates:
```bash
npx tsx prisma/seed.ts
```

### 4. Start Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access AegroShield.

---

## 🔒 Security & Architecture Highlights

1. **Authoritative Server Pricing**:
   * Order totals, discounts, and item pricing are computed on the server from PostgreSQL database records. Client-provided prices are never trusted.
2. **Cryptographic Identity & Role Protection**:
   * Token verification is enforced via `requireUser(request)` through the Firebase Admin SDK.
   * Admin routes require explicit cryptographic custom claims `{ admin: true }` verified against server-side records.
3. **AI Endpoint Quota Protection**:
   * Both `/api/v1/chat` and `/api/mandi-advisory` require user authentication.
   * Input character lengths are capped (max 1,000 characters per message, max 8,000 total per context) using strict Zod schemas.
   * Built-in sliding-window rate limiting prevents denial-of-wallet (DoW) and API quota exhaustion.
4. **Data Privacy**:
   * Mandi data feeds are sanitized so that backend upstream endpoints and API keys are completely shielded from end users.

---

## 🧪 Testing & Verification

Run static type checking and production builds to guarantee production readiness:

```bash
# Type check with TypeScript compiler
npx tsc --noEmit

# Production build and optimization
npm run build
```

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
