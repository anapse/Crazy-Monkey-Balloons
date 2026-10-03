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
  const [pendingActionAfterName, setPendingActionAfterName] = useState<'newGame' | 'retryGameOver' | null>(null);

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
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || path.endsWith('/admin') || hash === '#admin') {
        setView('admin');
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
    setPendingActionAfterName('newGame');
    setShowPlayerNameModal(true);
  };

  const handleConfirmName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    StorageService.setPlayerName(trimmed);
    setShowPlayerNameModal(false);

    if (pendingActionAfterName === 'retryGameOver') {
      setPendingActionAfterName(null);
      handleRetryLevel();
    } else {
      setPendingActionAfterName(null);
      startNewGame();
    }
  };

  const handleCancelPlayerName = () => {
    setShowPlayerNameModal(false);
    if (pendingActionAfterName === 'retryGameOver') {
      setShowGameOver(true);
    }
    setPendingActionAfterName(null);
  };

  const handleGameOverKeepName = () => {
    soundManager.playClick();
    setShowGameOver(false);
    handleRetryLevel();
  };

  const handleGameOverChangeName = () => {
    soundManager.playClick();
    setShowGameOver(false);
    setPendingActionAfterName('retryGameOver');
    setShowPlayerNameModal(true);
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
  };

  const handleLevelWin = useCallback((finalScore: number, balloonsPopped: number) => {
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
  };

  const handleNextLevel = () => {
    setShowVictory(false);
    const nextLvl = currentLevelNumber + 1;
    setCurrentLevelNumber(nextLvl);
    levelStartTimeRef.current = Date.now();
    if (engineRef.current) {
      engineRef.current.initLevel(getLevelConfig(nextLvl));
    }
  };

  const handleRetryLevel = () => {
    setShowGameOver(false);
    setLives(3);
    levelStartTimeRef.current = Date.now();
    if (engineRef.current) {
      engineRef.current.lives = 3;
      engineRef.current.initLevel(getLevelConfig(currentLevelNumber));
    }
  };

  const handlePause = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.isPaused = true;
    }
    setShowPause(true);
  };

  const handleResume = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.isPaused = false;
    }
    setShowPause(false);
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    setShowPause(false);
    setShowGameOver(false);
    setShowVictory(false);
    setView('menu');
  };

  const levelConfig = getLevelConfig(currentLevelNumber);

  // Admin Dashboard route view
  if (view === 'admin') {
    return (
      <AdminDashboard
        onBackToGame={() => {
          window.location.hash = '';
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
          title={pendingActionAfterName === 'retryGameOver' ? 'CAMBIAR NOMBRE' : 'NOMBRE DEL JUGADOR'}
          subtitle={
            pendingActionAfterName === 'retryGameOver'
              ? 'Introduce tu nuevo nombre para continuar tu partida y registrar tu récord.'
              : 'Ingresa obligatoriamente tu nombre para comenzar la partida y guardar tu ranking.'
          }
          confirmButtonText={pendingActionAfterName === 'retryGameOver' ? 'CONTINUAR' : 'JUGAR'}
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
          onKeepName={handleGameOverKeepName}
          onChangeName={handleGameOverChangeName}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}
