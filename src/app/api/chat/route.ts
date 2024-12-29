import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

// Helper function to handle CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Debug logging function
function logDebug(message: string, data?: any) {
  console.log(`[ChatAPI Debug] ${message}`, data || '');
}

// Handle preflight requests
export async function OPTIONS(request: Request) {
  logDebug('Handling OPTIONS request', {
    origin: request.headers.get('origin'),
    method: request.method,
  });

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(),
      'Content-Length': '0',
      'Connection': 'keep-alive',
    }
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders();
  const requestOrigin = request.headers.get('origin');
  logDebug('Handling POST request', { origin: requestOrigin });

  try {
    const body = await request.json();
    logDebug('Request body received', body);

    const { websiteId, message, token, config } = body;

    // Validate request
    if (!websiteId || !message || !token) {
      logDebug('Missing required fields', { websiteId, message, token });
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Verify token
    logDebug('Verifying token', { websiteId, token });
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('embed_token', token)
      .single();

    if (websiteError || !website) {
      logDebug('Token verification failed', { error: websiteError });
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token or website ID' }),
        { 
          status: 401,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get conversation history
    logDebug('Fetching conversation history', { websiteId });
    const { data: messages, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('website_id', websiteId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      logDebug('Error fetching chat history', historyError);
    }

    // Prepare conversation history for Cohere
    const conversationHistory = messages?.map(msg => ({
      role: msg.is_user ? 'USER' : 'ASSISTANT',
      message: msg.content
    })) || [];

    logDebug('Calling Cohere API', {
      messageLength: message.length,
      historyLength: conversationHistory.length
    });

    // Call Cohere API
    const cohereResponse = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        chat_history: conversationHistory,
        preamble: config?.preamble || "You are a helpful customer support agent. Be concise and friendly in your responses.",
      }),
    });

    if (!cohereResponse.ok) {
      const cohereError = await cohereResponse.text();
      logDebug('Cohere API error', {
        status: cohereResponse.status,
        error: cohereError
      });
      throw new Error('Failed to get AI response');
    }

    const cohereData = await cohereResponse.json();
    const aiResponse = cohereData.text || 'Sorry, I could not generate a response.';
    logDebug('Received Cohere response', {
      responseLength: aiResponse.length
    });

    // Save messages to database
    logDebug('Saving messages to database');
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
      logDebug('Error saving messages', { saveUserMsgError, saveAiMsgError });
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
    logDebug('Chat API error', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
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
