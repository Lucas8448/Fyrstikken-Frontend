import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface User {
  id: number;
  email: string;
  verification_code?: string;
  code_expiry?: number;
  contestant_voted?: number;
  created_at: string;
}

export interface Token {
  token: string;
  email: string;
  created_at: string;
}
