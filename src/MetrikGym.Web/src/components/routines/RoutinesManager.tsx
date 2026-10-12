import React, { useState } from 'react';
import {
  Plus,
  Play,
  Check,
  Trash2,
  Calendar,
  Pencil,
  ArrowUp,
  ArrowDown,
  Clock,
  X,
  ArrowRight,
  ArrowLeft,
  Search,
  Sliders,
  Layers,
  Minus,
} from 'lucide-react';
import type { Rutina, Ejercicio, GrupoMuscular } from '../../types';

interface RoutineExerciseConfig {
  ejercicioId: number;
  seriesObjetivo: number;
  descansoSegundos: number;
  orden: number;
}

interface RoutinesManagerProps {
  rutinas: Rutina[];
  ejerciciosCatalogo: Ejercicio[];
  onStartRoutine: (rutinaId: number) => void;
  onCreateRoutine: (data: { nombre: string; diaSugerido?: string; ejercicios: any[] }) => void;
  onUpdateRoutine: (id: number, data: { nombre: string; diaSugerido?: string; activa: boolean; ejercicios: any[] }) => void;
  onDeleteRoutine: (rutinaId: number) => void;
}

const GRUPOS_FILTRO: Array<GrupoMuscular | 'Todos'> = [
  'Todos',
  'Pecho',
  'Espalda',
  'Hombro',
  'Bíceps',
  'Tríceps',
  'Cuádriceps',
  'Femoral',
  'Glúteo',
  'Aductores',
  'Gemelos',
  'Abdomen',
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Flexible'];
const DESCANSO_OPCIONES = [45, 60, 90, 120, 180, 240];

export const RoutinesManager: React.FC<RoutinesManagerProps> = ({
  rutinas,
  ejerciciosCatalogo,
  onStartRoutine,
  onCreateRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
}) => {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [diaSugerido, setDiaSugerido] = useState('Lunes');
  const [selectedExercises, setSelectedExercises] = useState<RoutineExerciseConfig[]>([]);
  const [searchExercise, setSearchExercise] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoMuscular | 'Todos'>('Todos');

  const openCreateModal = () => {
    setModalMode('create');
    setStep(1);
    setEditingRoutineId(null);
    setNombre('');
    setDiaSugerido('Lunes');
    setSelectedExercises([]);
    setSearchExercise('');
    setSelectedGrupo('Todos');
  };

  const openEditModal = (rutina: Rutina) => {
    setModalMode('edit');
    setStep(1);
    setEditingRoutineId(rutina.id);
    setNombre(rutina.nombre);
    setDiaSugerido(rutina.diaSugerido || 'Lunes');
    setSelectedExercises(
      rutina.ejercicios.map((e, idx) => ({
        ejercicioId: e.ejercicioId,
        seriesObjetivo: e.seriesObjetivo || 4,
        descansoSegundos: e.descansoSegundos || 90,
        orden: idx + 1,
      }))
    );
    setSearchExercise('');
    setSelectedGrupo('Todos');
  };

  const closeModal = () => {
    setModalMode(null);
    setStep(1);
    setEditingRoutineId(null);
  };

  const toggleExerciseSelection = (ejId: number) => {
    if (selectedExercises.some((e) => e.ejercicioId === ejId)) {
      const updated = selectedExercises
        .filter((e) => e.ejercicioId !== ejId)
        .map((e, idx) => ({ ...e, orden: idx + 1 }));
      setSelectedExercises(updated);
    } else {
      setSelectedExercises([
        ...selectedExercises,
        {
          ejercicioId: ejId,
          seriesObjetivo: 3,
          descansoSegundos: 90,
          orden: selectedExercises.length + 1,
        },
      ]);
    }
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedExercises.length) return;

    const updated = [...selectedExercises];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    setSelectedExercises(updated.map((item, idx) => ({ ...item, orden: idx + 1 })));
  };

  const updateExerciseSets = (ejercicioId: number, delta: number) => {
    setSelectedExercises(
      selectedExercises.map((e) => {
        if (e.ejercicioId === ejercicioId) {
          const next = Math.max(1, Math.min(15, e.seriesObjetivo + delta));
          return { ...e, seriesObjetivo: next };
        }
        return e;
      })
    );
  };

  const setExerciseSetsDirect = (ejercicioId: number, val: number) => {
    const validVal = Math.max(1, Math.min(15, isNaN(val) ? 1 : val));
    setSelectedExercises(
      selectedExercises.map((e) => (e.ejercicioId === ejercicioId ? { ...e, seriesObjetivo: validVal } : e))
    );
  };

  const updateExerciseRest = (ejercicioId: number, descanso: number) => {
    setSelectedExercises(
      selectedExercises.map((e) => (e.ejercicioId === ejercicioId ? { ...e, descansoSegundos: descanso } : e))
    );
  };

  const handleSaveRoutine = () => {
    if (!nombre.trim() || selectedExercises.length === 0) return;

    const payload = {
      nombre: nombre.trim(),
      diaSugerido: diaSugerido === 'Flexible' ? undefined : diaSugerido,
      ejercicios: selectedExercises.map((e, idx) => ({
        ejercicioId: e.ejercicioId,
        orden: idx + 1,
        seriesObjetivo: e.seriesObjetivo,
        descansoSegundos: e.descansoSegundos,
      })),
    };

    if (modalMode === 'create') {
      onCreateRoutine(payload);
    } else if (modalMode === 'edit' && editingRoutineId !== null) {
      onUpdateRoutine(editingRoutineId, {
        ...payload,
        activa: true,
      });
    }

    closeModal();
  };

  const filteredCatalog = ejerciciosCatalogo.filter((e) => {
    const matchGrupo = selectedGrupo === 'Todos' || e.grupoMuscular.toLowerCase() === selectedGrupo.toLowerCase();
    const matchSearch =
      !searchExercise.trim() ||
      e.nombre.toLowerCase().includes(searchExercise.toLowerCase()) ||
      e.grupoMuscular.toLowerCase().includes(searchExercise.toLowerCase());
    return matchGrupo && matchSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Mis Rutinas
          </h2>
          <p className="text-xs text-gray-400">
            {rutinas.length} plantillas de entrenamiento configuradas
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Rutina</span>
        </button>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {rutinas.map((rutina) => {
          const muscleGroups = Array.from(new Set(rutina.ejercicios.map((e) => e.grupoMuscular)));

          return (
            <div
              key={rutina.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#131B26] border border-[#1F2C3F] hover:border-[#2D3E56] shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {rutina.diaSugerido ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1D293A] text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rutina.diaSugerido}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#182333] text-gray-400 border border-[#25364D]">
                      Flexible
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-medium ml-auto">
                    {rutina.ejercicios.length} ejercicios
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  {rutina.nombre}
                </h3>

                {/* Muscle Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {muscleGroups.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1A2433] border border-[#26354A] text-gray-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Exercises list preview */}
                <ul className="space-y-1.5 text-xs text-gray-400 mb-4 pl-1">
                  {rutina.ejercicios.map((e, idx) => (
                    <li key={e.id || idx} className="flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-gray-300">
                        {idx + 1}. {e.ejercicioNombre}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-tabular text-gray-500 shrink-0">
                        <span>{e.seriesObjetivo} sets</span>
                        {e.descansoSegundos && (
                          <span className="text-cyan-400/80">{e.descansoSegundos}s</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons Bottom */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#1F2C3F]/60">
                <button
                  onClick={() => onStartRoutine(rutina.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-300" />
                  <span>Entrenar</span>
                </button>

                <button
                  onClick={() => openEditModal(rutina)}
                  className="p-2.5 rounded-xl bg-[#182333] hover:bg-cyan-500/20 border border-[#25364D] hover:border-cyan-500/40 text-gray-400 hover:text-cyan-400 transition-all cursor-pointer"
                  title="Editar rutina"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`¿Seguro que deseas eliminar la rutina "${rutina.nombre}"?`)) {
                      onDeleteRoutine(rutina.id);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-[#182333] hover:bg-rose-500/20 border border-[#25364D] hover:border-rose-500/40 text-gray-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Eliminar rutina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Wizard: Paso 1 y Paso 2 */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#101724] border border-[#1F2C3F] rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col">
            
            {/* Modal Header with Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2C3F] mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  {modalMode === 'create' ? <Plus className="w-5 h-5 text-emerald-400" /> : <Pencil className="w-5 h-5 text-cyan-400" />}
                  <span>{modalMode === 'create' ? 'Nueva Rutina' : 'Editar Rutina'}</span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${step === 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-500'}`}>
                    1. Selección ({selectedExercises.length})
                  </span>
                  <span className="text-gray-600">/</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${step === 2 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-500'}`}>
                    2. Ajuste de Sets & Descansos
                  </span>
                </div>
              </div>

              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#182333] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PASO 1: Identidad + Selección Cómoda de Ejercicios */}
            {step === 1 && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
                
                {/* Nombre & Día */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Nombre de la Rutina:</label>
                    <input
                      type="text"
                      placeholder="ej. Torso Pesado A, Pierna & Glúteo..."
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Día Sugerido:</label>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {DIAS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDiaSugerido(d)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                            diaSugerido === d
                              ? 'bg-emerald-500 text-black font-bold shadow-sm'
                              : 'bg-[#182333] text-gray-300 border border-[#25364D]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filtro y Buscador de Catálogo */}
                <div className="space-y-2 shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar ejercicios para agregar..."
                      value={searchExercise}
                      onChange={(e) => setSearchExercise(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182333] border border-[#25364D] text-white text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Muscle Category Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {GRUPOS_FILTRO.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrupo(g)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                          selectedGrupo === g
                            ? 'bg-emerald-500 text-black'
                            : 'bg-[#151D2A] border border-[#1E2A3C] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista Completa del Catálogo (Aprovechando todo el alto) */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-48">
                  {filteredCatalog.map((ej) => {
                    const isSelected = selectedExercises.some((s) => s.ejercicioId === ej.id);
                    return (
                      <button
                        key={ej.id}
                        type="button"
                        onClick={() => toggleExerciseSelection(ej.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                            : 'bg-[#151D2A] border-[#1E2A3C] text-gray-400 hover:text-white hover:border-[#2A3B52]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{ej.nombre}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">{ej.grupoMuscular}</span>
                        </div>

                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-[#2D3E56] bg-[#182333]'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Barra Inferior Fija del Paso 1 */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1F2C3F] shrink-0">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{selectedExercises.length} ejercicios seleccionados</span>
                  </span>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!nombre.trim() || selectedExercises.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 disabled:opacity-40 text-black text-xs font-black cursor-pointer shadow-lg shadow-emerald-950 transition-all"
                  >
                    <span>Continuar a Configurar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* PASO 2: Configuración Táctica Limpia (Sin catálogo estorbando) */}
            {step === 2 && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ajusta el orden, sets y tiempos de descanso:</span>
                  </p>
                  <span className="text-[11px] text-gray-500 font-medium">Usa las flechas para reordenar</span>
                </div>

                {/* Lista Limpia de Ejercicios Seleccionados */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-56">
                  {selectedExercises.map((config, index) => {
                    const ejInfo = ejerciciosCatalogo.find((e) => e.id === config.ejercicioId);
                    return (
                      <div
                        key={config.ejercicioId}
                        className="p-3.5 rounded-xl bg-[#151E2B] border border-[#223145] space-y-3"
                      >
                        {/* Row 1: Nombre + Reordenar + Eliminar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Reorder Up/Down */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveExercise(index, 'up')}
                                className="p-1 rounded bg-[#1C283A] text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Mover arriba"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === selectedExercises.length - 1}
                                onClick={() => moveExercise(index, 'down')}
                                className="p-1 rounded bg-[#1C283A] text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Mover abajo"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-white">
                                {index + 1}. {ejInfo?.nombre || 'Ejercicio'}
                              </p>
                              <span className="text-[10px] text-emerald-400 font-semibold">{ejInfo?.grupoMuscular}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExerciseSelection(config.ejercicioId)}
                            className="p-1.5 rounded-lg bg-[#182333] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Quitar ejercicio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Row 2: Stepped Sets Selector [- 3 +] + Rest Time Pills */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#1E2B3E]">
                          
                          {/* Sets Stepper Control */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-300">Series:</span>
                            <div className="flex items-center rounded-lg bg-[#1B2738] border border-[#2A3C54] p-0.5">
                              <button
                                type="button"
                                onClick={() => updateExerciseSets(config.ejercicioId, -1)}
                                className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#25364D] transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="number"
                                min={1}
                                max={15}
                                value={config.seriesObjetivo}
                                onChange={(e) => setExerciseSetsDirect(config.ejercicioId, parseInt(e.target.value))}
                                className="w-8 text-center bg-transparent text-white font-black text-xs outline-none font-tabular"
                              />

                              <button
                                type="button"
                                onClick={() => updateExerciseSets(config.ejercicioId, 1)}
                                className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#25364D] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Rest Time Quick Chips */}
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-[11px] font-bold text-gray-300">Descanso:</span>
                            <div className="flex items-center gap-1">
                              {DESCANSO_OPCIONES.map((seg) => (
                                <button
                                  key={seg}
                                  type="button"
                                  onClick={() => updateExerciseRest(config.ejercicioId, seg)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    config.descansoSegundos === seg
                                      ? 'bg-cyan-500 text-black shadow-sm font-black'
                                      : 'bg-[#182333] text-gray-400 border border-[#25364D] hover:text-white'
                                  }`}
                                >
                                  {seg}s
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Barra Inferior Fija del Paso 2 */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#1F2C3F] shrink-0 mt-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#182333] hover:bg-[#202E42] text-gray-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver</span>
                  </button>

                  <button
                    onClick={handleSaveRoutine}
                    disabled={!nombre.trim() || selectedExercises.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 disabled:opacity-40 text-black text-xs font-black cursor-pointer shadow-lg shadow-emerald-950 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{modalMode === 'create' ? 'Guardar Rutina' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
