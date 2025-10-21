-- ============================================
-- CREAR SOLO POLÍTICAS FALTANTES
-- ============================================

DO $$
BEGIN
  -- POLÍTICAS PROFILES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- POLÍTICAS USER_ROLES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- POLÍTICAS CANDIDATE_DATA
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view candidates' AND tablename = 'candidate_data') THEN
    CREATE POLICY "Authenticated users can view candidates" ON public.candidate_data FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert candidates' AND tablename = 'candidate_data') THEN
    CREATE POLICY "Admins can insert candidates" ON public.candidate_data FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update candidates' AND tablename = 'candidate_data') THEN
    CREATE POLICY "Admins can update candidates" ON public.candidate_data FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete candidates' AND tablename = 'candidate_data') THEN
    CREATE POLICY "Admins can delete candidates" ON public.candidate_data FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- POLÍTICAS ACCESS_LOGS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert access logs' AND tablename = 'access_logs') THEN
    CREATE POLICY "Authenticated users can insert access logs" ON public.access_logs FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view access logs' AND tablename = 'access_logs') THEN
    CREATE POLICY "Admins can view access logs" ON public.access_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- POLÍTICAS CANDIDATE_VIEW_LOGS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert view logs' AND tablename = 'candidate_view_logs') THEN
    CREATE POLICY "Users can insert view logs" ON public.candidate_view_logs FOR INSERT WITH CHECK (employer_username = public.get_current_username());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own logs or admins can view all' AND tablename = 'candidate_view_logs') THEN
    CREATE POLICY "Users can view own logs or admins can view all" ON public.candidate_view_logs FOR SELECT USING (employer_username = public.get_current_username() OR public.has_role(auth.uid(), 'admin'));
  END IF;

  -- POLÍTICAS EMPLOYER_SEARCH_LOGS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert search logs' AND tablename = 'employer_search_logs') THEN
    CREATE POLICY "Users can insert search logs" ON public.employer_search_logs FOR INSERT WITH CHECK (employer_username = public.get_current_username());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own search logs' AND tablename = 'employer_search_logs') THEN
    CREATE POLICY "Users can update own search logs" ON public.employer_search_logs FOR UPDATE USING (employer_username = public.get_current_username());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own logs or admins can view all' AND tablename = 'employer_search_logs') THEN
    CREATE POLICY "Users can view own logs or admins can view all" ON public.employer_search_logs FOR SELECT USING (employer_username = public.get_current_username() OR public.has_role(auth.uid(), 'admin'));
  END IF;

  -- POLÍTICAS SCHEDULE_REQUESTS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert schedule requests' AND tablename = 'schedule_requests') THEN
    CREATE POLICY "Users can insert schedule requests" ON public.schedule_requests FOR INSERT WITH CHECK (employer_username = public.get_current_username());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own requests or admins can view all' AND tablename = 'schedule_requests') THEN
    CREATE POLICY "Users can view own requests or admins can view all" ON public.schedule_requests FOR SELECT USING (employer_username = public.get_current_username() OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;