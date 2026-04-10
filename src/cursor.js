/* PARALLAX.VOID — Custom Magnetic Cursor
   6px white dot + 36px ring + 8-dot trail.
   Ring color changes per-section: purple/pink/teal/blue/amber.
   Click ripple effect site-wide. */

export function initCursor() {
  if (window.innerWidth < 768) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const trailDots = document.querySelectorAll('.trail-dot');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = mx;
  let dx = mx, dy = my, rx = mx, ry = my;
  const trail = Array.from({ length: 8 }, () => ({ x: mx, y: my, t: 0 }));

  // Section color map
  const SECTION_COLORS = {
    hero: '#7F77DD',
    about: '#D4537E',
    skills: '#1D9E75',
    projects: '#378ADD',
    contact: '#EF9F27',
  };

  let currentSectionColor = SECTION_COLORS.hero;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  const interactives = 'a, button, [data-magnetic], input, textarea, select, .project-card, .timeline-card, .social-pill';
  let isHoveringInteractive = false;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactives);
    if (target) {
      isHoveringInteractive = true;
      dot.classList.add('hovering');
      ring.classList.add('hovering');
      const color = target.dataset?.color;
      if (color) ring.style.borderColor = color;
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      isHoveringInteractive = false;
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
      ring.style.borderColor = '';
    }
  });

  // Magnetic pull
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      el.style.transform = `translate(${(e.clientX - cx) * 0.4}px, ${(e.clientY - cy) * 0.4}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });

  // Section detection for cursor color
  function updateSectionColor() {
    const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
    const scrollY = window.scrollY + window.innerHeight / 2;
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentSectionColor = SECTION_COLORS[id] || SECTION_COLORS.hero;
        break;
      }
    }
  }

  window.addEventListener('scroll', updateSectionColor, { passive: true });
  updateSectionColor();

  // ── CLICK EFFECT — particle burst + ring pulse ──
  document.addEventListener('click', (e) => {
    spawnClickEffect(e.clientX, e.clientY, currentSectionColor);
  });

  function update() {
    requestAnimationFrame(update);
    dx += (mx - dx) * 0.2; dy += (my - dy) * 0.2;
    dot.style.left = `${dx}px`; dot.style.top = `${dy}px`;
    rx += (mx - rx) * 0.08; ry += (my - ry) * 0.08;
    ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;

    if (!isHoveringInteractive) {
      ring.style.borderColor = currentSectionColor;
    }

    const now = performance.now();
    trail.unshift({ x: mx, y: my, t: now });
    trail.length = 8;
    trailDots.forEach((td, i) => {
      const p = trail[i]; if (!p) return;
      td.style.left = `${p.x}px`; td.style.top = `${p.y}px`;
      td.style.opacity = Math.max(0, 1 - (now - p.t) / 300) * 0.3;
      td.style.background = currentSectionColor;
    });
  }
  update();
}

// ── Click Effect: expanding ring + burst particles ──
function spawnClickEffect(x, y, color) {
  // 1. Expanding ring
  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border: 2px solid ${color};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9998;
    opacity: 0.7;
  `;
  document.body.appendChild(ring);

  // Animate ring expanding outward
  const size = 80;
  ring.animate([
    { width: '0px', height: '0px', opacity: 0.7, borderWidth: '2px' },
    { width: `${size}px`, height: `${size}px`, opacity: 0, borderWidth: '0.5px' },
  ], {
    duration: 500,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards',
  }).onfinish = () => ring.remove();

  // 2. Particle burst — 8 small dots shooting outward
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const dist = 25 + Math.random() * 35;
    const particle = document.createElement('div');
    const pSize = 2 + Math.random() * 3;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${pSize}px;
      height: ${pSize}px;
      background: ${color};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9998;
      opacity: 0.9;
    `;
    document.body.appendChild(particle);

    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    particle.animate([
      { transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)', opacity: 0.9 },
      { transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 },
    ], {
      duration: 400 + Math.random() * 200,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards',
    }).onfinish = () => particle.remove();
  }
}
