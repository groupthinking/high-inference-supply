/**
 * Opt-in haptic feedback engine powered by navigator.vibrate().
 * Off by default, persisted in localStorage, with distinct tactile patterns
 * for every major storefront interaction.
 */

const STORAGE_KEY = 'hi_supply_haptics_enabled';

export const HAPTIC_PATTERNS = {
  toggleOn: [14, 28, 22],
  addBag: [18, 32, 28],
  addCompleteSet: [20, 26, 20, 26, 44],
  stageOpen: [16, 24, 12],
  stageClose: [12],
  drawerOpen: [14, 20, 14],
  drawerClose: [10],
  chapterNav: [12, 18, 10],
  sizeChange: [8],
  angleChange: [10],
  qtyChange: [8],
  checkout: [24, 30, 24, 30, 50],
};

class HapticsController {
  constructor() {
    this.enabled = false;
    this.supported =
      typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
    this.loadPreference();
  }

  loadPreference() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      this.enabled = saved === 'true';
    } catch {
      this.enabled = false;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(next) {
    this.enabled = Boolean(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(this.enabled));
    } catch {
      // Ignore storage quota / private mode errors
    }
    if (this.enabled) {
      this.trigger('toggleOn', true);
    }
    return this.enabled;
  }

  toggle() {
    return this.setEnabled(!this.enabled);
  }

  trigger(patternKey, force = false) {
    if (!this.supported) return false;
    if (!this.enabled && !force) return false;
    const pattern = HAPTIC_PATTERNS[patternKey] ?? [10];
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }
}

export const haptics = new HapticsController();
