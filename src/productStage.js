import { getProductById } from './catalog.js';
import { store } from './store.js';

export function initProductStage() {
  const stageEl = document.getElementById('product-stage');
  if (!stageEl) return;

  const render = (state) => {
    const product = state.stageProductId ? getProductById(state.stageProductId) : null;
    const isOpen = Boolean(product);

    stageEl.classList.toggle('is-open', isOpen);
    stageEl.setAttribute('aria-hidden', String(!isOpen));

    if (!product) {
      stageEl.innerHTML = '';
      return;
    }

    const angleIdx = Math.min(state.stageAngleIndex, product.angles.length - 1);
    const activeAngle = product.angles[angleIdx] || product.angles[0];

    stageEl.innerHTML = `
      <div class="stage__shell">
        <div class="stage__topbar">
          <div class="stage__crumb">
            <span class="mono-tag">${product.sku}</span>
            <span class="stage__crumb-sep">/</span>
            <span class="mono-tag">${product.concept.toUpperCase()}</span>
            <span class="stage__crumb-sep">/</span>
            <span class="mono-tag">INTERACTIVE STAGE</span>
          </div>
          <button type="button" class="stage__close" id="stage-close-btn" aria-label="Close product stage">
            <span>CLOSE</span>
            <span class="mono-tag">[ ESC ]</span>
          </button>
        </div>

        <div class="stage__grid">
          <div class="stage__viewer-col">
            <div class="stage__canvas ${activeAngle.darkBg ? 'stage__canvas--dark' : ''}" id="stage-tilt-canvas">
              <img
                src="${activeAngle.src}"
                alt="${product.name} — ${activeAngle.label}"
                class="stage__img"
                id="stage-main-img"
              />
              <div class="stage__caption">
                <span>${activeAngle.label.toUpperCase()}</span>
                <span>${activeAngle.caption}</span>
              </div>
            </div>

            <div class="stage__angles" role="tablist" aria-label="Product angles">
              ${product.angles
                .map(
                  (ang, idx) => `
                <button
                  type="button"
                  role="tab"
                  class="stage__angle-btn ${idx === angleIdx ? 'is-active' : ''}"
                  data-angle-idx="${idx}"
                  aria-selected="${idx === angleIdx ? 'true' : 'false'}"
                >
                  <span class="stage__angle-num">0${idx + 1}</span>
                  <span>${ang.label}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="stage__detail-col">
            <div class="stage__head">
              <span class="mono-tag mono-tag--ochre">DROP 01 · ${product.category.toUpperCase()}</span>
              <h2 class="stage__title" id="stage-title">${product.name}</h2>
              <div class="stage__price">$${product.price} USD</div>
            </div>

            <p class="stage__desc">${product.description}</p>

            <div class="stage__size-block">
              <div class="stage__label-row">
                <span class="mono-tag">SELECT SIZE</span>
                <span class="mono-tag">${product.color.toUpperCase()}</span>
              </div>
              <div class="stage__sizes" role="group" aria-label="Choose size">
                ${product.sizes
                  .map(
                    (s) => `
                  <button
                    type="button"
                    class="stage__size-btn ${s === state.stageSize ? 'is-selected' : ''}"
                    data-stage-size="${s}"
                    aria-pressed="${s === state.stageSize ? 'true' : 'false'}"
                  >${s}</button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <dl class="spec-grid spec-grid--compact">
              <div class="spec-grid__row">
                <dt>GARMENT / BLANK</dt>
                <dd>${product.blank}</dd>
              </div>
              <div class="spec-grid__row">
                <dt>PRINT METHOD</dt>
                <dd>${product.printMethod}</dd>
              </div>
              <div class="spec-grid__row">
                <dt>MARK PLACEMENT</dt>
                <dd>${product.markRank}</dd>
              </div>
              <div class="spec-grid__row">
                <dt>PACKAGING SPEC</dt>
                <dd>${product.packaging}</dd>
              </div>
            </dl>

            <div class="stage__cta-stack">
              <button type="button" class="btn btn--primary btn--lg stage__add-btn" id="stage-add-btn">
                <span>Add to Bag — ${state.stageSize}</span>
                <span>$${product.price}</span>
              </button>
              <button type="button" class="btn btn--ghost stage__add-open-btn" id="stage-add-open-btn">
                Add &amp; Open Bag Drawer
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind subtle 3D pointer tilt on the stage viewer
    const tiltCanvas = document.getElementById('stage-tilt-canvas');
    const mainImg = document.getElementById('stage-main-img');
    if (tiltCanvas && mainImg) {
      tiltCanvas.addEventListener('pointermove', (e) => {
        const rect = tiltCanvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        mainImg.style.transform = `perspective(900px) rotateY(${nx * 8}deg) rotateX(${ny * -8}deg) scale(1.03)`;
      });
      tiltCanvas.addEventListener('pointerleave', () => {
        mainImg.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)';
      });
    }
  };

  stageEl.addEventListener('click', (e) => {
    if (e.target === stageEl || e.target.closest('#stage-close-btn')) {
      store.closeStage();
      return;
    }

    const angleBtn = e.target.closest('[data-angle-idx]');
    if (angleBtn) {
      store.setStageAngle(Number(angleBtn.dataset.angleIdx));
      return;
    }

    const sizeBtn = e.target.closest('[data-stage-size]');
    if (sizeBtn) {
      store.setStageSize(sizeBtn.dataset.stageSize);
      return;
    }

    if (e.target.closest('#stage-add-btn')) {
      store.addToBag(store.state.stageProductId, store.state.stageSize, 1);
      return;
    }

    if (e.target.closest('#stage-add-open-btn')) {
      store.addToBag(store.state.stageProductId, store.state.stageSize, 1, {
        openAfter: true,
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!store.state.stageProductId) return;
    if (e.key === 'Escape') {
      store.closeStage();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const product = getProductById(store.state.stageProductId);
      if (!product || product.angles.length <= 1) return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (store.state.stageAngleIndex + dir + product.angles.length) % product.angles.length;
      store.setStageAngle(next);
    }
  });

  store.subscribe(render);
  render(store.state);
}
