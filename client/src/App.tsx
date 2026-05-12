import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import { apiRequest } from './lib/api'
import type { AuthUser } from './stores/useAuthStore'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import VsAIPage from './pages/VsAIPage'

export default function App() {
  const { token, setAuth, clearAuth, markHydrated } = useAuthStore()

  useEffect(() => {
    if (!token) {
      markHydrated()
      return
    }
    apiRequest<AuthUser>('/api/auth/me', {}, token)
      .then((user) => {
        setAuth(user, token)
        markHydrated()
      })
      .catch(() => {
        clearAuth()
        markHydrated()
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter basename="/Jhesster">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/play/ai" element={<VsAIPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
