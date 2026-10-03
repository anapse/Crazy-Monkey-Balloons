import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Users,
  Trophy,
  History,
  Eye,
  Target,
  Zap,
  Lock,
  LogOut,
  ArrowUpRight,
  Gamepad2,
  RefreshCw,
  Mail,
  Cloud,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { FirebaseService } from '../services/firebase';
import { ScoreEntry, MatchRecord, AnalyticsSummary } from '../types/game';

interface AdminDashboardProps {
  onBackToGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToGame }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'resumen' | 'ranking' | 'historial' | 'visitas' | 'jugadores' | 'analitica' | 'mensajes'>('resumen');

  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalVisits: 0,
    gamesStarted: 0,
    gamesCompleted: 0,
    uniquePlayers: 0,
    totalPoints: 0,
    avgScore: 0,
    balloonsDestroyed: 0,
    powerUpsUsed: 0,
    dailyVisits: {},
  });

  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [playersList, setPlayersList] = useState<string[]>([]);
  const [contactMessages, setContactMessages] = useState<Array<{ id: string; name: string; email: string; message: string; timestamp: number }>>([]);

  useEffect(() => {
    // Check session auth
    const session = sessionStorage.getItem('cmb_admin_authenticated');
    if (session === 'true') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = () => {
    setAnalytics(StorageService.getAnalyticsSummary());
    setTopScores(StorageService.getTop50());
    setMatchHistory(StorageService.getMatchHistory());
    setPlayersList(StorageService.getUniquePlayers());

    // Cloud sync with Firebase Firestore
    StorageService.fetchOnlineTop50().then(setTopScores).catch(() => {});
    FirebaseService.getContactMessages().then(setContactMessages).catch(() => {});
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId.trim() === 'anapse' && adminPassword === '16546203') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cmb_admin_authenticated', 'true');
      setAuthError('');
      loadDashboardData();
    } else {
      setAuthError('Credenciales incorrectas. Verifique ID y contraseña.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cmb_admin_authenticated');
    setAdminPassword('');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1">DASHBOARD ADMIN</h2>
          <p className="text-xs text-slate-400 mb-6 text-center">Acceso Administrativo a Crazy Monkey Balloons</p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ID Administrativo</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="ID de usuario"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold text-sm"
              />
            </div>

            {authError && <div className="text-xs text-rose-400 font-bold bg-rose-950/50 p-3 rounded-xl border border-rose-800/50">{authError}</div>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-lg transition-all mt-2 cursor-pointer"
            >
              INGRESAR AL PANEL
            </button>

            <button
              type="button"
              onClick={onBackToGame}
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all text-center"
            >
              Volver al Juego
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard Main Full-Width View
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-wide">PANEL ADMINISTRATIVO</h1>
            <p className="text-xs text-amber-400 font-semibold">Crazy Monkey Balloons • Métricas en Tiempo Real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Firestore Conectado</span>
          </div>

          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 cursor-pointer"
            title="Actualizar Datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onBackToGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            Ir al Juego
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
          {[
            { id: 'resumen', label: 'Resumen', icon: BarChart3 },
            { id: 'ranking', label: 'Ranking Top 50', icon: Trophy },
            { id: 'historial', label: 'Historial Partidas', icon: History },
            { id: 'visitas', label: 'Visitas', icon: Eye },
            { id: 'jugadores', label: 'Jugadores', icon: Users },
            { id: 'analitica', label: 'Analítica', icon: Target },
            { id: 'mensajes', label: `Mensajes (${contactMessages.length})`, icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Contents View Area */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">Resumen General de Actividad</h2>

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Visitas Totales</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">{analytics.totalVisits.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Partidas Iniciadas</span>
                    <div className="text-2xl font-black text-sky-400 mt-1">{analytics.gamesStarted.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Partidas Completadas</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{analytics.gamesCompleted.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Jugadores Únicos</span>
                    <div className="text-2xl font-black text-purple-400 mt-1">{analytics.uniquePlayers.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400">Promedio Puntuación</span>
                  <div className="text-xl font-bold text-amber-300 mt-1">{analytics.avgScore.toLocaleString()} pts</div>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400">Globos Destruidos</span>
                  <div className="text-xl font-bold text-rose-400 mt-1">{analytics.balloonsDestroyed.toLocaleString()} 🎈</div>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400">Power-Ups Usados</span>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{analytics.powerUpsUsed || 0} ⚡</div>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400">Tasa de Victoria</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {analytics.gamesStarted > 0 ? Math.round((analytics.gamesCompleted / analytics.gamesStarted) * 100) : 100}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RANKING TOP 50 */}
          {activeTab === 'ranking' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Ranking Global Top 50</h2>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Posición</th>
                        <th className="px-6 py-4">Jugador</th>
                        <th className="px-6 py-4">Puntuación</th>
                        <th className="px-6 py-4">Nivel Alcanzado</th>
                        <th className="px-6 py-4">Globos Pop</th>
                        <th className="px-6 py-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {topScores.map((score, index) => (
                        <tr key={score.id || index} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-black text-amber-400">#{index + 1}</td>
                          <td className="px-6 py-4 font-bold text-white">{score.playerName}</td>
                          <td className="px-6 py-4 font-black text-emerald-400">{score.score.toLocaleString()}</td>
                          <td className="px-6 py-4">Nivel {score.levelReached}</td>
                          <td className="px-6 py-4">{score.balloonsPopped} 🎈</td>
                          <td className="px-6 py-4 text-slate-500">{score.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Historial Reciente de Partidas</h2>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Jugador</th>
                        <th className="px-6 py-4">Nivel</th>
                        <th className="px-6 py-4">Puntuación</th>
                        <th className="px-6 py-4">Resultado</th>
                        <th className="px-6 py-4">Duración</th>
                        <th className="px-6 py-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {matchHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                            No hay historial de partidas guardado aún.
                          </td>
                        </tr>
                      ) : (
                        matchHistory.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-bold text-white">{m.playerName}</td>
                            <td className="px-6 py-4">Nivel {m.level}</td>
                            <td className="px-6 py-4 font-bold text-amber-400">{m.score.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                  m.result === 'won' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {m.result === 'won' ? 'GANADO' : 'PERDIDO'}
                              </span>
                            </td>
                            <td className="px-6 py-4">{m.durationSeconds}s</td>
                            <td className="px-6 py-4 text-slate-500">{m.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VISITAS */}
          {activeTab === 'visitas' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Evolución de Visitas</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block mb-2">Total de Visitas Registradas</span>
                  <div className="text-4xl font-black text-amber-400">{analytics.totalVisits.toLocaleString()}</div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block mb-4">Registro Diario de Visitas</span>
                  <div className="space-y-2">
                    {Object.entries(analytics.dailyVisits || {}).map(([date, count]) => (
                      <div key={date} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                        <span className="text-slate-300 font-medium">{date}</span>
                        <span className="font-bold text-emerald-400">{count} visitas</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JUGADORES */}
          {activeTab === 'jugadores' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Jugadores Únicos ({playersList.length})</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {playersList.map((player, idx) => (
                  <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-sm">
                      🐒
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{player}</div>
                      <div className="text-[10px] text-slate-400">Jugador Registrado</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ANALÍTICA */}
          {activeTab === 'analitica' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Analítica & Métricas de Partidas</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-amber-300">Rendimiento Global</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Puntos Totales Acumulados</span>
                    <span className="font-bold text-white">{analytics.totalPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Globos Destruidos</span>
                    <span className="font-bold text-rose-400">{analytics.balloonsDestroyed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Power-Ups Desplegados</span>
                    <span className="font-bold text-cyan-400">{analytics.powerUpsUsed.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-emerald-300">Conexión a Firebase</h3>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    Base de datos Firestore sincronizada en tiempo real. Todas las puntuaciones del Top 50, visitas y mensajes de contacto se almacenan en la nube de Google Cloud / Firebase.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MENSAJES DE CONTACTO */}
          {activeTab === 'mensajes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Buzón de Mensajes Firestore</h2>
                  <p className="text-xs text-slate-400">Mensajes enviados por los jugadores desde el formulario de contacto</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
                  {contactMessages.length} recibidos
                </span>
              </div>

              {contactMessages.length === 0 ? (
                <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs">
                  No hay mensajes recibidos aún en la colección 'messages' de Firebase.
                </div>
              ) : (
                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{msg.name}</span>
                          <span className="text-slate-500 text-xs">•</span>
                          <a href={`mailto:${msg.email}`} className="text-amber-400 text-xs hover:underline">
                            {msg.email}
                          </a>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
