import { SupabaseClient } from '@supabase/supabase-js';

export const createEmbedChatService = (supabase: SupabaseClient) => {
  return {
    async getChatResponse(message: string, websiteId: string) {
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { message, websiteId }
        });

        if (error) throw error;
        return data.response;
      } catch (error) {
        console.error('Error in chat service:', error);
        throw error;
      }
    }
  };
}; 