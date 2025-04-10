import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Drivers from './pages/admin/Drivers'
import Reports from './pages/admin/Reports'

// Driver pages
import DriverDashboard from './pages/driver/Dashboard'
import Trips from './pages/driver/Trips'
import CNGExpenses from './pages/driver/CNGExpenses'
import ODLog from './pages/driver/ODLog'
import Complaints from './pages/driver/Complaints'

// PWA registration
import { registerSW } from 'virtual:pwa-register'

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} />
  }

  return children
}

// Register service worker
if ('serviceWorker' in navigator) {
  registerSW()
}

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Driver routes */}
      <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><Layout /></ProtectedRoute>}>
        <Route index element={<DriverDashboard />} />
        <Route path="trips" element={<Trips />} />
        <Route path="expenses" element={<CNGExpenses />} />
        <Route path="odlog" element={<ODLog />} />
        <Route path="complaints" element={<Complaints />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App