import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, websiteId, token } = req.body;

    if (!message || !websiteId || !token) {
      return res.status(400).json({ message: 'Message, website ID, and token are required' });
    }

    // Verify website exists and token is valid
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, user_id, embed_token')
      .eq('id', websiteId)
      .single();

    if (websiteError || !website) {
      console.error('Website verification failed:', websiteError);
      return res.status(404).json({ message: 'Website not found' });
    }

    if (website.embed_token !== token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check credits before making the API call
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', website.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Credit check failed:', profileError);
      return res.status(500).json({ message: 'Failed to check credits' });
    }

    if (profile.credits_remaining <= 0) {
      return res.status(402).json({ message: 'No credits remaining' });
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
      return res.status(500).json({ message: 'Failed to get chat response' });
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

    return res.status(200).json({ text: data.text });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
