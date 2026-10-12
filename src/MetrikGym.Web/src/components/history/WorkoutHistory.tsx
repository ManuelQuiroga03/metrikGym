import React, { useState } from 'react';
import {
  History,
  Calendar,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Trash2,
  Trophy,
  Flame,
  Award,
} from 'lucide-react';
import type { SesionEntrenamiento } from '../../types';

interface WorkoutHistoryProps {
  historial: SesionEntrenamiento[];
  onDeleteSession?: (sesionId: number) => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  historial,
  onDeleteSession,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(
    historial[0]?.id ?? null
  );

  const toggleExpand = (id: number) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string, end?: string | null) => {
    if (!end) return 'En curso';
    const diffMin = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    return `${diffMin} min`;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Historial de Entrenamientos
          </h2>
          <p className="text-xs text-gray-400">
            {historial.length} sesiones registradas • Desglose serie por serie
          </p>
        </div>
      </div>

      {historial.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#131B26] border border-[#1F2C3F] text-center">
          <History className="w-10 h-10 text-gray-500 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-bold text-white mb-1">Aún no hay entrenamientos finalizados</p>
          <p className="text-xs text-gray-400">
            Completa tu primera sesión de gimnasio para comenzar a registrar tu historial de sobrecarga progresiva.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {historial.map((sesion) => {
            const isExpanded = expandedSessionId === sesion.id;
            const completedSeries = sesion.series.filter((s) => s.completada !== false);
            const totalVolume = completedSeries.reduce(
              (acc, s) => acc + Number(s.pesoKg || 0) * Number(s.repeticiones || 0),
              0
            );

            // Group series by exercise
            const exerciseGroups: {
              [key: string]: typeof sesion.series;
            } = {};

            sesion.series.forEach((s) => {
              const key = s.ejercicioNombre || 'Ejercicio';
              if (!exerciseGroups[key]) exerciseGroups[key] = [];
              exerciseGroups[key].push(s);
            });

            return (
              <div
                key={sesion.id}
                className="rounded-2xl bg-[#131B26] border border-[#1F2C3F] hover:border-[#2A3B52] shadow-xl overflow-hidden transition-all"
              >
                {/* Collapsible Card Header */}
                <div
                  onClick={() => toggleExpand(sesion.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-[#16202E]/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                        {sesion.rutinaNombre || 'Entrenamiento Libre'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(sesion.fechaHoraInicio)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{Object.keys(exerciseGroups).length} ejercicios</span>
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400 font-tabular font-medium">
                        {completedSeries.length} sets completados
                      </span>
                    </div>
                  </div>

                  {/* Right metrics + Expand Arrow */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Volumen</span>
                      </p>
                      <p className="text-sm font-black font-tabular text-emerald-300">
                        {totalVolume.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">kg</span>
                      </p>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Duración</span>
                      </p>
                      <p className="text-sm font-black font-tabular text-cyan-300">
                        {calculateDuration(sesion.fechaHoraInicio, sesion.fechaHoraFin)}
                      </p>
                    </div>

                    <button className="p-1 rounded-lg bg-[#182333] text-gray-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed View (Set-by-Set Tables) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#1F2C3F]/60 space-y-4 bg-[#0E141E]">
                    {/* Session Notes if any */}
                    {sesion.notas && (
                      <div className="mt-3 p-3 rounded-xl bg-[#141C28] border border-[#202D40] text-xs text-gray-300 italic flex items-start gap-2">
                        <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>"{sesion.notas}"</span>
                      </div>
                    )}

                    {/* Detailed Exercise Tables */}
                    <div className="space-y-3 pt-2">
                      {Object.entries(exerciseGroups).map(([ejNombre, sets]) => {
                        const maxWeight = Math.max(...sets.map((s) => Number(s.pesoKg || 0)));
                        const exerciseVolume = sets.reduce(
                          (acc, s) => acc + Number(s.pesoKg || 0) * Number(s.repeticiones || 0),
                          0
                        );

                        return (
                          <div
                            key={ejNombre}
                            className="p-3.5 rounded-xl bg-[#141D2A] border border-[#1E2B3E] space-y-2"
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-[#1E2B3E]">
                              <div>
                                <h4 className="text-xs font-bold text-white tracking-tight">
                                  {ejNombre}
                                </h4>
                                <span className="text-[10px] text-emerald-400 font-semibold">
                                  {sets[0]?.grupoMuscular}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] font-tabular">
                                <span className="text-gray-400">Vol:</span>
                                <span className="text-emerald-300 font-bold">
                                  {exerciseVolume.toLocaleString()} kg
                                </span>
                              </div>
                            </div>

                            {/* Sets Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse font-tabular">
                                <thead>
                                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#212E40] pb-1">
                                    <th className="py-1 px-2 text-center w-10">Set</th>
                                    <th className="py-1 px-2 text-center">Peso</th>
                                    <th className="py-1 px-2 text-center">Reps</th>
                                    <th className="py-1 px-2 text-center">RPE</th>
                                    <th className="py-1 px-2 text-center">Lado</th>
                                    <th className="py-1 px-2 text-right">Volumen</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1D293A]">
                                  {sets.map((serie, sIdx) => {
                                    const isMax = Number(serie.pesoKg) === maxWeight && maxWeight > 0;
                                    const setVol = Number(serie.pesoKg || 0) * Number(serie.repeticiones || 0);

                                    return (
                                      <tr key={serie.id || sIdx} className="hover:bg-[#182333]/40">
                                        <td className="py-1.5 px-2 text-center font-bold text-gray-400">
                                          #{serie.numeroSerie || sIdx + 1}
                                        </td>
                                        <td className="py-1.5 px-2 text-center font-bold text-white">
                                          <div className="flex items-center justify-center gap-1">
                                            <span>{serie.pesoKg} kg</span>
                                            {isMax && (
                                              <span title="Mejor serie de peso">
                                                <Trophy className="w-3 h-3 text-amber-400" />
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-1.5 px-2 text-center font-semibold text-gray-200">
                                          {serie.repeticiones} reps
                                        </td>
                                        <td className="py-1.5 px-2 text-center text-amber-400 font-medium">
                                          {serie.rpe ? `@${serie.rpe}` : '—'}
                                        </td>
                                        <td className="py-1.5 px-2 text-center text-cyan-300 font-bold text-[11px]">
                                          {serie.lado ? `${serie.lado}` : '—'}
                                        </td>
                                        <td className="py-1.5 px-2 text-right font-medium text-gray-400">
                                          {setVol.toLocaleString()} kg
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Actions of Session */}
                    {onDeleteSession && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('¿Seguro que deseas eliminar este entrenamiento del historial?')) {
                              onDeleteSession(sesion.id);
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1 px-2.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar esta sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
