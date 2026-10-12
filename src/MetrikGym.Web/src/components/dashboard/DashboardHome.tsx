import React, { useMemo } from 'react';
import {
  Flame,
  Play,
  Plus,
  Trophy,
  Calendar,
  Dumbbell,
  ChevronRight,
  Check,
  Moon,
  Minus,
} from 'lucide-react';
import type { Rutina, SesionEntrenamiento } from '../../types';

interface DashboardHomeProps {
  userName: string;
  rutinaSugerida?: Rutina;
  rutinas?: Rutina[];
  historial?: SesionEntrenamiento[];
  unidadPeso?: 'kg' | 'lbs';
  onStartRoutine: (rutinaId: number) => void;
  onStartEmptyWorkout: () => void;
  onViewRoutines: () => void;
  onViewHistory?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName,
  rutinaSugerida,
  rutinas = [],
  historial = [],
  unidadPeso = 'kg',
  onStartRoutine,
  onStartEmptyWorkout,
  onViewRoutines,
  onViewHistory,
}) => {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayLetters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Current calendar day detection
  const now = new Date();
  const jsDay = now.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mie, 4: Jue, 5: Vie, 6: Sab
  // Convert to Monday = 0 ... Sunday = 6
  const currentWeekDayIndex = (jsDay + 6) % 7;
  const hoyNombre = dayNames[currentWeekDayIndex];

  // Calculate Monday of the current week at 00:00:00
  const mondayDate = useMemo(() => {
    const d = new Date(now);
    d.setDate(now.getDate() - currentWeekDayIndex);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentWeekDayIndex]);

  // Dynamic 7-day calendar of current week
  const daysOfWeek = useMemo(() => {
    return dayNames.map((nombreDia, idx) => {
      const dayDate = new Date(mondayDate);
      dayDate.setDate(mondayDate.getDate() + idx);
      const isToday = idx === currentWeekDayIndex;
      const isPastOrToday = idx <= currentWeekDayIndex;

      // Check if user completed a workout on this date in historial
      const hasWorkout = historial.some((s) => {
        if (!s.fechaHoraInicio) return false;
        const sDate = new Date(s.fechaHoraInicio);
        return (
          sDate.getFullYear() === dayDate.getFullYear() &&
          sDate.getMonth() === dayDate.getMonth() &&
          sDate.getDate() === dayDate.getDate()
        );
      });

      // Check if an active routine is planned for this day
      const isRoutinePlanned = rutinas.some(
        (r) => r.activa && r.diaSugerido?.trim().toLowerCase() === nombreDia.toLowerCase()
      );

      return {
        letter: dayLetters[idx],
        label: nombreDia,
        dateNum: dayDate.getDate(),
        done: hasWorkout,
        isToday,
        isRoutinePlanned,
        isPastOrToday,
      };
    });
  }, [mondayDate, currentWeekDayIndex, historial, rutinas]);

  // Workouts in current week
  const sesionesEstaSemana = useMemo(() => {
    return historial.filter((s) => {
      if (!s.fechaHoraInicio) return false;
      const sDate = new Date(s.fechaHoraInicio);
      return sDate >= mondayDate;
    });
  }, [historial, mondayDate]);

  // Real KPI: Volumen Semanal
  const volumenSemanal = useMemo(() => {
    let total = 0;
    sesionesEstaSemana.forEach((s) => {
      (s.series || []).forEach((ser) => {
        if (ser.completada || ser.completadaDer || ser.completadaIzq) {
          const wDer = (ser.pesoKg || 0) * (ser.repeticiones || 0);
          const wIzq = ser.pesoKgIzq && ser.repsIzq ? ser.pesoKgIzq * ser.repsIzq : 0;
          total += wDer + wIzq;
        }
      });
    });
    return total;
  }, [sesionesEstaSemana]);

  // Real KPI: Series Totales y RPE Promedio
  const { seriesTotales, rpePromedio } = useMemo(() => {
    let count = 0;
    let rpeSum = 0;
    let rpeCount = 0;

    sesionesEstaSemana.forEach((s) => {
      (s.series || []).forEach((ser) => {
        if (ser.completada || ser.completadaDer || ser.completadaIzq) {
          count++;
          if (ser.rpe && ser.rpe > 0) {
            rpeSum += ser.rpe;
            rpeCount++;
          }
        }
      });
    });

    const avg = rpeCount > 0 ? (rpeSum / rpeCount).toFixed(1) : null;
    return { seriesTotales: count, rpePromedio: avg };
  }, [sesionesEstaSemana]);

  // Real KPI: Tiempo Total y Promedio
  const { tiempoTotalStr, tiempoPromedioStr } = useMemo(() => {
    let totalMinutos = 0;
    let conDuracion = 0;

    sesionesEstaSemana.forEach((s) => {
      if (s.fechaHoraInicio && s.fechaHoraFin) {
        const inicio = new Date(s.fechaHoraInicio).getTime();
        const fin = new Date(s.fechaHoraFin).getTime();
        const diffMin = Math.round((fin - inicio) / (1000 * 60));
        if (diffMin > 0 && diffMin < 600) {
          totalMinutos += diffMin;
          conDuracion++;
        }
      }
    });

    if (totalMinutos === 0) {
      return { tiempoTotalStr: '0m', tiempoPromedioStr: '—' };
    }

    const horas = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    const totalStr = horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;

    const promMin = conDuracion > 0 ? Math.round(totalMinutos / conDuracion) : 0;
    const promStr = `${promMin}m prom`;

    return { tiempoTotalStr: totalStr, tiempoPromedioStr: promStr };
  }, [sesionesEstaSemana]);

  // Completed days count
  const diasCompletados = daysOfWeek.filter((d) => d.done).length;
  const diasPlanificados = daysOfWeek.filter((d) => d.isRoutinePlanned).length || 4;

  // Recent PRs derived from historial
  const recentPRs = useMemo(() => {
    const list: { ejercicioNombre: string; pesoKg: number; reps: number; fechaStr: string }[] = [];
    const seenEjercicios = new Set<string>();

    historial.forEach((s) => {
      (s.series || []).forEach((ser) => {
        if ((ser.completada || ser.completadaDer || ser.completadaIzq) && ser.pesoKg > 0) {
          if (!seenEjercicios.has(ser.ejercicioNombre) && list.length < 2) {
            seenEjercicios.add(ser.ejercicioNombre);
            list.push({
              ejercicioNombre: ser.ejercicioNombre,
              pesoKg: ser.pesoKg,
              reps: ser.repeticiones,
              fechaStr: s.fechaHoraFin
                ? new Date(s.fechaHoraFin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                : 'Reciente',
            });
          }
        }
      });
    });

    return list;
  }, [historial]);

  return (
    <div className="space-y-4 pb-20">

      {/* Header Greeting & Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ¡Hola, {userName}!
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{diasCompletados > 0 ? `${diasCompletados} días esta sem` : 'Semana activa'}</span>
        </div>
      </div>

      {/* Main Action Card: Today's Routine OR Rest Day */}
      {rutinaSugerida ? (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#162232] to-[#111A26] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              {rutinaSugerida.diaSugerido ? `Planificado: ${rutinaSugerida.diaSugerido}` : 'Rutina Recomendada'}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {rutinaSugerida.ejercicios.length} ejercicios
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">
            {rutinaSugerida.nombre}
          </h3>

          <p className="text-xs text-gray-400 mb-4 flex items-center gap-2">
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            <span>{rutinaSugerida.ejercicios.map((e) => e.ejercicioNombre).slice(0, 3).join(', ')}...</span>
          </p>

          <button
            onClick={() => onStartRoutine(rutinaSugerida.id)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Comenzar Entrenamiento de Hoy</span>
          </button>
        </div>
      ) : (
        /* DÍA DE DESCANSO / SIN RUTINA PROGRAMADA PARA HOY */
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121B26] to-[#0D141F] border border-cyan-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hoy es {hoyNombre} • Día de Descanso</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">Recuperación Activa</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-1.5">
            Sin entrenamiento programado para hoy
          </h3>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Tus músculos crecen y se reparan durante el descanso. Aprovecha este día para cuidar tu nutrición, hidratarte y recargar energía para tu siguiente sesión.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onStartEmptyWorkout}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Iniciar Entrenamiento Libre</span>
            </button>
            <button
              onClick={onViewRoutines}
              className="py-3 px-4 rounded-xl bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-gray-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span>Ver todas mis rutinas</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Empty Workout Option (visible when a routine IS suggested) */}
      {rutinaSugerida && (
        <button
          onClick={onStartEmptyWorkout}
          className="w-full p-4 rounded-2xl bg-[#131B26] hover:bg-[#182333] border border-[#1F2C3F] hover:border-[#2E415D] flex items-center justify-between text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Iniciar Entrenamiento Libre
              </h4>
              <p className="text-xs text-gray-400">
                Registra series y ejercicios de forma espontánea
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* Weekly Consistency Calendar */}
      <div className="p-4 rounded-2xl bg-[#131B26] border border-[#1F2C3F]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Consistencia Semanal</span>
          </h4>
          <span className="text-xs font-semibold text-emerald-400">
            {diasCompletados} de {diasPlanificados} completados
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysOfWeek.map((d, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                d.isToday
                  ? d.done
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950/30'
                    : 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-950/30'
                  : d.done
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                  : 'bg-[#182333]/60 border-[#223044] text-gray-400'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-extrabold uppercase">{d.letter}</span>
                {d.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" title="Hoy" />
                )}
              </div>
              <div className="h-4 flex items-center justify-center">
                {d.done ? (
                  <Check className="w-3.5 h-3.5 stroke-[3px] text-emerald-400" />
                ) : !d.isRoutinePlanned ? (
                  <Moon className="w-3 h-3 text-gray-500" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Volumen</p>
          <p className="text-base font-black font-tabular text-emerald-300 mt-0.5">
            {volumenSemanal > 0 ? volumenSemanal.toLocaleString() : '0'}{' '}
            <span className="text-[10px] font-normal">{unidadPeso}</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {volumenSemanal > 0 ? 'Esta semana' : 'Sin entreno'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Series</p>
          <p className="text-base font-black font-tabular text-cyan-300 mt-0.5">
            {seriesTotales}{' '}
            <span className="text-[10px] font-normal">tot</span>
          </p>
          <span className="text-[10px] text-cyan-400 font-semibold">
            {rpePromedio ? `RPE ${rpePromedio} avg` : 'RPE —'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tiempo</p>
          <p className="text-base font-black font-tabular text-white mt-0.5">
            {tiempoTotalStr}
          </p>
          <span className="text-[10px] text-gray-400 font-semibold">
            {tiempoPromedioStr}
          </span>
        </div>
      </div>

      {/* Recent PRs / Personal Records */}
      <div className="p-4 rounded-2xl bg-[#131B26] border border-[#1F2C3F]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Récords Personales Recientes</span>
          </h4>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver Historial</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentPRs.length > 0 ? (
          <div className="space-y-2">
            {recentPRs.map((pr, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0F1622] border border-[#1B2738] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{pr.ejercicioNombre}</p>
                  <p className="text-[10px] text-gray-400">{pr.fechaStr}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-tabular text-amber-300">
                    {pr.pesoKg} {unidadPeso} × {pr.reps}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-bold">Mejor Serie</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0F1622] border border-[#1B2738] text-center">
            <p className="text-xs text-gray-400">
              Completa tus entrenamientos para ver aquí tus marcas personales y mejores levantamientos.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
