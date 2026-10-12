import type { Ejercicio } from '../types';

// Normaliza texto removiendo acentos, signos y palabras vacías del gimnasio
export function normalizeExerciseName(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\b(con|de|en|el|la|los|las|un|una|para|por)\b/g, '') // Quitar conectores
    .replace(/[^a-z0-9\s]/g, '') // Quitar caracteres especiales
    .replace(/\s+/g, ' ')
    .trim();
}

// Calcula similitud de Jaccard y Levenshtein combinada (0.0 a 1.0)
export function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeExerciseName(str1);
  const norm2 = normalizeExerciseName(str2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const words1 = new Set(norm1.split(' ').filter(Boolean));
  const words2 = new Set(norm2.split(' ').filter(Boolean));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  const jaccard = intersection.size / union.size;

  // Si uno contiene al otro completamente, aumentamos la coincidencia
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return Math.max(jaccard, 0.75);
  }

  return jaccard;
}

export interface SimilarityMatch {
  ejercicio: Ejercicio;
  score: number; // 0.0 a 1.0
}

export function findSimilarExercises(
  query: string,
  catalog: Ejercicio[],
  minThreshold: number = 0.45
): SimilarityMatch[] {
  if (!query || query.trim().length < 3) return [];

  const matches: SimilarityMatch[] = [];

  catalog.forEach((ej) => {
    const score = calculateSimilarity(query, ej.nombre);
    if (score >= minThreshold) {
      matches.push({ ejercicio: ej, score });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}
