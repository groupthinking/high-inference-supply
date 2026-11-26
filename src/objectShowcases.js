import { CATALOG, BUNDLES } from './catalog.js';
import { renderPieceActionBar } from './pieceActionBar.js';
import { store } from './store.js';

export function initObjectShowcases() {
  const section = document.getElementById('act-3');
  if (!section) return;

  const objects = CATALOG.filter((item) => item.category === 'object');
  const patchBundle = BUNDLES.find((b) => b.id === 'patch-3-pack');

  section.innerHTML = `
    <div class="chapter-header">
      <div class="chapter-header__index">ACT 03 // OBJECTS &amp; HARDWARE</div>
      <div class="chapter-header__body">
        <h2 class="chapter-header__title">Headwear &amp; Mission Patches</h2>
        <p class="chapter-header__desc">
          Tactile embroidered artifacts engineered for backpacks, flight jackets, and the Special Ops 12oz Chore Coat.
        </p>
      </div>
    </div>

    <div class="objects-grid">
      ${objects
        .map(
          (item) => `
        <article class="object-card" data-reveal>
          <button
            type="button"
            class="object-card__media"
            data-open-stage="${item.id}"
            aria-label="Inspect ${item.name} in Product Stage"
          >
            <div class="object-card__top">
              <span class="mono-tag">${item.sku}</span>
              <span class="mono-tag">INSPECT ↗</span>
            </div>
            <div class="object-card__img-wrap">
              <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" />
            </div>
          </button>

          <div class="object-card__body">
            <div class="object-card__head">
              <span class="object-card__num">${item.number} // ${item.concept.toUpperCase()}</span>
              <span class="object-card__price">$${item.price}</span>
            </div>
            <h3 class="object-card__title">${item.name}</h3>
            <p class="object-card__desc">${item.tagline}</p>
            <p class="object-card__spec">${item.blank}</p>
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
      <div class="bundle-callout" data-reveal>
        <div class="bundle-callout__info">
          <span class="mono-tag mono-tag--ochre">ZERO-FRICTION ARCHIVE BUNDLE</span>
          <h3 class="bundle-callout__title">${patchBundle.name} — $${patchBundle.bundlePrice}</h3>
          <p class="bundle-callout__desc">
            ${patchBundle.subtitle}. All three merrowed-edge hook-and-iron-on mission patches in one stay-flat archival pack (Save $${patchBundle.savings}).
          </p>
        </div>
        <button type="button" class="btn btn--ochre btn--lg" data-add-bundle="${patchBundle.id}">
          Add Patch 3-Pack · $${patchBundle.bundlePrice}
        </button>
      </div>
    `
        : ''
    }
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
