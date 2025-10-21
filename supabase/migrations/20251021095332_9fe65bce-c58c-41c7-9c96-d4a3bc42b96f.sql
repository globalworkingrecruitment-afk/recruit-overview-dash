-- Primero, limpiar cualquier usuario admin existente si lo hay
DELETE FROM public.user_roles WHERE role = 'admin';

-- Nota: Para crear el usuario administrador debes seguir estos pasos:
-- 1. Ve a Supabase Dashboard -> Authentication -> Users -> Add User
-- 2. Crea un usuario con:
--    - Email: admin@recruit.com (o el email que prefieras)
--    - Password: (el que quieras)
--    - Confirm email: marcado (para evitar verificación)
--
-- 3. Una vez creado, ejecuta esta consulta reemplazando 'TU_EMAIL_ADMIN' con el email que usaste:

-- Ejemplo de cómo asignar rol de admin a un usuario (descomenta y edita):
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'admin@recruit.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- También asegúrate de que el perfil tenga username 'admin':
-- UPDATE public.profiles
-- SET username = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@recruit.com');