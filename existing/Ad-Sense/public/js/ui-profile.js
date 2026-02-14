/* ================================================
   AD-SENSE — User Profile UI
   Profile display, updates, avatar management
   ================================================ */

(function (window) {
  'use strict';

  const { Accounts, DOM, Utils } = window.AdSense;

  // ─── Load and Display Profile ───
  function loadProfile() {
    const user = Accounts.getCurrent();
    const guestContent = DOM.element('guest-profile-content');
    const userContent = DOM.element('user-profile-content');

    if (!guestContent || !userContent) return;

    if (user) {
      // Show logged-in user profile
      DOM.hide(guestContent);
      DOM.show(userContent);

      const avatar = Utils.getAvatarLetter(user.username);
      DOM.element('user-avatar-display').textContent = avatar;
      DOM.element('user-name-display').textContent = user.username;
      DOM.element('user-label-display').textContent = `Level ${user.level}`;
      DOM.element('user-credits-display').textContent = user.credits;
      DOM.element('user-level-display').textContent = `Lv ${user.level}`;
      DOM.element('user-games-display').textContent = user.gamesPlayed || 0;
    } else {
      // Show guest profile
      DOM.show(guestContent);
      DOM.hide(userContent);
    }
  }

  // ─── Update User Credits & Level ───
  function updateCredits(amount) {
    const user = Accounts.getCurrent();
    if (!user) return;

    user.credits += amount;
    user.level = Utils.calculateLevel(user.credits);
    Accounts.saveCurrent(user);
    loadProfile();
  }

  // ─── Update Games Played ───
  function updateGamesPlayed() {
    const user = Accounts.getCurrent();
    if (!user) return;

    user.gamesPlayed = (user.gamesPlayed || 0) + 1;
    Accounts.saveCurrent(user);
    loadProfile();
  }

  // ─── Initialize Profile UI ───
  function init() {
    const profileBtn = DOM.element('profile-btn');
    const profilePopover = DOM.element('profile-popover');

    if (!profileBtn || !profilePopover) return;

    // Toggle profile popover
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.toggle(profilePopover, 'show');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!profilePopover.contains(e.target) && e.target !== profileBtn) {
        profilePopover.classList.remove('show');
      }
    });

    loadProfile();
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.Profile = { init, load: loadProfile, updateCredits, updateGamesPlayed };
})(window);
