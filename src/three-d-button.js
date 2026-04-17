/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — 3D Tilt Button Effect
   Reusable module that adds perspective tilt, shine gradient,
   and deep shadow on hover to any element.
   Reference: https://framer.com/m/3D-Button-r7gp.js
   ═══════════════════════════════════════════════════════ */

/**
 * Apply 3D tilt effect to a button element.
 * @param {HTMLElement} el  The button/element to enhance
 */
export function applyThreeDButton(el) {
  if (!el) return;

  // Create shine overlay
  const shine = document.createElement('div');
  shine.className = 'btn-3d-shine';
  shine.style.cssText = `
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25), transparent 60%);
  `;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.style.willChange = 'transform';
  el.appendChild(shine);

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt angles (max ±15deg)
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    el.style.transform = `perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)';

    // Move shine
    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent 60%)`;
    shine.style.opacity = '1';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(400px) rotateX(0deg) rotateY(0deg)';
    el.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease';
    el.style.boxShadow = '';
    shine.style.opacity = '0';

    // Remove transition after spring completes
    setTimeout(() => {
      el.style.transition = '';
    }, 400);
  });

  el.addEventListener('mouseenter', () => {
    el.style.transition = '';
  });
}

/**
 * Initialize 3D button effects on all matching elements.
 */
export function initThreeDButtons() {
  // Project card CTA buttons ("View Project →")
  document.querySelectorAll('.card-cta').forEach(applyThreeDButton);

  // Contact "Send Message" button
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) applyThreeDButton(submitBtn);
}
