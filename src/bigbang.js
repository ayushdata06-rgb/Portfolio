/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Big Bang (Scroll-Driven)
   White dot at bottom → rises → grows → EXPLODES →
   particles EXPAND outward continuously as you scroll →
   black bg gradually fades revealing Parallax.void beneath →
   particles still visible over the landing page then fade.
   
   NO break — seamless transition. The overlay's black bg
   fades first while particles remain visible, creating
   a "traveling through space" feel that merges with landing.
   ═══════════════════════════════════════════════════════ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initBigBang() {
  const section = document.getElementById('bigbang-section');
  const landing = document.getElementById('landing');
  if (!section) return;

  /* ── Scroll room — extends PAST the landing section ── */
  section.style.height = '250vh';
  section.style.position = 'relative';
  section.style.background = '#000';
  section.style.zIndex = '20';

  /* ── Fixed canvas overlay (sits above everything) ── */
  const overlay = document.createElement('div');
  overlay.id = 'bigbang-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;pointer-events:none;';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio, 2);
  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const cx = w / 2;

  /* ── Particle colors ── */
  const COLORS = ['#ffffff', '#a8d8ff', '#fff4a8', '#ffffff', '#ffffff', '#a8d8ff'];

  /* ── Particles with physics ── */
  const PARTICLE_COUNT = 250;
  const particleDefs = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = 0.8 + Math.random() * 3;
    const baseOpacity = 0.3 + Math.random() * 0.7;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const twinkleSpeed = 2 + Math.random() * 4;
    const twinklePhase = Math.random() * Math.PI * 2;

    particleDefs.push({
      vx, vy, size, baseOpacity, color, twinkleSpeed, twinklePhase,
      trail: [],
    });
  }

  /* ── Animation state (GSAP tweens these, canvas reads them) ── */
  const state = {
    dotY: h - 40,          // start near bottom
    dotRadius: 10,          // 2.5x base
    bgFlash: 0,             // 0→1→0 flash
    bgOpacity: 1,           // black bg opacity (fades BEFORE particles)
    particleOpacity: 1,     // particles fade AFTER bg
    particleProgress: 0,    // 0 = center, 1 = fully expanded
    time: 0,
  };

  const maxR = Math.hypot(w, h) * 0.6;

  /* ── Glitch trigger ── */
  function triggerGlitch() {
    const landingTitle = document.querySelector('.landing-title');
    if (!landingTitle) return;
    if (landingTitle.classList.contains('particle-glitch-active')) return;
    landingTitle.classList.add('particle-glitch-active');
    setTimeout(() => landingTitle.classList.remove('particle-glitch-active'), 400);
  }

  /* ── Render loop ── */
  let running = true;
  let hitCount = 0;

  function render() {
    if (!running) return;
    requestAnimationFrame(render);

    state.time += 0.016;
    ctx.clearRect(0, 0, w, h);

    /* ─ Black background: fades first to reveal Landing beneath ─ */
    if (state.bgOpacity > 0.005) {
      ctx.globalAlpha = state.bgOpacity;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    }

    /* ─ White dot (pre-explosion) ─ */
    if (state.dotRadius < maxR && state.bgOpacity > 0.1) {
      ctx.globalAlpha = state.bgOpacity;
      ctx.beginPath();
      ctx.arc(cx, state.dotY, Math.max(0, state.dotRadius), 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    /* ─ White flash ─ */
    if (state.bgFlash > 0.01) {
      ctx.globalAlpha = state.bgFlash;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
    }

    /* ─ Particles — expand outward, remain visible over landing ─ */
    if (state.particleProgress > 0.005 && state.particleOpacity > 0.005) {
      hitCount = 0;

      for (const p of particleDefs) {
        const t = state.particleProgress;

        // Expanding outward from center — continuous acceleration feel
        const spread = Math.max(w, h) * 0.6;
        const ease = 1 - Math.pow(1 - t, 2); // easeOutQuad for smooth expansion
        const px = cx + p.vx * ease * spread;
        const py = h / 2 + p.vy * ease * spread;

        // Store trail
        p.trail.push({ x: px, y: py });
        if (p.trail.length > 4) p.trail.shift();

        // Twinkle
        const twinkle = Math.sin(state.time * p.twinkleSpeed + p.twinklePhase) * 0.25 + 0.75;

        // Particle opacity: stays bright through most of the scroll, then fades
        const particleFade = t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3);
        const alpha = particleFade * p.baseOpacity * twinkle * state.particleOpacity;

        if (alpha < 0.01) continue;

        // Off-screen check
        if (px < -50 || px > w + 50 || py < -50 || py > h + 50) continue;

        // Bottom boundary → glitch trigger
        if (py > h - 80) hitCount++;

        // Draw trails (motion blur)
        if (p.trail.length > 1) {
          for (let ti = 0; ti < p.trail.length - 1; ti++) {
            const trailAlpha = (ti / p.trail.length) * alpha * 0.25;
            if (trailAlpha < 0.008) continue;
            ctx.globalAlpha = trailAlpha;
            ctx.beginPath();
            ctx.arc(p.trail[ti].x, p.trail[ti].y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }

        // Main particle with glow
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (hitCount > 3) triggerGlitch();
    }

    ctx.globalAlpha = 1;
  }
  render();

  /* ── GSAP timeline — scrubbed by scroll ── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onLeave: () => {
        running = false;
        overlay.style.display = 'none';
      },
      onEnterBack: () => {
        overlay.style.display = '';
        running = true;
        render();
      },
    },
  });

  /* ── Phase 1 (0.00 → 0.30): Dot rises from bottom → center, grows ── */
  tl.to(state, {
    dotY: h / 2,
    dotRadius: 70,
    duration: 0.30,
    ease: 'power2.inOut',
  }, 0);

  /* ── Phase 2 (0.30 → 0.35): Dot rapidly expands to fill screen ── */
  tl.to(state, {
    dotRadius: maxR,
    duration: 0.05,
    ease: 'power3.in',
  }, 0.30);

  /* ── Phase 3 (0.34): White flash peaks ── */
  tl.fromTo(state,
    { bgFlash: 0 },
    { bgFlash: 1, duration: 0.02, ease: 'none' },
    0.34,
  );

  /* ── Phase 4 (0.36 → 0.90): Flash fades + particles expand outward ── */
  tl.to(state, { bgFlash: 0, duration: 0.08, ease: 'power2.out' }, 0.36);

  // Particles expand continuously  /* ── tighter transition to eliminate blank gap ── */
  section.style.height = '180vh';
  section.style.position = 'relative';
  section.style.background = '#000';
  section.style.zIndex = '20';

  tl.to(state, {
    particleProgress: 1,
    duration: 0.55,
    ease: 'none',  // linear — constant expansion feel
  }, 0.36);

  /* ── Phase 5 (0.50 → 0.90): Black bg fades → landing visible beneath ── */
  tl.to(state, {
    bgOpacity: 0,
    duration: 0.40,
    ease: 'power2.inOut',
  }, 0.50);

  /* ── Phase 6 (0.80 → 1.0): Particles themselves fade out last ── */
  tl.to(state, {
    particleOpacity: 0,
    duration: 0.20,
    ease: 'power2.in',
  }, 0.80);
}
