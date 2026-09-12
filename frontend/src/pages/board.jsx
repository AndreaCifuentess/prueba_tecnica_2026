import { useEffect, useState } from 'react';
import api from '../api/axios';
import { NoteCard } from '../components/noteCard';

export function BoardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar las notas');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    try {
      const res = await api.post('/notes', {
        title: 'Nueva nota',
        text: '',
        status: 'PENDIENTE',
        posX: 40 + Math.random() * 100,
        posY: 40 + Math.random() * 100,
      });
      setNotes((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la nota');
    }
  }

  async function handleSaveNote(id, payload) {
    try {
      const res = await api.patch(`/notes/${id}`, payload);
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la nota');
    }
  }

  async function handleDeleteNote(id) {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar la nota');
    }
  }

  async function handleDragEnd(id, posX, posY) {
    // Actualización optimista: se refleja en interfaz al instante
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, posX, posY } : n)));
    try {
      await api.patch(`/notes/${id}/`, { posX, posY });
    } catch (err) {
      setError('No se pudo guardar la posición: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Encabezado de la página */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tablero de Notas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Arrastra y organiza tus notas en el lienzo interactivo</p>
        </div>
        <button
          onClick={handleAddNote}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition duration-150 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-base font-bold line-height-none">+</span> Nueva nota
        </button>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Canvas del Tablero */}
      <div
        className="relative w-full border border-slate-200/90 rounded-2xl bg-slate-50/50 shadow-inner overflow-auto transition-all"
        style={{
          height: 'calc(100vh - 210px)',
          minHeight: 480,
          backgroundImage: 'radial-gradient(circle, #CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3 text-slate-500 font-medium text-sm">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Cargando notas...
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}