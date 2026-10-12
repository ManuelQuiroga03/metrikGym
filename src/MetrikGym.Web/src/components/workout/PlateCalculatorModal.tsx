import React, { useState } from 'react';
import { X, Dumbbell, Sparkles, Check } from 'lucide-react';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightKg: number;
  unidadPeso?: 'kg' | 'lbs';
  onApplyWeight?: (weight: number) => void;
}

interface PlateConfig {
  weight: number;
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  heightClass: string;
}

const AVAILABLE_PLATES_KG: PlateConfig[] = [
  { weight: 25, label: '25', bgColor: 'bg-rose-600', borderColor: 'border-rose-400', textColor: 'text-white', heightClass: 'h-24' },
  { weight: 20, label: '20', bgColor: 'bg-blue-600', borderColor: 'border-blue-400', textColor: 'text-white', heightClass: 'h-24' },
  { weight: 15, label: '15', bgColor: 'bg-amber-400', borderColor: 'border-amber-300', textColor: 'text-black', heightClass: 'h-20' },
  { weight: 10, label: '10', bgColor: 'bg-emerald-600', borderColor: 'border-emerald-400', textColor: 'text-white', heightClass: 'h-18' },
  { weight: 5, label: '5', bgColor: 'bg-gray-200', borderColor: 'border-gray-400', textColor: 'text-black', heightClass: 'h-14' },
  { weight: 2.5, label: '2.5', bgColor: 'bg-zinc-800', borderColor: 'border-zinc-600', textColor: 'text-white', heightClass: 'h-12' },
  { weight: 1.25, label: '1.25', bgColor: 'bg-zinc-400', borderColor: 'border-zinc-300', textColor: 'text-black', heightClass: 'h-10' },
];

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeightKg,
  unidadPeso = 'kg',
  onApplyWeight,
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeightKg > 0 ? initialWeightKg : 60);
  const [barWeight, setBarWeight] = useState<number>(20);

  if (!isOpen) return null;

  // Carga necesaria a cada lado de la barra
  const remainingWeight = Math.max(0, targetWeight - barWeight);
  const weightPerSide = remainingWeight / 2;

  // Algoritmo voraz para calcular discos por lado
  let tempPerSide = weightPerSide;
  const platesPerSide: { plate: PlateConfig; count: number }[] = [];

  AVAILABLE_PLATES_KG.forEach((p) => {
    const count = Math.floor(tempPerSide / p.weight);
    if (count > 0) {
      platesPerSide.push({ plate: p, count });
      tempPerSide = Math.round((tempPerSide - count * p.weight) * 100) / 100;
    }
  });

  const weightAchieved = barWeight + (weightPerSide - tempPerSide) * 2;
  const pesoRemanente = Math.round(tempPerSide * 2 * 100) / 100;

  const handleAdjustTarget = (delta: number) => {
    setTargetWeight((prev) => Math.max(barWeight, parseFloat((prev + delta).toFixed(2))));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0F1622] border border-[#202E42] rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-5 text-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2B3E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Calculadora de Discos</h3>
              <p className="text-xs text-gray-400">Distribución exacta de discos por lado de la barra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#172232] text-gray-400 hover:text-white border border-[#25364D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Peso Objetivo & Selector de Barra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Peso Objetivo */}
          <div className="p-3.5 rounded-2xl bg-[#141E2B] border border-[#202E42] text-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Peso Objetivo
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjustTarget(-2.5)}
                className="w-8 h-8 rounded-lg bg-[#1E2C3F] hover:bg-[#283A53] text-gray-200 font-bold active:scale-95 transition-all"
              >
                -
              </button>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Math.max(barWeight, parseFloat(e.target.value) || barWeight))}
                className="w-24 text-center font-black font-tabular text-xl sm:text-2xl text-emerald-400 bg-transparent border-b border-emerald-500/40 outline-none"
              />
              <button
                type="button"
                onClick={() => handleAdjustTarget(2.5)}
                className="w-8 h-8 rounded-lg bg-[#1E2C3F] hover:bg-[#283A53] text-emerald-400 font-bold active:scale-95 transition-all"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block font-medium">
              = {weightPerSide} {unidadPeso} por cada lado
            </span>
          </div>

          {/* Selector Peso Barra */}
          <div className="p-3.5 rounded-2xl bg-[#141E2B] border border-[#202E42] flex flex-col justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Barra Base
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[20, 15, 10].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setBarWeight(w)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    barWeight === w
                      ? 'bg-cyan-500 text-black shadow-md font-black'
                      : 'bg-[#1A2638] border border-[#25364D] text-gray-300 hover:text-white'
                  }`}
                >
                  {w} {unidadPeso}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 text-center">
              {barWeight === 20 ? 'Olímpica Estándar (Hombre)' : barWeight === 15 ? 'Olímpica 15 kg (Mujer)' : 'Barra Corta / Z'}
            </span>
          </div>
        </div>

        {/* Representación Gráfica de la Barra con Discos */}
        <div className="p-4 rounded-2xl bg-[#090D14] border border-[#182333] flex flex-col items-center justify-center overflow-x-auto min-h-[140px]">
          <span className="text-[10px] uppercase font-bold text-gray-500 mb-2">
            Vista Gráfica del Lado Derecho de la Barra
          </span>
          
          <div className="flex items-center justify-start gap-1 py-4 px-2 w-full max-w-sm overflow-x-auto scrollbar-none">
            {/* Tope / Collar interior de la barra */}
            <div className="w-4 h-16 rounded bg-gray-500 border border-gray-400 shrink-0" title="Tope de la barra" />
            
            {/* Manga de la barra */}
            <div className="h-4 w-6 bg-zinc-400 shrink-0" />

            {/* Discos cargados */}
            {platesPerSide.length > 0 ? (
              platesPerSide.flatMap(({ plate, count }) =>
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`${plate.weight}-${i}`}
                    className={`w-4 sm:w-5 ${plate.heightClass} ${plate.bgColor} border-2 ${plate.borderColor} rounded-md shadow-lg flex flex-col items-center justify-center shrink-0 transition-all hover:scale-105`}
                    title={`Disco de ${plate.weight} ${unidadPeso}`}
                  >
                    <span className={`text-[8px] font-black ${plate.textColor} -rotate-90 select-none`}>
                      {plate.label}
                    </span>
                  </div>
                ))
              )
            ) : (
              <span className="text-xs text-gray-500 italic py-4">Barra vacía (sin discos adicionales)</span>
            )}

            {/* Collarín / Seguro exterior */}
            {platesPerSide.length > 0 && (
              <div className="w-2.5 h-8 rounded-sm bg-amber-400 border border-amber-300 shrink-0 shadow-sm" title="Seguro / Collarín" />
            )}
            
            {/* Extremo de la barra */}
            <div className="h-4 w-8 bg-zinc-500 rounded-r shrink-0" />
          </div>
        </div>

        {/* Resumen de Discos a Cargar */}
        <div className="p-3.5 rounded-2xl bg-[#141E2B] border border-[#202E42]">
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cargar en CADA lado:</span>
          </span>

          {platesPerSide.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {platesPerSide.map(({ plate, count }) => (
                <div
                  key={plate.weight}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${plate.bgColor}/20 ${plate.borderColor}`}
                >
                  <span className={`w-3 h-3 rounded-full ${plate.bgColor}`} />
                  <span className="text-white">
                    {count}× {plate.weight} {unidadPeso}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Levanta únicamente la barra ({barWeight} {unidadPeso}).</p>
          )}

          {pesoRemanente > 0 && (
            <p className="text-[11px] text-amber-400 mt-2">
              ⚠️ Sobran {pesoRemanente} {unidadPeso} no divisibles con discos estándar de 1.25 {unidadPeso}. Peso exacto cargado: {weightAchieved} {unidadPeso}.
            </p>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 pt-1">
          {onApplyWeight && (
            <button
              type="button"
              onClick={() => {
                onApplyWeight(targetWeight);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Usar {targetWeight} {unidadPeso} en el Set</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-[#1A2638] hover:bg-[#25364D] border border-[#25364D] text-gray-300 font-bold text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
