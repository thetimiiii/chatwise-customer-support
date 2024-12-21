import { supabase } from "@/integrations/supabase/client";

export const getChatResponse = async (message: string, websiteId: string) => {
  try {
    console.log('Sending chat message:', { message, websiteId });
    
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
      throw new Error('Failed to get chat response');
    }

    const data = await response.json();
    console.log('Received chat response:', data);

    // Track the chat session
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([{ 
        website_id: websiteId,
        messages_count: 1
      }]);

    if (sessionError) {
      console.error('Error tracking chat session:', sessionError);
    }

    return data.text;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};