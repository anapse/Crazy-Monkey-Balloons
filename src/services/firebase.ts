import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  increment,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ScoreEntry } from '../types/game';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with robust connection settings (auto-detect long polling for sandbox/iframe resilience)
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  // If already initialized, retrieve instance
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreInstance;

export class FirebaseService {
  /**
   * Save a score to the global Firestore 'scores' collection
   */
  static async saveScore(entry: {
    playerName: string;
    score: number;
    level: number;
    balloonsPopped: number;
  }): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, 'scores'), {
        playerName: entry.playerName || 'Jugador Anónimo',
        score: entry.score,
        level: entry.level,
        balloonsPopped: entry.balloonsPopped,
        timestamp: Date.now(),
      });
      return docRef.id;
    } catch (e) {
      console.warn('Could not save score to Firestore, local storage will persist:', e);
      return null;
    }
  }

  /**
   * Fetch the top 50 scores from Firestore
   */
  static async getTopScores(max: number = 50): Promise<ScoreEntry[]> {
    try {
      const mockNames = new Set([
        'BananoMaster',
        'BalloonSlayer',
        'CrazyCannon',
        'MonoPro',
        'ReboteRey',
        'Chimpazoom',
        'GigaBalloons',
      ]);
      const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(max * 2));
      const querySnapshot = await getDocs(q);
      const scores: ScoreEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const pName = (data.playerName || '').trim();
        if (pName && !mockNames.has(pName)) {
          scores.push({
            id: docSnap.id,
            playerName: pName,
            score: Number(data.score) || 0,
            levelReached: Number(data.level) || 1,
            balloonsPopped: Number(data.balloonsPopped) || 0,
            date: new Date(data.timestamp || Date.now()).toISOString().split('T')[0],
            timestamp: data.timestamp || Date.now(),
          });
        }
      });
      return scores.slice(0, max);
    } catch (e) {
      console.warn('Could not fetch scores from Firestore, falling back to local:', e);
      return [];
    }
  }

  /**
   * Send a contact message to Firestore 'messages'
   */
  static async sendContactMessage(name: string, email: string, message: string): Promise<boolean> {
    try {
      await addDoc(collection(db, 'messages'), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: Date.now(),
      });
      return true;
    } catch (e) {
      console.error('Error saving contact message to Firestore:', e);
      return false;
    }
  }

  /**
   * Fetch contact messages for Admin
   */
  static async getContactMessages(): Promise<Array<{ id: string; name: string; email: string; message: string; timestamp: number }>> {
    try {
      const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name || '',
        email: d.data().email || '',
        message: d.data().message || '',
        timestamp: d.data().timestamp || 0,
      }));
    } catch (e) {
      console.warn('Could not fetch messages from Firestore:', e);
      return [];
    }
  }

  /**
   * Track visit in Firestore
   */
  static async trackVisit(): Promise<void> {
    try {
      const statsRef = doc(db, 'analytics', 'global');
      await setDoc(
        statsRef,
        {
          visits: increment(1),
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not record visit to Firestore:', e);
    }
  }

  /**
   * Track game completion / match in Firestore
   */
  static async trackGameMatch(match: { score: number; balloonsDestroyed: number; result: string }): Promise<void> {
    try {
      const statsRef = doc(db, 'analytics', 'global');
      await setDoc(
        statsRef,
        {
          totalPlays: increment(1),
          totalBalloonsPopped: increment(match.balloonsDestroyed),
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not update game stats in Firestore:', e);
    }
  }

  /**
   * Get analytics from Firestore
   */
  static async getGlobalStats(): Promise<{ visits: number; totalPlays: number; totalBalloonsPopped: number } | null> {
    try {
      const snap = await getDoc(doc(db, 'analytics', 'global'));
      if (snap.exists()) {
        const d = snap.data();
        return {
          visits: d.visits || 0,
          totalPlays: d.totalPlays || 0,
          totalBalloonsPopped: d.totalBalloonsPopped || 0,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
