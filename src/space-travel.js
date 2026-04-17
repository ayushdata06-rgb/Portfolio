/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Travel In Space Effect
   Simulates particles rushing toward the viewer (z-axis),
   similar to a hyperspace/warp drive effect.
   Reference: https://framer.com/m/TravelInSpace-Prod-aUGS.js
   ═══════════════════════════════════════════════════════ */

export function initSpaceTravel() {
  const landing = document.getElementById('landing');
  if (!landing) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'space-travel-canvas';
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
  landing.style.position = 'relative';
  landing.insertBefore(canvas, landing.firstChild);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio, 2);

  let w, h;
  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const PARTICLE_COUNT = 300;
  const FAR_Z = -2000;
  const NEAR_Z = 100;
  const BASE_SPEED = 8;

  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = (Math.random() - 0.5) * w * 4;
      this.y = (Math.random() - 0.5) * h * 4;
      this.z = FAR_Z + Math.random() * Math.abs(FAR_Z);
      this.speed = BASE_SPEED + Math.random() * 4;
      // Slight colour variation
      const r = Math.random();
      if (r < 0.6) {
        this.color = '255,255,255';    // white
      } else if (r < 0.8) {
        this.color = '168,216,255';    // pale blue
      } else {
        this.color = '255,244,168';    // pale yellow
      }
    }

    update() {
      this.z += this.speed;
      if (this.z > NEAR_Z) {
        this.reset();
        this.z = FAR_Z;
      }
    }

    draw() {
      // Project 3D → 2D
      const fov = 400;
      const scale = fov / (fov + Math.abs(this.z));
      const sx = w / 2 + this.x * scale;
      const sy = h / 2 + this.y * scale;

      // Size and opacity increase as star gets closer
      const proximity = 1 - (Math.abs(this.z) / Math.abs(FAR_Z));
      const size = Math.max(0.3, proximity * 3);
      const alpha = Math.max(0, proximity * 0.8);

      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) return;

      // Draw streak/trail for nearby stars
      if (proximity > 0.3) {
        const prevZ = this.z - this.speed * 3;
        const prevScale = fov / (fov + Math.abs(prevZ));
        const prevSx = w / 2 + this.x * prevScale;
        const prevSy = h / 2 + this.y * prevScale;

        ctx.beginPath();
        ctx.moveTo(prevSx, prevSy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${this.color},${alpha * 0.4})`;
        ctx.lineWidth = size * 0.5;
        ctx.stroke();
      }

      // Draw star dot
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${alpha})`;
      ctx.fill();
    }
  }

  const stars = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    stars.push(new Star());
  }

  let running = true;
  let rafId;

  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }
  }

  // Only run when landing is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!running) {
          running = true;
          loop();
        }
      } else {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }, { threshold: 0.05 });

  observer.observe(landing);

  window.addEventListener('resize', resize);
  loop();
}
