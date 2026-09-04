import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FAIL = 'Username atau kata sandi salah'
const UNCONFIRMED = 'Akun belum dikonfirmasi. Cek kotak masuk email Anda.'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    if (req.method !== 'POST') return json({ error: FAIL })

    const { username, password } = await req.json()

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return json({ error: FAIL })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()

    if (profileError || !profile) return json({ error: FAIL })

    const { data: user, error: userError } = await admin.auth.admin.getUserById(
      profile.id
    )
    const email = user.user?.email
    if (userError || !email) return json({ error: FAIL })

    const { data, error } = await admin.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.session) {
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        return json({ error: UNCONFIRMED })
      }
      return json({ error: FAIL })
    }

    return json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    })
  } catch {
    return json({ error: FAIL })
  }
})

function json(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}
