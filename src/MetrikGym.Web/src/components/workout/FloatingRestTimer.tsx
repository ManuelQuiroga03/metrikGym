import React, { useEffect } from 'react';
import { Timer, SkipForward, CheckCircle2 } from 'lucide-react';
import { playRestAlert, type TonoAlerta } from '../../utils/audio';

interface FloatingRestTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  isActive: boolean;
  tonoAlerta?: TonoAlerta;
  sonidoHabilitado?: boolean;
  onAddSeconds: (sec: number) => void;
  onSkip: () => void;
  onComplete: () => void;
  onNavigateToWorkout?: () => void;
}

export const FloatingRestTimer: React.FC<FloatingRestTimerProps> = ({
  secondsLeft,
  totalSeconds,
  isActive,
  tonoAlerta = 'beep',
  sonidoHabilitado = true,
  onAddSeconds,
  onSkip,
  onComplete,
  onNavigateToWorkout,
}) => {
  // Formato MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 
    ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) 
    : 0;

  // Tono sintetizado y vibración háptica cuando finaliza el descanso
  useEffect(() => {
    if (secondsLeft === 0 && isActive) {
      playRestAlert(tonoAlerta, sonidoHabilitado);
      onComplete();
    }
  }, [secondsLeft, isActive, tonoAlerta, sonidoHabilitado, onComplete]);

  if (!isActive && secondsLeft <= 0) return null;

  const isCompleted = secondsLeft <= 0;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 transition-all duration-300 transform translate-y-0">
      <div className={`p-3.5 rounded-2xl bg-[#101724]/95 backdrop-blur-xl border transition-all shadow-2xl ${
        isCompleted 
          ? 'border-emerald-500 timer-ring-alert bg-emerald-950/40' 
          : 'border-cyan-500/40'
      }`}>
        
        {/* Progress Bar Top */}
        <div className="w-full bg-[#1A2433] h-1.5 rounded-full overflow-hidden mb-2.5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          
          {/* Timer Clock */}
          <div
            onClick={onNavigateToWorkout}
            className={`flex items-center gap-2.5 ${onNavigateToWorkout ? 'cursor-pointer hover:opacity-90' : ''}`}
            title={onNavigateToWorkout ? 'Toca para volver a la pantalla de entrenamiento' : undefined}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isCompleted 
                ? 'bg-emerald-500 text-white' 
                : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {isCompleted ? '¡Tiempo Cumplido!' : 'Descanso en progreso'}
              </p>
              <p className="text-xl font-black font-tabular tracking-tight text-white">
                {formatTime(secondsLeft)}
              </p>
            </div>
          </div>

          {/* Quick Adjust Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddSeconds(-15)}
              className="px-2 py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-semibold text-gray-300 active:scale-95 transition-all"
              title="Restar 15 segundos"
            >
              -15s
            </button>

            <button
              onClick={() => onAddSeconds(30)}
              className="px-2 py-1.5 rounded-lg bg-[#182333] hover:bg-[#202F44] border border-[#25364D] text-xs font-semibold text-emerald-400 active:scale-95 transition-all"
              title="Sumar 30 segundos"
            >
              +30s
            </button>

            <button
              onClick={onSkip}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 active:scale-95 transition-all flex items-center gap-1"
              title="Saltar descanso"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Saltar</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
