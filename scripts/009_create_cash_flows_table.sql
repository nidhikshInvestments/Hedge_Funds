-- Create cash_flows table for tracking deposits and withdrawals
-- Following the spec: deposits are NEGATIVE, withdrawals are POSITIVE
CREATE TABLE IF NOT EXISTS public.cash_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount numeric(15, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'fee', 'tax', 'other')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cash_flows_portfolio_id ON public.cash_flows(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_cash_flows_date ON public.cash_flows(date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_flows_portfolio_date ON public.cash_flows(portfolio_id, date);

-- Enable RLS
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;

-- Investors can view their own cash flows
CREATE POLICY "Investors can view their own cash flows"
  ON public.cash_flows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE id = portfolio_id AND investor_id = auth.uid()
    )
  );

-- Admins can view all cash flows
CREATE POLICY "Admins can view all cash flows"
  ON public.cash_flows FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can insert cash flows
CREATE POLICY "Admins can insert cash flows"
  ON public.cash_flows FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update cash flows
CREATE POLICY "Admins can update cash flows"
  ON public.cash_flows FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Admins can delete cash flows
CREATE POLICY "Admins can delete cash flows"
  ON public.cash_flows FOR DELETE
  USING (public.is_admin(auth.uid()));
