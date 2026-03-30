/* /shared.js
   STL Home Buyer Journey
   Shared platform controller
   - Shared shell/layout
   - Navigation/state
   - Drawer/deep dives
   - Interrupts
   - About George card
   - Icon system
   - Visual cue system
   - Journey rail
   - Global helper exposure for other pages
*/
(function () {
  "use strict";

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
    { ch: 1, file: "01-preapproval.html", label: "What actually happens when you click “Contact Agent”", icon: "contact" },
    { ch: 2, file: "02-affordability.html", label: "Where buyers accidentally overpay", icon: "calculator" },
    { ch: 3, file: "03-interior.html", label: "What I look at the moment we walk in", icon: "house" },
    { ch: 4, file: "05-pre-offer.html", label: "Where buyers get pushed into offers they can’t take back", icon: "target" },
    { ch: 5, file: "06-under-contract.html", label: "Offer accepted — where deals fall apart", icon: "document" },
    { ch: 6, file: "06b-deadlines.html", label: "Three deadlines running in parallel", icon: "calendar" },
    { ch: 7, file: "07-inspection.html", label: "Where buyers miss the problems they end up paying for", icon: "magnifier" },
    { ch: 8, file: "08-walkthrough.html", label: "The final walk-through is not a second showing", icon: "route" },
    { ch: 9, file: "09-closing.html", label: "What you’re signing at closing", icon: "key" }
  ];

  var DEFAULT_GEORGE_CARD = {
    name: "George Kindler",
    titleTop: "Licensed Missouri Agent",
    titleBottom: "The Closing Pros LLC",
    image: "assets/george-proud.png",
    imageLabel: "George Kindler",
    imageContext: "George Kindler — licensed Missouri agent with hands-on real estate and renovation experience in St. Louis.",
    phone: "3144351087",
    phoneLabel: "314.435.1087 — No Obligation",
    about: "I will never sell you. My job is to consult — help you weigh the facts against my experience.",
    stats: [
      { value: "250+", label: "Homes\nSold" },
      { value: "13", label: "Years in\nSt. Louis" },
      { value: "130+", label: "Investment\nDeals" }
    ]
  };

  var ICONS = {
    house: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6.5 10.5V20h11V10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    calculator: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2.5" stroke="currentColor" stroke-width="1.8"></rect><path d="M8 7.5h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M8 12h2M14 12h2M8 16h2M14 16h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"></circle><circle cx="12" cy="12" r="1.25" fill="currentColor"></circle></svg>',
    document: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path><path d="M14 3.5V8h4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path><path d="M9.5 12h5M9.5 15.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"></rect><path d="M8 3.5v4M16 3.5v4M4 9.5h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    magnifier: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" stroke-width="1.8"></circle><path d="M15 15l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="18" r="2" fill="currentColor"></circle><circle cx="18" cy="6" r="2" fill="currentColor"></circle><path d="M8 18c3 0 3-4 6-4s3-4 4-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8.5" cy="12" r="3.5" stroke="currentColor" stroke-width="1.8"></circle><path d="M12 12h7m-2 0v-2m-2 2v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Z" stroke="currentColor" stroke-width="1.8"></path><path d="M5 7l7 5 7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 6.5 9 4l6 2.5 4.5-2v13L15 20l-6-2.5-4.5 2v-13Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path><path d="M9 4v13.5M15 6.5V20" stroke="currentColor" stroke-width="1.8"></path></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 4.5h2l1 4-1.5 1.5c1.1 2.2 2.8 3.9 5 5L15.5 13l4 1v2c0 .8-.6 1.5-1.4 1.5-7 0-12.6-5.6-12.6-12.6 0-.8.7-1.4 1.5-1.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.5 20 19.5H4L12 4.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path><path d="M12 9v4.5M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    water: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.5c2.8 3.2 5 6 5 8.5A5 5 0 1 1 7 13c0-2.5 2.2-5.3 5-8.5Z" stroke="currentColor" stroke-width="1.8"></path></svg>',
    electric: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 3.5 7.5 13H12l-1 7.5L16.5 11H12l1-7.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path></svg>',
    window: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="4.5" width="14" height="15" rx="1.5" stroke="currentColor" stroke-width="1.8"></rect><path d="M12 4.5v15M5 12h14" stroke="currentColor" stroke-width="1.8"></path></svg>',
    structure: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19.5h14M7 19.5V8.5h10v11M9 8.5V5.5h6v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    layout: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="1.5" stroke="currentColor" stroke-width="1.8"></rect><path d="M4.5 10h8v9.5M12.5 4.5v5.5h7" stroke="currentColor" stroke-width="1.8"></path></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
  };

  var APP_CONFIG = window.APP_CONFIG || {
    title: "Home Buyer Journey",
    subtitle: "George Kindler · The Closing Pros",
    toolsUrl: "index.html",
    guidesUrl: "https://sites.google.com/view/st-louis-real-estate-guides/freestlouisrealestateguides",
    footerLeft: "George Kindler · 314.435.1087",
    georgeCard: DEFAULT_GEORGE_CARD,
    chapters: DEFAULT_CHAPTERS
  };

  var state = loadState();
  var currentSceneIndex = 0;
  var interruptDismissed = false;
  var interruptTimer = null;
  var spotlightTimeout = null;

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return Object.assign({}, DEFAULT_STATE, saved);
    } catch (error) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {}
  }

  function track(eventName, payload) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload || {});
    }
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function getChapterNumber() {
    return typeof window.CHAPTER_NUM === "number" ? window.CHAPTER_NUM : 1;
  }

  function getChapterLabel() {
    if (typeof window.CHAPTER_LABEL === "string" && window.CHAPTER_LABEL.trim()) {
      return window.CHAPTER_LABEL.trim();
    }
    var match = APP_CONFIG.chapters.find(function (item) {
      return item.ch === getChapterNumber();
    });
    return match ? match.label : "Chapter";
  }

  function getPrevFile() {
    return typeof window.PREV_FILE === "string" && window.PREV_FILE.trim()
      ? window.PREV_FILE
      : "index.html";
  }

  function getScenes() {
    return Array.isArray(window.SCENES) ? window.SCENES : [];
  }

  function getGeorgeCardConfig() {
    return Object.assign({}, DEFAULT_GEORGE_CARD, APP_CONFIG.georgeCard || {});
  }

  function renderIcon(name) {
    return ICONS[name] || ICONS.house;
  }

  function georgeFace(name) {
    var map = {
      serious: "assets/george-serious.png",
      welcome: "assets/george-welcome.png",
      excited: "assets/george-excited.png",
      proud: "assets/george-proud.png",
      papers: "assets/george-papers.png",
      disappointed: "assets/george-disappointed.png"
    };
    return map[name] || map.serious;
  }

  function escapeAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function nl2br(text) {
    return String(text || "").replace(/\n/g, "<br>");
  }

  function toggleClass(element, className, active) {
    if (!element) return;
    if (active) element.classList.add(className);
    else element.classList.remove(className);
  }

  function setText(id, value) {
    var element = byId(id);
    if (element) element.textContent = value || "";
  }

  function setHTML(id, value) {
    var element = byId(id);
    if (element) element.innerHTML = value || "";
  }

  function setProgress(idx, total) {
    var progress = byId("prog");
    if (!progress) return;
    if (total <= 1) {
      progress.style.width = "100%";
      return;
    }
    progress.style.width = Math.round((idx / (total - 1)) * 100) + "%";
  }

  function injectPlatformStyles() {
    if (byId("shared-platform-style")) return;

    var style = document.createElement("style");
    style.id = "shared-platform-style";
    style.textContent = [
      ".hdr-ico svg,.icon-card-ico svg,.scene-chip-ico svg,.ji-icon svg,.gc-call-ico svg,.gc-context-ico svg,.journey-rail-item svg{width:100%;height:100%;display:block;}",
      ".hdr-ico{display:flex;align-items:center;justify-content:center;}",
      ".george-float{width:188px !important;left:0;bottom:0;cursor:pointer;}",
      ".george-float img{border-radius:58% 58% 0 0;}",
      ".scene-caption{padding-left:198px !important;}",
      ".gf-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;width:100%;height:auto;}",
      ".gf-ring,.int-ring,.gc-photo-ring{position:absolute;inset:-6px;border-radius:999px;border:2px solid rgba(255,204,77,.22);pointer-events:none;transition:border-color .2s ease, box-shadow .2s ease, opacity .2s ease;}",
      ".gf-wrap.speaking .gf-ring,.int-face.speaking .int-ring,.gc-photo.speaking .gc-photo-ring{border-color:rgba(93,202,165,.95);box-shadow:0 0 0 4px rgba(93,202,165,.12),0 0 18px rgba(93,202,165,.42),0 0 38px rgba(93,202,165,.18);animation:gfPulse 1.8s ease-in-out infinite;}",
      "@keyframes gfPulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.04);opacity:.92}100%{transform:scale(1);opacity:1}}",
      ".fb.hidden{display:none !important;}",
      ".icon-card-grid{display:grid;gap:10px;}",
      ".icon-card{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:14px;color:var(--text-soft);cursor:pointer;transition:border-color .18s ease,background .18s ease,transform .12s ease;}",
      ".icon-card:active{transform:scale(.99);}",
      ".icon-card:hover{border-color:var(--gold-line);background:rgba(255,255,255,.04);}",
      ".icon-card-ico{width:22px;height:22px;flex-shrink:0;color:var(--gold);}",
      ".icon-card-copy{min-width:0;flex:1;display:block;}",
      ".icon-card-title{display:block;font-family:var(--font-serif);font-size:15px;font-weight:600;color:var(--text-strong);line-height:1.2;}",
      ".icon-card-sub{display:block;margin-top:4px;font-size:11px;color:var(--text-dim);line-height:1.5;}",
      ".scene-chip-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0;}",
      ".scene-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--text-soft);font-size:11px;font-weight:700;letter-spacing:.02em;cursor:pointer;transition:border-color .18s ease,color .18s ease,background .18s ease;}",
      ".scene-chip:hover{border-color:var(--gold-line);color:var(--text-strong);background:rgba(255,255,255,.05);}",
      ".scene-chip-ico{width:14px;height:14px;color:var(--gold);display:inline-flex;align-items:center;justify-content:center;}",
      ".scene-cue-layer{position:absolute;inset:0;z-index:13;pointer-events:none;}",
      ".scene-cue{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;background:none;border:none;padding:0;}",
      ".scene-cue-dot{width:22px;height:22px;border-radius:999px;border:2px solid rgba(255,255,255,.65);background:rgba(255,255,255,.08);backdrop-filter:blur(2px);position:relative;}",
      ".scene-cue.pulse-green .scene-cue-dot{border-color:rgba(93,202,165,.95);box-shadow:0 0 0 0 rgba(93,202,165,.34);animation:cuePulseGreen 1.8s infinite;}",
      ".scene-cue.pulse-yellow .scene-cue-dot{border-color:rgba(255,204,77,.96);box-shadow:0 0 0 0 rgba(255,204,77,.30);animation:cuePulseYellow 1.8s infinite;}",
      ".scene-cue.pulse-red .scene-cue-dot{border-color:rgba(224,85,85,.96);box-shadow:0 0 0 0 rgba(224,85,85,.28);animation:cuePulseRed 1.8s infinite;}",
      "@keyframes cuePulseGreen{0%{box-shadow:0 0 0 0 rgba(93,202,165,.36)}70%{box-shadow:0 0 0 16px rgba(93,202,165,0)}100%{box-shadow:0 0 0 0 rgba(93,202,165,0)}}",
      "@keyframes cuePulseYellow{0%{box-shadow:0 0 0 0 rgba(255,204,77,.34)}70%{box-shadow:0 0 0 16px rgba(255,204,77,0)}100%{box-shadow:0 0 0 0 rgba(255,204,77,0)}}",
      "@keyframes cuePulseRed{0%{box-shadow:0 0 0 0 rgba(224,85,85,.30)}70%{box-shadow:0 0 0 16px rgba(224,85,85,0)}100%{box-shadow:0 0 0 0 rgba(224,85,85,0)}}",
      ".scene-cue-label{margin-top:8px;display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border-radius:999px;background:rgba(10,10,10,.92);border:1px solid var(--line-2);color:var(--text-soft);font-size:10px;font-weight:700;line-height:1;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.28);}",
      ".scene-spotlight{position:absolute;inset:0;pointer-events:none;background:rgba(0,0,0,.42);opacity:0;transition:opacity .25s ease;z-index:12;}",
      ".scene-spotlight.show{opacity:1;}",
      ".scene-spotlight-hole{position:absolute;border-radius:999px;border:1px solid rgba(255,255,255,.14);box-shadow:0 0 0 9999px rgba(0,0,0,.42);}",
      ".ji-icon{width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;}",
      ".gc-photo{position:relative;width:108px !important;height:108px !important;}",
      ".gc-photo-ring{inset:-7px;}",
      ".gc-context-wrap{padding:14px 22px 0;}",
      ".gc-context-btn{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:11px 12px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--text-soft);font-size:12px;line-height:1.5;cursor:pointer;transition:border-color .18s ease,background .18s ease,color .18s ease;}",
      ".gc-context-btn:hover{border-color:var(--gold-line);background:rgba(255,255,255,.05);color:var(--text-strong);}",
      ".gc-context-ico{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;}",
      ".gc-context-copy{padding:10px 12px 0;color:var(--text-dim);font-size:12px;line-height:1.65;display:none;}",
      ".gc-context-copy.open{display:block;}",
      ".gc-close{z-index:3;}",
      ".int-face{position:relative;cursor:pointer;}",
      ".int-ring{inset:-6px;}",
      ".jump-item{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:12px;}",
      ".journey-rail-trigger{position:fixed;right:14px;bottom:146px;z-index:89;display:flex;align-items:center;gap:6px;background:rgba(16,16,16,.96);border:1px solid rgba(255,204,77,.34);border-radius:999px;padding:8px 13px;color:var(--gold);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.4);transition:border-color .18s ease,color .18s ease,background .18s ease,opacity .18s ease;}",
      ".journey-rail-trigger:hover{border-color:rgba(255,204,77,.5);background:rgba(255,204,77,.08);}",
      ".journey-rail{position:fixed;top:92px;right:8px;bottom:84px;width:72px;z-index:88;pointer-events:none;opacity:0;transform:translateX(18px);transition:opacity .28s ease,transform .28s ease;}",
      ".journey-rail.open{opacity:1;transform:translateX(0);pointer-events:auto;}",
      ".journey-rail-inner{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;overflow-y:auto;padding:6px 2px;}",
      ".journey-rail-inner::-webkit-scrollbar{display:none;}",
      ".journey-rail-item{width:56px;min-height:56px;border:1px solid var(--line-2);border-radius:16px;background:rgba(10,10,10,.92);color:var(--gold);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .18s ease,background .18s ease,transform .12s ease;box-shadow:0 8px 20px rgba(0,0,0,.28);}",
      ".journey-rail-item:hover{border-color:var(--gold-line);background:rgba(255,255,255,.04);}",
      ".journey-rail-item:active{transform:scale(.97);}",
      ".journey-rail-item svg{width:20px;height:20px;}",
      ".journey-rail-item.active{border-color:var(--gold-line);background:rgba(255,204,77,.1);}",
      "@media (max-width:430px){.george-float{width:164px !important;}.scene-caption{padding-left:170px !important;}.gc-photo{width:96px !important;height:96px !important;}.journey-rail{right:6px;width:66px;top:88px;bottom:82px;}.journey-rail-item{width:52px;min-height:52px;}.journey-rail-trigger{right:12px;bottom:138px;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureShell() {
    if (byId("prog") && byId("scene-lbl") && byId("btn-next")) return;

    var mount = byId("app");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "app";
      document.body.appendChild(mount);
    }

    var georgeCard = getGeorgeCardConfig();

    mount.innerHTML = [
      '<div class="app">',
      '  <header class="hdr">',
      '    <div class="hdr-l">',
      '      <div class="hdr-ico">' + renderIcon("house") + "</div>",
      '      <div>',
      '        <div class="hdr-t">' + APP_CONFIG.title.replace("Journey", "<span>Journey</span>") + "</div>",
      '        <div class="hdr-s">' + APP_CONFIG.subtitle + "</div>",
      "      </div>",
      "    </div>",
      '    <a class="btn-at" href="' + escapeAttr(APP_CONFIG.toolsUrl) + '">&larr; All Tools</a>',
      "  </header>",
      '  <div class="prog-wrap"><div class="prog-fill" id="prog"></div></div>',
      '  <div class="scene-bar">',
      '    <div class="scene-lbl" id="scene-lbl"></div>',
      '    <div class="scene-ch">Chapter ' + getChapterNumber() + "</div>",
      "  </div>",
      '  <div class="stage" id="stage">',
      '    <div class="scene-bg"><img id="bg-img" alt=""></div>',
      '    <div class="scene-gradient"></div>',
      '    <div class="scene-svg" id="scene-svg-wrap" style="display:none;"></div>',
      '    <div class="scene-cue-layer" id="scene-cue-layer"></div>',
      '    <div class="scene-spotlight" id="scene-spotlight"><div class="scene-spotlight-hole" id="scene-spotlight-hole"></div></div>',
      '    <div class="george-float" id="george-float" role="button" tabindex="0" aria-label="About George">',
      '      <div class="gf-wrap" id="gf-wrap">',
      '        <div class="gf-ring"></div>',
      '        <img id="george-img" alt="George Kindler">',
      '        <div class="fb fb-init" id="george-fallback">GK</div>',
      "      </div>",
      "    </div>",
      '    <div class="scene-caption" id="scene-caption">',
      '      <div class="sc-room" id="sc-room"></div>',
      '      <div class="sc-title" id="sc-title"></div>',
      '      <div class="sc-sub" id="sc-sub"></div>',
      '      <div class="scene-chip-row" id="scene-chip-row"></div>',
      "    </div>",
      "  </div>",
      '  <button class="ask-george" id="ask-george" type="button">Ask George</button>',
      '  <div class="drawer" id="drawer">',
      '    <div class="drawer-label" id="drawer-label">Ask me anything</div>',
      '    <div class="choices" id="choices"></div>',
      "  </div>",
      '  <div class="bnav">',
      '    <button class="btn-b" id="btn-back" type="button">Back</button>',
      '    <button class="btn-n" id="btn-next" type="button">Next &rarr;</button>',
      "  </div>",
      '  <footer class="ftr">',
      '    <div class="ftr-l">' + APP_CONFIG.footerLeft + "</div>",
      '    <div class="ftr-r"><a href="' + escapeAttr(APP_CONFIG.guidesUrl) + '" target="_blank" rel="noopener">Free Guides &rarr;</a></div>',
      "  </footer>",
      '  <button class="jump-trigger" id="jump-trigger" type="button">&#8942; Jump</button>',
      '  <button class="journey-rail-trigger" id="journey-rail-trigger" type="button" aria-label="Open journey rail">Explore</button>',
      '  <div class="journey-rail" id="journey-rail" aria-hidden="true">',
      '    <div class="journey-rail-inner" id="journey-rail-inner"></div>',
      "  </div>",
      '  <div class="jump-ov" id="jump-ov">',
      '    <div class="jump-sh">',
      '      <div class="jump-hnd"></div>',
      '      <div class="jump-ttl">Jump to another chapter</div>',
      '      <div class="jump-items" id="jump-items"></div>',
      "    </div>",
      "  </div>",
      '  <div class="interrupt-dim" id="int-dim"></div>',
      '  <div class="interrupt-card" id="int-card">',
      '    <div class="int-face" id="int-face">',
      '      <div class="int-ring"></div>',
      '      <img id="int-george-img" alt="George Kindler">',
      '      <div class="fb" id="int-george-fallback">GK</div>',
      "    </div>",
      '    <div class="int-bubble">',
      '      <div class="int-title" id="int-title"></div>',
      '      <div class="int-text" id="int-text"></div>',
      '      <button class="int-btn" id="int-btn" type="button">Got it</button>',
      '      <button class="wire-skip" id="int-skip" type="button" style="display:none;"></button>',
      "    </div>",
      "  </div>",
      '  <div class="george-dim" id="pop" style="display:none;">',
      '    <div class="george-card" id="pop-sh">',
      '      <div class="gc-handle"></div>',
      '      <div class="gc-close" id="pop-close" role="button" tabindex="0">&#10005;</div>',
      '      <div class="gc-header">',
      '        <div class="gc-photo" id="gc-photo">',
      '          <div class="gc-photo-ring"></div>',
      '          <img id="gc-photo-img" alt="' + escapeAttr(georgeCard.name) + '">',
      '          <div class="fb" id="gc-photo-fallback">GK</div>',
      "        </div>",
      '        <div class="gc-name-block">',
      '          <div class="gc-name" id="gc-name">' + georgeCard.name + "</div>",
      '          <div class="gc-title" id="gc-title">' + georgeCard.titleTop + "<br><span>" + georgeCard.titleBottom + "</span></div>",
      "        </div>",
      "      </div>",
      '      <div class="gc-stats" id="gc-stats"></div>',
      '      <div class="gc-about" id="gc-about"></div>',
      '      <div class="gc-context-wrap">',
      '        <button class="gc-context-btn" id="gc-context-btn" type="button">',
      '          <span class="gc-context-ico">' + renderIcon("map") + "</span>",
      '          <span id="gc-context-label"></span>',
      "        </button>",
      '        <div class="gc-context-copy" id="gc-context-copy"></div>',
      "      </div>",
      '      <a class="gc-call" id="gc-call" href="#">',
      '        <span class="gc-call-ico" style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">' + renderIcon("phone") + "</span>",
      '        <span id="gc-call-label"></span>',
      "      </a>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");

    renderGeorgeCardStatic();
  }

  function renderGeorgeCardStatic() {
    var cfg = getGeorgeCardConfig();
    var statsWrap = byId("gc-stats");
    var about = byId("gc-about");
    var call = byId("gc-call");
    var callLabel = byId("gc-call-label");
    var contextLabel = byId("gc-context-label");
    var contextCopy = byId("gc-context-copy");
    var img = byId("gc-photo-img");

    if (statsWrap) {
      statsWrap.innerHTML = (cfg.stats || []).map(function (stat) {
        return (
          '<div class="gc-stat">' +
            '<div class="gc-stat-num">' + nl2br(stat.value) + "</div>" +
            '<div class="gc-stat-lbl">' + nl2br(stat.label) + "</div>" +
          "</div>"
        );
      }).join("");
    }

    if (about) about.innerHTML = cfg.about || "";
    if (call) call.setAttribute("href", "tel:" + String(cfg.phone || "").replace(/[^\d]/g, ""));
    if (callLabel) callLabel.textContent = cfg.phoneLabel || "";
    if (contextLabel) contextLabel.textContent = cfg.imageLabel || "What’s in this picture?";
    if (contextCopy) contextCopy.textContent = cfg.imageContext || "";
    if (img) loadGeorgeImage(img, cfg.image, byId("gc-photo-fallback"));
  }

  function safelyBind(element, eventName, handler) {
    if (element) element.addEventListener(eventName, handler);
  }

  function bindShellEvents() {
    safelyBind(byId("btn-back"), "click", prevScene);
    safelyBind(byId("btn-next"), "click", nextScene);
    safelyBind(byId("ask-george"), "click", askGeorge);
    safelyBind(byId("jump-trigger"), "click", openJump);
    safelyBind(byId("journey-rail-trigger"), "click", toggleJourneyRail);
    safelyBind(byId("int-btn"), "click", function () { dismissInterrupt(false); });
    safelyBind(byId("int-skip"), "click", function () {
      dismissInterrupt(false);
      nextScene();
    });
    safelyBind(byId("int-face"), "click", openGeorgeCard);
    safelyBind(byId("pop-close"), "click", closePop);
    safelyBind(byId("gc-context-btn"), "click", toggleGeorgeContext);
    safelyBind(byId("george-float"), "click", openGeorgeCard);
    safelyBind(byId("george-float"), "keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGeorgeCard();
      }
    });

    safelyBind(byId("jump-ov"), "click", function (event) {
      if (event.target === byId("jump-ov")) {
        byId("jump-ov").classList.remove("open");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePop();
        if (byId("jump-ov")) byId("jump-ov").classList.remove("open");
        if (byId("journey-rail")) {
          byId("journey-rail").classList.remove("open");
          byId("journey-rail").setAttribute("aria-hidden", "true");
        }
        dismissInterrupt(true);
      }
    });
  }

  function loadGeorgeImage(img, src, fallbackEl) {
    if (!img) return;
    fallbackEl = fallbackEl || null;

    img.onload = function () {
      img.style.display = "block";
      if (fallbackEl) fallbackEl.classList.add("hidden");
    };

    img.onerror = function () {
      img.style.display = "none";
      if (fallbackEl) fallbackEl.classList.remove("hidden");
    };

    img.src = src || "";
  }

  function setGeorgeState(faceName, speaking, imageLabel, imageContext) {
    var faceSrc = georgeFace(faceName);
    loadGeorgeImage(byId("george-img"), faceSrc, byId("george-fallback"));
    loadGeorgeImage(byId("int-george-img"), faceSrc, byId("int-george-fallback"));

    toggleClass(byId("gf-wrap"), "speaking", !!speaking);
    toggleClass(byId("int-face"), "speaking", !!speaking);
    toggleClass(byId("gc-photo"), "speaking", !!speaking);

    var cfg = getGeorgeCardConfig();
    var contextLabel = byId("gc-context-label");
    var contextCopy = byId("gc-context-copy");
    if (contextLabel) contextLabel.textContent = imageLabel || cfg.imageLabel || "What’s in this picture?";
    if (contextCopy) {
      contextCopy.textContent = imageContext || cfg.imageContext || "";
      contextCopy.classList.remove("open");
    }
  }

  function renderScene(idx) {
    var scenes = getScenes();
    var scene = scenes[idx];
    if (!scene) return;

    currentSceneIndex = idx;

    if (scene.type === "photo-reveal" && typeof window.renderPhotoReveal === "function") {
      window.renderPhotoReveal(scene, idx);
      return;
    }

    setProgress(idx, scenes.length);
    setText("scene-lbl", scene.room || getChapterLabel());
    setText("sc-room", scene.room || "");
    setText("sc-title", scene.title || "");
    setText("sc-sub", scene.sub || "");

    var image = byId("bg-img");
    var svgWrap = byId("scene-svg-wrap");
    if (image) {
      image.style.display = "block";
      image.style.opacity = "0";
      image.onload = function () {
        image.style.transition = "opacity .6s ease";
        image.style.opacity = "1";
      };
      image.onerror = function () {
        image.style.display = "none";
        if (svgWrap) svgWrap.style.display = "flex";
      };
      image.src = scene.bg || "";
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
    renderSceneChips(scene.chips || []);
    renderSceneCues(scene.cues || []);
    buildChoices(scene.choices || []);

    var backButton = byId("btn-back");
    if (backButton) backButton.disabled = idx === 0;

    var nextButton = byId("btn-next");
    if (nextButton) {
      if (scene.isLast) {
        nextButton.textContent = scene.nextLabel || "Next →";
        nextButton.classList.add("gold");
      } else {
        nextButton.textContent = "Next →";
        nextButton.classList.remove("gold");
      }
      nextButton.disabled = false;
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

    var askButton = byId("ask-george");
    if (askButton) {
      askButton.style.display = "none";
      askButton.classList.remove("show");
    }

    highlightJourneyRail();

    state.lastStep = idx;
    state.lastChapter = getChapterNumber();
    saveState();

    track("scene_view", {
      chapter: getChapterNumber(),
      scene: idx,
      room: scene.room || ""
    });
  }

  function renderSceneChips(chips) {
    var wrap = byId("scene-chip-row");
    if (!wrap) return;
    wrap.innerHTML = "";

    chips.forEach(function (chip) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "scene-chip";
      button.innerHTML =
        '<span class="scene-chip-ico">' + renderIcon(chip.icon || "check") + "</span>" +
        '<span>' + (chip.label || "") + "</span>";

      button.addEventListener("click", function () {
        if (chip.deep) {
          showDeep(chip.deep.title, chip.deep.body);
          return;
        }
        if (chip.cueIndex != null) {
          activateSpotlightFromCueIndex(chip.cueIndex);
        }
      });

      wrap.appendChild(button);
    });
  }

  function renderSceneCues(cues) {
    var layer = byId("scene-cue-layer");
    var spotlight = byId("scene-spotlight");
    if (!layer || !spotlight) return;

    layer.innerHTML = "";
    spotlight.classList.remove("show");

    cues.forEach(function (cue, index) {
      if (cue.type === "spotlight" && cue.autoplay) {
        setTimeout(function () {
          activateSpotlight(cue);
        }, cue.delay || 700);
      }

      if (cue.type === "pulse" || cue.type === "badge") {
        var cueEl = document.createElement("button");
        cueEl.type = "button";
        cueEl.className = "scene-cue " + cueClassForTone(cue.tone);
        cueEl.style.left = (cue.x || 50) + "%";
        cueEl.style.top = (cue.y || 50) + "%";
        cueEl.innerHTML =
          '<div class="scene-cue-dot"></div>' +
          (cue.label ? '<div class="scene-cue-label">' + cue.label + "</div>" : "");

        cueEl.addEventListener("click", function () {
          if (cue.deep) {
            showDeep(cue.deep.title, cue.deep.body);
          } else if (cue.spotlight) {
            activateSpotlight(cue.spotlight);
          }
        });

        layer.appendChild(cueEl);
      }

      cue._index = index;
    });
  }

  function cueClassForTone(tone) {
    if (tone === "green") return "pulse-green";
    if (tone === "red") return "pulse-red";
    return "pulse-yellow";
  }

  function activateSpotlightFromCueIndex(index) {
    var scenes = getScenes();
    var scene = scenes[currentSceneIndex];
    if (!scene || !scene.cues || !scene.cues[index]) return;
    activateSpotlight(scene.cues[index].spotlight || scene.cues[index]);
  }

  function activateSpotlight(cue) {
    var spotlight = byId("scene-spotlight");
    var hole = byId("scene-spotlight-hole");
    if (!spotlight || !hole) return;

    var size = cue.size || 84;
    hole.style.left = "calc(" + (cue.x || 50) + "% - " + (size / 2) + "px)";
    hole.style.top = "calc(" + (cue.y || 50) + "% - " + (size / 2) + "px)";
    hole.style.width = size + "px";
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

  function buildChoices(choices) {
    var container = byId("choices");
    var label = byId("drawer-label");
    if (!container) return;

    container.innerHTML = "";
    if (label) {
      var scenes = getScenes();
      var scene = scenes[currentSceneIndex];
      label.textContent = (scene && scene.drawerLabel) || "Ask me anything";
    }

    choices.forEach(function (choice, index) {
      var card = document.createElement("div");
      card.className = "choice-card";
      card.id = "card-" + index;

      var deepButton = "";
      if (choice.deep && choice.deep.title && choice.deep.body) {
        deepButton =
          '<button class="card-deep" type="button" data-title="' +
          escapeAttr(choice.deep.title) +
          '" data-body="' +
          escapeAttr(choice.deep.body) +
          '">ⓘ ' +
          choice.deep.title +
          " →</button>";
      }

      card.innerHTML =
        '<button class="choice-card-header" type="button" data-choice-index="' + index + '">' +
        "<span>" + (choice.label || "") + '</span><span class="card-chevron">▼</span></button>' +
        '<div class="choice-card-body"><div class="choice-card-response">' +
        nl2br(choice.response || "") +
        deepButton +
        "</div></div>";

      container.appendChild(card);
    });

    Array.prototype.forEach.call(container.querySelectorAll("[data-choice-index]"), function (button) {
      button.addEventListener("click", function () {
        toggleCard(Number(button.getAttribute("data-choice-index")), choices.length);
      });
    });

    Array.prototype.forEach.call(container.querySelectorAll(".card-deep"), function (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        showDeep(button.getAttribute("data-title"), button.getAttribute("data-body"));
      });
    });
  }

  function toggleCard(idx, total) {
    for (var i = 0; i < total; i += 1) {
      var card = byId("card-" + i);
      if (!card) continue;
      if (i === idx) card.classList.toggle("open");
      else card.classList.remove("open");
    }

    track("choice_tap", {
      chapter: getChapterNumber(),
      card: idx
    });
  }

  function openDrawer() {
    var drawer = byId("drawer");
    if (drawer) drawer.classList.add("open");
  }

  function closeDrawer() {
    var drawer = byId("drawer");
    if (drawer) drawer.classList.remove("open");
  }

  function typeText(text, elementId) {
    var element = byId(elementId);
    if (!element) return;

    element.innerHTML = "";
    var index = 0;
    var timer = setInterval(function () {
      element.innerHTML = nl2br(String(text || "").slice(0, index));
      index += 1;
      if (index > String(text || "").length) clearInterval(timer);
    }, 14);
  }

  function showInterrupt(interrupt) {
    setText("int-title", interrupt.title || "");
    typeText(interrupt.text || "", "int-text");

    var intButton = byId("int-btn");
    if (intButton) intButton.textContent = interrupt.btnText || "Got it";

    var skipButton = byId("int-skip");
    if (skipButton) {
      if (interrupt.skipLabel) {
        skipButton.textContent = interrupt.skipLabel;
        skipButton.style.display = "block";
      } else {
        skipButton.style.display = "none";
      }
    }

    if (byId("int-dim")) byId("int-dim").classList.add("active");
    if (byId("int-card")) byId("int-card").classList.add("active");

    closeDrawer();
  }

  function dismissInterrupt(silent) {
    if (interruptTimer) {
      clearTimeout(interruptTimer);
      interruptTimer = null;
    }

    interruptDismissed = true;
    if (byId("int-dim")) byId("int-dim").classList.remove("active");
    if (byId("int-card")) byId("int-card").classList.remove("active");

    var scene = getScenes()[currentSceneIndex];
    if (!silent && scene && scene.choices && scene.choices.length) {
      setTimeout(openDrawer, 320);
    }

    if (!silent) {
      var askButton = byId("ask-george");
      if (askButton) {
        askButton.style.display = "block";
        askButton.classList.add("show");
      }
    }
  }

  function askGeorge() {
    var scene = getScenes()[currentSceneIndex];
    if (scene && scene.interrupt) {
      showInterrupt(scene.interrupt);
      return;
    }
    openGeorgeCard();
  }

  function showDeep(title, body) {
    setText("gc-context-label", title || "What’s in this picture?");
    setText("gc-context-copy", body || "");

    var pop = byId("pop");
    var card = byId("pop-sh");
    var context = byId("gc-context-copy");

    if (context) context.classList.add("open");
    if (!pop || !card) return;

    pop.style.display = "flex";
    requestAnimationFrame(function () {
      pop.style.opacity = "1";
      pop.style.pointerEvents = "all";
      card.classList.add("open");
    });
  }

  function openGeorgeCard() {
    var pop = byId("pop");
    var card = byId("pop-sh");
    if (!pop || !card) return;

    pop.style.display = "flex";
    requestAnimationFrame(function () {
      pop.style.opacity = "1";
      pop.style.pointerEvents = "all";
      card.classList.add("open");
    });
  }

  function closePop() {
    var pop = byId("pop");
    var card = byId("pop-sh");
    if (!pop || !card) return;

    pop.style.opacity = "0";
    pop.style.pointerEvents = "none";
    card.classList.remove("open");

    setTimeout(function () {
      pop.style.display = "none";
    }, 260);
  }

  function toggleGeorgeContext() {
    var copy = byId("gc-context-copy");
    if (copy) copy.classList.toggle("open");
  }

  function nextScene() {
    var scenes = getScenes();
    var scene = scenes[currentSceneIndex];
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
      state.lastStep = 0;
      saveState();
      window.location.href = scene.nextFile || "index.html";
      return;
    }

    if (currentSceneIndex < scenes.length - 1) {
      currentSceneIndex += 1;
      renderScene(currentSceneIndex);
    }
  }

  function prevScene() {
    if (currentSceneIndex > 0) {
      currentSceneIndex -= 1;
      renderScene(currentSceneIndex);
      return;
    }
    window.location.href = getPrevFile();
  }

  function openJump() {
    var visited = Array.isArray(state.chaptersVisited) ? state.chaptersVisited : [];
    var container = byId("jump-items");
    var overlay = byId("jump-ov");
    if (!container || !overlay) return;

    container.innerHTML = APP_CONFIG.chapters.map(function (chapter) {
      var isCurrent = chapter.ch === getChapterNumber();
      var isVisited = visited.indexOf(chapter.ch) !== -1 && !isCurrent;

      return (
        '<div class="jump-item ' + (isCurrent ? "cur-ch" : "") + '" onclick="SharedPlatform.jumpTo(\'' + chapter.file + "'," + chapter.ch + ')">' +
          '<div class="ji-dot ' + (isCurrent ? "cur" : isVisited ? "vis" : "") + '"></div>' +
          '<div class="ji-icon">' + renderIcon(chapter.icon || "house") + "</div>" +
          '<div class="ji-lbl">' + chapter.label + (isCurrent ? " ← here" : "") + "</div>" +
          '<div class="ji-arr">' + (isCurrent ? "" : "›") + "</div>" +
        "</div>"
      );
    }).join("");

    overlay.classList.add("open");
  }

  function jumpTo(file, chapterNumber) {
    var overlay = byId("jump-ov");
    if (chapterNumber === getChapterNumber()) {
      if (overlay) overlay.classList.remove("open");
      return;
    }

    if (!Array.isArray(state.chaptersVisited)) state.chaptersVisited = [];
    if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
      state.chaptersVisited.push(getChapterNumber());
    }

    state.jumpEntry = "jump_ch" + chapterNumber;
    saveState();
    window.location.href = file;
  }

  function renderIconCardGrid(target, cards) {
    if (!target) return;
    target.innerHTML =
      '<div class="icon-card-grid">' +
        cards.map(function (card) {
          return (
            '<button class="icon-card" type="button" data-file="' + escapeAttr(card.file || "") + '" data-event="' + escapeAttr(card.event || "") + '">' +
              '<span class="icon-card-ico">' + renderIcon(card.icon || "house") + "</span>" +
              '<span class="icon-card-copy">' +
                '<span class="icon-card-title">' + (card.title || "") + "</span>" +
                (card.sub ? '<span class="icon-card-sub">' + card.sub + "</span>" : "") +
              "</span>" +
            "</button>"
          );
        }).join("") +
      "</div>";

    Array.prototype.forEach.call(target.querySelectorAll(".icon-card"), function (button) {
      button.addEventListener("click", function () {
        var file = button.getAttribute("data-file");
        var eventName = button.getAttribute("data-event");
        if (eventName) {
          state.jumpEntry = eventName;
          saveState();
          track("journey_entry", { entry_point: eventName });
        }
        if (file) window.location.href = file;
      });
    });
  }

  function createJourneyCardHTML(card) {
    return (
      '<div class="journey-card ' + (card.cardClass || "") + '" data-file="' + escapeAttr(card.file || "") + '" data-event="' + escapeAttr(card.event || "") + '">' +
        '<div class="journey-card-head">' +
          '<div class="journey-card-icon">' + renderIcon(card.icon || "house") + "</div>" +
          '<div class="journey-card-body">' +
            '<div class="journey-card-title">' + (card.title || "") + "</div>" +
          "</div>" +
          '<span class="journey-card-arrow">&#8250;</span>' +
        "</div>" +
        '<div class="journey-card-detail">' +
          '<div class="journey-card-detail-inner">' +
            '<div class="journey-card-desc">' + (card.desc || "") + "</div>" +
            (card.commit ? '<span class="journey-card-commit">' + card.commit + "</span>" : "") +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderJourneyCardList(target, cards) {
    if (!target) return;
    target.innerHTML = cards.map(createJourneyCardHTML).join("");

    Array.prototype.forEach.call(target.querySelectorAll(".journey-card"), function (card) {
      card.addEventListener("click", function () {
        handleJourneyCardClick(card);
      });
    });
  }

  function handleJourneyCardClick(card) {
    var file = card.getAttribute("data-file");
    var eventName = card.getAttribute("data-event") || "start";

    if (card.classList.contains("expanded")) {
      if (eventName) {
        state.jumpEntry = eventName;
        saveState();
        track("journey_entry", { entry_point: eventName });
      }
      if (file) window.location.href = file;
      return;
    }

    collapseJourneySiblings(card);
    card.classList.add("expanded");
    card.dataset.manualToggle = "1";

    if (card._collapseTimer) {
      clearTimeout(card._collapseTimer);
    }

    card._collapseTimer = setTimeout(function () {
      card.classList.remove("expanded");
      delete card.dataset.manualToggle;
      card._collapseTimer = null;
    }, 10000);
  }

  function collapseJourneySiblings(activeCard) {
    var cards = document.querySelectorAll(".journey-card");
    Array.prototype.forEach.call(cards, function (card) {
      if (card !== activeCard) {
        card.classList.remove("expanded");
        delete card.dataset.manualToggle;
        if (card._collapseTimer) {
          clearTimeout(card._collapseTimer);
          card._collapseTimer = null;
        }
      }
    });
  }

  function renderJourneyRail() {
    var railInner = byId("journey-rail-inner");
    if (!railInner) return;

    railInner.innerHTML = (APP_CONFIG.chapters || []).map(function (chapter) {
      return (
        '<button class="journey-rail-item" type="button" data-file="' + escapeAttr(chapter.file || "") + '" data-ch="' + chapter.ch + '" aria-label="' + escapeAttr(chapter.label || "") + '" title="' + escapeAttr(chapter.label || "") + '">' +
          renderIcon(chapter.icon || "house") +
        "</button>"
      );
    }).join("");

    Array.prototype.forEach.call(railInner.querySelectorAll(".journey-rail-item"), function (button) {
      button.addEventListener("click", function () {
        var chapterNumber = Number(button.getAttribute("data-ch"));
        var file = button.getAttribute("data-file");
        if (!file) return;

        if (chapterNumber === getChapterNumber()) {
          highlightJourneyRail();
          return;
        }

        if (!Array.isArray(state.chaptersVisited)) state.chaptersVisited = [];
        if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
          state.chaptersVisited.push(getChapterNumber());
        }

        state.jumpEntry = "rail_ch" + chapterNumber;
        saveState();
        window.location.href = file;
      });
    });

    highlightJourneyRail();
  }

  function highlightJourneyRail(activeChapter) {
    var railInner = byId("journey-rail-inner");
    if (!railInner) return;

    var current = typeof activeChapter === "number" ? activeChapter : getChapterNumber();

    Array.prototype.forEach.call(railInner.querySelectorAll(".journey-rail-item"), function (button) {
      var chapterNumber = Number(button.getAttribute("data-ch"));
      toggleClass(button, "active", chapterNumber === current);
    });
  }

  function toggleJourneyRail(forceOpen) {
    var rail = byId("journey-rail");
    if (!rail) return;

    var open = typeof forceOpen === "boolean" ? forceOpen : !rail.classList.contains("open");
    rail.classList.toggle("open", open);
    rail.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  function init() {
    injectPlatformStyles();

    window.SharedPlatform = {
      icons: ICONS,
      renderIcon: renderIcon,
      renderIconCardGrid: renderIconCardGrid,
      renderJourneyCardList: renderJourneyCardList,
      createJourneyCardHTML: createJourneyCardHTML,
      handleJourneyCardClick: handleJourneyCardClick,
      collapseJourneySiblings: collapseJourneySiblings,
      renderJourneyRail: renderJourneyRail,
      highlightJourneyRail: highlightJourneyRail,
      toggleJourneyRail: toggleJourneyRail,
      jumpTo: jumpTo,
      openGeorgeCard: openGeorgeCard,
      closePop: closePop,
      showDeep: showDeep,
      openDrawer: openDrawer,
      closeDrawer: closeDrawer,
      dismissInterrupt: dismissInterrupt,
      setGeorgeState: setGeorgeState,
      activateSpotlight: activateSpotlight,
      renderSceneChips: renderSceneChips,
      renderSceneCues: renderSceneCues,
      getState: getState,
      saveState: saveState,
      track: track
    };

    var scenes = getScenes();
    if (!scenes.length) return;

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
