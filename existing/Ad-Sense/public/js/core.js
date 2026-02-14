/* ================================================
   AD-SENSE — Core Application
   Main initialization, module orchestration
   ================================================ */

(function (window) {
  'use strict';

  // ─── Initialize App ───
  function initializeApp() {
    // Initialize all modules
    window.AdSense.Navigation.init();
    window.AdSense.Advertising.init();
    window.AdSense.Profile.init();
    window.AdSense.Auth.init();
    window.AdSense.FAQ.init();
    window.AdSense.PuzzleGame.init();
    window.AdSense.WhereIsItGame.init();
  }

  // ─── Wait for DOM Ready ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.Core = { initializeApp };
})(window);
