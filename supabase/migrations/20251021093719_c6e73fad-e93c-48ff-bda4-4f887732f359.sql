-- Create admin user with username 'admin' and password '123'
-- The password will be automatically hashed by the trigger
INSERT INTO public.app_users (username, password, full_name, is_active)
VALUES ('admin', '123', 'Administrator', true)
ON CONFLICT (username) DO UPDATE
  SET password = EXCLUDED.password,
      is_active = true;