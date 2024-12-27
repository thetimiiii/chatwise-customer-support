import { NextApiRequest, NextApiResponse } from 'next';
import { getChatResponse } from '@/services/chatService';
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
      .select('id, embed_token')
      .eq('id', websiteId)
      .single();

    if (websiteError || !website) {
      console.error('Website verification failed:', websiteError);
      return res.status(404).json({ message: 'Website not found' });
    }

    if (website.embed_token !== token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const response = await getChatResponse(message, websiteId);
    return res.status(200).json({ text: response });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'No credits remaining') {
      return res.status(402).json({ 
        message: 'No credits remaining',
        details: 'This website has run out of chat credits. Please contact the website owner to purchase more credits.'
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error',
      details: 'An unexpected error occurred. Please try again later.'
    });
  }
}
