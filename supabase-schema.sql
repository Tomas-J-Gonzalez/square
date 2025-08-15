-- Supabase Schema for Be There or Be Square
-- Run this in your Supabase SQL editor

-- Users table (replaces localStorage user storage)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  password_hash text not null,
  email_confirmed boolean default false,
  confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_login_at timestamptz,
  event_ids text[] default array[]::text[]
);

-- Email confirmations table
create table if not exists public.email_confirmations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  user_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  used boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Events table (existing, for reference)
create table if not exists public.events (
  id text primary key,
  title text not null,
  date text not null,
  time text not null,
  location text,
  decision_mode text not null,
  punishment text not null,
  invited_by text,
  created_at timestamptz default now()
);

-- RSVPs table (existing, for reference)
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  name text not null,
  will_attend boolean not null,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.email_confirmations enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- RLS Policies for users table
create policy if not exists "Users can view their own data" on public.users
  for select using (auth.uid()::text = id::text);

create policy if not exists "Users can update their own data" on public.users
  for update using (auth.uid()::text = id::text);

create policy if not exists "Allow user registration" on public.users
  for insert with check (true);

-- RLS Policies for email_confirmations table
create policy if not exists "Allow email confirmation token creation" on public.email_confirmations
  for insert with check (true);

create policy if not exists "Allow email confirmation token validation" on public.email_confirmations
  for select using (true);

create policy if not exists "Allow email confirmation token updates" on public.email_confirmations
  for update using (true);

-- RLS Policies for events table
create policy if not exists "Events are readable" on public.events
  for select using (true);

create policy if not exists "Allow event creation" on public.events
  for insert with check (true);

-- RLS Policies for event_rsvps table
create policy if not exists "Anyone can RSVP" on public.event_rsvps
  for insert with check (true);

create policy if not exists "RSVPs readable" on public.event_rsvps
  for select using (true);

-- Create indexes for better performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_email_confirmations_token on public.email_confirmations(token);
create index if not exists idx_email_confirmations_user_id on public.email_confirmations(user_id);
create index if not exists idx_email_confirmations_expires_at on public.email_confirmations(expires_at);

-- Function to clean up expired confirmation tokens
create or replace function cleanup_expired_confirmations()
returns void
language plpgsql
as $$
begin
  delete from public.email_confirmations 
  where expires_at < now() and used = false;
end;
$$;

-- Create a cron job to clean up expired tokens (optional)
-- select cron.schedule('cleanup-expired-confirmations', '0 2 * * *', 'select cleanup_expired_confirmations();');
