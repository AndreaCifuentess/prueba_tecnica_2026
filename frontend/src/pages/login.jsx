import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/tablero');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(role) {
    if (role === 'admin') {
      setEmail('adminprueba@demo.com');
      setPassword('12345');
    } else {
      setEmail('userprueba@demo.com');
      setPassword('12345');
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80')`
        }}
      />

     
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xl p-8 transition-all">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3 text-blue-600 font-bold text-xl shadow-inner">
            P
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Portal de equipo</h1>
          <p className="text-slate-500 text-sm mt-1">Inicia sesión para gestionar el tablero</p>
        </div>

          {/* Formulario  de inicio de sesión */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@demo.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-3 rounded-lg shadow-md hover:shadow-lg transition duration-150 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Sección de Cuentas Demo */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-2 text-center uppercase tracking-wider text-[11px]">
            Credenciales de acceso rápido
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-slate-700 hover:text-blue-700 transition font-medium text-left"
            >
              <span>Admin</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Usar</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user')}
              className="flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-slate-700 hover:text-blue-700 transition font-medium text-left"
            >
              <span>Usuario</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Usar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}