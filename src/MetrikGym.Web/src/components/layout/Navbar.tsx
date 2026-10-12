import React from 'react';
import { Dumbbell, Activity } from 'lucide-react';
import { AVATARES_PREDISEÑADOS } from '../../utils/avatars';

interface NavbarProps {
  isOnline: boolean;
  hasActiveWorkout: boolean;
  onOpenActiveWorkout: () => void;
  onOpenProfile: () => void;
  activeTimeFormatted?: string;
  userName?: string;
  avatarId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  hasActiveWorkout,
  onOpenActiveWorkout,
  onOpenProfile,
  activeTimeFormatted,
  userName = 'Atleta',
  avatarId = 'power-beast'
}) => {
  const avatar = AVATARES_PREDISEÑADOS.find((a) => a.id === avatarId) || AVATARES_PREDISEÑADOS[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1F2C3F] px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-950">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              Metrik<span className="text-emerald-400">Gym</span>
            </h1>
          </div>
        </div>

        {/* Center / Right Status Actions */}
        <div className="flex items-center gap-3">
          
          {/* Active Workout Pill (if running) */}
          {hasActiveWorkout && (
            <button
              onClick={onOpenActiveWorkout}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer animate-pulse"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>En vivo: {activeTimeFormatted || '00:00'}</span>
            </button>
          )}

          {/* Minimalist Sync / Online Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131B26] border border-[#1F2C3F] text-xs transition-all"
            title={isOnline ? 'Conectado a la API • En línea' : 'Sin conexión a internet • Modo local'}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                isOnline
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              }`}
            />
            <span className="text-[11px] font-medium text-gray-300 hidden sm:inline">
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>

          {/* User Profile Avatar (Clickable to open profile settings) */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 border-l border-[#1F2C3F] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title="Abrir Mi Perfil y Ajustes"
          >
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatar.bgGradient} border ${avatar.borderColor} flex items-center justify-center ${avatar.textColor} text-[10px] font-black shadow-sm`}>
              {avatar.symbol}
            </div>
            <span className="text-xs text-gray-300 font-medium hidden md:inline">{userName}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
