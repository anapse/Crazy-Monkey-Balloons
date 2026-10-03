import React, { useState } from 'react';
import { Volume2, VolumeX, Mail, Play, Trophy, HelpCircle, Award } from 'lucide-react';
import { resolveAssetPath } from '../services/assetManager';

interface MainMenuProps {
  onPlay: () => void;
  onOpenTop50: () => void;
  onOpenHowToPlay: () => void;
  onOpenLocalRecord: () => void;
  onOpenContact: () => void;
  onOpenAssetRequirements?: () => void;
  onOpenAdmin?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  localRecordScore: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onOpenTop50,
  onOpenHowToPlay,
  onOpenLocalRecord,
  onOpenContact,
  isMuted,
  onToggleMute,
}) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-3 text-white overflow-hidden select-none bg-slate-950">
      {/* Jungle Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{
          backgroundImage: `url("${resolveAssetPath('assets/sprites/Valle selvático de templos y cascadas.png')}")`,
        }}
      />

      {/* Dark Overlay Gradient for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-slate-950/85 pointer-events-none" />

      {/* Header Controls (Top Bar) */}
      <div className="relative z-10 flex items-center justify-between w-full pt-1 shrink-0">
        <button
          onClick={onOpenContact}
          className="flex items-center gap-1 px-2 py-1 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-full text-[10px] font-bold text-amber-300 shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <Mail className="w-3 h-3 text-amber-400" />
          <span>CONTACTO</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-full text-slate-200 hover:text-amber-400 shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
            title="Sonido"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Content Body (Hero Logo pushed higher up) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full min-h-0 my-auto py-1">
        {!logoError ? (
          <div className="relative flex items-center justify-center w-full h-full max-h-[42vh] filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-300">
            <img
              src={resolveAssetPath('assets/sprites/logo.png')}
              alt="Crazy Monkey Balloons Logo"
              onError={() => setLogoError(true)}
              className="w-auto h-full max-h-full max-w-[92%] object-contain"
            />
          </div>
        ) : (
          /* Fallback Badge if logo image missing */
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-2xl animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-900 border-2 border-amber-300/40 overflow-hidden flex flex-col items-center justify-center p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xl animate-bounce" style={{ animationDelay: '0ms' }}>🎈</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '150ms' }}>🎈</span>
                  <span className="text-xl animate-bounce" style={{ animationDelay: '300ms' }}>🎈</span>
                </div>
                <span className="text-4xl my-0.5">🐒</span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent uppercase">
                CRAZY MONKEY
              </h1>
              <h2 className="text-xl font-black text-sky-400 tracking-wider uppercase">
                BALLOONS
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* Menu Action Buttons Panel (Raised Up, Compact Padding & Border Protection) */}
      <div className="relative z-10 flex flex-col items-center gap-1.5 w-full max-w-[260px] shrink-0 mb-3">
        {/* JUGAR - Green Main Button */}
        <button
          onClick={onPlay}
          className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base shadow-[0_4px_16px_rgba(16,185,129,0.5)] border-t border-emerald-300 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>JUGAR</span>
        </button>

        {/* TOP 50 JUGADORES - Orange Button */}
        <button
          onClick={onOpenTop50}
          className="w-full py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-[0_3px_12px_rgba(245,158,11,0.4)] border-t border-amber-300 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>TOP 50 JUGADORES</span>
        </button>

        {/* CÓMO JUGAR - Blue Button */}
        <button
          onClick={onOpenHowToPlay}
          className="w-full py-1.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-700 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_3px_12px_rgba(14,165,233,0.4)] border-t border-sky-300 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>CÓMO JUGAR</span>
        </button>

        {/* MI RÉCORD LOCAL - Purple Button */}
        <button
          onClick={onOpenLocalRecord}
          className="w-full py-1.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_3px_12px_rgba(147,51,234,0.4)] border-t border-purple-300 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
        >
          <Award className="w-3.5 h-3.5" />
          <span>MI RÉCORD LOCAL</span>
        </button>
      </div>

      {/* Footer Note */}
      <div className="relative z-10 text-center py-0.5 text-[10px] font-semibold text-amber-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] tracking-wide shrink-0">
        Dedicado a Violenty
      </div>
    </div>
  );
};
