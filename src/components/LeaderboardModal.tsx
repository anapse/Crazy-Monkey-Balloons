import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal } from 'lucide-react';
import { ScoreEntry } from '../types/game';
import { StorageService } from '../services/storage';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [scores, setScores] = useState<ScoreEntry[]>(StorageService.getTop50());
  const [loadingOnline, setLoadingOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    StorageService.fetchOnlineTop50()
      .then((updated) => {
        if (isMounted) {
          setScores(updated);
          setLoadingOnline(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingOnline(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-sm h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-black text-white tracking-wide">TOP 50 JUGADORES</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                {loadingOnline ? 'Conectando...' : 'En la Nube'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Récords globales de Crazy Monkey Balloons</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {scores.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No hay registros aún. ¡Sé el primero!</div>
          ) : (
            scores.map((entry, index) => {
              const rank = index + 1;
              let rankBadge = <span className="font-bold text-slate-400 text-xs w-6 text-center">{rank}</span>;

              if (rank === 1) {
                rankBadge = <Medal className="w-5 h-5 text-amber-400 flex-shrink-0" />;
              } else if (rank === 2) {
                rankBadge = <Medal className="w-5 h-5 text-slate-300 flex-shrink-0" />;
              } else if (rank === 3) {
                rankBadge = <Medal className="w-5 h-5 text-amber-700 flex-shrink-0" />;
              }

              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    rank === 1
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : rank === 2
                      ? 'bg-slate-800/80 border-slate-600/50 text-slate-200'
                      : rank === 3
                      ? 'bg-amber-900/20 border-amber-800/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    <div className="truncate">
                      <div className="font-bold text-sm truncate">{entry.playerName}</div>
                      <div className="text-[10px] text-slate-400">Nivel {entry.levelReached} • {entry.date}</div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-extrabold text-amber-400 text-sm">
                    {entry.score.toLocaleString()} pts
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
};
