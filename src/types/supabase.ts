export interface Database {
  Tables: {
    websites: {
      Row: {
        id: string;
        name: string;
        created_at: string;
        embed_token: string;
        config: {
          primaryColor?: string;
          preamble?: string;
        };
      };
      Insert: {
        id?: string;
        name: string;
        created_at?: string;
        embed_token?: string;
        config?: {
          primaryColor?: string;
          preamble?: string;
        };
      };
      Update: {
        id?: string;
        name?: string;
        created_at?: string;
        embed_token?: string;
        config?: {
          primaryColor?: string;
          preamble?: string;
        };
      };
    };
    website_content: {
      Row: {
        id: string;
        website_id: string;
        content: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        website_id: string;
        content: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        website_id?: string;
        content?: string;
        created_at?: string;
      };
    };
    chat_messages: {
      Row: {
        id: string;
        website_id: string;
        content: string;
        is_user: boolean;
        created_at: string;
      };
      Insert: {
        id?: string;
        website_id: string;
        content: string;
        is_user: boolean;
        created_at?: string;
      };
      Update: {
        id?: string;
        website_id?: string;
        content?: string;
        is_user?: boolean;
        created_at?: string;
      };
    };
  };
  Views: {
    [_ in never]: never;
  };
  Functions: {
    [_ in never]: never;
  };
  Enums: {
    [_ in never]: never;
  };
  CompositeTypes: {
    [_ in never]: never;
  };
}
