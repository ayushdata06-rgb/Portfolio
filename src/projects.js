/* PARALLAX.VOID — Projects Section
   Card tilt effect + scroll reveal */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initProjects() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  // Scroll reveal
  gsap.from('.section-header', {
    y: 40, opacity: 0, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '#projects', start: 'top 75%' },
  });

  gsap.from('.project-card', {
    y: 80, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '.project-grid', start: 'top 75%' },
  });

  // Manual tilt effect per card
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, y: 0, duration: 0.5, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        clearProps: 'transform' });
    });
  });
}
