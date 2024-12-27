import { NextApiRequest, NextApiResponse } from 'next';
import { getChatResponse } from '@/services/chatService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, websiteId } = req.body;

    if (!message || !websiteId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const response = await getChatResponse(message, websiteId);
    return res.status(200).json({ text: response });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      message: errorMessage === 'No credits remaining' 
        ? 'No credits remaining' 
        : 'Failed to get chat response' 
    });
  }
}
