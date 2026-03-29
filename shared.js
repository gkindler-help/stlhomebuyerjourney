/* /shared.js
   Central shell + shared engine for all chapter pages.
   Paste this in as a full replacement for shared.js.
*/

(function () {
  "use strict";

  var STORAGE_KEY = "stl_journey_v1";

  var DEFAULT_STATE = {
    amount: 280000,
    loan: "conventional",
    zip: "63123",
    lastChapter: 1,
    lastStep: 0,
    chaptersVisited: [],
    lessons: [],
    jumpEntry: null
  };

  var CHAPTERS = [
    { ch: 1, file: "01-preapproval.html", label: "What actually happens when you click “Contact Agent”" },
    { ch: 2, file: "02-affordability.html", label: "Where buyers accidentally overpay" },
    { ch: 3, file: "03-interior.html", label: "What I look at the moment we walk in" },
    { ch: 4, file: "05-pre-offer.html", label: "Where buyers get pushed into offers they can’t take back" },
    { ch: 5, file: "06-under-contract.html", label: "Offer accepted — where deals fall apart" },
    { ch: 6, file: "06b-deadlines.html", label: "Three deadlines running in parallel" },
    { ch: 7, file: "07-inspection.html", label: "Where buyers miss the problems they end up paying for" },
    { ch: 8, file: "08-walkthrough.html", label: "The final walk-through is not a second showing" },
    { ch: 9, file: "09-closing.html", label: "What you’re signing at closing" }
  ];

  var APP_CONFIG = {
    title: "STL Home Buyer Journey",
    subtitle: "George Kindler · The Closing Pros",
    toolsUrl: "index.html",
    guidesUrl: "https://sites.google.com/view/st-louis-real-estate-guides/freestlouisrealestateguides",
    phoneLabel: "George Kindler · 314.435.1087"
  };

  var state = loadState();
  var currentSceneIndex = 0;
  var interruptDismissed = false;
  var interruptTimer = null;

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
    var match = CHAPTERS.find(function (item) {
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

  function ensureShell() {
    if (byId("prog") && byId("scene-lbl") && byId("btn-next")) {
      return;
    }

    var mount = byId("app");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "app";
      document.body.appendChild(mount);
    }

    mount.innerHTML = [
      '<div class="app">',
      '  <header class="hdr">',
      '    <div class="hdr-l">',
      '      <svg class="hdr-ico" viewBox="0 0 26 26" fill="none" aria-hidden="true">',
      '        <rect width="26" height="26" rx="5" fill="#111111"></rect>',
      '        <path d="M13 4L3 12h3v9h6v-5h2v5h6V12h3L13 4z" fill="white" opacity=".9"></path>',
      '        <path d="M18 18l3-3-3-3M21 15H13" stroke="#FFCC4D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>',
      "      </svg>",
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

      '  <div class="stage">',
      '    <div class="scene-bg"><img id="bg-img" alt=""></div>',
      '    <div class="scene-gradient"></div>',
      '    <div class="scene-svg" id="scene-svg-wrap" style="display:none;"></div>',
      '    <div class="george-float" id="george-float">',
      '      <img id="george-img" alt="George Kindler">',
      '      <div class="fb-init">GK</div>',
      "    </div>",
      '    <div class="scene-caption" id="scene-caption">',
      '      <div class="sc-room" id="sc-room"></div>',
      '      <div class="sc-title" id="sc-title"></div>',
      '      <div class="sc-sub" id="sc-sub"></div>',
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
      '    <div class="ftr-l">' + APP_CONFIG.phoneLabel + "</div>",
      '    <div class="ftr-r"><a href="' + escapeAttr(APP_CONFIG.guidesUrl) + '" target="_blank" rel="noopener">Free Guides &rarr;</a></div>',
      "  </footer>",

      '  <button class="jump-trigger" id="jump-trigger" type="button">&#8942; Jump</button>',

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
      '      <img id="int-george-img" alt="George Kindler">',
      '      <div class="fb">GK</div>',
      "    </div>",
      '    <div class="int-bubble">',
      '      <div class="int-title" id="int-title"></div>',
      '      <div class="int-text" id="int-text"></div>',
      '      <button class="int-btn" id="int-btn" type="button">Got it</button>',
      '      <button class="wire-skip" id="int-skip" type="button" style="display:none;"></button>',
      "    </div>",
      "  </div>",

      '  <div class="george-dim" id="pop" style="display:none;">',
      '    <div class="george-card open" id="pop-sh" style="transform:translate(-50%,100%);">',
      '      <div class="gc-handle"></div>',
      '      <div class="gc-close" id="pop-close" role="button" tabindex="0">&#10005;</div>',
      '      <div class="gc-header">',
      '        <div class="gc-photo"><div class="fb">GK</div></div>',
      '        <div class="gc-name-block">',
      '          <div class="gc-name" id="pop-title"></div>',
      "        </div>",
      "      </div>",
      '      <div class="gc-about" id="pop-body"></div>',
      "    </div>",
      "  </div>",

      "</div>"
    ].join("");
  }

  function bindShellEvents() {
    var backButton = byId("btn-back");
    var nextButton = byId("btn-next");
    var askButton = byId("ask-george");
    var jumpButton = byId("jump-trigger");
    var interruptButton = byId("int-btn");
    var interruptSkip = byId("int-skip");
    var interruptFace = byId("int-face");
    var jumpOverlay = byId("jump-ov");
    var popClose = byId("pop-close");

    if (backButton) {
      backButton.addEventListener("click", prevScene);
    }
    if (nextButton) {
      nextButton.addEventListener("click", nextScene);
    }
    if (askButton) {
      askButton.addEventListener("click", askGeorge);
    }
    if (jumpButton) {
      jumpButton.addEventListener("click", openJump);
    }
    if (interruptButton) {
      interruptButton.addEventListener("click", function () {
        dismissInterrupt(false);
      });
    }
    if (interruptSkip) {
      interruptSkip.addEventListener("click", function () {
        dismissInterrupt(false);
        nextScene();
      });
    }
    if (interruptFace) {
      interruptFace.addEventListener("click", function () {
        openGeorgeCard();
      });
    }
    if (jumpOverlay) {
      jumpOverlay.addEventListener("click", function (event) {
        if (event.target === jumpOverlay) {
          jumpOverlay.classList.remove("open");
        }
      });
    }
    if (popClose) {
      popClose.addEventListener("click", closePop);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePop();
        var overlay = byId("jump-ov");
        if (overlay) {
          overlay.classList.remove("open");
        }
        dismissInterrupt(true);
      }
    });

    window.openJump = openJump;
    window.jumpTo = jumpTo;
    window.nextScene = nextScene;
    window.prevScene = prevScene;
    window.askGeorge = askGeorge;
    window.showDeep = showDeep;
    window.closePop = closePop;
    window.openDrawer = openDrawer;
    window.closeDrawer = closeDrawer;
    window.toggleCard = toggleCard;
    window.dismissInterrupt = dismissInterrupt;
  }

  function setText(id, value) {
    var element = byId(id);
    if (element) {
      element.textContent = value || "";
    }
  }

  function setProgress(idx, total) {
    var progress = byId("prog");
    if (!progress) {
      return;
    }
    if (total <= 1) {
      progress.style.width = "100%";
      return;
    }
    progress.style.width = Math.round((idx / (total - 1)) * 100) + "%";
  }

  function renderScene(idx) {
    var scenes = getScenes();
    var scene = scenes[idx];
    if (!scene) {
      return;
    }

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
        if (svgWrap) {
          svgWrap.style.display = "flex";
        }
      };
      image.src = scene.bg || "";
    }

    var faceSrc = georgeFace(scene.george);
    var georgeImage = byId("george-img");
    var interruptImage = byId("int-george-img");
    if (georgeImage) {
      georgeImage.src = faceSrc;
    }
    if (interruptImage) {
      interruptImage.src = faceSrc;
    }

    dismissInterrupt(true);
    closeDrawer();
    buildChoices(scene.choices || []);

    var backButton = byId("btn-back");
    if (backButton) {
      backButton.disabled = idx === 0;
    }

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
      if (interruptTimer) {
        clearTimeout(interruptTimer);
      }
      interruptTimer = setTimeout(function () {
        if (!interruptDismissed) {
          showInterrupt(scene.interrupt);
        }
      }, 1000);
    } else if (scene.choices && scene.choices.length) {
      setTimeout(openDrawer, 800);
    }

    var askButton = byId("ask-george");
    if (askButton) {
      askButton.style.display = "none";
      askButton.classList.remove("show");
    }

    state.lastStep = idx;
    state.lastChapter = getChapterNumber();
    saveState();

    track("scene_view", {
      chapter: getChapterNumber(),
      scene: idx,
      room: scene.room || ""
    });
  }

  function buildChoices(choices) {
    var container = byId("choices");
    var label = byId("drawer-label");
    if (!container) {
      return;
    }

    container.innerHTML = "";
    if (label) {
      var scenes = getScenes();
      var scene = scenes[currentSceneIndex];
      label.textContent = (scene && scene.drawerLabel) || "Ask me anything";
    }

    if (!choices.length) {
      return;
    }

    choices.forEach(function (choice, index) {
      var card = document.createElement("div");
      card.className = "choice-card";
      card.id = "card-" + index;

      var deepButton = "";
      if (choice.deep && choice.deep.title && choice.deep.body) {
        deepButton =
          '<button class="card-deep" type="button" onclick="showDeep(this); event.stopPropagation();" data-title="' +
          escapeAttr(choice.deep.title) +
          '" data-body="' +
          escapeAttr(choice.deep.body) +
          '">ⓘ ' +
          choice.deep.title +
          " →</button>";
      }

      card.innerHTML =
        '<button class="choice-card-header" type="button" onclick="toggleCard(' +
        index +
        "," +
        choices.length +
        ')">' +
        "<span>" +
        (choice.label || "") +
        '</span><span class="card-chevron">▼</span></button>' +
        '<div class="choice-card-body"><div class="choice-card-response">' +
        String(choice.response || "").replace(/\n/g, "<br>") +
        deepButton +
        "</div></div>";

      container.appendChild(card);
    });
  }

  function toggleCard(idx, total) {
    for (var i = 0; i < total; i += 1) {
      var card = byId("card-" + i);
      if (!card) {
        continue;
      }
      if (i === idx) {
        card.classList.toggle("open");
      } else {
        card.classList.remove("open");
      }
    }

    track("choice_tap", {
      chapter: getChapterNumber(),
      card: idx
    });
  }

  function openDrawer() {
    var drawer = byId("drawer");
    if (drawer) {
      drawer.classList.add("open");
    }
  }

  function closeDrawer() {
    var drawer = byId("drawer");
    if (drawer) {
      drawer.classList.remove("open");
    }
  }

  function typeText(text, elementId) {
    var element = byId(elementId);
    if (!element) {
      return;
    }

    element.innerHTML = "";
    var index = 0;
    var timer = setInterval(function () {
      element.innerHTML = String(text || "").slice(0, index).replace(/\n/g, "<br>");
      index += 1;
      if (index > String(text || "").length) {
        clearInterval(timer);
      }
    }, 16);
  }

  function showInterrupt(interrupt) {
    setText("int-title", interrupt.title || "");
    typeText(interrupt.text || "", "int-text");

    var interruptButton = byId("int-btn");
    if (interruptButton) {
      interruptButton.textContent = interrupt.btnText || "Got it";
    }

    var skipButton = byId("int-skip");
    if (skipButton) {
      if (interrupt.skipLabel) {
        skipButton.textContent = interrupt.skipLabel;
        skipButton.style.display = "block";
      } else {
        skipButton.style.display = "none";
      }
    }

    var dim = byId("int-dim");
    var card = byId("int-card");
    if (dim) {
      dim.classList.add("active");
    }
    if (card) {
      card.classList.add("active");
    }

    closeDrawer();
  }

  function dismissInterrupt(silent) {
    if (interruptTimer) {
      clearTimeout(interruptTimer);
      interruptTimer = null;
    }

    interruptDismissed = true;

    var dim = byId("int-dim");
    var card = byId("int-card");
    if (dim) {
      dim.classList.remove("active");
    }
    if (card) {
      card.classList.remove("active");
    }

    var scene = getScenes()[currentSceneIndex];
    if (!silent && scene && scene.choices && scene.choices.length) {
      setTimeout(openDrawer, 350);
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
    }
  }

  function showDeep(button) {
    var title = button.getAttribute("data-title") || "";
    var body = button.getAttribute("data-body") || "";

    setText("pop-title", title);
    setText("pop-body", body);

    var pop = byId("pop");
    var sheet = byId("pop-sh");
    if (!pop || !sheet) {
      return;
    }

    pop.style.display = "flex";
    requestAnimationFrame(function () {
      pop.style.opacity = "1";
      pop.style.pointerEvents = "all";
      pop.style.transition = "opacity .25s";
      sheet.style.transform = "translate(-50%,0)";
      sheet.style.transition = "transform .3s cubic-bezier(.32,.72,0,1)";
    });
  }

  function closePop() {
    var pop = byId("pop");
    var sheet = byId("pop-sh");
    if (!pop || !sheet) {
      return;
    }

    pop.style.opacity = "0";
    pop.style.pointerEvents = "none";
    sheet.style.transform = "translate(-50%,100%)";

    setTimeout(function () {
      pop.style.display = "none";
    }, 300);
  }

  function openGeorgeCard() {
    var title = "George Kindler";
    var body =
      "Licensed Missouri Agent · The Closing Pros LLC. I will never sell you. My job is to consult, protect your position, and tell you what matters before it costs you money.";

    setText("pop-title", title);
    setText("pop-body", body);

    var pop = byId("pop");
    var sheet = byId("pop-sh");
    if (!pop || !sheet) {
      return;
    }

    pop.style.display = "flex";
    requestAnimationFrame(function () {
      pop.style.opacity = "1";
      pop.style.pointerEvents = "all";
      pop.style.transition = "opacity .25s";
      sheet.style.transform = "translate(-50%,0)";
      sheet.style.transition = "transform .3s cubic-bezier(.32,.72,0,1)";
    });
  }

  function nextScene() {
    var scenes = getScenes();
    var scene = scenes[currentSceneIndex];

    if (!scene) {
      return;
    }

    if (scene.type === "photo-reveal" && window._prAnswered && typeof window.prContinue === "function") {
      window.prContinue();
      return;
    }

    if (scene.isLast) {
      if (!Array.isArray(state.chaptersVisited)) {
        state.chaptersVisited = [];
      }
      if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
        state.chaptersVisited.push(getChapterNumber());
      }
      state.lastChapter = scene.nextChapter || (getChapterNumber() + 1);
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
    if (!container || !overlay) {
      return;
    }

    container.innerHTML = CHAPTERS.map(function (chapter) {
      var isCurrent = chapter.ch === getChapterNumber();
      var isVisited = visited.indexOf(chapter.ch) !== -1 && !isCurrent;

      return (
        '<div class="jump-item ' +
        (isCurrent ? "cur-ch" : "") +
        '" onclick="jumpTo(\'' +
        chapter.file +
        "'," +
        chapter.ch +
        ')">' +
        '<div class="ji-dot ' +
        (isCurrent ? "cur" : isVisited ? "vis" : "") +
        '"></div>' +
        '<div class="ji-ch">Ch.' +
        chapter.ch +
        "</div>" +
        '<div class="ji-lbl">' +
        chapter.label +
        (isCurrent ? " ← here" : "") +
        "</div>" +
        '<div class="ji-arr">' +
        (isCurrent ? "" : "›") +
        "</div>" +
        "</div>"
      );
    }).join("");

    overlay.classList.add("open");
  }

  function jumpTo(file, chapterNumber) {
    var overlay = byId("jump-ov");
    if (chapterNumber === getChapterNumber()) {
      if (overlay) {
        overlay.classList.remove("open");
      }
      return;
    }

    if (!Array.isArray(state.chaptersVisited)) {
      state.chaptersVisited = [];
    }
    if (state.chaptersVisited.indexOf(getChapterNumber()) === -1) {
      state.chaptersVisited.push(getChapterNumber());
    }

    state.jumpEntry = "jump_ch" + chapterNumber;
    saveState();
    window.location.href = file;
  }

  function init() {
    ensureShell();
    bindShellEvents();

    var scenes = getScenes();
    if (!scenes.length) {
      return;
    }

    currentSceneIndex = Math.min(state.lastStep || 0, scenes.length - 1);
    renderScene(currentSceneIndex);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
