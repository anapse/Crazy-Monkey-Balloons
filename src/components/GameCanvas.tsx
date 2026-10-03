import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GameCallbacks } from '../game/engine';
import { LevelConfig, PowerUpInventory, PowerUpType } from '../types/game';

interface GameCanvasProps {
  level: LevelConfig;
  callbacks: GameCallbacks;
  onEngineReady: (engine: GameEngine) => void;
  activePowerUp: PowerUpType | 'normal';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  callbacks,
  onEngineReady,
  activePowerUp,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Aspect ratio 9:16 dimension calculation state
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 450,
    height: 800,
  });

  // Handle exact 9:16 viewport scaling for PC & Mobile
  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Vertical 9:16 ratio calculation
      let calculatedHeight = vh;
      let calculatedWidth = (vh * 9) / 16;

      // If PC or wide screen where calculated width exceeds viewport width
      if (calculatedWidth > vw) {
        calculatedWidth = vw;
        calculatedHeight = (vw * 16) / 9;
      }

      setDimensions({
        width: calculatedWidth,
        height: calculatedHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 480;
    canvas.height = 853; // Internal logical resolution

    const engine = new GameEngine(canvas, level, callbacks);
    engineRef.current = engine;
    onEngineReady(engine);

    engine.start();

    return () => {
      engine.stop();
    };
  }, [level]);

  // Sync active power up
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.selectPowerUp(activePowerUp);
    }
  }, [activePowerUp]);

  // Pointer & Input Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 480 / rect.width;
    const scaleY = 853 / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    engineRef.current.isAiming = true;
    engineRef.current.updateAim(canvasX, canvasY);

    // If touching/clicking in bottom area, also move cannon
    if (canvasY > 600) {
      engineRef.current.moveCannonHorizontal(canvasX);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current || !engineRef.current.isAiming) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 480 / rect.width;
    const scaleY = 853 / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    engineRef.current.updateAim(canvasX, canvasY);

    if (canvasY > 600) {
      engineRef.current.moveCannonHorizontal(canvasX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;
    if (engineRef.current.isAiming) {
      engineRef.current.isAiming = false;
      engineRef.current.fireCannon();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center overflow-hidden touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full object-fill cursor-crosshair touch-none"
      />
    </div>
  );
};
