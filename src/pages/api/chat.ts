import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import { Configuration, OpenAIApi } from 'openai';

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the middleware
  // await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const { message, websiteId } = req.body;

  if (!token || !websiteId || !message) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Verify token matches website
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('embed_token', token)
      .single();

    if (websiteError || !website) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Initialize OpenAI with the website's OpenAI key
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Get chat response
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: website.config.preamble || "You are a helpful customer support agent." },
        { role: "user", content: message }
      ],
    });

    const response = completion.data.choices[0]?.message?.content || "I apologize, but I am having trouble responding right now.";

    // Log the chat in Supabase
    await supabase.from('messages').insert({
      website_id: websiteId,
      user_message: message,
      bot_response: response,
    });

    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
}
