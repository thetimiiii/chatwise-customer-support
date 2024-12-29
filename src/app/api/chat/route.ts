import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

// Debug logging function
function logDebug(message: string, data?: any) {
  console.log(`[ChatAPI Debug] ${message}`, data || '');
}

// Handle preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Content-Length': '0',
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    logDebug('Request body received', body);

    const { websiteId, message, token, config } = body;

    // Validate request
    if (!websiteId || !message || !token) {
      logDebug('Missing required fields', { websiteId, message, token });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Invalid token or website ID' },
        { status: 401 }
      );
    }

    // Get website content and configuration
    const { data: websiteContent, error: contentError } = await supabase
      .from('website_content')
      .select('*')
      .eq('website_id', websiteId)
      .single();

    if (contentError) {
      logDebug('Error fetching website content', contentError);
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

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    logDebug('Chat API error', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
