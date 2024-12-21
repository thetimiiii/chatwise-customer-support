import { Json } from './json';

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
        Relationships: [
          {
            foreignKeyName: "chat_sessions_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      websites: {
        Row: {
          config: Json | null
          created_at: string
          embed_token: string
          id: string
          name: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          embed_token?: string
          id?: string
          name: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          embed_token?: string
          id?: string
          name?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row'];

export type Enums<
  T extends keyof Database['public']['Enums']
> = Database['public']['Enums'][T];