-- ============================================================
-- Migrasi 3: Profil & username untuk login
--
-- Cara pakai:
--   1. Buka dashboard Supabase -> SQL Editor -> New query
--   2. Tempel SELURUH isi file ini, lalu klik Run (cukup sekali)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profil milik sendiri: lihat"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Profil milik sendiri: ubah"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ------------------------------------------------------------
-- Backfill: setiap pengguna lama mendapat baris profil
-- (tanpa username; bisa dipilih nanti dari halaman Profil).
-- ------------------------------------------------------------

insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Trigger pendaftar baru: salin username dari metadata signup.
-- Username duplikat membuat INSERT gagal -> signUp ditolak,
-- sehingga tidak ada akun tanpa profil yang valid.
-- ------------------------------------------------------------

drop trigger if exists on_auth_user_profile on auth.users;
drop function if exists public.handle_new_user_profile();

create function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, nullif(new.raw_user_meta_data ->> 'username', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- ------------------------------------------------------------
-- RPC publik: cek ketersediaan username (dipakai saat daftar
-- dan saat mengubah username; tidak membuka data lain).
-- ------------------------------------------------------------

create or replace function public.username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(btrim(p_username))
  );
$$;

-- ------------------------------------------------------------
-- RPC authenticated: pasang/ubah username milik sendiri.
-- ------------------------------------------------------------

create or replace function public.set_my_username(p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := lower(btrim(p_username));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if v_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Format username tidak valid';
  end if;

  insert into public.profiles (id, username, updated_at)
  values (auth.uid(), v_username, now())
  on conflict (id) do update
    set username = excluded.username,
        updated_at = now();
end;
$$;
