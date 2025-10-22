-- Set default value to 0 for anio_nacimiento and make it NOT NULL again
ALTER TABLE public.candidate_data 
  ALTER COLUMN anio_nacimiento SET DEFAULT 0;

ALTER TABLE public.candidate_data 
  ALTER COLUMN anio_nacimiento SET NOT NULL;

-- Update any existing NULL values to 0
UPDATE public.candidate_data 
SET anio_nacimiento = 0 
WHERE anio_nacimiento IS NULL;