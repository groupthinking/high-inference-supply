(function () {
  var routes = window.HI_ROUTES || {
    cart_url: '/cart',
    cart_add_url: '/cart/add',
    cart_change_url: '/cart/change'
  };

  var drawer = document.getElementById('hi-cart-drawer');
  var backdrop = document.getElementById('hi-drawer-backdrop');
  var drawerBody = document.getElementById('hi-drawer-body');
  var drawerFoot = document.getElementById('hi-drawer-foot');
  var drawerSubtotal = document.getElementById('hi-drawer-subtotal');
  var cartCountEl = document.getElementById('hi-cart-count');
  var openBtn = document.getElementById('hi-cart-open');
  var closeBtn = document.getElementById('hi-cart-close');
  var hapticsBtn = document.getElementById('hi-haptics-toggle');
  var hapticsStateEl = document.getElementById('hi-haptics-state');

  function formatMoney(cents) {
    var val = (Number(cents || 0) / 100).toFixed(2);
    return '$' + val;
  }

  function syncHapticsBtn() {
    if (!hapticsBtn || !hapticsStateEl || !window.HI_HAPTICS) return;
    var on = window.HI_HAPTICS.isEnabled();
    hapticsBtn.setAttribute('aria-pressed', String(on));
    hapticsStateEl.textContent = on
      ? hapticsBtn.dataset.labelOn || 'On'
      : hapticsBtn.dataset.labelOff || 'Off';
  }

  if (hapticsBtn && window.HI_HAPTICS) {
    syncHapticsBtn();
    hapticsBtn.addEventListener('click', function () {
      window.HI_HAPTICS.setEnabled(!window.HI_HAPTICS.isEnabled());
      syncHapticsBtn();
    });
  }

  function renderCart(cart) {
    if (cartCountEl) cartCountEl.textContent = String(cart.item_count || 0);
    if (!drawer || !drawerBody || !drawerFoot) return;

    if (!cart.items || cart.items.length === 0) {
      drawerBody.innerHTML = '<p>' + (drawer.dataset.emptyText || 'Your bag is empty.') + '</p>';
      drawerFoot.style.display = 'none';
      return;
    }

    drawerFoot.style.display = 'flex';
    if (drawerSubtotal) drawerSubtotal.textContent = formatMoney(cart.total_price);

    drawerBody.innerHTML = cart.items
      .map(function (item) {
        var variantLine =
          item.variant_title && item.variant_title !== 'Default Title'
            ? '<p class="hi-cart-item__variant">' + item.variant_title + '</p>'
            : '';
        return (
          '<div class="hi-drawer-item">' +
          (item.image ? '<img src="' + item.image + '" alt="' + item.product_title + '">' : '<div></div>') +
          '<div>' +
          '<a href="' + item.url + '" class="hi-cart-item__title">' + item.product_title + '</a>' +
          variantLine +
          '<p class="hi-cart-item__price">' + formatMoney(item.final_line_price) + '</p>' +
          '<div class="hi-cart-item__controls">' +
          '<div class="hi-drawer-qty">' +
          '<button type="button" data-change-key="' + item.key + '" data-next-qty="' + (item.quantity - 1) + '" aria-label="' + (drawer.dataset.decreaseText || 'Decrease') + '">−</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button type="button" data-change-key="' + item.key + '" data-next-qty="' + (item.quantity + 1) + '" aria-label="' + (drawer.dataset.increaseText || 'Increase') + '">+</button>' +
          '</div>' +
          '<button type="button" class="hi-header__btn" data-change-key="' + item.key + '" data-next-qty="0">' + (drawer.dataset.removeText || 'Remove') + '</button>' +
          '</div>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function fetchCart() {
    return fetch(routes.cart_url + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        renderCart(cart);
        return cart;
      });
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('is-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('hi-no-scroll');
    if (window.HI_HAPTICS) window.HI_HAPTICS.trigger('drawerOpen');
    fetchCart();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('is-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('hi-no-scroll');
    if (window.HI_HAPTICS) window.HI_HAPTICS.trigger('drawerClose');
  }

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  if (drawerBody) {
    drawerBody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-change-key]');
      if (!btn) return;
      var id = btn.dataset.changeKey;
      var quantity = Number(btn.dataset.nextQty);
      fetch(routes.cart_change_url + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: id, quantity: Math.max(0, quantity) })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          if (window.HI_HAPTICS) window.HI_HAPTICS.trigger('qtyChange');
          renderCart(cart);
        });
    });
  }

  var variantSelect = document.getElementById('hi-variant-select');
  var priceEl = document.getElementById('hi-product-price');
  if (variantSelect && priceEl) {
    variantSelect.addEventListener('change', function () {
      var opt = variantSelect.options[variantSelect.selectedIndex];
      if (opt && opt.dataset.price) priceEl.textContent = opt.dataset.price;
      if (window.HI_HAPTICS) window.HI_HAPTICS.trigger('variantChange');
    });
  }

  var productForm = document.querySelector('[data-ajax-cart-form="true"]');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(productForm);
      fetch(routes.cart_add_url + '.js', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Unable to add item');
          return r.json();
        })
        .then(function () {
          if (window.HI_HAPTICS) window.HI_HAPTICS.trigger('addBag');
          openDrawer();
        })
        .catch(function () {
          productForm.submit();
        });
    });
  }
})();
