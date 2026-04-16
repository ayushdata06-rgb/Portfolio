/* PARALLAX.VOID — Main Entry Point
   Orchestrates all sections: hero, about, skills, projects, contact */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initIntro, skipIntro } from './intro.js';
import { initParticles } from './particles.js';
// import { initCursor } from './cursor.js';
import { initCursorReveal, initTimeline, initStats, initAboutReveal } from './about.js';
import { initSkills } from './skills.js';
import { initProjects } from './projects.js';
import { initContact } from './contact.js';
import { initSectionNumbers } from './section-numbers.js';
import { initFooterStars } from './footer-stars.js';
import { initBigBang } from './bigbang.js';
import { initLandingHero } from './landing-hero.js';
import { initVoidZoom } from './void-zoom.js';
import { initTimelineLine } from './timeline-line.js';


gsap.registerPlugin(ScrollTrigger);

const state = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  lenis: null,
};

// ── LENIS SMOOTH SCROLL ──
async function initSmoothScroll() {
  if (window.innerWidth < 768) return;
  const { default: Lenis } = await import('lenis');
  state.lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  state.lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { state.lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    state.lenis.on('scroll', ({ progress }) => {
      progressBar.style.transform = `scaleX(${progress})`;
    });
  }
}

// ── SECTION SCROLL REVEALS ──
function initSectionReveals() {
  document.querySelectorAll('.section-label').forEach((label) => {
    gsap.from(label, {
      y: 20, opacity: 0, duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      scrollTrigger: { trigger: label, start: 'top 75%' },
    });
  });
}

// ── BOOT ──
async function boot() {
  if (state.reducedMotion) {
    ['hero-headline', 'hero-subtitle'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '1';
    });
    ['.hero-eyebrow', '.scroll-indicator'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.style.opacity = '1';
    });
    initCursorReveal(); initTimeline(); initStats();
    initProjects(); initContact();
    return;
  }

  requestAnimationFrame(async () => {
    initParticles();
    await initSmoothScroll();

    // Big Bang — scroll-driven, no await needed
    initBigBang();

    // Landing hero (parallax title + CTA buttons)
    initLandingHero(state.lenis);

    // About section modules (before hero in DOM order)
    initCursorReveal();
    initTimeline();
    initStats();
    initAboutReveal();
    initTimelineLine();

    // Hero intro text (chars created synchronously, animation async)
    initIntro();

    // Void zoom portal (T → white → Skills) — needs .char spans from initIntro
    initVoidZoom();

    initSectionReveals();

    // Remaining sections
    initSkills();
    initProjects();
    initContact();
    initFooterStars();
  });
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
