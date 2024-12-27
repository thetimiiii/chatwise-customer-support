import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const createEmbedChatService = (supabase: SupabaseClient<Database>) => {
  return {
    getChatResponse: async (message: string, websiteId: string) => {
      try {
        // Get the website config for the preamble
        const { data: website, error: websiteError } = await supabase
          .from('websites')
          .select('config')
          .eq('id', websiteId)
          .single();

        if (websiteError) {
          console.error('Website verification failed:', websiteError);
          throw new Error('Failed to verify website');
        }

        // Make the API call to Cohere
        const response = await fetch('https://api.cohere.ai/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer u1uJ7ifVjzGHnzYVzsu0HQJiaYGBstRUkXnnGwzs',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            model: 'command',
            preamble: website.config?.preamble || "You are a helpful customer support agent. Be concise and friendly in your responses.",
          }),
        });

        if (!response.ok) {
          console.error('Cohere API error:', response.statusText);
          throw new Error('Failed to get chat response');
        }

        const data = await response.json();

        // Track the chat session
        const { error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([{ 
            website_id: websiteId,
            messages_count: 1,
            started_at: new Date().toISOString()
          }]);

        if (sessionError) {
          console.error('Error tracking chat session:', sessionError);
        }

        return data.text;
      } catch (error) {
        console.error('Chat error:', error);
        throw error;
      }
    }
  };
};
