-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get current user's username
CREATE OR REPLACE FUNCTION public.get_current_username()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT username FROM public.profiles WHERE id = auth.uid()
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Update candidate_data RLS policies
DROP POLICY IF EXISTS candidate_data_select_auth ON public.candidate_data;
DROP POLICY IF EXISTS candidate_data_insert_auth ON public.candidate_data;
DROP POLICY IF EXISTS candidate_data_update_auth ON public.candidate_data;
DROP POLICY IF EXISTS candidate_data_delete_auth ON public.candidate_data;

CREATE POLICY "Authenticated users can view candidates"
  ON public.candidate_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert candidates"
  ON public.candidate_data FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update candidates"
  ON public.candidate_data FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete candidates"
  ON public.candidate_data FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update access_logs RLS policies
DROP POLICY IF EXISTS access_logs_insert_any_auth ON public.access_logs;
DROP POLICY IF EXISTS access_logs_select_admin ON public.access_logs;

CREATE POLICY "Authenticated users can insert access logs"
  ON public.access_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update candidate_view_logs RLS policies
DROP POLICY IF EXISTS cvl_select_admin_or_owner ON public.candidate_view_logs;
DROP POLICY IF EXISTS cvl_insert_any_auth ON public.candidate_view_logs;

CREATE POLICY "Users can insert view logs"
  ON public.candidate_view_logs FOR INSERT
  TO authenticated
  WITH CHECK (employer_username = public.get_current_username());

CREATE POLICY "Users can view own logs or admins can view all"
  ON public.candidate_view_logs FOR SELECT
  TO authenticated
  USING (employer_username = public.get_current_username() OR public.has_role(auth.uid(), 'admin'));

-- Update employer_search_logs RLS policies
DROP POLICY IF EXISTS esl_insert_owner ON public.employer_search_logs;
DROP POLICY IF EXISTS esl_update_owner ON public.employer_search_logs;
DROP POLICY IF EXISTS esl_select_admin_or_owner ON public.employer_search_logs;

CREATE POLICY "Users can insert search logs"
  ON public.employer_search_logs FOR INSERT
  TO authenticated
  WITH CHECK (employer_username = public.get_current_username());

CREATE POLICY "Users can update own search logs"
  ON public.employer_search_logs FOR UPDATE
  TO authenticated
  USING (employer_username = public.get_current_username());

CREATE POLICY "Users can view own logs or admins can view all"
  ON public.employer_search_logs FOR SELECT
  TO authenticated
  USING (employer_username = public.get_current_username() OR public.has_role(auth.uid(), 'admin'));

-- Update schedule_requests RLS policies
DROP POLICY IF EXISTS sr_insert_any_auth ON public.schedule_requests;
DROP POLICY IF EXISTS sr_select_admin_or_owner ON public.schedule_requests;

CREATE POLICY "Users can insert schedule requests"
  ON public.schedule_requests FOR INSERT
  TO authenticated
  WITH CHECK (employer_username = public.get_current_username());

CREATE POLICY "Users can view own requests or admins can view all"
  ON public.schedule_requests FOR SELECT
  TO authenticated
  USING (employer_username = public.get_current_username() OR public.has_role(auth.uid(), 'admin'));