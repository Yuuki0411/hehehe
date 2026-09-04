-- ============================================================
-- Migrasi 1: Catatan Memo Perbandingan Periode
--
-- Cara pakai:
--   1. Buka dashboard Supabase -> SQL Editor -> New query
--   2. Tempel SELURUH isi file ini, lalu klik Run (cukup sekali)
-- ============================================================

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
