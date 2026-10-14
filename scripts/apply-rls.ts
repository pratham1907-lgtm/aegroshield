import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261014000000_enable_rls_and_public_policies.sql');
  console.log(`Reading migration from: ${migrationPath}`);
  
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Strip full line comments but keep statement integrity
  const cleanedSql = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);

  for (const statement of statements) {
    console.log(`> Executing: ${statement.substring(0, 60)}...`);
    await prisma.$executeRawUnsafe(statement + ';');
  }

  console.log('\n✅ Successfully applied Row Level Security (RLS) migration!');
}

main()
  .catch((err) => {
    console.error('❌ Error applying RLS migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
