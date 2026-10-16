// Servicio de almacenamiento local seguro e instantáneo para MetrikGym
// Cero dependencia de latencia de red durante el entrenamiento.
import type { SesionEntrenamiento } from '../types';

const STORAGE_ACTIVE_SESSION = 'metrikgym_active_session';
const STORAGE_OUTBOX_QUEUE = 'metrikgym_offline_outbox';
const STORAGE_HISTORY = 'metrikgym_history';
const STORAGE_USER_SESSION = 'metrikgym_auth_session';

export interface AuthSessionData {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  tiempoDescansoDefectoSegundos: number;
  loginTimestamp: number;
  isGuest?: boolean;
}

const SESSION_TTL_HOURS = 4;
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

export const storageService = {
  // ================= AUTH CON EXPIRACIÓN A 4 HORAS =================
  saveAuthSession(user: Omit<AuthSessionData, 'loginTimestamp'>) {
    const data: AuthSessionData = {
      ...user,
      loginTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_USER_SESSION, JSON.stringify(data));
    localStorage.setItem('metrikgym_token', 'local_token_' + user.id);
  },

  getAuthSession(): AuthSessionData | null {
    try {
      const raw = localStorage.getItem(STORAGE_USER_SESSION);
      if (!raw) return null;
      const parsed: AuthSessionData = JSON.parse(raw);
      const now = Date.now();
      // Si superó las 4 horas de inactividad, expira de inmediato
      if (now - parsed.loginTimestamp > SESSION_TTL_MS) {
        this.clearAuthSession();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  refreshSessionTimestamp() {
    const session = this.getAuthSession();
    if (session) {
      session.loginTimestamp = Date.now();
      localStorage.setItem(STORAGE_USER_SESSION, JSON.stringify(session));
    }
  },

  clearAuthSession() {
    localStorage.removeItem(STORAGE_USER_SESSION);
    localStorage.removeItem('metrikgym_token');
  },

  // ================= SESIÓN ACTIVA (EN CURSO) =================
  saveActiveSession(session: SesionEntrenamiento | null) {
    if (session) {
      localStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_SESSION);
    }
  },

  getActiveSession(): SesionEntrenamiento | null {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVE_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ================= OUTBOX JSON BUFFER (COLA PARA SUPABASE) =================
  getOutbox(): SesionEntrenamiento[] {
    try {
      const raw = localStorage.getItem(STORAGE_OUTBOX_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addToOutbox(session: SesionEntrenamiento) {
    const queue = this.getOutbox();
    queue.push(session);
    localStorage.setItem(STORAGE_OUTBOX_QUEUE, JSON.stringify(queue));
  },

  clearOutbox() {
    localStorage.removeItem(STORAGE_OUTBOX_QUEUE);
  },

  // Exportar outbox como archivo físico .json descargable en el celular
  downloadOutboxAsJsonFile() {
    const queue = this.getOutbox();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(queue, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `metrikgym_entrenamientos_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // ================= HISTORIAL =================
  getHistory(): SesionEntrenamiento[] {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveHistory(history: SesionEntrenamiento[]) {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
  },
};
