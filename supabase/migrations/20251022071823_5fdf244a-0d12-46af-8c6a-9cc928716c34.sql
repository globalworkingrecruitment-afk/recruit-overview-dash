-- ============================================================================
-- MIGRACIÓN DE SEGURIDAD Y PROTECCIÓN DE DATOS
-- Cumplimiento con GDPR y mejores prácticas de seguridad
-- ============================================================================

-- 1. CORREGIR POLÍTICAS RLS DE candidate_data
-- PROBLEMA CRÍTICO: Actualmente cualquier usuario autenticado puede ver TODOS los candidatos
-- SOLUCIÓN: Restringir acceso solo a usuarios con roles específicos

DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidate_data;

-- Solo usuarios con rol 'user' (empleadores) y 'admin' pueden ver candidatos
CREATE POLICY "Authorized users can view candidates"
  ON public.candidate_data
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'user'::public.app_role) 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 2. CORREGIR POLÍTICAS RLS DE schedule_requests
-- PROBLEMA: Usuarios pueden ver solicitudes de otros usuarios con el mismo username
-- SOLUCIÓN: Cada usuario solo ve SUS propias solicitudes

DROP POLICY IF EXISTS "Users can view own requests or admins can view all" ON public.schedule_requests;

-- Crear función para obtener el user_id del username actual
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE id = auth.uid()
$$;

-- Añadir columna user_id a schedule_requests para mejor control de acceso
ALTER TABLE public.schedule_requests 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Actualizar registros existentes con el user_id correcto
UPDATE public.schedule_requests sr
SET user_id = p.id
FROM public.profiles p
WHERE sr.employer_username = p.username AND sr.user_id IS NULL;

-- Nueva política: usuarios solo ven sus propias solicitudes
CREATE POLICY "Users can view own schedule requests"
  ON public.schedule_requests
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Actualizar política de INSERT para incluir user_id
DROP POLICY IF EXISTS "Users can insert schedule requests" ON public.schedule_requests;

CREATE POLICY "Users can insert own schedule requests"
  ON public.schedule_requests
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND employer_username = public.get_current_username()
  );

-- 3. MEJORAR POLÍTICAS RLS DE profiles
-- PROBLEMA: Todos los perfiles son visibles para todos
-- SOLUCIÓN: Usuarios solo ven perfiles necesarios para su trabajo

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Los usuarios pueden ver:
-- 1. Su propio perfil
-- 2. Perfiles si tienen rol de user o admin (necesario para funcionalidad de empleador)
CREATE POLICY "Users can view relevant profiles"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'user'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 4. CORREGIR search_path EN FUNCIONES EXISTENTES
-- Actualizar funciones que no tienen search_path configurado correctamente

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (auth.jwt() ->> 'role') = 'admin'
$$;

CREATE OR REPLACE FUNCTION public.get_user_email_by_id(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users WHERE id = user_id
$$;

-- 5. AÑADIR ÍNDICES PARA MEJORAR RENDIMIENTO DE CONSULTAS RLS
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_schedule_requests_user_id ON public.schedule_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 6. AÑADIR POLÍTICAS DE RETENCIÓN DE DATOS (GDPR)
-- Comentario: Considerar implementar eliminación automática de logs antiguos

COMMENT ON TABLE public.access_logs IS 'Logs de acceso. Considerar retención de 90 días según políticas GDPR';
COMMENT ON TABLE public.candidate_view_logs IS 'Logs de visualización de candidatos. Considerar retención de 90 días';
COMMENT ON TABLE public.employer_search_logs IS 'Logs de búsquedas. Considerar retención de 90 días';

-- 7. AÑADIR AUDITORÍA DE CAMBIOS EN DATOS SENSIBLES
-- Trigger para auditar cambios en candidate_data
CREATE TABLE IF NOT EXISTS public.candidate_data_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data jsonb,
  new_data jsonb
);

ALTER TABLE public.candidate_data_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON public.candidate_data_audit
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Función de auditoría
CREATE OR REPLACE FUNCTION public.audit_candidate_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.candidate_data_audit (candidate_id, changed_by, action, old_data)
    VALUES (OLD.id, auth.uid(), TG_OP, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.candidate_data_audit (candidate_id, changed_by, action, old_data, new_data)
    VALUES (NEW.id, auth.uid(), TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.candidate_data_audit (candidate_id, changed_by, action, new_data)
    VALUES (NEW.id, auth.uid(), TG_OP, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger para auditoría
DROP TRIGGER IF EXISTS audit_candidate_data_changes ON public.candidate_data;
CREATE TRIGGER audit_candidate_data_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.candidate_data
  FOR EACH ROW EXECUTE FUNCTION public.audit_candidate_data();

-- 8. COMENTARIOS DE CUMPLIMIENTO GDPR
COMMENT ON COLUMN public.candidate_data.correo IS 'Dato personal sensible - GDPR Art. 6, 9';
COMMENT ON COLUMN public.candidate_data.nombre IS 'Dato personal sensible - GDPR Art. 6';
COMMENT ON COLUMN public.schedule_requests.employer_email IS 'Dato personal sensible - GDPR Art. 6';
COMMENT ON COLUMN public.schedule_requests.candidate_email IS 'Dato personal sensible - GDPR Art. 6';