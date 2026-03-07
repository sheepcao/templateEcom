(function () {
  var STORAGE_KEY = 'coca_wishlist_handles_v1';
  var BTN_SELECTOR = '.js-coca-wishlist-btn';

  function readWishlist() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (item) {
        return typeof item === 'string' && item.trim() !== '';
      });
    } catch (e) {
      return [];
    }
  }

  function writeWishlist(items) {
    var unique = Array.from(new Set(items));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch (e) {
      return unique;
    }
    window.dispatchEvent(
      new CustomEvent('coca:wishlist:change', {
        detail: { items: unique }
      })
    );
    return unique;
  }

  function isWishlisted(handle) {
    return readWishlist().indexOf(handle) > -1;
  }

  function toggleWishlist(handle) {
    if (!handle) return readWishlist();
    var items = readWishlist();
    var index = items.indexOf(handle);
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.unshift(handle);
    }
    return writeWishlist(items);
  }

  function setButtonState(button, active) {
    button.classList.toggle('is-active', active);
    button.classList.toggle('coca-product-card__wishlist--active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
  }

  function refreshButtons(root) {
    var scope = root || document;
    var items = readWishlist();
    scope.querySelectorAll(BTN_SELECTOR).forEach(function (button) {
      var handle = (button.getAttribute('data-product-handle') || '').trim();
      if (!handle) return;
      setButtonState(button, items.indexOf(handle) > -1);
    });
  }

  function formatMoney(cents) {
    if (typeof cents !== 'number') return '';
    var amount = cents / 100;
    return '¥' + amount.toLocaleString();
  }

  function productCardHtml(product) {
    var image = product.images && product.images.length ? product.images[0] : '';
    var secondary = product.images && product.images.length > 1 ? product.images[1] : '';
    var compare = product.compare_at_price && product.compare_at_price > product.price;

    return (
      '<article class="coca-wishlist-card" data-product-handle="' + product.handle + '">' +
      '  <div class="coca-wishlist-card__image-wrap">' +
      '    <a href="' + product.url + '">' +
      '      <img class="coca-wishlist-card__image" src="' + image + '" alt="' + escapeHtml(product.title) + '" loading="lazy">' +
      (secondary
        ? '<img class="coca-wishlist-card__image coca-wishlist-card__image--secondary" src="' +
          secondary +
          '" alt="' +
          escapeHtml(product.title) +
          '" loading="lazy">'
        : '') +
      '    </a>' +
      '  </div>' +
      '  <div class="coca-wishlist-card__info">' +
      '    <div class="coca-wishlist-card__heading">' +
      '      <h3 class="coca-wishlist-card__title"><a href="' +
      product.url +
      '">' +
      escapeHtml(product.title) +
      '</a></h3>' +
      '      <button type="button" class="coca-wishlist-card__heart js-coca-wishlist-btn is-active" data-product-handle="' +
      product.handle +
      '" aria-label="Remove from wishlist" aria-pressed="true">' +
      heartSvg() +
      '      </button>' +
      '    </div>' +
      (compare
        ? '<p class="coca-wishlist-card__price coca-wishlist-card__price--sale"><span>' +
          formatMoney(product.price) +
          '</span><s>' +
          formatMoney(product.compare_at_price) +
          '</s></p>'
        : '<p class="coca-wishlist-card__price">' + formatMoney(product.price) + '</p>') +
      '  </div>' +
      '</article>'
    );
  }

  function heartSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path>' +
      '</svg>'
    );
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function fetchProduct(handle) {
    var response = await fetch('/products/' + encodeURIComponent(handle) + '.js', {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('product fetch failed: ' + handle);
    return response.json();
  }

  async function renderWishlistPage() {
    var page = document.querySelector('[data-coca-wishlist-page]');
    if (!page) return;

    var grid = page.querySelector('[data-wishlist-grid]');
    var empty = page.querySelector('[data-wishlist-empty]');
    var countEl = page.querySelector('[data-wishlist-count]');
    if (!grid || !empty) return;

    var handles = readWishlist();
    if (countEl) countEl.textContent = String(handles.length);

    if (!handles.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    grid.innerHTML = '<p class="coca-wishlist-page__loading">Loading...</p>';

    var products = await Promise.all(
      handles.map(function (handle) {
        return fetchProduct(handle).catch(function () {
          return null;
        });
      })
    );

    var validProducts = products.filter(Boolean);
    if (!validProducts.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }

    grid.innerHTML = validProducts.map(productCardHtml).join('');
    refreshButtons(page);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest(BTN_SELECTOR);
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    var handle = (button.getAttribute('data-product-handle') || '').trim();
    if (!handle) return;

    var items = toggleWishlist(handle);
    var active = items.indexOf(handle) > -1;
    setButtonState(button, active);
  });

  document.addEventListener('DOMContentLoaded', function () {
    refreshButtons(document);
    renderWishlistPage();
  });

  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY) return;
    refreshButtons(document);
    renderWishlistPage();
  });

  window.addEventListener('coca:wishlist:change', function () {
    refreshButtons(document);
    renderWishlistPage();
  });

  window.CocaWishlist = {
    key: STORAGE_KEY,
    read: readWishlist,
    write: writeWishlist,
    toggle: toggleWishlist,
    has: isWishlisted,
    refreshButtons: refreshButtons
  };
})();
