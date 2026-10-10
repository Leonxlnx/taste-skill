/* ─── Nav scroll state ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Mobile menu ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ─── Reveal on scroll ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Counter animation ─── */
function animateCounter(el, target, duration = 1800) {
  const suffix = el.nextElementSibling?.classList.contains('hero__stat-suffix')
    ? el.nextElementSibling
    : null;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = target >= 1000 ? value.toLocaleString() : value;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1000 ? target.toLocaleString() : target;
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.count, 10);
      animateCounter(e.target, target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

/* ─── Savings calculator ─── */
const kmInput    = document.getElementById('kmInput');
const consInput  = document.getElementById('consInput');
const priceInput = document.getElementById('priceInput');
const kmVal      = document.getElementById('kmVal');
const consVal    = document.getElementById('consVal');
const priceVal   = document.getElementById('priceVal');

const LPG_PRICE_RATIO   = 0.5;   // LPG costs ~50% of petrol price
const LPG_CONS_RATIO    = 1.15;  // LPG uses ~15% more volume per km
const CONVERSION_COST   = 14000; // avg conversion cost in ZAR

function fmt(num) { return 'R' + Math.round(num).toLocaleString('en-ZA'); }

function calcSavings() {
  const km    = parseInt(kmInput.value, 10);
  const cons  = parseFloat(consInput.value);
  const price = parseFloat(priceInput.value);

  const petrolMonthly  = (km / 100) * cons * price;
  const lpgPricePerL   = price * LPG_PRICE_RATIO;
  const lpgConsPerKm   = cons * LPG_CONS_RATIO;
  const lpgMonthly     = (km / 100) * lpgConsPerKm * lpgPricePerL;
  const saving         = petrolMonthly - lpgMonthly;
  const paybackMonths  = saving > 0 ? Math.ceil(CONVERSION_COST / saving) : 0;

  document.getElementById('currentCost').textContent  = fmt(petrolMonthly);
  document.getElementById('lpgCost').textContent      = fmt(lpgMonthly);
  document.getElementById('monthlySaving').textContent= fmt(saving);
  document.getElementById('paybackPeriod').textContent =
    paybackMonths > 0 ? `~${paybackMonths} months` : 'N/A';

  updateSliderFill(kmInput);
  updateSliderFill(consInput);
  updateSliderFill(priceInput);
}

function updateSliderFill(input) {
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const val = parseFloat(input.value);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(90deg, var(--c-green) ${pct}%, var(--c-bg-3) ${pct}%)`;
}

kmInput.addEventListener('input', () => {
  kmVal.textContent = parseInt(kmInput.value).toLocaleString() + ' km';
  calcSavings();
});
consInput.addEventListener('input', () => {
  consVal.textContent = parseFloat(consInput.value).toFixed(1) + ' L/100km';
  calcSavings();
});
priceInput.addEventListener('input', () => {
  priceVal.textContent = 'R' + parseFloat(priceInput.value).toFixed(2) + '/L';
  calcSavings();
});

calcSavings(); // initial render

/* ─── FAQ accordion ─── */
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.dataset.open === 'true';
    document.querySelectorAll('.faq-item').forEach(i => i.dataset.open = 'false');
    item.dataset.open = isOpen ? 'false' : 'true';
  });
});

/* ─── Contact form ─── */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('.form__submit');
  btn.textContent = 'Request Sent!';
  btn.style.background = '#16a34a';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send My Request';
    btn.style.background = '';
    btn.disabled = false;
    contactForm.reset();
  }, 4000);
});

/* ─── Smooth scroll for nav links ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = nav.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
