/* AI GATE Quest: app engine. Plain JS, no build step; works on GitHub Pages or from a local file.
   Flow per chapter: Learn (theory + animations) → Practice (Basic → Intermediate → GATE, endless drill). */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const app = document.getElementById("app");
  const LEVELS = { 1: "Basic", 2: "Intermediate", 3: "GATE" };
  const LDESC = { 1: "Definitions and core ideas", 2: "Formulas, properties and reasoning", 3: "Exam-style numericals and traps" };
  const ROUND = 8, KEY = "aigq.v1";

  // ---------- storage (this browser only; the app works without it)
  const DEF = { xp: 0, stars: {}, read: {}, streak: 0, last: "", sound: true, answered: 0, right: 0 };
  function load() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return Object.assign({}, DEF); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  const S = load(); S.read = S.read || {};
  function touchDay() { const d = new Date().toISOString().slice(0, 10); if (S.last === d) return; const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); S.streak = S.last === y ? S.streak + 1 : 1; S.last = d; save(); }
  const playerLevel = xp => Math.floor(Math.sqrt(xp / 60)) + 1, levelFloor = L => 60 * (L - 1) * (L - 1);

  // ---------- random
  function RNG(seed) { let s = (seed >>> 0) || 1; return { next() { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }, int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }, pick(a) { return a[Math.floor(this.next() * a.length)]; } }; }
  let seedCounter = Date.now() % 1e9; const rng = () => RNG(++seedCounter * 2654435761);
  function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ---------- sound cues (toggle on the home page)
  let ac = null;
  function tone(fs, dur = .12, type = "triangle", gap = .09, vol = .07) { if (!S.sound) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    fs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; const t = ac.currentTime + i * gap; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .02); }); } catch (e) { } }
  const sfx = { ok: () => tone([660, 880]), no: () => tone([220, 165], .18, "sine", .1, .06), star: () => tone([523, 659, 784, 1047], .18, "triangle", .12) };

  // ---------- helpers
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = s => esc(s).split("```").map((p, i) => i % 2 ? `<pre class="qcode">${p.replace(/^\n/, "").replace(/\n$/, "")}</pre>` : p.replace(/`([^`\n]+)`/g, '<code class="k">$1</code>').replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>")).join("");
  const subj = id => SUBJECTS.find(s => s.id === id);
  const chapters = sid => (window.QBANK && QBANK[subj(sid).bank]) || [];
  const starKey = (sid, ch, l) => `${sid}/${ch}/${l}`, starsOf = (sid, ch, l) => S.stars[starKey(sid, ch, l)] || 0;
  const starStr = n => "★".repeat(n) + "☆".repeat(3 - n);
  function view(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 1800); }
  const appbar = (left, right = "") => `<header class="appbar"><div class="in">${left}<span class="spacer"></span>${right}</div><div class="readbar"><i id="rb"></i></div></header>`;
  const brand = `<span class="brand"><i>AI</i>GATE Quest</span>`;
  function katexIn(el) { if (window.renderMathInElement) { try { renderMathInElement(el, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }], throwOnError: false }); } catch (e) { } } }

  // ---------- questions
  function fromBank(e) { const [lvl, q, opts, ans, what, why, how, trap] = e; const order = shuffle(opts.map((_, i) => i), rng());
    return { lvl, q, opts: order.map(i => opts[i]), ans: order.indexOf(ans), what, why, how, trap }; }
  function fromGen(name) { const g = GEN[name], o = g.make(rng()); const q = { lvl: g.lvl, q: o.q, what: o.what, why: o.why, how: o.how, trap: o.trap, gen: true };
    if (o.opts) { const order = shuffle(o.opts.map((_, i) => i), rng()); q.opts = order.map(i => o.opts[i]); q.ans = order.indexOf(o.ans); } else { q.opts = null; q.ans = o.ans; q.tol = o.tol || 0; } return q; }
  function buildRound(ch, lvl) { const r = rng(), hand = shuffle(ch.qs.filter(e => e[0] === lvl), r).map(fromBank);
    const gens = (ch.gens || []).filter(n => GEN[n]), atL = gens.filter(n => GEN[n].lvl === lvl), pool = atL.length ? atL : gens; const extra = [];
    for (let i = 0; i < ROUND - hand.length && pool.length; i++) { const q = fromGen(pool[i % pool.length]); q.lvl = lvl; extra.push(q); }
    return shuffle(hand.concat(extra), r).slice(0, ROUND); }

  // ================= HOME
  function home() {
    touchDay(); const L = playerLevel(S.xp), lo = levelFloor(L), hi = levelFloor(L + 1);
    const cards = SUBJECTS.map(s => { const chs = s.bank && window.QBANK && QBANK[s.bank];
      const got = chs ? chs.reduce((a, c) => a + [1, 2, 3].reduce((b, l) => b + starsOf(s.id, c.id, l), 0), 0) : 0, tot = chs ? chs.length * 9 : 0, n = chs ? chs.length : (s.plan || []).length;
      return `<button class="subj ${chs ? "" : "soon"}" style="--c:${s.color}" data-s="${s.id}">${chs ? "" : '<span class="tagsoon">SOON</span>'}
        <span class="g">${esc(s.glyph)}</span><span class="n">${esc(s.name)}</span><span class="m">${n} chapters${chs ? ` · ${got}/${tot} ★` : ""}</span>
        ${chs ? `<span class="bar6"><i style="width:${tot ? 100 * got / tot : 0}%"></i></span>` : ""}</button>`; }).join("");
    view(`${appbar(brand, `<button class="iconbtn" id="snd" aria-label="Toggle sound">${S.sound ? "Sound on" : "Sound off"}</button>`)}
      <main class="wrap"><section class="hero"><p class="eyebrow">Learn the concept · then prove it</p>
      <h1>AI &amp; GATE DA, chapter by chapter</h1>
      <p class="muted" style="margin-top:8px">Every chapter starts with an illustrated theory lesson with live algorithm animations, then three quiz levels: Basic → Intermediate → GATE.</p></section>
      <div class="statgrid"><div class="stat"><small>Level</small><b>${L}</b></div><div class="stat"><small>XP</small><b>${S.xp}</b></div><div class="stat"><small>Day streak</small><b>${S.streak}</b></div><div class="stat"><small>Accuracy</small><b>${S.answered ? Math.round(100 * S.right / S.answered) : 0}%</b></div></div>
      <div class="xpline" title="XP to the next level"><i style="width:${Math.min(100, 100 * (S.xp - lo) / (hi - lo))}%"></i></div>
      <div class="subjects">${cards}</div>
      <div class="row" style="margin-top:22px"><span class="muted" style="font-size:13.5px">Progress is saved in this browser only.</span><span class="spacer"></span><button class="linkbtn" id="reset">Reset progress</button></div></main>`);
    app.querySelectorAll(".subj").forEach(b => b.onclick = () => { const s = subj(b.dataset.s); s.bank && window.QBANK && QBANK[s.bank] ? subject(s.id) : plan(s); });
    document.getElementById("snd").onclick = () => { S.sound = !S.sound; save(); home(); };
    document.getElementById("reset").onclick = function () { if (this.dataset.armed) { Object.assign(S, { xp: 0, stars: {}, read: {}, answered: 0, right: 0 }); save(); home(); toast("Progress cleared"); } else { this.dataset.armed = 1; this.textContent = "Tap again to erase everything"; } };
  }
  function plan(s) {
    view(`${appbar(`<button class="iconbtn" id="bk" aria-label="Back">←</button>${brand}`)}<main class="wrap">
      <p class="eyebrow">Coming soon</p><h1>${esc(s.name)}</h1>${s.note ? `<p class="muted" style="margin-top:8px">${esc(s.note)}</p>` : ""}
      <div class="sheet"><h3>Planned chapters</h3><ol>${(s.plan || []).map(c => `<li>${esc(c)}</li>`).join("")}</ol></div>
      <p class="muted" style="margin-top:14px">Each chapter will follow the same pattern as Machine Learning: an animated theory lesson, then Basic, Intermediate and GATE quizzes plus an endless drill.</p></main>`);
    document.getElementById("bk").onclick = home;
  }

  // ================= SUBJECT MAP
  function subject(sid) {
    const s = subj(sid), chs = chapters(sid);
    const got = chs.reduce((a, c) => a + [1, 2, 3].reduce((b, l) => b + starsOf(sid, c.id, l), 0), 0);
    const list = chs.map((c, i) => { const th = window.THEORY && THEORY[c.id], read = S.read[`${sid}/${c.id}`], st = [1, 2, 3].map(l => starsOf(sid, c.id, l));
      return `<button class="chcard ${st[2] ? "done" : ""}" data-c="${c.id}"><span class="chnum">${i + 1}</span><span><span class="t">${esc(c.title)}</span><span class="b" style="display:block">${esc(c.blurb)}</span>
        <span class="chips">${th ? `<span class="chip ${read ? "ok" : ""}">${read ? "✓ theory read" : `Theory · ${th.mins} min`}</span>` : ""}${[1, 2, 3].map(l => `<span class="chip">${LEVELS[l]} <span class="s">${starStr(st[l - 1])}</span></span>`).join("")}</span></span></button>`; }).join("");
    view(`${appbar(`<button class="iconbtn" id="bk" aria-label="Back">←</button>${brand}`, `<span class="pill">★ <b>${got}</b>/${chs.length * 9}</span>`)}
      <main class="wrap"><p class="eyebrow">${chs.length} chapters · ${chs.reduce((a, c) => a + c.qs.length, 0)} questions + endless generated practice</p>
      <h1>${esc(s.name)}</h1>${s.note ? `<p class="muted" style="margin-top:8px">${esc(s.note)}</p>` : ""}
      <div class="chlist">${list}</div></main>`);
    document.getElementById("bk").onclick = home;
    app.querySelectorAll(".chcard").forEach(b => b.onclick = () => chapter(sid, b.dataset.c, S.read[`${sid}/${b.dataset.c}`] ? "practice" : "learn"));
  }

  // ================= CHAPTER (Learn | Practice)
  function chapter(sid, cid, tab = "learn", anchor) {
    const chs = chapters(sid), idx = chs.findIndex(c => c.id === cid), ch = chs[idx], th = window.THEORY && THEORY[cid];
    const head = `${appbar(`<button class="iconbtn" id="bk" aria-label="Back to chapters">←</button><span class="brand" style="font-size:14.5px">Ch ${idx + 1} · ${esc(ch.title)}</span>`)}
      <main class="wrap"><p class="eyebrow">Chapter ${idx + 1} of ${chs.length}</p><h1>${esc(ch.title)}</h1><p class="muted" style="margin-top:6px">${esc(ch.blurb)}</p>
      <div class="tabs" role="tablist"><button class="tab ${tab === "learn" ? "on" : ""}" data-t="learn" role="tab">1 · Learn${th ? ` (${th.mins} min)` : ""}</button><button class="tab ${tab === "practice" ? "on" : ""}" data-t="practice" role="tab">2 · Practice</button></div>`;
    let body = "";
    if (tab === "learn" && th) {
      body = `<nav class="toc" aria-label="Sections">${th.sections.map((s, i) => `<a href="#sec${i}" data-sec="${i}">${i + 1}. ${esc(s.h)}</a>`).join("")}</nav>
        ${th.sections.map((s, i) => `<section class="tsec reveal" id="sec${i}"><p class="tn">${String(i + 1).padStart(2, "0")}</p><h2>${esc(s.h)}</h2>${s.html}
          ${s.anim ? `<figure class="demo"><div class="anim-host" data-anim="${s.anim}"></div>${s.cap ? `<figcaption>${esc(s.cap)}</figcaption>` : ""}</figure>` : ""}</section>`).join("")}
        <div class="cta reveal" id="endtheory"><h2>Theory done. Time to test it.</h2><p>Start with Basic. Each correct answer is followed by a short What / Why / How card.</p><button class="btn" id="go">Start the Basic quiz →</button></div>`;
    } else {
      const lv = [1, 2, 3].map(l => { const open = l === 1 || starsOf(sid, cid, l - 1) > 0;
        return `<button class="lvl l${l} ${open ? "" : "locked"}" data-l="${l}"><span class="badge">${l === 3 ? "G" : LEVELS[l][0]}</span><span><span class="t">${LEVELS[l]}${l === 3 ? " level" : ""}</span><span class="d" style="display:block">${open ? LDESC[l] : `Locked: earn 1★ in ${LEVELS[l - 1]}`}</span></span><span class="s">${starStr(starsOf(sid, cid, l))}</span></button>`; }).join("");
      body = `${th && !S.read[`${sid}/${cid}`] ? `<div class="callout">Tip: read the theory first. Every quiz question is covered there.</div>` : ""}
        <div class="levels">${lv}<button class="lvl drill" data-d="1"><span class="badge">∞</span><span><span class="t">Endless drill</span><span class="d" style="display:block">Fresh numerical questions with worked solutions, as many as you like</span></span><span></span></button></div>
        <p class="muted" style="font-size:13.5px;margin-top:12px">${ROUND} questions per round · 1★ at 50 %, 2★ at 70 %, 3★ at 90 % · each level unlocks the next</p>
        ${ch.lesson ? `<p style="margin-top:10px"><a href="${ch.lesson}">Bonus: the gradient-descent notebook lesson →</a></p>` : ""}`;
    }
    view(head + body + `</main>`);
    document.getElementById("bk").onclick = () => subject(sid);
    app.querySelectorAll(".tab").forEach(b => b.onclick = () => chapter(sid, cid, b.dataset.t));
    if (tab === "learn" && th) {
      const art = app.querySelector("main"); katexIn(art);
      const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 }) : null;
      app.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
      app.querySelectorAll(".anim-host").forEach(h => { const f = window.ANIM && ANIM[h.dataset.anim]; if (f) try { f(h); } catch (e) { h.textContent = "Animation could not start in this browser."; } });
      app.querySelectorAll(".toc a").forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById("sec" + a.dataset.sec).scrollIntoView({ behavior: "smooth", block: "start" }); });
      const rb = document.getElementById("rb"); const onScroll = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); rb.style.width = (100 * p) + "%"; if (p > .97 && !S.read[`${sid}/${cid}`]) { S.read[`${sid}/${cid}`] = true; save(); } };
      window.onscroll = onScroll; onScroll();
      document.getElementById("go").onclick = () => { S.read[`${sid}/${cid}`] = true; save(); startRound(sid, cid, 1); };
    } else {
      window.onscroll = null;
      app.querySelectorAll(".lvl[data-l]").forEach(b => b.onclick = () => { if (b.classList.contains("locked")) { toast(`Earn 1★ in ${LEVELS[+b.dataset.l - 1]} first`); return; } startRound(sid, cid, +b.dataset.l); });
      app.querySelector(".lvl[data-d]").onclick = () => startDrill(sid, cid);
    }
  }

  // ================= PLAY
  let R = null;
  function startRound(sid, cid, lvl) { window.onscroll = null; const ch = chapters(sid).find(c => c.id === cid); R = { mode: "round", sid, ch, lvl, list: buildRound(ch, lvl), i: 0, right: 0, combo: 0, xp: 0, wrong: [] }; question(); }
  function startDrill(sid, cid) { window.onscroll = null; const ch = chapters(sid).find(c => c.id === cid); if (!(ch.gens || []).length) { toast("No generators for this chapter yet"); return; }
    R = { mode: "drill", sid, ch, lvl: 0, list: [fromGen(ch.gens[0])], i: 0, right: 0, combo: 0, xp: 0, wrong: [] }; question(); }
  function qbar() { const drill = R.mode === "drill", pct = drill ? 100 : 100 * R.i / R.list.length;
    return `<header class="qbar"><div class="in"><button class="iconbtn" id="quit" aria-label="Leave">✕</button><div class="qprog"><i style="width:${pct}%"></i></div><span>${R.i + 1}/${drill ? "∞" : R.list.length}</span>${R.combo >= 2 ? `<span class="combo">×${R.combo}</span>` : ""}<span>+${R.xp} XP</span></div></header>`; }
  function bindQuit() { document.getElementById("quit").onclick = () => R.mode === "drill" && R.i > 0 ? results() : chapter(R.sid, R.ch.id, "practice"); }
  const tagOf = q => `<span class="qtag l${q.lvl}">${q.lvl === 3 ? "GATE" : LEVELS[q.lvl]}</span>${q.gen ? '<span class="qtag gen">new numbers</span>' : ""}`;

  function question() {
    const q = R.list[R.i]; R.answered = false;
    const body = q.opts ? `<div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="L">${"ABCD"[i]}</span><span>${fmt(o)}</span><span class="mk"></span></button>`).join("")}</div>`
      : `<div class="nat"><input id="nat" inputmode="decimal" autocomplete="off" placeholder="your answer" aria-label="Numerical answer"><button class="btn" id="chk">Check</button></div><p class="answerline">Numerical answer type: enter a number.</p>`;
    view(`${qbar()}<main class="wrap"><div class="card slide"><p class="eyebrow">${esc(R.ch.title)}${R.mode === "drill" ? " · endless drill" : ` · ${LEVELS[R.lvl]} round`}</p>
      <div style="margin-top:8px">${tagOf(q)}</div><div class="qtext">${fmt(q.q)}</div>${body}<div id="after"></div></div></main>`);
    bindQuit();
    if (q.opts) app.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(+b.dataset.i));
    else { const inp = document.getElementById("nat"), go = () => { if (inp.value.trim() === "" || isNaN(parseFloat(inp.value))) { toast("Type a number first"); return; } answer(parseFloat(inp.value)); };
      document.getElementById("chk").onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); }; inp.focus({ preventScroll: true }); }
  }
  function answer(v) {
    if (R.answered) return; R.answered = true; const q = R.list[R.i]; let ok;
    if (q.opts) { ok = v === q.ans; app.querySelectorAll(".opt").forEach((b, i) => { b.disabled = true; if (i === q.ans) b.classList.add("right"); else if (i === v) b.classList.add("wrong"); }); }
    else { ok = Math.abs(v - q.ans) <= (q.tol || 0) + 1e-9; document.getElementById("nat").disabled = true; document.getElementById("chk").disabled = true; }
    S.answered++; let gain = 0;
    if (ok) { R.right++; R.combo++; S.right++; gain = Math.round((10 + (R.combo >= 3 ? 5 : 0)) * (q.lvl === 3 ? 1.5 : 1)); R.xp += gain; S.xp += gain; sfx.ok(); } else { R.combo = 0; R.wrong.push(q); sfx.no(); }
    save();
    const correct = q.opts ? `${"ABCD"[q.ans]}. ${q.opts[q.ans]}` : String(Math.round(q.ans * 1000) / 1000);
    document.getElementById("after").innerHTML = `<div class="verdict ${ok ? "ok" : "no"}">${ok ? "✓ Correct" : "✗ Not quite"}${gain ? `<span class="xp">+${gain} XP</span>` : ""}</div>
      ${ok ? "" : `<p class="answerline">Correct answer: <b>${fmt(correct)}</b></p>`}<button class="btn accent wide" id="why" style="margin-top:14px">See the concept →</button>`;
    const w = document.getElementById("why"); w.onclick = concept; w.focus({ preventScroll: true }); w.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function conceptHTML(q) { return `<div class="sec"><p class="k what">WHAT</p><p class="v">${fmt(q.what)}</p></div><div class="sec"><p class="k why">WHY</p><p class="v">${fmt(q.why)}</p></div>
    <div class="sec"><p class="k how">HOW</p><p class="v how">${fmt(q.how)}</p></div>${q.trap ? `<div class="sec"><p class="k trap">TRAP</p><p class="v">${fmt(q.trap)}</p></div>` : ""}`; }
  function concept() {
    const q = R.list[R.i], last = R.mode === "round" && R.i === R.list.length - 1;
    view(`${qbar()}<main class="wrap"><div class="card slide concept"><p class="eyebrow">Concept</p><h2 style="margin-top:4px">Why this is the answer</h2><div class="qrecap">${fmt(q.q)}</div>${conceptHTML(q)}
      <div class="row" style="margin-top:14px">${R.mode === "drill" ? '<button class="btn ghost" id="fin">Finish drill</button>' : ""}<button class="btn" id="nx" style="flex:1">${last ? "See my stars →" : "Next question →"}</button></div></div></main>`);
    bindQuit(); document.getElementById("nx").onclick = next; document.getElementById("nx").focus({ preventScroll: true });
    const f = document.getElementById("fin"); if (f) f.onclick = results;
  }
  function next() { if (R.mode === "drill") { R.i++; R.list.push(fromGen(R.ch.gens[Math.floor(Math.random() * R.ch.gens.length)])); question(); return; } R.i++; R.i < R.list.length ? question() : results(); }
  function results() {
    const n = R.mode === "drill" ? R.i + (R.answered ? 1 : 0) : R.list.length, frac = n ? R.right / n : 0; let stars = 0, msg = "";
    if (R.mode === "round") { stars = frac >= .9 ? 3 : frac >= .7 ? 2 : frac >= .5 ? 1 : 0; const k = starKey(R.sid, R.ch.id, R.lvl), before = S.stars[k] || 0;
      if (stars > before) { S.stars[k] = stars; save(); } if (stars && R.lvl < 3 && !before) msg = `${LEVELS[R.lvl + 1]} unlocked`; if (stars) sfx.star(); }
    const nextBtn = R.mode === "round" && stars && R.lvl < 3 ? `<button class="btn accent" id="nl">Play ${LEVELS[R.lvl + 1]} →</button>` : "";
    view(`${appbar(brand)}<main class="wrap"><div class="card slide" style="text-align:center"><p class="eyebrow">${esc(R.ch.title)} · ${R.mode === "drill" ? "Endless drill" : LEVELS[R.lvl] + " level"}</p>
      <h2 style="margin-top:6px">${R.mode === "drill" ? "Drill finished" : stars === 3 ? "Perfect round!" : stars ? "Level cleared" : "Not cleared yet"}</h2>
      ${R.mode === "round" ? `<div class="stars">${[1, 2, 3].map(i => `<span data-on="${i <= stars ? 1 : 0}">★</span>`).join("")}</div>` : ""}
      <p class="big">${R.right} / ${n}</p><p class="muted">+${R.xp} XP${msg ? ` · <b style="color:var(--ok)">${msg}</b>` : ""}</p>
      ${!stars && R.mode === "round" ? `<p class="muted" style="margin-top:8px">You need 50 % for a star. Revise the theory, then retry: the questions are reshuffled and the numbers change.</p>` : ""}
      <div class="row" style="justify-content:center;margin-top:16px">${nextBtn}<button class="btn" id="again">${R.mode === "drill" ? "Drill again" : "Retry"}</button><button class="btn ghost" id="map">Chapter</button></div></div>
      ${R.wrong.length ? `<div class="sheet"><h3>Revise these</h3><div class="review">${R.wrong.map((q, i) => `<button data-w="${i}">${(t => fmt(t.length > 120 ? t.slice(0, 117) + "…" : t))((p => p.length > 1 ? p[0].trim() + " " + p[1].trim().split("\n").slice(0, 2).join(" · ") : p[0])(q.q.split("```")))}</button>`).join("")}</div></div>` : ""}</main>`);
    setTimeout(() => app.querySelectorAll(".stars span").forEach((s, i) => setTimeout(() => { if (s.dataset.on === "1") s.classList.add("on"); }, i * 220)), 120);
    document.getElementById("map").onclick = () => chapter(R.sid, R.ch.id, "practice");
    document.getElementById("again").onclick = () => R.mode === "drill" ? startDrill(R.sid, R.ch.id) : startRound(R.sid, R.ch.id, R.lvl);
    const nl = document.getElementById("nl"); if (nl) nl.onclick = () => startRound(R.sid, R.ch.id, R.lvl + 1);
    app.querySelectorAll("[data-w]").forEach(b => b.onclick = () => reviewOne(R.wrong[+b.dataset.w]));
  }
  function reviewOne(q) { const correct = q.opts ? q.opts[q.ans] : String(Math.round(q.ans * 1000) / 1000);
    view(`${appbar(`<button class="iconbtn" id="bk" aria-label="Back to results">←</button>${brand}`)}<main class="wrap"><div class="card slide concept"><div>${tagOf(q)}</div><div class="qtext">${fmt(q.q)}</div><p class="answerline">Answer: <b>${fmt(correct)}</b></p>${conceptHTML(q)}</div></main>`);
    document.getElementById("bk").onclick = results; }

  // keyboard: 1–4 choose an option; Enter / → continue
  document.addEventListener("keydown", e => { if (!R || e.target.matches("input")) return;
    if (/^[1-4]$/.test(e.key)) { const b = app.querySelector(`.opt[data-i="${+e.key - 1}"]`); if (b && !b.disabled) b.click(); }
    if (e.key === "Enter" || e.key === "ArrowRight") { const b = document.getElementById("why") || document.getElementById("nx"); if (b && document.activeElement !== b) { e.preventDefault(); b.click(); } } });

  // KaTeX loads deferred from the CDN; typeset whatever page is open once it arrives
  window.addEventListener("load", () => katexIn(app));
  home();
})();
