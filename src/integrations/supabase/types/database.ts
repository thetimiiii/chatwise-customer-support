import { Json } from './json';
import { WebsiteConfig } from './website';

export type Database = {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          messages_count: number | null
          started_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          messages_count?: number | null
          started_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          messages_count?: number | null
          started_at?: string
          website_id?: string
        }
      }
      profiles: {
        Row: {
          created_at: string
          credits_remaining: number | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number | null
          id?: string
          updated_at?: string
        }
      }
      websites: {
        Row: {
          config: Json
          created_at: string
          embed_token: string
          id: string
          name: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          embed_token?: string
          id?: string
          name: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          embed_token?: string
          id?: string
          name?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];