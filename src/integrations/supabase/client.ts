// @/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ihamkwoneaosavdjulzt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYW1rd29uZWFvc2F2ZGp1bHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODc1NjYsImV4cCI6MjA1MDM2MzU2Nn0.F094zIwGPIuHq2FDttd6Uo6t9LuZHrmZy2Ohz0VdycE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
