// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardSuperAdmin from './pages/DashboardSuperAdmin'
import DashboardTrainer from './pages/DashboardTrainer'
import DashboardMember from './pages/DashboardMember'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <DashboardSuperAdmin />
            </ProtectedRoute>
          } />

          <Route path="/trainer" element={
            <ProtectedRoute allowedRoles={['TRAINER']}>
              <DashboardTrainer />
            </ProtectedRoute>
          } />

          <Route path="/member" element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <DashboardMember />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
