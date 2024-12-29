import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Debug logging function
function logDebug(message: string, data?: any) {
  console.log(`[ChatAPI Debug] ${message}`, data || '');
}

export const runtime = 'edge';

// Handle preflight requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { message, websiteId, token, config } = await request.json();

    if (!message || !websiteId || !token) {
      logDebug('Missing required fields', { websiteId, message, token });
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Verify token and get website data
    logDebug('Verifying token and fetching website data', { websiteId, token });
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Get website content
    const { data: websiteContent, error: contentError } = await supabase
      .from('website_content')
      .select('*')
      .eq('website_id', websiteId)
      .single();

    if (contentError) {
      logDebug('Error fetching website content', contentError);
    }

    // Get or create chat session
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('website_id', websiteId)
      .is('ended_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let sessionId = existingSession?.id;

    if (!sessionId) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert([
          {
            website_id: websiteId,
            started_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      sessionId = newSession?.id;
    }

    // Get chat history
    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const messages = chatHistory?.map((msg) => ({
      content: msg.content,
      is_user: msg.is_user,
    })) || [];

    // Add user's new message
    messages.push({ content: message, is_user: true });

    // Store user message
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        content: message,
        is_user: true,
      },
    ]);

    // Prepare conversation history for Cohere
    const conversationHistory = messages.map((msg) => ({
      role: msg.is_user ? 'USER' : 'ASSISTANT',
      message: msg.content
    }));

    // Prepare website context
    const websiteContext = websiteContent?.content || '';
    const defaultPreamble = `You are an AI assistant specifically trained to help with questions about ${website.name}. 
You have access to the following information about the website:

${websiteContext}

Please use this information to provide accurate and helpful responses. If you're unsure about something or if the information isn't in the provided context, please say so instead of making assumptions.

Be concise, friendly, and professional in your responses. Focus on providing accurate information from the website context.`;

    logDebug('Calling Cohere API', {
      messageLength: message.length,
      historyLength: conversationHistory.length,
      contextLength: websiteContext.length
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
        preamble: config?.preamble || defaultPreamble,
        temperature: 0.7,
        connectors: [{ id: "web-search" }],
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

    // Store AI response
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        content: aiResponse,
        is_user: false,
      },
    ]);

    // Update message count
    if (sessionId) {
      await supabase
        .from('chat_sessions')
        .update({ messages_count: messages.length + 1 })
        .eq('id', sessionId);
    }

    return new NextResponse(
      JSON.stringify({ response: aiResponse }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
