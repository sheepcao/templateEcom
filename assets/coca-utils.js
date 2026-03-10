/**
 * coca-utils.js - Shared utility functions for all Coca custom sections
 * Loaded globally via layout/theme.liquid
 */

/**
 * Toggle accordion item open/closed.
 * Works for both product page and footer accordions.
 * @param {HTMLElement} headerEl - The clicked header element
 * @param {Object} opts
 *   @param {string} opts.toggleSelector  - Selector for toggle indicator (e.g. '+' / '�?)
 *   @param {string} opts.itemSelector    - Selector to find parent item from header
 *   @param {string} opts.activeClass     - Active class name (default: 'active')
 *   @param {boolean} opts.exclusive      - Close other items when opening (default: true)
 *   @param {string} opts.groupSelector   - Container to search siblings in (default: parent's parent)
 */
function cocaToggleAccordion(headerEl, opts) {
  opts = opts || {};
  var toggleSel = opts.toggleSelector || '.coca-product__accordion-toggle, .coca-footer__accordion-toggle';
  var activeClass = opts.activeClass || 'active';
  var exclusive = opts.exclusive !== false;

  var item = headerEl.parentElement;
  var toggle = headerEl.querySelector('[class*="accordion-toggle"]');
  var isActive = item.classList.contains(activeClass);
  var contentEl = headerEl.nextElementSibling;
  var setToggleState = function(el, expanded) {
    if (!el) return;
    if (el.querySelector('svg')) return;
        el.textContent = expanded ? '-' : '+';
  };

  var animateAccordion = function(el, expand) {
    if (!contentEl) return;
    
    if (expand) {
      // 展开前设置初始高度为0
      contentEl.style.maxHeight = '0';
      contentEl.style.overflow = 'hidden';
      contentEl.style.transition = 'max-height 0.3s ease-in-out';
      
      // 强制重排
      contentEl.offsetHeight;
      
      // 设置最终高度
      contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
    } else {
      // 折叠时设置当前高度
      contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
      contentEl.style.overflow = 'hidden';
      contentEl.style.transition = 'max-height 0.3s ease-in-out';
      
      // 强制重排
      contentEl.offsetHeight;
      
      // 设置最终高度为0
      contentEl.style.maxHeight = '0';
    }
  };

  if (exclusive) {
    var group = opts.groupSelector
      ? item.closest(opts.groupSelector)
      : item.parentElement;
    if (group) {
      group.querySelectorAll('.' + activeClass).forEach(function(i) {
        if (i !== item) {
          var siblingHeader = i.querySelector('header, [class*="accordion-header"]');
          var siblingContent = siblingHeader ? siblingHeader.nextElementSibling : null;
          if (siblingContent) {
            siblingContent.style.maxHeight = siblingContent.scrollHeight + 'px';
            siblingContent.offsetHeight;
            siblingContent.style.maxHeight = '0';
            siblingContent.style.overflow = 'hidden';
            siblingContent.style.transition = 'max-height 0.3s ease-in-out';
          }
          i.classList.remove(activeClass);
          var t = i.querySelector('[class*="accordion-toggle"]');
          setToggleState(t, false);
        }
      });
    }
  }

  if (isActive) {
    animateAccordion(item, false);
    setTimeout(function() {
      item.classList.remove(activeClass);
    }, 300);
    setToggleState(toggle, false);
  } else {
    item.classList.add(activeClass);
    animateAccordion(item, true);
    setToggleState(toggle, true);
  }
}

/**
 * Social share helper.
 * @param {string} platform - 'twitter' | 'facebook' | 'line'
 * @param {string} url      - URL to share (optional, defaults to window.location.href)
 * @param {string} title    - Title to share (optional, defaults to document.title)
 */
function cocaShare(platform, url, title) {
  var shareUrl = url || window.location.href;
  var shareTitle = title || document.title;
  var encoded = encodeURIComponent(shareUrl);
  var encodedTitle = encodeURIComponent(shareTitle);

  var urls = {
    twitter: 'https://twitter.com/intent/tweet?url=' + encoded + '&text=' + encodedTitle,
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encoded,
    line: 'https://social-plugins.line.me/lineit/share?url=' + encoded
  };

  if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
  }
}

/**
 * Show a toast notification.
 * Requires an element with id="coca-notification" in the page.
 * @param {string} message  - Message text
 * @param {number} duration - Duration in ms (default: 3000)
 */
function cocaShowNotification(message, duration) {
  var n = document.getElementById('coca-notification');
  if (!n) return;
  n.textContent = message;
  n.classList.add('show');
  clearTimeout(n._cocaTimer);
  n._cocaTimer = setTimeout(function() {
    n.classList.remove('show');
  }, duration || 3000);
}

/**
 * Update all .coca-cart-count elements on the page.
 * @param {number} count - New cart item count
 */
function cocaUpdateCartCount(count) {
  document.querySelectorAll('.coca-cart-count').forEach(function(el) {
    el.textContent = count;
    el.style.display = count > 0 ? '' : 'none';
  });
}

/**
 * Fetch current cart and update count badges.
 */
function cocaRefreshCartCount() {
  fetch('/cart.js')
    .then(function(r) { return r.json(); })
    .then(function(cart) { cocaUpdateCartCount(cart.item_count); })
    .catch(function() {});
}
