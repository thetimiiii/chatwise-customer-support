import { generateWidgetStyles } from '@/components/chat/widget-styles';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set content type and cache headers
  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

  // Generate and return styles
  res.status(200).send(generateWidgetStyles());
}
