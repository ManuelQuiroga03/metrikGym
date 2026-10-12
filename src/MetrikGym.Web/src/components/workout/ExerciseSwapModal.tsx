import React, { useState } from 'react';
import { X, ArrowLeftRight, Search, Dumbbell, Sparkles, Check } from 'lucide-react';
import type { Ejercicio } from '../../types';

interface ExerciseSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEjercicioId: number;
  currentEjercicioNombre: string;
  grupoMuscular: string;
  ejerciciosCatalogo: Ejercicio[];
  onSwap: (newEjercicio: Ejercicio) => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  isOpen,
  onClose,
  currentEjercicioId,
  currentEjercicioNombre,
  grupoMuscular,
  ejerciciosCatalogo,
  onSwap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filtrar alternativas del mismo grupo muscular excluyendo el actual
  const alternativas = ejerciciosCatalogo.filter((e) => {
    const mismoGrupo = e.grupoMuscular.toLowerCase() === grupoMuscular.toLowerCase();
    const distintoId = e.id !== currentEjercicioId;
    const coincideBusqueda = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return mismoGrupo && distintoId && coincideBusqueda;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0F1622] border border-[#202E42] rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 text-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Sustituir Ejercicio</h3>
              <p className="text-xs text-gray-400">¿Máquina ocupada o molestia articular? Cambia de variante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#172232] text-gray-400 hover:text-white border border-[#25364D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ejercicio Actual */}
        <div className="p-3 rounded-2xl bg-[#141E2B] border border-[#202E42] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Ejercicio Actual
            </span>
            <p className="text-sm font-black text-white">{currentEjercicioNombre}</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
            {grupoMuscular}
          </span>
        </div>

        {/* Aviso de Seguridad */}
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            Solo sustituirá en esta sesión en vivo. La rutina original guardada en tu biblioteca no sufrirá cambios.
          </span>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={`Buscar alternativa de ${grupoMuscular}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141E2B] border border-[#202E42] text-xs text-white placeholder-gray-500 outline-none focus:border-amber-400"
          />
        </div>

        {/* Lista de Alternativas */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[180px] max-h-[300px]">
          {alternativas.length > 0 ? (
            alternativas.map((alt) => (
              <div
                key={alt.id}
                onClick={() => {
                  onSwap(alt);
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#131B26] hover:bg-[#1A2638] border border-[#1E2B3E] hover:border-amber-400/50 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2738] flex items-center justify-center text-gray-400 group-hover:text-amber-400 transition-colors">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {alt.nombre}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {alt.esUnilateral ? 'Unilateral (D/I)' : 'Bilateral'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 border border-amber-500/40 text-amber-300 group-hover:text-black font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Elegir</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 text-xs">
              No se encontraron más variantes de {grupoMuscular}.
            </div>
          )}
        </div>

        {/* Botón Cerrar */}
        <div className="pt-2 border-t border-[#1E2B3E] text-right">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#172232] hover:bg-[#202E42] border border-[#25364D] text-gray-300 font-bold text-xs cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
