/* =========================================================
   Prompter Moscow — script.js
   Без зависимостей. Скролл-эффекты только на IntersectionObserver,
   слушателей события scroll нет ни одного.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Год в футере ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Открыть меню');
      }
    });
  }

  /* ---------- Появление секций при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Без анимации показываем всё сразу, чтобы контент не остался невидимым.
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revealEls, function (el) { revealIO.observe(el); });
  }

  /* ---------- Счётчики ---------- */
  var numsBlock = document.getElementById('nums');

  function runCounters() {
    var counters = numsBlock.querySelectorAll('[data-count]');

    Array.prototype.forEach.call(counters, function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;

      if (reduceMotion) {
        el.textContent = target + '+';
        return;
      }

      var duration = 2700;   // в полтора раза медленнее прежних 1800 мс
      var started = null;

      function tick(now) {
        if (started === null) started = now;
        var p = Math.min((now - started) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * eased) + '+';
        if (p < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  if (numsBlock) {
    if (!('IntersectionObserver' in window)) {
      runCounters();
    } else {
      var numsIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounters();
          numsIO.disconnect(); // запускаем ровно один раз
        });
      }, { threshold: 0.35 });

      numsIO.observe(numsBlock);
    }
  }

  /* ---------- Кнопка «наверх» ---------- */
  var toTop = document.getElementById('totop');
  var sentinel = document.getElementById('top-sentinel');

  if (toTop && sentinel && 'IntersectionObserver' in window) {
    toTop.hidden = false;

    var topIO = new IntersectionObserver(function (entries) {
      // Сенсор виден — мы у самого верха, кнопку прячем.
      toTop.classList.toggle('is-on', !entries[0].isIntersecting);
    }, { rootMargin: '600px 0px 0px 0px' });

    topIO.observe(sentinel);

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =========================================================
     Модальная форма
     ========================================================= */
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modal-body');
  var modalDone = document.getElementById('modal-done');
  var form = document.getElementById('frm');
  var submitBtn = document.getElementById('frm-submit');
  var failMsg = document.getElementById('frm-fail');

  var lastFocused = null;
  var lastSubmitAt = 0;
  var sending = false;

  var fName = document.getElementById('f-name');
  var fPhone = document.getElementById('f-phone');
  var fEmail = document.getElementById('f-email');
  var fCompany = document.getElementById('f-company');
  var fField = document.getElementById('f-field');
  var fHoney = document.getElementById('f-website');
  var fAgree1 = document.getElementById('f-agree1');
  var fAgree2 = document.getElementById('f-agree2');

  function dmValue() {
    var picked = form ? form.querySelector('input[name="dm"]:checked') : null;
    return picked ? picked.value : '';
  }

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    if (fName) setTimeout(function () { fName.focus(); }, 30);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-form]');
    if (opener) { e.preventDefault(); openModal(); return; }

    var closer = e.target.closest('[data-close-form]');
    if (closer) { e.preventDefault(); closeModal(); }
  });

  document.addEventListener('keydown', function (e) {
    if (!modal || modal.hidden) return;

    if (e.key === 'Escape') { closeModal(); return; }

    // Держим фокус внутри окна, пока оно открыто.
    if (e.key !== 'Tab') return;

    var focusables = modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    var visible = Array.prototype.filter.call(focusables, function (el) {
      return el.offsetParent !== null;
    });
    if (!visible.length) return;

    var first = visible[0];
    var last = visible[visible.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
  function maskPhone(raw) {
    var digits = raw.replace(/\D/g, '');

    // Пользователь мог начать с 8 или с 7 — приводим к единому виду.
    if (digits[0] === '8' || digits[0] === '7') digits = digits.slice(1);
    digits = digits.slice(0, 10);

    if (!digits) return '';

    var out = '+7 (' + digits.slice(0, 3);
    if (digits.length >= 4) out += ') ' + digits.slice(3, 6);
    if (digits.length >= 7) out += '-' + digits.slice(6, 8);
    if (digits.length >= 9) out += '-' + digits.slice(8, 10);
    return out;
  }

  function phoneDigits(value) {
    var d = value.replace(/\D/g, '');
    if (d[0] === '8' || d[0] === '7') d = d.slice(1);
    return d;
  }

  if (fPhone) {
    fPhone.addEventListener('input', function () {
      fPhone.value = maskPhone(fPhone.value);
    });

    fPhone.addEventListener('focus', function () {
      if (!fPhone.value) fPhone.value = '+7 (';
    });

    fPhone.addEventListener('blur', function () {
      if (phoneDigits(fPhone.value).length === 0) fPhone.value = '';
    });

    // Backspace на пустой группе не должен «залипать» на скобках.
    fPhone.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && phoneDigits(fPhone.value).length === 0) {
        e.preventDefault();
        fPhone.value = '';
      }
    });
  }

  /* ---------- Валидация ---------- */
  function setError(input, errKey, on) {
    var msg = form.querySelector('[data-err="' + errKey + '"]');
    if (msg) msg.hidden = !on;
    if (input) input.classList.toggle('is-bad', on);
  }

  function validName() {
    var ok = fName.value.trim().length >= 2;
    setError(fName, 'name', !ok);
    return ok;
  }

  function validPhone() {
    var ok = phoneDigits(fPhone.value).length === 10;
    setError(fPhone, 'phone', !ok);
    return ok;
  }

  function validEmail() {
    var v = fEmail.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/.test(v);
    setError(fEmail, 'email', !ok);
    return ok;
  }

  function validCompany() {
    var ok = fCompany.value.trim().length >= 2;
    setError(fCompany, 'company', !ok);
    return ok;
  }

  function validField() {
    var ok = fField.value.trim().length >= 2;
    setError(fField, 'field', !ok);
    return ok;
  }

  function validDm() {
    var ok = dmValue() !== '';
    var msg = form.querySelector('[data-err="dm"]');
    if (msg) msg.hidden = ok;
    var group = form.querySelector('.radios');
    if (group) group.classList.toggle('is-bad', !ok);
    return ok;
  }

  function validAgree() {
    var ok = fAgree1.checked && fAgree2.checked;
    var msg = form.querySelector('[data-err="agree"]');
    if (msg) msg.hidden = ok;
    fAgree1.closest('.chk').classList.toggle('is-bad', !fAgree1.checked);
    fAgree2.closest('.chk').classList.toggle('is-bad', !fAgree2.checked);
    return ok;
  }

  if (form) {
    fName.addEventListener('blur', validName);
    fPhone.addEventListener('blur', validPhone);
    fEmail.addEventListener('blur', validEmail);
    fCompany.addEventListener('blur', validCompany);
    fField.addEventListener('blur', validField);
    fAgree1.addEventListener('change', validAgree);
    fAgree2.addEventListener('change', validAgree);

    Array.prototype.forEach.call(form.querySelectorAll('input[name="dm"]'), function (r) {
      r.addEventListener('change', validDm);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      failMsg.hidden = true;

      // Защита от повторной отправки: не чаще одного раза в 3 секунды.
      var now = Date.now();
      if (now - lastSubmitAt < 3000) return;

      // Honeypot: поле скрыто, значит заполнить его мог только бот.
      // Показываем «успех», но ничего не отправляем.
      if (fHoney && fHoney.value.trim() !== '') {
        showDone();
        return;
      }

      // С этого момента место под сообщения об ошибках зарезервировано,
      // и форма перестаёт прыгать при их появлении и исчезновении.
      form.classList.add('is-validated');

      // Проверяем все поля разом, чтобы подсветить сразу каждое незаполненное.
      var okName = validName();
      var okPhone = validPhone();
      var okEmail = validEmail();
      var okCompany = validCompany();
      var okField = validField();
      var okDm = validDm();
      var okAgree = validAgree();

      if (!(okName && okPhone && okEmail && okCompany && okField && okDm && okAgree)) {
        var firstBad = form.querySelector('.is-bad');
        if (firstBad && firstBad.focus) firstBad.focus();
        return;
      }

      lastSubmitAt = now;
      sending = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fName.value.trim(),
          phone: fPhone.value.trim(),
          email: fEmail.value.trim(),
          company: fCompany.value.trim(),
          field: fField.value.trim(),
          dm: dmValue()
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          showDone();
        })
        .catch(function () {
          failMsg.hidden = false;
        })
        .then(function () {
          sending = false;
          submitBtn.disabled = false;
          submitBtn.textContent = 'ОСТАВИТЬ ЗАЯВКУ';
        });
    });
  }

  function showDone() {
    if (!modalBody || !modalDone) return;
    modalBody.hidden = true;
    modalDone.hidden = false;
    form.reset();
    var closeBtn = modalDone.querySelector('[data-close-form]');
    if (closeBtn) closeBtn.focus();

    // Возвращаем форму в исходное состояние при следующем открытии.
    setTimeout(function () {
      if (modal && modal.hidden) {
        modalBody.hidden = false;
        modalDone.hidden = true;
      }
    }, 400);
  }

  // Сбрасываем экран «отправлено» каждый раз, когда окно закрывают.
  if (modal) {
    var resetObserver = new MutationObserver(function () {
      if (modal.hidden && modalBody && modalDone) {
        modalBody.hidden = false;
        modalDone.hidden = true;
        failMsg.hidden = true;
        // Снимаем подсветку ошибок, чтобы форма открылась чистой.
        Array.prototype.forEach.call(form.querySelectorAll('.is-bad'), function (el) {
          el.classList.remove('is-bad');
        });
        Array.prototype.forEach.call(form.querySelectorAll('.frm__e'), function (el) {
          el.hidden = true;
        });
      }
    });
    resetObserver.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
  }
})();
