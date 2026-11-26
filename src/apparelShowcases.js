import { CATALOG } from './catalog.js';
import { renderPieceActionBar } from './pieceActionBar.js';
import { store } from './store.js';

export function initApparelShowcases() {
  const section = document.getElementById('act-2');
  if (!section) return;

  const apparel = CATALOG.filter((item) => item.category === 'apparel');

  section.innerHTML = `
    <div class="gallery-wrap">
      <header class="chapter-intro" data-reveal>
        <span class="chapter-intro__num">Chapter I</span>
        <h2 class="chapter-intro__title">The Garments</h2>
        <p class="chapter-intro__lead">
          Six heavyweight silhouettes cut from garment-dyed cotton, organic boxy fleece, and twelve-ounce duck canvas.
          Select any photograph to enter the Viewing Room.
        </p>
      </header>

      <div class="editorial-stack">
        ${apparel
          .map(
            (product, idx) => `
          <article
            class="editorial-piece ${idx % 2 === 1 ? 'editorial-piece--flip' : ''}"
            data-showcase-id="${product.id}"
            data-reveal
          >
            <div class="editorial-piece__media">
              <button
                type="button"
                class="editorial-piece__plate"
                data-open-stage="${product.id}"
                aria-label="Inspect ${product.name} in Viewing Room"
              >
                <img
                  src="${product.image}"
                  alt="${product.name}"
                  class="editorial-piece__img"
                  loading="${idx === 0 ? 'eager' : 'lazy'}"
                  decoding="async"
                />
                <span class="editorial-piece__hover-cue">Inspect Detail</span>
              </button>
            </div>

            <div class="editorial-piece__copy">
              <div class="editorial-piece__meta">
                <span>N° ${product.number}</span>
                <span>${product.concept}</span>
              </div>

              <h3 class="editorial-piece__title">${product.name}</h3>
              <p class="editorial-piece__price">$${product.price} USD</p>
              <p class="editorial-piece__desc">${product.description}</p>

              <div class="editorial-piece__spec-line">
                <span>${product.color}</span>
                <span class="spec-sep" aria-hidden="true">/</span>
                <span>${product.blank}</span>
              </div>

              ${renderPieceActionBar(product)}
            </div>
          </article>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  section.addEventListener('click', (e) => {
    const plate = e.target.closest('[data-open-stage]');
    if (!plate) return;
    const id = plate.dataset.openStage;
    const card = plate.closest('.editorial-piece');
    const selectedSize = card?.querySelector('.pab')?.dataset.selectedSize || null;
    store.openStage(id, selectedSize);
  });

  const imgs = Array.from(section.querySelectorAll('.editorial-piece__img'));
  return {
    onScroll() {
      const vh = window.innerHeight;
      for (const img of imgs) {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) continue;
        const norm = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        img.style.transform = `translate3d(0, ${norm * -14}px, 0) scale(1.035)`;
      }
    },
  };
}
