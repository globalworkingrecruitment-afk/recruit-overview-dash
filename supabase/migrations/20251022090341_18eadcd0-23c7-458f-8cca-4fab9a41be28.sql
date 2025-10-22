-- Allow anio_nacimiento and correo to be nullable in candidate_data table
ALTER TABLE public.candidate_data 
  ALTER COLUMN anio_nacimiento DROP NOT NULL;

ALTER TABLE public.candidate_data 
  ALTER COLUMN correo DROP NOT NULL;