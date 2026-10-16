import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Target,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowLeftRight,
  Disc,
  Info,
} from 'lucide-react';
import type { SerieRegistro, UltimoRegistroEjercicio, Ejercicio } from '../../types';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { ExerciseSwapModal } from './ExerciseSwapModal';

interface ExerciseCardProps {
  exerciseIndex: number;
  totalExercises: number;
  ejercicioId: number;
  nombre: string;
  grupoMuscular: string;
  esUnilateralDefecto: boolean;
  series: SerieRegistro[];
  ultimoRegistro?: UltimoRegistroEjercicio;
  descansoEjercicioSegundos?: number | null;
  ejerciciosCatalogo?: Ejercicio[];
  unidadPeso?: 'kg' | 'lbs';
  onUpdateSerie: (serieId: number, field: keyof SerieRegistro, value: any) => void;
  onUpdateSerieFields?: (serieId: number, fields: Partial<SerieRegistro>) => void;
  onToggleCompleteSerie: (serieId: number, descansoSegundos?: number | null) => void;
  onTriggerRest?: (descansoSegundos?: number | null) => void;
  onAddSerie: (ejercicioId: number) => void;
  onDeleteSerie: (serieId: number) => void;
  onExerciseCompleted?: (ejercicioId: number) => void;
  onSwapExercise?: (oldEjercicioId: number, newEjercicio: Ejercicio) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseIndex,
  totalExercises,
  ejercicioId,
  nombre,
  grupoMuscular,
  esUnilateralDefecto,
  series,
  ultimoRegistro,
  descansoEjercicioSegundos = 90,
  ejerciciosCatalogo = [],
  unidadPeso = 'kg',
  onUpdateSerie,
  onUpdateSerieFields,
  onToggleCompleteSerie,
  onTriggerRest,
  onAddSerie,
  onDeleteSerie,
  onExerciseCompleted,
  onSwapExercise,
}) => {
  const [isUnilateral, setIsUnilateral] = useState(esUnilateralDefecto);
  const [activeSerieId, setActiveSerieId] = useState<number | null>(series[0]?.id ?? null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const activeSerie = series.find((s) => s.id === activeSerieId) || series[0];
  const allCompleted = series.length > 0 && series.every((s) => s.completada);

  // 1RM Estimado según fórmula de Epley: Peso * (1 + Reps / 30)
  const estimated1RM = useMemo(() => {
    const weight = Number(activeSerie?.pesoKg) || 0;
    const reps = Number(activeSerie?.repeticiones) || 0;
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }, [activeSerie?.pesoKg, activeSerie?.repeticiones]);

  // Traductor Contextual RPE -> RIR
  const getRPEExplanation = (rpe: number | null | undefined): string => {
    if (!rpe) return 'Toca un valor RPE para definir tu esfuerzo (RIR = reps en reserva)';
    if (rpe >= 10) return 'RPE 10.0 • Fallo muscular absoluto (0 reps en reserva)';
    if (rpe >= 9.5) return 'RPE 9.5 • Al límite técnico (0 a 1 rep en reserva)';
    if (rpe >= 9.0) return 'RPE 9.0 • Muy pesado (1 repetición en reserva)';
    if (rpe >= 8.5) return 'RPE 8.5 • Exigente (1 a 2 repeticiones en reserva)';
    if (rpe >= 8.0) return 'RPE 8.0 • Zona dorada de hipertrofia (2 reps en reserva)';
    if (rpe >= 7.5) return 'RPE 7.5 • Esfuerzo sólido (2 a 3 reps en reserva)';
    if (rpe >= 7.0) return 'RPE 7.0 • Moderado / velocidad (3 reps en reserva)';
    return `RPE ${rpe} • Serie ligera o calentamiento (4+ reps en reserva)`;
  };

  // Quick weight adjuster for active set
  const adjustWeight = (delta: number) => {
    if (!activeSerie) return;
    const current = Number(activeSerie.pesoKg) || 0;
    const next = Math.max(0, parseFloat((current + delta).toFixed(2)));
    onUpdateSerie(activeSerie.id, 'pesoKg', next);
    // If unilateral and left weight not set, mirror right
    if (isUnilateral && (!activeSerie.pesoKgIzq || activeSerie.pesoKgIzq === current)) {
      onUpdateSerie(activeSerie.id, 'pesoKgIzq', next);
    }
  };

  // Quick reps adjuster for active set
  const adjustReps = (delta: number) => {
    if (!activeSerie) return;
    const current = Number(activeSerie.repeticiones) || 0;
    const next = Math.max(1, current + delta);
    onUpdateSerie(activeSerie.id, 'repeticiones', next);
    if (isUnilateral && (!activeSerie.repsIzq || activeSerie.repsIzq === current)) {
      onUpdateSerie(activeSerie.id, 'repsIzq', next);
    }
  };

  // Quick RPE setter
  const setRPE = (val: number) => {
    if (!activeSerie) return;
    onUpdateSerie(activeSerie.id, 'rpe', val);
  };

  // Pre-fill set with ghost value
  const applyGhostValue = (serieId: number) => {
    if (!ultimoRegistro) return;
    onUpdateSerie(serieId, 'pesoKg', ultimoRegistro.pesoKg);
    onUpdateSerie(serieId, 'repeticiones', ultimoRegistro.repeticiones);
    if (isUnilateral) {
      onUpdateSerie(serieId, 'pesoKgIzq', ultimoRegistro.pesoKg);
      onUpdateSerie(serieId, 'repsIzq', ultimoRegistro.repeticiones);
    }
    if (ultimoRegistro.rpe) onUpdateSerie(serieId, 'rpe', ultimoRegistro.rpe);
  };

  // Auto-focus logic: find next uncompleted set in this exercise, or trigger exercise completion
  const focusNextSetOrExercise = (serieId: number) => {
    const currentIndex = series.findIndex((s) => s.id === serieId);
    const nextUncompleted = series.find((s, idx) => idx > currentIndex && !s.completada);
    if (nextUncompleted) {
      setActiveSerieId(nextUncompleted.id);
    } else {
      const anyUncompleted = series.find((s) => s.id !== serieId && !s.completada);
      if (anyUncompleted) {
        setActiveSerieId(anyUncompleted.id);
      } else {
        if (onExerciseCompleted) {
          onExerciseCompleted(ejercicioId);
        }
      }
    }
  };

  // Handle set completion for Bilateral sets
  const handleSetCompletion = (serieId: number) => {
    onToggleCompleteSerie(serieId, descansoEjercicioSegundos);
    focusNextSetOrExercise(serieId);
  };

  // Unilateral paired check handlers: atomic state updates & rest trigger
  const handleToggleUnilateralSide = (serieId: number, side: 'D' | 'I') => {
    const s = series.find((item) => item.id === serieId);
    if (!s) return;

    if (side === 'D') {
      const nextDer = !s.completadaDer;
      const nextIzq = Boolean(s.completadaIzq);
      const isBothNowDone = nextDer && nextIzq;

      if (onUpdateSerieFields) {
        onUpdateSerieFields(serieId, {
          completadaDer: nextDer,
          completada: isBothNowDone,
        });
      } else {
        onUpdateSerie(serieId, 'completadaDer', nextDer);
        onUpdateSerie(serieId, 'completada', isBothNowDone);
      }

      if (isBothNowDone) {
        if (onTriggerRest) onTriggerRest(descansoEjercicioSegundos);
        focusNextSetOrExercise(serieId);
      }
    } else {
      const nextIzq = !s.completadaIzq;
      const nextDer = Boolean(s.completadaDer);
      const isBothNowDone = nextDer && nextIzq;

      if (onUpdateSerieFields) {
        onUpdateSerieFields(serieId, {
          completadaIzq: nextIzq,
          completada: isBothNowDone,
        });
      } else {
        onUpdateSerie(serieId, 'completadaIzq', nextIzq);
        onUpdateSerie(serieId, 'completada', isBothNowDone);
      }

      if (isBothNowDone) {
        if (onTriggerRest) onTriggerRest(descansoEjercicioSegundos);
        focusNextSetOrExercise(serieId);
      }
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 shadow-xl transition-all border ${
        allCompleted
          ? 'bg-[#101924] border-emerald-500/50 shadow-emerald-950/20'
          : 'bg-[#131B26] border-[#1F2C3F]'
      }`}
    >
      {/* Exercise Card Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1F2C3F]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
              {exerciseIndex + 1}/{totalExercises} • {grupoMuscular}
            </span>
            {descansoEjercicioSegundos && (
              <span className="text-[11px] font-medium text-cyan-400/80 font-tabular">
                {descansoEjercicioSegundos}s descanso
              </span>
            )}
            {allCompleted && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-black flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                <span>Completado ({series.length}/{series.length})</span>
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {nombre}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Hot Substitution Button ("Máquina Ocupada") */}
          {onSwapExercise && (
            <button
              type="button"
              onClick={() => setIsSwapModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1 transition-all cursor-pointer"
              title="Sustituir este ejercicio si la máquina o banca está ocupada"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sustituir</span>
            </button>
          )}

          {/* Unilateral / Bilateral Switch */}
          <button
            type="button"
            onClick={() => setIsUnilateral(!isUnilateral)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isUnilateral
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-[#182333] border-[#25364D] text-gray-400 hover:text-gray-200'
            }`}
            title="Alternar modo bilateral o por extremidad (Derecho / Izquierdo)"
          >
            {isUnilateral ? 'Unilateral' : 'Bilateral'}
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-[#182333] text-gray-400 hover:text-white border border-[#25364D] cursor-pointer"
            title={isCollapsed ? 'Desplegar ejercicio' : 'Minimizar ejercicio'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <>
          {/* Progressive Overload Benchmark Reference */}
          {ultimoRegistro && (
            <div className="flex items-center justify-between my-2 px-2.5 py-1.5 rounded-xl bg-[#0D141F] border border-[#1B2738] text-xs gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-gray-400">Prev:</span>
                <span className="font-bold font-tabular text-amber-300 truncate">
                  {ultimoRegistro.pesoKg}k × {ultimoRegistro.repeticiones}
                </span>
                {ultimoRegistro.rpe && (
                  <span className="text-gray-500 text-[10px] hidden sm:inline">(@RPE {ultimoRegistro.rpe})</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => activeSerie && applyGhostValue(activeSerie.id)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0"
                title="Copiar marca al set activo"
              >
                <Sparkles className="w-3 h-3" />
                <span>Copiar #{activeSerie?.numeroSerie || 1}</span>
              </button>
            </div>
          )}

          {/* Sets Table: Bilateral or Paired Unilateral */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-[#1F2C3F]/60 pb-2">
                  <th className="py-2 px-1 text-center w-8">#</th>
                  <th className="py-2 px-1 text-center text-gray-500 text-[10px]">Prev</th>
                  {isUnilateral ? (
                    <>
                      <th className="py-2 px-1 text-center text-cyan-300">D (Kg × Reps)</th>
                      <th className="py-2 px-1 text-center w-8 text-cyan-300">✓ D</th>
                      <th className="py-2 px-1 text-center text-purple-300">I (Kg × Reps)</th>
                      <th className="py-2 px-1 text-center w-8 text-purple-300">✓ I</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2 px-2 text-center w-24">Kg</th>
                      <th className="py-2 px-2 text-center w-20">Reps</th>
                      <th className="py-2 px-2 text-center w-16">RPE</th>
                      <th className="py-2 px-2 text-center w-12">✓</th>
                    </>
                  )}

                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2C3F]/40">
                {series.map((serie, idx) => {
                  const isSelected = activeSerieId === serie.id;
                  const isCompleted = serie.completada;

                  return (
                    <tr
                      key={serie.id || idx}
                      onClick={() => setActiveSerieId(serie.id)}
                      className={`transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-950/20'
                          : isSelected
                          ? 'bg-emerald-500/10'
                          : 'hover:bg-[#182333]/50'
                      }`}
                    >
                      {/* Set Number */}
                      <td className="py-2 px-1 text-center font-bold font-tabular text-xs">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-black shadow-sm'
                              : isSelected
                              ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                              : 'bg-[#1D293A] text-gray-300'
                          }`}
                        >
                          {serie.numeroSerie}
                        </span>
                      </td>

                      {/* Previous Benchmark Ghost Value */}
                      <td className="py-2 px-2 text-center text-xs font-tabular text-gray-400">
                        {ultimoRegistro ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyGhostValue(serie.id);
                            }}
                            className="hover:text-amber-300 hover:underline cursor-pointer"
                            title="Toca para usar este peso y reps"
                          >
                            {ultimoRegistro.pesoKg}k × {ultimoRegistro.repeticiones}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* UNILATERAL PAIRED MODE (Right + Left sub-checks) */}
                      {isUnilateral ? (
                        <>
                          {/* Right Side Inputs (D) */}
                          <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={serie.pesoKg === 0 ? '' : (serie.pesoKg ?? '')}
                                onFocus={(e) => {
                                  setActiveSerieId(serie.id);
                                  e.currentTarget.select();
                                }}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  onUpdateSerie(serie.id, 'pesoKg', isNaN(val) ? 0 : val);
                                }}
                                placeholder="0"
                                className="w-13 text-center py-1.5 px-1 rounded-lg bg-[#16202E] border border-cyan-500/30 text-white font-bold text-xs outline-none focus:border-cyan-400"
                              />
                              <span className="text-gray-500 text-[10px]">×</span>
                              <input
                                type="number"
                                value={serie.repeticiones === 0 ? '' : (serie.repeticiones ?? '')}
                                onFocus={(e) => {
                                  setActiveSerieId(serie.id);
                                  e.currentTarget.select();
                                }}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                  onUpdateSerie(serie.id, 'repeticiones', isNaN(val) ? 0 : val);
                                }}
                                placeholder="0"
                                className="w-11 text-center py-1.5 px-1 rounded-lg bg-[#16202E] border border-cyan-500/30 text-white font-bold text-xs outline-none focus:border-cyan-400"
                              />
                            </div>
                          </td>

                          {/* Right Check (D) */}
                          <td className="py-2 px-0.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleUnilateralSide(serie.id, 'D')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                                serie.completadaDer
                                  ? 'bg-cyan-400 text-black font-black shadow-md shadow-cyan-950 ring-1 ring-cyan-300'
                                  : 'bg-[#1B2738] border border-cyan-500/40 text-gray-400 hover:text-white hover:border-cyan-400'
                              }`}
                              title={serie.completadaDer ? 'Lado D listo' : 'Marcar lado D'}
                            >
                              <Check className={`w-3.5 h-3.5 stroke-[3] ${serie.completadaDer ? 'text-black' : 'text-gray-400'}`} />
                            </button>
                          </td>

                          {/* Left Side Inputs (I) */}
                          <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                value={
                                  serie.pesoKgIzq !== undefined && serie.pesoKgIzq !== null
                                    ? (serie.pesoKgIzq === 0 ? '' : serie.pesoKgIzq)
                                    : (serie.pesoKg === 0 ? '' : (serie.pesoKg ?? ''))
                                }
                                onFocus={(e) => {
                                  setActiveSerieId(serie.id);
                                  e.currentTarget.select();
                                }}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  onUpdateSerie(serie.id, 'pesoKgIzq', isNaN(val) ? 0 : val);
                                }}
                                placeholder="0"
                                className="w-13 text-center py-1.5 px-1 rounded-lg bg-[#16202E] border border-purple-500/30 text-white font-bold text-xs outline-none focus:border-purple-400"
                              />
                              <span className="text-gray-500 text-[10px]">×</span>
                              <input
                                type="number"
                                value={
                                  serie.repsIzq !== undefined && serie.repsIzq !== null
                                    ? (serie.repsIzq === 0 ? '' : serie.repsIzq)
                                    : (serie.repeticiones === 0 ? '' : (serie.repeticiones ?? ''))
                                }
                                onFocus={(e) => {
                                  setActiveSerieId(serie.id);
                                  e.currentTarget.select();
                                }}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                  onUpdateSerie(serie.id, 'repsIzq', isNaN(val) ? 0 : val);
                                }}
                                placeholder="0"
                                className="w-11 text-center py-1.5 px-1 rounded-lg bg-[#16202E] border border-purple-500/30 text-white font-bold text-xs outline-none focus:border-purple-400"
                              />
                            </div>
                          </td>

                          {/* Left Check (I) */}
                          <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleUnilateralSide(serie.id, 'I')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                                serie.completadaIzq
                                  ? 'bg-purple-500 text-black font-black shadow-md shadow-purple-950 ring-1 ring-purple-300'
                                  : 'bg-[#1B2738] border border-purple-500/40 text-gray-400 hover:text-white hover:border-purple-400'
                              }`}
                              title={serie.completadaIzq ? 'Lado I listo' : 'Marcar lado I'}
                            >
                              <Check className={`w-3.5 h-3.5 stroke-[3] ${serie.completadaIzq ? 'text-black' : 'text-gray-400'}`} />
                            </button>
                          </td>
                        </>
                      ) : (
                        /* BILATERAL MODE */
                        <>
                          {/* Weight Input */}
                          <td className="py-2 px-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="0.5"
                              value={serie.pesoKg === 0 ? '' : (serie.pesoKg ?? '')}
                              onFocus={(e) => {
                                setActiveSerieId(serie.id);
                                e.currentTarget.select();
                              }}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                onUpdateSerie(serie.id, 'pesoKg', isNaN(val) ? 0 : val);
                              }}
                              placeholder="0"
                              className={`w-full text-center py-1.5 px-2 rounded-lg font-bold font-tabular text-sm border outline-none transition-all ${
                                isSelected
                                  ? 'bg-[#1E2B3E] border-emerald-500 text-white ring-1 ring-emerald-500/50'
                                  : 'bg-[#16202E] border-[#25364D] text-gray-200'
                              }`}
                            />
                          </td>

                          {/* Reps Input */}
                          <td className="py-2 px-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              value={serie.repeticiones === 0 ? '' : (serie.repeticiones ?? '')}
                              onFocus={(e) => {
                                setActiveSerieId(serie.id);
                                e.currentTarget.select();
                              }}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                onUpdateSerie(serie.id, 'repeticiones', isNaN(val) ? 0 : val);
                              }}
                              placeholder="0"
                              className={`w-full text-center py-1.5 px-2 rounded-lg font-bold font-tabular text-sm border outline-none transition-all ${
                                isSelected
                                  ? 'bg-[#1E2B3E] border-emerald-500 text-white ring-1 ring-emerald-500/50'
                                  : 'bg-[#16202E] border-[#25364D] text-gray-200'
                              }`}
                            />
                          </td>

                          {/* RPE Input */}
                          <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="0.5"
                              max="10"
                              value={serie.rpe || ''}
                              onFocus={(e) => {
                                setActiveSerieId(serie.id);
                                e.currentTarget.select();
                              }}
                              onChange={(e) =>
                                onUpdateSerie(serie.id, 'rpe', parseFloat(e.target.value) || null)
                              }
                              placeholder="—"
                              className="w-full text-center py-1.5 px-1 rounded-lg font-medium font-tabular text-xs bg-[#16202E] border border-[#25364D] text-amber-300 outline-none"
                            />
                          </td>

                          {/* Complete Check Button with Auto-Rest Trigger & Auto-Focus */}
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCompletion(serie.id);
                              }}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950 font-bold'
                                  : 'bg-[#1B2738] border border-[#283950] text-gray-400 hover:text-white hover:border-emerald-500/50'
                              }`}
                              title={isCompleted ? 'Serie completada' : 'Completar serie e iniciar descanso'}
                            >
                              <Check
                                className={`w-4 h-4 stroke-[3px] ${
                                  isCompleted ? 'text-black' : 'text-gray-400'
                                }`}
                              />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Contextual Micro-Adjustment Keyboard Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#1F2C3F]/70 bg-[#0F1621] p-3 rounded-xl">
            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-gray-400 mb-2 flex-wrap">
              <span className="flex items-center gap-1 text-gray-300">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ajuste Set #{activeSerie?.numeroSerie || 1}:</span>
                <span className="text-emerald-400 font-tabular font-bold ml-1">
                  {activeSerie?.pesoKg || 0} {unidadPeso} × {activeSerie?.repeticiones || 0} reps
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                {estimated1RM > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1"
                    title="1RM Teórico Estimado (Fórmula de Epley)"
                  >
                    <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                    <span>1RM: ~{estimated1RM} {unidadPeso}</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setIsPlateCalcOpen(true)}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Abrir calculadora gráfica de discos de barra"
                >
                  <Disc className="w-3 h-3 text-cyan-400" />
                  <span>Discos</span>
                </button>
              </div>
            </div>

            {/* Micro-load Buttons Row */}
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => adjustWeight(-2.5)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-gray-300 active:scale-95 transition-all cursor-pointer"
              >
                -2.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(-1.25)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-gray-300 active:scale-95 transition-all cursor-pointer"
              >
                -1.25
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(1.25)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                +1.25
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(2.5)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                +2.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(5.0)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                +5.0
              </button>
              <button
                type="button"
                onClick={() => adjustReps(-1)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-cyan-300 active:scale-95 transition-all cursor-pointer"
              >
                -1 rep
              </button>
              <button
                type="button"
                onClick={() => adjustReps(1)}
                className="py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-bold text-cyan-300 active:scale-95 transition-all cursor-pointer"
              >
                +1 rep
              </button>
            </div>

            {/* Quick RPE Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-gray-400 mr-1 shrink-0">
                Esfuerzo RPE:
              </span>
              {[7, 7.5, 8, 8.5, 9, 9.5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRPE(val)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeSerie?.rpe === val
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : 'bg-[#182333] border border-[#25364D] text-gray-300 hover:text-amber-300'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Dynamic RPE -> RIR Translator Banner */}
            <div className="mt-2.5 pt-2 border-t border-[#1C283A] flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-gray-300 font-medium">
                {getRPEExplanation(activeSerie?.rpe)}
              </span>
            </div>
          </div>

          {/* Card Actions Bottom */}
          <div className="flex items-center justify-between gap-3 mt-3 pt-2">
            <button
              type="button"
              onClick={() => onAddSerie(ejercicioId)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Serie</span>
            </button>

            {series.length > 1 && (
              <button
                type="button"
                onClick={() => activeSerie && onDeleteSerie(activeSerie.id)}
                className="text-xs text-rose-400/80 hover:text-rose-300 py-1.5 px-2.5 rounded-lg hover:bg-rose-500/10 transition-all flex items-center gap-1 cursor-pointer"
                title="Eliminar serie seleccionada"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar Set #{activeSerie?.numeroSerie}</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
        initialWeightKg={Number(activeSerie?.pesoKg) || 60}
        unidadPeso={unidadPeso}
        onApplyWeight={(w) => activeSerie && onUpdateSerie(activeSerie.id, 'pesoKg', w)}
      />

      {/* Hot Substitution Modal ("Máquina Ocupada") */}
      <ExerciseSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        currentEjercicioId={ejercicioId}
        currentEjercicioNombre={nombre}
        grupoMuscular={grupoMuscular}
        ejerciciosCatalogo={ejerciciosCatalogo}
        onSwap={(newEj) => onSwapExercise && onSwapExercise(ejercicioId, newEj)}
      />
    </div>
  );
};
