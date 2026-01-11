-- Create portfolios table for investor portfolio data
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users(id) on delete cascade,
  portfolio_name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.portfolios enable row level security;

-- Investors can view their own portfolios
create policy "Investors can view their own portfolios"
  on public.portfolios for select
  using (auth.uid() = investor_id);

-- Admins can view all portfolios
create policy "Admins can view all portfolios"
  on public.portfolios for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert portfolios
create policy "Admins can insert portfolios"
  on public.portfolios for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update portfolios
create policy "Admins can update portfolios"
  on public.portfolios for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete portfolios
create policy "Admins can delete portfolios"
  on public.portfolios for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
