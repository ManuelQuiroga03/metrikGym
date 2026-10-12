import React from 'react';
import { LayoutDashboard, Flame, FolderKanban, Dumbbell, History, Settings } from 'lucide-react';
import type { NavTab } from './BottomNav';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasActiveWorkout: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  hasActiveWorkout,
}) => {
  const links = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout' as NavTab, label: 'Sesión en Vivo', icon: Flame, badge: hasActiveWorkout },
    { id: 'routines' as NavTab, label: 'Mis Rutinas', icon: FolderKanban },
    { id: 'exercises' as NavTab, label: 'Biblioteca Ejercicios', icon: Dumbbell },
    { id: 'history' as NavTab, label: 'Historial', icon: History },
    { id: 'profile' as NavTab, label: 'Perfil & Ajustes', icon: Settings },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-[#0E141F] border-r border-[#1F2C3F] p-4 min-h-[calc(100vh-53px)] shrink-0">
      
      {/* Quick Nav List */}
      <div className="space-y-1.5 mt-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Navegación
        </p>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;

          return (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold shadow-inner'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#151E2B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </div>

              {link.badge && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick System Info in sidebar footer */}
      <div className="mt-auto pt-4 border-t border-[#1F2C3F]">
        <div className="p-3 rounded-xl bg-[#131B26] border border-[#1F2C3F]/60">
          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            <span>MetrikGym v1.0</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Optimizado para entrenamiento de fuerza e hipertrofia.
          </p>
        </div>
      </div>

    </aside>
  );
};
