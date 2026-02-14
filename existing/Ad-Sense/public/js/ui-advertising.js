/* ================================================
   AD-SENSE — Advertising Control
   Ad visibility toggle and preferences
   ================================================ */

(function (window) {
  'use strict';

  const { Storage, DOM } = window.AdSense;

  const STORAGE_KEY = 'adsense-ads-visible';

  // ─── Initialize Ad Toggle ───
  function init() {
    const toggle = DOM.element('ad-toggle');
    if (!toggle) return;

    // Load saved preference
    const saved = Storage.get(STORAGE_KEY);
    const shouldShowAds = saved !== false; // Default true

    toggle.checked = shouldShowAds;
    if (!shouldShowAds) {
      document.body.classList.add('ads-hidden');
    }

    // Toggle event
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        document.body.classList.remove('ads-hidden');
        Storage.set(STORAGE_KEY, true);
      } else {
        document.body.classList.add('ads-hidden');
        Storage.set(STORAGE_KEY, false);
      }
    });
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.Advertising = { init };
})(window);
