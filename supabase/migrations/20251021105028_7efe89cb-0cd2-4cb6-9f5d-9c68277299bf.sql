-- Insertar datos de ejemplo de candidatos
INSERT INTO public.candidate_data (
  nombre, correo, anio_nacimiento,
  nacionalidad_en, nacionalidad_no,
  profesion_en, profesion_no,
  idiomas_en, idiomas_no,
  estado
) VALUES
  ('María García', 'maria.garcia@example.com', 1990, 'Spanish', 'Spansk', 'Registered Nurse', 'Sykepleier', 'Spanish, English (B2), Norwegian (A2)', 'Spansk, Engelsk (B2), Norsk (A2)', 'activo'),
  ('Juan Pérez', 'juan.perez@example.com', 1985, 'Mexican', 'Meksikansk', 'Medical Doctor', 'Lege', 'Spanish, English (C1)', 'Spansk, Engelsk (C1)', 'activo'),
  ('Ana Martínez', 'ana.martinez@example.com', 1992, 'Colombian', 'Colombiansk', 'Physical Therapist', 'Fysioterapeut', 'Spanish, English (B1), Norwegian (B1)', 'Spansk, Engelsk (B1), Norsk (B1)', 'activo'),
  ('Carlos Rodríguez', 'carlos.rodriguez@example.com', 1988, 'Argentine', 'Argentinsk', 'Dentist', 'Tannlege', 'Spanish, English (B2)', 'Spansk, Engelsk (B2)', 'activo'),
  ('Laura López', 'laura.lopez@example.com', 1995, 'Spanish', 'Spansk', 'Nursing Assistant', 'Hjelpepleier', 'Spanish, English (A2), Norwegian (A1)', 'Spansk, Engelsk (A2), Norsk (A1)', 'activo')
ON CONFLICT DO NOTHING;