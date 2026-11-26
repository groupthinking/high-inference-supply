import { CATALOG, BUNDLES, FREE_SHIPPING_THRESHOLD, getProductById } from './catalog.js';
import { haptics } from './haptics.js';

const BAG_STORAGE_KEY = 'hi_supply_bag_v1';

class Store {
  constructor() {
    this.listeners = new Set();
    this.toastListeners = new Set();
    this.state = {
      bag: this.loadBag(),
      activeChapter: 1,
      drawerOpen: false,
      stageProductId: null,
      stageSize: 'L',
      stageAngleIndex: 0,
      hapticsEnabled: haptics.isEnabled(),
      checkoutComplete: false,
    };

    // Expose Shopify Fall '26 / WebMCP-friendly storefront actions
    this.exposeAgenticHooks();
  }

  loadBag() {
    try {
      const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveBag() {
    try {
      window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(this.state.bag));
    } catch {
      // Ignore storage errors
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onToast(fn) {
    this.toastListeners.add(fn);
    return () => this.toastListeners.delete(fn);
  }

  emitToast(message, accent = 'default') {
    for (const fn of this.toastListeners) {
      fn({ message, accent, id: Date.now() + Math.random() });
    }
  }

  notify() {
    for (const fn of this.listeners) {
      fn(this.state);
    }
  }

  setActiveChapter(chapter, fromClick = false) {
    if (this.state.activeChapter === chapter && !fromClick) return;
    this.state.activeChapter = chapter;
    if (fromClick) {
      haptics.trigger('chapterNav');
    }
    this.notify();
  }

  toggleHaptics() {
    const next = haptics.toggle();
    this.state.hapticsEnabled = next;
    this.emitToast(
      next
        ? haptics.supported
          ? 'Haptic feedback enabled'
          : 'Haptics enabled (device vibration API unavailable)'
        : 'Haptic feedback off'
    );
    this.notify();
  }

  openStage(productId, initialSize = null) {
    const product = getProductById(productId);
    if (!product) return;
    this.state.drawerOpen = false;
    this.state.stageProductId = product.id;
    this.state.stageSize = initialSize || product.defaultSize || product.sizes[0];
    this.state.stageAngleIndex = 0;
    haptics.trigger('stageOpen');
    this.notify();
  }

  closeStage() {
    if (!this.state.stageProductId) return;
    this.state.stageProductId = null;
    haptics.trigger('stageClose');
    this.notify();
  }

  setStageSize(size) {
    if (this.state.stageSize === size) return;
    this.state.stageSize = size;
    haptics.trigger('sizeChange');
    this.notify();
  }

  setStageAngle(index) {
    if (this.state.stageAngleIndex === index) return;
    this.state.stageAngleIndex = index;
    haptics.trigger('angleChange');
    this.notify();
  }

  openDrawer() {
    this.state.stageProductId = null;
    this.state.drawerOpen = true;
    this.state.checkoutComplete = false;
    haptics.trigger('drawerOpen');
    this.notify();
  }

  closeDrawer() {
    if (!this.state.drawerOpen) return;
    this.state.drawerOpen = false;
    haptics.trigger('drawerClose');
    this.notify();
  }

  toggleDrawer() {
    if (this.state.drawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  addToBag(productId, size = null, quantity = 1, { silent = false, openAfter = false } = {}) {
    const product = getProductById(productId);
    if (!product) return;
    const chosenSize = size || product.defaultSize || product.sizes[0];
    const key = `${product.id}__${chosenSize}`;
    const existing = this.state.bag.find((item) => item.key === key);

    if (existing) {
      existing.qty += quantity;
    } else {
      this.state.bag.push({
        key,
        productId: product.id,
        size: chosenSize,
        qty: quantity,
      });
    }

    this.state.checkoutComplete = false;
    this.saveBag();

    if (!silent) {
      haptics.trigger('addBag');
      this.emitToast(`Added ${product.shortName} (${chosenSize})`, 'ochre');
    }

    if (openAfter) {
      this.state.stageProductId = null;
      this.state.drawerOpen = true;
    }

    this.notify();
  }

  addBundle(bundleId) {
    const bundle = BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;

    bundle.itemIds.forEach((id) => {
      const p = getProductById(id);
      if (p) {
        this.addToBag(p.id, p.defaultSize, 1, { silent: true });
      }
    });

    haptics.trigger('addCompleteSet');
    this.emitToast(`Added ${bundle.name} (Save $${bundle.savings})`, 'ochre');
    this.state.stageProductId = null;
    this.state.drawerOpen = true;
    this.notify();
  }

  updateBagQty(key, delta) {
    const idx = this.state.bag.findIndex((item) => item.key === key);
    if (idx === -1) return;
    this.state.bag[idx].qty += delta;
    if (this.state.bag[idx].qty <= 0) {
      this.state.bag.splice(idx, 1);
    }
    this.saveBag();
    haptics.trigger('qtyChange');
    this.notify();
  }

  removeBagItem(key) {
    this.state.bag = this.state.bag.filter((item) => item.key !== key);
    this.saveBag();
    haptics.trigger('qtyChange');
    this.notify();
  }

  clearBag() {
    this.state.bag = [];
    this.saveBag();
    this.notify();
  }

  completeCheckout() {
    haptics.trigger('checkout');
    this.state.checkoutComplete = true;
    this.state.bag = [];
    this.saveBag();
    this.emitToast('Order staged for highinference.com checkout', 'ochre');
    this.notify();
  }

  getBagCount() {
    return this.state.bag.reduce((sum, item) => sum + item.qty, 0);
  }

  getBagTotals() {
    let rawSubtotal = 0;
    const productIdsInBag = new Set();

    for (const item of this.state.bag) {
      const product = getProductById(item.productId);
      if (!product) continue;
      rawSubtotal += product.price * item.qty;
      productIdsInBag.add(product.id);
    }

    // Apply best eligible bundle discount automatically
    let discount = 0;
    let appliedBundle = null;
    for (const bundle of [...BUNDLES].reverse()) {
      const hasAll = bundle.itemIds.every((id) => productIdsInBag.has(id));
      if (hasAll && bundle.savings > discount) {
        discount = bundle.savings;
        appliedBundle = bundle;
      }
    }

    const subtotal = Math.max(0, rawSubtotal - discount);
    const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;

    return {
      rawSubtotal,
      discount,
      appliedBundle,
      subtotal,
      remainingForFreeShip,
      freeShippingUnlocked,
    };
  }

  exposeAgenticHooks() {
    if (typeof window === 'undefined') return;
    window.Shopify = window.Shopify || {};
    window.Shopify.actions = {
      getCatalog: () => CATALOG,
      getProduct: (id) => getProductById(id),
      addToCart: (productId, size = 'L', qty = 1) => {
        this.addToBag(productId, size, qty, { openAfter: true });
        return this.getBagTotals();
      },
      openCart: () => this.openDrawer(),
      closeCart: () => this.closeDrawer(),
      getCart: () => ({
        items: this.state.bag,
        ...this.getBagTotals(),
      }),
    };
  }
}

export const store = new Store();
