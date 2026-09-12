import { useRef, useState } from 'react';

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En curso',
  HECHO: 'Hecho',
};


const STATUS_STYLES = {
  PENDIENTE: 'bg-amber-50/90 border-amber-200 text-amber-900',
  EN_CURSO: 'bg-blue-50/90 border-blue-200 text-blue-900',
  HECHO: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
};

export function NoteCard({ note, onSave, onDelete, onDragEnd }) {
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [status, setStatus] = useState(note.status);
  const [dragging, setDragging] = useState(false);

  const dragState = useRef(null);
  const dirty = title !== note.title || text !== note.text || status !== note.status;

  function handlePointerDown(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) {
      return;
    }

    const canvas = e.currentTarget.parentElement;
    const canvasRect = canvas.getBoundingClientRect();

    dragState.current = {
      offsetX: e.clientX - canvasRect.left - note.posX + canvas.scrollLeft,
      offsetY: e.clientY - canvasRect.top - note.posY + canvas.scrollTop,
      canvas,
    };

    setDragging(true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function handlePointerMove(e) {
    if (!dragState.current) return;
    const { offsetX, offsetY, canvas } = dragState.current;
    const canvasRect = canvas.getBoundingClientRect();

    const newX = Math.max(0, e.clientX - canvasRect.left + canvas.scrollLeft - offsetX);
    const newY = Math.max(0, e.clientY - canvasRect.top + canvas.scrollTop - offsetY);

    dragState.current.lastX = newX;
    dragState.current.lastY = newY;

    const el = document.getElementById(`note-${note.id}`);
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }
  }

  function handlePointerUp() {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    setDragging(false);

    const last = dragState.current;
    dragState.current = null;

    if (last && last.lastX !== undefined) {
      onDragEnd(note.id, last.lastX, last.lastY);
    }
  }

  function handleSave() {
    onSave(note.id, { title, text, status });
  }

  return (
    <div
      id={`note-${note.id}`}
      className={`absolute w-64 min-h-44 rounded-2xl p-4 flex flex-col gap-3 border shadow-sm backdrop-blur-sm transition-shadow duration-150 cursor-grab select-none ${
        STATUS_STYLES[note.status] || 'bg-white border-slate-200'
      } ${dragging ? 'shadow-2xl z-30 cursor-grabbing scale-[1.02]' : 'hover:shadow-md z-10'}`}
      style={{ left: note.posX, top: note.posY }}
      onPointerDown={handlePointerDown}
    >
      {/* Título */}
      <input
        className="bg-transparent border-none font-bold text-sm focus:outline-none placeholder-slate-400 text-slate-800"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la nota..."
      />

      {/* Contenido */}
      <textarea
        className="bg-transparent border-none resize-none text-xs flex-1 min-h-16 focus:outline-none text-slate-600 leading-relaxed placeholder-slate-400"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe los detalles aquí..."
      />

      {/* Barra de estado y acciones */}
      <div className="flex justify-between items-center gap-2 pt-2 border-t border-black/5">
        <select
          className="border border-slate-200/80 bg-white/80 rounded-lg text-[11px] font-semibold px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs disabled:opacity-40 transition cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}