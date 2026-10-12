import React from 'react';
import { LayoutDashboard, Flame, FolderKanban, Dumbbell, History } from 'lucide-react';

export type NavTab = 'dashboard' | 'workout' | 'routines' | 'exercises' | 'history' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasActiveWorkout: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  hasActiveWorkout
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Inicio', icon: LayoutDashboard },
    { id: 'workout' as NavTab, label: 'Entrenar', icon: Flame, badge: hasActiveWorkout },
    { id: 'routines' as NavTab, label: 'Rutinas', icon: FolderKanban },
    { id: 'exercises' as NavTab, label: 'Ejercicios', icon: Dumbbell },
    { id: 'history' as NavTab, label: 'Historial', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-[#1F2C3F] px-4 py-2 sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.badge && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
