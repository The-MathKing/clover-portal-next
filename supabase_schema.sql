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

-- Create a table for user properties (videos)
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  address text,
  price text,
  beds text,
  baths text,
  sqft text,
  description text,
  features jsonb default '[]'::jsonb,
  status text default 'Ready',
  cover_image text,
  images jsonb default '[]'::jsonb,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for properties
alter table public.properties enable row level security;

-- Policies for properties
create policy "Users can view their own properties" 
  on public.properties for select using (auth.uid() = user_id);

create policy "Users can insert their own properties" 
  on public.properties for insert with check (auth.uid() = user_id);

create policy "Users can update their own properties" 
  on public.properties for update using (auth.uid() = user_id);

create policy "Users can delete their own properties" 
  on public.properties for delete using (auth.uid() = user_id);

-- Create a storage bucket for media (images and exported videos)
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- Enable RLS for the storage bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'media' );

create policy "Users can upload media"
  on storage.objects for insert
  with check ( bucket_id = 'media' and auth.uid() = owner );

create policy "Users can update own media"
  on storage.objects for update
  using ( bucket_id = 'media' and auth.uid() = owner );

create policy "Users can delete own media"
  on storage.objects for delete
  using ( bucket_id = 'media' and auth.uid() = owner );
