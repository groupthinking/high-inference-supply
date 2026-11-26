import { store } from './store.js';
import { haptics } from './haptics.js';

/**
 * Refined, minimal inline piece action bar for light gallery and dark archive surfaces.
 */
export function renderPieceActionBar(product) {
  const sizesHtml =
    product.sizes.length > 1
      ? `<div class="pab__sizes" role="group" aria-label="Select size for ${product.shortName}">
          <span class="pab__size-label">Size</span>
          ${product.sizes
            .map(
              (size) => `
            <button
              type="button"
              class="pab__size ${size === product.defaultSize ? 'is-selected' : ''}"
              data-size="${size}"
              aria-pressed="${size === product.defaultSize ? 'true' : 'false'}"
            >${size}</button>
          `
            )
            .join('')}
        </div>`
      : `<div class="pab__sizes"><span class="pab__size-label">One Size · Archival Proportion</span></div>`;

  return `
    <div class="pab" data-product-id="${product.id}" data-selected-size="${product.defaultSize}">
      ${sizesHtml}
      <div class="pab__actions">
        <button type="button" class="lux-btn lux-btn--ink pab__add" data-add="${product.id}">
          <span>Add to Bag</span>
          <span class="pab__dot" aria-hidden="true">·</span>
          <span>$${product.price}</span>
        </button>
        <button type="button" class="lux-btn lux-btn--outline pab__inspect" data-inspect="${product.id}">
          Viewing Room
        </button>
      </div>
    </div>
  `;
}

export function bindPieceActionBars(root = document) {
  root.addEventListener('click', (e) => {
    const sizeBtn = e.target.closest('.pab__size');
    if (sizeBtn) {
      const bar = sizeBtn.closest('.pab');
      if (!bar) return;
      const nextSize = sizeBtn.dataset.size;
      bar.dataset.selectedSize = nextSize;
      bar.querySelectorAll('.pab__size').forEach((b) => {
        const active = b.dataset.size === nextSize;
        b.classList.toggle('is-selected', active);
        b.setAttribute('aria-pressed', String(active));
      });
      haptics.trigger('sizeChange');
      return;
    }

    const inspectBtn = e.target.closest('[data-inspect]');
    if (inspectBtn) {
      const productId = inspectBtn.dataset.inspect;
      const bar = inspectBtn.closest('.pab');
      const selectedSize = bar?.dataset.selectedSize || null;
      store.openStage(productId, selectedSize);
      return;
    }

    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      const productId = addBtn.dataset.add;
      const bar = addBtn.closest('.pab');
      const selectedSize = bar?.dataset.selectedSize || null;
      store.addToBag(productId, selectedSize, 1);
    }
  });
}
