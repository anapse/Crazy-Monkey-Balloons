import React, { useState } from 'react';
import { User, Play } from 'lucide-react';

interface PlayerNameModalProps {
  initialName: string;
  onConfirmName: (name: string) => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
  confirmButtonText?: string;
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  initialName,
  onConfirmName,
  onCancel,
  title = 'NOMBRE DEL JUGADOR',
  subtitle = 'Ingresa tu nombre de jugador para comenzar y guardar tu partida en el ranking.',
  confirmButtonText = 'JUGAR',
}) => {
  const [name, setName] = useState(initialName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onConfirmName(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
          <User className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-white mb-1 tracking-wide uppercase">{title}</h3>
        <p className="text-xs text-slate-400 mb-5">{subtitle}</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: MonoSlayer99"
            maxLength={18}
            autoFocus
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-amber-300 placeholder-slate-500 font-bold text-center focus:outline-none focus:border-amber-400 shadow-inner"
          />

          <div className="flex gap-2 w-full mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={name.trim().length === 0}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-40 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
