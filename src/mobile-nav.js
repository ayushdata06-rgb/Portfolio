/* PARALLAX.VOID — Mobile Bottom Navigation Bar
   Frosted glass pill with 5 SVG icons, active dot indicator.
   Only renders on mobile <768px. Slides up on load after 1s. */

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  about: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
  skills: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  projects: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  contact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
};

const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];

export function initMobileNav() {
  if (window.innerWidth >= 768) return;

  // Build the nav pill
  const nav = document.createElement('nav');
  nav.id = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Mobile navigation');

  const items = SECTIONS.map((id) => {
    const btn = document.createElement('button');
    btn.className = 'mobile-nav-btn';
    btn.dataset.target = id;
    btn.setAttribute('aria-label', id.charAt(0).toUpperCase() + id.slice(1));
    btn.innerHTML = `
      <span class="mobile-nav-icon">${ICONS[id]}</span>
      <span class="mobile-nav-dot"></span>
    `;
    btn.addEventListener('click', () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
    nav.appendChild(btn);
    return btn;
  });

  document.body.appendChild(nav);

  // Slide up after 1s
  setTimeout(() => nav.classList.add('visible'), 1000);

  // IntersectionObserver to highlight active section
  const setActive = (id) => {
    items.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.target === id);
    });
  };

  SECTIONS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(id);
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  // Set home active initially
  setActive('hero');
}
