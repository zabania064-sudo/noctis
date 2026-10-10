/* ============================================================
   NOCTIS — voyage.js
   Animated counters, booking modal (open/close/focus trap/
   inline validation/success state).
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = document.documentElement.classList.contains('reduced');
  var hasGsap = typeof window.gsap !== 'undefined';

  /* ---------------- Animated counters (CH.02) ---------------- */
  function formatNum(value, format) {
    if (format === 'dec2') return value.toFixed(2);
    return Math.floor(value).toLocaleString('en-US');
  }
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var format = el.getAttribute('data-format') || 'int';
    if (reducedMotion || !hasGsap) { el.textContent = formatNum(target, format); return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 2.6, ease: 'power2.out',
      onUpdate: function () { el.textContent = formatNum(obj.v, format); },
      onComplete: function () { el.textContent = formatNum(target, format); }
    });
  }
  var counted = new WeakSet();
  var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !counted.has(en.target)) {
        counted.add(en.target);
        animateCounter(en.target);
        statObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-num').forEach(function (el) { statObserver.observe(el); });

  /* ---------------- Booking modal ---------------- */
  var backdrop = document.getElementById('modal-backdrop');
  var modal = backdrop.querySelector('.modal');
  var closeBtn = document.getElementById('modal-close');
  var formView = document.getElementById('modal-form-view');
  var successView = document.getElementById('modal-success-view');
  var form = document.getElementById('booking-form');
  var doneBtn = document.getElementById('modal-done');
  var lastTrigger = null;

  var nameInput = document.getElementById('f-name');
  var emailInput = document.getElementById('f-email');
  var tierSelect = document.getElementById('f-tier');
  var dateInput = document.getElementById('f-date');

  // Departure date can't be in the past.
  var today = new Date();
  var iso = today.toISOString().split('T')[0];
  dateInput.setAttribute('min', iso);

  function focusables() {
    return Array.prototype.slice.call(
      modal.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function openModal(tier) {
    lastTrigger = document.activeElement;
    if (tier) tierSelect.value = tier;
    formView.hidden = false;
    successView.hidden = true;
    backdrop.hidden = false;
    // force reflow so the transition plays
    void backdrop.offsetWidth;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { nameInput.focus(); }, 60);
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { backdrop.hidden = true; }, 280);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }

  document.querySelectorAll('[data-reserve]').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-tier')); });
  });
  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (backdrop.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    // focus trap
    if (e.key === 'Tab') {
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- Inline validation ---------------- */
  function setError(input, errEl, msg) {
    if (msg) {
      errEl.textContent = msg;
      errEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
    errEl.textContent = '';
    errEl.hidden = true;
    input.removeAttribute('aria-invalid');
    return true;
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate() {
    var ok = true;
    var name = nameInput.value.trim();
    ok = setError(nameInput, document.getElementById('e-name'),
      name.length < 2 ? 'Please tell us your name.' : '') && ok;
    var email = emailInput.value.trim();
    ok = setError(emailInput, document.getElementById('e-email'),
      !emailRe.test(email) ? 'That email won\u2019t reach Earth. Try again.' : '') && ok;
    var date = dateInput.value;
    var dateBad = !date ? 'Choose a departure date.'
      : (date < iso ? 'Departures only go forward in time.' : '');
    ok = setError(dateInput, document.getElementById('e-date'), dateBad) && ok;
    return ok;
  }

  ['f-name', 'f-email', 'f-date'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      var err = document.getElementById('e-' + id.split('-')[1]);
      if (err && !err.hidden) validate();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstBad = modal.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }
    var ref = 'NX-2047-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    document.getElementById('booking-ref').textContent = ref;
    var d = new Date(dateInput.value + 'T00:00:00');
    var dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('booking-summary').textContent =
      nameInput.value.trim() + ' — ' + tierSelect.value + ', departing ' + dateStr + '.';
    formView.hidden = true;
    successView.hidden = false;
    doneBtn.focus();
  });
})();
