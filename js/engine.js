/* AI GATE Quest: game engine. Plain JS, no build step, works from GitHub Pages or a local file. */
(function () {
  "use strict";
  const app = document.getElementById("app");
  const LEVELS = { 1: "Basic", 2: "Intermediate", 3: "GATE" };
  const ROUND = 8;            // questions per round
  const KEY = "aigq.v1";

  // ---------- storage (one browser only; the game works without it)
  function load() { try { return Object.assign({ xp: 0, stars: {}, best: {}, streak: 0, last: "", sound: true, answered: 0, right: 0 }, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return { xp: 0, stars: {}, best: {}, streak: 0, last: "", sound: true, answered: 0, right: 0 }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  const S = load();
  function touchDay() {
    const d = new Date().toISOString().slice(0, 10); if (S.last === d) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    S.streak = S.last === y ? S.streak + 1 : 1; S.last = d; save();
  }
  const playerLevel = xp => Math.floor(Math.sqrt(xp / 60)) + 1;
  const levelFloor = L => 60 * (L - 1) * (L - 1);

  // ---------- random
  function RNG(seed) { let s = (seed >>> 0) || 1; return { next() { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }, int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }, pick(arr) { return arr[Math.floor(this.next() * arr.length)]; } }; }
  let seedCounter = Date.now() % 1e9;
  const rng = () => RNG(++seedCounter * 2654435761);
  function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ---------- sound (tiny synthesized cues; off-switch on the home page)
  let ac = null;
  function tone(freqs, dur = .12, type = "triangle", gap = .09, vol = .08) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
        const t = ac.currentTime + i * gap; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .02); });
    } catch (e) { }
  }
  const sfx = { ok: () => tone([660, 880], .14), no: () => tone([220, 165], .18, "sawtooth", .1, .05), star: () => tone([523, 659, 784, 1047], .18, "triangle", .12) };

  // ---------- helpers
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  const subj = id => SUBJECTS.find(s => s.id === id);
  const chapters = sid => (window.QBANK && QBANK[subj(sid).bank]) || [];
  const starKey = (sid, ch, l) => `${sid}/${ch}/${l}`;
  const starsOf = (sid, ch, l) => S.stars[starKey(sid, ch, l)] || 0;
  const starStr = n => "★".repeat(n) + "☆".repeat(3 - n);
  function page(html, cls = "") { app.innerHTML = `<div class="page ${cls}" id="pg">${html}</div>`; const pg = document.getElementById("pg"); pg.scrollTop = 0; return pg; }
  function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 1800); }

  // ---------- question building
  function fromBank(e) {
    const [lvl, q, opts, ans, what, why, how, trap] = e; const r = rng();
    if (!opts) return { lvl, q, opts: null, ans, tol: e[8] || 0, what, why, how, trap };
    const order = shuffle(opts.map((_, i) => i), r);
    return { lvl, q, opts: order.map(i => opts[i]), ans: order.indexOf(ans), what, why, how, trap };
  }
  function fromGen(name) {
    const g = GEN[name]; const o = g.make(rng());
    const q = { lvl: g.lvl, q: o.q, what: o.what, why: o.why, how: o.how, trap: o.trap, gen: true };
    if (o.opts) { const order = shuffle(o.opts.map((_, i) => i), rng()); q.opts = order.map(i => o.opts[i]); q.ans = order.indexOf(o.ans); }
    else { q.opts = null; q.ans = o.ans; q.tol = o.tol || 0; }
    return q;
  }
  function buildRound(ch, lvl) {
    const r = rng();
    const hand = shuffle(ch.qs.filter(e => e[0] === lvl), r).map(fromBank);
    const gens = ch.gens || []; const atLvl = gens.filter(n => GEN[n] && GEN[n].lvl === lvl);
    const pool = atLvl.length ? atLvl : gens.filter(n => GEN[n]);
    const nGen = Math.max(0, ROUND - hand.length);
    const genQs = []; for (let i = 0; i < nGen && pool.length; i++) { const q = fromGen(pool[i % pool.length]); q.lvl = lvl; genQs.push(q); }
    return shuffle(hand.concat(genQs), r).slice(0, ROUND);
  }

  // ---------- HOME
  function home() {
    touchDay();
    const L = playerLevel(S.xp), lo = levelFloor(L), hi = levelFloor(L + 1);
    const cards = SUBJECTS.map(s => {
      const chs = s.bank && window.QBANK && QBANK[s.bank];
      const got = chs ? chs.reduce((a, c) => a + [1, 2, 3].reduce((b, l) => b + starsOf(s.id, c.id, l), 0), 0) : 0;
      const tot = chs ? chs.length * 9 : 0;
      const n = chs ? chs.length : (s.plan || []).length;
      return `<button class="subj ${chs ? "" : "locked"}" style="--c:${s.color}" data-s="${s.id}">
        ${chs ? "" : '<span class="stamp">coming soon</span>'}
        <span class="g">${esc(s.glyph)}</span><span class="n">${esc(s.name)}</span>
        <span class="m">${n} chapters${chs ? ` · ${got}/${tot} ★` : ""}</span>
        ${chs ? `<span class="minibar"><i style="width:${tot ? 100 * got / tot : 0}%"></i></span>` : ""}
      </button>`;
    }).join("");
    page(`<p class="eyebrow">Concepts through questions · Basic → GATE</p>
      <h1>AI GATE Quest</h1>
      <p class="note">Answer, see why, level up. Every chapter runs Basic → Intermediate → GATE.</p>
      <div class="half"></div>
      <div class="stats"><span>LEVEL <b>${L}</b></span><span>XP <b>${S.xp}</b></span><span>DAY STREAK <b>${S.streak}</b></span><span>ACCURACY <b>${S.answered ? Math.round(100 * S.right / S.answered) : 0}%</b></span></div>
      <div class="xpbar" title="XP to next level"><i style="width:${Math.min(100, 100 * (S.xp - lo) / (hi - lo))}%"></i></div>
      <div class="grid">${cards}</div>
      <div class="gap"></div>
      <div class="row"><button class="btn ghost" id="snd">${S.sound ? "Sound: on" : "Sound: off"}</button><span class="spacer"></span><button class="back" id="reset">reset progress</button></div>
      <p class="note">Progress is saved in this browser only.</p>`);
    app.querySelectorAll(".subj").forEach(b => b.onclick = () => { const s = subj(b.dataset.s); s.bank && QBANK[s.bank] ? subject(s.id) : plan(s); });
    document.getElementById("snd").onclick = () => { S.sound = !S.sound; save(); home(); };
    document.getElementById("reset").onclick = function () {
      if (this.dataset.armed) { Object.assign(S, { xp: 0, stars: {}, best: {}, answered: 0, right: 0 }); save(); home(); toast("Progress cleared"); }
      else { this.dataset.armed = 1; this.textContent = "tap again to erase all progress"; }
    };
  }

  function plan(s) {
    page(`<button class="back" id="bk">← all subjects</button>
      <p class="eyebrow">Coming soon</p><h1 style="color:${s.color}">${esc(s.name)}</h1>
      ${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}
      <div class="sheet"><h3>Planned chapters</h3><ol>${(s.plan || []).map(c => `<li>${esc(c)}</li>`).join("")}</ol></div>
      <div class="gap"></div><p>Each chapter will have Basic, Intermediate and GATE levels plus an endless drill, the same as Machine Learning.</p>`);
    document.getElementById("bk").onclick = home;
  }

  // ---------- SUBJECT MAP
  function subject(sid) {
    const s = subj(sid), chs = chapters(sid);
    const rows = chs.map((c, i) => {
      const st = [1, 2, 3].map(l => starsOf(sid, c.id, l)); const done = st[2] > 0;
      const lv = [1, 2, 3].map(l => {
        const open = l === 1 || starsOf(sid, c.id, l - 1) > 0;
        return `<button class="lv ${l === 3 ? "gate" : ""} ${open ? "" : "locked"}" data-c="${c.id}" data-l="${l}" ${open ? "" : 'aria-disabled="true"'}>
          <small>${l === 3 ? "GATE LEVEL" : LEVELS[l].toUpperCase()}</small><span>${open ? `<span class="s">${starStr(st[l - 1])}</span>` : "locked · 1★ in " + LEVELS[l - 1]}</span></button>`;
      }).join("");
      return `<div class="ch ${done ? "done" : ""}"><div class="num">${i + 1}</div><div class="card">
        <div class="t">${esc(c.title)}</div><div class="b">${esc(c.blurb)}</div>
        <div class="levels">${lv}<button class="lv drill" data-d="${c.id}"><small>ENDLESS DRILL</small><span>∞ new numbers</span></button></div>
        ${c.lesson ? `<a class="lesson-link" href="${c.lesson}">read the notebook lesson →</a>` : ""}
      </div></div>`;
    }).join("");
    const got = chs.reduce((a, c) => a + [1, 2, 3].reduce((b, l) => b + starsOf(sid, c.id, l), 0), 0);
    page(`<button class="back" id="bk">← all subjects</button>
      <p class="eyebrow">${chs.length} chapters · ${chs.reduce((a, c) => a + c.qs.length, 0)} hand-written questions + endless generated ones</p>
      <h1 style="color:${s.color}">${esc(s.name)}</h1>
      ${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}
      <p class="stats"><span>STARS <b>${got}</b> / ${chs.length * 9}</span></p>
      <div class="path">${rows}</div>`);
    document.getElementById("bk").onclick = home;
    app.querySelectorAll(".lv[data-l]").forEach(b => b.onclick = () => {
      if (b.classList.contains("locked")) { toast("Earn 1★ in the previous level first"); return; }
      startRound(sid, b.dataset.c, +b.dataset.l);
    });
    app.querySelectorAll(".lv[data-d]").forEach(b => b.onclick = () => startDrill(sid, b.dataset.d));
  }

  // ---------- PLAY
  let R = null;
  function startRound(sid, chId, lvl) {
    const ch = chapters(sid).find(c => c.id === chId);
    R = { mode: "round", sid, ch, lvl, list: buildRound(ch, lvl), i: 0, right: 0, combo: 0, xp: 0, wrong: [] };
    question();
  }
  function startDrill(sid, chId) {
    const ch = chapters(sid).find(c => c.id === chId);
    if (!ch.gens || !ch.gens.length) { toast("No generators for this chapter yet"); return; }
    R = { mode: "drill", sid, ch, lvl: 0, list: [], i: 0, right: 0, combo: 0, xp: 0, wrong: [] };
    R.list.push(fromGen(R.ch.gens[0])); question();
  }
  function topbar() {
    const total = R.mode === "drill" ? "∞" : R.list.length;
    const pct = R.mode === "drill" ? 100 : 100 * R.i / R.list.length;
    return `<div class="topbar"><button class="quit" id="quit" aria-label="Quit round">×</button>
      <div class="qprog"><i style="width:${pct}%"></i></div>
      <span>${R.i + 1}/${total}</span>${R.combo >= 2 ? `<span class="flame">×${R.combo}</span>` : ""}<span>+${R.xp} XP</span></div>`;
  }
  function bindQuit() { document.getElementById("quit").onclick = () => (R.mode === "drill" && R.i > 0 ? results() : subject(R.sid)); }

  function question() {
    const q = R.list[R.i]; R.answered = false;
    const tag = `<span class="tag l${q.lvl}">${q.lvl === 3 ? "GATE" : LEVELS[q.lvl]}</span>${q.gen ? '<span class="tag gen">new numbers</span>' : ""}`;
    const body = q.opts
      ? `<div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><b>${"ABCD"[i]}</b>${fmt(o)}</button>`).join("")}</div>`
      : `<div class="nat"><label for="nat" class="note">answer =</label><input id="nat" inputmode="decimal" autocomplete="off" enterkeyhint="done"><button class="btn" id="chk">Check</button></div>
         <p class="note">Numerical answer: type a number.</p>`;
    page(`${topbar()}<div class="slide">
      <p class="eyebrow">${esc(R.ch.title)}${R.mode === "drill" ? " · endless drill" : ""}</p>
      <div>${tag}</div><p class="qtext">${fmt(q.q)}</p>${body}<div id="after"></div></div>`);
    bindQuit();
    if (q.opts) app.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(+b.dataset.i));
    else {
      const inp = document.getElementById("nat"), go = () => { if (inp.value.trim() === "" || isNaN(parseFloat(inp.value))) { toast("Type a number first"); return; } answer(parseFloat(inp.value)); };
      document.getElementById("chk").onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); }; inp.focus({ preventScroll: true });
    }
  }

  function answer(v) {
    if (R.answered) return; R.answered = true;
    const q = R.list[R.i]; let ok;
    if (q.opts) {
      ok = v === q.ans;
      app.querySelectorAll(".opt").forEach((b, i) => { b.disabled = true; if (i === q.ans) b.classList.add("right"); else if (i === v) b.classList.add("wrong"); });
    } else {
      ok = Math.abs(v - q.ans) <= (q.tol || 0) + 1e-9;
      document.getElementById("nat").disabled = true; document.getElementById("chk").disabled = true;
    }
    S.answered++; let gain = 0;
    if (ok) { R.right++; R.combo++; S.right++; gain = Math.round((10 + (R.combo >= 3 ? 5 : 0)) * (q.lvl === 3 ? 1.5 : 1)); R.xp += gain; S.xp += gain; sfx.ok(); }
    else { R.combo = 0; R.wrong.push(q); sfx.no(); }
    save();
    const correctTxt = q.opts ? `${"ABCD"[q.ans]}. ${q.opts[q.ans]}` : (Math.round(q.ans * 1000) / 1000).toString();
    document.getElementById("after").innerHTML = `
      <p class="verdict ${ok ? "ok" : "no"}">${ok ? "✓ Correct!" : "✗ Not quite"}${gain ? `<span class="xp-pop">+${gain} XP</span>` : ""}</p>
      ${ok ? "" : `<p class="answerline">Answer: <b>${fmt(correctTxt)}</b></p>`}
      <button class="btn red next" id="why">Why? See the concept →</button>`;
    const why = document.getElementById("why"); why.onclick = concept; why.focus({ preventScroll: true });
    why.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function concept() {
    const q = R.list[R.i];
    const last = R.mode === "round" && R.i === R.list.length - 1;
    page(`${topbar()}<div class="slide concept">
      <p class="eyebrow">Concept · ${esc(R.ch.title)}</p>
      <h2>Why this answer</h2>
      <p class="answerline">${fmt(q.q)}</p>
      <div class="sec"><p class="k">WHAT</p><p class="v">${fmt(q.what)}</p></div>
      <div class="sec"><p class="k">WHY</p><p class="v">${fmt(q.why)}</p></div>
      <div class="sec"><p class="k">HOW</p><p class="v how">${fmt(q.how)}</p></div>
      ${q.trap ? `<div class="sec"><p class="k">TRAP</p><p class="v trap">${fmt(q.trap)}</p></div>` : ""}
      <div class="row" style="margin-top:12px">
        ${R.mode === "drill" ? '<button class="btn ghost" id="fin">Finish drill</button>' : ""}
        <button class="btn" id="nx" style="flex:1">${last ? "See my stars →" : "Next question →"}</button></div></div>`);
    bindQuit();
    document.getElementById("nx").onclick = next; document.getElementById("nx").focus({ preventScroll: true });
    const fin = document.getElementById("fin"); if (fin) fin.onclick = results;
  }

  function next() {
    if (R.mode === "drill") { R.i++; const g = R.ch.gens; R.list.push(fromGen(g[Math.floor(Math.random() * g.length)])); question(); return; }
    R.i++; R.i < R.list.length ? question() : results();
  }

  function results() {
    const n = R.mode === "drill" ? R.i + (R.answered ? 1 : 0) : R.list.length;
    const frac = n ? R.right / n : 0;
    let stars = 0, msg = "";
    if (R.mode === "round") {
      stars = frac >= .9 ? 3 : frac >= .7 ? 2 : frac >= .5 ? 1 : 0;
      const k = starKey(R.sid, R.ch.id, R.lvl), before = S.stars[k] || 0;
      if (stars > before) { S.stars[k] = stars; save(); }
      if (stars && R.lvl < 3 && !before) msg = `${LEVELS[R.lvl + 1]} level unlocked!`;
      if (stars) sfx.star();
    }
    const nextBtn = R.mode === "round" && stars && R.lvl < 3 ? `<button class="btn red" id="nl">Play ${LEVELS[R.lvl + 1]} →</button>` : "";
    page(`<p class="eyebrow">${esc(R.ch.title)} · ${R.mode === "drill" ? "Endless drill" : LEVELS[R.lvl] + " level"}</p>
      <h2>${R.mode === "drill" ? "Drill finished" : stars === 3 ? "Perfect page!" : stars ? "Level cleared" : "Not cleared yet"}</h2>
      ${R.mode === "round" ? `<div class="stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? "on" : ""}">★</span>`).join("")}</div>` : ""}
      <p class="big">${R.right} / ${n}</p>
      <p style="text-align:center">+${R.xp} XP${msg ? ` · <b class="red" style="color:var(--red)">${msg}</b>` : ""}</p>
      ${R.mode === "round" ? `<p class="note" style="text-align:center">1★ at 50 % · 2★ at 70 % · 3★ at 90 %</p>` : ""}
      ${R.wrong.length ? `<div class="sheet"><h3>Revise these</h3><ol class="review">${R.wrong.map((q, i) => `<li><a href="#" data-w="${i}">${fmt(q.q.length > 110 ? q.q.slice(0, 107) + "…" : q.q)}</a></li>`).join("")}</ol></div>` : ""}
      <div class="gap"></div>
      <div class="row">${nextBtn}<button class="btn" id="again">${R.mode === "drill" ? "Drill again" : "Retry (new mix)"}</button><button class="btn ghost" id="map">Chapter map</button></div>`);
    document.getElementById("map").onclick = () => subject(R.sid);
    document.getElementById("again").onclick = () => R.mode === "drill" ? startDrill(R.sid, R.ch.id) : startRound(R.sid, R.ch.id, R.lvl);
    const nl = document.getElementById("nl"); if (nl) nl.onclick = () => startRound(R.sid, R.ch.id, R.lvl + 1);
    app.querySelectorAll("[data-w]").forEach(a => a.onclick = e => { e.preventDefault(); reviewOne(R.wrong[+a.dataset.w]); });
  }
  function reviewOne(q) {
    const correctTxt = q.opts ? q.opts[q.ans] : (Math.round(q.ans * 1000) / 1000).toString();
    page(`<button class="back" id="bk">← back to results</button><div class="slide concept">
      <p class="qtext">${fmt(q.q)}</p><p class="answerline">Answer: <b>${fmt(correctTxt)}</b></p>
      <div class="sec"><p class="k">WHAT</p><p class="v">${fmt(q.what)}</p></div>
      <div class="sec"><p class="k">WHY</p><p class="v">${fmt(q.why)}</p></div>
      <div class="sec"><p class="k">HOW</p><p class="v how">${fmt(q.how)}</p></div>
      ${q.trap ? `<div class="sec"><p class="k">TRAP</p><p class="v trap">${fmt(q.trap)}</p></div>` : ""}</div>`);
    document.getElementById("bk").onclick = results;
  }

  // keyboard: 1-4 pick an option, Enter/→ continue
  document.addEventListener("keydown", e => {
    if (!R || e.target.matches("input")) return;
    if (/^[1-4]$/.test(e.key)) { const b = app.querySelector(`.opt[data-i="${+e.key - 1}"]`); if (b && !b.disabled) b.click(); }
    if (e.key === "Enter" || e.key === "ArrowRight") { const b = document.getElementById("why") || document.getElementById("nx"); if (b && document.activeElement !== b) { e.preventDefault(); b.click(); } }
  });

  home();
})();
