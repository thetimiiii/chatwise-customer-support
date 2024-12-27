import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const websiteId = req.query.id as string;
    const token = req.query.token as string;

    if (!websiteId || !token) {
      return res.status(400).json({ message: 'Website ID and token are required' });
    }

    // Get website configuration and verify token
    const { data: website, error } = await supabase
      .from('websites')
      .select('config, embed_token')
      .eq('id', websiteId)
      .single();

    if (error) {
      console.error('Error fetching website config:', error);
      return res.status(500).json({ message: 'Failed to fetch website configuration' });
    }

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    if (website.embed_token !== token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(200).json(website.config);
  } catch (error) {
    console.error('Error in config endpoint:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
