import { FREE_SHIPPING_THRESHOLD, getProductById } from './catalog.js';
import { store } from './store.js';

export function initBagDrawer() {
  const drawerEl = document.getElementById('bag-drawer');
  const backdropEl = document.getElementById('overlay-backdrop');
  if (!drawerEl) return;

  const render = (state) => {
    const isOpen = state.drawerOpen;
    drawerEl.classList.toggle('is-open', isOpen);
    drawerEl.setAttribute('aria-hidden', String(!isOpen));

    if (backdropEl) {
      backdropEl.classList.toggle('is-visible', isOpen || Boolean(state.stageProductId));
    }

    document.body.classList.toggle('no-scroll', isOpen || Boolean(state.stageProductId));

    const totals = store.getBagTotals();
    const count = store.getBagCount();
    const shipPct = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

    let bodyHtml = '';

    if (state.checkoutComplete) {
      bodyHtml = `
        <div class="drawer__empty">
          <span class="drawer__kicker">Allocation Staged</span>
          <h3>Ready for Checkout</h3>
          <p>
            Your Edition 01 selection is reserved in this session. Connect your live Shopify Storefront
            token to route seamlessly to highinference.com checkout.
          </p>
          <button type="button" class="lux-btn lux-btn--ink" id="drawer-continue-btn">
            Return to Archive
          </button>
        </div>
      `;
    } else if (state.bag.length === 0) {
      bodyHtml = `
        <div class="drawer__empty">
          <span class="drawer__kicker">Empty</span>
          <h3>Your bag is currently empty.</h3>
          <p>
            Explore our heavyweight garments and embroidered insignia, or reserve the complete Edition 01 archive.
          </p>
          <button type="button" class="lux-btn lux-btn--outline" id="drawer-jump-lineup">
            View Complete Archive
          </button>
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="drawer__ship-bar">
          <div class="drawer__ship-text">
            ${
              totals.freeShippingUnlocked
                ? 'Complimentary priority archival shipping unlocked.'
                : `Add $${totals.remainingForFreeShip} more for complimentary archival shipping.`
            }
          </div>
          <div class="drawer__ship-track">
            <div class="drawer__ship-fill" style="width: ${shipPct}%"></div>
          </div>
        </div>

        <ul class="drawer__list">
          ${state.bag
            .map((item) => {
              const p = getProductById(item.productId);
              if (!p) return '';
              return `
                <li class="bag-item">
                  <img src="${p.image}" alt="${p.shortName}" class="bag-item__thumb" />
                  <div class="bag-item__info">
                    <div class="bag-item__top">
                      <span class="bag-item__name">${p.shortName}</span>
                      <span class="bag-item__price">$${p.price * item.qty}</span>
                    </div>
                    <div class="bag-item__meta">
                      <span>${p.color}</span>
                      <span>·</span>
                      <span>Size ${item.size}</span>
                    </div>
                    <div class="bag-item__controls">
                      <div class="qty-stepper">
                        <button type="button" class="qty-stepper__btn" data-qty-dec="${item.key}" aria-label="Decrease quantity">−</button>
                        <span class="qty-stepper__val">${item.qty}</span>
                        <button type="button" class="qty-stepper__btn" data-qty-inc="${item.key}" aria-label="Increase quantity">+</button>
                      </div>
                      <button type="button" class="bag-item__remove" data-remove-key="${item.key}">Remove</button>
                    </div>
                  </div>
                </li>
              `;
            })
            .join('')}
        </ul>
      `;
    }

    drawerEl.innerHTML = `
      <div class="drawer__header">
        <div>
          <span class="drawer__kicker">High Inference</span>
          <h2 class="drawer__title">Shopping Bag (${count})</h2>
        </div>
        <button type="button" class="drawer__close" id="drawer-close-btn" aria-label="Close shopping bag">
          Close
        </button>
      </div>

      <div class="drawer__body">
        ${bodyHtml}
      </div>

      ${
        state.bag.length > 0 && !state.checkoutComplete
          ? `
        <div class="drawer__footer">
          ${
            totals.appliedBundle
              ? `
            <div class="drawer__row drawer__row--discount">
              <span>${totals.appliedBundle.name}</span>
              <span>−$${totals.discount}</span>
            </div>
          `
              : ''
          }
          <div class="drawer__row">
            <span>Shipping</span>
            <span>${totals.freeShippingUnlocked ? 'Complimentary' : 'Calculated at checkout'}</span>
          </div>
          <div class="drawer__row drawer__row--total">
            <span>Subtotal</span>
            <span>$${totals.subtotal} USD</span>
          </div>
          <button type="button" class="lux-btn lux-btn--ink drawer__checkout" id="drawer-checkout-btn">
            Proceed to Checkout · $${totals.subtotal}
          </button>
          <p class="drawer__note">highinference.com · Shopify Checkout &amp; Shop Pay</p>
        </div>
      `
          : ''
      }
    `;
  };

  drawerEl.addEventListener('click', (e) => {
    if (e.target.closest('#drawer-close-btn') || e.target.closest('#drawer-continue-btn')) {
      store.closeDrawer();
      return;
    }

    if (e.target.closest('#drawer-jump-lineup')) {
      store.closeDrawer();
      store.setActiveChapter(5, true);
      document.getElementById('act-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const decBtn = e.target.closest('[data-qty-dec]');
    if (decBtn) {
      store.updateBagQty(decBtn.dataset.qtyDec, -1);
      return;
    }

    const incBtn = e.target.closest('[data-qty-inc]');
    if (incBtn) {
      store.updateBagQty(incBtn.dataset.qtyInc, 1);
      return;
    }

    const remBtn = e.target.closest('[data-remove-key]');
    if (remBtn) {
      store.removeBagItem(remBtn.dataset.removeKey);
      return;
    }

    if (e.target.closest('#drawer-checkout-btn')) {
      store.completeCheckout();
    }
  });

  backdropEl?.addEventListener('click', () => {
    if (store.state.drawerOpen) store.closeDrawer();
    if (store.state.stageProductId) store.closeStage();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && store.state.drawerOpen) {
      store.closeDrawer();
    }
  });

  store.subscribe(render);
  render(store.state);
}
