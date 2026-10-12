import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { LiveWorkoutTracker } from './components/workout/LiveWorkoutTracker';
import { RoutinesManager } from './components/routines/RoutinesManager';
import { ExercisesManager } from './components/exercises/ExercisesManager';
import { WorkoutHistory } from './components/history/WorkoutHistory';
import { ProfileSettings, type UserPreferences } from './components/profile/ProfileSettings';
import { AuthModal } from './components/auth/AuthModal';
import type { Ejercicio, Rutina, SesionEntrenamiento, UltimoRegistroEjercicio, SerieRegistro } from './types';
import { api } from './services/api';

const DEFAULT_PREFERENCES: UserPreferences = {
  avatarId: 'power-beast',
  nombre: 'Quiro Admin',
  email: 'quiro@metrikgym.local',
  rol: 'Admin',
  tonoAlerta: 'beep',
  sonidoHabilitado: true,
  vibracionHabilitada: true,
  descansoDefectoSegundos: 90,
  descansoCompuestosSegundos: 180,
  descansoAislamientoSegundos: 60,
  unidadPeso: 'kg',
  pesoBarraDefectoKg: 20,
};

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeSession, setActiveSession] = useState<SesionEntrenamiento | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Preferencias de usuario
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('metrikgym_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  // State data con respaldo inmediato en localStorage
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [historial, setHistorial] = useState<SesionEntrenamiento[]>(() => {
    const saved = localStorage.getItem('metrikgym_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [ultimosRegistros, setUltimosRegistros] = useState<UltimoRegistroEjercicio[]>(() => {
    const saved = localStorage.getItem('metrikgym_ultimos_registros');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar preferencias en localStorage
  const handleSavePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    localStorage.setItem('metrikgym_preferences', JSON.stringify(updated));
  };

  // Guardar historial en localStorage
  const handleSaveHistorial = (updated: SesionEntrenamiento[]) => {
    setHistorial(updated);
    localStorage.setItem('metrikgym_history', JSON.stringify(updated));
  };

  // Guardar ultimos registros en localStorage
  const handleSaveUltimosRegistros = (updated: UltimoRegistroEjercicio[]) => {
    setUltimosRegistros(updated);
    localStorage.setItem('metrikgym_ultimos_registros', JSON.stringify(updated));
  };

  // Guardar sesion activa en localStorage para recuperar tras recargar o cerrar pestaña
  const handleUpdateActiveSession = (session: SesionEntrenamiento | null) => {
    setActiveSession(session);
    if (session) {
      localStorage.setItem('metrikgym_active_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('metrikgym_active_session');
    }
  };

  // Network listener & auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOfflineSessions();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check token and recover active session on initial load
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setIsAuthModalOpen(true);
    }

    // Recuperar sesión activa interrumpida del almacenamiento local
    const savedSession = localStorage.getItem('metrikgym_active_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setActiveSession(parsed);
        setCurrentTab('workout');
      } catch (err) {
        console.warn('Error recovering active session from localStorage:', err);
      }
    }
  }, []);

  // Initial Data Fetch from API + Offline queue check
  useEffect(() => {
    async function loadData() {
      try {
        const ej = await api.getEjercicios();
        if (ej && ej.length > 0) setEjercicios(ej);

        const r = await api.getRutinas();
        if (r && r.length > 0) setRutinas(r);

        const h = await api.getHistorial();
        if (h && h.length > 0) handleSaveHistorial(h);

        const activa = await api.getSesionActiva();
        if (activa) {
          handleUpdateActiveSession(activa);
          setCurrentTab('workout');
        }

        // Si hay sesiones pendientes creadas offline, sincronizarlas
        await syncPendingOfflineSessions();
      } catch {
        console.log('Cargando datos demostrativos para previsualización inmediata...');
        setupMockData();
      }
    }
    loadData();
  }, []);

  const setupMockData = () => {
    const mockEjercicios: Ejercicio[] = [
      { id: 1, nombre: 'Press de Banca Plano con Barra', grupoMuscular: 'Pecho', esUnilateral: false, esPersonalizado: false },
      { id: 2, nombre: 'Press Inclinado con Mancuernas', grupoMuscular: 'Pecho', esUnilateral: false, esPersonalizado: false },
      { id: 3, nombre: 'Remo con Barra Pendlay', grupoMuscular: 'Espalda', esUnilateral: false, esPersonalizado: false },
      { id: 4, nombre: 'Press Militar de Pie con Barra', grupoMuscular: 'Hombro', esUnilateral: false, esPersonalizado: false },
      { id: 5, nombre: 'Elevaciones Laterales en Polea', grupoMuscular: 'Hombro', esUnilateral: true, esPersonalizado: false },
      { id: 6, nombre: 'Sentadilla Libre con Barra', grupoMuscular: 'Cuádriceps', esUnilateral: false, esPersonalizado: false },
      { id: 7, nombre: 'Hip Thrust con Barra', grupoMuscular: 'Glúteo', esUnilateral: false, esPersonalizado: false },
    ];
    setEjercicios(mockEjercicios);

    const mockRutinas: Rutina[] = [
      {
        id: 1,
        usuarioId: 1,
        nombre: 'Torso Pesado (Fuerza A)',
        diaSugerido: 'Lunes',
        activa: true,
        ejercicios: [
          { id: 101, ejercicioId: 1, ejercicioNombre: 'Press de Banca Plano con Barra', grupoMuscular: 'Pecho', esUnilateral: false, orden: 1, seriesObjetivo: 4, descansoSegundos: 120 },
          { id: 102, ejercicioId: 3, ejercicioNombre: 'Remo con Barra Pendlay', grupoMuscular: 'Espalda', esUnilateral: false, orden: 2, seriesObjetivo: 4, descansoSegundos: 120 },
          { id: 103, ejercicioId: 4, ejercicioNombre: 'Press Militar de Pie con Barra', grupoMuscular: 'Hombro', esUnilateral: false, orden: 3, seriesObjetivo: 3, descansoSegundos: 90 },
          { id: 104, ejercicioId: 5, ejercicioNombre: 'Elevaciones Laterales en Polea', grupoMuscular: 'Hombro', esUnilateral: true, orden: 4, seriesObjetivo: 3, descansoSegundos: 60 },
        ],
      },
    ];
    setRutinas(mockRutinas);

    handleSaveUltimosRegistros([
      { ejercicioId: 1, ejercicioNombre: 'Press de Banca Plano con Barra', fechaHora: new Date().toISOString(), pesoKg: 80, repeticiones: 8, rpe: 8.5 },
      { ejercicioId: 3, ejercicioNombre: 'Remo con Barra Pendlay', fechaHora: new Date().toISOString(), pesoKg: 75, repeticiones: 8, rpe: 8.0 },
    ]);
  };

  const getRutinaSugeridaHoy = (): Rutina | undefined => {
    if (rutinas.length === 0) return undefined;
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaHoy = dias[new Date().getDay()];
    const match = rutinas.find(
      (r) => r.diaSugerido?.trim().toLowerCase() === diaHoy.toLowerCase()
    );
    return match;
  };

  // Handlers
  const handleAuthSuccess = (userData: any) => {
    setIsAuthModalOpen(false);
    const updated: UserPreferences = {
      ...preferences,
      nombre: userData.nombre || preferences.nombre,
      email: userData.email || preferences.email,
      rol: userData.rol || 'Admin',
      descansoDefectoSegundos: userData.tiempoDescansoDefectoSegundos || preferences.descansoDefectoSegundos,
    };
    handleSavePreferences(updated);

    // Recargar datos desde la API
    api.getEjercicios().then((ej) => ej && ej.length > 0 && setEjercicios(ej));
    api.getRutinas().then((r) => r && r.length > 0 && setRutinas(r));
    api.getHistorial().then((h) => h && h.length > 0 && handleSaveHistorial(h));
  };

  const handleStartRoutine = async (rutinaId: number) => {
    const rutina = rutinas.find((r) => r.id === rutinaId);
    if (!rutina) return;

    const seriesIniciadas = rutina.ejercicios.flatMap((e) => {
      const ultimo = ultimosRegistros.find((u) => u.ejercicioId === e.ejercicioId);
      const baseWeight = ultimo?.pesoKg ?? (preferences.unidadPeso === 'kg' ? 60 : 135);
      const baseReps = ultimo?.repeticiones ?? 8;
      const sets = [];

      for (let i = 1; i <= e.seriesObjetivo; i++) {
        sets.push({
          id: Date.now() + Math.random(),
          sesionId: 0,
          ejercicioId: e.ejercicioId,
          ejercicioNombre: e.ejercicioNombre,
          grupoMuscular: e.grupoMuscular,
          numeroSerie: i,
          pesoKg: baseWeight,
          repeticiones: baseReps,
          pesoKgIzq: baseWeight,
          repsIzq: baseReps,
          lado: e.esUnilateral ? ('D' as const) : null,
          rpe: ultimo?.rpe ?? 8.0,
          completada: false,
          completadaDer: false,
          completadaIzq: false,
        });
      }
      return sets;
    });

    const nuevaSesion: SesionEntrenamiento = {
      id: Date.now(),
      usuarioId: 1,
      rutinaId: rutina.id,
      rutinaNombre: rutina.nombre,
      fechaHoraInicio: new Date().toISOString(),
      series: seriesIniciadas,
    };

    handleUpdateActiveSession(nuevaSesion);
    setCurrentTab('workout');

    // Intentar iniciar sesión real en PostgreSQL en Podman
    try {
      const dbSesion = await api.iniciarSesion(rutina.id);
      if (dbSesion && dbSesion.id) {
        handleUpdateActiveSession({
          ...nuevaSesion,
          id: dbSesion.id,
          series: nuevaSesion.series.map((s) => ({ ...s, sesionId: dbSesion.id })),
        });
      }
    } catch (err) {
      console.warn('Iniciando sesión en modo local / offline:', err);
    }
  };

  // Sincronizar cola de entrenamientos pendientes guardados offline
  const syncPendingOfflineSessions = async () => {
    try {
      const queueRaw = localStorage.getItem('metrikgym_offline_sync_queue');
      if (!queueRaw) return;
      const queue: SesionEntrenamiento[] = JSON.parse(queueRaw);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remaining: SesionEntrenamiento[] = [];
      for (const sesion of queue) {
        try {
          const completedSets = sesion.series.filter((s) => s.completada);
          const synced = await api.syncSesion({
            rutinaId: sesion.rutinaId && sesion.rutinaId > 0 ? sesion.rutinaId : null,
            rutinaNombre: sesion.rutinaNombre,
            fechaHoraInicio: sesion.fechaHoraInicio,
            fechaHoraFin: sesion.fechaHoraFin,
            notas: sesion.notas,
            series: completedSets.map((s) => ({
              ejercicioId: s.ejercicioId,
              numeroSerie: s.numeroSerie,
              pesoKg: Number(s.pesoKg || 0),
              repeticiones: Number(s.repeticiones || 0),
              lado: s.lado || null,
              rpe: s.rpe ? Number(s.rpe) : null,
            })),
          });

          // Reemplazar ID temporal con ID real en el historial local
          setHistorial((prev) => {
            const updated = prev.map((item) => (item.id === sesion.id ? synced : item));
            localStorage.setItem('metrikgym_history', JSON.stringify(updated));
            return updated;
          });
        } catch (syncErr) {
          console.warn('No se pudo sincronizar sesión offline en este momento:', syncErr);
          remaining.push(sesion);
        }
      }

      if (remaining.length > 0) {
        localStorage.setItem('metrikgym_offline_sync_queue', JSON.stringify(remaining));
      } else {
        localStorage.removeItem('metrikgym_offline_sync_queue');
      }
    } catch (err) {
      console.warn('Error en syncPendingOfflineSessions:', err);
    }
  };

  const handleStartEmptyWorkout = async () => {
    const primerEj = ejercicios[0];
    const ultimo = primerEj ? ultimosRegistros.find((u) => u.ejercicioId === primerEj.id) : null;

    const nuevaSesion: SesionEntrenamiento = {
      id: Date.now(),
      usuarioId: 1,
      rutinaId: 0,
      rutinaNombre: 'Entrenamiento Libre',
      fechaHoraInicio: new Date().toISOString(),
      series: [
        {
          id: Date.now(),
          sesionId: 0,
          ejercicioId: primerEj?.id || 1,
          ejercicioNombre: primerEj?.nombre || 'Press de Banca Plano con Barra',
          grupoMuscular: primerEj?.grupoMuscular || 'Pecho',
          numeroSerie: 1,
          pesoKg: ultimo?.pesoKg || 60,
          repeticiones: ultimo?.repeticiones || 10,
          completada: false,
        },
      ],
    };

    handleUpdateActiveSession(nuevaSesion);
    setCurrentTab('workout');

    // Intentar registrar la sesión abierta en PostgreSQL
    try {
      const dbSesion = await api.iniciarSesion(0);
      if (dbSesion && dbSesion.id) {
        handleUpdateActiveSession({
          ...nuevaSesion,
          id: dbSesion.id,
          series: nuevaSesion.series.map((s) => ({ ...s, sesionId: dbSesion.id })),
        });
      }
    } catch (err) {
      console.warn('Iniciando entrenamiento libre en modo offline/local:', err);
    }
  };

  const handleFinishWorkout = async (notas?: string) => {
    if (!activeSession) return;

    const finalizada: SesionEntrenamiento = {
      ...activeSession,
      fechaHoraFin: new Date().toISOString(),
      notas,
    };

    const nuevoHistorial = [finalizada, ...historial];
    handleSaveHistorial(nuevoHistorial);

    // Intentar guardar en base de datos PostgreSQL
    let syncExitosa = false;
    const completedSets = finalizada.series.filter((s) => s.completada);

    // Si tiene un ID real existente en base de datos
    if (activeSession.id && activeSession.id < 100000000) {
      try {
        await api.finalizarSesion(activeSession.id, notas);
        syncExitosa = true;
      } catch (err) {
        console.warn('Error al finalizar en backend, agregando a cola de sync:', err);
      }
    } else {
      // Si fue creada offline con ID timestamp temporal, sincronizar completa
      try {
        const synced = await api.syncSesion({
          rutinaId: finalizada.rutinaId && finalizada.rutinaId > 0 ? finalizada.rutinaId : null,
          rutinaNombre: finalizada.rutinaNombre,
          fechaHoraInicio: finalizada.fechaHoraInicio,
          fechaHoraFin: finalizada.fechaHoraFin,
          notas: finalizada.notas,
          series: completedSets.map((s) => ({
            ejercicioId: s.ejercicioId,
            numeroSerie: s.numeroSerie,
            pesoKg: Number(s.pesoKg || 0),
            repeticiones: Number(s.repeticiones || 0),
            lado: s.lado || null,
            rpe: s.rpe ? Number(s.rpe) : null,
          })),
        });
        if (synced && synced.id) {
          syncExitosa = true;
          // Actualizar historial local con el ID persistido real
          handleSaveHistorial([synced, ...historial]);
        }
      } catch (err) {
        console.warn('No hay conexión directa para sync inmediato, encolando offline:', err);
      }
    }

    // Si falló la conexión con el backend, encolar en cola offline para reintento automático
    if (!syncExitosa) {
      const queueRaw = localStorage.getItem('metrikgym_offline_sync_queue');
      const queue: SesionEntrenamiento[] = queueRaw ? JSON.parse(queueRaw) : [];
      queue.push(finalizada);
      localStorage.setItem('metrikgym_offline_sync_queue', JSON.stringify(queue));
    }

    // Actualizar cache de últimos registros
    const updatedUltimos: UltimoRegistroEjercicio[] = [...ultimosRegistros];
    completedSets.forEach((s) => {
      const existingIdx = updatedUltimos.findIndex((u) => u.ejercicioId === s.ejercicioId);
      const newEntry: UltimoRegistroEjercicio = {
        ejercicioId: s.ejercicioId,
        ejercicioNombre: s.ejercicioNombre,
        fechaHora: finalizada.fechaHoraFin || new Date().toISOString(),
        pesoKg: s.pesoKg,
        repeticiones: s.repeticiones,
        rpe: s.rpe,
        lado: s.lado,
      };
      if (existingIdx >= 0) {
        updatedUltimos[existingIdx] = newEntry;
      } else {
        updatedUltimos.push(newEntry);
      }
    });
    handleSaveUltimosRegistros(updatedUltimos);

    handleUpdateActiveSession(null);
    setCurrentTab('history');
  };

  const handleDeleteHistorySession = (sesionId: number) => {
    handleSaveHistorial(historial.filter((h) => h.id !== sesionId));
  };

  const handleAddSerieToExercise = (ejercicioId: number) => {
    if (!activeSession) return;

    const existingSets = activeSession.series.filter((s) => s.ejercicioId === ejercicioId);
    const lastSet = existingSets[existingSets.length - 1];
    const ej = ejercicios.find((e) => e.id === ejercicioId);

    const newSet = {
      id: Date.now() + Math.random(),
      sesionId: activeSession.id,
      ejercicioId,
      ejercicioNombre: lastSet?.ejercicioNombre || ej?.nombre || 'Ejercicio',
      grupoMuscular: lastSet?.grupoMuscular || ej?.grupoMuscular || 'General',
      numeroSerie: (existingSets.length || 0) + 1,
      pesoKg: lastSet?.pesoKg || 60,
      repeticiones: lastSet?.repeticiones || 8,
      pesoKgIzq: lastSet?.pesoKgIzq || lastSet?.pesoKg || 60,
      repsIzq: lastSet?.repsIzq || lastSet?.repeticiones || 8,
      lado: lastSet?.lado || null,
      rpe: lastSet?.rpe || 8.0,
      completada: false,
      completadaDer: false,
      completadaIzq: false,
    };

    handleUpdateActiveSession({
      ...activeSession,
      series: [...activeSession.series, newSet],
    });
  };

  const handleDeleteSerie = (serieId: number) => {
    if (!activeSession) return;
    handleUpdateActiveSession({
      ...activeSession,
      series: activeSession.series.filter((s) => s.id !== serieId),
    });
  };

  const handleUpdateSerieFields = (serieId: number, fields: Partial<SerieRegistro>) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedSeries = prev.series.map((s) =>
        s.id === serieId ? { ...s, ...fields } : s
      );
      const updatedSession = {
        ...prev,
        series: updatedSeries,
      };
      localStorage.setItem('metrikgym_active_session', JSON.stringify(updatedSession));

      // Si se marcó como completada y la sesión tiene ID de BD, sincronizar con backend
      if (fields.completada === true && updatedSession.id && updatedSession.id < 1000000000) {
        const target = updatedSeries.find((s) => s.id === serieId);
        if (target) {
          api.registrarSerie(updatedSession.id, {
            ejercicioId: target.ejercicioId,
            numeroSerie: target.numeroSerie,
            pesoKg: target.pesoKg,
            repeticiones: target.repeticiones,
            lado: target.lado,
            rpe: target.rpe,
          }).catch((err) => console.warn('Sync serie error:', err));
        }
      }

      return updatedSession;
    });
  };

  const handleUpdateSerieField = (serieId: number, field: any, value: any) => {
    handleUpdateSerieFields(serieId, { [field]: value });
  };

  const handleAddExerciseToWorkout = (ejercicioId: number) => {
    if (!activeSession) return;
    const ej = ejercicios.find((e) => e.id === ejercicioId);
    if (!ej) return;

    const newSet = {
      id: Date.now() + Math.random(),
      sesionId: activeSession.id,
      ejercicioId: ej.id,
      ejercicioNombre: ej.nombre,
      grupoMuscular: ej.grupoMuscular,
      numeroSerie: 1,
      pesoKg: 50,
      repeticiones: 10,
      pesoKgIzq: 50,
      repsIzq: 10,
      lado: ej.esUnilateral ? ('D' as const) : null,
      rpe: 8.0,
      completada: false,
      completadaDer: false,
      completadaIzq: false,
    };

    handleUpdateActiveSession({
      ...activeSession,
      series: [...activeSession.series, newSet],
    });
  };

  const handleSwapExercise = (oldEjercicioId: number, nuevoEjercicio: Ejercicio) => {
    if (!activeSession) return;
    const updatedSeries = activeSession.series.map((s) => {
      if (s.ejercicioId === oldEjercicioId) {
        return {
          ...s,
          ejercicioId: nuevoEjercicio.id,
          ejercicioNombre: nuevoEjercicio.nombre,
          grupoMuscular: nuevoEjercicio.grupoMuscular,
          lado: nuevoEjercicio.esUnilateral ? (s.lado || 'D') : null,
        };
      }
      return s;
    });
    handleUpdateActiveSession({
      ...activeSession,
      series: updatedSeries,
    });
  };

  const handleCreateRoutine = async (data: { nombre: string; diaSugerido?: string; ejercicios: any[] }) => {
    try {
      const created = await api.createRutina(data);
      setRutinas([...rutinas, created]);
    } catch {
      const nueva: Rutina = {
        id: Date.now(),
        usuarioId: 1,
        nombre: data.nombre,
        diaSugerido: data.diaSugerido,
        activa: true,
        ejercicios: data.ejercicios.map((e) => {
          const ref = ejercicios.find((ej) => ej.id === e.ejercicioId);
          return {
            id: Date.now() + Math.random(),
            ejercicioId: e.ejercicioId,
            ejercicioNombre: ref?.nombre || 'Ejercicio',
            grupoMuscular: ref?.grupoMuscular || 'Pecho',
            esUnilateral: ref?.esUnilateral || false,
            orden: e.orden,
            seriesObjetivo: e.seriesObjetivo,
            descansoSegundos: e.descansoSegundos,
          };
        }),
      };
      setRutinas([...rutinas, nueva]);
    }
  };

  const handleUpdateRoutine = async (id: number, data: { nombre: string; diaSugerido?: string; activa: boolean; ejercicios: any[] }) => {
    try {
      const updated = await api.updateRutina(id, data);
      setRutinas(rutinas.map((r) => (r.id === id ? updated : r)));
    } catch {
      setRutinas(
        rutinas.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            nombre: data.nombre,
            diaSugerido: data.diaSugerido,
            activa: data.activa,
            ejercicios: data.ejercicios.map((e) => {
              const ref = ejercicios.find((ej) => ej.id === e.ejercicioId);
              return {
                id: e.id || Date.now() + Math.random(),
                ejercicioId: e.ejercicioId,
                ejercicioNombre: ref?.nombre || 'Ejercicio',
                grupoMuscular: ref?.grupoMuscular || 'Pecho',
                esUnilateral: ref?.esUnilateral || false,
                orden: e.orden,
                seriesObjetivo: e.seriesObjetivo,
                descansoSegundos: e.descansoSegundos,
              };
            }),
          };
        })
      );
    }
  };

  const handleDeleteRoutine = async (rutinaId: number) => {
    setRutinas(rutinas.filter((r) => r.id !== rutinaId));
    try {
      await api.deleteRutina(rutinaId);
    } catch (err) {
      console.warn('Error deleting routine from backend:', err);
    }
  };

  const handleCreateEjercicio = async (data: { nombre: string; grupoMuscular: string; esUnilateral: boolean; crearComoGlobal?: boolean }) => {
    try {
      const created = await api.createEjercicio(data);
      setEjercicios([created, ...ejercicios]);
    } catch {
      const nuevo: Ejercicio = {
        id: Date.now(),
        nombre: data.nombre,
        grupoMuscular: data.grupoMuscular,
        esUnilateral: data.esUnilateral,
        esPersonalizado: !data.crearComoGlobal,
        usuarioId: data.crearComoGlobal ? null : 1,
      };
      setEjercicios([nuevo, ...ejercicios]);
    }
  };

  const handleUpdateEjercicio = async (id: number, data: { nombre: string; grupoMuscular: string; esUnilateral: boolean }) => {
    try {
      const updated = await api.updateEjercicio(id, data);
      setEjercicios(ejercicios.map((e) => (e.id === id ? updated : e)));
    } catch {
      setEjercicios(
        ejercicios.map((e) => (e.id === id ? { ...e, ...data } : e))
      );
    }
  };

  const handleDeleteEjercicio = async (id: number) => {
    setEjercicios(ejercicios.filter((e) => e.id !== id));
    try {
      await api.deleteEjercicio(id);
    } catch (err) {
      console.warn('Error deleting exercise from backend:', err);
    }
  };

  const handlePromoteEjercicio = async (id: number) => {
    try {
      const promoted = await api.promoverEjercicioAGlobal(id);
      setEjercicios(ejercicios.map((e) => (e.id === id ? promoted : e)));
    } catch (err) {
      console.warn('Error promoting exercise:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        isOnline={isOnline}
        hasActiveWorkout={activeSession !== null}
        onOpenActiveWorkout={() => setCurrentTab('workout')}
        onOpenProfile={() => setCurrentTab('profile')}
        userName={preferences.nombre}
        avatarId={preferences.avatarId}
      />

      {/* Main Container: Sidebar + Content Area */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        
        {/* Sidebar (Tablet & Desktop 32"+) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          hasActiveWorkout={activeSession !== null}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardHome
              userName={preferences.nombre}
              rutinaSugerida={getRutinaSugeridaHoy()}
              rutinas={rutinas}
              historial={historial}
              unidadPeso={preferences.unidadPeso}
              onStartRoutine={handleStartRoutine}
              onStartEmptyWorkout={handleStartEmptyWorkout}
              onViewRoutines={() => setCurrentTab('routines')}
              onViewHistory={() => setCurrentTab('history')}
            />
          )}

          {currentTab === 'workout' && (
            activeSession ? (
              <LiveWorkoutTracker
                sesion={activeSession}
                ejerciciosCatalogo={ejercicios}
                ultimosRegistros={ultimosRegistros}
                tonoAlerta={preferences.tonoAlerta}
                sonidoHabilitado={preferences.sonidoHabilitado}
                descansoDefectoSegundos={preferences.descansoDefectoSegundos}
                onFinishWorkout={handleFinishWorkout}
                onCancelWorkout={() => setActiveSession(null)}
                onAddSerieToExercise={handleAddSerieToExercise}
                onDeleteSerie={handleDeleteSerie}
                onUpdateSerieField={handleUpdateSerieField}
                onUpdateSerieFields={handleUpdateSerieFields}
                onAddExerciseToWorkout={handleAddExerciseToWorkout}
                onSwapExercise={handleSwapExercise}
                unidadPeso={preferences.unidadPeso}
              />
            ) : (
              <div className="p-8 rounded-2xl bg-[#131B26] border border-[#1F2C3F] text-center space-y-3">
                <p className="text-base font-bold text-white">No hay entrenamiento en curso</p>
                <p className="text-xs text-gray-400">Selecciona una de tus rutinas o inicia un entreno libre.</p>
                <button
                  onClick={handleStartEmptyWorkout}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                >
                  Iniciar Entrenamiento Libre
                </button>
              </div>
            )
          )}

          {currentTab === 'routines' && (
            <RoutinesManager
              rutinas={rutinas}
              ejerciciosCatalogo={ejercicios}
              onStartRoutine={handleStartRoutine}
              onCreateRoutine={handleCreateRoutine}
              onUpdateRoutine={handleUpdateRoutine}
              onDeleteRoutine={handleDeleteRoutine}
            />
          )}

          {currentTab === 'exercises' && (
            <ExercisesManager
              ejercicios={ejercicios}
              userRole={preferences.rol}
              currentUserId={1}
              onCreateEjercicio={handleCreateEjercicio}
              onUpdateEjercicio={handleUpdateEjercicio}
              onDeleteEjercicio={handleDeleteEjercicio}
              onPromoteEjercicio={handlePromoteEjercicio}
            />
          )}

          {currentTab === 'history' && (
            <WorkoutHistory
              historial={historial}
              onDeleteSession={handleDeleteHistorySession}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileSettings
              preferences={preferences}
              onSavePreferences={handleSavePreferences}
              onLogout={() => {
                api.setToken(null);
                setIsAuthModalOpen(true);
              }}
            />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        hasActiveWorkout={activeSession !== null}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}
export default App;
