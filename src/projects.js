/* PARALLAX.VOID — Projects Section
   3D magnetic tilt + cursor spotlight + scroll reveal */

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

  // 3D tilt + cursor spotlight per card
  cards.forEach((card) => {
    // Set up CSS custom properties for the spotlight
    card.style.setProperty('--spotlight-x', '50%');
    card.style.setProperty('--spotlight-y', '50%');
    card.style.setProperty('--spotlight-opacity', '0');

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

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0, y: 0, scale: 1,
        duration: 0.5, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        clearProps: 'transform',
      });
      card.style.setProperty('--spotlight-opacity', '0');
    });

    // Scale image on hover
    const img = card.querySelector('.card-img-placeholder');
    if (img) {
      card.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.08, duration: 0.5, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
      });
    }
  });
}
