/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Void Zoom
   
   Scroll-driven cinematic transition:
   
   Phase 1: Corner texts ("THIS IS MY PORTFOLIO" / "WEBSITE") fade out
   Phase 2: "ENTER THE VOID" fades in centered
   Phase 3: Text zooms toward camera while fading out
   Phase 4: White portal fills screen → connects to Skills section
   
   ARCHITECTURE RULES (prevents cracking on reverse scroll):
   ──────────────────────────────────────────────────────────
   • NO gsap.set() — only fromTo/to inside the timeline
   • Each property animated by exactly ONE tween at any point
   • scrub: true (1:1 scroll lock, zero interpolation lag)
   • scale capped at 20 to stay within GPU safe zone
   • Text fades to 0 BEFORE scale exceeds ~8x (invisible = no cracks)
   • White portal fade-in overlaps text fade-out seamlessly
   ═══════════════════════════════════════════════════════ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initVoidZoom() {
  const hero = document.getElementById('hero');
  const introText = document.getElementById('void-intro-text');
  const enterText = document.getElementById('void-enter-text');
  if (!hero || !introText || !enterText) return;

  const introTop = introText.querySelector('.void-intro-top');
  const introBottom = introText.querySelector('.void-intro-bottom');

  /* ── Hero container setup ── */
  hero.style.overflow = 'hidden';
  hero.style.position = 'relative';
  hero.style.background = '#000000';
  hero.style.height = '100vh';

  /* ── White portal overlay (reuse if HMR) ── */
  let whitePortal = hero.querySelector('#void-white-portal');
  if (!whitePortal) {
    whitePortal = document.createElement('div');
    whitePortal.id = 'void-white-portal';
    hero.appendChild(whitePortal);
  }
  Object.assign(whitePortal.style, {
    position: 'absolute',
    inset: '0',
    background: '#ffffff',
    opacity: '0',
    zIndex: '15',
    pointerEvents: 'none',
  });

  /* ── CSS transform hints (prevents layer fragmentation) ── */
  enterText.style.transformOrigin = 'center center';
  enterText.style.willChange = 'transform, opacity';
  enterText.style.backfaceVisibility = 'hidden';

  /* ═══════════════════════════════════════════════════════
     MASTER TIMELINE — scrub: true = 1:1 with scrollbar
     
     Duration map (total = 1.0):
     0.00–0.15  Corner texts fade out
     0.18–0.30  "ENTER THE VOID" fades in (scale 1)
     0.30–0.32  Hold — text fully visible
     0.32–0.55  Zoom: scale 1 → 20
     0.35–0.50  Text opacity 1 → 0 (gone before scale gets big)
     0.48–0.70  White portal 0 → 1
     0.70–1.00  Hold white (Skills visible underneath)
     ═══════════════════════════════════════════════════════ */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: true,          // true = locked 1:1 to scroll, no interpolation
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  /* ── Phase 1: Corner texts out ── */
  if (introTop) {
    tl.fromTo(introTop,
      { y: 0, opacity: 1 },
      { y: -50, opacity: 0, duration: 0.15, ease: 'power2.in' },
      0
    );
  }
  if (introBottom) {
    tl.fromTo(introBottom,
      { y: 0, opacity: 1 },
      { y: 50, opacity: 0, duration: 0.15, ease: 'power2.in' },
      0.02
    );
  }

  /* ── Phase 2: "ENTER THE VOID" appears ── */
  tl.fromTo(enterText,
    { opacity: 0, scale: 1 },
    { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' },
    0.18
  );

  /* ── Phase 3: Zoom + fade out ──
     Two separate tweens on enterText but they DON'T overlap the same property:
     - First tween: scale only (0.32 → 0.55)
     - Second tween: opacity only (0.35 → 0.50)
     Text is invisible before scale reaches cracking threshold */
  tl.to(enterText, {
    scale: 20,
    duration: 0.23,
    ease: 'power2.in',
    force3D: true,
  }, 0.32);

  tl.to(enterText, {
    opacity: 0,
    duration: 0.15,
    ease: 'power2.in',
  }, 0.35);

  /* ── Phase 4: White portal fills screen ──
     Starts before text is fully gone for seamless overlap */
  tl.fromTo(whitePortal,
    { opacity: 0 },
    { opacity: 1, duration: 0.22, ease: 'power1.inOut' },
    0.48
  );
}
