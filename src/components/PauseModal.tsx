import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenAdmin?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h3 className="text-2xl font-black text-white tracking-wider mb-6">JUEGO EN PAUSA</h3>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>REANUDAR</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR NIVEL</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>SONIDO: {isMuted ? 'DESACTIVADO' : 'ACTIVADO'}</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-rose-800/60 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
