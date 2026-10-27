// Conversor de peso de alta precisión para MetrikGym (KG <-> LBS)
// Adaptado a la calibración estándar de discos y mancuernas de gimnasio

export type WeightUnit = 'kg' | 'lbs';

export const LBS_PER_KG = 2.20462262;

/**
 * Convierte un valor de peso numérico entre KG y LBS.
 * Redondea inteligentemente al múltiplo de 0.5 más cercano.
 */
export const convertWeight = (
  value: number | null | undefined,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number => {
  if (value === null || value === undefined || isNaN(value) || value <= 0) {
    return 0;
  }
  if (fromUnit === toUnit) {
    return value;
  }

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    // 1 kg = 2.20462 lbs -> redondeo al múltiplo de 0.5 lbs más cercano
    return Math.round(value * LBS_PER_KG * 2) / 2;
  } else {
    // 1 lb = 0.45359 kg -> redondeo al múltiplo de 0.5 kg más cercano
    return Math.round((value / LBS_PER_KG) * 2) / 2;
  }
};

/**
 * Formatea un valor numérico con su unidad.
 */
export const formatWeight = (value: number, unit: WeightUnit): string => {
  return `${value} ${unit}`;
};
