import { NextApiRequest, NextApiResponse } from 'next';
import { getChatResponse } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, websiteId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!websiteId) {
      return res.status(400).json({ message: 'Website ID is required' });
    }

    // Verify website exists
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id')
      .eq('id', websiteId)
      .single();

    if (websiteError || !website) {
      console.error('Website verification failed:', websiteError);
      return res.status(404).json({ message: 'Website not found' });
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

    if (errorMessage === 'Failed to verify website') {
      return res.status(404).json({ 
        message: 'Website not found',
        details: 'The specified website could not be found. Please check your configuration.'
      });
    }

    if (errorMessage === 'Failed to check credits') {
      return res.status(500).json({ 
        message: 'Credit check failed',
        details: 'Unable to verify available credits. Please try again later.'
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error',
      details: 'An unexpected error occurred. Please try again later.'
    });
  }
}
