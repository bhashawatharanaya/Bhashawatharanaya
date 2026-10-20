/* ---------- app logic ---------- */
const state = { sec: "lessons", lesson: null };

try {
  const s = JSON.parse(localStorage.getItem("pb2") || "{}");
  if (s.sec && SECTIONS.some(x => x[0] === s.sec)) state.sec = s.sec;
} catch (e) {}

const $ = s => document.querySelector(s);
const V = () => $("#view");

function save() {
  try {
    localStorage.setItem("pb2", JSON.stringify({ sec: state.sec }));
  } catch (e) {}
}

const fmt = t => t.replace(/~([^~]+)~/g, "<s>$1</s>");

function rows(rs) {
  return `<div class="ladder">${rs.map((r, i) => `<div class="step${i === 0 || i === rs.length - 1 ? " end" : ""}"><span class="n">${i + 1}</span><span class="f">${fmt(r[0])}</span><span class="r">${S[r[1]] ? S[r[1]][0] : r[1]}</span></div>`).join("")}</div>`;
}

function ladder(w) {
  const d = DER[w];
  return d ? rows([[w, "J"], ...d.steps, [w, "J"]]) : "";
}

function exList(arr) {
  return arr.map(e => `<div class="ex"><span class="eq">${e[0]} = <b>${e[1]}</b></span><span class="mean">${e[2]}</span></div>`).join("");
}

function goto(sec) {
  if (sec === "trans") sec = "exA";
  state.sec = sec;
  state.lesson = null;
  save();
  render();
  scrollTo(0, 0);
}

function renderNav() {
  $("#nav").innerHTML = SECTIONS.map(([k, l]) => `<button type="button" data-sec="${k}" aria-pressed="${state.sec === k}">${l}</button>`).join("");
  $("#nav").querySelectorAll("button").forEach(b => b.onclick = () => goto(b.dataset.sec));
}

function wire() {
  V().querySelectorAll("[data-goto]").forEach(b => b.onclick = () => goto(b.dataset.goto));
}

function lessons() {
  if (state.lesson) {
    const L = LESSONS[state.lesson];
    V().innerHTML = `<button type="button" class="back">‹ පටුන</button><div><span class="tag">පිටුව ${L.pg}</span><h2>${L.t}</h2></div>${L.body()}`;
    V().querySelector(".back").onclick = () => { state.lesson = null; render(); scrollTo(0, 0); };
    wire();
    return;
  }
  V().innerHTML = `<div><h2>පටුන</h2><p class="mean">පාඩමක් තෝරන්න. සක්‍රිය නොවූ මාතෘකා ඉදිරියේදී එක් කෙරේ.</p></div>
 <div class="list">${TOC.map(([t, p, k]) => `<button type="button" class="row" ${k ? `data-k="${k}"` : "disabled"}><span style="flex:1;min-width:0"><b>${t}</b>${k ? "" : `<small>ඉදිරියේදී</small>`}</span><span class="pg">පි. ${p}</span>${k ? '<span aria-hidden="true">›</span>' : ""}</button>`).join("")}</div>
 <details class="panel"><summary><b>විඥාපනය</b> <span class="mean">(1955 මුද්‍රණයේ පළ වූ පරිදි)</span></summary>
  <p>පාලිභාෂාවතරණයේ 1 වැනි පොත දැන් දහහත්වැනි වරටත් මුද්‍රිතව තිබෙන බැවින් ඒ පොත කොතරම් ජනප්‍රිය වී තිබේදැයි දත හැක. මේ දෙවැනි පොතේ අටවැනි මුද්‍රණයයි. දෙවෙනි පොත මුලින් තිබුණාට වඩා පිටු 40 කින් පමණ වැඩි වූ බැවින් එහි කර තිබෙන සංස්කරණ විශාල බව පෙනෙනවා ඇත.</p>
  <p>පාඨ පරීක්ෂණවලට පෙනී සිටින්නන්ගේ වාක්‍ය රචනාව දුර්වල යයි නොයෙක් විට අසන්ට ලැබුණ බැවින් ඒ සඳහා ‘පාලි වාක්‍ය රචනාව හා පරිවර්තන පරිචය’ නමැති පොතක් 1947 දී පළ කරවන ලදි. 1-2 වැනි පොත් දෙකේ අභ්‍යාසයන් සිංහලටත් පාලියටත් පෙරළා දෙන “පාලිභාෂාවතරණ යතුර” ක් ද මුද්‍රිතව තිබේ.</p>
  <p class="mean">පොල්වත්තේ බුද්ධදත්ත ස්ථවිර · 20-5-1959 · අග්ගාරාමය, අම්බලම්ගොඩ.</p></details>`;
  V().querySelectorAll("[data-k]").forEach(b => b.onclick = () => { state.lesson = b.dataset.k; render(); scrollTo(0, 0); });
}

function exercise(arr, mode) {
  const isA = mode === "A";
  V().innerHTML = `<div><h2>අභ්‍යාසය 1 · ${isA ? "සිංහලට නැගිය යුතු" : "සන්ධි සහිත කොට පාලියට නැගිය යුතු"}</h2>
  <p class="mean">එක් එක් වාක්‍යය යටින් ඇති බොත්තම් මඟින් පරිවර්තනය, සන්ධි පද සාධන සහ අතිරේක විස්තර වෙන වෙනම බලන්න.</p></div>
  <div class="btns"><button type="button" class="btn ghost sm" data-all="t">සියලු පරිවර්තන</button><button type="button" class="btn ghost sm" data-all="s">සියලු පද සාධන</button><button type="button" class="btn ghost sm" data-all="x">සියලු අතිරේක විස්තර</button><button type="button" class="btn ghost sm" data-all="">සියල්ල වසන්න</button></div>
  <div class="list">${arr.map((e, i) => {
    const id = mode + i;
    const sut = [...new Set(e.der.flatMap(d => d.steps.map(s => s[1])))].filter(k => S[k] && !["J", "V"].includes(k));
    return `<article class="panel q" id="q${id}">
   <div class="qh"><span class="num">${e.n}</span><div style="min-width:0"><span class="lbl">ප්‍රශ්නය</span><p class="${isA ? "pali" : "si"}">${e.q}</p></div></div>
   <div class="btns tabs" role="group" aria-label="වාක්‍යය ${e.n}">
    <button type="button" class="tb" data-p="t" aria-expanded="false" aria-controls="t${id}">පරිවර්තනය</button>
    <button type="button" class="tb" data-p="s" aria-expanded="false" aria-controls="s${id}">සන්ධි / පද සාධන <span class="cnt">${e.der.length}</span></button>
    <button type="button" class="tb" data-p="x" aria-expanded="false" aria-controls="x${id}">අතිරේක විස්තර</button></div>
   <div class="pane ans" id="t${id}" data-k="t" hidden><span class="lbl">${isA ? "සිංහල පරිවර්තනය" : "පාලි පරිවර්තනය"}</span><p class="${isA ? "si" : "pali"}">${e.a}</p></div>
   <div class="pane" id="s${id}" data-k="s" hidden>${e.der.map((d, j) => `<div class="der"><div class="dh"><span class="word">${d.w}</span>${d.split ? `<span class="mean">( ${d.split} )</span>` : ""}</div>${rows(d.steps)}</div>`).join("")}</div>
   <div class="pane xn" id="x${id}" data-k="x" hidden>
    ${e.xnotes.length ? `<div><span class="lbl">සටහන්</span><ul>${e.xnotes.map(n => `<li>${n}</li>`).join("")}</ul></div>` : ""}
    ${e.xder ? `<div><span class="lbl">සමාස පදය ලෙස සාධනය</span>${rows(e.xder)}</div>` : ""}
    ${e.vocab.length ? `<div><span class="lbl">වචන</span><div class="grid2">${e.vocab.map(k => { const w = VOCAB[k]; return `<div class="wcell"><span class="pali">${w[0]}</span> — ${w[1]}${w[2] ? ` <small>${GENDER[w[2]] || w[2]}</small>` : ""}</div>`; }).join("")}</div></div>` : ""}
    ${sut.length ? `<div><span class="lbl">යෙදුණු සූත්‍ර</span>${sut.map(k => `<div class="ex"><span class="sutra">${S[k][0]}</span><span class="mean">${S[k][1]}</span></div>`).join("")}</div>` : ""}
   </div></article>`;
  }).join("")}</div>`;

  const setPane = (card, k, open) => {
    const b = card.querySelector(`[data-p="${k}"]`), p = card.querySelector(`.pane[data-k="${k}"]`);
    p.hidden = !open;
    b.setAttribute("aria-expanded", open);
  };

  V().querySelectorAll(".q").forEach(card => card.querySelectorAll(".tb").forEach(b => b.onclick = () => setPane(card, b.dataset.p, b.getAttribute("aria-expanded") !== "true")));
  V().querySelectorAll("[data-all]").forEach(b => b.onclick = () => V().querySelectorAll(".q").forEach(c => ["t", "s", "x"].forEach(k => setPane(c, k, k === b.dataset.all))));
}

function exA() { exercise(EXA, "A"); }
function exB() { exercise(EXB, "B"); }

let wMode = "list", wi = 0, flip = false, deck = VOCAB.map((_, i) => i);

function words() {
  const head = `<div><h2>වචන මාලාව</h2><p class="mean">පළමු පොතෙහි නොදැක්වූ, අභ්‍යාසය 1 සම්බන්ධ වචන ${VOCAB.length}.</p></div>
 <div class="seg" role="group"><button type="button" data-wm="list" aria-pressed="${wMode === "list"}">ලැයිස්තුව</button><button type="button" data-wm="cards" aria-pressed="${wMode === "cards"}">කාඩ්පත්</button></div>`;
  if (wMode === "list") {
    V().innerHTML = head + `<div class="grid2">${VOCAB.map(w => `<div class="wcell"><span class="pali">${w[0]}</span><div>${w[1]}</div>${w[2] ? `<small>${GENDER[w[2]] || w[2]}</small>` : ""}</div>`).join("")}</div>`;
  } else {
    const w = VOCAB[deck[wi]];
    V().innerHTML = head + `<button type="button" class="card" id="card" aria-label="කාඩ්පත පෙරළන්න">${flip ? `<span class="hint">${w[0]}</span><span class="big" style="font-size:1.4rem">${w[1]}</span>${w[2] ? `<span class="hint">${GENDER[w[2]] || w[2]}</span>` : ""}` : `<span class="big">${w[0]}</span><span class="hint">අර්ථය බැලීමට තට්ටු කරන්න</span>`}</button>
  <div class="meta"><span>${wi + 1} / ${deck.length}</span></div>
  <div class="btns"><button type="button" class="btn ghost" id="prev">‹ පෙර</button><button type="button" class="btn" id="next">ඊළඟ ›</button><button type="button" class="btn ghost" id="shuf">මිශ්‍ර කරන්න</button></div>`;
    $("#card").onclick = () => { flip = !flip; words(); };
    $("#prev").onclick = () => { wi = (wi - 1 + deck.length) % deck.length; flip = false; words(); };
    $("#next").onclick = () => { wi = (wi + 1) % deck.length; flip = false; words(); };
    $("#shuf").onclick = () => { deck.sort(() => Math.random() - .5); wi = 0; flip = false; words(); };
  }
  V().querySelectorAll("[data-wm]").forEach(b => b.onclick = () => { wMode = b.dataset.wm; words(); });
}

function render() {
  renderNav();
  ({ lessons, exA, exB, words })[state.sec]();
}

render();