import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const websiteId = req.query.id as string;

    if (!websiteId) {
      return res.status(400).json({ message: 'Website ID is required' });
    }

    // Get website configuration
    const { data: website, error } = await supabase
      .from('websites')
      .select('config')
      .eq('id', websiteId)
      .single();

    if (error) {
      console.error('Error fetching website config:', error);
      return res.status(500).json({ message: 'Failed to fetch website configuration' });
    }

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    return res.status(200).json(website.config);
  } catch (error) {
    console.error('Error in config endpoint:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
