import { KeyRound } from 'lucide-react'

/** Layar penuh yang tampil bila VITE_SUPABASE_URL / ANON_KEY belum diisi. */
export function ConfigScreen() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Konfigurasi Supabase belum selesai
            </h1>
            <p className="text-xs text-slate-500">
              Tiga langkah singkat dan aplikasi siap dipakai:
            </p>
          </div>
        </div>

        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700">
          <li>
            Buat proyek gratis di{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-700 underline"
            >
              supabase.com
            </a>
            .
          </li>
          <li>
            Buka <b>SQL Editor → New query</b>, tempel seluruh isi file{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">
              supabase/schema.sql
            </code>{' '}
            lalu klik <b>Run</b>.
          </li>
          <li>
            Salin <b>Project URL</b> &amp; <b>anon key</b> (menu Settings → API)
            ke file <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">.env</code>,
            contoh:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-emerald-200">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
            </pre>
          </li>
        </ol>

        <p className="mt-4 text-xs text-slate-500">
          Simpan file .env lalu muat ulang halaman ini (Ctrl/Cmd+Shift+R).
          Panduan lengkap tersedia di README.md.
        </p>
      </div>
    </div>
  )
}
