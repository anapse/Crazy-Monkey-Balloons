import React from 'react';
import { RotateCcw, Home, User } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  levelNumber: number;
  playerName: string;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  levelNumber,
  playerName,
  onPlayAgain,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-900 border border-rose-500/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
        <div className="text-4xl mb-1 animate-bounce">🐒😜</div>

        <h3 className="text-2xl font-black text-rose-500 tracking-wider mb-1">¡GAME OVER!</h3>
        <p className="text-[11px] text-slate-400 mb-3">El cañón se ha quedado sin vidas en el Nivel {levelNumber}</p>

        {/* Stats: Score and Player Name */}
        <div className="w-full flex flex-col gap-2 mb-4">
          <div className="w-full bg-slate-950/90 py-2 px-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Puntuación:</span>
            <span className="text-base font-black text-amber-400">{score.toLocaleString()} pts</span>
          </div>

          <div className="w-full bg-slate-950/90 py-2 px-3 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Jugador:
            </span>
            <span className="text-sm font-black text-amber-300 truncate max-w-[140px]">
              {playerName || 'Sin Nombre'}
            </span>
          </div>
        </div>

        {/* Action Buttons: VOLVER A JUGAR (reinicia desde nivel 1) and MENÚ PRINCIPAL */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 border-t border-amber-300/40"
          >
            <RotateCcw className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>VOLVER A JUGAR</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
