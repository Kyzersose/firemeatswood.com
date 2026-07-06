/* =========================================================
   Fire Meats Wood — interactions
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var mobile = document.getElementById("mobile-menu");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobile.hidden = open;
    });
    mobile.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        mobile.hidden = true;
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealTargets = [
    ".story__copy", ".story__media",
    ".menu__head", ".menu-card",
    ".catering__pitch", ".ticket",
    ".review", ".find__copy", ".find__media"
  ];
  var els = document.querySelectorAll(revealTargets.join(","));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    els.forEach(function (el, i) {
      el.classList.add("reveal");
      // gentle stagger within a group
      el.style.transitionDelay = (i % 4) * 70 + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- catering form -> mailto (no backend needed) ---------- */
  var form = document.getElementById("catering-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get("name") || "").toString().trim();
      var contact = (d.get("contact") || "").toString().trim();
      var date = (d.get("date") || "").toString().trim();
      var guests = (d.get("guests") || "").toString().trim();
      var details = (d.get("details") || "").toString().trim();

      var lines = [
        "Catering request via firemeatswood.com",
        "-----------------------------------",
        "Name: " + name,
        "Best contact: " + contact,
        "Event date: " + (date || "TBD"),
        "Headcount: " + (guests || "TBD"),
        "",
        "Details:",
        details || "(none provided)"
      ];

      var subject = "Catering Request" + (name ? " — " + name : "");
      var mailto =
        "mailto:firemeatswood@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      window.location.href = mailto;
    });
  }

  /* ---------- hero embers (lightweight canvas) ---------- */
  var canvas = document.querySelector(".hero__embers");
  if (!canvas || prefersReducedMotion) return;

  var ctx = canvas.getContext("2d");
  var hero = canvas.parentElement;
  var embers = [];
  var raf = null;
  var running = false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function size() {
    canvas.width = hero.clientWidth * dpr;
    canvas.height = hero.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeEmber() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      r: Math.random() * 2.2 + 0.6,
      vy: -(Math.random() * 0.7 + 0.25),
      vx: (Math.random() - 0.5) * 0.35,
      life: 0,
      max: Math.random() * 260 + 160,
      hue: 24 + Math.random() * 20 // orange->gold
    };
  }

  function seed() {
    embers = [];
    var count = Math.min(46, Math.round(hero.clientWidth / 26));
    for (var i = 0; i < count; i++) {
      var e = makeEmber();
      e.life = Math.random() * e.max; // pre-warm so screen isn't empty
      embers.push(e);
    }
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      e.x += e.vx;
      e.y += e.vy;
      e.vx += (Math.random() - 0.5) * 0.03; // flutter
      e.life++;
      var t = e.life / e.max;
      var alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      alpha = Math.max(0, alpha) * 0.8;

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + e.hue + ", 100%, 60%, " + alpha + ")";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "hsla(" + e.hue + ", 100%, 55%, " + alpha + ")";
      ctx.fill();

      if (e.life >= e.max || e.y < -20) embers[i] = makeEmber();
    }
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  size();
  seed();
  start();

  window.addEventListener("resize", function () {
    size();
    seed();
  });

  // pause when hero scrolls out of view
  if ("IntersectionObserver" in window) {
    var vis = new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 });
    vis.observe(hero);
  }
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });
})();
