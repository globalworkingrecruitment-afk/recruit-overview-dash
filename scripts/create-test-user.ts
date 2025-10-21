// Script para crear usuario de prueba
// Usuario: prueba / prueba@globalworking.com
// Contraseña: prueba123

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zweehdlhfqowvrzwzsvv.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZWVoZGxoZnFvd3Zyend6c3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI3NjA4MywiZXhwIjoyMDc1ODUyMDgzfQ.zO7PY4wYjI0e5BXbWGGEKoUKMQo5CfnJCqEE7E5UiAs";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('Creating test user...');
  
  // Primero intentar eliminar el usuario si existe
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === 'prueba@globalworking.com');
  
  if (existingUser) {
    console.log('Deleting existing test user...');
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }
  
  // Crear nuevo usuario
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'prueba@globalworking.com',
    password: 'prueba123',
    email_confirm: true,
    user_metadata: {
      username: 'prueba',
      full_name: 'Usuario de Prueba'
    }
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('✓ User created successfully!');
  console.log('  Username: prueba');
  console.log('  Email: prueba@globalworking.com');
  console.log('  Password: prueba123');
  console.log('  User ID:', data.user?.id);
}

createTestUser();
