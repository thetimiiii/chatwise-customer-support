import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ccvfjhprrjirdvkecdbp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdmZqaHBycmppcmR2a2VjZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MjgsImV4cCI6MjA1MDM2NTYyOH0.M4ZXMi4z_2-RZxaYyUBmrekkOsfzcPSPhvLyZomD1XY";

export const createEmbedClient = (websiteId: string, token: string) => {
  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-website-id': websiteId,
          'x-embed-token': token
        }
      }
    }
  );
};
