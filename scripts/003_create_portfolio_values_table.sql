-- Create portfolio values table for tracking portfolio performance over time
create table if not exists public.portfolio_values (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  value decimal(15, 2) not null,
  date date not null,
  created_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists idx_portfolio_values_portfolio_id on public.portfolio_values(portfolio_id);
create index if not exists idx_portfolio_values_date on public.portfolio_values(date);

alter table public.portfolio_values enable row level security;

-- Investors can view their own portfolio values
create policy "Investors can view their own portfolio values"
  on public.portfolio_values for select
  using (
    exists (
      select 1 from public.portfolios
      where id = portfolio_id and investor_id = auth.uid()
    )
  );

-- Admins can view all portfolio values
create policy "Admins can view all portfolio values"
  on public.portfolio_values for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert portfolio values
create policy "Admins can insert portfolio values"
  on public.portfolio_values for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update portfolio values
create policy "Admins can update portfolio values"
  on public.portfolio_values for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete portfolio values
create policy "Admins can delete portfolio values"
  on public.portfolio_values for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
