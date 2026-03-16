import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login          from './pages/Login'
import Register       from './pages/Register'
import GameMenu       from './pages/GameMenu'
import GameDetail     from './pages/GameDetail'
import Booking        from './pages/Booking'
import MyBookings     from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/games" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/games"       element={<PrivateRoute><GameMenu /></PrivateRoute>} />
        <Route path="/games/:id"   element={<PrivateRoute><GameDetail /></PrivateRoute>} />
        <Route path="/booking"     element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/"            element={<Navigate to="/games" replace />} />
        <Route path="*"            element={<Navigate to="/games" replace />} />
      </Routes>
    </BrowserRouter>
  )
}