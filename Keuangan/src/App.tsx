import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query'
import { isConfigured } from './lib/supabase'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { ConfigScreen } from './features/auth/ConfigScreen'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { AppShell } from './features/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { TransactionsPage } from './features/transactions/TransactionsPage'
import { CategoriesPage } from './features/categories/CategoriesPage'
import { WalletsPage } from './features/wallets/WalletsPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { ReportPage } from './features/report/ReportPage'
import { FullPageSpinner } from './components/ui/Spinner'

/** Halaman khusus pengunjung yang BELUM masuk (login/daftar). */
function GuestOnly() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageSpinner />
  if (status === 'authed') return <Navigate to="/" replace />
  return <Outlet />
}

/** Seluruh area aplikasi hanya untuk sesi aktif. */
function ProtectedLayout() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageSpinner />
  if (status === 'anon') return <Navigate to="/login" replace />
  return <AppShell />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {!isConfigured ? (
        <ConfigScreen />
      ) : (
        <AuthProvider>
          <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/daftar" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transaksi" element={<TransactionsPage />} />
              <Route path="/kategori" element={<CategoriesPage />} />
              <Route path="/dompet" element={<WalletsPage />} />
              <Route path="/laporan" element={<ReportPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      )}
    </QueryClientProvider>
  )
}
