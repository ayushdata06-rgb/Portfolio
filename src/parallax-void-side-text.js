/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Vertical Side Text
   Adds "this is my" on the left and "portfolio" on the right
   of the PARALLAX.VOID hero section, with fade-in on scroll.
   ═══════════════════════════════════════════════════════ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initParallaxVoidSideText() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // Ensure hero has positioning context
  hero.style.position = 'relative';

  // Left text: "this is my" — rotated 90deg counterclockwise
  const leftText = document.createElement('span');
  leftText.className = 'void-side-text void-side-left';
  leftText.textContent = 'this is my';
  leftText.style.cssText = `
    position: absolute;
    left: 24px;
    top: 50%;
    transform: rotate(-90deg) translateX(-50%);
    transform-origin: left center;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.3em;
    color: white;
    opacity: 0;
    text-transform: uppercase;
    white-space: nowrap;
    z-index: 5;
    pointer-events: none;
    will-change: opacity;
  `;

  // Right text: "portfolio" — rotated 90deg clockwise
  const rightText = document.createElement('span');
  rightText.className = 'void-side-text void-side-right';
  rightText.textContent = 'portfolio';
  rightText.style.cssText = `
    position: absolute;
    right: 24px;
    top: 50%;
    transform: rotate(90deg) translateX(50%);
    transform-origin: right center;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.3em;
    color: white;
    opacity: 0;
    text-transform: uppercase;
    white-space: nowrap;
    z-index: 5;
    pointer-events: none;
    will-change: opacity;
  `;

  hero.appendChild(leftText);
  hero.appendChild(rightText);

  // Fade in with 1s delay when hero enters viewport
  ScrollTrigger.create({
    trigger: hero,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(leftText, {
        opacity: 0.5,
        duration: 0.8,
        delay: 1,
        ease: 'power2.out',
      });
      gsap.to(rightText, {
        opacity: 0.5,
        duration: 0.8,
        delay: 1.2,
        ease: 'power2.out',
      });
    },
  });
}
