-- Create a table for user profiles linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  subscription_tier text default 'free',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies (Users can read their own profile, but cannot modify it directly)
create policy "Allow users to read their own profile" 
  on public.profiles 
  for select 
  using (auth.uid() = id);

-- Trigger to automatically create a profile record when a new user signs up
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, subscription_tier)
  values (new.id, new.email, 'free');
  return new;
end;
$$ language plpgsql;

-- Set up the trigger on auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- backfill profiles for any existing users
insert into public.profiles (id, email, subscription_tier)
select id, email, 'free'
from auth.users
on conflict (id) do nothing;
