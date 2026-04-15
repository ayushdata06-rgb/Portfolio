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
import { initMobileNav } from './mobile-nav.js';


gsap.registerPlugin(ScrollTrigger);

const state = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  lenis: null,
};

// ── PRELOADER ──
function simulatePreloader() {
  return new Promise((resolve) => {
    const fill = document.getElementById('preloader-fill');
    const text = document.getElementById('preloader-text');
    const preloader = document.getElementById('preloader');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100; clearInterval(interval);
        fill.style.width = '100%'; text.textContent = '100%';
        setTimeout(() => { preloader.classList.add('done'); resolve(); }, 400);
      } else {
        fill.style.width = `${progress}%`;
        text.textContent = `${Math.round(progress)}%`;
      }
    }, 120);
  });
}

// ── LENIS SMOOTH SCROLL ──
async function initSmoothScroll() {
  if (window.innerWidth < 768) return;
  const { default: Lenis } = await import('lenis');
  state.lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  state.lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { state.lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Scroll progress bar
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    state.lenis.on('scroll', ({ progress }) => {
      progressBar.style.transform = `scaleX(${progress})`;
    });
  }
}

// ── ACTIVE NAV LINK WITH SLIDING PILL (REMOVED: JUST CLICK SCROLL) ──
function initNavHighlight() {
  const links = document.querySelectorAll('.nav-link');

  // Smooth scroll on nav click
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target && state.lenis) {
        state.lenis.scrollTo(target, { duration: 1.5 });
      } else if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ── SECTION SCROLL REVEALS (75% threshold, consistent easing) ──
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
    document.getElementById('preloader')?.classList.add('done');
    ['hero-headline', 'hero-subtitle'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '1';
    });
    ['.hero-eyebrow', '.scroll-indicator'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.style.opacity = '1';
    });
    /* initCursor(); */ initNavHighlight();
    initCursorReveal(); initTimeline(); initStats();
    // initSkills(); 
    initProjects(); initContact();
    return;
  }

  await simulatePreloader();

  requestAnimationFrame(async () => {
    // initCursor();
    initParticles();
    await initSmoothScroll();

    await initIntro();

    initNavHighlight();
    initSectionReveals();

    // Section modules
    initCursorReveal();
    initTimeline();
    initStats();
    initAboutReveal();
    initSkills();
    initProjects();
    initContact();
    initSectionNumbers();
    initFooterStars();
    initMobileNav();
  });
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
