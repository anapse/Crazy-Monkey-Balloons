import React from 'react';
import { PowerUpInventory, PowerUpType } from '../types/game';
import { Pause, Volume2, VolumeX } from 'lucide-react';
import { assetManager } from '../services/assetManager';

interface HUDProps {
  levelNumber: number;
  score: number;
  lives: number;
  remainingBalloons: number;
  totalBalloons: number;
  inventory: PowerUpInventory;
  activePowerUp: PowerUpType | 'normal';
  onSelectPowerUp: (type: PowerUpType | 'normal') => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelNumber,
  score,
  lives,
  remainingBalloons,
  totalBalloons,
  inventory,
  activePowerUp,
  onSelectPowerUp,
  onPause,
  isMuted,
  onToggleMute,
}) => {
  const heartImg = assetManager.getSpriteDataUrl('ui.heart', 32, 32);
  const coinImg = assetManager.getSpriteDataUrl('ui.coin', 32, 32);

  const powerUpItems: { type: PowerUpType | 'normal'; key: string; name: string; color: string }[] = [
    { type: 'normal', key: 'ui.cannonball', name: 'Bala', color: 'border-slate-600' },
    { type: 'explosive', key: 'powerups.explosive', name: 'Explosiva', color: 'border-orange-500/60' },
    { type: 'triple', key: 'powerups.triple', name: 'Triple', color: 'border-sky-500/60' },
    { type: 'piercing', key: 'powerups.piercing', name: 'Perforante', color: 'border-purple-500/60' },
    { type: 'bounce', key: 'powerups.bounce', name: 'Rebote', color: 'border-emerald-500/60' },
    { type: 'rainbow', key: 'powerups.multicolor', name: 'Multicolor', color: 'border-amber-400/70' },
    { type: 'electric', key: 'powerups.electric', name: 'Eléctrica', color: 'border-cyan-400/60' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 select-none z-20 overflow-hidden">
      {/* Top Header Panel: Compact, Semi-Transparent, Clean */}
      <div className="pointer-events-auto self-center w-full max-w-[430px] bg-slate-950/85 border border-amber-500/40 rounded-full px-3 py-1 shadow-[0_6px_20px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-between text-xs mt-1">
        {/* Lives Counter */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-slate-700/80">
          <div className="w-4 h-4 flex items-center justify-center">
            {heartImg ? (
              <img src={heartImg} alt="Heart" className="w-full h-full object-contain filter drop-shadow" />
            ) : (
              <span className="text-xs">❤️</span>
            )}
          </div>
          <span className="font-black text-rose-400 text-xs">x{lives}</span>
        </div>

        {/* Level Indicator */}
        <div className="flex items-center gap-1.5 font-black text-amber-300 tracking-wide uppercase">
          <span className="text-[10px] text-amber-400/90">NIVEL</span>
          <span className="text-amber-100 text-xs sm:text-sm">{levelNumber}</span>
        </div>

        {/* Score / Coins */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-slate-700/80">
          <div className="w-4 h-4 flex items-center justify-center">
            {coinImg ? (
              <img src={coinImg} alt="Coin" className="w-full h-full object-contain filter drop-shadow" />
            ) : (
              <span className="text-xs">⭐</span>
            )}
          </div>
          <span className="font-black text-amber-300 text-xs">{score}</span>
        </div>

        {/* Sound & Compact Pause Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-transform active:scale-95 cursor-pointer border border-slate-700/80"
            title="Sonido / Música"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={onPause}
            className="p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-transform active:scale-95 cursor-pointer border border-amber-500/60 shadow-sm"
            title="Pausa"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Bottom Power-Ups Bar: Slim, Compact, Perfectly Proportioned within Canvas width */}
      <div className="pointer-events-auto self-center w-[92%] max-w-[340px] px-1 bg-slate-950/90 border border-amber-500/40 rounded-xl py-1 shadow-[0_4px_16px_rgba(0,0,0,0.9)] backdrop-blur-md flex items-center justify-between gap-1 mb-1.5">
        {powerUpItems.map((item) => {
          const isNormal = item.type === 'normal';
          const count = isNormal ? 1 : inventory[item.type as PowerUpType];
          const isActive = activePowerUp === item.type;
          const imgUrl = assetManager.getSpriteDataUrl(item.key, 28, 28);

          return (
            <button
              key={item.type}
              onClick={() => onSelectPowerUp(isActive && !isNormal ? 'normal' : item.type)}
              disabled={!isNormal && count <= 0}
              className={`relative flex flex-1 min-w-[28px] max-w-[42px] h-9 sm:h-10 flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                count <= 0 && !isNormal
                  ? 'opacity-30 grayscale border-slate-800 bg-slate-900/40 cursor-not-allowed'
                  : isActive
                  ? 'border-yellow-400 ring-2 ring-yellow-400/80 bg-gradient-to-b from-sky-600 via-sky-800 to-slate-950 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                  : `${item.color} hover:border-amber-400/60 bg-gradient-to-b from-slate-800/90 to-slate-950 text-slate-200`
              }`}
            >
              {imgUrl ? (
                <img src={imgUrl} alt={item.name} className="w-5 h-5 object-contain drop-shadow" />
              ) : (
                <span className="text-xs">💣</span>
              )}

              {/* Quantity Badge at Bottom Right */}
              <span className="absolute bottom-0 right-0.5 text-[8px] font-black text-amber-300 drop-shadow leading-none">
                {isNormal ? 'x1' : `x${count}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
