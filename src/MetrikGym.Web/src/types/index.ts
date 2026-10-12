export type GrupoMuscular = 
  | 'Pecho' 
  | 'Espalda' 
  | 'Hombro' 
  | 'Bíceps' 
  | 'Tríceps' 
  | 'Cuádriceps' 
  | 'Femoral' 
  | 'Glúteo' 
  | 'Aductores' 
  | 'Gemelos' 
  | 'Abdomen';

export interface Ejercicio {
  id: number;
  nombre: string;
  grupoMuscular: string;
  esUnilateral: boolean;
  esPersonalizado: boolean;
  usuarioId?: number | null;
}

export interface RutinaEjercicioItem {
  id: number;
  ejercicioId: number;
  ejercicioNombre: string;
  grupoMuscular: string;
  esUnilateral: boolean;
  orden: number;
  seriesObjetivo: number;
  descansoSegundos?: number | null;
}

export interface Rutina {
  id: number;
  usuarioId: number;
  nombre: string;
  diaSugerido?: string | null;
  activa: boolean;
  ejercicios: RutinaEjercicioItem[];
}

export interface SerieRegistro {
  id: number;
  sesionId: number;
  ejercicioId: number;
  ejercicioNombre: string;
  grupoMuscular: string;
  numeroSerie: number;
  pesoKg: number;
  repeticiones: number;
  pesoKgIzq?: number | null;
  repsIzq?: number | null;
  lado?: 'D' | 'I' | null;
  rpe?: number | null;
  completada?: boolean;
  completadaDer?: boolean;
  completadaIzq?: boolean;
}

export interface SesionEntrenamiento {
  id: number;
  usuarioId: number;
  rutinaId: number;
  rutinaNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin?: string | null;
  notas?: string | null;
  series: SerieRegistro[];
}

export interface UltimoRegistroEjercicio {
  ejercicioId: number;
  ejercicioNombre: string;
  fechaHora: string;
  pesoKg: number;
  repeticiones: number;
  rpe?: number | null;
  lado?: 'D' | 'I' | null;
}

export interface UserProfile {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  tiempoDescansoDefectoSegundos: number;
}
