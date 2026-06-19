-- ══════════════════════════════════════════════════
-- Detox Your Path — Supabase Database Setup
-- انسخي هذا الكود في Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════

-- 1. Profiles (user settings saved in cloud)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Friend',
  goal_hours int not null default 2,
  detox_times text[] not null default '{}',
  join_date timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for all using (auth.uid() = id);

-- 2. Detox Sessions (PAUSE sessions)
create table if not exists public.detox_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  intention text not null default '',
  intention_icon text not null default '⏸',
  duration_minutes int not null default 0,
  actual_minutes int not null default 0,
  rating int not null default 0 check (rating between 0 and 5),
  note text,
  created_at timestamptz not null default now()
);
alter table public.detox_sessions enable row level security;
create policy "Users manage own sessions" on public.detox_sessions
  for all using (auth.uid() = user_id);

-- 3. Challenge Completions
create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  challenge_id text not null,
  completed_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique(user_id, challenge_id, completed_date)
);
alter table public.challenge_completions enable row level security;
create policy "Users manage own challenges" on public.challenge_completions
  for all using (auth.uid() = user_id);

-- 4. Streaks
create table if not exists public.streaks (
  user_id uuid references auth.users on delete cascade primary key,
  count int not null default 0,
  last_active_date date,
  longest_streak int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.streaks enable row level security;
create policy "Users manage own streak" on public.streaks
  for all using (auth.uid() = user_id);

-- 5. Screen Time (Android usage stats, self-reported or native)
create table if not exists public.screen_time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  total_minutes int not null default 0,
  app_breakdown jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);
alter table public.screen_time_logs enable row level security;
create policy "Users manage own screen time" on public.screen_time_logs
  for all using (auth.uid() = user_id);

-- 6. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Friend'));

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
