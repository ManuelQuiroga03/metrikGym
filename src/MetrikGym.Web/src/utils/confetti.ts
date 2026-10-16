// High-performance Canvas Confetti Particle Engine for MetrikGym Celebrations
// Pure TypeScript, zero external dependencies, 60fps on mobile

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'strip';
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  decay: number;
}

const COLORS = [
  '#10B981', // Emerald
  '#34D399', // Light emerald
  '#06B6D4', // Cyan
  '#38BDF8', // Light sky
  '#F59E0B', // Amber / Gold
  '#FBBF24', // Yellow gold
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White shine
];

export const triggerWorkoutConfetti = () => {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];
  const particleCount = 180;
  const originX = width / 2;
  const originY = height * 0.42; // Center of screen where the Trophy is displayed

  // Radial 360 burst from the center + side sprays
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 4;
    const shapes: ('rect' | 'circle' | 'strip')[] = ['rect', 'circle', 'strip'];

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed * 0.8 - Math.random() * 4,
      size: Math.random() * 8 + 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      opacity: 1,
      decay: Math.random() * 0.007 + 0.005,
    });
  }

  // Add lower-left and lower-right cannons for massive festive stadium feel
  const sideCount = 70;
  for (let i = 0; i < sideCount; i++) {
    // Left cannon pointing up-right
    const leftAngle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    const leftSpeed = Math.random() * 16 + 8;
    particles.push({
      x: width * 0.1,
      y: height * 0.9,
      vx: Math.cos(leftAngle) * leftSpeed,
      vy: Math.sin(leftAngle) * leftSpeed,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: 'rect',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.1,
      opacity: 1,
      decay: Math.random() * 0.006 + 0.005,
    });

    // Right cannon pointing up-left
    const rightAngle = (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.4;
    const rightSpeed = Math.random() * 16 + 8;
    particles.push({
      x: width * 0.9,
      y: height * 0.9,
      vx: Math.cos(rightAngle) * rightSpeed,
      vy: Math.sin(rightAngle) * rightSpeed,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: 'rect',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.1,
      opacity: 1,
      decay: Math.random() * 0.006 + 0.005,
    });
  }

  let animationFrameId: number;

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity <= 0.01) continue;

      activeParticles++;

      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // Gravity
      p.vx *= 0.985; // Drag
      p.vy *= 0.985;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.opacity = Math.max(0, p.opacity - p.decay);

      // Render
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      const scaleX = Math.cos(p.wobble);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'strip') {
        ctx.fillRect(-p.size * 0.2, -p.size * 1.4 * scaleX, p.size * 0.4, p.size * 2.8);
      } else {
        ctx.fillRect(-p.size / 2, (-p.size / 2) * scaleX, p.size, p.size * scaleX);
      }

      ctx.restore();
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  };

  render();
};
