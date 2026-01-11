-- Add initial_investment to portfolios table to track starting amount
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS initial_investment DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deposits DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create investments table to track each deposit/investment from investor
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  investment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON public.investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_date ON public.investments(investment_date);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Investors can view their own investments
CREATE POLICY "Investors can view their own investments"
  ON public.investments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE id = portfolio_id AND investor_id = auth.uid()
    )
  );

-- Admins can manage all investments
CREATE POLICY "Admins can view all investments"
  ON public.investments FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert investments"
  ON public.investments FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update investments"
  ON public.investments FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete investments"
  ON public.investments FOR DELETE
  USING (public.is_admin(auth.uid()));
