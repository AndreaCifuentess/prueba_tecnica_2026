import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-slate-500">Cargando…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/tablero" replace />;
  }

  return children;
}