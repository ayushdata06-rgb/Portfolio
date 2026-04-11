/* PARALLAX.VOID — Footer Starfield Parallax
   3 depth layers of stars following cursor movement.
   Plus a slowly rotating CSS galaxy spiral SVG. */

export function initFooterStars() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  // Create the star canvas container
  const starsContainer = document.createElement('div');
  starsContainer.className = 'footer-stars';
  starsContainer.setAttribute('aria-hidden', 'true');
  footer.prepend(starsContainer);

  // Create galaxy spiral SVG
  const galaxySvg = createGalaxySvg();
  starsContainer.appendChild(galaxySvg);

  // Create 3 depth layers
  const layers = [
    { count: 30, size: 1,   speed: 2,  className: 'star-layer-1' },
    { count: 20, size: 1.5, speed: 5,  className: 'star-layer-2' },
    { count: 12, size: 2,   speed: 10, className: 'star-layer-3' },
  ];

  const layerEls = layers.map(({ count, size, className }) => {
    const layer = document.createElement('div');
    layer.className = `star-layer ${className}`;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'star-dot';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${size + Math.random()}px`;
      star.style.height = `${size + Math.random()}px`;
      star.style.opacity = `${0.3 + Math.random() * 0.7}`;
      layer.appendChild(star);
    }
    starsContainer.appendChild(layer);
    return { el: layer, speed: layers[layers.indexOf({ count, size, speed: layers.find(l => l.className === className)?.speed || 2, className })]?.speed || 2 };
  });

  // Re-map with actual speeds
  const layerData = [
    { el: starsContainer.querySelector('.star-layer-1'), speed: 2 },
    { el: starsContainer.querySelector('.star-layer-2'), speed: 5 },
    { el: starsContainer.querySelector('.star-layer-3'), speed: 10 },
  ];

  // Mouse parallax
  footer.addEventListener('mousemove', (e) => {
    const rect = footer.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx; // -1 to 1
    const dy = (e.clientY - rect.top - cy) / cy;

    layerData.forEach(({ el, speed }) => {
      if (!el) return;
      el.style.transform = `translate(${-dx * speed}px, ${-dy * speed}px)`;
    });
  });

  footer.addEventListener('mouseleave', () => {
    layerData.forEach(({ el }) => {
      if (!el) return;
      el.style.transform = 'translate(0,0)';
    });
  });
}

function createGalaxySvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'footer-galaxy');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('aria-hidden', 'true');

  // Generate spiral arm dots
  const dots = [];
  const arms = 3;
  const dotsPerArm = 30;

  for (let arm = 0; arm < arms; arm++) {
    const armOffset = (arm / arms) * Math.PI * 2;
    for (let i = 0; i < dotsPerArm; i++) {
      const t = i / dotsPerArm;
      const angle = armOffset + t * Math.PI * 4; // 2 full turns
      const r = 10 + t * 80;
      const x = 100 + r * Math.cos(angle) + (Math.random() - 0.5) * 8;
      const y = 100 + r * Math.sin(angle) * 0.5 + (Math.random() - 0.5) * 4; // flatten ellipse
      const size = 0.5 + (1 - t) * 1.5;
      const opacity = 0.3 + (1 - t) * 0.7;
      dots.push({ x, y, size, opacity });
    }
  }

  // Center glow
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  center.setAttribute('cx', '100');
  center.setAttribute('cy', '100');
  center.setAttribute('r', '6');
  center.setAttribute('fill', 'rgba(127,119,221,0.3)');
  svg.appendChild(center);

  dots.forEach(({ x, y, size, opacity }) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', String(size));
    circle.setAttribute('fill', `rgba(127,119,221,${opacity.toFixed(2)})`);
    svg.appendChild(circle);
  });

  return svg;
}
