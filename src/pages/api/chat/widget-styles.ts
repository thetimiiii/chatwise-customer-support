import { generateWidgetStyles } from '@/components/chat/widget-styles';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || '*';
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set content type and cache headers
  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');
  res.setHeader('Vary', 'Origin');

  // Generate and return styles
  const styles = generateWidgetStyles();
  res.status(200).send(styles);
}
