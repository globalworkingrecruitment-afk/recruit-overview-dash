import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { identifier, password } = await req.json()

    console.log('Login attempt:', { identifier })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Primero autenticar contra app_users
    const { data: appUser, error: appUserError } = await supabaseClient
      .rpc('authenticate_app_user', {
        p_identifier: identifier,
        p_password: password
      })

    console.log('App user authentication result:', { appUser, error: appUserError })

    // Verificar si la autenticación falló o si el usuario no existe (null o con id null)
    if (appUserError || !appUser || !appUser.id) {
      console.log('Authentication failed - invalid credentials')
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Usuario autenticado en app_users, ahora verificar/crear en Supabase Auth
    let authEmail = appUser.email || `${appUser.username}@app.local`
    
    console.log('Checking if user exists in Auth:', { authEmail })

    // Intentar encontrar el usuario en Auth
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers()
    let authUser = existingUsers?.users?.find(u => 
      u.email === authEmail || u.user_metadata?.username === appUser.username
    )

    console.log('Existing auth user:', { found: !!authUser })

    // Si no existe en Auth, crear el usuario
    if (!authUser) {
      console.log('Creating user in Auth')
      const { data: newAuthUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: authEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: appUser.username,
          full_name: appUser.full_name
        }
      })

      if (createError) {
        console.error('Error creating auth user:', createError)
        return new Response(
          JSON.stringify({ error: 'Error creating authentication session' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      authUser = newAuthUser.user
    }

    console.log('Attempting sign in')

    // Autenticar contra Supabase Auth para obtener los tokens
    let { data, error } = await supabaseClient.auth.signInWithPassword({
      email: authEmail,
      password: password,
    })

    console.log('Sign in result:', { success: !!data, error })

    // Si las credenciales del usuario en Auth no coinciden, sincronizamos la contraseña y reintentamos
    if (error && (error as any).status === 400) {
      try {
        if (authUser?.id) {
          console.log('Resetting auth password to match app_users and retrying')
          const { error: updateErr } = await supabaseClient.auth.admin.updateUserById(authUser.id, {
            password,
            email_confirm: true,
            user_metadata: { username: appUser.username, full_name: appUser.full_name }
          })
          if (updateErr) {
            console.error('Error updating auth user password:', updateErr)
          } else {
            const retry = await supabaseClient.auth.signInWithPassword({ email: authEmail, password })
            data = retry.data
            error = retry.error as any
            console.log('Retry sign in result:', { success: !!data, error })
          }
        }
      } catch (e) {
        console.error('Unexpected error when syncing password:', e)
      }
    }

    if (error) {
      return new Response(
        JSON.stringify({ error: (error as any).message || 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ session: data.session }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})