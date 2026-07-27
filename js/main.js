/* ============================================================
   tpp.com — Main JavaScript
   ============================================================ */

(function() {
  'use strict';

  // --- DOM Ready ---
  document.addEventListener('DOMContentLoaded', function() {
    initStickyHeader();
    initMobileMenu();
    initViewToggles();
    initCategoryFilters();
    initSearchFunctionality();
    initDealCards();
    initSaveButtons();
    initHeroCarousel();
    initNewsletterForms();
    initBackToTop();
    initSmoothScroll();
    initCouponCopy();
    initSubmitForm();
    initLoadMore();
  });

  // ============================================================
  // STICKY HEADER
  // ============================================================

  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ============================================================
  // MOBILE MENU
  // ============================================================

  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================================
  // VIEW TOGGLE (Grid / List)
  // ============================================================

  function initViewToggles() {
    const toggles = document.querySelectorAll('.view-toggle');
    const grid = document.querySelector('.deals-grid');
    if (!toggles.length || !grid) return;

    // Load saved preference
    var savedView = localStorage.getItem('tpp-view') || 'grid';
    setView(savedView, toggles, grid);

    toggles.forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        var view = toggle.dataset.view;
        setView(view, toggles, grid);
        localStorage.setItem('tpp-view', view);
      });
    });
  }

  function setView(view, toggles, grid) {
    toggles.forEach(function(t) {
      t.classList.toggle('active', t.dataset.view === view);
    });

    if (view === 'list') {
      grid.classList.add('list-view');
    } else {
      grid.classList.remove('list-view');
    }
  }

  // ============================================================
  // CATEGORY FILTERS
  // ============================================================

  function initCategoryFilters() {
    var filters = document.querySelectorAll('.cat-filter');
    if (!filters.length) return;

    filters.forEach(function(filter) {
      filter.addEventListener('click', function() {
        filters.forEach(function(f) { f.classList.remove('active'); });
        filter.classList.add('active');

        var category = filter.dataset.category;
        filterDeals(category);
      });
    });
  }

  function filterDeals(category) {
    var cards = document.querySelectorAll('.deal-card');
    var visibleCount = 0;

    cards.forEach(function(card) {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no-results message
    var noResults = document.querySelector('.no-results');
    var loadMore = document.querySelector('.load-more-wrap');
    if (visibleCount === 0 && noResults) {
      noResults.classList.remove('hidden');
      if (loadMore) loadMore.classList.add('hidden');
    } else {
      if (noResults) noResults.classList.add('hidden');
      if (loadMore) loadMore.classList.remove('hidden');
    }
  }

  // ============================================================
  // SEARCH
  // ============================================================

  function initSearchFunctionality() {
    var searchInput = document.querySelector('.header-search input');
    if (!searchInput) return;

    var debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        performSearch(searchInput.value.toLowerCase().trim());
      }, 300);
    });
  }

  function performSearch(query) {
    var cards = document.querySelectorAll('.deal-card');
    var visibleCount = 0;

    cards.forEach(function(card) {
      var title = (card.querySelector('.deal-card-title')?.textContent || '').toLowerCase();
      var desc = (card.querySelector('.deal-card-desc')?.textContent || '').toLowerCase();
      var store = (card.querySelector('.deal-store-badge')?.textContent || '').toLowerCase();

      if (!query || title.includes(query) || desc.includes(query) || store.includes(query)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    var noResults = document.querySelector('.no-results');
    var loadMore = document.querySelector('.load-more-wrap');
    if (visibleCount === 0 && query && noResults) {
      noResults.classList.remove('hidden');
      if (loadMore) loadMore.classList.add('hidden');
    } else {
      if (noResults) noResults.classList.add('hidden');
      if (loadMore) loadMore.classList.remove('hidden');
    }
  }

  // ============================================================
  // DEAL CARDS RENDERING (for pages with deal data)
  // ============================================================

  function initDealCards() {
    var grid = document.getElementById('dealsGrid');
    if (!grid || typeof deals === 'undefined') return;

    renderDeals(deals.slice(0, 9));
    initLoadMoreDeals();
  }

  function renderDeals(dealList) {
    var grid = document.getElementById('dealsGrid');
    if (!grid) return;

    dealList.forEach(function(deal) {
      var card = createDealCard(deal);
      grid.appendChild(card);
    });
  }

  function createDealCard(deal) {
    var card = document.createElement('div');
    card.className = 'deal-card';
    card.dataset.category = deal.category;

    var timeAgo = getTimeAgo(deal.postedAt);
    var starsHtml = getStarRating(deal.rating);

    card.innerHTML =
      '<div class="deal-card-image">' +
        '<img src="' + deal.image + '" alt="' + deal.title + '" loading="lazy">' +
        '<span class="deal-store-badge">' + deal.store + '</span>' +
        '<span class="deal-discount-badge">-' + deal.discount + '%</span>' +
        (deal.hot ? '<span class="deal-hot-badge">🔥 HOT</span>' : '') +
        (deal.expiresAt && isExpiringSoon(deal.expiresAt) ? '<span class="deal-expiring-badge">⏰ Ending Soon</span>' : '') +
        '<button class="deal-save-btn" data-id="' + deal.id + '" title="Save for later">♡</button>' +
      '</div>' +
      '<div class="deal-card-body">' +
        '<h3 class="deal-card-title"><a href="' + deal.url + '">' + deal.title + '</a></h3>' +
        '<p class="deal-card-desc">' + deal.description + '</p>' +
        '<div class="deal-price-row">' +
          '<span class="deal-price">$' + deal.dealPrice.toFixed(2) + '</span>' +
          '<span class="deal-original">$' + deal.originalPrice.toFixed(2) + '</span>' +
          '<span class="deal-save-amount">Save $' + (deal.originalPrice - deal.dealPrice).toFixed(2) + '</span>' +
        '</div>' +
        '<div class="deal-rating">' +
          '<span class="stars">' + starsHtml + '</span>' +
          '<span>(' + deal.reviewCount.toLocaleString() + ')</span>' +
        '</div>' +
      '</div>' +
      '<div class="deal-card-footer">' +
        '<span class="deal-time">🕐 ' + timeAgo + '</span>' +
        '<a href="' + deal.url + '" class="deal-action" target="_blank">View Deal →</a>' +
      '</div>';

    return card;
  }

  function getStarRating(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var html = '';
    for (var i = 0; i < full; i++) { html += '★'; }
    if (half) { html += '★'; }
    var remaining = 5 - full - (half ? 1 : 0);
    for (var j = 0; j < remaining; j++) { html += '<span class="empty">★</span>'; }
    return html;
  }

  function getTimeAgo(dateStr) {
    var now = new Date();
    var posted = new Date(dateStr);
    var diff = Math.floor((now - posted) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function isExpiringSoon(expiresStr) {
    var now = new Date();
    var expires = new Date(expiresStr);
    var diff = Math.floor((expires - now) / 86400000);
    return diff <= 2;
  }

  // ============================================================
  // LOAD MORE
  // ============================================================

  var currentDealIndex = 9;
  var DEALS_PER_PAGE = 9;

  function initLoadMoreDeals() {
    var btn = document.getElementById('loadMoreBtn');
    if (!btn || typeof deals === 'undefined') return;

    if (currentDealIndex >= deals.length) {
      btn.style.display = 'none';
      return;
    }

    btn.addEventListener('click', function() {
      var nextBatch = deals.slice(currentDealIndex, currentDealIndex + DEALS_PER_PAGE);
      renderDeals(nextBatch);
      currentDealIndex += DEALS_PER_PAGE;

      if (currentDealIndex >= deals.length) {
        btn.style.display = 'none';
      }

      // Re-initialize save buttons for new cards
      initSaveButtons();
    });
  }

  function initLoadMore() {
    // For static pages that have hidden deal cards
    var btn = document.getElementById('loadMoreBtn');
    if (!btn) return;

    btn.addEventListener('click', function() {
      var hiddenCards = document.querySelectorAll('.deal-card.hidden');
      var count = 0;
      hiddenCards.forEach(function(card) {
        if (count < DEALS_PER_PAGE) {
          card.classList.remove('hidden');
          count++;
        }
      });
      if (document.querySelectorAll('.deal-card.hidden').length === 0) {
        btn.style.display = 'none';
      }
    });
  }

  // ============================================================
  // SAVE TO HIPLIST (bookmark)
  // ============================================================

  function initSaveButtons() {
    var buttons = document.querySelectorAll('.deal-save-btn');
    buttons.forEach(function(btn) {
      // Remove existing listeners by cloning
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(newBtn);
      });

      // Check if already saved
      var id = newBtn.dataset.id;
      if (id && isDealSaved(id)) {
        newBtn.classList.add('saved');
        newBtn.innerHTML = '♥';
      }
    });
  }

  function toggleSave(btn) {
    var id = btn.dataset.id;
    btn.classList.toggle('saved');

    if (btn.classList.contains('saved')) {
      btn.innerHTML = '♥';
      if (id) saveDeal(id);
    } else {
      btn.innerHTML = '♡';
      if (id) unsaveDeal(id);
    }
  }

  function isDealSaved(id) {
    try {
      var saved = JSON.parse(localStorage.getItem('tpp-saved') || '[]');
      return saved.indexOf(parseInt(id)) !== -1;
    } catch (e) {
      return false;
    }
  }

  function saveDeal(id) {
    try {
      var saved = JSON.parse(localStorage.getItem('tpp-saved') || '[]');
      if (saved.indexOf(parseInt(id)) === -1) {
        saved.push(parseInt(id));
        localStorage.setItem('tpp-saved', JSON.stringify(saved));
      }
    } catch (e) {}
  }

  function unsaveDeal(id) {
    try {
      var saved = JSON.parse(localStorage.getItem('tpp-saved') || '[]');
      var index = saved.indexOf(parseInt(id));
      if (index !== -1) {
        saved.splice(index, 1);
        localStorage.setItem('tpp-saved', JSON.stringify(saved));
      }
    } catch (e) {}
  }

  // ============================================================
  // HERO CAROUSEL
  // ============================================================

  function initHeroCarousel() {
    var track = document.querySelector('.hero-track');
    var dots = document.querySelectorAll('.carousel-dot');
    var prevBtn = document.querySelector('.carousel-prev');
    var nextBtn = document.querySelector('.carousel-next');
    if (!track || !dots.length) return;

    var currentSlide = 0;
    var totalSlides = dots.length;
    var autoplayInterval;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;
      track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAutoplay(); });

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { goToSlide(i); resetAutoplay(); });
    });

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }

    // Touch swipe
    var touchStartX = 0;
    var touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        resetAutoplay();
      }
    });

    startAutoplay();
  }

  // ============================================================
  // NEWSLETTER FORMS
  // ============================================================

  function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form, .footer-newsletter-form').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        if (!input || !input.value.trim()) {
          shakeElement(form);
          return;
        }
        if (!isValidEmail(input.value.trim())) {
          shakeElement(form);
          return;
        }

        // Show success
        var success = form.parentElement.querySelector('.newsletter-success');
        form.style.display = 'none';
        if (input.previousElementSibling) input.previousElementSibling.style.display = 'none';
        if (success) {
          success.style.display = 'block';
        } else {
          var msg = document.createElement('p');
          msg.className = 'newsletter-success';
          msg.style.display = 'block';
          msg.textContent = '✅ You\'re subscribed! Check your inbox.';
          form.parentElement.appendChild(msg);
        }
      });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shake 0.5s ease';
  }

  // ============================================================
  // BACK TO TOP
  // ============================================================

  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var offset = 120; // account for sticky header
          var position = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: position, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // COUPON COPY
  // ============================================================

  function initCouponCopy() {
    document.querySelectorAll('.btn-copy').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var codeEl = btn.parentElement.querySelector('.coupon-code');
        if (!codeEl) return;

        var code = codeEl.textContent.trim();

        // Fallback for older browsers
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function() {
            showCopySuccess(btn);
          }).catch(function() {
            fallbackCopy(codeEl, code);
            showCopySuccess(btn);
          });
        } else {
          fallbackCopy(codeEl, code);
          showCopySuccess(btn);
        }
      });
    });
  }

  function fallbackCopy(el, text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(textarea);
  }

  function showCopySuccess(btn) {
    var originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = 'var(--success)';
    setTimeout(function() {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }

  // ============================================================
  // SUBMIT FORM
  // ============================================================

  function initSubmitForm() {
    var form = document.querySelector('.submit-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Simple validation
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function(input) {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = 'var(--danger)';
          setTimeout(function() { input.style.borderColor = ''; }, 2000);
        }
      });

      if (!valid) return;

      // Show success
      var successEl = form.parentElement.querySelector('.form-success');
      form.style.display = 'none';
      if (successEl) {
        successEl.style.display = 'block';
      }
    });
  }

})();

// Shake animation keyframes (injected via JS since used dynamically)
var shakeStyle = document.createElement('style');
shakeStyle.textContent =
  '@keyframes shake {' +
  '  0%, 100% { transform: translateX(0); }' +
  '  25% { transform: translateX(-8px); }' +
  '  50% { transform: translateX(8px); }' +
  '  75% { transform: translateX(-4px); }' +
  '}';
document.head.appendChild(shakeStyle);
