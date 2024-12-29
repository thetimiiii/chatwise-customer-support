import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const apiKey = req.headers.get('X-Website-API-Key')
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key required' }), 
      { status: 401 }
    )
  }

  // Verify API key and get website
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('api_key', apiKey)
    .single()

  if (error || !website) {
    return new Response(
      JSON.stringify({ error: 'Invalid API key' }), 
      { status: 401 }
    )
  }

  // Process the chat request
  try {
    const { message } = await req.json()
    
    // Here you would integrate with your AI provider
    const response = "This is a mock response. Replace with actual AI integration."

    return new Response(
      JSON.stringify({ response }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-Website-API-Key'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { status: 500 }
    )
  }
})
