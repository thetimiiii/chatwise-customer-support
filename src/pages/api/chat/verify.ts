import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const { websiteId } = req.body;

  if (!token || !websiteId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Verify the website exists and token matches
    const { data: website, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('token', token)
      .single();

    if (error || !website) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return minimal website info to confirm verification
    res.status(200).json({
      verified: true,
      websiteId: website.id,
      name: website.name
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
