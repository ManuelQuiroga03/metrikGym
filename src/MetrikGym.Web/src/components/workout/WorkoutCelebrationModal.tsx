import React, { useEffect } from 'react';
import { TrophySvg } from './TrophySvg';
import { triggerWorkoutConfetti } from '../../utils/confetti';
import { Clock, Dumbbell, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import type { SesionEntrenamiento } from '../../types';

interface WorkoutCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionEntrenamiento | null;
  userName?: string;
  unidadPeso?: 'kg' | 'lbs';
}

const MOTIVATIONAL_QUOTES = [
  'La disciplina vence al talento. Otro día más construyendo tu mejor versión.',
  'Cada repetición cuenta. Hoy diste un paso firme hacia tus objetivos.',
  'Sobrecarga progresiva en acción: eres oficialmente más fuerte que la semana pasada.',
  'El esfuerzo de hoy es el récord personal de mañana. ¡Gran sesión!',
  'La consistencia forja el físico y la mente. Misión cumplida.',
];

export const WorkoutCelebrationModal: React.FC<WorkoutCelebrationModalProps> = ({
  isOpen,
  onClose,
  sesion,
  userName = 'Atleta',
  unidadPeso = 'kg',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Disparar explosión inicial de confeti en todas direcciones
    triggerWorkoutConfetti();

    // Segundo estallido a los 600ms para sensación masiva de victoria
    const timeout = setTimeout(() => {
      triggerWorkoutConfetti();
    }, 600);

    // Vibración háptica de victoria si el dispositivo lo soporta
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 70, 50, 90, 120]);
    }

    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen || !sesion) return null;

  // Cálculos de la sesión finalizada
  const completedSets = sesion.series.filter((s) => s.completada);
  const totalVolume = completedSets.reduce(
    (acc, s) => acc + Number(s.pesoKg || 0) * Number(s.repeticiones || 0),
    0
  );

  let durationMinutes = 0;
  if (sesion.fechaHoraInicio && sesion.fechaHoraFin) {
    const diff =
      new Date(sesion.fechaHoraFin).getTime() - new Date(sesion.fechaHoraInicio).getTime();
    durationMinutes = Math.max(1, Math.round(diff / (1000 * 60)));
  }

  // Quote fija por sesión basada en la suma del id
  const quoteIndex = (sesion.id || 0) % MOTIVATIONAL_QUOTES.length;
  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#131E2D] to-[#0D141F] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative text-center overflow-hidden">
        
        {/* Rayos dorados de fondo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Badge superior */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-3 shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
          <span>¡Sesión Completada!</span>
        </div>

        {/* Trofeo SVG al centro con animación pop */}
        <div className="my-2 flex justify-center transform transition-transform hover:scale-105 duration-300">
          <TrophySvg className="w-40 h-40 sm:w-48 sm:h-48" />
        </div>

        {/* Mensaje principal de felicitación */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          ¡Lo hiciste, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-400">{userName}</span>!
        </h2>

        {/* Frase motivacional */}
        <p className="text-xs text-gray-300 font-medium mt-2 px-3 leading-relaxed">
          "{quote}"
        </p>

        {/* Resumen de Métricas Clave */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-5">
          <div className="bg-[#101824] border border-[#1E2B3E] rounded-2xl p-2.5 text-center shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-[10px] uppercase font-bold text-gray-400">Tiempo</p>
            <p className="text-sm sm:text-base font-black font-tabular text-white">
              {durationMinutes} <span className="text-[10px] font-normal text-gray-400">min</span>
            </p>
          </div>

          <div className="bg-[#101824] border border-[#1E2B3E] rounded-2xl p-2.5 text-center shadow-inner">
            <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[10px] uppercase font-bold text-gray-400">Volumen</p>
            <p className="text-sm sm:text-base font-black font-tabular text-emerald-300">
              {totalVolume.toLocaleString()} <span className="text-[10px] font-normal text-emerald-500">{unidadPeso}</span>
            </p>
          </div>

          <div className="bg-[#101824] border border-[#1E2B3E] rounded-2xl p-2.5 text-center shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-[10px] uppercase font-bold text-gray-400">Series</p>
            <p className="text-sm sm:text-base font-black font-tabular text-amber-300">
              {completedSets.length} <span className="text-[10px] font-normal text-gray-400">sets</span>
            </p>
          </div>
        </div>

        {/* Botón de acción */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <span>Ver Resumen en Historial</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
