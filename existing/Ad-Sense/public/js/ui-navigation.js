/* ================================================
   AD-SENSE — Navigation & Mobile Menu
   Page routing, mobile menu toggle
   ================================================ */

(function (window) {
  'use strict';

  const { DOM } = window.AdSense;

  const PAGES = ['home', 'game', 'multiplayer', 'activities', 'how-it-works'];

  // ─── Navigate to Page ───
  function navigate(hash) {
    const target = hash.replace('#', '') || 'home';

    // Show/hide pages
    PAGES.forEach((id) => {
      const el = DOM.element('page-' + id);
      DOM.setClass(el, 'active', id === target);
    });

    // Update active nav link
    DOM.queryAll('.navbar-links a').forEach((link) => {
      const linkHash = link.getAttribute('href').replace('#', '');
      DOM.setClass(link, 'active', linkHash === target);
    });

    // Close mobile menu
    const mobileMenu = DOM.query('.navbar-links');
    if (mobileMenu) mobileMenu.classList.remove('show');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Mobile Menu Toggle ───
  function initMobileMenu() {
    const btn = DOM.query('.mobile-menu-btn');
    const links = DOM.query('.navbar-links');

    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      DOM.toggle(links, 'show');
      btn.textContent = links.classList.contains('show') ? '✕' : '☰';
    });
  }

  // ─── Global Navigate Helper (for onclick) ───
  window.navigateTo = function (hash) {
    window.location.hash = hash;
  };

  // ─── Initialize Navigation ───
  function init() {
    window.addEventListener('hashchange', () => navigate(window.location.hash));
    window.addEventListener('DOMContentLoaded', () => {
      navigate(window.location.hash || '#home');
      initMobileMenu();
    });

    // Initial navigation
    navigate(window.location.hash || '#home');
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.Navigation = { init, navigate };
})(window);
