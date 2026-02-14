/* ================================================
   AD-SENSE — FAQ Accordion
   Collapsible FAQ items
   ================================================ */

(function (window) {
  'use strict';

  const { DOM } = window.AdSense;

  // ─── Initialize FAQ Accordion ───
  function init() {
    DOM.queryAll('.faq-question').forEach((question) => {
      question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        // Close all others
        DOM.queryAll('.faq-item.open').forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            const answerEl = openItem.querySelector('.faq-answer');
            if (answerEl) answerEl.style.maxHeight = '0';
          }
        });

        // Toggle current
        if (isOpen) {
          item.classList.remove('open');
          answer.style.maxHeight = '0';
        } else {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  // ─── Export ───
  window.AdSense = window.AdSense || {};
  window.AdSense.FAQ = { init };
})(window);
