-- Crear triggers solo si no existen
DO $$
BEGIN
  -- Trigger para profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Trigger para candidate_data
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_candidate_data_updated_at') THEN
    CREATE TRIGGER update_candidate_data_updated_at
      BEFORE UPDATE ON public.candidate_data
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Trigger para crear perfil al registrarse
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;