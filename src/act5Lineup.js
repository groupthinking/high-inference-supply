import { CATALOG, BUNDLES } from './catalog.js';
import { store } from './store.js';

export function initAct5Lineup() {
  const section = document.getElementById('act-5');
  if (!section) return;

  const completeBundle = BUNDLES.find((b) => b.id === 'complete-drop-01');
  const builderBundle = BUNDLES.find((b) => b.id === 'builder-kit');

  section.innerHTML = `
    <div class="gallery-wrap">
      <header class="chapter-intro chapter-intro--dark" data-reveal>
        <span class="chapter-intro__num">Chapter IV · Finale</span>
        <h2 class="chapter-intro__title">The Complete Archive</h2>
        <p class="chapter-intro__lead">
          All ten works from Edition 01. Acquire individual silhouettes or reserve the complete archival box.
        </p>
      </header>

      <div class="archive-editions" data-reveal>
        ${
          completeBundle
            ? `
          <div class="archive-edition archive-edition--primary">
            <div>
              <span class="archive-edition__kicker">Complete Set · Save $${completeBundle.savings}</span>
              <h3 class="archive-edition__title">${completeBundle.name}</h3>
              <p class="archive-edition__sub">${completeBundle.subtitle}</p>
            </div>
            <div class="archive-edition__action">
              <div class="archive-edition__price">
                <del>$${completeBundle.retailTotal}</del>
                <strong>$${completeBundle.bundlePrice} USD</strong>
              </div>
              <button type="button" class="lux-btn lux-btn--bronze" id="add-complete-set-btn" data-add-bundle="${completeBundle.id}">
                Acquire Complete Set
              </button>
            </div>
          </div>
        `
            : ''
        }

        ${
          builderBundle
            ? `
          <div class="archive-edition">
            <div>
              <span class="archive-edition__kicker">Curated Trio · Save $${builderBundle.savings}</span>
              <h3 class="archive-edition__title">${builderBundle.name}</h3>
              <p class="archive-edition__sub">${builderBundle.subtitle}</p>
            </div>
            <div class="archive-edition__action">
              <div class="archive-edition__price">
                <del>$${builderBundle.retailTotal}</del>
                <strong>$${builderBundle.bundlePrice} USD</strong>
              </div>
              <button type="button" class="lux-btn lux-btn--ivory" data-add-bundle="${builderBundle.id}">
                Acquire Uniform
              </button>
            </div>
          </div>
        `
            : ''
        }
      </div>

      <div class="archive-grid">
        ${CATALOG.map(
          (item) => `
          <article class="archive-item" data-reveal>
            <button
              type="button"
              class="archive-item__media"
              data-open-stage="${item.id}"
              aria-label="Inspect ${item.name}"
            >
              <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" />
              <span class="archive-item__num">${item.number}</span>
            </button>
            <div class="archive-item__body">
              <div class="archive-item__row">
                <h3 class="archive-item__title">${item.shortName}</h3>
                <span class="archive-item__price">$${item.price}</span>
              </div>
              <p class="archive-item__color">${item.color}</p>
              <div class="archive-item__links">
                <button type="button" class="archive-link" data-open-stage="${item.id}">Inspect</button>
                <button type="button" class="archive-link archive-link--accent" data-quick-add="${item.id}">Add to Bag</button>
              </div>
            </div>
          </article>
        `
        ).join('')}
      </div>

      <footer class="colophon">
        <div class="colophon__brand">
          <span class="colophon__wordmark">HIGH INFERENCE</span>
          <span class="colophon__note">Probable Systems · Edition 01 · highinference.com</span>
        </div>
        <div class="colophon__meta">
          <span>Complimentary shipping over $125</span>
          <span>© 2026 High Inference</span>
        </div>
      </footer>
    </div>
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
