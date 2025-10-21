-- ============================================
-- CREACIÓN DE TABLAS FALTANTES
-- ============================================

-- 1. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Tabla de datos de candidatos
CREATE TABLE IF NOT EXISTS public.candidate_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  anio_nacimiento SMALLINT NOT NULL,
  nacionalidad_en TEXT NOT NULL DEFAULT '',
  nacionalidad_no TEXT NOT NULL DEFAULT '',
  profesion_en TEXT,
  profesion_no TEXT,
  formacion_en TEXT,
  formacion_no TEXT,
  experiencia_medica_en TEXT,
  experiencia_medica_no TEXT,
  experiencia_no_medica_en TEXT,
  experiencia_no_medica_no TEXT,
  idiomas_en TEXT NOT NULL DEFAULT '',
  idiomas_no TEXT NOT NULL DEFAULT '',
  carta_en TEXT,
  carta_no TEXT,
  carta_resumen_en TEXT,
  carta_resumen_no TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.candidate_data ENABLE ROW LEVEL SECURITY;

-- 4. Tabla de logs de acceso
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  role app_role NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- 5. Tabla de logs de visualización de candidatos
CREATE TABLE IF NOT EXISTS public.candidate_view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_username TEXT NOT NULL,
  candidate_id UUID NOT NULL,
  candidate_name TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.candidate_view_logs ENABLE ROW LEVEL SECURITY;

-- 6. Tabla de logs de búsqueda
CREATE TABLE IF NOT EXISTS public.employer_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_username TEXT NOT NULL,
  query TEXT NOT NULL,
  candidate_names TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employer_search_logs ENABLE ROW LEVEL SECURITY;

-- 7. Tabla de solicitudes de entrevistas
CREATE TABLE IF NOT EXISTS public.schedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_username TEXT NOT NULL,
  employer_name TEXT,
  employer_email TEXT NOT NULL,
  candidate_id UUID NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  availability TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.schedule_requests ENABLE ROW LEVEL SECURITY;