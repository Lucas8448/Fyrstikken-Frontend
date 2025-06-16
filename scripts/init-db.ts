#!/usr/bin/env npx tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

import { initializeDatabase } from "../src/lib/supabase-database";

async function main() {
  console.log("🚀 Initializing Supabase database...");
  
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing required environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    console.error("");
    console.error("Please create a .env.local file with your Supabase credentials.");
    console.error("See .env.example for the required format.");
    process.exit(1);
  }

  try {
    await initializeDatabase();
    console.log("✅ Database initialized successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Verify tables were created in your Supabase dashboard");
    console.log("2. Run 'npm run dev' to start the development server");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

main();
