(function () {
  var KEY = 'hi_theme_haptics';
  var PATTERNS = {
    toggleOn: [12, 24, 18],
    addBag: [16, 28, 22],
    drawerOpen: [12, 18, 12],
    drawerClose: [10],
    qtyChange: [8],
    variantChange: [8]
  };

  function isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  function isEnabled() {
    try {
      return window.localStorage.getItem(KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function trigger(name, force) {
    if (!isSupported()) return false;
    if (!force && !isEnabled()) return false;
    try {
      return navigator.vibrate(PATTERNS[name] || [10]);
    } catch (e) {
      return false;
    }
  }

  function setEnabled(next) {
    try {
      window.localStorage.setItem(KEY, String(Boolean(next)));
    } catch (e) {}
    if (next) trigger('toggleOn', true);
    return Boolean(next);
  }

  window.HI_HAPTICS = {
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    trigger: trigger
  };
})();
