-- Verificar y crear usuario de prueba usando función administrativa
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar si ya existe el perfil
  SELECT id INTO v_user_id FROM public.profiles WHERE username = 'prueba';
  
  -- Si no existe, necesitamos crear el usuario manualmente
  -- Este usuario se creará vía Auth UI o Admin Dashboard
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'El usuario de prueba necesita ser creado mediante el panel de administración';
    RAISE NOTICE 'Credenciales sugeridas:';
    RAISE NOTICE '  Username: prueba';
    RAISE NOTICE '  Email: prueba@globalworking.com';
    RAISE NOTICE '  Password: prueba123';
  ELSE
    RAISE NOTICE 'El usuario de prueba ya existe con ID: %', v_user_id;
  END IF;
END $$;