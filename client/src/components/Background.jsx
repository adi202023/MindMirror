import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// MindMirror Background — "Living Brain"
//
// Layers (bottom → top):
//   1. Deep space star field with twinkling
//   2. EEG brainwaves (Alpha/Beta/Gamma/Theta/Delta) scrolling across screen
//   3. Neural mesh — drifting nodes with connecting edges
//   4. Synaptic pulse travelers — particles that travel along edges, nodes glow on arrival
//   5. Framer Motion aurora orbs (soft ambient blobs)
//   6. Vignette edges
// ─────────────────────────────────────────────────────────────────────────────

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;
    let rafId;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ─── LAYER 1: STARS ──────────────────────────────────────────────────────
    const STAR_COUNT = 160;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     0.3 + Math.random() * 1.4,
      base:  0.08 + Math.random() * 0.55,
      speed: 0.4  + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
    }));

    // ─── LAYER 2: NEURAL NODES ──────────────────────────────────────────────
    const NODE_COUNT = 52;
    const LINK_DIST  = 155;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,
      vx:  (Math.random() - 0.5) * 0.28,
      vy:  (Math.random() - 0.5) * 0.28,
      r:    1.4 + Math.random() * 2,
      glow: 0,  // 0→1, bursts when a synapse arrives
    }));

    // ─── LAYER 4: SYNAPTIC PULSE TRAVELERS ─────────────────────────────────
    const SYNAPSE_COLORS = [
      [167, 139, 250],  // lavender
      [45,  212, 191],  // teal
      [192, 132, 252],  // pink-purple
      [99,  102, 241],  // indigo
      [255, 255, 255],  // white spark
    ];

    const SYNAPSE_COUNT = 16;
    const synapses = Array.from({ length: SYNAPSE_COUNT }, (_, i) => {
      const fromIdx = Math.floor(Math.random() * NODE_COUNT);
      return {
        fromIdx,
        toIdx:    (fromIdx + 1 + Math.floor(Math.random() * (NODE_COUNT - 1))) % NODE_COUNT,
        progress: Math.random(),
        speed:    0.003 + Math.random() * 0.007,
        color:    SYNAPSE_COLORS[i % SYNAPSE_COLORS.length],
        size:     2.2  + Math.random() * 2,
        trail:    [],
      };
    });

    const getNextTarget = (fromIdx) => {
      const connected = [];
      for (let ni = 0; ni < nodes.length; ni++) {
        if (ni === fromIdx) continue;
        const dx = nodes[fromIdx].x - nodes[ni].x;
        const dy = nodes[fromIdx].y - nodes[ni].y;
        if (Math.sqrt(dx * dx + dy * dy) < LINK_DIST) connected.push(ni);
      }
      if (connected.length > 0) return connected[Math.floor(Math.random() * connected.length)];
      return Math.floor(Math.random() * NODE_COUNT);
    };

    // ─── MAIN DRAW LOOP ──────────────────────────────────────────────────────
    const draw = (ts) => {
      const t = ts * 0.001;
      ctx.clearRect(0, 0, W, H);

      // ── 1. Stars ──
      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.base * tw).toFixed(3)})`;
        ctx.fill();
      }

      // ── 2. Neural mesh lines ──
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const op = ((1 - d / LINK_DIST) * 0.22).toFixed(3);
            const clr = (i * j) % 3 === 0 ? '45,212,191' : '167,139,250';
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${clr},${op})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // ── 4. Synaptic travelers ──
      for (const syn of synapses) {
        const from = nodes[syn.fromIdx];
        const to   = nodes[syn.toIdx];

        // Only travel on valid (connected) edges
        const edx = from.x - to.x;
        const edy = from.y - to.y;
        const edist = Math.sqrt(edx * edx + edy * edy);

        const cx = from.x + (to.x - from.x) * syn.progress;
        const cy = from.y + (to.y - from.y) * syn.progress;

        // Update trail
        syn.trail.push({ x: cx, y: cy, age: 0 });
        if (syn.trail.length > 22) syn.trail.shift();
        for (const pt of syn.trail) pt.age++;

        if (edist < LINK_DIST) {
          // Trail
          for (const pt of syn.trail) {
            const ta = ((1 - pt.age / 22) * 0.55).toFixed(3);
            const ts2 = syn.size * (1 - pt.age / 22) * 0.65;
            if (parseFloat(ta) > 0.01 && ts2 > 0) {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, ts2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${syn.color.join(',')},${ta})`;
              ctx.fill();
            }
          }

          // Head glow
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, syn.size * 4);
          grd.addColorStop(0, `rgba(${syn.color.join(',')},0.85)`);
          grd.addColorStop(0.4, `rgba(${syn.color.join(',')},0.2)`);
          grd.addColorStop(1, `rgba(${syn.color.join(',')},0)`);
          ctx.beginPath();
          ctx.arc(cx, cy, syn.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // Bright core
          ctx.beginPath();
          ctx.arc(cx, cy, syn.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fill();
        }

        syn.progress += syn.speed;
        if (syn.progress >= 1) {
          nodes[syn.toIdx].glow = 1.0;
          syn.progress = 0;
          syn.trail    = [];
          syn.fromIdx  = syn.toIdx;
          syn.toIdx    = getNextTarget(syn.fromIdx);
        }
      }

      // ── 5. Neural nodes ──
      for (const n of nodes) {
        // Move
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;

        // Decay glow
        if (n.glow > 0) n.glow = Math.max(0, n.glow - 0.025);

        // Glow burst ring
        if (n.glow > 0.05) {
          const burstR = 16 * n.glow;
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, burstR);
          grd.addColorStop(0, `rgba(255,255,255,${(n.glow * 0.55).toFixed(3)})`);
          grd.addColorStop(0.5, `rgba(167,139,250,${(n.glow * 0.25).toFixed(3)})`);
          grd.addColorStop(1, 'rgba(167,139,250,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, burstR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (1 + n.glow * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${(0.35 + n.glow * 0.6).toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ─── FRAMER MOTION AURORA ORBS ──────────────────────────────────────────────
  const orbs = useMemo(() => [
    {
      color: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)',
      size: 850, left: '-12%', top: '-18%', dur: 32, delay: 0,
      anim: { x: [0, 70, -50, 35, 0], y: [0, -55, 40, -25, 0], scale: [1, 1.15, 0.9, 1.10, 1] },
    },
    {
      color: 'radial-gradient(circle, rgba(13,148,136,0.22) 0%, rgba(45,212,191,0.06) 55%, transparent 72%)',
      size: 700, left: '62%', top: '55%', dur: 40, delay: 6,
      anim: { x: [0, -60, 45, -30, 0], y: [0, 50, -35, 20, 0], scale: [1, 1.12, 0.93, 1.08, 1] },
    },
    {
      color: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 68%)',
      size: 550, left: '35%', top: '20%', dur: 26, delay: 12,
      anim: { x: [0, 40, -30, 15, 0], y: [0, -35, 25, -10, 0], scale: [1, 1.08, 0.95, 1.06, 1] },
    },
    {
      color: 'radial-gradient(circle, rgba(192,132,252,0.14) 0%, transparent 65%)',
      size: 420, left: '75%', top: '-5%', dur: 20, delay: 3,
      anim: { x: [0, -30, 20, -10, 0], y: [0, 40, -20, 12, 0], scale: [1, 1.1, 0.92, 1.05, 1] },
    },
    {
      color: 'radial-gradient(circle, rgba(45,212,191,0.13) 0%, transparent 65%)',
      size: 380, left: '-3%', top: '65%', dur: 28, delay: 9,
      anim: { x: [0, 35, -25, 18, 0], y: [0, -40, 30, -15, 0], scale: [1, 1.06, 0.96, 1.04, 1] },
    },
  ], []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* ── Base ── */}
      <div className="absolute inset-0" style={{ background: '#0A0E1A' }} />

      {/* ── Aurora orbs ── */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
            background: orb.color,
            filter: 'blur(90px)',
            willChange: 'transform',
          }}
          animate={orb.anim}
          transition={{
            duration: orb.dur,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ── Brain canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.82 }}
      />

      {/* ── Pulsing top aurora line ── */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 1.5,
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.7) 25%, rgba(167,139,250,1) 50%, rgba(45,212,191,0.7) 75%, transparent 100%)',
        }}
        animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.95, 1, 0.95] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Bottom glow line ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.5) 30%, rgba(13,148,136,0.7) 50%, rgba(45,212,191,0.5) 70%, transparent 100%)',
        }}
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 42%, rgba(10,14,26,0.65) 100%)',
        }}
      />
    </div>
  );
}
