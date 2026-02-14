/* ================================================
   AD-SENSE — Utilities
   Storage helpers, validation, common functions
   ================================================ */

(function (window) {
  'use strict';

  // ─── Storage Management ───
  const Storage = {
    get: (key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    },
    set: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
      localStorage.removeItem(key);
    },
  };

  // ─── Account Management ───
  const Accounts = {
    STORAGE_KEY: 'adsense-accounts',
    CURRENT_USER_KEY: 'adsense-current-user',

    getAll: () => Storage.get(Accounts.STORAGE_KEY) || {},
    saveAll: (accounts) => Storage.set(Accounts.STORAGE_KEY, accounts),
    getCurrent: () => Storage.get(Accounts.CURRENT_USER_KEY),
    saveCurrent: (user) => {
      if (user) {
        Storage.set(Accounts.CURRENT_USER_KEY, user);
      } else {
        Storage.remove(Accounts.CURRENT_USER_KEY);
      }
    },
  };

  // ─── Validation ───
  const Validators = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    username: (username) => username && username.length >= 3,
    password: (password) => password && password.length >= 6,
    passwordMatch: (p1, p2) => p1 === p2,
  };

  // ─── DOM Helpers ───
  const DOM = {
    element: (id) => document.getElementById(id),
    query: (selector) => document.querySelector(selector),
    queryAll: (selector) => document.querySelectorAll(selector),
    show: (el) => {
      if (el) el.style.display = 'block';
    },
    hide: (el) => {
      if (el) el.style.display = 'none';
    },
    toggle: (el, className) => {
      if (el) el.classList.toggle(className);
    },
    addClass: (el, className) => {
      if (el) el.classList.add(className);
    },
    removeClass: (el, className) => {
      if (el) el.classList.remove(className);
    },
    setClass: (el, className, condition) => {
      if (!el) return;
      if (condition) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
    },
  };

  // ─── Utility Functions ───
  const Utils = {
    getAvatarLetter: (name) => {
      return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
    },
    formatTime: (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    calculateLevel: (credits) => Math.floor(credits / 200) + 1,
    isSuspiciousActivity: (metrics) => {
      // Anti-fraud detection helper
      const { averageTime, count, threshold } = metrics;
      return averageTime < threshold || count > 200;
    },
  };

  // ─── Error Display ───
  const ErrorUI = {
    show: (elementId, message) => {
      const el = DOM.element(elementId);
      if (el) {
        el.textContent = message;
        DOM.addClass(el, 'show');
      }
    },
    clear: (elementId) => {
      const el = DOM.element(elementId);
      if (el) {
        el.textContent = '';
        DOM.removeClass(el, 'show');
      }
    },
  };

  // ─── Export to global scope ───
  window.AdSense = window.AdSense || {};
  window.AdSense.Storage = Storage;
  window.AdSense.Accounts = Accounts;
  window.AdSense.Validators = Validators;
  window.AdSense.DOM = DOM;
  window.AdSense.Utils = Utils;
  window.AdSense.ErrorUI = ErrorUI;
})(window);
