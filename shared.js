/* /shared.js
   STL Home Buyer Journey — v2
   Pure behavior controller. No CSS lives here.
   All visual styling is owned by shared.css.

   Responsibilities:
   - Shared shell rendering
   - Navigation / state
   - Drawer / deep-dive logic
   - Interrupt logic
   - About George popup card
   - George image + speaking ring behavior
   - Visual cue / spotlight behavior
   - Global icon registry
   - Journey rail behavior
   - window.SharedPlatform global helpers
*/
(function () {
  "use strict";

  /* ============================================================
     CONSTANTS
     ============================================================ */

  var STORAGE_KEY = "stl_journey_v1";

  var DEFAULT_STATE = {
    amount: 280000,
    loan: "conventional",
    zip: "63123",
    area: "",
    lastChapter: 1,
    lastStep: 0,
    chaptersVisited: [],
    lessons: [],
    jumpEntry: null
  };

  var DEFAULT_CHAPTERS = [
    { ch: 1, file: "01-preapproval.html",    label: "What actually happens when you click \u201cContact Agent\u201d", icon: "contact",    iconSrc: "assets/icon-ch1.png", iconFallback: "1" },
    { ch: 2, file: "02-affordability.html",  label: "Where buyers accidentally overpay",                              icon: "calculator", iconSrc: "assets/icon-ch2.png", iconFallback: "2" },
    { ch: 3, file: "03-interior.html",       label: "What I look at the moment we walk in",                          icon: "house",      iconSrc: "assets/icon-ch3.png", iconFallback: "3" },
    { ch: 4, file: "05-pre-offer.html",      label: "Where buyers get pushed into offers they can\u2019t take back", icon: "target",     iconSrc: "assets/icon-ch4.png", iconFallback: "4" },
    { ch: 5, file: "06-under-contract.html", label: "Offer accepted \u2014 where deals fall apart",                  icon: "document",   iconSrc: "assets/icon-ch5.png", iconFallback: "5" },
    { ch: 6, file: "06b-deadlines.html",     label: "Three deadlines running in parallel",                           icon: "calendar",   iconSrc: "assets/icon-ch6.png", iconFallback: "6" },
    { ch: 7, file: "07-inspection.html",     label: "Where buyers miss the problems they end up paying for",         icon: "magnifier",  iconSrc: "assets/icon-ch7.png", iconFallback: "7" },
    { ch: 8, file: "08-walkthrough.html",    label: "The final walk-through is not a second showing",                icon: "route",      iconSrc: "assets/icon-ch8.png", iconFallback: "8" },
    { ch: 9, file: "09-closing.html",        label: "What you\u2019re signing at closing",                          icon: "key",        iconSrc: "assets/icon-ch9.png", iconFallback: "9" }
  ];

  var DEFAULT_GEORGE_CARD = {
    name:         "George Kindler",
    titleTop:     "Licensed Missouri Agent",
    titleBottom:  "The Closing Pros LLC",
    image:        "assets/george-proud.png",
    imageLabel:   "George Kindler",
    imageContext: "George Kindler \u2014 licensed Missouri agent with hands-on real estate and renovation experience in St. Louis.",
    phone:        "3144351087",
    phoneLabel:   "314.435.1087 \u2014 No Obligation",
    about:        "I will never sell you. My job is to consult \u2014 help you weigh the facts against my experience.",
    stats: [
      { value: "250+", label: "Homes\nSold"       },
      { value: "13",   label: "Years in\nSt. Louis" },
      { value: "130+", label: "Investment\nDeals"  }
    ]
  };

  /* ============================================================
     ICON REGISTRY
     ============================================================ */

  var ICONS = {
    house:      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 10.5V20h11V10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    calculator: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M8 7.5h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    target:     '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.25" fill="currentColor"/></svg>',
    document:   '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3.5V8h4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 12h5M9.5 15.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    calendar:   '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    magnifier:  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" stroke-width="1.8"/><path d="M15 15l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    route:      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="18" r="2" fill="currentColor"/><circle cx="18" cy="6" r="2" fill="currentColor"/><path d="M8 18c3 0 3-4 6-4s3-4 4-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    key:        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8.5" cy="12" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 12h7m-2 0v-2m-2 2v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    contact:    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Z" stroke="currentColor" stroke-width="1.8"/><path d="M5 7l7 5 7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    map:        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 6.5 9 4l6 2.5 4.5-2v13L15 20l-6-2.5-4.5 2v-13Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 4v13.5M15 6.5V20" stroke="currentColor" stroke-width="1.8"/></svg>',
    phone:      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 4.5h2l1 4-1.5 1.5c1.1 2.2 2.8 3.9 5 5L15.5 13l4 1v2c0 .8-.6 1.5-1.4 1.5-7 0-12.6-5.6-12.6-12.6 0-.8.7-1.4 1.5-1.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    warning:    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.5 20 19.5H4L12 4.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v4.5M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    water:      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.5c2.8 3.2 5 6 5 8.5A5 5 0 1 1 7 13c0-2.5 2.2-5.3 5-8.5Z" stroke="currentColor" stroke-width="1.8"/></svg>',
    electric:   '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 3.5 7.5 13H12l-1 7.5L16.5 11H12l1-7.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    window:     '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="4.5" width="14" height="15" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 4.5v15M5 12h14" stroke="currentColor" stroke-width="1.8"/></svg>',
    structure:  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19.5h14M7 19.5V8.5h10v11M9 8.5V5.5h6v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    layout:     '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 10h8v9.5M12.5 4.5v5.5h7" stroke="currentColor" stroke-width="1.8"/></svg>',
    check:      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ============================================================
     CONFIG RESOLUTION
     ============================================================ */

  var APP_CONFIG = window.APP_CONFIG || {
    title:       "Home Buyer Journey",
    subtitle:    "George Kindler · The Closing Pros",
    toolsUrl:    "index.html",
    guidesUrl:   "https://sites.google.com/view/st-louis-real-estate-guides/freestlouisrealestateguides",
    footerLeft:  "George Kindler · 314.435.1087",
    georgeCard:  DEFAULT_GEORGE_CARD,
    chapters:    DEFAULT_CHAPTERS
  };

  /* ============================================================
     STATE
     ============================================================ */

  var state               = loadState();
  var currentSceneIndex   = 0;
  var interruptDismissed  = false;
  var interruptTimer      = null;
  var spotlightTimeout    = null;

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return Object.assign({}, DEFAULT_STATE, saved);
    } catch (e) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ============================================================
     UTILITIES
     ============================================================ */

  function track(eventName, payload) {
    if (typeof window.gtag === "function") window.gtag("event", eventName, payload || {});
  }

  function byId(id) { return document.getElementById(id); }

  function getChapterNumber() {
    return typeof window.CHAPTER_NUM === "number" ? window.CHAPTER_NUM : 1;
  }

  function getChapterLabel() {
    if (typeof window.CHAPTER_LABEL === "string" && window.CHAPTER_LABEL.trim()) {
      return window.CHAPTER_LABEL.trim();
    }
    var match = APP_CONFIG.chapters.find(function (item) { return item.ch === getChapterNumber(); });
    return match ? match.label : "Chapter";
  }

  function getPrevFile() {
    return (typeof window.PREV_FILE === "string" && window.PREV_FILE.trim())
      ? window.PREV_FILE
      : "index.html";
  }

  function getScenes() {
    return Array.isArray(window.SCENES) ? window.SCENES : [];
  }

  function getGeorgeCardConfig() {
    return Object.assign({}, DEFAULT_GEORGE_CARD, APP_CONFIG.georgeCard || {});
  }

  function renderIcon(name) { return ICONS[name] || ICONS.house; }

  function georgeFace(name) {
    var map = {
      serious:     "assets/george-serious.png",
      welcome:     "assets/george-welcome.png",
      excited:     "assets/george-excited.png",
      proud:       "assets/george-proud.png",
      papers:      "assets/george-papers.png",
      disappointed:"assets/george-disappointed.png"
    };
    return map[name] || map.serious;
  }

  function escapeAttr(v) {
    return String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function nl2br(text) { return String(text || "").replace(/\n/g, "<br>"); }

  function toggleClass(el, cls, active) {
    if (!el) return;
    if (active) el.classList.add(cls);
    else        el.classList.remove(cls);
  }

  function setText(id, v) { var el = byId(id); if (el) el.textContent = v || ""; }
  function setHTML(id, v) { var el = byId(id); if (el) el.innerHTML  = v || ""; }

  function setProgress(idx, total) {
    var el = byId("prog");
    if (!el) return;
    el.style.width = (total <= 1) ? "100%" : Math.round((idx / (total - 1)) * 100) + "%";
  }

  function safelyBind(el, ev, fn) { if (el) el.addEventListener(ev, fn); }

  /* ============================================================
     SHELL RENDERING
     ============================================================ */

  function ensureShell() {
    if (byId("prog") && byId("scene-lbl") && byId("btn-next")) return;

    var mount = byId("app");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "app";
      document.body.appendChild(mount);
    }

    var gc = getGeorgeCardConfig();

    mount.innerHTML = [
      '<div class="app">',

      /* Header */
      '  <header class="hdr">',
      '    <div class="hdr-l">',
      '      <div class="hdr-ico">' + renderIcon("house") + '</div>',
      '      <div>',
      '        <div class="hdr-t">' + APP_CONFIG.title.replace("Journey", "<span>Journey</span>") + '</div>',
      '        <div class="hdr-s">' + APP_CONFIG.subtitle + '</div>',
      '      </div>',
      '    </div>',
      '    <a class="btn-at" href="' + escapeAttr(APP_CONFIG.toolsUrl) + '">&larr; All Tools</a>',
      '  </header>',

      /* Progress */
      '  <div class="prog-wrap"><div class="prog-fill" id="prog"></div></div>',

      /* Scene bar */
      '  <div class="scene-bar">',
      '    <div class="scene-lbl" id="scene-lbl"></div>',
      '    <div class="scene-ch">Chapter ' + getChapterNumber() + '</div>',
      '  </div>',

      /* Stage */
      '  <div class="stage" id="stage">',
      '    <div class="scene-bg"><img id="bg-img" alt=""></div>',
      '    <div class="scene-gradient"></div>',
      '    <div class="scene-svg" id="scene-svg-wrap" style="display:none;"></div>',
      '    <div class="scene-cue-layer" id="scene-cue-layer"></div>',
      '    <div class="scene-spotlight" id="scene-spotlight">',
      '      <div class="scene-spotlight-hole" id="scene-spotlight-hole"></div>',
      '    </div>',

      /* George float */
      '    <div class="george-float" id="george-float" role="button" tabindex="0" aria-label="About George">',
      '      <div class="gf-wrap" id="gf-wrap">',
      '        <div class="gf-ring"></div>',
      '        <img id="george-img" alt="George Kindler">',
      '        <div class="fb fb-init" id="george-fallback">GK</div>',
      '      </div>',
      '    </div>',

      /* Caption */
      '    <div class="scene-caption" id="scene-caption">',
      '      <div class="sc-room" id="sc-room"></div>',
      '      <div class="sc-title" id="sc-title"></div>',
      '      <div class="sc-sub" id="sc-sub"></div>',
      '      <div class="scene-chip-row" id="scene-chip-row"></div>',
      '    </div>',
      '  </div>',

      /* Ask George button */
      '  <button class="ask-george" id="ask-george" type="button">Ask George</button>',

      /* Drawer */
      '  <div class="drawer" id="drawer">',
      '    <div class="drawer-label" id="drawer-label">Ask me anything</div>',
      '    <div class="choices" id="choices"></div>',
      '  </div>',

      /* Bottom nav */
      '  <div class="bnav">',
      '    <button class="btn-b" id="btn-back" type="button">Back</button>',
      '    <button class="btn-n" id="btn-next" type="button">Next &rarr;</button>',
      '  </div>',

      /* Footer */
      '  <footer class="ftr">',
      '    <div class="ftr-l">' + APP_CONFIG.footerLeft + '</div>',
      '    <div class="ftr-r"><a href="' + escapeAttr(APP_CONFIG.guidesUrl) + '" target="_blank" rel="noopener">Free Guides &rarr;</a></div>',
      '  </footer>',

      /* Jump trigger + rail */
      '  <button class="jump-trigger" id="jump-trigger" type="button">&#8942; Jump</button>',
      '  <button class="journey-rail-trigger" id="journey-rail-trigger" type="button" aria-label="Open journey rail">Explore</button>',
      '  <div class="journey-rail" id="journey-rail" aria-hidden="true">',
      '    <div class="journey-rail-inner" id="journey-rail-inner"></div>',
      '  </div>',

      /* Jump overlay */
      '  <div class="jump-ov" id="jump-ov">',
      '    <div class="jump-sh">',
      '      <div class="jump-hnd"></div>',
      '      <div class="jump-ttl">Jump to another chapter</div>',
      '      <div class="jump-items" id="jump-items"></div>',
      '    </div>',
      '  </div>',

      /* Interrupt */
      '  <div class="interrupt-dim" id="int-dim"></div>',
      '  <div class="interrupt-card" id="int-card">',
      '    <div class="int-face" id="int-face">',
      '      <div class="int-ring"></div>',
      '      <img id="int-george-img" alt="George Kindler">',
      '      <div class="fb" id="int-george-fallback">GK</div>',
      '    </div>',
      '    <div class="int-bubble">',
      '      <div class="int-title" id="int-title"></div>',
      '      <div class="int-text" id="int-text"></div>',
      '      <button class="int-btn" id="int-btn" type="button">Got it</button>',
      '      <button class="wire-skip" id="int-skip" type="button" style="display:none;"></button>',
      '    </div>',
      '  </div>',

      /* George card popup */
      '  <div class="george-dim" id="pop">',
      '    <div class="george-card" id="pop-sh">',
      '      <div class="gc-handle"></div>',
      '      <div class="gc-close" id="pop-close" role="button" tabindex="0">&#10005;</div>',
      '      <div class="gc-header">',
      '        <div class="gc-photo" id="gc-photo">',
      '          <div class="gc-photo-ring"></div>',
      '          <img id="gc-photo-img" alt="' + escapeAttr(gc.name) + '">',
      '          <div class="fb" id="gc-photo-fallback">GK</div>',
      '        </div>',
      '        <div class="gc-name-block">',
      '          <div class="gc-name" id="gc-name">' + gc.name + '</div>',
      '          <div class="gc-title" id="gc-title">' + gc.titleTop + '<br><span>' + gc.titleBottom + '</span></div>',
      '        </div>',
      '      </div>',
      '      <div class="gc-stats" id="gc-stats"></div>',
      '      <div class="gc-about" id="gc-about"></div>',
      '      <div class="gc-context-wrap">',
      '        <button class="gc-context-btn" id="gc-context-btn" type="button">',
      '          <span class="gc-context-ico">' + renderIcon("map") + '</span>',
      '          <span id="gc-context-label"></span>',
      '        </button>',
      '        <div class="gc-context-copy" id="gc-context-copy"></div>',
      '      </div>',
      '      <a class="gc-call" id="gc-call" href="#">',
      '        <span class="gc-call-ico">' + renderIcon("phone") + '</span>',
      '        <span id="gc-call-label"></span>',
      '      </a>',
      '    </div>',
      '  </div>',

      '</div>'
    ].join("\n");

    renderGeorgeCardStatic();
  }

  function renderGeorgeCardStatic() {
    var cfg         = getGeorgeCardConfig();
    var statsWrap   = byId("gc-stats");
    var about       = byId("gc-about");
    var call        = byId("gc-call");
    var callLabel   = byId("gc-call-label");
    var ctxLabel    = byId("gc-context-label");
    var ctxCopy     = byId("gc-context-copy");
    var img         = byId("gc-photo-img");

    if (statsWrap) {
      statsWrap.innerHTML = (cfg.stats || []).map(function (s) {
        return '<div class="gc-stat">' +
          '<div class="gc-stat-num">' + nl2br(s.value) + '</div>' +
          '<div class="gc-stat-lbl">' + nl2br(s.label) + '</div>' +
          '</div>';
      }).join("");
    }

    if (about)     about.innerHTML      = cfg.about || "";
    if (call)      call.setAttribute("href", "tel:" + String(cfg.phone || "").replace(/[^\d]/g, ""));
    if (callLabel) callLabel.textContent = cfg.phoneLabel || "";
    if (ctxLabel)  ctxLabel.textContent  = cfg.imageLabel || "What\u2019s in this picture?";
    if (ctxCopy)   ctxCopy.textContent   = cfg.imageContext || "";
    if (img)       loadGeorgeImage(img, cfg.image, byId("gc-photo-fallback"));
  }

  /* ============================================================
     EVENTS
     ============================================================ */

  function bindShellEvents() {
    safelyBind(byId("btn-back"),             "click",   prevScene);
    safelyBind(byId("btn-next"),             "click",   nextScene);
    safelyBind(byId("ask-george"),           "click",   askGeorge);
    safelyBind(byId("jump-trigger"),         "click",   openJump);
    safelyBind(byId("journey-rail-trigger"), "click",   toggleJourneyRail);
    safelyBind(byId("int-btn"),              "click",   function () { dismissInterrupt(false); });
    safelyBind(byId("int-skip"),             "click",   function () { dismissInterrupt(false); nextScene(); });
    safelyBind(byId("int-face"),             "click",   openGeorgeCard);
    safelyBind(byId("pop-close"),            "click",   closePop);
    safelyBind(byId("gc-context-btn"),       "click",   toggleGeorgeContext);
    safelyBind(byId("george-float"),         "click",   openGeorgeCard);
    safelyBind(byId("george-float"),         "keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGeorgeCard(); }
    });
    safelyBind(byId("jump-ov"), "click", function (e) {
      if (e.target === byId("jump-ov")) byId("jump-ov").classList.remove("open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      closePop();
      if (byId("jump-ov"))        byId("jump-ov").classList.remove("open");
      if (byId("journey-rail"))   { byId("journey-rail").classList.remove("open"); byId("journey-rail").setAttribute("aria-hidden", "true"); }
      dismissInterrupt(true);
    });
  }

  /* ============================================================
     GEORGE IMAGE SYSTEM
     ============================================================ */

  function loadGeorgeImage(img, src, fallbackEl) {
    if (!img) return;
    img.onload  = function () { img.style.display = "block"; if (fallbackEl) fallbackEl.classList.add("hidden"); };
    img.onerror = function () { img.style.display = "none";  if (fallbackEl) fallbackEl.classList.remove("hidden"); };
    img.src = src || "";
  }

  function setGeorgeState(faceName, speaking, imageLabel, imageContext) {
    var faceSrc = georgeFace(faceName);
    loadGeorgeImage(byId("george-img"),    faceSrc, byId("george-fallback"));
    loadGeorgeImage(byId("int-george-img"), faceSrc, byId("int-george-fallback"));

    toggleClass(byId("gf-wrap"),   "speaking", !!speaking);
    toggleClass(byId("int-face"),  "speaking", !!speaking);
    toggleClass(byId("gc-photo"),  "speaking", !!speaking);

    var cfg     = getGeorgeCardConfig();
    var ctxLabel = byId("gc-context-label");
    var ctxCopy  = byId("gc-context-copy");
    if (ctxLabel) ctxLabel.textContent = imageLabel || cfg.imageLabel || "What\u2019s in this picture?";
    if (ctxCopy)  {
      ctxCopy.textContent = imageContext || cfg.imageContext || "";
      ctxCopy.classList.remove("open");
    }
  }

  /* ============================================================
     SCENE RENDERING
     ============================================================ */

  function renderScene(idx) {
    var scenes = getScenes();
    var scene  = scenes[idx];
    if (!scene) return;

    currentSceneIndex = idx;

    /* Allow chapter-specific photo-reveal override */
    if (scene.type === "photo-reveal" && typeof window.renderPhotoReveal === "function") {
      window.renderPhotoReveal(scene, idx);
      return;
    }

    setProgress(idx, scenes.length);
    setText("scene-lbl", scene.room  || getChapterLabel());
    setText("sc-room",   scene.room  || "");
    setText("sc-title",  scene.title || "");
    setText("sc-sub",    scene.sub   || "");

    var bgImg   = byId("bg-img");
    var svgWrap = byId("scene-svg-wrap");
    if (bgImg) {
      bgImg.style.display  = "block";
      bgImg.style.opacity  = "0";
      bgImg.onload  = function () { bgImg.style.transition = "opacity .6s ease"; bgImg.style.opacity = "1"; };
      bgImg.onerror = function () { bgImg.style.display = "none"; if (svgWrap) svgWrap.style.display = "flex"; };
      bgImg.src = scene.bg || "";
    }

    setGeorgeState(
      scene.george,
      !!scene.georgeSpeaking || !!scene.interrupt,
      scene.georgeImageLabel,
      scene.georgeImageContext
    );

    dismissInterrupt(true);
    closeDrawer();
    clearVisualCues();
    renderSceneChips(scene.chips   || []);
    renderSceneCues(scene.cues    || []);
    buildChoices(scene.choices  || []);

    var btnBack = byId("btn-back");
    if (btnBack) btnBack.disabled = (idx === 0);

    var btnNext = byId("btn-next");
    if (btnNext) {
      if (scene.isLast) {
        btnNext.textContent = scene.nextLabel || "Next \u2192";
        btnNext.classList.add("gold");
      } else {
        btnNext.textContent = "Next \u2192";
        btnNext.classList.remove("gold");
      }
      btnNext.disabled = false;
    }

    if (scene.interrupt) {
      interruptDismissed = false;
      if (interruptTimer) clearTimeout(interruptTimer);
      interruptTimer = setTimeout(function () {
        if (!interruptDismissed) showInterrupt(scene.interrupt);
      }, 1000);
    } else if (scene.choices && scene.choices.length) {
      setTimeout(openDrawer, 700);
    }

    var askBtn = byId("ask-george");
    if (askBtn) { askBtn.style.display = "none"; askBtn.classList.remove("show"); }

    highlightJourneyRail();

    state.lastStep    = idx;
    state.lastChapter = getChapterNumber();
    saveState();

    track("scene_view", { chapter: getChapterNumber(), scene: idx, room: scene.room || "" });
  }

  /* ============================================================
     CHIPS
     ============================================================ */

  function renderSceneChips(chips) {
    var wrap = byId("scene-chip-row");
    if (!wrap) return;
    wrap.innerHTML = "";
    chips.forEach(function (chip) {
      var btn = document.createElement("button");
      btn.type      = "button";
      btn.className = "scene-chip";
      btn.innerHTML =
        '<span class="scene-chip-ico">' + renderIcon(chip.icon || "check") + '</span>' +
        '<span>' + (chip.label || "") + '</span>';
      btn.addEventListener("click", function () {
        if (chip.deep)                         { showDeep(chip.deep.title, chip.deep.body); return; }
        if (chip.cueIndex != null)             { activateSpotlightFromCueIndex(chip.cueIndex); }
      });
      wrap.appendChild(btn);
    });
  }

  /* ============================================================
     VISUAL CUES + SPOTLIGHT
     ============================================================ */

  function renderSceneCues(cues) {
    var layer      = byId("scene-cue-layer");
    var spotlight  = byId("scene-spotlight");
    if (!layer || !spotlight) return;

    layer.innerHTML = "";
    spotlight.classList.remove("show");

    cues.forEach(function (cue, idx) {
      if (cue.type === "spotlight" && cue.autoplay) {
        setTimeout(function () { activateSpotlight(cue); }, cue.delay || 700);
      }

      if (cue.type === "pulse" || cue.type === "badge") {
        var el = document.createElement("button");
        el.type      = "button";
        el.className = "scene-cue " + cueClassForTone(cue.tone);
        el.style.left = (cue.x || 50) + "%";
        el.style.top  = (cue.y || 50) + "%";
        el.innerHTML  =
          '<div class="scene-cue-dot"></div>' +
          (cue.label ? '<div class="scene-cue-label">' + cue.label + '</div>' : "");
        el.addEventListener("click", function () {
          if (cue.deep)      { showDeep(cue.deep.title, cue.deep.body); }
          else if (cue.spotlight) { activateSpotlight(cue.spotlight); }
        });
        layer.appendChild(el);
      }

      cue._index = idx;
    });
  }

  function cueClassForTone(tone) {
    if (tone === "green") return "pulse-green";
    if (tone === "red")   return "pulse-red";
    return "pulse-yellow";
  }

  function activateSpotlightFromCueIndex(idx) {
    var scene = getScenes()[currentSceneIndex];
    if (!scene || !scene.cues || !scene.cues[idx]) return;
    activateSpotlight(scene.cues[idx].spotlight || scene.cues[idx]);
  }

  function activateSpotlight(cue) {
    var spotlight = byId("scene-spotlight");
    var hole      = byId("scene-spotlight-hole");
    if (!spotlight || !hole) return;

    var size = cue.size || 84;
    hole.style.left   = "calc(" + (cue.x || 50) + "% - " + (size / 2) + "px)";
    hole.style.top    = "calc(" + (cue.y || 50) + "% - " + (size / 2) + "px)";
    hole.style.width  = size + "px";
    hole.style.height = size + "px";
    spotlight.classList.add("show");

    if (spotlightTimeout) clearTimeout(spotlightTimeout);
    spotlightTimeout = setTimeout(function () {
      spotlight.classList.remove("show");
    }, cue.duration || 1800);
  }

  function clearVisualCues() {
    if (spotlightTimeout) clearTimeout(spotlightTimeout);
    if (byId("scene-cue-layer")) byId("scene-cue-layer").innerHTML = "";
    if (byId("scene-spotlight")) byId("scene-spotlight").classList.remove("show");
  }

  /* ============================================================
     DRAWER + CHOICES
     ============================================================ */

  function buildChoices(choices) {
    var container = byId("choices");
    var labelEl   = byId("drawer-label");
    if (!container) return;

    container.innerHTML = "";
    if (labelEl) {
      var scene = getScenes()[currentSceneIndex];
      labelEl.textContent = (scene && scene.drawerLabel) || "Ask me anything";
    }

    choices.forEach(function (choice, idx) {
      var card = document.createElement("div");
      card.className = "choice-card";
      card.id        = "card-" + idx;

      var deepBtn = "";
      if (choice.deep && choice.deep.title && choice.deep.body) {
        deepBtn =
          '<button class="card-deep" type="button" data-title="' + escapeAttr(choice.deep.title) + '" data-body="' + escapeAttr(choice.deep.body) + '">' +
          '\u24D8 ' + choice.deep.title + ' \u2192</button>';
      }

      card.innerHTML =
        '<button class="choice-card-header" type="button" data-choice-index="' + idx + '">' +
        '<span>' + (choice.label || "") + '</span>' +
        '<span class="card-chevron">\u25BC</span>' +
        '</button>' +
        '<div class="choice-card-body">' +
        '<div class="choice-card-response">' + nl2br(choice.response || "") + deepBtn + '</div>' +
        '</div>';

      container.appendChild(card);
    });

    Array.prototype.forEach.call(container.querySelectorAll("[data-choice-index]"), function (btn) {
      btn.addEventListener("click", function () {
        toggleCard(Number(btn.getAttribute("data-choice-index")), choices.length);
      });
    });

    Array.prototype.forEach.call(container.querySelectorAll(".card-deep"), function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        showDeep(btn.getAttribute("data-title"), btn.getAttribute("data-body"));
      });
    });
  }

  function toggleCard(idx, total) {
    for (var i = 0; i < total; i++) {
      var card = byId("card-" + i);
      if (!card) continue;
      if (i === idx) card.classList.toggle("open");
      else           card.classList.remove("open");
    }
    track("choice_tap", { chapter: getChapterNumber(), card: idx });
  }

function openDrawer() { var d = byId("drawer"); if (d) d.classList.add("open"); }
function closeDrawer() { var d = byId("drawer"); if (d) d.classList.remove("open"); }
  /* ============================================================
     INTERRUPT
     ============================================================ */

  function typeText(text, elId) {
    var el = byId(elId);
    if (!el) return;
    el.innerHTML = "";
    var i = 0;
    var t = setInterval(function () {
      el.innerHTML = nl2br(String(text || "").slice(0, i));
      i++;
      if (i > String(text || "").length) clearInterval(t);
    }, 14);
  }

  function showInterrupt(interrupt) {
    setText("int-title", interrupt.title || "");
    typeText(interrupt.text || "", "int-text");

    var btnEl = byId("int-btn");
    if (btnEl) btnEl.textContent = interrupt.btnText || "Got it";

    var skipEl = byId("int-skip");
    if (skipEl) {
      if (interrupt.skipLabel) { skipEl.textContent = interrupt.skipLabel; skipEl.style.display = "block"; }
      else                     { skipEl.style.display = "none"; }
    }

    if (byId("int-dim"))  byId("int-dim").classList.add("active");
    if (byId("int-card")) byId("int-card").classList.add("active");
    closeDrawer();
  }

  function dismissInterrupt(silent) {
    if (interruptTimer) { clearTimeout(interruptTimer); interruptTimer = null; }
    interruptDismissed = true;
    if (byId("int-dim"))  byId("int-dim").classList.remove("active");
    if (byId("int-card")) byId("int-card").classList.remove("active");

    var scene = getScenes()[currentSceneIndex];
    if (!silent && scene && scene.choices && scene.choices.length) {
      setTimeout(openDrawer, 320);
    }
    if (!silent) {
      var askBtn = byId("ask-george");
      if (askBtn) { askBtn.style.display = "block"; askBtn.classList.add("show"); }
    }
  }

  function askGeorge() {
    var scene = getScenes()[currentSceneIndex];
    if (scene && scene.interrupt) { showInterrupt(scene.interrupt); return; }
    openGeorgeCard();
  }

  /* ============================================================
     DEEP DIVE / GEORGE CARD
     ============================================================ */

  function showDeep(title, body) {
    setText("gc-context-label", title || "What\u2019s in this picture?");
    setText("gc-context-copy",  body  || "");
    var ctxCopy = byId("gc-context-copy");
    if (ctxCopy) ctxCopy.classList.add("open");
    openGeorgeCard();
  }

  function openGeorgeCard() {
    var pop  = byId("pop");
    var card = byId("pop-sh");
    if (!pop || !card) return;
    pop.style.display      = "flex";
    pop.style.pointerEvents = "all";
    requestAnimationFrame(function () {
      pop.style.opacity = "1";
      card.classList.add("open");
    });
  }

  function closePop() {
    var pop  = byId("pop");
    var card = byId("pop-sh");
    if (!pop || !card) return;
    pop.style.opacity      = "0";
    pop.style.pointerEvents = "none";
    card.classList.remove("open");
    setTimeout(function () { pop.style.display = "none"; }, 260);
  }

  function toggleGeorgeContext() {
    var copy = byId("gc-context-copy");
    if (copy) copy.classList.toggle("open");
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */

  function nextScene() {
    var scenes = getScenes();
    var scene  = scenes[currentSceneIndex];
    if (!scene) return;

    if (scene.type === "photo-reveal" && window._prAnswered && typeof window.prContinue === "function") {
      window.prContinue();
      return;
    }

    if (scene.isLast) {
      if (!Array.isArray(state.chaptersVisited)) state.chaptersVisited = [];
      if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
        state.chaptersVisited.push(getChapterNumber());
      }
      state.lastChapter = scene.nextChapter || (getChapterNumber() + 1);
      state.lastStep    = 0;
      saveState();
      window.location.href = scene.nextFile || "index.html";
      return;
    }

    if (currentSceneIndex < scenes.length - 1) {
      currentSceneIndex++;
      renderScene(currentSceneIndex);
    }
  }

  function prevScene() {
    if (currentSceneIndex > 0) {
      currentSceneIndex--;
      renderScene(currentSceneIndex);
      return;
    }
    window.location.href = getPrevFile();
  }

  /* ============================================================
     JUMP MENU
     ============================================================ */

  function openJump() {
    var visited   = Array.isArray(state.chaptersVisited) ? state.chaptersVisited : [];
    var container = byId("jump-items");
    var overlay   = byId("jump-ov");
    if (!container || !overlay) return;

    container.innerHTML = APP_CONFIG.chapters.map(function (ch) {
      var isCurrent = ch.ch === getChapterNumber();
      var isVisited = visited.indexOf(ch.ch) !== -1 && !isCurrent;
      return (
        '<div class="jump-item ' + (isCurrent ? "cur-ch" : "") + '" onclick="SharedPlatform.jumpTo(\'' + ch.file + "'," + ch.ch + ')">' +
          '<div class="ji-dot ' + (isCurrent ? "cur" : isVisited ? "vis" : "") + '"></div>' +
          '<div class="ji-icon">' + renderIcon(ch.icon || "house") + '</div>' +
          '<div class="ji-lbl">' + ch.label + (isCurrent ? " \u2190 here" : "") + '</div>' +
          '<div class="ji-arr">' + (isCurrent ? "" : "\u203A") + '</div>' +
        '</div>'
      );
    }).join("");

    overlay.classList.add("open");
  }

  function jumpTo(file, chNum) {
    var overlay = byId("jump-ov");
    if (chNum === getChapterNumber()) {
      if (overlay) overlay.classList.remove("open");
      return;
    }
    if (!Array.isArray(state.chaptersVisited)) state.chaptersVisited = [];
    if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
      state.chaptersVisited.push(getChapterNumber());
    }
    state.jumpEntry = "jump_ch" + chNum;
    saveState();
    window.location.href = file;
  }

  /* ============================================================
     ICON CARD GRID (used by index and chapters)
     ============================================================ */

  function renderIconCardGrid(target, cards) {
    if (!target) return;
    target.innerHTML =
      '<div class="icon-card-grid">' +
        cards.map(function (card) {
          return (
            '<button class="icon-card" type="button" data-file="' + escapeAttr(card.file || "") + '" data-event="' + escapeAttr(card.event || "") + '">' +
              '<span class="icon-card-ico">' + renderIcon(card.icon || "house") + '</span>' +
              '<span class="icon-card-copy">' +
                '<span class="icon-card-title">' + (card.title || "") + '</span>' +
                (card.sub ? '<span class="icon-card-sub">' + card.sub + '</span>' : "") +
              '</span>' +
            '</button>'
          );
        }).join("") +
      '</div>';

    Array.prototype.forEach.call(target.querySelectorAll(".icon-card"), function (btn) {
      btn.addEventListener("click", function () {
        var file      = btn.getAttribute("data-file");
        var eventName = btn.getAttribute("data-event");
        if (eventName) { state.jumpEntry = eventName; saveState(); track("journey_entry", { entry_point: eventName }); }
        if (file)       window.location.href = file;
      });
    });
  }

  /* ============================================================
     JOURNEY CARD LIST (index post-intro 3-click system)
     ============================================================ */

  function createJourneyCardHTML(card) {
    return (
      '<div class="journey-card ' + (card.cardClass || "") + '" data-file="' + escapeAttr(card.file || "") + '" data-event="' + escapeAttr(card.event || "") + '">' +
        '<div class="journey-card-head">' +
          '<div class="journey-card-icon">' + renderIcon(card.icon || "house") + '</div>' +
          '<div class="journey-card-body">' +
            '<div class="journey-card-title">' + (card.title || "") + '</div>' +
          '</div>' +
          '<span class="journey-card-arrow">\u203A</span>' +
        '</div>' +
        '<div class="journey-card-detail">' +
          '<div class="journey-card-detail-inner">' +
            '<div class="journey-card-desc">'  + (card.desc   || "") + '</div>' +
            (card.commit ? '<span class="journey-card-commit">' + card.commit + '</span>' : "") +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderJourneyCardList(target, cards) {
    if (!target) return;
    target.innerHTML = cards.map(createJourneyCardHTML).join("");
    Array.prototype.forEach.call(target.querySelectorAll(".journey-card"), function (card) {
      card.addEventListener("click", function () { handleJourneyCardClick(card); });
    });
  }

  function handleJourneyCardClick(card) {
    var file      = card.getAttribute("data-file");
    var eventName = card.getAttribute("data-event") || "start";

    if (card.classList.contains("expanded")) {
      if (eventName) { state.jumpEntry = eventName; saveState(); track("journey_entry", { entry_point: eventName }); }
      if (file) window.location.href = file;
      return;
    }

    collapseJourneySiblings(card);
    card.classList.add("expanded");
    card.dataset.manualToggle = "1";

    if (card._collapseTimer) clearTimeout(card._collapseTimer);
    card._collapseTimer = setTimeout(function () {
      card.classList.remove("expanded");
      delete card.dataset.manualToggle;
      card._collapseTimer = null;
    }, 10000);
  }

  function collapseJourneySiblings(activeCard) {
    Array.prototype.forEach.call(document.querySelectorAll(".journey-card"), function (card) {
      if (card !== activeCard) {
        card.classList.remove("expanded");
        delete card.dataset.manualToggle;
        if (card._collapseTimer) { clearTimeout(card._collapseTimer); card._collapseTimer = null; }
      }
    });
  }

  /* ============================================================
     JOURNEY RAIL
     ============================================================ */

  function renderJourneyRail() {
    var inner = byId("journey-rail-inner");
    if (!inner) return;

    inner.innerHTML = (APP_CONFIG.chapters || []).map(function (ch) {
      return (
        '<button class="journey-rail-item" type="button" ' +
          'data-file="' + escapeAttr(ch.file || "") + '" ' +
          'data-ch="' + ch.ch + '" ' +
          'aria-label="' + escapeAttr(ch.label || "") + '" ' +
          'title="' + escapeAttr(ch.label || "") + '">' +
          renderIcon(ch.icon || "house") +
        '</button>'
      );
    }).join("");

    Array.prototype.forEach.call(inner.querySelectorAll(".journey-rail-item"), function (btn) {
      btn.addEventListener("click", function () {
        var chNum = Number(btn.getAttribute("data-ch"));
        var file  = btn.getAttribute("data-file");
        if (!file) return;

        if (chNum === getChapterNumber()) { highlightJourneyRail(); return; }

        if (!Array.isArray(state.chaptersVisited)) state.chaptersVisited = [];
        if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
          state.chaptersVisited.push(getChapterNumber());
        }
        state.jumpEntry = "rail_ch" + chNum;
        saveState();
        window.location.href = file;
      });
    });

    highlightJourneyRail();
  }

  function highlightJourneyRail(activeChapter) {
    var inner   = byId("journey-rail-inner");
    if (!inner) return;
    var current = typeof activeChapter === "number" ? activeChapter : getChapterNumber();
    Array.prototype.forEach.call(inner.querySelectorAll(".journey-rail-item"), function (btn) {
      toggleClass(btn, "active", Number(btn.getAttribute("data-ch")) === current);
    });
  }

  function toggleJourneyRail(forceOpen) {
    var rail = byId("journey-rail");
    if (!rail) return;
    var open = typeof forceOpen === "boolean" ? forceOpen : !rail.classList.contains("open");
    rail.classList.toggle("open", open);
    rail.setAttribute("aria-hidden", open ? "false" : "true");
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  function getState() { return JSON.parse(JSON.stringify(state)); }

  /* ============================================================
     INIT
     ============================================================ */

  function init() {
    /* Expose global API immediately so index.html can call it pre-scene */
    window.SharedPlatform = {
      icons:                   ICONS,
      renderIcon:              renderIcon,
      renderIconCardGrid:      renderIconCardGrid,
      renderJourneyCardList:   renderJourneyCardList,
      createJourneyCardHTML:   createJourneyCardHTML,
      handleJourneyCardClick:  handleJourneyCardClick,
      collapseJourneySiblings: collapseJourneySiblings,
      renderJourneyRail:       renderJourneyRail,
      highlightJourneyRail:    highlightJourneyRail,
      toggleJourneyRail:       toggleJourneyRail,
      jumpTo:                  jumpTo,
      openGeorgeCard:          openGeorgeCard,
      closePop:                closePop,
      showDeep:                showDeep,
      openDrawer:              openDrawer,
      closeDrawer:             closeDrawer,
      dismissInterrupt:        dismissInterrupt,
      setGeorgeState:          setGeorgeState,
      activateSpotlight:       activateSpotlight,
      renderSceneChips:        renderSceneChips,
      renderSceneCues:         renderSceneCues,
      getState:                getState,
      saveState:               saveState,
      track:                   track,
      georgeFace:              georgeFace,
      loadGeorgeImage:         loadGeorgeImage,
      renderScene:             renderScene
    };

    var scenes = getScenes();
    if (!scenes.length) return;   /* index.html has no SCENES — it manages its own rendering */

    ensureShell();
    renderJourneyRail();
    bindShellEvents();

    currentSceneIndex = Math.min(
      state.lastChapter === getChapterNumber() ? (state.lastStep || 0) : 0,
      scenes.length - 1
    );

    renderScene(currentSceneIndex);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
