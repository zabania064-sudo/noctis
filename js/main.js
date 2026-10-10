/* ============================================================
   NOCTIS — main.js
   Scroll engine, kinetic typography, cursor, starfields,
   pinned scrub sequences, scroll reveals.
   Guard-first: every feature bails to a static state when
   its dependency is missing or the user prefers reduced motion.
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) document.documentElement.classList.add('reduced');

  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  // If GSAP failed to load, strip the js class so CSS defaults render statically.
  if (!hasGsap) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  if (hasLenis && !reducedMotion) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // Touch fallback: Lenis doesn't smooth native touch scroll, so keep
    // ScrollTrigger in sync via the native scroll event too.
    window.addEventListener('scroll', ScrollTrigger.update, { passive: true });
  }

  function scrollToTarget(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.6 });
    else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('[data-nav]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') { e.preventDefault(); scrollToTarget(href); }
    });
  });

  /* ---------------- Kinetic typography ---------------- */
  // Hero: letter-by-letter from a clipped mask.
  function splitChars(el) {
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var frag = document.createDocumentFragment();
    text.split('').forEach(function (ch) {
      var mask = document.createElement('span');
      mask.className = 'mask';
      mask.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.className = 'char';
      inner.textContent = ch === ' ' ? '\u00a0' : ch;
      mask.appendChild(inner);
      frag.appendChild(mask);
    });
    el.appendChild(frag);
    return el.querySelectorAll('.char');
  }

  // Section titles: word-by-word.
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var mask = document.createElement('span');
      mask.className = 'word-mask';
      mask.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.className = 'word';
      inner.textContent = w;
      mask.appendChild(inner);
      frag.appendChild(mask);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
    return el.querySelectorAll('.word');
  }

  if (!reducedMotion) {
    var heroChars = splitChars(document.getElementById('hero-title'));
    gsap.from(heroChars, {
      yPercent: 112, duration: 1.1, ease: 'power4.out', stagger: 0.05, delay: 0.25
    });

    document.querySelectorAll('.kinetic').forEach(function (el) {
      var words = splitWords(el);
      gsap.from(words, {
        yPercent: 112, duration: 0.9, ease: 'power4.out', stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });
  }

  /* ---------------- Scroll reveals ---------------- */
  if (!reducedMotion && hasST) {
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.fromTo(el, { y: 44, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ---------------- Custom cursor (additive glow) ---------------- */
  var fine = window.matchMedia('(pointer: fine)').matches;
  if (fine && !reducedMotion) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    var label = ring.querySelector('.cursor-label');
    var mx = -100, my = -100, rx = -100, ry = -100, ringScale = 1, ringScaleTarget = 1;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    gsap.ticker.add(function () {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ringScale += (ringScaleTarget - ringScale) * 0.18;
      dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
      ring.style.transform = 'translate(' + (rx - 19) + 'px,' + (ry - 19) + 'px) scale(' + ringScale.toFixed(3) + ')';
    });
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        label.textContent = el.getAttribute('data-cursor');
        ring.classList.add('is-active');
        ringScaleTarget = 1.95;
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('is-active');
        ringScaleTarget = 1;
      });
    });
  } else {
    var cd = document.querySelector('.cursor-dot');
    var cr = document.querySelector('.cursor-ring');
    if (cd) cd.style.display = 'none';
    if (cr) cr.style.display = 'none';
  }

  /* ---------------- Magnetic elements ---------------- */
  if (fine && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------------- Starfield canvas (hero) ---------------- */
  function makeStarfield(canvas, opts) {
    var ctx = canvas.getContext('2d');
    var stars = [], shooting = null, nextShoot = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, running = false, raf = 0, t0 = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      stars = [];
      var n = Math.floor((W * H) / (opts.density || 5200));
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.4 + 0.3,
          tw: Math.random() * Math.PI * 2,
          sp: 0.4 + Math.random() * 1.4,
          hue: Math.random() < 0.12 ? '251,191,36' : (Math.random() < 0.3 ? '34,211,238' : '244,244,248'),
          drift: 2 + Math.random() * 8
        });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 * s.sp + s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + s.hue + ',' + a.toFixed(3) + ')';
        ctx.fill();
        if (!reducedMotion) {
          s.y += s.drift * 0.016; s.x -= s.drift * 0.006;
          if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
        }
      }
      // shooting star
      if (!reducedMotion) {
        if (!shooting && t > nextShoot) {
          shooting = { x: Math.random() * W * 0.7 + W * 0.15, y: Math.random() * H * 0.35, vx: 9 + Math.random() * 5, vy: 3 + Math.random() * 2, life: 1 };
          nextShoot = t + 4000 + Math.random() * 6000;
        }
        if (shooting) {
          shooting.x += shooting.vx; shooting.y += shooting.vy; shooting.life -= 0.016;
          if (shooting.life <= 0 || shooting.x > W + 100) shooting = null;
          else {
            var grad = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx * 12, shooting.y - shooting.vy * 12);
            grad.addColorStop(0, 'rgba(255,255,255,' + (0.9 * shooting.life).toFixed(3) + ')');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(shooting.x, shooting.y);
            ctx.lineTo(shooting.x - shooting.vx * 12, shooting.y - shooting.vy * 12);
            ctx.stroke();
          }
        }
      }
      if (running && !reducedMotion) raf = requestAnimationFrame(draw);
    }
    function start() {
      if (running || reducedMotion && t0) return;
      running = true; t0 = t0 || performance.now();
      if (reducedMotion) draw(t0); // single static frame
      else raf = requestAnimationFrame(draw);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }
    resize(); seed(); start();
    window.addEventListener('resize', function () { resize(); seed(); if (reducedMotion) draw(performance.now()); });
    return { start: start, stop: stop };
  }

  var heroCanvas = document.getElementById('starfield');
  var heroField = makeStarfield(heroCanvas, { density: 5200 });
  new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.isIntersecting ? heroField.start() : heroField.stop(); });
  }, { threshold: 0 }).observe(document.getElementById('departure'));

  /* ---------------- Drift field (ch.02) ---------------- */
  var driftCanvas = document.getElementById('driftfield');
  var driftField = makeStarfield(driftCanvas, { density: 9000 });
  new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.isIntersecting ? driftField.start() : driftField.stop(); });
  }, { threshold: 0 }).observe(document.getElementById('chapter-02'));

  /* ---------------- Pinned scrub: CH.01 earth recede ---------------- */
  if (hasST && !reducedMotion) {
    var earthTl = gsap.timeline({
      scrollTrigger: { trigger: '#chapter-01', start: 'top top', end: '+=260%', pin: true, scrub: 1 }
    });
    var phases = gsap.utils.toArray('.count-phase');
    var earth = document.querySelector('.earth-stage');
    // countdown beats
    earthTl.to(phases[0], { opacity: 1, duration: 0.6 })
           .to(phases[0], { opacity: 0, duration: 0.4 }, '+=0.5');
    earthTl.to(phases[1], { opacity: 1, duration: 0.6 })
           .to(phases[1], { opacity: 0, duration: 0.4 }, '+=0.5');
    earthTl.to(phases[2], { opacity: 1, duration: 0.6 })
           .to(phases[2], { opacity: 0, duration: 0.4 }, '+=0.5');
    earthTl.to(phases[3], { opacity: 1, scale: 1.06, duration: 0.8 })
           .to(phases[3], { opacity: 0, scale: 1.15, duration: 0.6 }, '+=0.7');
    // earth recedes through the whole sequence
    earthTl.to(earth, { scale: 0.14, y: '-24vh', opacity: 0.35, ease: 'none', duration: 4.4 }, 0);
    earthTl.to(phases[4], { opacity: 1, duration: 1.0 }, '-=1.2');
    // visibility handling for absolutely-stacked phases
    phases.forEach(function (p) {
      earthTl.set(p, { visibility: 'visible' }, 0);
    });
  }

  /* ---------------- Pinned scrub: CH.04 horizon approach ---------------- */
  if (hasST && !reducedMotion) {
    var hPhases = gsap.utils.toArray('.horizon-phase');
    var hole = document.querySelector('.hole-stage');
    var horizonTl = gsap.timeline({
      scrollTrigger: { trigger: '#chapter-04', start: 'top top', end: '+=220%', pin: true, scrub: 1 }
    });
    hPhases.forEach(function (p) { horizonTl.set(p, { visibility: 'visible' }, 0); });
    horizonTl.to(hPhases[0], { opacity: 1, duration: 0.8 })
             .to(hole, { scale: 1.4, ease: 'none', duration: 2.2 }, 0)
             .to(hPhases[0], { opacity: 0, y: -40, duration: 0.6 }, '+=0.8')
             // dive: push into the hole, then fade everything to black
             .to(hole, { scale: 2.2, ease: 'power2.in', duration: 1.4 }, '-=0.2')
             .to(hole, { opacity: 0, ease: 'power2.in', duration: 1.0 }, '-=0.8')
             // only from the darkness: the final text emerges
             .to(hPhases[1], { opacity: 1, y: 0, duration: 1.0 }, '+=0.3');
    gsap.set(hPhases[1], { y: 40 });
  }

  // expose for voyage.js
  window.NOCTIS = { scrollToTarget: scrollToTarget, reducedMotion: reducedMotion };
})();
