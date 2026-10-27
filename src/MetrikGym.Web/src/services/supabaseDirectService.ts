// Cliente directo de sincronización a Supabase vía REST API (PostgREST)
// No depende de Render. Conexión directa y ultra rápida a la nube cuando hay red.
import type { SesionEntrenamiento } from '../types';
import { storageService } from './storageService';

const SUPABASE_URL = 'https://suifqcukrcvhjwsuadhw.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWZxY3VrcmN2aGp3c3VhZGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjE5MzUsImV4cCI6MjEwNzM5NzkzNX0.Gr8u4GFRL-wU9li8bUuQ0rUslEcEzxQmyZrHcHD2W90';

const DEFAULT_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

export const supabaseDirectService = {
  /**
   * Sincroniza todas las sesiones pendientes del búfer local directo a Supabase.
   * Retorna el número de sesiones exitosamente guardadas.
   */
  async syncOutboxToSupabase(): Promise<{ syncedCount: number; errors: string[] }> {
    const queue = storageService.getOutbox();
    if (queue.length === 0) {
      return { syncedCount: 0, errors: [] };
    }

    const errors: string[] = [];
    const remainingSessions: SesionEntrenamiento[] = [];
    let syncedCount = 0;

    for (const sesion of queue) {
      try {
        // 1. Insertar la Sesión en public."SesionesEntrenamiento"
        const sesionPayload = {
          UsuarioId: 2, // Milo Admin
          RutinaId: sesion.rutinaId && sesion.rutinaId > 0 ? sesion.rutinaId : null,
          FechaHoraInicio: sesion.fechaHoraInicio,
          FechaHoraFin: sesion.fechaHoraFin || new Date().toISOString(),
          Notas: sesion.notas ? sesion.notas.trim() : null,
        };

        const sesionRes = await fetch(`${SUPABASE_URL}/SesionesEntrenamiento`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(sesionPayload),
        });

        if (!sesionRes.ok) {
          const errText = await sesionRes.text();
          throw new Error(`Error al crear sesión en Supabase: ${errText}`);
        }

        const createdSesionArray = await sesionRes.json();
        const createdSesionId = createdSesionArray[0]?.Id;

        if (!createdSesionId) {
          throw new Error('Supabase no retornó el Id de la sesión creada.');
        }

        // 2. Insertar las Series completadas en public."SeriesRegistro"
        const completedSeries = (sesion.series || []).filter((s) => s.completada);
        if (completedSeries.length > 0) {
          const seriesPayload = completedSeries.map((s) => ({
            SesionId: createdSesionId,
            EjercicioId: s.ejercicioId,
            NumeroSerie: s.numeroSerie,
            PesoKg: Number(s.pesoKg || 0),
            Repeticiones: Number(s.repeticiones || 0),
            Lado: s.lado ? s.lado.toUpperCase() : null,
            RPE: s.rpe ? Number(s.rpe) : null,
          }));

          const seriesRes = await fetch(`${SUPABASE_URL}/SeriesRegistro`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(seriesPayload),
          });

          if (!seriesRes.ok) {
            const errText = await seriesRes.text();
            throw new Error(`Error al insertar series: ${errText}`);
          }
        }

        syncedCount++;
      } catch (err: any) {
        errors.push(err.message || 'Error desconocido en sincronización');
        remainingSessions.push(sesion);
      }
    }

    // Actualizar búfer con las que hayan fallado (si todas pasaron, el búfer queda en 0)
    if (remainingSessions.length > 0) {
      localStorage.setItem('metrikgym_offline_outbox', JSON.stringify(remainingSessions));
    } else {
      storageService.clearOutbox();
    }

    return { syncedCount, errors };
  },

  /**
   * Descarga el historial real del usuario desde Supabase PostgREST
   */
  async fetchUserHistoryFromSupabase(userId: number = 2): Promise<SesionEntrenamiento[]> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/SesionesEntrenamiento?UsuarioId=eq.${userId}&select=*,SeriesRegistro(*),Rutinas(Nombre)&order=FechaHoraInicio.desc`,
        {
          method: 'GET',
          headers: DEFAULT_HEADERS,
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((s: any) => ({
        id: s.Id,
        usuarioId: s.UsuarioId,
        rutinaId: s.RutinaId,
        rutinaNombre: s.Rutinas?.Nombre || 'Entrenamiento',
        fechaHoraInicio: s.FechaHoraInicio,
        fechaHoraFin: s.FechaHoraFin,
        notas: s.Notas,
        series: (s.SeriesRegistro || []).map((sr: any) => ({
          id: sr.Id,
          sesionId: s.Id,
          ejercicioId: sr.EjercicioId,
          numeroSerie: sr.NumeroSerie,
          pesoKg: sr.PesoKg,
          repeticiones: sr.Repeticiones,
          lado: sr.Lado,
          rpe: sr.RPE,
          completada: true,
        })),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Genera el script SQL puro INSERT INTO por si Milo prefiere copiar y pegar en Supabase SQL Editor.
   */
  generateSqlInsertsFromOutbox(): string {
    const queue = storageService.getOutbox();
    if (queue.length === 0) return '-- No hay sesiones pendientes en el búfer local.';

    let sql = `-- Script de respaldo generado por MetrikGym (${new Date().toLocaleString()})\n`;
    sql += `START TRANSACTION;\n\n`;

    queue.forEach((sesion, idx) => {
      const varName = `nueva_sesion_${idx + 1}`;
      const rutinaVal = sesion.rutinaId && sesion.rutinaId > 0 ? sesion.rutinaId : 'NULL';
      const notasVal = sesion.notas ? `'${sesion.notas.replace(/'/g, "''")}'` : 'NULL';

      sql += `-- Sesión ${idx + 1}: ${sesion.rutinaNombre || 'Entrenamiento'}\n`;
      sql += `INSERT INTO "SesionesEntrenamiento" ("UsuarioId", "RutinaId", "FechaHoraInicio", "FechaHoraFin", "Notas")\n`;
      sql += `VALUES (2, ${rutinaVal}, '${sesion.fechaHoraInicio}', '${sesion.fechaHoraFin || new Date().toISOString()}', ${notasVal})\n`;
      sql += `RETURNING "Id" INTO ${varName};\n\n`;

      const completedSeries = (sesion.series || []).filter((s) => s.completada);
      if (completedSeries.length > 0) {
        sql += `INSERT INTO "SeriesRegistro" ("SesionId", "EjercicioId", "NumeroSerie", "PesoKg", "Repeticiones", "Lado", "RPE") VALUES\n`;
        const valuesArr = completedSeries.map((s) => {
          const ladoVal = s.lado ? `'${s.lado}'` : 'NULL';
          const rpeVal = s.rpe ? s.rpe : 'NULL';
          return `(${varName}, ${s.ejercicioId}, ${s.numeroSerie}, ${s.pesoKg}, ${s.repeticiones}, ${ladoVal}, ${rpeVal})`;
        });
        sql += valuesArr.join(',\n') + ';\n\n';
      }
    });

    sql += `COMMIT;\n`;
    return sql;
  },
};
