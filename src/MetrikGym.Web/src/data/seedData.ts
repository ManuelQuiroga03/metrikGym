import type { Ejercicio, Rutina, SesionEntrenamiento } from '../types';
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

// Historial ficticio profesional para el perfil de Reclutador / Invitado
export const HISTORIAL_DEMO_RECLUTADOR: SesionEntrenamiento[] = [
  {
    id: 9001,
    usuarioId: 999,
    rutinaId: 999,
    rutinaNombre: 'Torso Fuerza A (Demostración)',
    fechaHoraInicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
    fechaHoraFin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000).toISOString(),
    notas: 'Excelente sesión de prueba para evaluar progresión y métricas.',
    series: [
      {
        id: 9101,
        sesionId: 9001,
        ejercicioId: 82,
        ejercicioNombre: 'Press plano con barra',
        grupoMuscular: 'Pecho',
        numeroSerie: 1,
        pesoKg: 70,
        repeticiones: 10,
        rpe: 8.0,
        completada: true,
      },
      {
        id: 9102,
        sesionId: 9001,
        ejercicioId: 82,
        ejercicioNombre: 'Press plano con barra',
        grupoMuscular: 'Pecho',
        numeroSerie: 2,
        pesoKg: 75,
        repeticiones: 8,
        rpe: 8.5,
        completada: true,
      },
      {
        id: 9103,
        sesionId: 9001,
        ejercicioId: 82,
        ejercicioNombre: 'Press plano con barra',
        grupoMuscular: 'Pecho',
        numeroSerie: 3,
        pesoKg: 80,
        repeticiones: 6,
        rpe: 9.0,
        completada: true,
      },
      {
        id: 9104,
        sesionId: 9001,
        ejercicioId: 98,
        ejercicioNombre: 'Jalón al pecho con agarre neutro',
        grupoMuscular: 'Espalda',
        numeroSerie: 1,
        pesoKg: 60,
        repeticiones: 10,
        rpe: 8.0,
        completada: true,
      },
      {
        id: 9105,
        sesionId: 9001,
        ejercicioId: 98,
        ejercicioNombre: 'Jalón al pecho con agarre neutro',
        grupoMuscular: 'Espalda',
        numeroSerie: 2,
        pesoKg: 65,
        repeticiones: 9,
        rpe: 8.5,
        completada: true,
      },
    ],
  },
];
