import { ScoreEntry, MatchRecord, AnalyticsSummary } from '../types/game';

const STORAGE_KEYS = {
  PLAYER_NAME: 'cmb_player_name',
  LOCAL_RECORD: 'cmb_local_record',
  TOP_SCORES: 'cmb_top_scores_v1',
  MATCH_HISTORY: 'cmb_match_history_v1',
  ANALYTICS: 'cmb_analytics_v1',
  VISITS: 'cmb_visits_v1',
  SOUND_ENABLED: 'cmb_sound_enabled',
};

// Initial default high scores for initial ranking if empty
const DEFAULT_TOP_SCORES: ScoreEntry[] = [
  { id: '1', playerName: 'BananoMaster', score: 28400, levelReached: 12, balloonsPopped: 184, date: '2026-10-01', timestamp: Date.now() - 86400000 * 2 },
  { id: '2', playerName: 'BalloonSlayer', score: 24150, levelReached: 10, balloonsPopped: 152, date: '2026-10-01', timestamp: Date.now() - 86400000 * 2 },
  { id: '3', playerName: 'CrazyCannon', score: 21900, levelReached: 9, balloonsPopped: 139, date: '2026-10-02', timestamp: Date.now() - 86400000 },
  { id: '4', playerName: 'MonoPro', score: 19850, levelReached: 8, balloonsPopped: 120, date: '2026-10-02', timestamp: Date.now() - 86400000 },
  { id: '5', playerName: 'ReboteRey', score: 17200, levelReached: 7, balloonsPopped: 105, date: '2026-10-02', timestamp: Date.now() - 43200000 },
  { id: '6', playerName: 'Chimpazoom', score: 15400, levelReached: 6, balloonsPopped: 91, date: '2026-10-02', timestamp: Date.now() - 21600000 },
  { id: '7', playerName: 'GigaBalloons', score: 13800, levelReached: 5, balloonsPopped: 80, date: '2026-10-02', timestamp: Date.now() - 10800000 },
];

export class StorageService {
  // Player Name
  static getPlayerName(): string {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
  }

  static setPlayerName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
    this.registerPlayer(name.trim());
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
    const players = this.getUniquePlayers();
    if (!players.includes(playerName)) {
      players.push(playerName);
      localStorage.setItem('cmb_unique_players', JSON.stringify(players));
    }
  }

  static getUniquePlayers(): string[] {
    try {
      const raw = localStorage.getItem('cmb_unique_players');
      return raw ? JSON.parse(raw) : ['BananoMaster', 'BalloonSlayer', 'CrazyCannon', 'MonoPro', 'ReboteRey'];
    } catch {
      return ['BananoMaster', 'BalloonSlayer'];
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

  // Top 50 Leaderboard
  static getTop50(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOP_SCORES);
      let scores: ScoreEntry[] = raw ? JSON.parse(raw) : DEFAULT_TOP_SCORES;
      scores.sort((a, b) => b.score - a.score);
      return scores.slice(0, 50);
    } catch {
      return DEFAULT_TOP_SCORES;
    }
  }

  static saveScore(playerName: string, score: number, levelReached: number, balloonsPopped: number): ScoreEntry[] {
    const scores = this.getTop50();
    const newEntry: ScoreEntry = {
      id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      playerName: playerName || 'Jugador Anónimo',
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

    return top50;
  }

  // Match History
  static logMatch(match: Omit<MatchRecord, 'id' | 'date' | 'timestamp'>): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      const history: MatchRecord[] = raw ? JSON.parse(raw) : [];

      const record: MatchRecord = {
        ...match,
        id: 'match_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      };

      history.unshift(record); // newest first
      // Keep last 100 matches
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history.slice(0, 100)));

      // Update analytics
      this.updateAnalyticsOnMatch(record);
    } catch (e) {
      console.error('Failed to log match', e);
    }
  }

  static getMatchHistory(): MatchRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (!raw) return [];
      return JSON.parse(raw);
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
