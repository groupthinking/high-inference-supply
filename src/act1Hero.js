import { store } from './store.js';

export function initAct1Hero() {
  const section = document.getElementById('act-1');
  if (!section) return;

  section.innerHTML = `
    <div class="hero__inner">
      <div class="hero__top-whisper">
        <span>Probable Systems</span>
        <span>Edition 01 · Autumn 2026</span>
      </div>

      <div class="hero__center">
        <p class="hero__eyebrow">HIGHINFERENCE.COM</p>
        <h1 class="hero__title" id="hero-title">
          <span class="hero__title-main">High Inference</span>
          <span class="hero__title-italic">Physical Matter for the Analog Frontier</span>
        </h1>
        <p class="hero__lead">
          Heavyweight garment-dyed cotton, twelve-ounce duck canvas, and archival embroidered insignia —
          crafted in small quantities for builders who live beyond the screen.
        </p>

        <div class="hero__actions">
          <button type="button" class="lux-btn lux-btn--ivory" id="hero-enter-btn">
            Explore Edition 01
          </button>
          <button type="button" class="lux-btn lux-btn--ghost-light" id="hero-lineup-btn">
            View Complete Archive
          </button>
        </div>
      </div>

      <div class="hero__foot">
        <span class="hero__foot-note">Complimentary archival shipping on orders over $125</span>
        <button type="button" class="hero__scroll-cue" id="hero-scroll-cue" aria-label="Scroll to Garments">
          <span>Scroll</span>
          <span class="hero__scroll-line" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  `;

  const goToGarments = () => {
    store.setActiveChapter(2, true);
    document.getElementById('act-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.getElementById('hero-enter-btn')?.addEventListener('click', goToGarments);
  document.getElementById('hero-scroll-cue')?.addEventListener('click', goToGarments);
  document.getElementById('hero-lineup-btn')?.addEventListener('click', () => {
    store.setActiveChapter(5, true);
    document.getElementById('act-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const titleEl = document.getElementById('hero-title');

  return {
    onScroll({ scrollY }) {
      if (titleEl && scrollY < window.innerHeight * 1.15) {
        const progress = Math.min(1, scrollY / (window.innerHeight * 0.85));
        titleEl.style.transform = `translate3d(0, ${progress * 34}px, 0)`;
        titleEl.style.opacity = String(Math.max(0.12, 1 - progress * 0.88));
      }
    },
  };
}
