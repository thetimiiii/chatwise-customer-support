import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export class ChatCore {
  private supabase: SupabaseClient<Database>;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async sendMessage(websiteId: string, message: string, role: 'user' | 'assistant' = 'user') {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          website_id: websiteId,
          content: message,
          role: role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getHistory(websiteId: string) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting history:', error);
      throw error;
    }
  }

  async updateConfig(websiteId: string, config: any) {
    try {
      const { data, error } = await this.supabase
        .from('websites')
        .update({ config })
        .eq('id', websiteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }

  async getConfig(websiteId: string) {
    try {
      const { data, error } = await this.supabase
        .from('websites')
        .select('config')
        .eq('id', websiteId)
        .single();

      if (error) throw error;
      return data.config;
    } catch (error) {
      console.error('Error getting config:', error);
      throw error;
    }
  }

  subscribeToConfig(websiteId: string, callback: (config: any) => void) {
    return this.supabase
      .channel(`website-config-${websiteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'websites',
          filter: `id=eq.${websiteId}`,
        },
        (payload) => {
          callback(payload.new.config);
        }
      )
      .subscribe();
  }
}
