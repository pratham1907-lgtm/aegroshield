-- ==============================================================================
-- AegroShield Supabase Row Level Security (RLS) Migration
-- File: supabase/migrations/20261014000000_enable_rls_and_public_policies.sql
-- ==============================================================================
-- 
-- Context & Architecture:
-- 1. Authentication is handled via Firebase Auth on the client & server.
-- 2. Server-side database queries run through Prisma Client using direct PostgreSQL
--    connection strings (DATABASE_URL / DIRECT_URL). In Supabase, the connecting
--    role is `postgres`, which possesses the `BYPASSRLS` attribute by default.
--    This ensures Prisma operations continue to execute without RLS hindrance.
-- 3. Public clients or Data API (PostgREST) calls use the Supabase Anon / Publishable
--    key (`anon` role, which does NOT bypass RLS).
-- 4. Enabling RLS without FORCE ROW LEVEL SECURITY secures tables against any
--    unauthorized client-side leakage while leaving server-side Prisma intact.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Task 1: Enable Row Level Security (RLS) on all public tables
-- ------------------------------------------------------------------------------

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Seller" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Machinery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabourPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Task 2: Define basic public read policies for Product and Machinery
-- (Allows anyone, anonymous or authenticated, to browse marketplace listings)
-- ------------------------------------------------------------------------------

-- Policy for Product
DROP POLICY IF EXISTS "Allow public read access for Product" ON "Product";
CREATE POLICY "Allow public read access for Product"
ON "Product"
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for Machinery
DROP POLICY IF EXISTS "Allow public read access for Machinery" ON "Machinery";
CREATE POLICY "Allow public read access for Machinery"
ON "Machinery"
FOR SELECT
TO anon, authenticated
USING (true);

-- Optional: Public read access for LabourPost (if farmers can browse labour teams directly via client)
-- DROP POLICY IF EXISTS "Allow public read access for LabourPost" ON "LabourPost";
-- CREATE POLICY "Allow public read access for LabourPost"
-- ON "LabourPost"
-- FOR SELECT
-- TO anon, authenticated
-- USING (true);

-- ------------------------------------------------------------------------------
-- Task 3: Security & Architecture Notes
-- ------------------------------------------------------------------------------
-- - In Postgres, when RLS is enabled and no policy is defined for a role, the
--   default action is DENY ALL. Thus, tables like "User", "Order", "Booking",
--   and "Seller" cannot be read or modified by the `anon` or `authenticated` roles.
-- - Prisma connects as `postgres` (or `service_role`), which has `BYPASSRLS = true`.
--   Therefore, Prisma will continue to perform full CRUD operations unaffected.
-- - DO NOT run `ALTER TABLE ... FORCE ROW LEVEL SECURITY;` because that would
--   force RLS checks on the table owner (`postgres`) and disrupt Prisma queries.
-- ==============================================================================
