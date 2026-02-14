/* ================================================
   AD-SENSE — Authentication
   User registration, login, account management
   ================================================ */

(function (window) {
  'use strict';

  const { Storage, Accounts, Validators, DOM, Utils, ErrorUI } = window.AdSense;

  // ─── Sign Up Handler ───
  function handleSignup() {
    const username = DOM.element('signup-username').value.trim();
    const email = DOM.element('signup-email').value.trim();
    const password = DOM.element('signup-password').value;
    const confirmPassword = DOM.element('signup-confirm-password').value;

    ErrorUI.clear('signup-error');

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      ErrorUI.show('signup-error', 'Please fill in all fields');
      return false;
    }

    if (!Validators.username(username)) {
      ErrorUI.show('signup-error', 'Username must be at least 3 characters');
      return false;
    }

    if (!Validators.email(email)) {
      ErrorUI.show('signup-error', 'Please enter a valid email');
      return false;
    }

    if (!Validators.password(password)) {
      ErrorUI.show('signup-error', 'Password must be at least 6 characters');
      return false;
    }

    if (!Validators.passwordMatch(password, confirmPassword)) {
      ErrorUI.show('signup-error', 'Passwords do not match');
      return false;
    }

    // Check if username or email already exists
    const accounts = Accounts.getAll();
    if (accounts[username]) {
      ErrorUI.show('signup-error', 'Username already exists');
      return false;
    }
    if (Object.values(accounts).some((acc) => acc.email === email)) {
      ErrorUI.show('signup-error', 'Email already registered');
      return false;
    }

    // Create new account
    const newAccount = {
      username,
      email,
      password, // Note: In production, hash this!
      credits: 0,
      level: 1,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };

    accounts[username] = newAccount;
    Accounts.saveAll(accounts);
    Accounts.saveCurrent(newAccount);

    // Close modal and update UI
    DOM.element('auth-modal').classList.remove('show');
    window.AdSense.Profile.load();
    clearForms();
    return true;
  }

  // ─── Login Handler ───
  function handleLogin() {
    const emailOrUsername = DOM.element('login-email').value.trim();
    const password = DOM.element('login-password').value;

    ErrorUI.clear('login-error');

    if (!emailOrUsername || !password) {
      ErrorUI.show('login-error', 'Please fill in all fields');
      return false;
    }

    const accounts = Accounts.getAll();

    // Find account by username or email
    let foundAccount = null;
    if (accounts[emailOrUsername]) {
      foundAccount = accounts[emailOrUsername];
    } else {
      foundAccount = Object.values(accounts).find((acc) => acc.email === emailOrUsername);
    }

    if (!foundAccount) {
      ErrorUI.show('login-error', 'Account not found');
      return false;
    }

    if (foundAccount.password !== password) {
      ErrorUI.show('login-error', 'Incorrect password');
      return false;
    }

    // Login successful
    Accounts.saveCurrent(foundAccount);
    DOM.element('auth-modal').classList.remove('show');
    window.AdSense.Profile.load();
    clearForms();
    return true;
  }

  // ─── Logout Handler ───
  function handleLogout() {
    Accounts.saveCurrent(null);
    window.AdSense.Profile.load();
    DOM.element('profile-popover').classList.remove('show');
  }

  // ─── Form Clearing ───
  function clearForms() {
    DOM.element('signup-form').reset();
    DOM.element('login-form').reset();
    ErrorUI.clear('signup-error');
    ErrorUI.clear('login-error');
  }

  // ─── Form Switching ───
  function showSignupForm() {
    DOM.show(DOM.element('signup-form-content'));
    DOM.hide(DOM.element('login-form-content'));
    DOM.element('signup-form').reset();
    ErrorUI.clear('signup-error');
  }

  function showLoginForm() {
    DOM.show(DOM.element('login-form-content'));
    DOM.hide(DOM.element('signup-form-content'));
    DOM.element('login-form').reset();
    ErrorUI.clear('login-error');
  }

  // ─── Initialize Auth UI ───
  function init() {
    const modal = DOM.element('auth-modal');
    const closeBtn = DOM.element('auth-modal-close');
    const overlay = DOM.element('auth-modal-overlay');
    const signUpBtn = DOM.element('sign-up-btn');
    const logoutBtn = DOM.element('logout-btn');
    const signupForm = DOM.element('signup-form');
    const loginForm = DOM.element('login-form');

    if (!modal) return;

    // Open modal
    if (signUpBtn) {
      signUpBtn.addEventListener('click', () => {
        modal.classList.add('show');
        showSignupForm();
      });
    }

    // Close modal
    const closeModal = () => {
      modal.classList.remove('show');
      clearForms();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Form switching
    DOM.queryAll('.switch-form-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target === 'signup') showSignupForm();
        else if (target === 'login') showLoginForm();
      });
    });

    // Form submissions
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.Auth = { init, showSignupForm, showLoginForm };
})(window);
