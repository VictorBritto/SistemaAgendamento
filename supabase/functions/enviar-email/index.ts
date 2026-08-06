const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
Deno.serve(async (req) => {
  // Tratamento de requisição CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to_email, subject, message } = await req.json()

    if (!to_email || !subject || !message) {
      throw new Error('Faltam parâmetros obrigatórios: to_email, subject, message.')
    }

    // A chave de API será lida do ambiente seguro do Supabase
    // @ts-ignore
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      throw new Error('Chave da API do Resend não configurada na Edge Function.')
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // O endereço do remetente padrão de testes do Resend
        from: 'Sistema de Agendamentos <onboarding@resend.dev>', 
        to: [to_email],
        subject: subject,
        text: message,
      })
    })

    const data = await resendResponse.json()

    if (resendResponse.ok) {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      console.error('Erro retornado pela API do Resend:', data)
      return new Response(JSON.stringify({ error: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
