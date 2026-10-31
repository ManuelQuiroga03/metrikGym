// Utilidad de sintetizador de audio puro con Web Audio API (100% offline y sin assets externos)

export type TonoAlerta = 'beep' | 'boxing' | 'gong' | 'chime' | 'mute';

export const TONOS_DISPONIBLES: Array<{ id: TonoAlerta; label: string; descripcion: string }> = [
  { id: 'beep', label: 'Beep Triple Deportivo', descripcion: '3 pulsos agudos claros y concisos (880 Hz)' },
  { id: 'boxing', label: 'Campana de Boxeo', descripcion: 'Golpe metálico resonante de alta energía' },
  { id: 'gong', label: 'Gong Zen / Armónico', descripcion: 'Tono grave envolvente y relajante (220 Hz)' },
  { id: 'chime', label: 'Chime Triada Ascendente', descripcion: 'Secuencia melódica de 3 notas (Do-Mi-Sol)' },
  { id: 'mute', label: 'Silencioso (Solo Vibración)', descripcion: 'Sin sonido, ideal si escuchas música' },
];

// Instancia compartida para evitar bloqueos de autoplay en navegadores móviles
let sharedAudioContext: AudioContext | null = null;

export function initAudioContext() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!sharedAudioContext) {
        sharedAudioContext = new AudioCtx();
      }
      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume();
      }
    }
  } catch (err) {
    console.warn('[AudioSynthesizer] Error inicializando AudioContext:', err);
  }
}

export function playRestAlert(tone: TonoAlerta = 'beep', soundEnabled: boolean = true) {
  // Vibración háptica siempre que el dispositivo lo soporte
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300]);
    } catch {
      // Ignorar si el navegador no permite vibración en segundo plano
    }
  }

  if (!soundEnabled || tone === 'mute') return;

  try {
    initAudioContext();
    const ctx = sharedAudioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (tone === 'beep') {
      // 3 beeps cortos consecutivos
      [0, 0.15, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.09);
      });
    } else if (tone === 'boxing') {
      // Campana de boxeo con armónicos metálicos
      const baseFreq = 587.33; // D5
      [1, 2.76, 5.4].forEach((harmonic, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq * harmonic, ctx.currentTime);
        const initialGain = 0.4 / (i + 1);
        gain.gain.setValueAtTime(initialGain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.4);
      });
    } else if (tone === 'gong') {
      // Gong profundo a 220Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.0);
    } else if (tone === 'chime') {
      // Chime C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const delay = index * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.4);
      });
    }
  } catch (err) {
    console.warn('[AudioSynthesizer] No se pudo reproducir el tono de descanso:', err);
  }
}
