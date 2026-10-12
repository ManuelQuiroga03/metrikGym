import React, { useState, useMemo } from 'react';
import { Plus, Search, Dumbbell, Sparkles, AlertCircle, Pencil, Trash2, Globe, ShieldCheck, X } from 'lucide-react';
import type { Ejercicio, GrupoMuscular } from '../../types';
import { findSimilarExercises } from '../../utils/similarity';

interface ExercisesManagerProps {
  ejercicios: Ejercicio[];
  userRole?: string;
  currentUserId?: number;
  onCreateEjercicio: (data: { nombre: string; grupoMuscular: string; esUnilateral: boolean; crearComoGlobal?: boolean }) => void;
  onUpdateEjercicio: (id: number, data: { nombre: string; grupoMuscular: string; esUnilateral: boolean }) => void;
  onDeleteEjercicio: (id: number) => void;
  onPromoteEjercicio?: (id: number) => void;
}

const GRUPOS: Array<GrupoMuscular | 'Todos'> = [
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

const VARIANTES_COMUNES = [
  'Agarre Cerrado',
  'Agarre Neutro',
  'Agarre Ancho',
  'Con Pausa 2s',
  'Inclinado 30°',
  'En Banco Declinado',
  'Con Bandas Elásticas',
  'Unilateral Alterno',
];

export const ExercisesManager: React.FC<ExercisesManagerProps> = ({
  ejercicios,
  userRole = 'Admin',
  currentUserId = 1,
  onCreateEjercicio,
  onUpdateEjercicio,
  onDeleteEjercicio,
  onPromoteEjercicio,
}) => {
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoMuscular | 'Todos'>('Todos');
  const [filterOrigin, setFilterOrigin] = useState<'all' | 'custom' | 'global'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState<GrupoMuscular>('Pecho');
  const [esUnilateral, setEsUnilateral] = useState(false);
  const [crearComoGlobal, setCrearComoGlobal] = useState(false);

  const isAdmin = userRole === 'Admin';

  // Detección en vivo de similitud / duplicados (solo en modo create)
  const similarMatches = useMemo(() => {
    if (modalMode !== 'create' || !nombre.trim()) return [];
    return findSimilarExercises(nombre, ejercicios, 0.4);
  }, [nombre, ejercicios, modalMode]);

  const filteredEjercicios = useMemo(() => {
    return ejercicios.filter((ej) => {
      const matchGrupo = selectedGrupo === 'Todos' || ej.grupoMuscular.toLowerCase() === selectedGrupo.toLowerCase();
      const matchOrigin =
        filterOrigin === 'all' ||
        (filterOrigin === 'custom' && ej.esPersonalizado) ||
        (filterOrigin === 'global' && !ej.esPersonalizado);
      const matchSearch =
        !searchTerm.trim() ||
        ej.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ej.grupoMuscular.toLowerCase().includes(searchTerm.toLowerCase());

      return matchGrupo && matchOrigin && matchSearch;
    });
  }, [ejercicios, selectedGrupo, filterOrigin, searchTerm]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setNombre('');
    setGrupo('Pecho');
    setEsUnilateral(false);
    setCrearComoGlobal(isAdmin);
  };

  const openEditModal = (ej: Ejercicio) => {
    setModalMode('edit');
    setEditingId(ej.id);
    setNombre(ej.nombre);
    setGrupo((ej.grupoMuscular as GrupoMuscular) || 'Pecho');
    setEsUnilateral(ej.esUnilateral);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const handleAppendVariant = (tag: string) => {
    if (nombre.includes(tag)) return;
    setNombre(`${nombre.trim()} (${tag})`.trim());
  };

  const handleSave = () => {
    if (!nombre.trim()) return;

    if (modalMode === 'create') {
      onCreateEjercicio({
        nombre: nombre.trim(),
        grupoMuscular: grupo,
        esUnilateral,
        crearComoGlobal: isAdmin && crearComoGlobal,
      });
    } else if (modalMode === 'edit' && editingId !== null) {
      onUpdateEjercicio(editingId, {
        nombre: nombre.trim(),
        grupoMuscular: grupo,
        esUnilateral,
      });
    }

    closeModal();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Biblioteca de Ejercicios
          </h2>
          <p className="text-xs text-gray-400">
            {ejercicios.length} ejercicios registrados en tu base de datos
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Ejercicio</span>
        </button>
      </div>

      {/* Search & Origin Filter Bar */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre (ej. Press, Curl, Remo, Sentadilla)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131B26] border border-[#1F2C3F] text-white text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {/* Origin Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOrigin('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterOrigin === 'all'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-[#131B26] border-[#1F2C3F] text-gray-400'
            }`}
          >
            Todos ({ejercicios.length})
          </button>
          <button
            onClick={() => setFilterOrigin('global')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterOrigin === 'global'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-[#131B26] border-[#1F2C3F] text-gray-400'
            }`}
          >
            Catálogo Global ({ejercicios.filter((e) => !e.esPersonalizado).length})
          </button>
          <button
            onClick={() => setFilterOrigin('custom')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterOrigin === 'custom'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-[#131B26] border-[#1F2C3F] text-gray-400'
            }`}
          >
            Mis Ejercicios ({ejercicios.filter((e) => e.esPersonalizado).length})
          </button>
        </div>

        {/* Muscle Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {GRUPOS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrupo(g)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedGrupo === g
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'bg-[#131B26] border border-[#1F2C3F] text-gray-400 hover:text-gray-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEjercicios.map((ej) => {
          const canEdit = isAdmin || (ej.esPersonalizado && ej.usuarioId === currentUserId);

          return (
            <div
              key={ej.id}
              className="p-4 rounded-2xl bg-[#131B26] border border-[#1F2C3F] hover:border-[#2A3B52] shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#182333] border border-[#26374D] text-emerald-400 uppercase tracking-wider">
                    {ej.grupoMuscular}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {ej.esUnilateral && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                        Unilateral (D/I)
                      </span>
                    )}
                    {ej.esPersonalizado ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Custom</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" />
                        <span>Oficial</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight mb-2">
                  {ej.nombre}
                </h3>
              </div>

              {/* Card Footer: Metadata & Actions */}
              <div className="mt-3 pt-2.5 border-t border-[#1F2C3F]/60 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>ID #{ej.id}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* SuperAdmin: Promover a Global */}
                  {isAdmin && ej.esPersonalizado && onPromoteEjercicio && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Promover "${ej.nombre}" como ejercicio global oficial?`)) {
                          onPromoteEjercicio(ej.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-[#182333] hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 border border-[#25364D] hover:border-emerald-500/40 transition-all cursor-pointer"
                      title="Promover a Catálogo Oficial Global"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Edit Button */}
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(ej)}
                      className="p-1.5 rounded-lg bg-[#182333] hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 border border-[#25364D] hover:border-cyan-500/40 transition-all cursor-pointer"
                      title="Editar ejercicio"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Button */}
                  {canEdit && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Seguro que deseas eliminar "${ej.nombre}"?`)) {
                          onDeleteEjercicio(ej.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-[#182333] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-[#25364D] hover:border-rose-500/40 transition-all cursor-pointer"
                      title="Eliminar ejercicio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEjercicios.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#131B26] border border-[#1F2C3F] text-center">
          <Dumbbell className="w-10 h-10 text-gray-500 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-white mb-1">No se encontraron ejercicios</p>
          <p className="text-xs text-gray-400">
            Intenta con otro término de búsqueda o crea uno nuevo.
          </p>
        </div>
      )}

      {/* Modal: Crear o Editar Ejercicio */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101724] border border-[#1F2C3F] rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2C3F] mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {modalMode === 'create' ? <Plus className="w-5 h-5 text-emerald-400" /> : <Pencil className="w-5 h-5 text-cyan-400" />}
                <span>{modalMode === 'create' ? 'Crear Nuevo Ejercicio' : 'Editar Ejercicio'}</span>
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
              {/* Nombre del Ejercicio */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Nombre del Ejercicio:
                </label>
                <input
                  type="text"
                  placeholder="ej. Press Francés con Mancuernas en Banco Inclinado..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* Detector de Similitud / Alerta Anti-Duplicados */}
              {similarMatches.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Se encontraron ejercicios muy similares en el catálogo:</span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {similarMatches.slice(0, 3).map((match) => (
                      <div
                        key={match.ejercicio.id}
                        className="p-2 rounded-lg bg-[#141C28] border border-[#212E42] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{match.ejercicio.nombre}</p>
                          <p className="text-[10px] text-emerald-400">{match.ejercicio.grupoMuscular}</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 font-tabular">
                          {Math.round(match.score * 100)}% similar
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400">
                    💡 Si se trata de una variante menor, puedes seleccionarla abajo para adjuntarla al nombre:
                  </p>
                </div>
              )}

              {/* Tags Rápidos de Variantes */}
              {modalMode === 'create' && (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Variantes de técnica sugeridas:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIANTES_COMUNES.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleAppendVariant(v)}
                        className="px-2.5 py-1 rounded-lg bg-[#182333] hover:bg-[#223147] border border-[#25364D] text-xs text-gray-300 hover:text-emerald-400 transition-all cursor-pointer"
                      >
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grupo Muscular */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Grupo Muscular Principal:
                </label>
                <select
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value as GrupoMuscular)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#182333] border border-[#25364D] text-white text-sm outline-none focus:border-emerald-500"
                >
                  {GRUPOS.filter((g) => g !== 'Todos').map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Switch Unilateral */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#182333] border border-[#25364D]">
                <div>
                  <p className="text-xs font-bold text-white">¿Es ejercicio unilateral?</p>
                  <p className="text-[11px] text-gray-400">Permite registrar pesos por extremidad (Derecho / Izquierdo)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEsUnilateral(!esUnilateral)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    esUnilateral ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      esUnilateral ? 'left-6.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Checkbox Admin: Guardar como Global */}
              {isAdmin && modalMode === 'create' && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#182333] border border-blue-500/30">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>Publicar en Catálogo Global</span>
                    </p>
                    <p className="text-[11px] text-gray-400">Estará disponible para todos los usuarios de MetrikGym</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={crearComoGlobal}
                    onChange={(e) => setCrearComoGlobal(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1F2C3F]">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl bg-[#182333] text-gray-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!nombre.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 disabled:opacity-40 text-black text-xs font-black cursor-pointer shadow-lg shadow-emerald-950"
              >
                {modalMode === 'create' ? 'Guardar Ejercicio' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
