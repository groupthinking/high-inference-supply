import { CATALOG, BUNDLES } from './catalog.js';
import { renderPieceActionBar } from './pieceActionBar.js';
import { store } from './store.js';

export function initObjectShowcases() {
  const section = document.getElementById('act-3');
  if (!section) return;

  const objects = CATALOG.filter((item) => item.category === 'object');
  const patchBundle = BUNDLES.find((b) => b.id === 'patch-3-pack');

  section.innerHTML = `
    <div class="gallery-wrap">
      <header class="chapter-intro" data-reveal>
        <span class="chapter-intro__num">Chapter II</span>
        <h2 class="chapter-intro__title">Objects &amp; Insignia</h2>
        <p class="chapter-intro__lead">
          Tactile embroidered editions and enzyme-washed headwear — proportioned to mount onto the Special Ops Chore Coat or stand alone.
        </p>
      </header>

      <div class="objects-gallery">
        ${objects
          .map(
            (item) => `
          <article class="obj-piece" data-reveal>
            <button
              type="button"
              class="obj-piece__plate"
              data-open-stage="${item.id}"
              aria-label="Inspect ${item.name} in Viewing Room"
            >
              <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" />
              <span class="editorial-piece__hover-cue">Inspect Detail</span>
            </button>

            <div class="obj-piece__copy">
              <div class="obj-piece__head">
                <span class="obj-piece__num">N° ${item.number} · ${item.concept}</span>
                <span class="obj-piece__price">$${item.price}</span>
              </div>
              <h3 class="obj-piece__title">${item.name}</h3>
              <p class="obj-piece__desc">${item.tagline}</p>
              ${renderPieceActionBar(item)}
            </div>
          </article>
        `
          )
          .join('')}
      </div>

      ${
        patchBundle
          ? `
        <div class="edition-feature" data-reveal>
          <div class="edition-feature__copy">
            <span class="edition-feature__kicker">Curated Edition · Save $${patchBundle.savings}</span>
            <h3 class="edition-feature__title">${patchBundle.name}</h3>
            <p class="edition-feature__desc">${patchBundle.subtitle}</p>
          </div>
          <div class="edition-feature__cta">
            <span class="edition-feature__price">
              <del>$${patchBundle.retailTotal}</del>
              <strong>$${patchBundle.bundlePrice} USD</strong>
            </span>
            <button type="button" class="lux-btn lux-btn--ink" data-add-bundle="${patchBundle.id}">
              Acquire Trio
            </button>
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;

  section.addEventListener('click', (e) => {
    const stageBtn = e.target.closest('[data-open-stage]');
    if (stageBtn) {
      store.openStage(stageBtn.dataset.openStage);
      return;
    }
    const bundleBtn = e.target.closest('[data-add-bundle]');
    if (bundleBtn) {
      store.addBundle(bundleBtn.dataset.addBundle);
    }
  });
}
