// ---- Settings: fill these in when you have the real details ----
// WhatsApp number in international format, digits only, e.g. "260971234567".
// While this is empty the booking form shows a message instead of opening WhatsApp.
var WHATSAPP_NUMBER = '260979193930';

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  var btn = document.getElementById('menuBtn');
  var links = document.getElementById('navLinks');
  btn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // "Book this" buttons pre-select the service in the form
  var select = document.getElementById('bkWash');
  document.querySelectorAll('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () { select.value = a.dataset.pick; });
  });

  // Booking form opens WhatsApp with the request filled in
  var form = document.getElementById('bookingForm');
  var today = new Date().toISOString().slice(0, 10);
  document.getElementById('bkDate').min = today;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!WHATSAPP_NUMBER) {
      alert('The WhatsApp number has not been added yet. Set WHATSAPP_NUMBER in js/main.js.');
      return;
    }
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var msg = 'Hello One Gunner, I would like to book: ' + v('bkWash') +
      (v('bkDate') ? ' on ' + v('bkDate') : '') +
      (v('bkTime') ? ' at ' + v('bkTime') : '') + '.' +
      (v('bkCar') ? ' Car: ' + v('bkCar') + '.' : '') +
      (v('bkName') ? ' Name: ' + v('bkName') + '.' : '');
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
});

// 3D tilt on the showcase image (desktop pointers only)
document.addEventListener('DOMContentLoaded', function () {
  var wrap = document.getElementById('tilt');
  if (!wrap || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var card = wrap.querySelector('.tilt-card');
  var MAX = 9; // degrees

  wrap.addEventListener('mousemove', function (e) {
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    var y = (e.clientY - r.top) / r.height;
    wrap.classList.add('is-active');
    card.style.setProperty('--ry', ((x - 0.5) * 2 * MAX).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((0.5 - y) * 2 * MAX).toFixed(2) + 'deg');
    card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  });
  wrap.addEventListener('mouseleave', function () {
    wrap.classList.remove('is-active');
    card.style.removeProperty('--rx');
    card.style.removeProperty('--ry');
  });
});

// "Open now" badge, using Lusaka time (CAT). Hours: every day 08:00 to 20:30.
document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('openNow');
  if (!el) return;
  try {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lusaka', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var h = Number(parts.find(function (p) { return p.type === 'hour'; }).value);
    var m = Number(parts.find(function (p) { return p.type === 'minute'; }).value);
    var minutes = h * 60 + m;
    var open = minutes >= 8 * 60 && minutes < 20 * 60 + 30;
    el.textContent = open ? 'Open now. Closes 8:30 PM' : 'Closed now. Opens 8:00 AM';
    el.classList.toggle('closed', !open);
    el.hidden = false;
  } catch (e) { /* leave the badge hidden if Intl is unavailable */ }
});

// Scroll effects: fade-in on entry, shrinking header, progress bar, turning rim
document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Fade elements in as they enter the screen (staggered inside each group)
  var targets = document.querySelectorAll(
    '.section-head, .card, .feature, .steps li, .about > div, .faq details, .booking, .contact-grid > div, .showcase-copy, .tilt, .strip-row > div'
  );
  targets.forEach(function (el) {
    el.classList.add('reveal');
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    el.style.transitionDelay = (Math.max(sibs.indexOf(el), 0) % 6) * 90 + 'ms';
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target;
          t.classList.add('in');
          io.unobserve(t);
          setTimeout(function () { t.style.transitionDelay = ''; t.classList.add('settled'); }, 1400);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // 2. Header, progress bar and rim, throttled with requestAnimationFrame
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('progress');
  var ticking = false;
  function update() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 24);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (!reduce) document.documentElement.style.setProperty('--rot', (y * 0.12).toFixed(1));
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
});
