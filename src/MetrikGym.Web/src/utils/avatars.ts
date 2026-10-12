export interface AvatarOption {
  id: string;
  name: string;
  category: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  symbol: string;
}

export const AVATARES_PREDISEÑADOS: AvatarOption[] = [
  {
    id: 'power-beast',
    name: 'Fuerza / Power',
    category: 'Fuerza',
    bgGradient: 'from-emerald-600 to-teal-900',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-200',
    symbol: 'PWR',
  },
  {
    id: 'cyber-hybrid',
    name: 'Cyber Atleta',
    category: 'Híbrido',
    bgGradient: 'from-cyan-500 to-blue-900',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-200',
    symbol: 'CYB',
  },
  {
    id: 'hypertrophy-pro',
    name: 'Hipertrofia Pro',
    category: 'Culturismo',
    bgGradient: 'from-purple-600 to-indigo-950',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-200',
    symbol: 'HYP',
  },
  {
    id: 'solar-energy',
    name: 'Solar Beast',
    category: 'Energía',
    bgGradient: 'from-amber-500 to-orange-950',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-200',
    symbol: 'SOL',
  },
  {
    id: 'spartan-iron',
    name: 'Espartano / Hierro',
    category: 'Fuerza',
    bgGradient: 'from-rose-600 to-stone-900',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-200',
    symbol: 'SPN',
  },
  {
    id: 'minimal-zen',
    name: 'Titanio Minimal',
    category: 'Minimalista',
    bgGradient: 'from-gray-500 to-gray-900',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-200',
    symbol: 'ZEN',
  },
];
