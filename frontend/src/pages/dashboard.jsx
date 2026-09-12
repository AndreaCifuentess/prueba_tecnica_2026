import { useEffect, useState } from 'react';
import api from '../api/axios';

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/metrics');
      setMetrics(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron calcular las métricas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-2">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Resumen del tablero calculado por la función Lambda
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin text-slate-400' : 'text-slate-600'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Grid de Tarjetas de Métricas */}
      {loading && !metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse h-28 flex flex-col justify-between"
            >
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Totales */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <span>Notas Totales</span>
              <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">📋</span>
            </div>
            <div className="font-display text-3xl font-bold text-ink">
              {metrics.total ?? 0}
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
              <span>Pendiente</span>
              <span className="p-1.5 bg-amber-50 rounded-lg">⏳</span>
            </div>
            <div className="font-display text-3xl font-bold text-amber-600">
              {metrics.byStatus?.PENDIENTE ?? 0}
            </div>
          </div>

          {/* En curso */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sky-600 mb-2">
              <span>En Curso</span>
              <span className="p-1.5 bg-sky-50 rounded-lg">🚀</span>
            </div>
            <div className="font-display text-3xl font-bold text-sky-600">
              {metrics.byStatus?.EN_CURSO ?? 0}
            </div>
          </div>

          {/* Hecho */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
              <span>Hecho</span>
              <span className="p-1.5 bg-emerald-50 rounded-lg">✅</span>
            </div>
            <div className="font-display text-3xl font-bold text-emerald-600">
              {metrics.byStatus?.HECHO ?? 0}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}