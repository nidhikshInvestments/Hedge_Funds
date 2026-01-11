-- Create company_info table for admin-editable content
CREATE TABLE IF NOT EXISTS public.company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text,
  mission text,
  tagline text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default values
INSERT INTO public.company_info (description, mission, tagline)
VALUES (
  'Nidhiksh Investments is a premier wealth management firm dedicated to helping investors achieve their financial goals through strategic portfolio management and personalized investment solutions.',
  'To empower investors with exceptional returns through disciplined investment strategies and transparent portfolio management.',
  'Growing Wealth, Building Futures'
)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read company info
CREATE POLICY "Anyone can view company info" ON public.company_info
  FOR SELECT USING (true);

-- Policy: Only admins can update company info
CREATE POLICY "Admins can update company info" ON public.company_info
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
