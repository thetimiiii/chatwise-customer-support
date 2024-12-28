import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

// Helper function to handle CORS
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

export async function POST(request: Request) {
  try {
    const { websiteId, message, token, config } = await request.json();

    // Validate request
    if (!websiteId || !message || !token) {
      return corsResponse(
        NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      );
    }

    // Verify token
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('embed_token', token)
      .single();

    if (websiteError || !website) {
      return corsResponse(
        NextResponse.json(
          { error: 'Invalid token or website ID' },
          { status: 401 }
        )
      );
    }

    // Get conversation history
    const { data: messages, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('website_id', websiteId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
    }

    // Prepare conversation history for Cohere
    const conversationHistory = messages?.map(msg => ({
      role: msg.is_user ? 'USER' : 'ASSISTANT',
      message: msg.content
    })) || [];

    // Add current message
    conversationHistory.push({
      role: 'USER',
      message: message
    });

    // Call Cohere API
    const cohereResponse = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        message: message,
        chat_history: conversationHistory,
        preamble: config?.preamble || "You are a helpful customer support agent. Be concise and friendly in your responses.",
      }),
    });

    if (!cohereResponse.ok) {
      console.error('Cohere API error:', cohereResponse.statusText);
      throw new Error('Failed to get AI response');
    }

    const cohereData = await cohereResponse.json();
    const aiResponse = cohereData.text || 'Sorry, I could not generate a response.';

    // Save messages to database
    const { error: saveUserMsgError } = await supabase
      .from('chat_messages')
      .insert({
        website_id: websiteId,
        content: message,
        is_user: true
      });

    const { error: saveAiMsgError } = await supabase
      .from('chat_messages')
      .insert({
        website_id: websiteId,
        content: aiResponse,
        is_user: false
      });

    if (saveUserMsgError || saveAiMsgError) {
      console.error('Error saving messages:', { saveUserMsgError, saveAiMsgError });
    }

    return corsResponse(NextResponse.json({ message: aiResponse }));
  } catch (error) {
    console.error('Chat API error:', error);
    return corsResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}
