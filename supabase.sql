-- Kjør i Supabase SQL Editor i et nytt prosjekt.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (char_length(username) between 3 and 24 and username ~ '^[A-Za-z0-9_æøåÆØÅ-]+$'),
 created_at timestamptz not null default now()
);
create table public.topics (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 category text not null check (category in ('Botox og fillers','Plastisk kirurgi','Hud og laser','Klinikker og anmeldelser','Priser og tilbud','Generelt')),
 title text not null check (char_length(title) between 8 and 140),
 body text not null check (char_length(body) between 15 and 10000),
 created_at timestamptz not null default now()
);
create table public.replies (
 id uuid primary key default gen_random_uuid(),
 topic_id uuid not null references public.topics(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 5000),
 created_at timestamptz not null default now()
);
create index topics_created_idx on public.topics(created_at desc);
create index replies_topic_idx on public.replies(topic_id,created_at);
create or replace function public.create_profile_for_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare chosen_name text;
begin
 chosen_name := new.raw_user_meta_data ->> 'username';
 insert into public.profiles(id,username) values (new.id,chosen_name);
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_new_user();
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.replies enable row level security;
create policy "Read public profiles" on public.profiles for select to anon,authenticated using (true);
create policy "Read topics" on public.topics for select to anon,authenticated using (true);
create policy "Create own topics" on public.topics for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Read replies" on public.replies for select to anon,authenticated using (true);
create policy "Create own replies" on public.replies for insert to authenticated with check ((select auth.uid()) = user_id);
-- Før offentlig lansering: implementer rapportering, moderering, anti-spam,
-- konto-/datainnsyn og sletting, personvernvilkår og rutiner for sensitive helseopplysninger.
