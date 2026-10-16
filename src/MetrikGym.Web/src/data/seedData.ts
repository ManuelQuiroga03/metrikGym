import type { Ejercicio, Rutina } from '../types';
import rawEjercicios from './ejercicios_raw.json';
import rawRutinas from './rutinas_raw.json';

// Mapeo seguro de los 80 ejercicios oficiales
export const CATALOGO_EJERCICIOS: Ejercicio[] = (rawEjercicios as any[]).map((e) => ({
  id: e.Id,
  nombre: e.Nombre,
  grupoMuscular: e.GrupoMuscular,
  esUnilateral: Boolean(e.EsUnilateral),
  esPersonalizado: false,
  usuarioId: null,
}));

const ejercicioMap = new Map<number, Ejercicio>(
  CATALOGO_EJERCICIOS.map((e) => [e.id, e])
);

// Mapeo seguro de las 4 rutinas activas de Milo
export const RUTINAS_MILO: Rutina[] = (rawRutinas as any[]).map((r) => ({
  id: r.Id,
  usuarioId: r.UsuarioId,
  nombre: r.Nombre,
  diaSugerido: r.DiaSugerido,
  activa: Boolean(r.Activa),
  ejercicios: (r.RutinaEjercicios || []).map((re: any) => {
    const ej = ejercicioMap.get(re.EjercicioId);
    return {
      id: re.Id,
      ejercicioId: re.EjercicioId,
      ejercicioNombre: ej?.nombre || 'Ejercicio',
      grupoMuscular: ej?.grupoMuscular || 'General',
      esUnilateral: ej?.esUnilateral ?? false,
      orden: re.Orden,
      seriesObjetivo: re.SeriesObjetivo,
      descansoSegundos: re.DescansoSegundos || 180,
    };
  }),
}));

// Rutina demo para el perfil de Reclutador / Invitado
export const RUTINA_DEMO_RECLUTADOR: Rutina[] = [
  {
    id: 999,
    usuarioId: 999,
    nombre: 'Torso Fuerza A (Demostración)',
    diaSugerido: 'Lunes',
    activa: true,
    ejercicios: [
      {
        id: 1001,
        ejercicioId: 82, // Press plano con barra
        ejercicioNombre: 'Press plano con barra',
        grupoMuscular: 'Pecho',
        esUnilateral: false,
        orden: 1,
        seriesObjetivo: 3,
        descansoSegundos: 120,
      },
      {
        id: 1002,
        ejercicioId: 98, // Jalón neutro
        ejercicioNombre: 'Jalón al pecho con agarre neutro',
        grupoMuscular: 'Espalda',
        esUnilateral: false,
        orden: 2,
        seriesObjetivo: 3,
        descansoSegundos: 120,
      },
      {
        id: 1003,
        ejercicioId: 107, // Press militar
        ejercicioNombre: 'Press militar con barra de pie/sentado',
        grupoMuscular: 'Hombro',
        esUnilateral: false,
        orden: 3,
        seriesObjetivo: 3,
        descansoSegundos: 90,
      },
      {
        id: 1004,
        ejercicioId: 118, // Curl alterno
        ejercicioNombre: 'Curl alterno con mancuernas',
        grupoMuscular: 'Bíceps',
        esUnilateral: true,
        orden: 4,
        seriesObjetivo: 3,
        descansoSegundos: 60,
      },
    ],
  },
];
