import { generateWidgetStyles } from '@/components/chat/widget-styles';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  res.status(200).send(generateWidgetStyles());
}
