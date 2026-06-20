/* ===========================================================
   UMIDA — PORTFOLIO — main.js
=========================================================== */
(function(){
  "use strict";

  const root = document.documentElement;
  const STORAGE_THEME = "umida-theme";
  const STORAGE_LANG = "umida-lang";

  /* ---------------------------------------------------------
     1) LOADER
  --------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    setTimeout(() => loader.classList.add("hide"), 400);
    setTimeout(() => loader.remove(), 1200);
  });

  /* ---------------------------------------------------------
     2) THEME (dark / light)
  --------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme){
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME, theme);
  }

  (function initTheme(){
    const saved = localStorage.getItem(STORAGE_THEME);
    if(saved){
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  })();

  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------------------------------------------------------
     3) LANGUAGE SWITCH + i18n apply
  --------------------------------------------------------- */
  const langSwitch = document.getElementById("langSwitch");
  const langCurrent = document.getElementById("langCurrent");
  const langLabel = document.getElementById("langLabel");
  const langMenu = document.getElementById("langMenu");

  function applyLanguage(lang){
    const dict = translations[lang] || translations.uz;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if(dict[key]) el.textContent = dict[key];
    });
    document.documentElement.setAttribute("lang", lang);
    langLabel.textContent = langNames[lang] || "UZ";
    localStorage.setItem(STORAGE_LANG, lang);

    langMenu.querySelectorAll("li").forEach(li => {
      li.classList.toggle("selected", li.dataset.lang === lang);
    });
  }

  (function initLang(){
    const saved = localStorage.getItem(STORAGE_LANG);
    applyLanguage(saved || "uz");
  })();

  langCurrent.addEventListener("click", (e) => {
    e.stopPropagation();
    langSwitch.classList.toggle("open");
    langCurrent.setAttribute("aria-expanded", langSwitch.classList.contains("open"));
  });

  langMenu.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if(!li) return;
    applyLanguage(li.dataset.lang);
    langSwitch.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    if(!langSwitch.contains(e.target)) langSwitch.classList.remove("open");
  });

  /* ---------------------------------------------------------
     4) NAVBAR — scrolled state + active link + sliding indicator
  --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navLinks = Array.from(document.querySelectorAll(".nav-links .nav-link"));
  const navIndicator = document.getElementById("navIndicator");
  const sections = navLinks.map(link => document.getElementById(link.dataset.section));

  function onScrollNavbar(){
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", onScrollNavbar, { passive:true });
  onScrollNavbar();

  function moveIndicator(link){
    if(!link) return;
    const navInner = link.closest(".nav-links");
    const linkRect = link.getBoundingClientRect();
    const parentRect = navInner.getBoundingClientRect();
    navIndicator.style.width = linkRect.width + "px";
    navIndicator.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
  }

  function setActiveLink(section){
    navLinks.forEach(l => l.classList.toggle("active", l.dataset.section === section));
    const activeLink = navLinks.find(l => l.dataset.section === section);
    moveIndicator(activeLink);
    document.querySelectorAll(".nav-links-mobile .nav-link").forEach(l => {
      l.classList.toggle("active", l.dataset.section === section);
    });
  }

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        setActiveLink(entry.target.id);
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  sections.forEach(sec => { if(sec) spyObserver.observe(sec); });

  window.addEventListener("load", () => {
    const active = navLinks.find(l => l.classList.contains("active")) || navLinks[0];
    moveIndicator(active);
  });
  window.addEventListener("resize", () => {
    const active = navLinks.find(l => l.classList.contains("active")) || navLinks[0];
    moveIndicator(active);
  });

  document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if(target){
        const offset = 86;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior:"smooth" });
      }
      closeMobileMenu();
    });
  });

  /* ---------------------------------------------------------
     5) MOBILE MENU (burger)
  --------------------------------------------------------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu(){
    burger.classList.remove("open");
    mobileMenu.classList.remove("open");
  }
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  /* ---------------------------------------------------------
     6) SCROLL REVEAL
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     7) ABOUT — expandable cards (click toggles "is-open")
  --------------------------------------------------------- */
  document.querySelectorAll(".info-card").forEach(card => {
    card.addEventListener("click", () => {
      if(card.classList.contains("card-main")) return;
      card.classList.toggle("is-open");
    });
    card.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ---------------------------------------------------------
     8) CURSOR GLOW (desktop)
  --------------------------------------------------------- */
  const cursorGlow = document.getElementById("cursorGlow");
  if(window.matchMedia("(pointer: fine)").matches){
    let raf = null;
    window.addEventListener("mousemove", (e) => {
      cursorGlow.classList.add("active");
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      });
    });
    document.addEventListener("mouseleave", () => cursorGlow.classList.remove("active"));
  }

  /* ---------------------------------------------------------
     9) HERO scene — subtle parallax on mousemove
  --------------------------------------------------------- */
  const scene = document.getElementById("scene3d");
  if(scene && window.matchMedia("(pointer: fine)").matches){
    scene.addEventListener("mousemove", (e) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    scene.addEventListener("mouseleave", () => {
      scene.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
    scene.style.transition = "transform 0.4s ease-out";
    scene.style.transformStyle = "preserve-3d";
  }

  /* ---------------------------------------------------------
     10) Footer year
  --------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     11) Hero blob path (organic shape, generated once)
  --------------------------------------------------------- */
  const blobPath = document.querySelector(".blob-path");
  if(blobPath){
    blobPath.setAttribute("d", "M421,320Q400,440,290,470Q180,500,120,400Q60,300,110,200Q160,100,280,90Q400,80,440,180Q480,280,421,320Z");
  }

})();
