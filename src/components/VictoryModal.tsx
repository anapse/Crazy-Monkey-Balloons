import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Trophy, Star } from 'lucide-react';

interface VictoryModalProps {
  levelNumber: number;
  score: number;
  onNextLevel: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  score,
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
      <div className="w-full max-w-xs bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-black text-amber-300 tracking-wider mb-1">¡VICTORIA!</h3>
        <p className="text-xs text-slate-400 mb-4">Nivel {levelNumber} Completado</p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 text-amber-400 mb-4">
          <Star className="w-6 h-6 fill-amber-400" />
          <Star className="w-7 h-7 fill-amber-400" />
          <Star className="w-6 h-6 fill-amber-400" />
        </div>

        <div className="w-full bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-6">
          <span className="text-xs text-slate-400">Puntuación Total</span>
          <div className="text-2xl font-black text-amber-400">{score.toLocaleString()} pts</div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>SIGUIENTE NIVEL</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
          >
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
