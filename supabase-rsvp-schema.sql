-- Updated Supabase Schema for Events and RSVPs
-- Run this in your Supabase SQL editor

-- Events table (updated)
create table if not exists public.events (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    date date not null,
    time text,
    location text,
    decision_mode text default 'none',
    punishment text default '',
    invited_by text,
    created_at timestamptz default now()
);

-- RSVPs table (updated)
create table if not exists public.event_rsvps (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid references public.events(id) on delete cascade,
    name text not null,
    email text,
    will_attend boolean not null,
    message text,
    created_at timestamptz default now()
);

-- Users table (existing, for reference)
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

-- Email confirmations table (existing, for reference)
create table if not exists public.email_confirmations (
    id uuid primary key default gen_random_uuid(),
    token text unique not null,
    user_id uuid not null references public.users(id) on delete cascade,
    email text not null,
    used boolean default false,
    expires_at timestamptz not null,
    created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.users enable row level security;
alter table public.email_confirmations enable row level security;

-- RLS Policies for events table
create policy if not exists "Events are readable" on public.events
    for select using (true);

create policy if not exists "Allow event creation" on public.events
    for insert with check (true);

create policy if not exists "Allow event updates" on public.events
    for update using (true);

-- RLS Policies for event_rsvps table
create policy if not exists "Anyone can RSVP" on public.event_rsvps
    for insert with check (true);

create policy if not exists "RSVPs readable" on public.event_rsvps
    for select using (true);

create policy if not exists "Allow RSVP updates" on public.event_rsvps
    for update using (true);

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

-- Create indexes for better performance
create index if not exists idx_events_id on public.events(id);
create index if not exists idx_event_rsvps_event_id on public.event_rsvps(event_id);
create index if not exists idx_event_rsvps_name on public.event_rsvps(name);
create index if not exists idx_event_rsvps_will_attend on public.event_rsvps(will_attend);
create index if not exists idx_event_rsvps_created_at on public.event_rsvps(created_at);

-- Create unique index to prevent duplicate RSVPs for same event + name
create unique index if not exists unique_event_participant
on public.event_rsvps (event_id, lower(name));

-- Create indexes for users and email confirmations
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
