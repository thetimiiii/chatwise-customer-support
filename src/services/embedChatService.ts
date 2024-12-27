import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const createEmbedChatService = (supabase: SupabaseClient<Database>) => {
  return {
    getChatResponse: async (message: string, websiteId: string) => {
      try {
        console.log('Starting embed chat request:', { message, websiteId });
        
        // Get the website's user_id to update their credits
        const { data: website, error: websiteError } = await supabase
          .from('websites')
          .select('user_id')
          .eq('id', websiteId)
          .single();

        if (websiteError) {
          console.error('Website verification failed:', websiteError);
          throw new Error('Failed to verify website');
        }

        // Check credits before making the API call
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('id', website.user_id)
          .single();

        if (profileError || !profile) {
          console.error('Credit check failed:', profileError);
          throw new Error('Failed to check credits');
        }

        if (profile.credits_remaining <= 0) {
          console.error('No credits remaining for user');
          throw new Error('No credits remaining');
        }

        // Make the API call
        const response = await fetch('https://api.cohere.ai/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer u1uJ7ifVjzGHnzYVzsu0HQJiaYGBstRUkXnnGwzs',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            model: 'command',
            preamble: "You are a helpful customer support agent. Be concise and friendly in your responses.",
          }),
        });

        if (!response.ok) {
          console.error('Cohere API error:', response.statusText);
          throw new Error('Failed to get chat response');
        }

        const data = await response.json();

        // Decrement credits after successful response
        const { error: updateError } = await supabase.rpc('decrement_credits', {
          user_id: website.user_id
        });

        if (updateError) {
          console.error('Error updating credits:', updateError);
          // Continue anyway since we got the response
        }

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
