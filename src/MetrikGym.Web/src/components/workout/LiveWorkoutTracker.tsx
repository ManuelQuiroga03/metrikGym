import React, { useState, useEffect } from 'react';
import { Timer, CheckSquare, Plus, Dumbbell, Trophy } from 'lucide-react';
import type { SesionEntrenamiento, SerieRegistro, UltimoRegistroEjercicio, Ejercicio } from '../../types';
import type { TonoAlerta } from '../../utils/audio';
import { ExerciseCard } from './ExerciseCard';
import { FloatingRestTimer } from './FloatingRestTimer';
import { scheduleRestNotification } from '../../utils/notifications';

interface LiveWorkoutTrackerProps {
  sesion: SesionEntrenamiento;
  ejerciciosCatalogo: Ejercicio[];
  ultimosRegistros: UltimoRegistroEjercicio[];
  tonoAlerta?: TonoAlerta;
  sonidoHabilitado?: boolean;
  descansoDefectoSegundos?: number;
  onFinishWorkout: (notas?: string, fechaFinIso?: string) => void;
  onCancelWorkout?: () => void;
  onAddSerieToExercise: (ejercicioId: number) => void;
  onDeleteSerie: (serieId: number) => void;
  onUpdateSerieField: (serieId: number, field: keyof SerieRegistro, value: any) => void;
  onUpdateSerieFields?: (serieId: number, fields: Partial<SerieRegistro>) => void;
  onAddExerciseToWorkout: (ejercicioId: number) => void;
  onSwapExercise?: (oldEjercicioId: number, newEjercicio: Ejercicio) => void;
  unidadPeso?: 'kg' | 'lbs';
  onTriggerRest?: (descansoSegundos?: number | null) => void;
  onToggleWeightUnit?: () => void;
}

export const LiveWorkoutTracker: React.FC<LiveWorkoutTrackerProps> = ({
  sesion,
  ejerciciosCatalogo,
  ultimosRegistros,
  tonoAlerta = 'beep',
  sonidoHabilitado = true,
  descansoDefectoSegundos = 90,
  unidadPeso = 'kg',
  onFinishWorkout,
  onAddSerieToExercise,
  onDeleteSerie,
  onUpdateSerieField,
  onUpdateSerieFields,
  onAddExerciseToWorkout,
  onSwapExercise,
  onTriggerRest,
  onToggleWeightUnit,
}) => {
  // Session Elapsed Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Floating Rest Timer State (basado en timestamp absoluto contra suspensión de pantalla)
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [restTotalSeconds, setRestTotalSeconds] = useState(descansoDefectoSegundos);
  const [isRestActive, setIsRestActive] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);

  // Modal selector for adding extra exercises
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [frozenEndTime, setFrozenEndTime] = useState<string | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Clock tick (Sesión total) - se congela cuando se abre el modal de finalización
  useEffect(() => {
    if (finishModalOpen) return;

    const updateElapsed = () => {
      const startTime = new Date(sesion.fechaHoraInicio).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [sesion.fechaHoraInicio, finishModalOpen]);

  // Al abrir el modal de finalización, congelar marca temporal de cierre
  const handleOpenFinishModal = () => {
    setFrozenEndTime(new Date().toISOString());
    setFinishModalOpen(true);
  };

  const handleResumeWorkout = () => {
    setFrozenEndTime(null);
    setFinishModalOpen(false);
  };

  // Rest timer tick basado en timestamp absoluto (resiste suspensión de pantalla en móvil)
  useEffect(() => {
    if (!isRestActive || !restEndTime) return;

    const syncRestTime = () => {
      const now = Date.now();
      const diffSecs = Math.ceil((restEndTime - now) / 1000);
      if (diffSecs <= 0) {
        setRestSecondsLeft(0);
      } else {
        setRestSecondsLeft(diffSecs);
      }
    };

    syncRestTime();
    const interval = setInterval(syncRestTime, 250);

    // Al desbloquear o encender la pantalla del teléfono, recalcular inmediatamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncRestTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncRestTime);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncRestTime);
    };
  }, [isRestActive, restEndTime]);

  const formatElapsed = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Group series by exerciseId
  const exerciseGroups = React.useMemo(() => {
    const groups: {
      [key: number]: {
        ejercicioId: number;
        nombre: string;
        grupoMuscular: string;
        esUnilateral: boolean;
        series: SerieRegistro[];
      };
    } = {};

    sesion.series.forEach((serie) => {
      if (!groups[serie.ejercicioId]) {
        groups[serie.ejercicioId] = {
          ejercicioId: serie.ejercicioId,
          nombre: serie.ejercicioNombre || 'Ejercicio',
          grupoMuscular: serie.grupoMuscular || 'General',
          esUnilateral: serie.lado !== null && serie.lado !== undefined,
          series: [],
        };
      }
      groups[serie.ejercicioId].series.push(serie);
    });

    return Object.values(groups);
  }, [sesion.series]);

  // Metrics calculation
  const totalVolumeKg = sesion.series
    .filter((s) => s.completada)
    .reduce((acc, s) => acc + Number(s.pesoKg || 0) * Number(s.repeticiones || 0), 0);

  const completedSetsCount = sesion.series.filter((s) => s.completada).length;
  const totalSetsCount = sesion.series.length;

  // Toggle complete and auto-trigger rest timer (con detección inteligente de última serie)
  const handleToggleComplete = (serieId: number, descansoSegundos?: number | null) => {
    const serie = sesion.series.find((s) => s.id === serieId);
    if (!serie) return;

    const nextState = !serie.completada;
    onUpdateSerieField(serieId, 'completada', nextState);

    if (nextState) {
      // Verificar si quedan otras series pendientes en la sesión completa
      const pendingSets = sesion.series.filter((s) => s.id !== serieId && !s.completada);
      if (pendingSets.length === 0) {
        // ¡Última serie de todo el entreno completada! No tiene sentido descansar; congelar tiempo y abrir modal.
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        handleOpenFinishModal();
        return;
      }

      handleTriggerRest(descansoSegundos);
    }
  };

  const handleTriggerRest = (descansoSegundos?: number | null) => {
    // Si App.tsx maneja el temporizador de forma global (para resistir cambios de pestaña)
    if (onTriggerRest) {
      onTriggerRest(descansoSegundos);
      return;
    }

    // Fallback local
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 40, 30]);
    }

    const targetRest = descansoSegundos || descansoDefectoSegundos;
    const targetEndTime = Date.now() + targetRest * 1000;

    setRestTotalSeconds(targetRest);
    setRestSecondsLeft(targetRest);
    setRestEndTime(targetEndTime);
    setIsRestActive(true);

    scheduleRestNotification({
      delaySeconds: targetRest,
    });
  };

  const handleAddSeconds = (sec: number) => {
    setRestSecondsLeft((prev) => Math.max(0, prev + sec));
    setRestTotalSeconds((prev) => Math.max(prev, prev + sec));
    setRestEndTime((prev) => {
      const nextEnd = prev ? prev + sec * 1000 : Date.now() + sec * 1000;
      scheduleRestNotification({
        delaySeconds: Math.ceil((nextEnd - Date.now()) / 1000),
      });
      return nextEnd;
    });
  };

  const handleSkipRest = () => {
    setIsRestActive(false);
    setRestSecondsLeft(0);
    setRestEndTime(null);
  };

  // Smooth auto-scroll to next exercise when current exercise is finished
  const handleExerciseCompleted = (completedId: number) => {
    const currentIdx = exerciseGroups.findIndex((g) => g.ejercicioId === completedId);
    if (currentIdx >= 0 && currentIdx < exerciseGroups.length - 1) {
      const nextGroup = exerciseGroups[currentIdx + 1];
      setTimeout(() => {
        const nextCard = document.getElementById(`exercise-card-${nextGroup.ejercicioId}`);
        if (nextCard) {
          nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  };

  const filteredExercises = ejerciciosCatalogo.filter(
    (e) =>
      e.nombre.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
      e.grupoMuscular.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-28">
      {/* Sticky HUD Session Bar */}
      <div className="sticky top-[53px] z-30 bg-[#0E141F]/95 backdrop-blur-md border-b border-[#1F2C3F] p-3.5 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          {/* Routine & Timer */}
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {sesion.rutinaNombre}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1.5 font-bold font-tabular text-lg text-white">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Real-time stats */}
          <div className="flex items-center gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Volumen</p>
              <p className="text-sm font-black font-tabular text-emerald-300">
                {totalVolumeKg.toLocaleString()} <span className="text-[10px] font-normal">{unidadPeso}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Sets</p>
              <p className="text-sm font-black font-tabular text-cyan-300">
                {completedSetsCount}/{totalSetsCount}
              </p>
            </div>

            {/* Alternador de Unidad con Conversión Automática (KG <-> LBS) */}
            {onToggleWeightUnit && (
              <button
                type="button"
                onClick={onToggleWeightUnit}
                className="flex items-center p-0.5 rounded-lg bg-[#141D2B] border border-[#25364D] text-[10px] font-black tracking-wider transition-all cursor-pointer shadow-inner active:scale-95 ml-1"
                title="Toca para alternar y convertir automáticamente todos los pesos entre Kilogramos (kg) y Libras (lbs)"
              >
                <span
                  className={`px-1.5 py-0.5 rounded-md transition-all ${
                    unidadPeso === 'kg'
                      ? 'bg-emerald-500 text-black shadow-sm font-black'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  KG
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md transition-all ${
                    unidadPeso === 'lbs'
                      ? 'bg-cyan-400 text-black shadow-sm font-black'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  LB
                </span>
              </button>
            )}
          </div>

          {/* Finish Button */}
          <button
            onClick={handleOpenFinishModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs shadow-lg shadow-emerald-950/60 active:scale-95 transition-all cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 stroke-[2.5px]" />
            <span className="hidden sm:inline">Finalizar</span>
          </button>
        </div>
      </div>

      {/* Exercises Cards List */}
      <div className="space-y-4">
        {exerciseGroups.map((group, idx) => {
          const ultimo = ultimosRegistros.find((u) => u.ejercicioId === group.ejercicioId);
          return (
            <div key={group.ejercicioId} id={`exercise-card-${group.ejercicioId}`}>
              <ExerciseCard
                exerciseIndex={idx}
                totalExercises={exerciseGroups.length}
                ejercicioId={group.ejercicioId}
                nombre={group.nombre}
                grupoMuscular={group.grupoMuscular}
                esUnilateralDefecto={group.esUnilateral}
                series={group.series}
                ultimoRegistro={ultimo}
                descansoEjercicioSegundos={descansoDefectoSegundos}
                ejerciciosCatalogo={ejerciciosCatalogo}
                unidadPeso={unidadPeso}
                onUpdateSerie={onUpdateSerieField}
                onUpdateSerieFields={onUpdateSerieFields}
                onToggleCompleteSerie={handleToggleComplete}
                onTriggerRest={handleTriggerRest}
                onAddSerie={onAddSerieToExercise}
                onDeleteSerie={onDeleteSerie}
                onExerciseCompleted={handleExerciseCompleted}
                onSwapExercise={onSwapExercise}
              />
            </div>
          );
        })}
      </div>

      {/* Button to add extra exercise */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#131B26] hover:bg-[#1A2535] border border-dashed border-[#25364D] hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Otro Ejercicio al Entrenamiento</span>
        </button>
      </div>

      {/* Floating Rest Timer (solo si no es provisto globalmente por App.tsx) */}
      {!onTriggerRest && (
        <FloatingRestTimer
          secondsLeft={restSecondsLeft}
          totalSeconds={restTotalSeconds}
          isActive={isRestActive}
          tonoAlerta={tonoAlerta}
          sonidoHabilitado={sonidoHabilitado}
          onAddSeconds={handleAddSeconds}
          onSkip={handleSkipRest}
          onComplete={() => {
            setIsRestActive(false);
            setRestEndTime(null);
          }}
        />
      )}

      {/* Modal: Agregar Ejercicio */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101724] border border-[#1F2C3F] rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              <span>Seleccionar Ejercicio</span>
            </h3>

            <input
              type="text"
              placeholder="Buscar por nombre o músculo (ej. Pecho, Remo)..."
              value={exerciseSearchTerm}
              onChange={(e) => setExerciseSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500 mb-3"
              autoFocus
            />

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredExercises.map((ej) => (
                <button
                  key={ej.id}
                  onClick={() => {
                    onAddExerciseToWorkout(ej.id);
                    setShowAddExerciseModal(false);
                  }}
                  className="w-full p-3 rounded-xl bg-[#151D2A] hover:bg-emerald-500/10 border border-[#1E2A3C] hover:border-emerald-500/40 text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{ej.nombre}</p>
                    <p className="text-xs text-emerald-400 font-medium">{ej.grupoMuscular}</p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddExerciseModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#182333] hover:bg-[#202F44] text-gray-300 font-semibold text-sm cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Entrenamiento */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101724] border border-emerald-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">
              ¡Entrenamiento Completado!
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Has levantado un total de{' '}
              <span className="font-bold text-emerald-400">{totalVolumeKg.toLocaleString()} kg</span> en{' '}
              <span className="font-bold text-cyan-300">{formatElapsed(elapsedSeconds)}</span>.
            </p>

            <div className="text-left mb-4">
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Notas de la sesión (opcional):
              </label>
              <textarea
                rows={2}
                placeholder="Sensaciones, récord de peso, bombeo..."
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-xs outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResumeWorkout}
                className="flex-1 py-2.5 rounded-xl bg-[#182333] hover:bg-[#202F44] text-gray-300 font-bold text-xs cursor-pointer"
              >
                Seguir Entrenando
              </button>

              <button
                onClick={() => {
                  setFinishModalOpen(false);
                  onFinishWorkout(workoutNotes, frozenEndTime || new Date().toISOString());
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-950 cursor-pointer"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
