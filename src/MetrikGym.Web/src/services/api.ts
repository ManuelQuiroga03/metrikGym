import type { Ejercicio, Rutina, SesionEntrenamiento, UltimoRegistroEjercicio, UserProfile } from '../types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('metrikgym_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('metrikgym_token', token);
    } else {
      localStorage.removeItem('metrikgym_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error en la petición: ${response.statusText}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API Fallback] Petición a ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; nombre: string; email: string; rol: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(data.token);
    return data;
  }

  async register(nombre: string, email: string, password: string) {
    const data = await this.request<{ token: string; nombre: string; email: string; rol: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ nombre, email, password }),
      }
    );
    this.setToken(data.token);
    return data;
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  // Ejercicios
  async getEjercicios(grupoMuscular?: string, search?: string): Promise<Ejercicio[]> {
    const params = new URLSearchParams();
    if (grupoMuscular) params.append('grupoMuscular', grupoMuscular);
    if (search) params.append('search', search);
    return this.request<Ejercicio[]>(`/ejercicios?${params.toString()}`);
  }

  async createEjercicio(data: { nombre: string; grupoMuscular: string; esUnilateral: boolean; crearComoGlobal?: boolean }): Promise<Ejercicio> {
    return this.request<Ejercicio>('/ejercicios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEjercicio(id: number, data: { nombre: string; grupoMuscular: string; esUnilateral: boolean }): Promise<Ejercicio> {
    return this.request<Ejercicio>(`/ejercicios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEjercicio(id: number): Promise<void> {
    return this.request<void>(`/ejercicios/${id}`, {
      method: 'DELETE',
    });
  }

  async promoverEjercicioAGlobal(id: number): Promise<Ejercicio> {
    return this.request<Ejercicio>(`/ejercicios/${id}/promover-global`, {
      method: 'POST',
    });
  }

  // Rutinas
  async getRutinas(): Promise<Rutina[]> {
    return this.request<Rutina[]>('/rutinas');
  }

  async getRutinaById(id: number): Promise<Rutina> {
    return this.request<Rutina>(`/rutinas/${id}`);
  }

  async createRutina(data: { nombre: string; diaSugerido?: string; ejercicios: { ejercicioId: number; orden: number; seriesObjetivo: number; descansoSegundos?: number | null }[] }): Promise<Rutina> {
    return this.request<Rutina>('/rutinas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRutina(id: number, data: { nombre: string; diaSugerido?: string; activa: boolean; ejercicios: { ejercicioId: number; orden: number; seriesObjetivo: number; descansoSegundos?: number | null }[] }): Promise<Rutina> {
    return this.request<Rutina>(`/rutinas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRutina(id: number): Promise<void> {
    return this.request<void>(`/rutinas/${id}`, {
      method: 'DELETE',
    });
  }

  // Sesiones
  async iniciarSesion(rutinaId: number, notas?: string): Promise<SesionEntrenamiento> {
    return this.request<SesionEntrenamiento>('/sesiones/iniciar', {
      method: 'POST',
      body: JSON.stringify({ rutinaId, notas }),
    });
  }

  async getSesionActiva(): Promise<SesionEntrenamiento | null> {
    try {
      const res = await this.request<SesionEntrenamiento>('/sesiones/activa');
      return res && res.id ? res : null;
    } catch {
      return null;
    }
  }

  async registrarSerie(sesionId: number, data: {
    ejercicioId: number;
    numeroSerie: number;
    pesoKg: number;
    repeticiones: number;
    lado?: 'D' | 'I' | null;
    rpe?: number | null;
  }) {
    return this.request(`/sesiones/${sesionId}/series`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finalizarSesion(sesionId: number, notas?: string): Promise<SesionEntrenamiento> {
    return this.request<SesionEntrenamiento>(`/sesiones/${sesionId}/finalizar`, {
      method: 'POST',
      body: JSON.stringify({ notas }),
    });
  }

  async getUltimosRegistros(ejerciciosIds: number[]): Promise<UltimoRegistroEjercicio[]> {
    return this.request<UltimoRegistroEjercicio[]>('/sesiones/ultimos-registros', {
      method: 'POST',
      body: JSON.stringify({ ejerciciosIds }),
    });
  }

  async getHistorial(page = 1, pageSize = 20): Promise<SesionEntrenamiento[]> {
    return this.request<SesionEntrenamiento[]>(`/sesiones/historial?page=${page}&pageSize=${pageSize}`);
  }

  async syncSesion(data: {
    rutinaId?: number | null;
    rutinaNombre?: string | null;
    fechaHoraInicio: string;
    fechaHoraFin?: string | null;
    notas?: string | null;
    series: {
      ejercicioId: number;
      numeroSerie: number;
      pesoKg: number;
      repeticiones: number;
      lado?: 'D' | 'I' | null;
      rpe?: number | null;
    }[];
  }): Promise<SesionEntrenamiento> {
    return this.request<SesionEntrenamiento>('/sesiones/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
