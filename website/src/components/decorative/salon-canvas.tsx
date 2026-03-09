'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * 3D salon-themed canvas animation.
 * Floating scissors and bokeh light particles
 * rendered with perspective projection on a 2D canvas.
 *
 * Respects prefers-reduced-motion — falls back to static render.
 */

// Brand palette
const COLORS = {
  copper: { r: 196, g: 149, b: 110 },
  copperDark: { r: 181, g: 132, b: 95 },
  blush: { r: 237, g: 225, b: 220 },
  sage: { r: 154, g: 176, b: 142 },
  rose: { r: 185, g: 144, b: 127 },
  warm: { r: 181, g: 166, b: 154 },
  cream: { r: 254, g: 252, b: 250 },
};

const FOCAL_LENGTH = 400;

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface Scissors {
  x: number;
  y: number;
  z: number;
  rotation: number;
  rotationSpeed: number;
  openAngle: number;
  openSpeed: number;
  scale: number;
  drift: { x: number; y: number; phase: number };
  color: { r: number; g: number; b: number };
  opacity: number;
}

function project(x: number, y: number, z: number, cx: number, cy: number) {
  const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
  return {
    x: cx + (x - cx) * scale,
    y: cy + (y - cy) * scale,
    scale,
  };
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const colorOptions = [COLORS.copper, COLORS.blush, COLORS.sage, COLORS.rose, COLORS.cream];
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 500 - 100,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.2 - 0.1,
    vz: (Math.random() - 0.5) * 0.2,
    radius: Math.random() * 25 + 8,
    color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
    opacity: Math.random() * 0.25 + 0.15,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.005,
  }));
}

function createScissors(w: number, h: number): Scissors[] {
  const colorOptions = [COLORS.copper, COLORS.copperDark, COLORS.warm, COLORS.rose];
  return Array.from({ length: 5 }, (_, i) => ({
    x: w * (0.15 + Math.random() * 0.7),
    y: h * (0.1 + Math.random() * 0.8),
    z: i * 120 + Math.random() * 80,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.008,
    openAngle: 0.3,
    openSpeed: Math.random() * 0.015 + 0.005,
    scale: 0.6 + Math.random() * 0.5,
    drift: {
      x: (Math.random() - 0.5) * 0.4,
      y: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    },
    color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
    opacity: 0.3 + Math.random() * 0.2,
  }));
}

function drawScissors(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  openAngle: number,
  scale: number,
  color: { r: number; g: number; b: number },
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const strokeColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  const fillColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.15})`;

  // Top blade
  ctx.save();
  ctx.rotate(-openAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-3, -15, -2, -40, 2, -55);
  ctx.bezierCurveTo(5, -58, 8, -55, 6, -40);
  ctx.bezierCurveTo(4, -25, 5, -10, 0, 0);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Handle ring
  ctx.beginPath();
  ctx.ellipse(0, 18, 10, 12, 0, 0, Math.PI * 2);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.08})`;
  ctx.fill();
  ctx.restore();

  // Bottom blade
  ctx.save();
  ctx.rotate(openAngle);
  ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-3, -15, -2, -40, 2, -55);
  ctx.bezierCurveTo(5, -58, 8, -55, 6, -40);
  ctx.bezierCurveTo(4, -25, 5, -10, 0, 0);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 18, 10, 12, 0, 0, Math.PI * 2);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.08})`;
  ctx.fill();
  ctx.restore();

  // Pivot screw
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

export function SalonCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    particles: Particle[];
    scissors: Scissors[];
    time: number;
  } | null>(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = stateRef.current;
    if (!state) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    state.time += 1;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Soft radial gradient background wash
    const gradient = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy, Math.max(w, h) * 0.7);
    gradient.addColorStop(0, 'rgba(237, 225, 220, 0.15)');
    gradient.addColorStop(0.5, 'rgba(196, 149, 110, 0.08)');
    gradient.addColorStop(1, 'rgba(254, 252, 250, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Collect all renderable items with Z for depth sorting
    type Renderable = { z: number; draw: () => void };
    const renderQueue: Renderable[] = [];

    // Bokeh particles
    for (const p of state.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.pulse += p.pulseSpeed;

      // Wrap around
      if (p.x < -50) p.x = w + 50;
      if (p.x > w + 50) p.x = -50;
      if (p.y < -50) p.y = h + 50;
      if (p.y > h + 50) p.y = -50;
      if (p.z < -100) p.z = 500;
      if (p.z > 500) p.z = -100;

      const particle = p;
      renderQueue.push({
        z: p.z,
        draw: () => {
          const proj = project(particle.x, particle.y, particle.z, cx, cy);
          const r = particle.radius * proj.scale;
          const pulseOpacity = particle.opacity * (0.7 + 0.3 * Math.sin(particle.pulse));

          const grad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, r);
          grad.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${pulseOpacity})`);
          grad.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${pulseOpacity * 0.4})`);
          grad.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);

          ctx.beginPath();
          ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        },
      });
    }

    // Scissors
    for (const s of state.scissors) {
      s.rotation += s.rotationSpeed;
      s.openAngle = 0.15 + Math.sin(state.time * s.openSpeed) * 0.15;
      s.drift.phase += 0.01;
      s.x += Math.sin(s.drift.phase) * s.drift.x;
      s.y += Math.cos(s.drift.phase * 0.7) * s.drift.y;

      // Wrap
      if (s.x < -100) s.x = w + 100;
      if (s.x > w + 100) s.x = -100;
      if (s.y < -100) s.y = h + 100;
      if (s.y > h + 100) s.y = -100;

      const scissor = s;
      renderQueue.push({
        z: s.z,
        draw: () => {
          const proj = project(scissor.x, scissor.y, scissor.z, cx, cy);
          drawScissors(
            ctx,
            proj.x,
            proj.y,
            scissor.rotation,
            scissor.openAngle,
            scissor.scale * proj.scale,
            scissor.color,
            scissor.opacity * proj.scale
          );
        },
      });
    }

    // Sort back-to-front and render
    renderQueue.sort((a, b) => b.z - a.z);
    for (const item of renderQueue) {
      item.draw();
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      stateRef.current = {
        particles: createParticles(rect.width, rect.height, 35),
        scissors: createScissors(rect.width, rect.height),
        time: 0,
      };
    };

    resize();
    window.addEventListener('resize', resize);

    if (!prefersReduced) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    />
  );
}
