/* Animations for Python. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, txt, C } = window.ANIMKIT, A = window.ANIM;
  const MONO = "'JetBrains Mono', ui-monospace, monospace";
  const rr = (ctx, x, y, w, h, rad, fill, stroke, lw) => { ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad); ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } };
  const mono = (ctx, s, x, y, col, size, weight, align) => { ctx.font = `${weight || 500} ${size || 12.5}px ${MONO}`; ctx.fillStyle = col || C.ink; ctx.textAlign = align || "left"; ctx.fillText(s, x, y); };
  const arrow = (ctx, x1, y1, x2, y2, col) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8 * Math.cos(a - .4), y2 - 8 * Math.sin(a - .4)); ctx.lineTo(x2 - 8 * Math.cos(a + .4), y2 - 8 * Math.sin(a + .4)); ctx.fill(); };
  const codePanel = (ctx, lines, x, y, w, lh, cur) => { rr(ctx, x, y, w, lines.length * lh + 14, 10, "#1d2230"); lines.forEach((l, i) => { if (i === cur) { ctx.fillStyle = "rgba(224,100,26,.35)"; ctx.fillRect(x + 4, y + 7 + i * lh, w - 8, lh); } mono(ctx, l, x + 12, y + 7 + i * lh + lh * .72, i === cur ? "#fff" : "#c9cfdf", Math.min(12.5, lh * .62)); }); };

  /* names and objects */
  A.pymem = host => {
    const st = stage(host, { label: "Names, objects and references", h: 320 });
    const prog = ["x = 5", "y = x", "x = x + 1", "a = [1, 2]", "b = a", "b.append(3)"]; let k = 0;
    st.interval = 1500; st.tick = () => { k = (k + 1) % (prog.length + 2); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cw = Math.min(170, st.W * .4), lh = 24; codePanel(ctx, prog, 10, 10, cw, lh, k - 1);
      const n = Math.min(k, prog.length), env = {}, objs = []; const obj = v => { objs.push(v); return objs.length - 1; };
      for (let i = 0; i < n; i++) { const l = prog[i]; if (l === "x = 5") env.x = obj({ t: "int", v: 5 }); if (l === "y = x") env.y = env.x; if (l === "x = x + 1") env.x = obj({ t: "int", v: 6 }); if (l === "a = [1, 2]") env.a = obj({ t: "list", v: [1, 2] }); if (l === "b = a") env.b = env.a; if (l === "b.append(3)") objs[env.b].v = [1, 2, 3]; }
      const nx = cw + 34, ox = nx + Math.max(60, (st.W - nx) * .38); mono(ctx, "names", nx, 22, C.muted, 11); mono(ctx, "objects", ox, 22, C.muted, 11);
      const names = Object.keys(env), used = [...new Set(Object.values(env))], oy = {}; used.forEach((o, i) => oy[o] = 40 + i * 52);
      used.forEach(o => { const ob = objs[o], s = ob.t === "list" ? `[${ob.v.join(", ")}]` : String(ob.v), w = Math.max(64, s.length * 9 + 20); rr(ctx, ox, oy[o], w, 34, 8, ob.t === "list" ? "rgba(224,100,26,.15)" : "rgba(42,79,196,.12)", ob.t === "list" ? C.b : C.a, 1.6); mono(ctx, s, ox + 10, oy[o] + 22, C.ink, 13, 700); mono(ctx, ob.t, ox + w + 6, oy[o] + 22, C.muted, 10.5); });
      names.forEach((nm, i) => { const y = 40 + i * 44; rr(ctx, nx, y, 34, 30, 6, "#fff", C.ink, 1.5); mono(ctx, nm, nx + 17, y + 20, C.ink, 14, 800, "center"); arrow(ctx, nx + 36, y + 15, ox - 2, oy[env[nm]] + 17, C.muted); });
      const note = { 1: "x → new int object 5", 2: "y now names the same object", 3: "ints are immutable: x is rebound to a new object 6; y still 5", 4: "a → a list object", 5: "b = a copies the reference (alias)", 6: "mutating through b changes the one shared list" }[n] || "";
      st.info.innerHTML = `<span>line <b>${n}</b>/${prog.length}</span><span>${note}</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* loop tracer */
  A.pyloop = host => {
    const st = stage(host, { label: "Tracing a loop", h: 330, ratio: .85 });
    const lines = ["total = 0", "for i in range(1, 6):", "    if i % 2 == 0:", "        continue", "    total += i", "else:", "    print('done', total)"];
    const trace = (() => { const t = []; let total = 0; t.push([0, {}, ""]); total = 0; t.push([0, { total }, ""]); for (let i = 1; i < 6; i++) { t.push([1, { total, i }, ""]); t.push([2, { total, i }, ""]); if (i % 2 === 0) { t.push([3, { total, i }, ""]); continue; } total += i; t.push([4, { total, i }, ""]); } t.push([5, { total, i: 5 }, ""]); t.push([6, { total, i: 5 }, "done 9"]); return t; })();
    let k = 0; st.interval = 650; st.tick = () => { k = (k + 1) % (trace.length + 3); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const [line, vars, out] = trace[Math.min(k, trace.length - 1)], cw = Math.min(260, st.W * .58), lh = Math.min(26, (st.H - 30) / lines.length);
      codePanel(ctx, lines, 10, 10, cw, lh, line); const vx = cw + 26; mono(ctx, "variables", vx, 24, C.muted, 11);
      Object.entries(vars).forEach(([k2, v], i) => { rr(ctx, vx, 34 + i * 38, st.W - vx - 12, 30, 7, "#fff", C.grid); mono(ctx, `${k2} = ${v}`, vx + 10, 54 + i * 38, C.ink, 13.5, 700); });
      mono(ctx, "output", vx, 130, C.muted, 11); rr(ctx, vx, 138, st.W - vx - 12, 30, 7, "#f1efe9", C.grid); mono(ctx, out, vx + 10, 158, C.ok, 13.5, 700);
      st.info.innerHTML = `<span>step <b>${Math.min(k, trace.length - 1)}</b>/${trace.length - 1}</span><span class="hint">highlighted = line about to run; even i hits continue</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* LEGB scope */
  A.pyscope = host => {
    const st = stage(host, { label: "LEGB name lookup", h: 360, ratio: .95 });
    const layers = [["Built-in", ["len", "print", "sum"], "#efece5"], ["Global", ["x = 'global'", "y = 'global'"], "rgba(42,79,196,.10)"], ["Enclosing: outer()", ["y = 'enclosing'", "z = 'enclosing'"], "rgba(224,100,26,.12)"], ["Local: inner()", ["z = 'local'"], "rgba(21,128,61,.14)"]];
    const queries = [["z", 3], ["y", 2], ["x", 1], ["len", 0]]; let q = 0, t = 0; st.interval = 450; st.tick = () => { t++; if (t > 7) { t = 0; q = (q + 1) % queries.length; } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const [nm, hit] = queries[q], pad = 12, vin = (st.H - 60) / 4.6;
      layers.forEach(([title, items, fill], i) => { const inset = i * 14, x = pad + inset, y = 8 + i * vin, w = st.W - 2 * pad - 2 * inset, h = st.H - 46 - i * vin - inset * .3; const searched = 3 - i <= Math.min(t, 3) && i >= hit, found = i === hit && t >= 3 - hit;
        rr(ctx, x, y, w, h, 12, fill, found ? C.ok : searched ? C.b : C.grid, found ? 3 : searched ? 2 : 1.2); mono(ctx, title, x + 10, y + 17, C.ink, 11.5, 800);
        const hitItem = items.find(it => it.startsWith(nm + " ") || it === nm); mono(ctx, items.join("   "), x + 10, y + 33, C.muted, 10.5, 500); if (hitItem && found) mono(ctx, "✓ " + hitItem, x + w - 10, y + 17, C.ok, 11, 800, "right"); });
      mono(ctx, `inside inner(): print(${nm})`, st.W / 2, st.H - 24, C.ink, 13, 800, "center");
      st.info.innerHTML = `<span>looking up <b>${nm}</b></span><span>found in <b>${layers[hit][0]}</b></span><span class="hint">search goes Local → Enclosing → Global → Built-in and stops at the first match</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* aliasing vs copies */
  A.pyalias = host => {
    const st = stage(host, { label: "Assignment, shallow copy, deep copy", h: 330 });
    let mut = false; st.interval = 1600; st.tick = () => { mut = !mut; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cols = 4, cw = st.W / cols;
      const panels = [["b = a", "alias"], ["b = a.copy()", "shallow"], ["b = deepcopy(a)", "deep"], ["a = [[0]*2]*2", "trap"]];
      panels.forEach(([title, kind], p) => { const x0 = p * cw + 6, w = cw - 12; rr(ctx, x0, 6, w, st.H - 12, 10, "#fff", C.grid); mono(ctx, title, x0 + w / 2, 24, C.ink, Math.min(11.5, w / 12), 800, "center");
        const inner = (y, vals, hl) => { rr(ctx, x0 + w * .2, y, w * .6, 26, 6, hl ? "rgba(224,100,26,.25)" : "rgba(42,79,196,.1)", hl ? C.b : C.a); mono(ctx, `[${vals.join(", ")}]`, x0 + w / 2, y + 18, C.ink, 11.5, 700, "center"); };
        const m = mut; let aY = 50, bY = 50;
        if (kind === "trap") { const v = m ? [1, 0] : [0, 0]; mono(ctx, "a", x0 + 12, 60, C.ink, 13, 800); inner(st.H / 2 - 13, v, m); arrow(ctx, x0 + 24, 56, x0 + w * .2, st.H / 2 - 6, C.muted); arrow(ctx, x0 + 24, 60, x0 + w * .2, st.H / 2 + 6, C.muted); mono(ctx, "row 0 and row 1", x0 + w / 2, st.H / 2 + 36, C.muted, 10, 500, "center"); mono(ctx, m ? "a[0][0] = 1 → [[1,0],[1,0]]" : "same inner list twice", x0 + w / 2, st.H - 22, m ? C.b : C.muted, Math.min(10.5, w / 16), 700, "center"); return; }
        mono(ctx, "a", x0 + 12, 64, C.ink, 13, 800); mono(ctx, "b", x0 + 12, st.H - 40, C.ink, 13, 800);
        const innerA = m ? [1, 2, 9] : [1, 2];
        if (kind === "alias") { inner(st.H / 2 - 13, innerA, m); arrow(ctx, x0 + 24, 60, x0 + w * .2, st.H / 2 - 4, C.muted); arrow(ctx, x0 + 24, st.H - 44, x0 + w * .2, st.H / 2 + 6, C.muted); }
        if (kind === "shallow") { rr(ctx, x0 + w * .3, 46, w * .4, 22, 5, "#f1efe9", C.grid); rr(ctx, x0 + w * .3, st.H - 58, w * .4, 22, 5, "#f1efe9", C.grid); mono(ctx, "outer", x0 + w / 2, 61, C.muted, 10, 600, "center"); mono(ctx, "outer", x0 + w / 2, st.H - 43, C.muted, 10, 600, "center"); inner(st.H / 2 - 13, innerA, m); arrow(ctx, x0 + w / 2, 68, x0 + w / 2, st.H / 2 - 14, C.muted); arrow(ctx, x0 + w / 2, st.H - 58, x0 + w / 2, st.H / 2 + 14, C.muted); }
        if (kind === "deep") { inner(60, innerA, m); inner(st.H - 76, [1, 2], false); }
        const bSees = kind === "deep" ? "[1, 2]" : `[${innerA.join(", ")}]`; mono(ctx, `b[0] → ${bSees}`, x0 + w / 2, st.H - 16, kind === "deep" || !m ? C.muted : C.b, Math.min(10.5, w / 15), 700, "center"); });
      st.info.innerHTML = `<span>${mut ? "after a[0].append(9) (or a[0][0] = 1)" : "before mutation"}</span><span class="hint">orange = object that changed; arrows = references</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* generator pipeline */
  A.pygen = host => {
    const st = stage(host, { label: "Lazy generator pipeline", h: 300 });
    let t = 0, taken = []; st.interval = 700; st.tick = () => { t++; if (t % 3 === 0) { const n = taken.length; taken.push((n * 2) ** 2); } if (taken.length > 5) { taken = []; t = 0; } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const stages = ["count(0)", "x for x if x % 2 == 0", "x * x", "islice(…, 5)", "list"], w = (st.W - 30) / stages.length, y = 70, phase = t % 3, n = taken.length;
      stages.forEach((s, i) => { const x = 10 + i * w + 4, active = (phase === 0 && i <= 1) || (phase === 1 && i <= 3 && i >= 1) || (phase === 2 && i >= 3); rr(ctx, x, y, w - 10, 54, 10, active ? "rgba(42,79,196,.14)" : "#fff", active ? C.a : C.grid, active ? 2.2 : 1.2); mono(ctx, s, x + (w - 10) / 2, y + 32, C.ink, Math.min(11, (w - 10) / (s.length * .62)), 700, "center"); if (i < stages.length - 1) arrow(ctx, x + w - 10, y + 27, x + w + 2, y + 27, C.muted); });
      const cur = n * 2, vals = [`${cur}, ${cur + 1}…`, `${cur}`, `${cur * cur}`, `#${n + 1}`, ""]; vals.forEach((v, i) => mono(ctx, v, 10 + i * w + w / 2, y + 74, C.b, 11.5, 700, "center"));
      mono(ctx, "result so far: [" + taken.join(", ") + "]", 14, st.H - 30, C.ok, 13, 800);
      mono(ctx, "nothing runs until list() asks for the next value", 14, 30, C.muted, 11.5, 600);
      st.info.innerHTML = `<span>values produced <b>${n}</b>/5</span><span class="hint">count() is infinite, but only 5 squares of even numbers are ever computed</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* MRO diamond */
  A.pymro = host => {
    const st = stage(host, { label: "Method resolution order (C3)", h: 320 });
    const pos = { D: [.5, .85], B: [.25, .52], C: [.75, .52], A: [.5, .18], object: [.5, -.05] }, order = ["D", "B", "C", "A", "object"]; let k = 0, hasWho = { D: false, B: true, C: true, A: true, object: false };
    st.interval = 1000; st.tick = () => { k = (k + 1) % (order.length + 2); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const gw = st.W * .58, P = n => [20 + pos[n][0] * (gw - 40), 30 + pos[n][1] * (st.H - 70)];
      [["D", "B"], ["D", "C"], ["B", "A"], ["C", "A"]].forEach(([c, p]) => arrow(ctx, ...P(c).map((v, i) => v - (i ? 16 : 0)), ...P(p).map((v, i) => v + (i ? 18 : 0)), C.grid));
      const found = order.findIndex(n => hasWho[n]); ["D", "B", "C", "A"].forEach(n => { const i = order.indexOf(n), vis = i < k, hit = vis && i === found; const [x, y] = P(n); rr(ctx, x - 34, y - 16, 68, 32, 8, hit ? C.ok : vis ? "rgba(42,79,196,.18)" : "#fff", hit ? C.ok : C.a, 2); mono(ctx, n, x, y + 5, hit ? "#fff" : C.ink, 14, 800, "center"); if (hasWho[n]) mono(ctx, "who()", x, y + 30, C.muted, 10, 600, "center"); });
      const lx = gw + 10; mono(ctx, "D.__mro__", lx, 30, C.muted, 11, 600); order.forEach((n, i) => { const vis = i < k; rr(ctx, lx, 40 + i * 34, st.W - lx - 12, 26, 6, i === found && vis ? "rgba(21,128,61,.2)" : vis ? "#f0f2fa" : "#fff", vis ? C.a : C.grid); mono(ctx, `${i + 1}. ${n}`, lx + 10, 58 + i * 34, vis ? C.ink : C.muted, 12.5, 700); });
      st.info.innerHTML = `<span>D().who() searches D → B → C → A → object</span><span>${k > found ? "found in <b>B</b> (first in MRO that defines it)" : "searching…"}</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* try/except flow */
  A.pytry = host => {
    const st = stage(host, { label: "try / except / else / finally", h: 330, ratio: .9 });
    let err = false, k = 0; st.interval = 900; st.tick = () => { k++; if (k > 5) { k = 0; err = !err; } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const blocks = [["try:", "x = int(s)"], ["except ValueError:", "x = 0"], ["else:", "print('ok')"], ["finally:", "print('cleanup')"]], path = err ? [0, 1, 3] : [0, 2, 3], bw = Math.min(220, st.W * .5), x0 = 14, bh = (st.H - 40) / 4;
      blocks.forEach(([h, b], i) => { const step = path.indexOf(i), on = step >= 0 && step < k, skip = step < 0; rr(ctx, x0, 14 + i * bh, bw, bh - 10, 8, on ? (i === 1 ? "rgba(194,53,43,.15)" : "rgba(21,128,61,.15)") : skip ? "#f3f1eb" : "#fff", on ? (i === 1 ? C.bad : C.ok) : C.grid, on ? 2.2 : 1.2); mono(ctx, h, x0 + 10, 14 + i * bh + 18, skip ? C.muted : C.a, 12.5, 800); mono(ctx, "    " + b, x0 + 10, 14 + i * bh + 36, skip ? C.muted : C.ink, 12, 600); });
      for (let s = 1; s < Math.min(k, path.length); s++) { const a = path[s - 1], b = path[s]; arrow(ctx, x0 + bw + 6, 14 + a * bh + bh / 2 - 5, x0 + bw + 6, 14 + b * bh + bh / 2 - 5, C.b); }
      const ox = x0 + bw + 30; mono(ctx, `s = ${err ? "'abc'" : "'42'"}`, ox, 40, C.ink, 13, 800); mono(ctx, err ? "int('abc') → ValueError" : "int('42') → 42", ox, 64, err ? C.bad : C.ok, 12, 700); mono(ctx, "output:", ox, 104, C.muted, 11, 600);
      const outs = []; if (k > 1 && !err) outs.push("ok"); if (k > 2) outs.push("cleanup"); outs.forEach((o, i) => mono(ctx, o, ox, 126 + i * 20, C.ink, 13, 700));
      st.info.innerHTML = `<span>${err ? "exception path" : "success path"}</span><span class="hint">finally runs either way; else runs only on success</span>`; };
    st.controls({ step: true }); st.button("Toggle error", () => { err = !err; k = 0; st.draw(); }); st.size();
  };

  /* call stack */
  A.pystack = host => {
    const st = stage(host, { label: "Recursion and the call stack", h: 320 });
    const events = []; (function p(n) { if (n === 0) { events.push(["call", 0], ["ret", 0]); return; } events.push(["call", n], ["print", n]); p(n - 1); events.push(["print", n], ["ret", n]); })(3);
    let k = 0; st.interval = 700; st.tick = () => { k = (k + 1) % (events.length + 3); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const stack = [], out = []; events.slice(0, k).forEach(([e, n]) => { if (e === "call") stack.push(n); if (e === "ret") stack.pop(); if (e === "print") out.push(n); });
      codePanel(ctx, ["def p(n):", "    if n == 0: return", "    print(n, end=' ')", "    p(n - 1)", "    print(n, end=' ')", "p(3)"], 10, 10, Math.min(210, st.W * .48), 22, -1);
      const sx = Math.min(240, st.W * .5) + 20, fw = st.W - sx - 14, fh = 34, base = st.H - 50; mono(ctx, "call stack", sx, 22, C.muted, 11, 600);
      stack.forEach((n, i) => { const y = base - (i + 1) * (fh + 4); rr(ctx, sx, y, fw, fh, 8, i === stack.length - 1 ? "rgba(42,79,196,.18)" : "#fff", C.a, 1.5); mono(ctx, `p(n=${n})`, sx + 12, y + 22, C.ink, 13, 700); });
      mono(ctx, "output: " + out.join(" "), 12, st.H - 16, C.ok, 14, 800);
      st.info.innerHTML = `<span>depth <b>${stack.length}</b></span><span class="hint">first print on the way down, second print on the way back up</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* NumPy broadcasting */
  A.npbroadcast = host => {
    const st = stage(host, { label: "Broadcasting (3, 1) + (1, 4)", h: 300 });
    let ph = 0; st.interval = 1300; st.tick = () => { ph = (ph + 1) % 4; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const col = [0, 10, 20], row = [1, 2, 3, 4], cs = Math.min(40, (st.W - 80) / 10, (st.H - 60) / 5), y0 = 40;
      const cell = (x, y, v, fill, ghost) => { rr(ctx, x, y, cs - 4, cs - 4, 5, ghost ? "rgba(0,0,0,0)" : fill, ghost ? "#c9c4b8" : C.grid, 1.2); if (ghost) { ctx.setLineDash([3, 3]); rr(ctx, x, y, cs - 4, cs - 4, 5, null, "#b9b3a6", 1.2); ctx.setLineDash([]); } mono(ctx, String(v), x + (cs - 4) / 2, y + cs / 2 + 2, ghost ? C.muted : C.ink, Math.min(12, cs * .34), 700, "center"); };
      const ax = 14; mono(ctx, "a (3,1)", ax, y0 - 10, C.a, 11.5, 800); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) if (j === 0 || ph >= 1) cell(ax + j * cs, y0 + i * cs, col[i], "rgba(42,79,196,.15)", j > 0);
      const bx = ax + 4 * cs + 24; mono(ctx, "+", bx - 14, y0 + 1.5 * cs + 4, C.ink, 18, 800, "center"); mono(ctx, "b (1,4)", bx, y0 - 10, C.b, 11.5, 800); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) if (i === 0 || ph >= 2) cell(bx + j * cs, y0 + i * cs, row[j], "rgba(224,100,26,.15)", i > 0);
      const rx = bx + 4 * cs + 24; mono(ctx, "=", rx - 14, y0 + 1.5 * cs + 4, C.ink, 18, 800, "center"); if (ph >= 3) { mono(ctx, "result (3,4)", rx, y0 - 10, C.ok, 11.5, 800); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) cell(rx + j * cs, y0 + i * cs, col[i] + row[j], "rgba(21,128,61,.18)"); }
      const msg = ["shapes (3,1) and (1,4): trailing dims 1 vs 4, then 3 vs 1", "a's size-1 axis stretches to 4 columns (no copy)", "b's size-1 axis stretches to 3 rows", "element-wise add → (3,4)"][ph]; mono(ctx, msg, 14, st.H - 18, C.ink, 12, 700);
      st.info.innerHTML = `<span>phase <b>${ph + 1}</b>/4</span><span class="hint">dashed = virtual copies created by broadcasting</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* pandas groupby */
  A.pdgroupby = host => {
    const st = stage(host, { label: "groupby: split → apply → combine", h: 320 });
    const rows = [["a", 1], ["b", 2], ["a", 3], ["c", 5], ["b", 4], ["a", 2]], aggs = ["sum", "mean", "count", "max"]; let ag = 0, ph = 0;
    st.interval = 1300; st.tick = () => { ph = (ph + 1) % 4; if (ph === 0) ag = (ag + 1) % aggs.length; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const colr = { a: C.a, b: C.b, c: C.ok }, w3 = (st.W - 40) / 3, rh = Math.min(26, (st.H - 60) / 7);
      const table = (x, y, data, hdr) => { mono(ctx, hdr, x, y - 8, C.muted, 11, 700); data.forEach(([g, v], i) => { rr(ctx, x, y + i * rh, w3 - 20, rh - 4, 5, colr[g] + "22", colr[g], 1.2); mono(ctx, `${g}   ${v}`, x + 10, y + i * rh + rh * .62, C.ink, 12, 700); }); };
      table(10, 34, rows, "df (g, v)");
      if (ph >= 1) { let y = 34; mono(ctx, "split by g", 20 + w3, 26, C.muted, 11, 700); ["a", "b", "c"].forEach(g => { const grp = rows.filter(r => r[0] === g); grp.forEach((r, i) => { rr(ctx, 20 + w3, y + i * rh, w3 - 20, rh - 4, 5, colr[g] + "22", colr[g], 1.2); mono(ctx, `${g}   ${r[1]}`, 30 + w3, y + i * rh + rh * .62, C.ink, 12, 700); }); y += grp.length * rh + 8; }); }
      if (ph >= 2) { const res = ["a", "b", "c"].map(g => { const v = rows.filter(r => r[0] === g).map(r => r[1]); const a = aggs[ag]; return [g, a === "sum" ? v.reduce((p, q) => p + q, 0) : a === "mean" ? +(v.reduce((p, q) => p + q, 0) / v.length).toFixed(2) : a === "count" ? v.length : Math.max(...v)]; }); table(30 + 2 * w3, 34, res, `.${aggs[ag]}()`); }
      st.info.innerHTML = `<span>df.groupby('g')['v'].<b>${aggs[ag]}</b>()</span><span>${["original", "split", "apply + combine", "result indexed by g"][ph]}</span>`; };
    st.controls({ step: true }); st.size();
  };
})();
