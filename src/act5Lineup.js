import { CATALOG, BUNDLES } from './catalog.js';
import { store } from './store.js';

export function initAct5Lineup() {
  const section = document.getElementById('act-5');
  if (!section) return;

  const completeBundle = BUNDLES.find((b) => b.id === 'complete-drop-01');
  const builderBundle = BUNDLES.find((b) => b.id === 'builder-kit');

  section.innerHTML = `
    <div class="chapter-header">
      <div class="chapter-header__index">ACT 05 // COMPLETE LINEUP</div>
      <div class="chapter-header__body">
        <h2 class="chapter-header__title">Drop 01 Archive Index</h2>
        <p class="chapter-header__desc">
          All 10 pieces from the inaugural High Inference supply drop. Acquire individually or secure the complete archival set.
        </p>
      </div>
    </div>

    <div class="lineup-bundles" data-reveal>
      ${
        completeBundle
          ? `
        <div class="bundle-hero-card">
          <div>
            <span class="mono-tag mono-tag--ochre">COMPLETE SET · SAVE $${completeBundle.savings}</span>
            <h3 class="bundle-hero-card__title">${completeBundle.name}</h3>
            <p class="bundle-hero-card__sub">${completeBundle.subtitle}</p>
          </div>
          <div class="bundle-hero-card__cta">
            <div class="bundle-hero-card__pricing">
              <span class="bundle-hero-card__strike">$${completeBundle.retailTotal}</span>
              <span class="bundle-hero-card__price">$${completeBundle.bundlePrice}</span>
            </div>
            <button type="button" class="btn btn--ochre btn--lg" id="add-complete-set-btn" data-add-bundle="${completeBundle.id}">
              Add Complete Set
            </button>
          </div>
        </div>
      `
          : ''
      }
      ${
        builderBundle
          ? `
        <div class="bundle-hero-card bundle-hero-card--secondary">
          <div>
            <span class="mono-tag">CURATED KIT · SAVE $${builderBundle.savings}</span>
            <h3 class="bundle-hero-card__title">${builderBundle.name}</h3>
            <p class="bundle-hero-card__sub">${builderBundle.subtitle}</p>
          </div>
          <div class="bundle-hero-card__cta">
            <div class="bundle-hero-card__pricing">
              <span class="bundle-hero-card__strike">$${builderBundle.retailTotal}</span>
              <span class="bundle-hero-card__price">$${builderBundle.bundlePrice}</span>
            </div>
            <button type="button" class="btn btn--primary" data-add-bundle="${builderBundle.id}">
              Add Builder Kit
            </button>
          </div>
        </div>
      `
          : ''
      }
    </div>

    <div class="lineup-grid">
      ${CATALOG.map(
        (item) => `
        <article class="lineup-card" data-reveal>
          <button
            type="button"
            class="lineup-card__media"
            data-open-stage="${item.id}"
            aria-label="Inspect ${item.name}"
          >
            <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" />
            <span class="lineup-card__badge">${item.number}</span>
          </button>
          <div class="lineup-card__meta">
            <div class="lineup-card__row">
              <span class="lineup-card__sku">${item.sku}</span>
              <span class="lineup-card__price">$${item.price}</span>
            </div>
            <h3 class="lineup-card__title">${item.shortName}</h3>
            <p class="lineup-card__blank">${item.color}</p>
            <div class="lineup-card__actions">
              <button type="button" class="btn btn--ghost btn--sm" data-open-stage="${item.id}">
                Stage
              </button>
              <button type="button" class="btn btn--primary btn--sm" data-quick-add="${item.id}">
                + Bag
              </button>
            </div>
          </div>
        </article>
      `
      ).join('')}
    </div>

    <footer class="site-footer">
      <div class="site-footer__left">
        <span class="site-footer__brand">HIGH INFERENCE // PROBABLE SYSTEMS</span>
        <span class="site-footer__sub">highinference.com · Drop 01 Retro-Futuristic Community Supply</span>
      </div>
      <div class="site-footer__right">
        <span class="mono-tag">SHOPIFY FALL ’26 READY</span>
        <span class="mono-tag">WEBMCP ACTIONS ACTIVE</span>
        <span class="mono-tag">© 2026 HIGH INFERENCE</span>
      </div>
    </footer>
  `;

  section.addEventListener('click', (e) => {
    const bundleBtn = e.target.closest('[data-add-bundle]');
    if (bundleBtn) {
      store.addBundle(bundleBtn.dataset.addBundle);
      return;
    }

    const stageBtn = e.target.closest('[data-open-stage]');
    if (stageBtn) {
      store.openStage(stageBtn.dataset.openStage);
      return;
    }

    const quickAdd = e.target.closest('[data-quick-add]');
    if (quickAdd) {
      store.addToBag(quickAdd.dataset.quickAdd);
    }
  });
}
