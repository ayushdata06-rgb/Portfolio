/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Void Zoom / T-Portal Effect
   The "T" from "THE" scales up while a white overlay
   smoothly fills the viewport, creating a portal that
   seamlessly reveals the white Skills section.
   ═══════════════════════════════════════════════════════ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initVoidZoom() {
  const hero = document.getElementById('hero');
  const headline = document.getElementById('hero-headline');
  if (!hero || !headline) return;

  /* Find all .char spans created by initIntro */
  const chars = headline.querySelectorAll('.char');
  if (chars.length === 0) return;

  /* ── locate the "T" of "THE" ── */
  let targetT = null;
  for (let i = 0; i < chars.length - 2; i++) {
    const a = chars[i].textContent;
    const b = chars[i + 1].textContent;
    const c = chars[i + 2].textContent;
    if (a === 'T' && b === 'H' && c === 'E') {
      targetT = chars[i];
      break;
    }
  }
  if (!targetT) return;

  /* collect other chars (everything except the portal T) */
  const otherChars = [...chars].filter((c) => c !== targetT);

  /* related elements to fade out */
  const subtitle = document.getElementById('hero-subtitle');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const indicator = document.getElementById('scroll-indicator');
  const glitch = document.querySelector('.glitch-text');
  const fadeEls = [subtitle, eyebrow, indicator].filter(Boolean);

  /* prepare the T for scaling */
  targetT.style.display = 'inline-block';
  targetT.style.willChange = 'transform, opacity';
  targetT.style.textShadow = 'none'; // CRITICAL: remove heavy blur during scale to fix lag

  /* Hero section needs overflow hidden so the scaled T doesn't leak sides */
  hero.style.overflow = 'hidden';
  hero.style.position = 'relative';

  /* ── White portal overlay: visually matches Skills background but sits inside hero ── */
  const portalOverlay = document.createElement('div');
  portalOverlay.style.cssText = `
    position: absolute;
    inset: 0;
    background: #ffffff;
    opacity: 0;
    z-index: 10;
    pointer-events: none;
    will-change: opacity;
  `;
  hero.appendChild(portalOverlay);

  /* Calculate center for targetT */
  const getCenterOffset = () => {
    const rect = targetT.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return {
      x: centerX - (rect.left + rect.width / 2),
      y: centerY - (rect.top + rect.height / 2)
    };
  };

  /* ── GSAP timeline pinned with scrub ── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=80%', // Short pin duration so the user transitions snappily
      pin: true,
      scrub: 0.1,
      anticipatePin: 1,
    },
  });

  /* Phase 1 (0.0 to 0.2): Fade out peripheral elements quickly */
  tl.to(otherChars, { opacity: 0, duration: 0.2, stagger: 0.005, ease: 'power1.in' }, 0);
  tl.to(fadeEls, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0);
  if (glitch) {
    tl.to(glitch, { '--glitch-opacity': 0, duration: 0.15 }, 0);
    tl.set(glitch, { className: '+=glitch-hidden' }, 0.15);
  }

  /* Phase 2 (0.2 to 1.0): T zooms perfectly to center */
  tl.to(targetT, {
    x: () => getCenterOffset().x,
    y: () => getCenterOffset().y,
    scale: 60, // Massive scale
    force3D: true, // Force GPU processing for scale
    duration: 0.8,
    ease: 'power2.in',
  }, 0.2);

  /* Phase 3 (0.5 to 1.0): White portal overlay fades in, completely whiting out the screen by 1.0 */
  tl.to(portalOverlay, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.in',
  }, 0.5);

  /* Timeline finishes exactly at 1.0. At this exact moment, hero is a solid white screen.
     The pin ends, and the white Skills page naturally follows with zero empty scroll delay. */
}
