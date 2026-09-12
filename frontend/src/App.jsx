import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authcontext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/navBar';
import { LoginPage } from './pages/login';
import { BoardPage } from './pages/board';
import { UsersPage } from './pages/users';
import { DashboardPage } from './pages/dashboard';  


function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-app">
      <Navbar />
      <main className="flex-1 p-7">{children}</main>
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/tablero' : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/tablero"
            element={
              <ProtectedRoute>
                <Shell><BoardPage /></Shell>
              </ProtectedRoute>
            }
          />

          <Route path="/usuarios" element={
            <ProtectedRoute>
              <Shell><UsersPage /></Shell>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Shell><DashboardPage /></Shell>
            </ProtectedRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}