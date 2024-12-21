import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  websiteId: string
  sessionId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message, websiteId, sessionId } = await req.json() as ChatRequest

    // Validate website exists
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('url')
      .eq('id', websiteId)
      .single()

    if (websiteError || !website) {
      console.error('Website not found:', websiteError)
      return new Response(
        JSON.stringify({ error: 'Website not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create or update chat session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          website_id: websiteId,
          messages_count: 1,
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating chat session:', sessionError)
        return new Response(
          JSON.stringify({ error: 'Failed to create chat session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      currentSessionId = session.id
    } else {
      await supabase
        .from('chat_sessions')
        .update({ 
          messages_count: supabase.sql`messages_count + 1`,
        })
        .eq('id', currentSessionId)
    }

    // Call Cohere API
    const cohereResponse = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('COHERE_API_KEY')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        model: 'command',
        preamble: `You are a helpful customer support agent for the website ${website.url}. 
                   Be friendly, concise, and professional in your responses.`,
        conversation_id: currentSessionId,
      }),
    })

    const cohereData = await cohereResponse.json()

    return new Response(
      JSON.stringify({
        response: cohereData.text,
        sessionId: currentSessionId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing chat request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})