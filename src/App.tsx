import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { PlayerNameModal } from './components/PlayerNameModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ContactModal } from './components/ContactModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LocalRecordModal } from './components/LocalRecordModal';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AssetRequirementsModal } from './components/AssetRequirementsModal';

import { GameEngine, GameCallbacks } from './game/engine';
import { getLevelConfig } from './game/levels';
import { StorageService } from './services/storage';
import { PowerUpInventory, PowerUpType } from './types/game';
import { soundManager } from './game/audio';

export default function App() {
  const [view, setView] = useState<'menu' | 'playing' | 'admin'>('menu');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [playerName, setPlayerName] = useState<string>('');

  // Game Stats
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [remainingBalloons, setRemainingBalloons] = useState<number>(0);
  const [totalBalloons, setTotalBalloons] = useState<number>(0);
  const [inventory, setInventory] = useState<PowerUpInventory>({
    explosive: 0,
    triple: 0,
    piercing: 0,
    bounce: 0,
    rainbow: 0,
    electric: 0,
  });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | 'normal'>('normal');

  // Modals
  const [showPlayerNameModal, setShowPlayerNameModal] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);
  const [showTop50, setShowTop50] = useState<boolean>(false);
  const [showLocalRecord, setShowLocalRecord] = useState<boolean>(false);
  const [showPause, setShowPause] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showAssetRequirements, setShowAssetRequirements] = useState<boolean>(false);

  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getIsMuted());

  const engineRef = useRef<GameEngine | null>(null);
  const levelStartTimeRef = useRef<number>(Date.now());

  // Check URL path/hash for /admin route
  useEffect(() => {
    StorageService.trackVisit();
    setPlayerName(StorageService.getPlayerName());

    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/admin' ||
        path.endsWith('/admin') ||
        path.endsWith('/admin/') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        search.includes('admin')
      ) {
        setView('admin');
      } else {
        setView((prev) => (prev === 'admin' ? 'menu' : prev));
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(!muted);
  };

  const handlePlayClick = () => {
    soundManager.playClick();
    if (!playerName.trim()) {
      setShowPlayerNameModal(true);
    } else {
      startNewGame();
    }
  };

  const handleConfirmName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    StorageService.setPlayerName(trimmed);
    setShowPlayerNameModal(false);
    startNewGame();
  };

  const handleCancelPlayerName = () => {
    setShowPlayerNameModal(false);
  };

  const handleGameOverPlayAgain = () => {
    soundManager.playClick();
    setShowGameOver(false);
    startNewGame();
  };

  const startNewGame = () => {
    setCurrentLevelNumber(1);
    setScore(0);
    setLives(3);
    setInventory({
      explosive: 0,
      triple: 0,
      piercing: 0,
      bounce: 0,
      rainbow: 0,
      electric: 0,
    });
    setActivePowerUp('normal');
    levelStartTimeRef.current = Date.now();
    setView('playing');
    soundManager.resumeCircusMusic();
    if (engineRef.current) {
      engineRef.current.score = 0;
      engineRef.current.lives = 3;
      engineRef.current.inventory = {
        explosive: 0,
        triple: 0,
        piercing: 0,
        bounce: 0,
        rainbow: 0,
        electric: 0,
      };
      engineRef.current.activePowerUp = 'normal';
      engineRef.current.initLevel(getLevelConfig(1));
    }
  };

  const handleLevelWin = useCallback((finalScore: number, balloonsPopped: number) => {
    soundManager.pauseCircusMusic();
    setScore(finalScore);
    setShowVictory(true);

    const duration = Math.round((Date.now() - levelStartTimeRef.current) / 1000);
    StorageService.saveScore(playerName, finalScore, currentLevelNumber, balloonsPopped);
    StorageService.logMatch({
      playerName,
      level: currentLevelNumber,
      score: finalScore,
      result: 'won',
      durationSeconds: duration,
      balloonsDestroyed: balloonsPopped,
      powerUpsUsed: 1,
    });
  }, [playerName, currentLevelNumber]);

  const handleGameOver = useCallback((finalScore: number, levelReached: number) => {
    soundManager.pauseCircusMusic();
    setScore(finalScore);
    setShowGameOver(true);

    const duration = Math.round((Date.now() - levelStartTimeRef.current) / 1000);
    StorageService.saveScore(playerName, finalScore, levelReached, remainingBalloons);
    StorageService.logMatch({
      playerName,
      level: levelReached,
      score: finalScore,
      result: 'lost',
      durationSeconds: duration,
      balloonsDestroyed: totalBalloons - remainingBalloons,
      powerUpsUsed: 1,
    });
  }, [playerName, remainingBalloons, totalBalloons]);

  const callbacks: GameCallbacks = {
    onLevelWin: handleLevelWin,
    onGameOver: handleGameOver,
    onScoreUpdate: (s) => setScore(s),
    onLivesUpdate: (l) => setLives(l),
    onBalloonsUpdate: (rem, tot) => {
      setRemainingBalloons(rem);
      setTotalBalloons(tot);
    },
    onInventoryUpdate: (inv) => setInventory({ ...inv }),
    onActivePowerUpChange: (type) => setActivePowerUp(type),
  };

  const handleNextLevel = () => {
    setShowVictory(false);
    const nextLvl = currentLevelNumber + 1;
    setCurrentLevelNumber(nextLvl);
    levelStartTimeRef.current = Date.now();
    soundManager.resumeCircusMusic();
    if (engineRef.current) {
      engineRef.current.initLevel(getLevelConfig(nextLvl));
    }
  };

  const handleRetryLevel = () => {
    setShowGameOver(false);
    setLives(3);
    levelStartTimeRef.current = Date.now();
    soundManager.resumeCircusMusic();
    if (engineRef.current) {
      engineRef.current.lives = 3;
      engineRef.current.initLevel(getLevelConfig(currentLevelNumber));
    }
  };

  const handlePause = () => {
    soundManager.playClick();
    soundManager.pauseCircusMusic();
    if (engineRef.current) {
      engineRef.current.isPaused = true;
    }
    setShowPause(true);
  };

  const handleResume = () => {
    soundManager.playClick();
    soundManager.resumeCircusMusic();
    if (engineRef.current) {
      engineRef.current.isPaused = false;
    }
    setShowPause(false);
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    soundManager.stopCircusMusic();
    setShowPause(false);
    setShowGameOver(false);
    setShowVictory(false);
    setView('menu');
  };

  const levelConfig = getLevelConfig(currentLevelNumber);

  // Admin Dashboard route view (Acceso exclusivo por ruta URL)
  if (view === 'admin') {
    return (
      <AdminDashboard
        onBackToGame={() => {
          if (window.location.hash) {
            window.location.hash = '';
          }
          if (window.location.pathname.toLowerCase().endsWith('/admin') || window.location.pathname.toLowerCase().endsWith('/admin/')) {
            const basePath = window.location.pathname.replace(/\/admin\/?$/i, '') || '/';
            window.history.pushState(null, '', basePath);
          }
          if (window.location.search.toLowerCase().includes('admin')) {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.delete('admin');
            searchParams.delete('view');
            const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
            window.history.pushState(null, '', window.location.pathname + newSearch);
          }
          setView('menu');
        }}
      />
    );
  }

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* 9:16 Game Container Area */}
      <div className="relative flex items-center justify-center max-w-full max-h-full">
        {view === 'menu' ? (
          <div className="relative aspect-[9/16] h-[92vh] max-h-[820px] w-auto max-w-full flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <MainMenu
              onPlay={handlePlayClick}
              onOpenTop50={() => { soundManager.playClick(); setShowTop50(true); }}
              onOpenHowToPlay={() => { soundManager.playClick(); setShowHowToPlay(true); }}
              onOpenLocalRecord={() => { soundManager.playClick(); setShowLocalRecord(true); }}
              onOpenContact={() => { soundManager.playClick(); setShowContact(true); }}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              localRecordScore={StorageService.getLocalRecord().score}
            />
          </div>
        ) : (
          <div className="relative aspect-[9/16] h-[92vh] max-h-[820px] w-auto max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
            <GameCanvas
              level={levelConfig}
              callbacks={callbacks}
              onEngineReady={(engine) => {
                engineRef.current = engine;
              }}
              activePowerUp={activePowerUp}
            />

            <HUD
              levelNumber={currentLevelNumber}
              score={score}
              lives={lives}
              remainingBalloons={remainingBalloons}
              totalBalloons={totalBalloons}
              inventory={inventory}
              activePowerUp={activePowerUp}
              onSelectPowerUp={(type) => setActivePowerUp(type)}
              onPause={handlePause}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {showPlayerNameModal && (
        <PlayerNameModal
          initialName={playerName}
          onConfirmName={handleConfirmName}
          onCancel={handleCancelPlayerName}
          title="NOMBRE DEL JUGADOR"
          subtitle="Ingresa tu nombre para comenzar la partida y guardar tu ranking global."
          confirmButtonText="JUGAR"
        />
      )}

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {showTop50 && <LeaderboardModal onClose={() => setShowTop50(false)} />}

      {showLocalRecord && <LocalRecordModal onClose={() => setShowLocalRecord(false)} />}

      {showAssetRequirements && <AssetRequirementsModal onClose={() => setShowAssetRequirements(false)} />}

      {showPause && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRetryLevel}
          onMainMenu={handleMainMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {showVictory && (
        <VictoryModal
          levelNumber={currentLevelNumber}
          score={score}
          onNextLevel={handleNextLevel}
          onMainMenu={handleMainMenu}
        />
      )}

      {showGameOver && (
        <GameOverModal
          score={score}
          levelNumber={currentLevelNumber}
          playerName={playerName}
          onPlayAgain={handleGameOverPlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}
