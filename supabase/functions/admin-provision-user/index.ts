import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      username?: string
      password?: string
      full_name?: string | null
      email?: string | null
      role?: 'admin' | 'user'
    }

    const username = (body.username || '').trim().toLowerCase()
    const password = (body.password || '').trim()
    const full_name = (body.full_name ?? null)
    const email = (body.email ?? null)
    const role = (body.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user'

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'username and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Provision user request:', { username, email, role })

    // 1) Create/activate in app_users
    const { data: appUser, error: appErr } = await supabase.rpc('admin_create_app_user', {
      p_username: username,
      p_password: password,
      p_full_name: full_name,
      p_email: email
    })

    if (appErr || !appUser) {
      console.error('admin_create_app_user error:', appErr)
      return new Response(JSON.stringify({ error: 'Failed to create app user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2) Ensure Supabase Auth user exists and password matches
    const authEmail = appUser.email || `${appUser.username}@app.local`

    // Try to find auth user
    const { data: existing } = await supabase.auth.admin.listUsers()
    let authUser = existing?.users?.find(u => u.email === authEmail || u.user_metadata?.username === username)

    if (!authUser) {
      console.log('Creating auth user for', authEmail)
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: password,
        email_confirm: true,
        user_metadata: { username, full_name }
      })
      if (createErr) {
        console.error('auth.createUser error:', createErr)
        return new Response(JSON.stringify({ error: 'Failed to create auth user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      authUser = created.user
    } else {
      console.log('Updating auth user password to keep in sync')
      const { error: updErr } = await supabase.auth.admin.updateUserById(authUser.id, {
        password,
        email_confirm: true,
        user_metadata: { username, full_name }
      })
      if (updErr) console.error('auth.updateUserById error:', updErr)
    }

    // 3) Upsert profiles entry for RLS-dependent features
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({ id: authUser!.id, username, full_name }, { onConflict: 'id' })
    if (profileErr) console.error('profiles upsert error:', profileErr)

    // 4) Ensure roles
    // Always ensure base 'user' role exists
    const { error: userRoleErr } = await supabase
      .from('user_roles')
      .upsert({ user_id: authUser!.id, role: 'user' as any }, { onConflict: 'user_id,role' })
    if (userRoleErr) console.error('user role upsert error:', userRoleErr)

    if (role === 'admin') {
      const { error: adminRoleErr } = await supabase
        .from('user_roles')
        .upsert({ user_id: authUser!.id, role: 'admin' as any }, { onConflict: 'user_id,role' })
      if (adminRoleErr) console.error('admin role upsert error:', adminRoleErr)
    }

    return new Response(
      JSON.stringify({ ok: true, user: { id: authUser!.id, username, email: authEmail }, role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('Unexpected error in admin-provision-user:', e)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})