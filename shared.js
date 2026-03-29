/* ============================================================
STL Home Buyer Journey — shared.js
George Kindler · 314.435.1087

Per-file must define before loading this script:
var CHAPTER_NUM   — integer (3, 4, 5 …)
var CHAPTER_LABEL — string  (‘The Interior’, ‘Pre-Offer Strategy’ …)
var PREV_FILE     — string  (‘index.html’, ‘03-interior.html’ …)
var SCENES        — array of scene objects

Per-file may define:
var PHOTOS        — object of photo URL shortcuts
============================================================ */

// ── STATE ────────────────────────────────────────────────────
var SK = ‘stl_journey_v1’;
var S = {
amount:280000, loan:‘conventional’, zip:‘63123’,
lastChapter: CHAPTER_NUM,
lastStep:0,
chaptersVisited:[],
lessons:[]
};
try {
var sv = JSON.parse(localStorage.getItem(SK) || ‘{}’);
if(sv.loan) Object.assign(S, sv);
} catch(e) {}
function save(){
try { localStorage.setItem(SK, JSON.stringify(S)); } catch(e) {}
}

// ── CHAPTERS — single source of truth ────────────────────────
var CHAPTERS = [
{ch:1, file:‘01-preapproval.html’,    label:‘What happens when you click “Contact Agent”’},
{ch:2, file:‘02-affordability.html’,  label:‘Where buyers accidentally overpay’},
{ch:3, file:‘03-interior.html’,       label:‘What I look at the moment we walk in’},
{ch:4, file:‘05-pre-offer.html’,      label:‘Where buyers get pushed into offers they can’t take back’},
{ch:5, file:‘06-under-contract.html’, label:‘Offer accepted — where deals fall apart’},
{ch:6, file:‘06b-deadlines.html’,     label:‘Three deadlines running in parallel’},
{ch:7, file:‘07-inspection.html’,     label:‘Where buyers miss the problems they end up paying for’},
{ch:8, file:‘08-walkthrough.html’,    label:‘The final walk-through is not a second showing’},
{ch:9, file:‘09-closing.html’,        label:‘What you’re signing at closing’}
];

// ── ENGINE STATE ─────────────────────────────────────────────
var cur = S.lastStep || 0;
var intDismissed = false;
var intTimer = null;

// ── GEORGE FACES ─────────────────────────────────────────────
function georgeFace(name){
var map = {
‘serious’:      ‘assets/george-serious.png’,
‘welcome’:      ‘assets/george-welcome.png’,
‘excited’:      ‘assets/george-excited.png’,
‘proud’:        ‘assets/george-proud.png’,
‘papers’:       ‘assets/george-papers.png’,
‘disappointed’: ‘assets/george-disappointed.png’
};
return map[name] || ‘assets/george-serious.png’;
}

// ── SCENE ENGINE ─────────────────────────────────────────────
function renderScene(idx){
var sc = SCENES[idx];
if(!sc) return;

// Photo-reveal special type — handled per-file if needed
if(sc.type === ‘photo-reveal’ && typeof renderPhotoReveal === ‘function’){
renderPhotoReveal(sc, idx);
return;
}

// Progress
document.getElementById(‘prog’).style.width = Math.round((idx/(SCENES.length-1))*100)+’%’;
document.getElementById(‘scene-lbl’).textContent = sc.room;

// Background image
var img = document.getElementById(‘bg-img’);
var svgWrap = document.getElementById(‘scene-svg-wrap’);
if(img){
img.style.opacity = ‘0’;
setTimeout(function(){
img.src = sc.bg || ‘’;
img.onload = function(){ img.style.opacity=‘1’; img.style.transition=‘opacity .6s ease’; };
img.onerror = function(){
img.style.display=‘none’;
if(svgWrap) svgWrap.style.display=‘flex’;
};
}, 200);
}

// George face
var gImg    = document.getElementById(‘george-img’);
var intGImg = document.getElementById(‘int-george-img’);
var faceSrc = georgeFace(sc.george);
if(gImg) gImg.src = faceSrc;
if(intGImg) intGImg.src = faceSrc;

// Caption
document.getElementById(‘sc-room’).textContent  = sc.room;
document.getElementById(‘sc-title’).textContent = sc.title;
document.getElementById(‘sc-sub’).textContent   = sc.sub;

dismissInterrupt(true);
closeDrawer();
buildChoices(sc.choices || []);

// Nav buttons
document.getElementById(‘btn-back’).disabled = (idx === 0);
var btnNext = document.getElementById(‘btn-next’);
if(sc.isLast){
btnNext.textContent = sc.nextLabel || ‘Next \u2192’;
btnNext.classList.add(‘gold’);
} else {
btnNext.textContent = ‘Next \u2192’;
btnNext.classList.remove(‘gold’);
}
btnNext.disabled = false;

// Interrupt
if(sc.interrupt){
intDismissed = false;
intTimer = setTimeout(function(){
if(!intDismissed) showInterrupt(sc.interrupt);
}, 1000);
}

// Auto-open drawer if no interrupt
if(!sc.interrupt && sc.choices && sc.choices.length > 0){
setTimeout(openDrawer, 800);
}

// Hide Ask George
var ag = document.getElementById(‘ask-george’);
if(ag) ag.style.display = ‘none’;

// Save state
S.lastStep    = idx;
S.lastChapter = CHAPTER_NUM;
save();

gtag(‘event’,‘scene_view’,{chapter:CHAPTER_NUM, scene:idx, room:sc.room});
}

// ── INTERRUPT ────────────────────────────────────────────────
function showInterrupt(int){
document.getElementById(‘int-title’).textContent = int.title;
typeText(int.text, ‘int-text’);
document.getElementById(‘int-btn’).textContent = int.btnText || ‘Got it’;

// Skip button (optional per-scene)
var skipEl = document.getElementById(‘int-skip’);
if(skipEl){
if(int.skipLabel){
skipEl.textContent   = int.skipLabel;
skipEl.style.display = ‘block’;
} else {
skipEl.style.display = ‘none’;
}
}

document.getElementById(‘int-dim’).classList.add(‘active’);
document.getElementById(‘int-card’).classList.add(‘active’);
closeDrawer();
}

function dismissInterrupt(silent){
if(intTimer){ clearTimeout(intTimer); intTimer = null; }
intDismissed = true;
document.getElementById(‘int-dim’).classList.remove(‘active’);
document.getElementById(‘int-card’).classList.remove(‘active’);
var sc = SCENES[cur];
if(!silent && sc && sc.choices && sc.choices.length > 0){
setTimeout(openDrawer, 400);
}
if(!silent){
var ag = document.getElementById(‘ask-george’);
if(ag){ ag.classList.add(‘show’); ag.style.display = ‘block’; }
}
}

function askGeorge(){
var sc = SCENES[cur];
if(sc && sc.interrupt) showInterrupt(sc.interrupt);
}

// ── DRAWER ───────────────────────────────────────────────────
function openDrawer(){
document.getElementById(‘drawer’).classList.add(‘open’);
}
function closeDrawer(){
document.getElementById(‘drawer’).classList.remove(‘open’);
}

// ── CHOICES ──────────────────────────────────────────────────
function buildChoices(choices){
var container = document.getElementById(‘choices’);
container.innerHTML = ‘’;
if(!choices || choices.length === 0) return;
document.getElementById(‘drawer-label’).textContent =
(SCENES[cur] && SCENES[cur].drawerLabel) || ‘Ask me anything’;

choices.forEach(function(c, i){
var card = document.createElement(‘div’);
card.className = ‘choice-card’;
card.id = ‘card-’ + i;
var safeResp = (c.response || ‘’).replace(/\n/g, ‘<br>’);
var deepBtn = c.deep
? ‘<button class=“card-deep” onclick=“showDeep(this);event.stopPropagation();”’
+ ’ data-title=”’ + escStr(c.deep.title) + ‘”’
+ ’ data-body=”’  + escStr(c.deep.body)  + ‘”>’
+ ‘ⓘ ’ + c.deep.title + ’ →</button>’
: ‘’;
card.innerHTML =
‘<button class="choice-card-header" onclick="toggleCard(' + i + ',' + choices.length + ')">’
+ ‘<span>’ + c.label + ‘</span>’
+ ‘<span class="card-chevron">▼</span>’
+ ‘</button>’
+ ‘<div class="choice-card-body">’
+ ‘<div class="choice-card-response">’ + safeResp + deepBtn + ‘</div>’
+ ‘</div>’;
container.appendChild(card);
});
}

function toggleCard(idx, total){
for(var i = 0; i < total; i++){
var card = document.getElementById(‘card-’ + i);
if(!card) continue;
if(i === idx){ card.classList.toggle(‘open’); }
else          { card.classList.remove(‘open’); }
}
gtag(‘event’,‘choice_tap’,{chapter:CHAPTER_NUM, card:idx});
}

function escStr(s){
return (s || ‘’).replace(/&/g,’&’).replace(/”/g,’"’).replace(/’/g,’'’);
}

// ── DEEP DIVE POPUP ──────────────────────────────────────────
function showDeep(btn){
var title = btn.getAttribute(‘data-title’);
var body  = btn.getAttribute(‘data-body’);
document.getElementById(‘pop-title’).textContent = title;
document.getElementById(‘pop-body’).textContent  = body;
var pop = document.getElementById(‘pop’);
var sh  = document.getElementById(‘pop-sh’);
pop.style.display = ‘flex’;
requestAnimationFrame(function(){
pop.style.opacity       = ‘1’;
pop.style.pointerEvents = ‘all’;
pop.style.transition    = ‘opacity .25s’;
sh.style.transform      = ‘translateY(0)’;
sh.style.transition     = ‘transform .3s cubic-bezier(.32,.72,0,1)’;
});
}

function closePop(){
var pop = document.getElementById(‘pop’);
pop.style.opacity       = ‘0’;
pop.style.pointerEvents = ‘none’;
setTimeout(function(){ pop.style.display = ‘none’; }, 300);
}

// ── TYPEWRITER ───────────────────────────────────────────────
function typeText(text, elId){
var el = document.getElementById(elId);
if(!el) return;
el.innerHTML = ‘’;
var i = 0;
var iv = setInterval(function(){
el.innerHTML = text.slice(0, i).replace(/\n/g, ‘<br>’);
i++;
if(i > text.length) clearInterval(iv);
}, 16);
}

// ── NAVIGATION ───────────────────────────────────────────────
function nextScene(){
var sc = SCENES[cur];

// Photo-reveal special handling
if(sc && sc.type === ‘photo-reveal’){
if(window._prAnswered && typeof prContinue === ‘function’) prContinue();
return;
}

if(sc && sc.isLast){
if(!S.chaptersVisited) S.chaptersVisited = [];
if(!S.chaptersVisited.includes(CHAPTER_NUM)) S.chaptersVisited.push(CHAPTER_NUM);
S.lastChapter = sc.nextChapter || (CHAPTER_NUM + 1);
save();
window.location.href = sc.nextFile || ‘index.html’;
return;
}

if(cur < SCENES.length - 1){
cur++;
renderScene(cur);
}
}

function prevScene(){
if(cur > 0){
cur–;
renderScene(cur);
} else {
window.location.href = PREV_FILE || ‘index.html’;
}
}

// ── JUMP MENU ────────────────────────────────────────────────
function openJump(){
var visited   = S.chaptersVisited || [];
var container = document.getElementById(‘jump-items’);
container.innerHTML = CHAPTERS.map(function(c){
var isCur = (c.ch === CHAPTER_NUM);
var isVis = visited.includes(c.ch) && !isCur;
return ‘<div class=“jump-item ’ + (isCur ? ‘cur-ch’ : ‘’) + ‘”’
+ ’ onclick=“jumpTo('’ + c.file + ‘',’ + c.ch + ‘)”>’
+ ‘<div class="ji-dot ' + (isCur ? 'cur' : isVis ? 'vis' : '') + '"></div>’
+ ‘<div class="ji-ch">Ch.’ + c.ch + ‘</div>’
+ ‘<div class="ji-lbl">’ + c.label + (isCur ? ’ \u2190 here’ : ‘’) + ‘</div>’
+ ‘<div class="ji-arr">’ + (isCur ? ‘’ : ‘›’) + ‘</div>’
+ ‘</div>’;
}).join(’’);
document.getElementById(‘jump-ov’).classList.add(‘open’);
}

function jumpTo(file, ch){
if(ch === CHAPTER_NUM){
document.getElementById(‘jump-ov’).classList.remove(‘open’);
return;
}
S.jumpEntry = ‘jump_ch’ + ch;
if(!S.chaptersVisited) S.chaptersVisited = [];
if(!S.chaptersVisited.includes(CHAPTER_NUM)) S.chaptersVisited.push(CHAPTER_NUM);
save();
window.location.href = file;
}

// Close jump overlay on outside tap
document.getElementById(‘jump-ov’).addEventListener(‘click’, function(e){
if(e.target === this) this.classList.remove(‘open’);
});

// ── INIT ─────────────────────────────────────────────────────
renderScene(cur);
