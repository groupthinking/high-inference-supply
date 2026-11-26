import { store } from './store.js';

export function initAct1Hero() {
  const section = document.getElementById('act-1');
  if (!section) return;

  section.innerHTML = `
    <div class="hero__inner">
      <div class="hero__meta-row">
        <span class="mono-tag">PROBABLE SYSTEMS // HI—01</span>
        <span class="mono-tag">FALL ’26 ANALOG ARCHIVE</span>
        <span class="mono-tag">HIGHINFERENCE.COM</span>
      </div>

      <div class="hero__center">
        <p class="hero__kicker">DROP 01 — COMMUNITY HARDWARE &amp; HEAVYWEIGHT APPAREL</p>
        <h1 class="hero__title" id="hero-title">
          <span class="hero__title-line">HIGH</span>
          <span class="hero__title-line hero__title-line--offset">INFERENCE</span>
        </h1>
        <p class="hero__subtitle">
          Physical artifacts for builders on the frontier. Comfort Colors 6014 smoke-blue long sleeves,
          420GSM phosphor-amber hoodies, 12oz duck canvas chore coats, and merrowed mission patches.
        </p>

        <div class="hero__cta-row">
          <button type="button" class="btn btn--primary btn--lg" id="hero-enter-btn">
            <span>Enter Drop 01</span>
            <span class="btn__arrow" aria-hidden="true">↓</span>
          </button>
          <button type="button" class="btn btn--ghost btn--lg" id="hero-lineup-btn">
            <span>View Full Lineup (10)</span>
          </button>
        </div>
      </div>

      <div class="hero__telemetry">
        <div class="telemetry-cell">
          <span class="telemetry-cell__k">FIELD RENDER</span>
          <span class="telemetry-cell__v">WEBGL2 // LIVE</span>
        </div>
        <div class="telemetry-cell">
          <span class="telemetry-cell__k">GARMENT SPEC</span>
          <span class="telemetry-cell__v">270–420 GSM · 12OZ CANVAS</span>
        </div>
        <div class="telemetry-cell">
          <span class="telemetry-cell__k">FREE SHIPPING</span>
          <span class="telemetry-cell__v">ORDERS OVER $125</span>
        </div>
        <div class="telemetry-cell">
          <span class="telemetry-cell__k">SCROLL VELOCITY</span>
          <span class="telemetry-cell__v" id="hero-vel-readout">0.00 PX/F</span>
        </div>
      </div>
    </div>
  `;

  const enterBtn = document.getElementById('hero-enter-btn');
  const lineupBtn = document.getElementById('hero-lineup-btn');

  enterBtn?.addEventListener('click', () => {
    store.setActiveChapter(2, true);
    document.getElementById('act-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  lineupBtn?.addEventListener('click', () => {
    store.setActiveChapter(5, true);
    document.getElementById('act-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const velEl = document.getElementById('hero-vel-readout');
  const titleEl = document.getElementById('hero-title');

  return {
    onScroll({ scrollY, velocity }) {
      if (velEl) {
        velEl.textContent = `${Math.abs(velocity).toFixed(2)} PX/F`;
      }
      if (titleEl && scrollY < window.innerHeight * 1.2) {
        const progress = Math.min(1, scrollY / (window.innerHeight * 0.9));
        titleEl.style.transform = `translate3d(0, ${progress * 42}px, 0)`;
        titleEl.style.opacity = String(Math.max(0.18, 1 - progress * 0.82));
      }
    },
  };
}
