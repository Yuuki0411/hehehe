-- ============================================================
-- Migrasi 2: Sumber Dana (Dompet) wajib untuk setiap transaksi
--
-- Cara pakai:
--   1. Buka dashboard Supabase -> SQL Editor -> New query
--   2. Tempel SELURUH isi file ini, lalu klik Run (cukup sekali)
-- ============================================================

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

create index idx_wallets_user on public.wallets (user_id);

alter table public.wallets enable row level security;

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

-- ------------------------------------------------------------
-- Kolom wallet_id pada transaksi (wajib diisi).
-- Urutan aman: tambah kolom (boleh null) -> isi dompet 'Kas'
-- untuk baris lama -> baru set NOT NULL. Aman dijalankan ulang.
-- ------------------------------------------------------------

alter table public.transactions
  add column if not exists wallet_id uuid
  references public.wallets (id) on delete restrict;

insert into public.wallets (user_id, name)
select distinct t.user_id, 'Kas'
from public.transactions t
where not exists (
  select 1 from public.wallets w where w.user_id = t.user_id
);

update public.transactions t
set wallet_id = w.id
from public.wallets w
where w.user_id = t.user_id
  and t.wallet_id is null;

alter table public.transactions
  alter column wallet_id set not null;

-- ------------------------------------------------------------
-- Trigger pendaftar baru: seed 11 kategori default + dompet 'Kas'
-- ------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

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
