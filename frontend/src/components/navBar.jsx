import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) return null;

  // Clase dinámica para los links del menú con acento en azul
  const linkClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Marca / Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg text-white font-bold text-sm shadow-md shadow-blue-500/20">
          P
        </div>
        <span className="font-bold text-slate-800 tracking-tight text-base">
          Portal de Equipo
        </span>
      </div>

      {/* Navegación Principal */}
      <nav className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
        <NavLink to="/tablero" className={linkClass}>
          Tablero
        </NavLink>
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        {user.role === 'ADMIN' && (
          <NavLink to="/usuarios" className={linkClass}>
            Usuarios
          </NavLink>
        )}
      </nav>

      {/* Perfil de Usuario y Acciones */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg">
          <span className="text-sm font-medium text-slate-700">
            {user.name}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            user.role === 'ADMIN'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-slate-200 text-slate-700'
          }`}>
            {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-200 px-3 py-2 rounded-lg transition duration-150 shadow-sm cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}