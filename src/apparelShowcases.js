import { CATALOG } from './catalog.js';
import { renderPieceActionBar } from './pieceActionBar.js';
import { store } from './store.js';

export function initApparelShowcases() {
  const section = document.getElementById('act-2');
  if (!section) return;

  const apparel = CATALOG.filter((item) => item.category === 'apparel');

  section.innerHTML = `
    <div class="chapter-header">
      <div class="chapter-header__index">ACT 02 // APPAREL</div>
      <div class="chapter-header__body">
        <h2 class="chapter-header__title">Heavyweight Field Garments</h2>
        <p class="chapter-header__desc">
          Built around vintage 1980s aerospace schematics, CRT terminal telemetry, and pigment-dyed blanks.
          Click any garment frame to inspect multi-angle specs inside the interactive Product Stage.
        </p>
      </div>
    </div>

    <div class="showcase-stack">
      ${apparel
        .map(
          (product, idx) => `
        <article
          class="showcase ${idx % 2 === 1 ? 'showcase--reverse' : ''}"
          data-showcase-id="${product.id}"
          data-reveal
        >
          <div class="showcase__media-col">
            <button
              type="button"
              class="showcase__frame"
              data-open-stage="${product.id}"
              aria-label="Inspect ${product.name} in Product Stage"
            >
              <div class="showcase__frame-top">
                <span class="mono-tag">${product.sku}</span>
                <span class="mono-tag">CLICK TO INSPECT STAGE ↗</span>
              </div>
              <div class="showcase__img-wrap">
                <img
                  src="${product.image}"
                  alt="${product.name}"
                  class="showcase__img"
                  loading="${idx === 0 ? 'eager' : 'lazy'}"
                  decoding="async"
                />
              </div>
              <div class="showcase__frame-bottom">
                <span>${product.color}</span>
                <span>${product.angles.length} VIEWS</span>
              </div>
            </button>
          </div>

          <div class="showcase__info-col">
            <div class="showcase__eyebrow">
              <span class="showcase__num">${product.number}</span>
              <span class="showcase__concept">${product.concept.toUpperCase()}</span>
              <span class="showcase__price-inline">$${product.price} USD</span>
            </div>

            <h3 class="showcase__title">${product.name}</h3>
            <p class="showcase__tagline">${product.tagline}</p>
            <p class="showcase__desc">${product.description}</p>

            <dl class="spec-grid">
              <div class="spec-grid__row">
                <dt>BLANK</dt>
                <dd>${product.blank}</dd>
              </div>
              <div class="spec-grid__row">
                <dt>PRINT / FINISH</dt>
                <dd>${product.printMethod}</dd>
              </div>
              <div class="spec-grid__row">
                <dt>MARK SPEC</dt>
                <dd>${product.markRank}</dd>
              </div>
              <div class="spec-grid__row">
                <dt>PACKAGING</dt>
                <dd>${product.packaging}</dd>
              </div>
            </dl>

            ${renderPieceActionBar(product)}
          </div>
        </article>
      `
        )
        .join('')}
    </div>
  `;

  section.addEventListener('click', (e) => {
    const frame = e.target.closest('[data-open-stage]');
    if (!frame) return;
    const id = frame.dataset.openStage;
    const card = frame.closest('.showcase');
    const selectedSize = card?.querySelector('.pab')?.dataset.selectedSize || null;
    store.openStage(id, selectedSize);
  });

  // Subtle kinetic scroll parallax on showcase images
  const frames = Array.from(section.querySelectorAll('.showcase__img'));
  return {
    onScroll() {
      const vh = window.innerHeight;
      for (const img of frames) {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) continue;
        const norm = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        img.style.transform = `translate3d(0, ${norm * -18}px, 0) scale(1.03)`;
      }
    },
  };
}
