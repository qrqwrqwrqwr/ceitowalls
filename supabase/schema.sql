-- Ceito Walls schema

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  photo_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wallpapers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  tags text[] not null default '{}',
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  resolution text not null,
  file_size_bytes bigint not null,
  uploader_id uuid references public.profiles(id) on delete set null,
  votes integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  wallpaper_id uuid not null references public.wallpapers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  wallpaper_id uuid not null references public.wallpapers(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  ip inet,
  created_at timestamptz not null default now()
);

-- profile auto-created on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.wallpapers enable row level security;
alter table public.comments enable row level security;
alter table public.downloads enable row level security;

create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "wallpapers are viewable by everyone" on public.wallpapers for select using (true);
create policy "admins can insert wallpapers" on public.wallpapers for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "admins can delete wallpapers" on public.wallpapers for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "comments are viewable by everyone" on public.comments for select using (true);
create policy "logged in users can insert own comments" on public.comments for insert
  with check (auth.uid() = user_id);

create policy "downloads are insertable by everyone" on public.downloads for insert with check (true);
create policy "users can view own downloads" on public.downloads for select using (auth.uid() = user_id);

-- storage bucket for wallpaper media
insert into storage.buckets (id, name, public)
values ('wallpapers', 'wallpapers', true)
on conflict (id) do nothing;

create policy "wallpaper media is publicly readable" on storage.objects for select
  using (bucket_id = 'wallpapers');
create policy "admins can upload wallpaper media" on storage.objects for insert
  with check (bucket_id = 'wallpapers' and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
