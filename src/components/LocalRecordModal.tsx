import React, { useState, useEffect } from 'react';
import { Award, X, Target, Flame, Gamepad2 } from 'lucide-react';
import { StorageService } from '../services/storage';

interface LocalRecordModalProps {
  onClose: () => void;
}

export const LocalRecordModal: React.FC<LocalRecordModalProps> = ({ onClose }) => {
  const [record, setRecord] = useState({ score: 0, level: 1, balloonsPopped: 0, gamesPlayed: 0 });
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    setRecord(StorageService.getLocalRecord());
    setPlayerName(StorageService.getPlayerName() || 'Jugador Local');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3">
          <Award className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-white mb-1">MI RÉCORD LOCAL</h3>
        <p className="text-xs text-purple-300 font-semibold mb-5">{playerName}</p>

        <div className="w-full grid grid-cols-2 gap-2.5 mb-6">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Puntos
            </span>
            <span className="text-base font-black text-amber-400">{record.score.toLocaleString()}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Máx. Nivel
            </span>
            <span className="text-base font-black text-emerald-400">{record.level}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Globos
            </span>
            <span className="text-base font-black text-rose-400">{record.balloonsPopped}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Gamepad2 className="w-3.5 h-3.5 text-sky-400" /> Partidas
            </span>
            <span className="text-base font-black text-sky-400">{record.gamesPlayed}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg transition-all"
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
};
