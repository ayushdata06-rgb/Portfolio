/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Void Zoom (Lenis-Style)
   
   Layout:
   - Top-left: "THIS IS MY" (white) + "PORTFOLIO" (grey)
   - Bottom-right: "WEBSITE" (white)
   - Both positioned at corners like Lenis website
   
   Scroll flow:
   1. Corner texts visible on pure black background
   2. On scroll → corner texts fade out
   3. "ENTER THE VOID" (3 stacked lines) fades in centered
   4. "ENTER THE VOID" zooms aggressively
   5. Black → white transition, revealing Skills
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
  const enterLines = enterText.querySelectorAll('.void-enter-line');

  /* Hero setup */
  hero.style.overflow = 'hidden';
  hero.style.position = 'relative';
  hero.style.background = '#000000';

  /* ── White portal overlay ── */
  const whitePortal = document.createElement('div');
  whitePortal.id = 'void-white-portal';
  whitePortal.style.cssText = `
    position: absolute;
    inset: 0;
    background: #ffffff;
    opacity: 0;
    z-index: 15;
    pointer-events: none;
    will-change: opacity;
  `;
  hero.appendChild(whitePortal);

  /* Set initial states */
  gsap.set(introText, { opacity: 1 });
  gsap.set(enterText, { opacity: 0, scale: 1 });
  enterText.style.transformOrigin = 'center center';

  /* ── tighter transition to eliminate blank gap ── */
  hero.style.height = '100vh';
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.3,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  /* ═══ Phase 1 (0.00 → 0.25): Corner texts fade out ═══ */
  // Top-left block slides up and fades
  if (introTop) {
    tl.to(introTop, {
      y: -80,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
    }, 0.05);
  }

  // Bottom-right block slides down and fades
  if (introBottom) {
    tl.to(introBottom, {
      y: 80,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
    }, 0.08);
  }

  /* ═══ Phase 2 (0.20 → 0.35): "ENTER THE VOID" fades in, stacked ═══ */
  tl.to(enterText, {
    opacity: 1,
    duration: 0.12,
    ease: 'power2.out',
  }, 0.20);

  /* Stagger each line */
  tl.fromTo(enterLines, 
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.12,
      stagger: 0.05,
      ease: 'power3.out',
    }, 0.20);

  /* ═══ Phase 3 (0.35 → 0.80): Zoom effect ═══ */
  tl.to(enterText, {
    scale: 80,
    force3D: true,
    duration: 0.45,
    ease: 'power2.in',
  }, 0.35);

  /* ═══ Phase 4 (0.60 → 0.80): Black → White transition ═══ */
  tl.to(whitePortal, {
    opacity: 1,
    duration: 0.20,
    ease: 'power2.in',
  }, 0.60);

  /* Fade out ENTER THE VOID into the white */
  tl.to(enterText, {
    opacity: 0,
    duration: 0.10,
    ease: 'power2.in',
  }, 0.70);
}
