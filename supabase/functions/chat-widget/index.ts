import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-api-key, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'init':
        // Initialize widget and get configuration
        const { data: website, error: websiteError } = await supabase
          .from('websites')
          .select('*')
          .eq('api_key', apiKey)
          .single()

        if (websiteError || !website) {
          throw new Error('Invalid API key')
        }

        return new Response(
          JSON.stringify({ config: website.config }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'chat':
        const { message, websiteId } = await req.json()
        
        // Create chat session
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            website_id: websiteId,
            messages_count: 1,
          })
          .select()
          .single()

        if (sessionError) {
          throw sessionError
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
            preamble: website.config?.preamble || 'You are a helpful customer support agent.',
            conversation_id: session.id,
          }),
        })

        const cohereData = await cohereResponse.json()
        
        // Store messages
        await supabase.from('messages').insert([
          {
            session_id: session.id,
            content: message,
            role: 'user'
          },
          {
            session_id: session.id,
            content: cohereData.text,
            role: 'assistant'
          }
        ])

        return new Response(
          JSON.stringify({ 
            response: cohereData.text,
            sessionId: session.id
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
