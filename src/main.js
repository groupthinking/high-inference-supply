import './styles/app.css';
import {
  IS_LIVE_STORE,
  ENDPOINT,
  fetchStorefrontCatalog,
  fetchCart,
  createCartWithLine,
  addCartLine,
  updateCartLine,
  removeCartLine,
  formatMoney,
} from './shopifyClient.js';
import { haptics } from './haptics.js';

const CART_ID_KEY = IS_LIVE_STORE ? 'hi_shopify_cart_id_live' : 'hi_shopify_cart_id_mock';

const state = {
  shop: null,
  products: [],
  cart: null,
  activeProduct: null,
  activePolicy: null,
  drawerOpen: false,
  busy: false,
};

const els = {
  banner: document.getElementById('api-banner'),
  storeName: document.getElementById('store-name'),
  footerStoreName: document.getElementById('footer-store-name'),
  catalogCount: document.getElementById('catalog-count'),
  grid: document.getElementById('product-grid'),
  policyLinks: document.getElementById('policy-links'),
  hapticsBtn: document.getElementById('haptics-toggle'),
  hapticsState: document.getElementById('haptics-state'),
  cartOpenBtn: document.getElementById('cart-open-btn'),
  cartCount: document.getElementById('cart-count'),
  backdrop: document.getElementById('modal-backdrop'),
  productModal: document.getElementById('product-modal'),
  policyModal: document.getElementById('policy-modal'),
  drawer: document.getElementById('cart-drawer'),
};

function saveCartId(id) {
  try {
    if (id) window.localStorage.setItem(CART_ID_KEY, id);
    else window.localStorage.removeItem(CART_ID_KEY);
  } catch {
    // ignore storage errors
  }
}

function loadCartId() {
  try {
    return window.localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function syncOverlayState() {
  const anyOpen = state.drawerOpen || Boolean(state.activeProduct) || Boolean(state.activePolicy);
  els.backdrop.classList.toggle('is-open', anyOpen);
  document.body.classList.toggle('hi-no-scroll', anyOpen);
}

function syncHaptics() {
  const on = haptics.isEnabled();
  els.hapticsBtn.setAttribute('aria-pressed', String(on));
  els.hapticsState.textContent = on ? 'On' : 'Off';
}

function renderBanner() {
  if (IS_LIVE_STORE) {
    els.banner.hidden = true;
    return;
  }
  els.banner.hidden = false;
  els.banner.innerHTML = `
    <div class="hi-wrap hi-banner__inner">
      <span>Reference Storefront API (<code>mock.shop</code>) — set <code>VITE_SHOPIFY_STORE_DOMAIN</code> &amp; <code>VITE_SHOPIFY_STOREFRONT_TOKEN</code> in <code>.env</code> to connect live <code>highinference.com</code> vendor inventory.</span>
    </div>
  `;
}

function renderCatalog() {
  if (state.products.length === 0) {
    els.catalogCount.textContent = '0 products';
    els.grid.innerHTML = `
      <div class="hi-empty">
        <h2>No products returned from Shopify</h2>
        <p>Publish vendor-backed products (e.g. Printify / SwiftPOD) to the Headless or Storefront sales channel in Shopify Admin.</p>
      </div>
    `;
    return;
  }

  els.catalogCount.textContent = `${state.products.length} products`;
  els.grid.innerHTML = state.products
    .map((product) => {
      const img = product.featuredImage;
      const price = formatMoney(product.priceRange?.minVariantPrice);
      return `
        <article class="hi-card">
          <button type="button" class="hi-card__trigger" data-open-product="${product.id}">
            <div class="hi-card__media">
              ${
                img
                  ? `<img src="${img.url}" alt="${img.altText || product.title}" class="hi-card__img" loading="lazy" />`
                  : `<div class="hi-card__empty">No image</div>`
              }
              ${!product.availableForSale ? `<span class="hi-card__badge">Sold out</span>` : ''}
            </div>
            <div class="hi-card__meta">
              <h2 class="hi-card__title">${product.title}</h2>
              <span class="hi-card__price">${price}</span>
            </div>
            ${product.vendor ? `<p class="hi-card__vendor">${product.vendor}</p>` : ''}
          </button>
        </article>
      `;
    })
    .join('');
}

function renderPolicies() {
  if (!state.shop) return;
  const policies = [
    state.shop.privacyPolicy,
    state.shop.termsOfService,
    state.shop.refundPolicy,
    state.shop.shippingPolicy,
  ].filter((p) => p && p.body);

  if (policies.length === 0) {
    els.policyLinks.innerHTML = `<span class="hi-footer__note">Configure legal policies in Shopify Admin → Settings → Policies.</span>`;
    return;
  }

  els.policyLinks.innerHTML = policies
    .map(
      (p, idx) =>
        `<button type="button" class="hi-footer__link" data-open-policy="${idx}">${p.title}</button>`
    )
    .join('');
  els.policyLinks._policies = policies;
}

function renderProductModal() {
  const product = state.activeProduct;
  const open = Boolean(product);
  els.productModal.classList.toggle('is-open', open);
  els.productModal.setAttribute('aria-hidden', String(!open));

  if (!product) {
    els.productModal.innerHTML = '';
    syncOverlayState();
    return;
  }

  const variants = product.variants.edges.map((e) => e.node);
  const firstAvailable = variants.find((v) => v.availableForSale) || variants[0];
  const images = product.images.edges.map((e) => e.node);

  els.productModal.innerHTML = `
    <div class="hi-modal__shell">
      <div class="hi-modal__head">
        <span class="hi-kicker">${product.vendor || 'Shopify Catalog'}</span>
        <button type="button" class="hi-header__btn" id="close-product-modal">Close</button>
      </div>
      <div class="hi-modal__grid">
        <div class="hi-modal__media">
          ${
            images.length
              ? images
                  .map(
                    (im) =>
                      `<img src="${im.url}" alt="${im.altText || product.title}" class="hi-modal__img" />`
                  )
                  .join('')
              : `<div class="hi-card__empty">No image</div>`
          }
        </div>
        <div class="hi-modal__body">
          <h2 id="modal-title" class="hi-product__title">${product.title}</h2>
          <p class="hi-product__price" id="modal-price">${formatMoney(firstAvailable?.price)}</p>
          ${product.description ? `<p class="hi-product__desc">${product.description}</p>` : ''}

          <form id="modal-add-form" class="hi-product__form">
            ${
              variants.length > 1
                ? `
              <label for="modal-variant-select" class="hi-label">Option</label>
              <select id="modal-variant-select" class="hi-select">
                ${variants
                  .map(
                    (v) => `
                  <option value="${v.id}" data-price="${formatMoney(v.price)}" ${
                      v.id === firstAvailable?.id ? 'selected' : ''
                    } ${!v.availableForSale ? 'disabled' : ''}>
                    ${v.title}${!v.availableForSale ? ' — Sold out' : ''}
                  </option>
                `
                  )
                  .join('')}
              </select>
            `
                : `<input type="hidden" id="modal-variant-select" value="${firstAvailable?.id || ''}" />`
            }
            <button
              type="submit"
              class="hi-btn hi-btn--solid hi-btn--full"
              ${!firstAvailable?.availableForSale || state.busy ? 'disabled' : ''}
            >
              ${!firstAvailable?.availableForSale ? 'Sold out' : state.busy ? 'Adding…' : 'Add to bag'}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  syncOverlayState();
}

function renderPolicyModal() {
  const policy = state.activePolicy;
  const open = Boolean(policy);
  els.policyModal.classList.toggle('is-open', open);
  els.policyModal.setAttribute('aria-hidden', String(!open));

  if (!policy) {
    els.policyModal.innerHTML = '';
    syncOverlayState();
    return;
  }

  els.policyModal.innerHTML = `
    <div class="hi-modal__shell hi-modal__shell--narrow">
      <div class="hi-modal__head">
        <h2 id="policy-modal-title" class="hi-kicker">${policy.title}</h2>
        <button type="button" class="hi-header__btn" id="close-policy-modal">Close</button>
      </div>
      <div class="hi-policy-body">${policy.body}</div>
    </div>
  `;

  syncOverlayState();
}

function renderCartDrawer() {
  els.drawer.classList.toggle('is-open', state.drawerOpen);
  els.drawer.setAttribute('aria-hidden', String(!state.drawerOpen));
  els.cartOpenBtn.setAttribute('aria-expanded', String(state.drawerOpen));

  const cart = state.cart;
  const qty = cart?.totalQuantity || 0;
  els.cartCount.textContent = String(qty);

  const lines = cart?.lines?.edges?.map((e) => e.node) || [];

  els.drawer.innerHTML = `
    <div class="hi-drawer__head">
      <h2>Bag (${qty})</h2>
      <button type="button" class="hi-header__btn" id="cart-close-btn">Close</button>
    </div>
    <div class="hi-drawer__body">
      ${
        lines.length === 0
          ? `<p class="hi-footer__note">Your Shopify cart is empty.</p>`
          : lines
              .map((line) => {
                const m = line.merchandise;
                const variantTitle = m.title && m.title !== 'Default Title' ? m.title : '';
                return `
                  <div class="hi-drawer-item">
                    ${
                      m.image
                        ? `<img src="${m.image.url}" alt="${m.image.altText || m.product.title}" />`
                        : `<div></div>`
                    }
                    <div>
                      <p class="hi-cart-item__title">${m.product.title}</p>
                      ${variantTitle ? `<p class="hi-cart-item__variant">${variantTitle}</p>` : ''}
                      <p class="hi-cart-item__price">${formatMoney(line.cost.totalAmount)}</p>
                      <div class="hi-cart-item__controls">
                        <div class="hi-drawer-qty">
                          <button type="button" data-line-id="${line.id}" data-next-qty="${line.quantity - 1}" aria-label="Decrease quantity">−</button>
                          <span>${line.quantity}</span>
                          <button type="button" data-line-id="${line.id}" data-next-qty="${line.quantity + 1}" aria-label="Increase quantity">+</button>
                        </div>
                        <button type="button" class="hi-header__btn" data-line-id="${line.id}" data-next-qty="0">Remove</button>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join('')
      }
    </div>
    ${
      lines.length > 0
        ? `
      <div class="hi-drawer__foot">
        <div class="hi-cart-summary__row">
          <span>Subtotal</span>
          <strong>${formatMoney(cart.cost.subtotalAmount)}</strong>
        </div>
        <p class="hi-cart-summary__note">Taxes and shipping calculated at Shopify Checkout.</p>
        <a
          href="${cart.checkoutUrl}"
          class="hi-btn hi-btn--solid hi-btn--full"
          rel="noopener"
        >Proceed to Shopify Checkout</a>
      </div>
    `
        : ''
    }
  `;

  syncOverlayState();
}

async function handleAddVariant(merchandiseId) {
  if (!merchandiseId || state.busy) return;
  state.busy = true;
  renderProductModal();
  try {
    if (state.cart?.id) {
      state.cart = await addCartLine(state.cart.id, merchandiseId, 1);
    } else {
      state.cart = await createCartWithLine(merchandiseId, 1);
      saveCartId(state.cart.id);
    }
    haptics.trigger('addBag');
    state.activeProduct = null;
    state.drawerOpen = true;
  } catch (err) {
    alert(err.message || 'Unable to add item to Shopify cart.');
  } finally {
    state.busy = false;
    renderProductModal();
    renderCartDrawer();
  }
}

async function handleUpdateLine(lineId, nextQty) {
  if (!state.cart?.id || state.busy) return;
  state.busy = true;
  try {
    state.cart =
      nextQty <= 0
        ? await removeCartLine(state.cart.id, lineId)
        : await updateCartLine(state.cart.id, lineId, nextQty);
    haptics.trigger('qtyChange');
  } catch (err) {
    alert(err.message || 'Unable to update cart.');
  } finally {
    state.busy = false;
    renderCartDrawer();
  }
}

function bindEvents() {
  els.hapticsBtn.addEventListener('click', () => {
    haptics.toggle();
    syncHaptics();
  });

  els.cartOpenBtn.addEventListener('click', () => {
    state.activeProduct = null;
    state.activePolicy = null;
    state.drawerOpen = true;
    haptics.trigger('drawerOpen');
    renderProductModal();
    renderPolicyModal();
    renderCartDrawer();
  });

  els.grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-product]');
    if (!btn) return;
    const product = state.products.find((p) => p.id === btn.dataset.openProduct);
    if (!product) return;
    state.activeProduct = product;
    haptics.trigger('stageOpen');
    renderProductModal();
  });

  els.policyLinks.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-policy]');
    if (!btn || !els.policyLinks._policies) return;
    state.activePolicy = els.policyLinks._policies[Number(btn.dataset.openPolicy)] || null;
    renderPolicyModal();
  });

  els.productModal.addEventListener('click', (e) => {
    if (e.target === els.productModal || e.target.closest('#close-product-modal')) {
      state.activeProduct = null;
      haptics.trigger('stageClose');
      renderProductModal();
    }
  });

  els.productModal.addEventListener('change', (e) => {
    if (e.target.id === 'modal-variant-select') {
      const opt = e.target.options[e.target.selectedIndex];
      const priceEl = document.getElementById('modal-price');
      if (opt?.dataset.price && priceEl) priceEl.textContent = opt.dataset.price;
      haptics.trigger('sizeChange');
    }
  });

  els.productModal.addEventListener('submit', (e) => {
    if (e.target.id !== 'modal-add-form') return;
    e.preventDefault();
    const sel = document.getElementById('modal-variant-select');
    if (sel?.value) handleAddVariant(sel.value);
  });

  els.policyModal.addEventListener('click', (e) => {
    if (e.target === els.policyModal || e.target.closest('#close-policy-modal')) {
      state.activePolicy = null;
      renderPolicyModal();
    }
  });

  els.drawer.addEventListener('click', (e) => {
    if (e.target.closest('#cart-close-btn')) {
      state.drawerOpen = false;
      haptics.trigger('drawerClose');
      renderCartDrawer();
      return;
    }
    const qtyBtn = e.target.closest('[data-line-id]');
    if (qtyBtn) {
      handleUpdateLine(qtyBtn.dataset.lineId, Number(qtyBtn.dataset.nextQty));
    }
  });

  els.backdrop.addEventListener('click', () => {
    state.activeProduct = null;
    state.activePolicy = null;
    state.drawerOpen = false;
    renderProductModal();
    renderPolicyModal();
    renderCartDrawer();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.activeProduct || state.activePolicy || state.drawerOpen) {
      state.activeProduct = null;
      state.activePolicy = null;
      state.drawerOpen = false;
      renderProductModal();
      renderPolicyModal();
      renderCartDrawer();
    }
  });
}

async function boot() {
  syncHaptics();
  renderBanner();
  bindEvents();

  try {
    const data = await fetchStorefrontCatalog(24);
    state.shop = data.shop;
    state.products = data.products.edges.map((e) => e.node);

    const displayName = IS_LIVE_STORE && data.shop?.name ? data.shop.name : 'High Inference';
    els.storeName.textContent = displayName;
    els.footerStoreName.textContent = displayName;

    renderCatalog();
    renderPolicies();

    const savedCartId = loadCartId();
    if (savedCartId) {
      try {
        const existing = await fetchCart(savedCartId);
        if (existing) state.cart = existing;
        else saveCartId(null);
      } catch {
        saveCartId(null);
      }
    }
    renderCartDrawer();
  } catch (err) {
    els.catalogCount.textContent = 'Connection error';
    els.grid.innerHTML = `
      <div class="hi-empty">
        <h2>Unable to reach Shopify Storefront API</h2>
        <p>${err.message}</p>
        <p>Endpoint: <code>${ENDPOINT}</code></p>
      </div>
    `;
  }
}

boot();
