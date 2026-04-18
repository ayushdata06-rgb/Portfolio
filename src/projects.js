/* PARALLAX.VOID — Projects Section
   3D magnetic tilt + cursor spotlight + scroll reveal
   + GSAP hover skew on titles + card wipe-in */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initProjects() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  // Scroll reveal — section header
  gsap.from('.section-header', {
    y: 40, opacity: 0, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '#projects', start: 'top 75%' },
  });

  // Scroll reveal — cards wipe in from bottom
  gsap.from('.project-card', {
    y: 60, opacity: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.project-grid', start: 'top 72%' },
  });

  // 3D tilt + cursor spotlight + hover skew per card
  cards.forEach((card) => {
    // Set up CSS custom properties for the spotlight
    card.style.setProperty('--spotlight-x', '50%');
    card.style.setProperty('--spotlight-y', '50%');
    card.style.setProperty('--spotlight-opacity', '0');

    const titleEl = card.querySelector('h3');
    const linkEl  = card.querySelector('.card-cta span');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // 3D tilt — perspective + rotateX/Y
      const tiltX = (x - 0.5) * 12;
      const tiltY = -(y - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateY(${tiltX}deg) rotateX(${tiltY}deg) translateY(-6px) scale(1.02)`;

      // Spotlight follows cursor
      card.style.setProperty('--spotlight-x', `${x * 100}%`);
      card.style.setProperty('--spotlight-y', `${y * 100}%`);
      card.style.setProperty('--spotlight-opacity', '1');
    });

    card.addEventListener('mouseenter', () => {
      // Skew title on hover
      if (titleEl) {
        gsap.to(titleEl, { skewX: 2, x: 6, duration: 0.3, ease: 'power2.out' });
      }
      if (linkEl) {
        gsap.to(linkEl, { x: 6, duration: 0.25, ease: 'power2.out' });
      }

      // Scale image on hover
      const img = card.querySelector('.card-img-placeholder');
      if (img) {
        gsap.to(img, { scale: 1.08, duration: 0.5, ease: 'power2.out' });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0, y: 0, scale: 1,
        duration: 0.5, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        clearProps: 'transform',
      });
      card.style.setProperty('--spotlight-opacity', '0');

      // Reset skew
      if (titleEl) {
        gsap.to(titleEl, { skewX: 0, x: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
      }
      if (linkEl) {
        gsap.to(linkEl, { x: 0, duration: 0.3, ease: 'power1.out' });
      }

      // Reset image scale
      const img = card.querySelector('.card-img-placeholder');
      if (img) {
        gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
      }
    });
  });
}
