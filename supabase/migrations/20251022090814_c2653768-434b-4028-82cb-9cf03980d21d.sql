-- Ensure correo allows NULL values and set default to empty string
ALTER TABLE public.candidate_data 
  ALTER COLUMN correo DROP NOT NULL;

ALTER TABLE public.candidate_data 
  ALTER COLUMN correo SET DEFAULT '';