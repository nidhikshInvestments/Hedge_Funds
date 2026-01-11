-- Add investment start date to portfolios table
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS start_date date;

-- Set start_date to created_at for existing portfolios
UPDATE public.portfolios 
SET start_date = created_at::date 
WHERE start_date IS NULL;
