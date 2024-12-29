import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

// Helper function to handle CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(),
      'Content-Length': '0',
      'Connection': 'keep-alive'
    }
  });
}

export async function POST(request: Request) {
  // Add CORS headers to all responses
  const headers = corsHeaders();

  try {
    const { websiteId, message, token, config } = await request.json();

    // Validate request
    if (!websiteId || !message || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
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
      return NextResponse.json(
        { error: 'Invalid token or website ID' },
        { status: 401, headers }
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

    return new NextResponse(
      JSON.stringify({ message: aiResponse }),
      { 
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
