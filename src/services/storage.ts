import { ScoreEntry, MatchRecord, AnalyticsSummary } from '../types/game';
import { FirebaseService } from './firebase';

const STORAGE_KEYS = {
  PLAYER_NAME: 'cmb_player_name',
  LOCAL_RECORD: 'cmb_local_record',
  TOP_SCORES: 'cmb_top_scores_v1',
  MATCH_HISTORY: 'cmb_match_history_v1',
  ANALYTICS: 'cmb_analytics_v1',
  VISITS: 'cmb_visits_v1',
  SOUND_ENABLED: 'cmb_sound_enabled',
};

// Known mock / placeholder player names to delete and prevent from appearing
export const MOCK_PLAYER_NAMES = new Set([
  'BananoMaster',
  'BalloonSlayer',
  'CrazyCannon',
  'MonoPro',
  'ReboteRey',
  'Chimpazoom',
  'GigaBalloons',
]);

export const isRealPlayer = (name?: string): boolean => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && !MOCK_PLAYER_NAMES.has(trimmed);
};

// Initial default high scores are strictly empty (only real scores)
const DEFAULT_TOP_SCORES: ScoreEntry[] = [];

export class StorageService {
  // Purge any residual mock/fake player data from local storage on launch
  static purgeMockPlayers(): void {
    try {
      // 1. Clean Top Scores
      const rawScores = localStorage.getItem(STORAGE_KEYS.TOP_SCORES);
      if (rawScores) {
        const scores: ScoreEntry[] = JSON.parse(rawScores);
        const cleanScores = scores.filter((s) => isRealPlayer(s.playerName));
        localStorage.setItem(STORAGE_KEYS.TOP_SCORES, JSON.stringify(cleanScores));
      }

      // 2. Clean Unique Players
      const rawPlayers = localStorage.getItem('cmb_unique_players');
      if (rawPlayers) {
        const players: string[] = JSON.parse(rawPlayers);
        const cleanPlayers = players.filter((p) => isRealPlayer(p));
        localStorage.setItem('cmb_unique_players', JSON.stringify(cleanPlayers));
      }

      // 3. Clean Match History
      const rawMatches = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (rawMatches) {
        const matches: MatchRecord[] = JSON.parse(rawMatches);
        const cleanMatches = matches.filter((m) => isRealPlayer(m.playerName));
        localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(cleanMatches));
      }
    } catch {
      // Ignore storage read/write errors
    }
  }

  // Player Name
  static getPlayerName(): string {
    const name = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
    return isRealPlayer(name) ? name : '';
  }

  static setPlayerName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, trimmed);
    this.registerPlayer(trimmed);
  }

  // Sound setting
  static isSoundEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return val === null ? true : val === 'true';
  }

  static setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
  }

  // Track visit
  static trackVisit(): void {
    this.purgeMockPlayers();
    const today = new Date().toISOString().split('T')[0];
    const visits = this.getVisitsData();
    visits.totalVisits = (visits.totalVisits || 0) + 1;
    visits.dailyVisits = visits.dailyVisits || {};
    visits.dailyVisits[today] = (visits.dailyVisits[today] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));

    // Update analytics summary
    const analytics = this.getAnalyticsSummary();
    analytics.totalVisits = visits.totalVisits;
    analytics.dailyVisits = visits.dailyVisits;
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));

    // Cloud sync with Firebase
    FirebaseService.trackVisit().catch(() => {});
  }

  static getVisitsData(): { totalVisits: number; dailyVisits: { [date: string]: number } } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VISITS);
      if (!raw) return { totalVisits: 1, dailyVisits: { [new Date().toISOString().split('T')[0]]: 1 } };
      return JSON.parse(raw);
    } catch {
      return { totalVisits: 1, dailyVisits: {} };
    }
  }

  // Register Unique Player
  static registerPlayer(playerName: string): void {
    const trimmed = playerName.trim();
    if (!isRealPlayer(trimmed)) return;
    const players = this.getUniquePlayers();
    if (!players.includes(trimmed)) {
      players.push(trimmed);
      localStorage.setItem('cmb_unique_players', JSON.stringify(players));
    }
  }

  static getUniquePlayers(): string[] {
    try {
      const raw = localStorage.getItem('cmb_unique_players');
      if (!raw) return [];
      const players: string[] = JSON.parse(raw);
      return players.filter((p) => isRealPlayer(p));
    } catch {
      return [];
    }
  }

  // Local record
  static getLocalRecord(): { score: number; level: number; balloonsPopped: number; gamesPlayed: number } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_RECORD);
      if (!raw) return { score: 0, level: 1, balloonsPopped: 0, gamesPlayed: 0 };
      return JSON.parse(raw);
    } catch {
      return { score: 0, level: 1, balloonsPopped: 0, gamesPlayed: 0 };
    }
  }

  static updateLocalRecord(score: number, level: number, balloonsPopped: number): void {
    const current = this.getLocalRecord();
    const updated = {
      score: Math.max(current.score, score),
      level: Math.max(current.level, level),
      balloonsPopped: current.balloonsPopped + balloonsPopped,
      gamesPlayed: current.gamesPlayed + 1,
    };
    localStorage.setItem(STORAGE_KEYS.LOCAL_RECORD, JSON.stringify(updated));
  }

  // Top 50 Leaderboard (Only real players, shows all match records)
  static getTop50(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOP_SCORES);
      if (!raw) return [];
      const scores: ScoreEntry[] = JSON.parse(raw);
      const cleanScores = scores.filter((s) => isRealPlayer(s.playerName));
      cleanScores.sort((a, b) => b.score - a.score);
      return cleanScores.slice(0, 50);
    } catch {
      return [];
    }
  }

  // Fetch online Top 50 directly from Firebase Firestore (All records of each name)
  static async fetchOnlineTop50(): Promise<ScoreEntry[]> {
    try {
      const onlineScores = await FirebaseService.getTopScores(50);
      const filteredOnline = onlineScores.filter((s) => isRealPlayer(s.playerName));
      filteredOnline.sort((a, b) => b.score - a.score);

      const top50 = filteredOnline.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.TOP_SCORES, JSON.stringify(top50));
      return top50;
    } catch (e) {
      console.warn('Firebase getTopScores error, returning local cache:', e);
    }
    return this.getTop50();
  }

  static saveScore(playerName: string, score: number, levelReached: number, balloonsPopped: number): ScoreEntry[] {
    const cleanName = isRealPlayer(playerName) ? playerName.trim() : 'Jugador';
    const scores = this.getTop50();

    const newEntry: ScoreEntry = {
      id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      playerName: cleanName,
      score,
      levelReached,
      balloonsPopped,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    const top50 = scores.slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.TOP_SCORES, JSON.stringify(top50));
    this.updateLocalRecord(score, levelReached, balloonsPopped);
    this.registerPlayer(cleanName);

    // Persist score in Firebase Firestore
    FirebaseService.saveScore({
      playerName: cleanName,
      score,
      level: levelReached,
      balloonsPopped,
    }).catch(() => {});

    return top50;
  }

  // Match History
  static logMatch(match: Omit<MatchRecord, 'id' | 'date' | 'timestamp'>): void {
    try {
      const cleanName = isRealPlayer(match.playerName) ? match.playerName.trim() : 'Jugador';
      const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      const history: MatchRecord[] = raw ? JSON.parse(raw) : [];

      const record: MatchRecord = {
        ...match,
        playerName: cleanName,
        id: 'match_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      };

      const cleanHistory = history.filter((m) => isRealPlayer(m.playerName));
      cleanHistory.unshift(record); // newest first
      // Keep last 100 matches
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(cleanHistory.slice(0, 100)));

      // Update analytics
      this.updateAnalyticsOnMatch(record);

      // Cloud sync analytics with Firebase
      FirebaseService.trackGameMatch({
        score: match.score,
        balloonsDestroyed: match.balloonsDestroyed,
        result: match.result,
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to log match', e);
    }
  }

  static getMatchHistory(): MatchRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (!raw) return [];
      const history: MatchRecord[] = JSON.parse(raw);
      return history.filter((m) => isRealPlayer(m.playerName));
    } catch {
      return [];
    }
  }

  // Analytics summary for /admin
  static updateAnalyticsOnMatch(match: MatchRecord): void {
    const analytics = this.getAnalyticsSummary();
    analytics.gamesStarted += 1;
    if (match.result === 'won') {
      analytics.gamesCompleted += 1;
    }
    analytics.totalPoints += match.score;
    analytics.balloonsDestroyed += match.balloonsDestroyed;
    analytics.powerUpsUsed += match.powerUpsUsed;

    const history = this.getMatchHistory();
    analytics.avgScore = history.length > 0 ? Math.round(analytics.totalPoints / history.length) : match.score;

    const uniquePlayers = this.getUniquePlayers();
    analytics.uniquePlayers = uniquePlayers.length;

    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  }

  static getAnalyticsSummary(): AnalyticsSummary {
    const visits = this.getVisitsData();
    const uniquePlayers = this.getUniquePlayers();
    const matches = this.getMatchHistory();
    const topScores = this.getTop50();

    let totalPoints = 0;
    let balloonsDestroyed = 0;
    let powerUpsUsed = 0;
    let completedCount = 0;

    matches.forEach((m) => {
      totalPoints += m.score;
      balloonsDestroyed += m.balloonsDestroyed;
      powerUpsUsed += m.powerUpsUsed;
      if (m.result === 'won') completedCount++;
    });

    const avgScore = matches.length > 0 ? Math.round(totalPoints / matches.length) : (topScores[0]?.score || 0);

    return {
      totalVisits: visits.totalVisits || 1,
      gamesStarted: matches.length,
      gamesCompleted: completedCount,
      uniquePlayers: uniquePlayers.length,
      totalPoints,
      avgScore,
      balloonsDestroyed,
      powerUpsUsed,
      dailyVisits: visits.dailyVisits || {},
    };
  }
}

// Automatically purge mock players immediately upon script load
StorageService.purgeMockPlayers();
