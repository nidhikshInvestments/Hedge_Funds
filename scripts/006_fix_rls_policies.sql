-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create a security definer function to check if user is admin
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Now create policies using the security definer function
-- This prevents infinite recursion
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Update portfolio policies to use the same pattern
DROP POLICY IF EXISTS "Admins can view all portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Admins can manage all portfolios" ON public.portfolios;

CREATE POLICY "Admins can view all portfolios"
  ON public.portfolios FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all portfolios"
  ON public.portfolios FOR ALL
  USING (public.is_admin(auth.uid()));

-- Update portfolio_values policies
DROP POLICY IF EXISTS "Admins can view all values" ON public.portfolio_values;
DROP POLICY IF EXISTS "Admins can manage all values" ON public.portfolio_values;

CREATE POLICY "Admins can view all values"
  ON public.portfolio_values FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all values"
  ON public.portfolio_values FOR ALL
  USING (public.is_admin(auth.uid()));
