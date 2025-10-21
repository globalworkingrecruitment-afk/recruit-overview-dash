-- Create function to get user email by ID (for login with username)
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users WHERE id = user_id
$$;