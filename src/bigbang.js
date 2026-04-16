/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Big Bang (Scroll-Driven)
   White dot at bottom → rises with scroll → grows →
   explodes at center → particles → fade out → reveal page.
   ═══════════════════════════════════════════════════════ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initBigBang() {
  const section = document.getElementById('bigbang-section');
  if (!section) return;

  /* ── give the section scroll-room ── */
  section.style.height = '300vh';
  section.style.position = 'relative';
  section.style.background = '#000';
  section.style.zIndex = '20';

  /* ── create fixed canvas overlay ── */
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

  /* ── pre-compute particles (all paths randomised once) ── */
  const PARTICLE_COUNT = 100;
  const particleDefs = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * Math.max(w, h) * 0.6;
    particleDefs.push({
      endX: cx + Math.cos(angle) * dist,
      endY: h / 2 + Math.sin(angle) * dist,
      size: 1.5 + Math.random() * 2.5,
    });
  }

  /* ── animation state (GSAP tweens these, canvas reads them) ── */
  const state = {
    dotY: h - 40,       // starts near bottom
    dotRadius: 4,        // tiny dot
    bgFlash: 0,          // 0 = no flash, 1 = full white
    overlayOpacity: 1,   // overall fade-out at the end
    particleProgress: 0, // 0 = at center, 1 = dispersed
  };

  const maxR = Math.hypot(w, h) * 0.6;

  /* ── render loop (reads state, draws canvas) ── */
  let running = true;
  function render() {
    if (!running) return;
    requestAnimationFrame(render);

    ctx.clearRect(0, 0, w, h);

    /* black background */
    ctx.globalAlpha = state.overlayOpacity;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    /* white dot (hide once it has fully expanded) */
    if (state.dotRadius < maxR) {
      ctx.beginPath();
      ctx.arc(cx, state.dotY, Math.max(0, state.dotRadius), 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = state.overlayOpacity;
      ctx.fill();
    }

    /* white flash */
    if (state.bgFlash > 0.01) {
      ctx.globalAlpha = state.bgFlash * state.overlayOpacity;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
    }

    /* particles */
    if (state.particleProgress > 0.01) {
      for (const p of particleDefs) {
        const t = state.particleProgress;
        const x = cx + (p.endX - cx) * t;
        const y = h / 2 + (p.endY - h / 2) * t;
        const opacity = Math.max(0, 1 - t * 1.3);
        if (opacity < 0.01) continue;
        ctx.globalAlpha = opacity * state.overlayOpacity;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }
  render();

  /* ── GSAP timeline, scrubbed by ScrollTrigger ── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
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

  /* Phase 1 (0 → 0.40): dot rises from bottom → center, grows */
  tl.to(
    state,
    { dotY: h / 2, dotRadius: 28, duration: 0.40, ease: 'power2.inOut' },
    0,
  );

  /* Phase 2 (0.40 → 0.50): dot rapidly expands to fill viewport */
  tl.to(
    state,
    { dotRadius: maxR, duration: 0.10, ease: 'power3.in' },
    0.40,
  );

  /* Phase 3 (0.50): white flash peaks */
  tl.fromTo(
    state,
    { bgFlash: 0 },
    { bgFlash: 1, duration: 0.02, ease: 'none' },
    0.48,
  );

  /* Phase 4 (0.50 → 0.65): flash fades, particles disperse */
  tl.to(state, { bgFlash: 0, duration: 0.15, ease: 'power2.out' }, 0.50);
  tl.to(
    state,
    { particleProgress: 1, duration: 0.30, ease: 'power2.out' },
    0.50,
  );

  /* Phase 5 (0.80 → 1.0): overlay fades out, revealing landing */
  tl.to(state, { overlayOpacity: 0, duration: 0.20 }, 0.80);
}
