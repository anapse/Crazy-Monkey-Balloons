import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Trophy, Star } from 'lucide-react';

interface VictoryModalProps {
  levelNumber: number;
  score: number;
  lives?: number;
  onNextLevel: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  score,
  lives,
  onNextLevel,
  onMainMenu,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2 animate-bounce">
          <Trophy className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-black text-amber-300 tracking-wider mb-0.5">¡VICTORIA!</h3>
        <p className="text-xs text-slate-400 mb-3">Nivel {levelNumber} Completado</p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 text-amber-400 mb-3">
          <Star className="w-5 h-5 fill-amber-400" />
          <Star className="w-6 h-6 fill-amber-400" />
          <Star className="w-5 h-5 fill-amber-400" />
        </div>

        {/* Extra Life Reward Box */}
        <div className="w-full bg-emerald-950/70 border border-emerald-500/40 rounded-2xl py-2 px-3 mb-3 flex items-center justify-center gap-2">
          <span className="text-lg animate-pulse">❤️</span>
          <div className="text-left">
            <div className="text-[11px] font-black text-emerald-300 uppercase tracking-wide">
              {lives !== undefined && lives >= 5 ? '¡VIDAS AL MÁXIMO (5/5)!' : '¡+1 VIDA EXTRA DE REGALO!'}
            </div>
            <div className="text-[10px] text-slate-300 font-semibold">
              {lives !== undefined ? `Conservas ${lives} de 5 vidas` : 'Máximo 5 vidas'}
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-950 p-2.5 rounded-2xl border border-slate-800 mb-4">
          <span className="text-[11px] text-slate-400">Puntuación Total</span>
          <div className="text-xl font-black text-amber-400">{score.toLocaleString()} pts</div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>SIGUIENTE NIVEL</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
