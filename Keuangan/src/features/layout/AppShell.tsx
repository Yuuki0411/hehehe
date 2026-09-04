import { useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, FileText, ListOrdered, Plus, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Transaction } from '../../types/db'
import { TxSheetContext, ToastContext } from './app-contexts'
import {
  TxSheetActionsContext
} from './app-contexts'
import { AddEditModal } from '../transactions/AddEditModal'

const navItems = [
  { to: '/', label: 'Ringkasan', icon: Home },
  { to: '/transaksi', label: 'Transaksi', icon: ListOrdered },
  { to: '/laporan', label: 'Laporan', icon: FileText },
  { to: '/profil', label: 'Profil', icon: UserRound }
]

export function AppShell() {
  const [sheet, setSheet] = useState<{
    open: boolean
    initial: Transaction | 'new' | null
  }>({ open: false, initial: null })

  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  function showToast(message: string) {
    setToastMsg(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200)
  }

  const actions = {
    openNew: () => setSheet({ open: true, initial: 'new' }),
    openEdit: (tx: Transaction) => setSheet({ open: true, initial: tx }),
    close: () => setSheet((s) => ({ ...s, open: false }))
  }

  return (
    <TxSheetContext.Provider value={sheet}>
      <TxSheetActionsContext.Provider value={actions}>
        <ToastContext.Provider value={showToast}>
          <div className="flex min-h-dvh flex-col">
            {/* Header dengan navigasi horizontal (desktop) */}
            <header className="no-print sticky top-0 z-40 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                <span className="text-sm font-bold text-slate-900">
                  Catatan Keuangan
                </span>
                <nav className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </header>

            <Outlet />

            {/* Navigasi bawah (mobile) */}
            <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-safe md:hidden">
              <div className="mx-auto flex max-w-md items-end">
                {navItems.slice(0, 2).map(itemToNavItem)}
                <button
                  onClick={actions.openNew}
                  aria-label="Tambah transaksi"
                  className="-mt-6 grid size-14 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition active:scale-95"
                >
                  <Plus className="size-7" />
                </button>
                {navItems.slice(2).map(itemToNavItem)}
              </div>
            </nav>

            {/* Navigasi atas (desktop) */}
            <button
              onClick={actions.openNew}
              className="no-print fixed right-6 bottom-6 z-40 hidden items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 active:scale-95 md:flex"
            >
              <Plus className="size-5" /> Tambah transaksi
            </button>
          </div>

          {toastMsg && (
            <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
              <p className="rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg">
                {toastMsg}
              </p>
            </div>
          )}

          <AddEditModal
            open={sheet.open}
            initial={sheet.initial}
            onClose={actions.close}
          />
        </ToastContext.Provider>
      </TxSheetActionsContext.Provider>
    </TxSheetContext.Provider>
  )
}

function itemToNavItem({
  to,
  label,
  icon: Icon
}: {
  to: string
  label: string
  icon: typeof Home
}): ReactNode {
  return (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
          isActive ? 'text-brand-700' : 'text-slate-400 hover:text-slate-600'
        }`
      }
    >
      <Icon className="size-5" />
      <span>{label}</span>
    </NavLink>
  )
}
