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
import { CATALOGO_EJERCICIOS, RUTINAS_MILO, RUTINA_DEMO_RECLUTADOR, HISTORIAL_DEMO_RECLUTADOR } from './data/seedData';
import { storageService } from './services/storageService';
import { supabaseDirectService } from './services/supabaseDirectService';
import { PulseLoader } from './components/common/PulseLoader';
import { WorkoutCelebrationModal } from './components/workout/WorkoutCelebrationModal';
import { FloatingRestTimer } from './components/workout/FloatingRestTimer';
import { convertWeight } from './utils/weightConverter';

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
  const [isFinishingWorkout, setIsFinishingWorkout] = useState(false);
  const [celebrationSession, setCelebrationSession] = useState<SesionEntrenamiento | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Floating Rest Timer State Global (persiste entre cambios de pestaña y recarga)
  const [restTimer, setRestTimer] = useState<{
    isActive: boolean;
    totalSeconds: number;
    endTime: number | null;
  }>(() => {
    try {
      const saved = localStorage.getItem('metrikgym_rest_timer');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.endTime && parsed.endTime > Date.now()) {
          return {
            isActive: true,
            totalSeconds: parsed.totalSeconds || 90,
            endTime: parsed.endTime,
          };
        }
      }
    } catch (e) {
      console.warn('Error reading rest timer', e);
    }
    return { isActive: false, totalSeconds: 90, endTime: null };
  });

  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(() => {
    if (restTimer.isActive && restTimer.endTime) {
      return Math.max(0, Math.ceil((restTimer.endTime - Date.now()) / 1000));
    }
    return 0;
  });
  
  // Preferencias de usuario
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('metrikgym_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  // State data con respaldo inmediato en localStorage e inicialización con 80 ejercicios oficiales
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>(() => {
    const saved = localStorage.getItem('metrikgym_ejercicios');
    return saved ? JSON.parse(saved) : CATALOGO_EJERCICIOS;
  });

  const [rutinas, setRutinas] = useState<Rutina[]>(() => {
    const auth = storageService.getAuthSession();
    return storageService.getRoutines(auth?.id);
  });

  const [historial, setHistorial] = useState<SesionEntrenamiento[]>(() => {
    const auth = storageService.getAuthSession();
    return storageService.getHistory(auth?.id);
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

  // Guardar historial en localStorage (solo para usuario real, particionado por ID)
  const handleSaveHistorial = (updated: SesionEntrenamiento[]) => {
    setHistorial(updated);
    const auth = storageService.getAuthSession();
    if (!auth?.isGuest) {
      storageService.saveHistory(updated, auth?.id);
    }
  };

  // Guardar rutinas en localStorage (particionado por ID)
  const handleSaveRutinas = (updated: Rutina[]) => {
    setRutinas(updated);
    const auth = storageService.getAuthSession();
    if (!auth?.isGuest) {
      storageService.saveRoutines(updated, auth?.id);
    }
  };

  // Guardar ultimos registros en localStorage (solo para usuario real)
  const handleSaveUltimosRegistros = (updated: UltimoRegistroEjercicio[]) => {
    setUltimosRegistros(updated);
    const auth = storageService.getAuthSession();
    if (!auth?.isGuest) {
      localStorage.setItem('metrikgym_ultimos_registros', JSON.stringify(updated));
    }
  };

  // Guardar sesion activa en localStorage para recuperar tras recargar o cerrar pestaña
  const handleUpdateActiveSession = (session: SesionEntrenamiento | null) => {
    setActiveSession(session);
    storageService.saveActiveSession(session);
  };

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rest Timer Interval & Visibility Listener
  useEffect(() => {
    if (!restTimer.isActive || !restTimer.endTime) {
      setRestSecondsLeft(0);
      localStorage.removeItem('metrikgym_rest_timer');
      return;
    }

    localStorage.setItem('metrikgym_rest_timer', JSON.stringify(restTimer));

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((restTimer.endTime! - Date.now()) / 1000));
      setRestSecondsLeft(remaining);
      if (remaining <= 0) {
        setRestTimer({ isActive: false, totalSeconds: restTimer.totalSeconds, endTime: null });
        localStorage.removeItem('metrikgym_rest_timer');
      }
    };

    tick();
    const interval = setInterval(tick, 250);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [restTimer]);

  // Verificar sesión con expiración de 4 horas y recuperar sesión activa
  useEffect(() => {
    const currentAuth = storageService.getAuthSession();
    if (!currentAuth) {
      setIsAuthModalOpen(true);
    } else {
      // Si es invitado / reclutador, aislar rutinas e historial demo
      if (currentAuth.isGuest) {
        setRutinas(RUTINA_DEMO_RECLUTADOR);
        setHistorial(HISTORIAL_DEMO_RECLUTADOR);
      } else {
        // Milo: asegurar rutinas e historial vinculados a su usuarioId
        const userRutinas = storageService.getRoutines(currentAuth.id);
        setRutinas(userRutinas.length > 0 ? userRutinas : RUTINAS_MILO);
        
        const localHistory = storageService.getHistory(currentAuth.id);
        setHistorial(localHistory);

        // Si está online, sincronizar en segundo plano con Supabase
        if (navigator.onLine) {
          supabaseDirectService.fetchUserHistoryFromSupabase(currentAuth.id)
            .then((remoteSessions) => {
              if (remoteSessions && remoteSessions.length > 0) {
                const existingIds = new Set(localHistory.map((s) => s.id));
                const newFromRemote = remoteSessions.filter((s) => !existingIds.has(s.id));
                if (newFromRemote.length > 0) {
                  const merged = [...localHistory, ...newFromRemote].sort(
                    (a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime()
                  );
                  setHistorial(merged);
                  storageService.saveHistory(merged, currentAuth.id);
                }
              }
            })
            .catch((err) => console.warn('Supabase background history fetch failed:', err));
        }
      }
    }

    // Recuperar sesión activa interrumpida del almacenamiento local
    const savedSession = storageService.getActiveSession();
    if (savedSession) {
      setActiveSession(savedSession);
      setCurrentTab('workout');
    }
  }, []);

  const handleTriggerRest = (descansoSegundos?: number | null) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 40, 30]);
    }
    const targetRest = descansoSegundos || preferences.descansoDefectoSegundos || 90;
    const targetEndTime = Date.now() + targetRest * 1000;
    setRestTimer({
      isActive: true,
      totalSeconds: targetRest,
      endTime: targetEndTime,
    });
    setRestSecondsLeft(targetRest);
  };

  const handleAddRestSeconds = (sec: number) => {
    setRestTimer((prev) => {
      const nextEnd = (prev.endTime ? prev.endTime : Date.now()) + sec * 1000;
      return {
        isActive: true,
        totalSeconds: Math.max(prev.totalSeconds, prev.totalSeconds + sec),
        endTime: nextEnd,
      };
    });
  };

  const handleSkipRest = () => {
    setRestTimer({ isActive: false, totalSeconds: preferences.descansoDefectoSegundos || 90, endTime: null });
    setRestSecondsLeft(0);
    localStorage.removeItem('metrikgym_rest_timer');
  };

  // Alternar unidad de peso (kg <-> lbs) y convertir en vivo los pesos de la sesión activa
  const handleToggleWeightUnit = () => {
    const nextUnit: 'kg' | 'lbs' = preferences.unidadPeso === 'kg' ? 'lbs' : 'kg';
    const updatedPrefs: UserPreferences = { ...preferences, unidadPeso: nextUnit };
    handleSavePreferences(updatedPrefs);

    if (activeSession && activeSession.series.length > 0) {
      const convertedSeries = activeSession.series.map((s) => ({
        ...s,
        pesoKg: convertWeight(s.pesoKg, preferences.unidadPeso, nextUnit),
        pesoKgIzq: s.pesoKgIzq !== undefined && s.pesoKgIzq !== null
          ? convertWeight(s.pesoKgIzq, preferences.unidadPeso, nextUnit)
          : s.pesoKgIzq,
      }));
      handleUpdateActiveSession({
        ...activeSession,
        series: convertedSeries,
      });
    }
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

    if (userData.isGuest) {
      setRutinas(RUTINA_DEMO_RECLUTADOR);
      setHistorial(HISTORIAL_DEMO_RECLUTADOR);
    } else {
      const userRutinas = storageService.getRoutines(userData.id);
      setRutinas(userRutinas.length > 0 ? userRutinas : RUTINAS_MILO);
      
      const localHistory = storageService.getHistory(userData.id);
      setHistorial(localHistory);

      if (navigator.onLine) {
        supabaseDirectService.fetchUserHistoryFromSupabase(userData.id)
          .then((remoteSessions) => {
            if (remoteSessions && remoteSessions.length > 0) {
              const existingIds = new Set(localHistory.map((s) => s.id));
              const newFromRemote = remoteSessions.filter((s) => !existingIds.has(s.id));
              if (newFromRemote.length > 0) {
                const merged = [...localHistory, ...newFromRemote].sort(
                  (a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime()
                );
                setHistorial(merged);
                storageService.saveHistory(merged, userData.id);
              }
            }
          })
          .catch((err) => console.warn('Supabase fetch failed on login:', err));
      }
    }
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
      usuarioId: 2,
      rutinaId: rutina.id,
      rutinaNombre: rutina.nombre,
      fechaHoraInicio: new Date().toISOString(),
      series: seriesIniciadas,
    };

    handleUpdateActiveSession(nuevaSesion);
    setCurrentTab('workout');
  };


  // Sincronizar cola de entrenamientos pendientes guardados offline
  const handleStartEmptyWorkout = () => {
    const primerEj = ejercicios[0] || CATALOGO_EJERCICIOS[0];
    const ultimo = primerEj ? ultimosRegistros.find((u) => u.ejercicioId === primerEj.id) : null;

    const nuevaSesion: SesionEntrenamiento = {
      id: Date.now(),
      usuarioId: 2,
      rutinaId: 0,
      rutinaNombre: 'Entrenamiento Libre',
      fechaHoraInicio: new Date().toISOString(),
      series: [
        {
          id: Date.now(),
          sesionId: 0,
          ejercicioId: primerEj?.id || 82,
          ejercicioNombre: primerEj?.nombre || 'Press plano con barra',
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
  };


  const handleFinishWorkout = (notas?: string) => {
    if (!activeSession) return;

    // Mostrar loader de guardado por 1.5 segundos
    setIsFinishingWorkout(true);

    const finalizada: SesionEntrenamiento = {
      ...activeSession,
      fechaHoraFin: new Date().toISOString(),
      notas,
    };

    const completedSets = finalizada.series.filter((s) => s.completada);

    // 1. Guardar de inmediato en el historial de la app
    const nuevoHistorial = [finalizada, ...historial];
    handleSaveHistorial(nuevoHistorial);

    // 2. Apendar a la cola outbox (solo usuario real para sincronizar a Supabase)
    const currentAuth = storageService.getAuthSession();
    if (!currentAuth?.isGuest) {
      storageService.addToOutbox(finalizada);
    }

    // 3. Actualizar caché de últimos registros para progressive overload
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

    // 4. Limpiar sesión activa
    handleUpdateActiveSession(null);

    // 5. Tras 1.5s de spinner, abrir modal de trofeo y lanzar confeti
    setTimeout(() => {
      setIsFinishingWorkout(false);
      setCelebrationSession(finalizada);
      setIsCelebrationOpen(true);
    }, 1500);
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
      storageService.saveActiveSession(updatedSession);
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

  const handleCreateRoutine = (data: { nombre: string; diaSugerido?: string; ejercicios: any[] }) => {
    const nueva: Rutina = {
      id: Date.now(),
      usuarioId: 2,
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
    const updated = [...rutinas, nueva];
    handleSaveRutinas(updated);
  };

  const handleUpdateRoutine = (id: number, data: { nombre: string; diaSugerido?: string; activa: boolean; ejercicios: any[] }) => {
    const updated = rutinas.map((r) => {
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
    });
    handleSaveRutinas(updated);
  };

  const handleDeleteRoutine = (rutinaId: number) => {
    const updated = rutinas.filter((r) => r.id !== rutinaId);
    handleSaveRutinas(updated);
  };

  const handleCreateEjercicio = (data: { nombre: string; grupoMuscular: string; esUnilateral: boolean; crearComoGlobal?: boolean }) => {
    const nuevo: Ejercicio = {
      id: Date.now(),
      nombre: data.nombre,
      grupoMuscular: data.grupoMuscular,
      esUnilateral: data.esUnilateral,
      esPersonalizado: !data.crearComoGlobal,
      usuarioId: data.crearComoGlobal ? null : 2,
    };
    const updated = [nuevo, ...ejercicios];
    setEjercicios(updated);
    localStorage.setItem('metrikgym_ejercicios', JSON.stringify(updated));
  };

  const handleUpdateEjercicio = (id: number, data: { nombre: string; grupoMuscular: string; esUnilateral: boolean }) => {
    const updated = ejercicios.map((e) => (e.id === id ? { ...e, ...data } : e));
    setEjercicios(updated);
    localStorage.setItem('metrikgym_ejercicios', JSON.stringify(updated));
  };

  const handleDeleteEjercicio = (id: number) => {
    const updated = ejercicios.filter((e) => e.id !== id);
    setEjercicios(updated);
    localStorage.setItem('metrikgym_ejercicios', JSON.stringify(updated));
  };

  const handlePromoteEjercicio = (id: number) => {
    const updated = ejercicios.map((e) => (e.id === id ? { ...e, esPersonalizado: false, usuarioId: null } : e));
    setEjercicios(updated);
    localStorage.setItem('metrikgym_ejercicios', JSON.stringify(updated));
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
          {storageService.getAuthSession()?.isGuest && (
            <div className="mb-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-cyan-200 font-medium">
                  Modo Portafolio / Reclutador Activo • Explora métricas, temporizador y calculadora de discos libremente.
                </span>
              </div>
              <button
                onClick={() => {
                  storageService.clearAuthSession();
                  setIsAuthModalOpen(true);
                }}
                className="text-[11px] font-bold text-cyan-400 hover:text-white underline cursor-pointer shrink-0"
              >
                Cambiar Perfil
              </button>
            </div>
          )}

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
                onCancelWorkout={() => {
                  handleUpdateActiveSession(null);
                  handleSkipRest();
                }}
                onAddSerieToExercise={handleAddSerieToExercise}
                onDeleteSerie={handleDeleteSerie}
                onUpdateSerieField={handleUpdateSerieField}
                onUpdateSerieFields={handleUpdateSerieFields}
                onAddExerciseToWorkout={handleAddExerciseToWorkout}
                onSwapExercise={handleSwapExercise}
                unidadPeso={preferences.unidadPeso}
                onTriggerRest={handleTriggerRest}
                onToggleWeightUnit={handleToggleWeightUnit}
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
                storageService.clearAuthSession();
                handleSkipRest();
                handleUpdateActiveSession(null);
                setHistorial([]);
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

      {/* Overlay de Carga: Guardando Sesión con PulseLoader (1.5s) */}
      {isFinishingWorkout && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <PulseLoader
            color="emerald"
            label="Guardando entrenamiento & calculando sobrecarga progresiva..."
          />
        </div>
      )}

      {/* Modal de Celebración con Trofeo SVG y Confeti */}
      <WorkoutCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => {
          setIsCelebrationOpen(false);
          setCelebrationSession(null);
          setCurrentTab('history');
        }}
        sesion={celebrationSession}
        userName={preferences.nombre}
        unidadPeso={preferences.unidadPeso}
      />

      {/* Floating Rest Timer Global (Persistente entre pestañas) */}
      <FloatingRestTimer
        secondsLeft={restSecondsLeft}
        totalSeconds={restTimer.totalSeconds}
        isActive={restTimer.isActive}
        tonoAlerta={preferences.tonoAlerta}
        sonidoHabilitado={preferences.sonidoHabilitado}
        onAddSeconds={handleAddRestSeconds}
        onSkip={handleSkipRest}
        onComplete={() => {
          setRestTimer({ isActive: false, totalSeconds: restTimer.totalSeconds, endTime: null });
          localStorage.removeItem('metrikgym_rest_timer');
        }}
        onNavigateToWorkout={() => setCurrentTab('workout')}
      />

    </div>
  );
}
export default App;
