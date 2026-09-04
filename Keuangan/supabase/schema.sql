-- ============================================================
-- Catatan Keuangan - Skema Supabase
--
-- Cara pakai:
--   1. Buka dashboard Supabase proyek Anda
--   2. Menu "SQL Editor" -> New query
--   3. Tempel SELURUH isi file ini, lalu klik Run
-- ============================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

create index idx_categories_user on public.categories (user_id);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

create index idx_wallets_user on public.wallets (user_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  category_id uuid references public.categories (id) on delete set null,
  wallet_id uuid not null references public.wallets (id) on delete restrict,
  occurred_on date not null,
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);

create index idx_transactions_user_date
  on public.transactions (user_id, occurred_on desc);

-- ------------------------------------------------------------
-- Row Level Security: tiap pengguna hanya bisa melihat dan
-- mengubah baris miliknya sendiri.
-- ------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;

create policy "Dompet milik sendiri: lihat"
  on public.wallets for select to authenticated
  using (user_id = auth.uid());

create policy "Dompet milik sendiri: buat"
  on public.wallets for insert to authenticated
  with check (user_id = auth.uid());

create policy "Dompet milik sendiri: ubah"
  on public.wallets for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Dompet milik sendiri: hapus"
  on public.wallets for delete to authenticated
  using (user_id = auth.uid());

create policy "Kategori milik sendiri: lihat"
  on public.categories for select to authenticated
  using (user_id = auth.uid());

create policy "Kategori milik sendiri: buat"
  on public.categories for insert to authenticated
  with check (user_id = auth.uid());

create policy "Kategori milik sendiri: ubah"
  on public.categories for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Kategori milik sendiri: hapus"
  on public.categories for delete to authenticated
  using (user_id = auth.uid());

create policy "Transaksi milik sendiri: lihat"
  on public.transactions for select to authenticated
  using (user_id = auth.uid());

create policy "Transaksi milik sendiri: buat"
  on public.transactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Transaksi milik sendiri: ubah"
  on public.transactions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Transaksi milik sendiri: hapus"
  on public.transactions for delete to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- Seed kategori default otomatis saat ada pendaftar baru,
-- sehingga akun yang sama langsung siap pakai di perangkat mana pun.
-- ------------------------------------------------------------

drop function if exists public.handle_new_user();
drop trigger if exists on_auth_user_created on auth.users;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type) values
    (new.id, 'Makanan & Minuman', 'expense'),
    (new.id, 'Transportasi',      'expense'),
    (new.id, 'Tagihan & Utilitas','expense'),
    (new.id, 'Belanja',           'expense'),
    (new.id, 'Hiburan',           'expense'),
    (new.id, 'Kesehatan',         'expense'),
    (new.id, 'Pendidikan',        'expense'),
    (new.id, 'Lainnya',           'expense'),
    (new.id, 'Gaji',              'income'),
    (new.id, 'Bonus',             'income'),
    (new.id, 'Hadiah',            'income');

  insert into public.wallets (user_id, name)
  values (new.id, 'Kas');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- [Migrasi 1] Memo perbandingan dua periode
-- ------------------------------------------------------------

create table public.comparison_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_kind text not null check (period_kind in ('day', 'week', 'month')),
  period_a_from date not null,
  period_a_to date not null,
  period_b_from date not null,
  period_b_to date not null,
  note text not null check (char_length(btrim(note)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index idx_comparison_notes_user
  on public.comparison_notes (user_id, created_at desc);

alter table public.comparison_notes enable row level security;

create policy "Memo perbandingan milik sendiri: lihat"
  on public.comparison_notes for select to authenticated
  using (user_id = auth.uid());

create policy "Memo perbandingan milik sendiri: buat"
  on public.comparison_notes for insert to authenticated
  with check (user_id = auth.uid());

create policy "Memo perbandingan milik sendiri: ubah"
  on public.comparison_notes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Memo perbandingan milik sendiri: hapus"
  on public.comparison_notes for delete to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- [Migrasi 3] Profil & username untuk login
-- ------------------------------------------------------------

create table public.profiles (
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

create function public.username_available(p_username text)
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

create function public.set_my_username(p_username text)
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
