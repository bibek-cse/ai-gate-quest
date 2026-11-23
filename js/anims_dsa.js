/* Animations for Data Structures. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const box = (ctx, x, y, w, h, fill, stroke, lw) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.strokeRect(x, y, w, h); } };
  const arrow = (ctx, x1, y1, x2, y2, col, lw) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8 * Math.cos(a - .4), y2 - 8 * Math.sin(a - .4)); ctx.lineTo(x2 - 8 * Math.cos(a + .4), y2 - 8 * Math.sin(a + .4)); ctx.fill(); };
  const circ = (ctx, x, y, rad, fill, stroke, label, tc) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } if (label !== undefined) txt(ctx, label, x, y + 4, tc || "#fff", Math.min(13, rad), "center", "700"); };

  /* two pointers */
  A.twoptr = host => {
    const st = stage(host, { label: "Two pointers: pair with a given sum", h: 260 });
    const a = [1, 3, 4, 6, 8, 11, 13, 15, 18]; let T = 21, l, r2, log, done;
    const reset = () => { l = 0; r2 = a.length - 1; log = []; done = false; }; reset();
    st.interval = 1000; st.tick = () => { if (done) return false; const s = a[l] + a[r2]; if (s === T) { done = "found"; return; } if (s < T) l++; else r2--; if (l >= r2) done = "none"; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const n = a.length, cw = Math.min(56, (st.W - 30) / n), x0 = (st.W - cw * n) / 2, y = 70;
      a.forEach((v, i) => { const on = i === l || i === r2, out = i < l || i > r2; box(ctx, x0 + i * cw + 2, y, cw - 4, 40, out ? "#efece5" : on ? (done === "found" ? "rgba(21,128,61,.25)" : "rgba(42,79,196,.15)") : "#fff", out ? "#e0ddd4" : on ? C.a : C.grid, on ? 2.5 : 1); txt(ctx, v, x0 + i * cw + cw / 2, y + 26, out ? C.muted : C.ink, 15, "center", "700"); txt(ctx, i, x0 + i * cw + cw / 2, y + 58, C.muted, 10, "center"); });
      txt(ctx, "L", x0 + l * cw + cw / 2, y - 10, C.a, 14, "center", "800"); txt(ctx, "R", x0 + r2 * cw + cw / 2, y - 10, C.b, 14, "center", "800");
      const s = a[l] + a[r2]; txt(ctx, done === "found" ? `✓ ${a[l]} + ${a[r2]} = ${T}` : done === "none" ? "no pair" : `${a[l]} + ${a[r2]} = ${s} ${s < T ? "< target → move L right" : s > T ? "> target → move R left" : ""}`, st.W / 2, y + 96, done === "found" ? C.ok : C.ink, 14, "center", "700");
      st.info.innerHTML = `<span>target <b>${T}</b></span><span>L = ${l}, R = ${r2}</span><span class="hint">grey = ruled out forever</span>`; };
    st.controls({ reset }); st.slider("target", 5, 33, 1, 21, v => { T = v; reset(); st.draw(); }); st.size();
  };

  /* linked list reversal */
  A.llreverse = host => {
    const st = stage(host, { label: "Reversing a linked list", h: 240 });
    const n = 5; let step = 0; st.interval = 1300; st.tick = () => { step++; if (step > n) step = 0; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const nw = Math.min(56, (st.W - 40) / (n + 1.2)), gap = (st.W - 40 - n * nw) / (n - 1 + 1e-9), y = 90, X = i => 20 + i * (nw + gap);
      for (let i = 0; i < n; i++) { box(ctx, X(i), y, nw, 36, i < step ? "rgba(21,128,61,.15)" : "#fff", i < step ? C.ok : C.grid, 2); txt(ctx, i + 1, X(i) + nw / 2, y + 23, C.ink, 15, "center", "700"); }
      for (let i = 0; i < n - 1; i++) { if (i + 1 < step) arrow(ctx, X(i + 1) - 2, y + 26, X(i) + nw + 2, y + 26, C.ok); else if (i >= step || i + 1 === step) { if (!(i + 1 === step)) arrow(ctx, X(i) + nw + 2, y + 12, X(i + 1) - 2, y + 12, C.muted); } }
      if (step > 0 && step < n) { const i = step - 1; /* curr was i, now prev */ }
      const prev = step - 1, curr = step;
      if (prev >= 0) txt(ctx, "prev", X(prev) + nw / 2, y - 14, C.ok, 12, "center", "800"); if (curr < n) txt(ctx, "curr", X(curr) + nw / 2, y - 14, C.a, 12, "center", "800"); if (curr + 1 < n) txt(ctx, "next", X(curr + 1) + nw / 2, y + 62, C.b, 12, "center", "800");
      txt(ctx, step === n ? "head = prev → 5→4→3→2→1" : step === 0 ? "start: prev = None, curr = head" : `flipped ${step} pointer(s)`, st.W / 2, y + 96, C.ink, 13, "center", "700");
      st.info.innerHTML = `<span>step <b>${step}</b>/${n}</span><span class="hint">green arrows already reversed; grey still original</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* postfix evaluation */
  A.stackeval = host => {
    const st = stage(host, { label: "Postfix evaluation with a stack", h: 300 });
    const toks = ["6", "2", "3", "+", "−", "3", "8", "2", "/", "+", "×"]; let k = 0, stack = [], last = "";
    const reset = () => { k = 0; stack = []; last = ""; }; reset();
    st.interval = 1000; st.tick = () => { if (k >= toks.length) { reset(); return; } const t = toks[k]; if (/\d/.test(t)) { stack.push(+t); last = `push ${t}`; } else { const b = stack.pop(), a = stack.pop(), v = t === "+" ? a + b : t === "−" ? a - b : t === "×" ? a * b : a / b; stack.push(v); last = `${a} ${t} ${b} = ${v}`; } k++; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cw = Math.min(36, (st.W - 30) / toks.length);
      toks.forEach((t, i) => { box(ctx, 14 + i * cw, 16, cw - 3, 30, i === k - 1 ? "rgba(224,100,26,.25)" : i < k ? "#efece5" : "#fff", i === k - 1 ? C.b : C.grid, 1.5); txt(ctx, t, 14 + i * cw + (cw - 3) / 2, 36, i < k - 1 ? C.muted : C.ink, 14, "center", "700"); });
      const sx = st.W / 2 - 40, base = st.H - 20, bh = 32; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, base - 5 * bh - 6); ctx.lineTo(sx, base); ctx.lineTo(sx + 80, base); ctx.lineTo(sx + 80, base - 5 * bh - 6); ctx.stroke();
      stack.forEach((v, i) => { box(ctx, sx + 6, base - (i + 1) * bh, 68, bh - 4, i === stack.length - 1 ? "rgba(42,79,196,.2)" : "#fff", C.a, 1.5); txt(ctx, v, sx + 40, base - i * bh - bh / 2 + 3, C.ink, 14, "center", "700"); });
      txt(ctx, last, sx + 100, base - bh, C.b, 14, "left", "700"); txt(ctx, "stack", sx - 8, base - 8, C.muted, 11, "right");
      st.info.innerHTML = `<span>token <b>${k}</b>/${toks.length}</span><span>${k === toks.length ? `result <b>${stack[0]}</b>` : "operator pops right operand first"}</span>`; };
    st.controls({ reset }); st.size();
  };

  /* hashing with linear probing */
  A.hashprobe = host => {
    const st = stage(host, { label: "Hash table with linear probing (m = 10)", h: 260 });
    const keys = [12, 18, 13, 2, 3, 23, 5, 15]; let k = 0, T, path;
    const reset = () => { k = 0; T = Array(10).fill(null); path = []; }; reset();
    st.interval = 1400; st.tick = () => { if (k >= keys.length) { reset(); return; } const key = keys[k]; let i = 0; path = []; while (T[(key + i) % 10] !== null) { path.push((key + i) % 10); i++; } path.push((key + i) % 10); T[(key + i) % 10] = key; k++; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cw = Math.min(58, (st.W - 30) / 10), x0 = (st.W - 10 * cw) / 2, y = 110;
      for (let i = 0; i < 10; i++) { const last = path.length && path[path.length - 1] === i, onPath = path.includes(i) && !last; box(ctx, x0 + i * cw + 2, y, cw - 4, 40, last ? "rgba(21,128,61,.25)" : onPath ? "rgba(224,100,26,.2)" : T[i] !== null ? "#f0f2fa" : "#fff", last ? C.ok : onPath ? C.b : C.grid, last || onPath ? 2.5 : 1); if (T[i] !== null) txt(ctx, T[i], x0 + i * cw + cw / 2, y + 26, C.ink, 15, "center", "700"); txt(ctx, i, x0 + i * cw + cw / 2, y + 58, C.muted, 10, "center"); }
      for (let j = 0; j + 1 < path.length; j++) { const a = path[j], b = path[j + 1]; ctx.strokeStyle = C.b; ctx.lineWidth = 2; ctx.beginPath(); const xa = x0 + a * cw + cw / 2, xb = x0 + b * cw + cw / 2; if (b > a) { ctx.moveTo(xa, y - 4); ctx.quadraticCurveTo((xa + xb) / 2, y - 26, xb, y - 4); } else { ctx.moveTo(xa, y + 44); ctx.quadraticCurveTo((xa + xb) / 2, y + 80, xb, y + 44); } ctx.stroke(); }
      const key = keys[k - 1]; txt(ctx, k ? `insert ${key}: h = ${key} mod 10 = ${key % 10}, probes = ${path.length}` : "inserting 12, 18, 13, 2, 3, 23, 5, 15", st.W / 2, 40, C.ink, 14, "center", "700");
      txt(ctx, "next: " + (keys.slice(k).join(", ") || "—"), st.W / 2, 64, C.muted, 12, "center");
      st.info.innerHTML = `<span>keys <b>${k}</b>/8</span><span>load α = <b>${(k / 10).toFixed(1)}</b></span><span class="hint">orange = occupied slots probed; green = final slot</span>`; };
    st.controls({ reset }); st.size();
  };

  /* BST insertion */
  A.bstinsert = host => {
    const st = stage(host, { label: "Inserting into a BST", h: 320 });
    const seqs = { random: [50, 30, 70, 20, 40, 60, 80, 35, 65], sorted: [10, 20, 30, 40, 50, 60, 70] }; let mode = "random", k = 0, cur = null;
    st.interval = 1100; st.tick = () => { k++; if (k > seqs[mode].length + 1) k = 0; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const keys = seqs[mode].slice(0, Math.min(k, seqs[mode].length)), pos = {}, par = {};
      keys.forEach((key, i) => { if (!i) { pos[key] = [.5, 0]; return; } let c = keys[0], lo = 0, hi = 1, d = 0; for (;;) { d++; const m = (lo + hi) / 2; const goL = key < c, ch = Object.keys(par).find(x => par[x][0] === c && par[x][1] === (goL ? "L" : "R")); if (goL) hi = m; else lo = m; if (ch === undefined) { par[key] = [c, goL ? "L" : "R"]; pos[key] = [(lo + hi) / 2, d]; break; } c = +ch; } });
      const maxD = Math.max(1, ...Object.values(pos).map(p => p[1])), dy = Math.min(52, (st.H - 50) / (maxD + .5)), X = p => 20 + p[0] * (st.W - 40), Y = p => 30 + p[1] * dy, rad = Math.min(16, dy / 2.4);
      Object.keys(par).forEach(c => { const p = pos[c], q = pos[par[c][0]]; ctx.strokeStyle = C.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(q), Y(q)); ctx.lineTo(X(p), Y(p)); ctx.stroke(); });
      const last = keys[keys.length - 1]; keys.forEach(key => circ(ctx, X(pos[key]), Y(pos[key]), rad, key === last && k <= seqs[mode].length ? C.b : C.a, null, key));
      st.info.innerHTML = `<span>${mode} order: ${seqs[mode].join(", ")}</span><span>height <b>${keys.length ? maxD : 0}</b></span><span class="hint">${mode === "sorted" ? "sorted input → a chain (height n − 1)" : "orange = newest key"}</span>`; };
    st.controls({ step: true }); st.button("Toggle sorted input", () => { mode = mode === "random" ? "sorted" : "random"; k = 0; st.draw(); }); st.size();
  };

  /* heapify */
  A.heapify = host => {
    const st = stage(host, { label: "Bottom-up build-heap (max-heap)", h: 320 });
    const init = [3, 9, 2, 1, 4, 5, 8, 7, 6, 10]; let a, steps, k;
    const plan = () => { const b = init.slice(), s = [{ a: b.slice(), hi: [], note: "start" }]; const n = b.length; for (let i = (n >> 1) - 1; i >= 0; i--) { let j = i; for (;;) { const l = 2 * j + 1, r2 = l + 1; let m = j; if (l < n && b[l] > b[m]) m = l; if (r2 < n && b[r2] > b[m]) m = r2; s.push({ a: b.slice(), hi: [j, l, r2].filter(x => x < n), note: `sift-down at index ${j + 1}` }); if (m === j) break; [b[m], b[j]] = [b[j], b[m]]; s.push({ a: b.slice(), hi: [j, m], note: `swap ${b[m]} ↔ ${b[j]}`, sw: true }); j = m; } } s.push({ a: b.slice(), hi: [], note: "max-heap built" }); return s; };
    const reset = () => { steps = plan(); k = 0; }; reset();
    st.interval = 900; st.tick = () => { k++; if (k >= steps.length) { k = 0; } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = steps[k], b = S.a, n = b.length, levels = 4, dy = (st.H - 90) / levels, rad = Math.min(16, dy / 2.6);
      const P = i => { const d = Math.floor(Math.log2(i + 1)), idx = i - (2 ** d - 1), cnt = 2 ** d; return [20 + (idx + .5) / cnt * (st.W - 40), 24 + d * dy]; };
      for (let i = 1; i < n; i++) { const p = P(i), q = P((i - 1) >> 1); ctx.strokeStyle = C.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...q); ctx.lineTo(...p); ctx.stroke(); }
      for (let i = 0; i < n; i++) circ(ctx, ...P(i), rad, S.hi.includes(i) ? (S.sw ? C.b : "#a0306a") : C.a, null, b[i]);
      const cw = Math.min(34, (st.W - 30) / n), ay = st.H - 50; b.forEach((v, i) => { box(ctx, 14 + i * cw, ay, cw - 3, 26, S.hi.includes(i) ? "rgba(224,100,26,.2)" : "#fff", C.grid, 1); txt(ctx, v, 14 + i * cw + (cw - 3) / 2, ay + 18, C.ink, 12, "center", "700"); txt(ctx, i + 1, 14 + i * cw + (cw - 3) / 2, ay + 38, C.muted, 9, "center"); });
      st.info.innerHTML = `<span>step <b>${k}</b>/${steps.length - 1}</span><span>${S.note}</span><span class="hint">array view below the tree (1-based indices)</span>`; };
    st.controls({ reset }); st.size();
  };

  /* adjacency representations */
  A.adjrep = host => {
    const st = stage(host, { label: "Adjacency matrix vs adjacency list", h: 300 });
    const V = 5, E = [[0, 1], [0, 2], [1, 2], [1, 3], [3, 4], [2, 4]], pos = [[.5, .1], [.15, .45], [.8, .45], [.25, .9], [.75, .9]]; let u = 0;
    st.interval = 1500; st.tick = () => { u = (u + 1) % V; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const gw = st.W * .24, gh = st.H - 40, P = i => [14 + pos[i][0] * gw, 20 + pos[i][1] * gh];
      const nb = v => E.filter(e => e.includes(v)).map(e => e[0] === v ? e[1] : e[0]).sort();
      E.forEach(([a, b]) => { const hot = a === u || b === u; ctx.strokeStyle = hot ? C.b : C.grid; ctx.lineWidth = hot ? 3 : 2; ctx.beginPath(); ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); ctx.stroke(); });
      for (let i = 0; i < V; i++) circ(ctx, ...P(i), 13, i === u ? C.b : nb(u).includes(i) ? "#a0306a" : C.a, null, i);
      const mx = 14 + gw + 26, cs = Math.min(26, (st.W * .36) / (V + 1), (st.H - 40) / (V + 1)); txt(ctx, "matrix", mx, 14, C.ink, 11, "left", "700");
      for (let i = 0; i < V; i++) { txt(ctx, i, mx + (i + 1) * cs + cs / 2, 30, C.muted, 10, "center"); txt(ctx, i, mx + cs / 2, 26 + (i + 1) * cs + 4, i === u ? C.b : C.muted, 10, "center", i === u ? "800" : "400");
        for (let j = 0; j < V; j++) { const on = E.some(([a, b]) => (a === i && b === j) || (a === j && b === i)); box(ctx, mx + (j + 1) * cs, 20 + (i + 1) * cs - 10, cs - 2, cs - 2, i === u ? (on ? C.b : "rgba(224,100,26,.12)") : on ? "rgba(42,79,196,.5)" : "#f3f1eb"); txt(ctx, on ? 1 : 0, mx + (j + 1) * cs + cs / 2 - 1, 20 + (i + 1) * cs + cs / 2 - 8, on ? "#fff" : C.muted, 10, "center", "700"); } }
      const lx = mx + (V + 1) * cs + 14; txt(ctx, "lists", lx, 14, C.ink, 11, "left", "700");
      for (let i = 0; i < V; i++) txt(ctx, `${i}: ${nb(i).join(",")}`, lx, 34 + i * 22, i === u ? C.b : C.ink, 11.5, "left", i === u ? "800" : "500");
      st.info.innerHTML = `<span>vertex <b>${u}</b> neighbours: ${nb(u).join(", ")}</span><span>matrix cells V² = <b>${V * V}</b></span><span>list entries 2E = <b>${2 * E.length}</b></span>`; };
    st.controls({ step: true }); st.size();
  };

  /* trie building */
  A.trie = host => {
    const st = stage(host, { label: "Building a trie", h: 320 });
    const words = ["tea", "ten", "to", "inn", "in", "i"]; let k = 0; st.interval = 1500; st.tick = () => { k = (k + 1) % (words.length + 2); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const ws = words.slice(0, Math.min(k, words.length)), nodes = { "": { d: 0, end: false } };
      ws.forEach(w => { for (let i = 1; i <= w.length; i++) { const p = w.slice(0, i); if (!nodes[p]) nodes[p] = { d: i, end: false }; } nodes[w].end = true; });
      const curW = k > 0 && k <= words.length ? words[k - 1] : null, prevNodes = new Set(); words.slice(0, Math.max(0, k - 1)).forEach(w => { for (let i = 0; i <= w.length; i++) prevNodes.add(w.slice(0, i)); });
      const keys = Object.keys(nodes).sort(), leafOrder = keys.filter(p => !keys.some(q => q.length === p.length + 1 && q.startsWith(p))); const X = {};
      leafOrder.forEach((p, i) => X[p] = (i + .5) / leafOrder.length); keys.sort((a, b) => b.length - a.length).forEach(p => { if (X[p] === undefined) { const ch = keys.filter(q => q.length === p.length + 1 && q.startsWith(p)); X[p] = ch.reduce((s, q) => s + X[q], 0) / ch.length; } });
      const dy = Math.min(62, (st.H - 50) / 3.4), P = p => [20 + X[p] * (st.W - 40), 26 + nodes[p].d * dy];
      Object.keys(nodes).forEach(p => { if (!p) return; const q = p.slice(0, -1), a = P(q), b = P(p); ctx.strokeStyle = C.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); txt(ctx, p[p.length - 1], (a[0] + b[0]) / 2 - 8, (a[1] + b[1]) / 2 + 4, C.b, 13, "center", "800"); });
      Object.keys(nodes).forEach(p => { const [x, y] = P(p), isNew = curW && curW.startsWith(p) && !prevNodes.has(p), onPath = curW && curW.startsWith(p); circ(ctx, x, y, 10, isNew ? C.a : onPath ? C.muted : "#cfd6ea", null); if (nodes[p].end) { ctx.strokeStyle = C.ok; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.stroke(); } });
      st.info.innerHTML = `<span>words: <b>${ws.join(", ") || "—"}</b></span><span>nodes (incl. root) <b>${Object.keys(nodes).length}</b></span><span class="hint">blue = new node, grey = reused prefix, green ring = end of word</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* union-find */
  A.unionfind = host => {
    const st = stage(host, { label: "Union by size + path compression", h: 300 });
    const n = 8; let par, size, k, note, hi;
    const ops = [["u", 0, 1], ["u", 2, 3], ["u", 4, 5], ["u", 6, 7], ["u", 0, 2], ["u", 4, 6], ["u", 0, 4], ["f", 7], ["f", 3]];
    const find0 = x => { while (par[x] !== x) x = par[x]; return x; };
    const reset = () => { par = [...Array(n).keys()]; size = Array(n).fill(1); k = 0; note = "8 singleton sets"; hi = []; }; reset();
    st.interval = 1500; st.tick = () => { if (k >= ops.length) { reset(); return; } const o = ops[k++]; if (o[0] === "u") { let a = find0(o[1]), b = find0(o[2]); if (size[a] < size[b]) [a, b] = [b, a]; par[b] = a; size[a] += size[b]; note = `union(${o[1]}, ${o[2]}): root ${b} under ${a}`; hi = [a, b]; } else { const path = []; let x = o[1]; while (par[x] !== x) { path.push(x); x = par[x]; } path.forEach(p => par[p] = x); note = `find(${o[1]}) → root ${x}; compressed ${path.length} node(s)`; hi = path.concat([x]); } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const depth = x => { let d = 0; while (par[x] !== x) { x = par[x]; d++; } return d; };
      const roots = [...Array(n).keys()].filter(x => par[x] === x), kids = x => [...Array(n).keys()].filter(y => par[y] === x && y !== x), wid = {}, W = x => wid[x] = Math.max(1, kids(x).reduce((s, c) => s + W(c), 0));
      roots.forEach(W); const tot = roots.reduce((s, r2) => s + wid[r2], 0), P = {}; let off = 0; const dy = Math.min(60, (st.H - 50) / 4);
      const place = (x, l, d) => { P[x] = [20 + (l + wid[x] / 2) / tot * (st.W - 40), 30 + d * dy]; let c0 = l; kids(x).forEach(c => { place(c, c0, d + 1); c0 += wid[c]; }); }; roots.forEach(r2 => { place(r2, off, 0); off += wid[r2]; });
      for (let x = 0; x < n; x++) if (par[x] !== x) { ctx.strokeStyle = C.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...P[x]); ctx.lineTo(...P[par[x]]); ctx.stroke(); }
      for (let x = 0; x < n; x++) circ(ctx, ...P[x], 14, hi.includes(x) ? C.b : par[x] === x ? C.ink : C.a, null, x);
      txt(ctx, note, st.W / 2, st.H - 10, C.ink, 12.5, "center", "700");
      st.info.innerHTML = `<span>op <b>${k}</b>/${ops.length}</span><span>sets <b>${roots.length}</b></span><span>max depth <b>${Math.max(...[...Array(n).keys()].map(depth))}</b></span><span class="hint">dark = root</span>`; };
    st.controls({ reset }); st.size();
  };

  /* Fenwick */
  A.fenwick = host => {
    const st = stage(host, { label: "Fenwick tree: ranges, queries and updates", h: 300 });
    const n = 16; let qi = 13, mode = 0, t = 0; st.interval = 1400; st.tick = () => { t++; mode = t % 2; if (mode === 0) qi = [13, 11, 7, 15, 6][Math.floor(t / 2) % 5]; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cw = (st.W - 30) / n, x0 = 15, rowH = Math.min(16, (st.H - 90) / 5.5);
      const path = []; let x = qi; if (mode === 0) { while (x > 0) { path.push(x); x -= x & -x; } } else { while (x <= n) { path.push(x); x += x & -x; } }
      for (let i = 1; i <= n; i++) { const lb = i & -i, lvl = Math.log2(lb), y = st.H - 50 - lvl * (rowH + 6), on = path.includes(i); box(ctx, x0 + (i - lb) * cw + 1, y, lb * cw - 2, rowH, on ? (mode ? "rgba(224,100,26,.35)" : "rgba(42,79,196,.35)") : "#f3f1eb", on ? (mode ? C.b : C.a) : C.grid, on ? 2 : 1); txt(ctx, "T" + i, x0 + (i - .5) * cw, y + rowH - 3, on ? C.ink : C.muted, 9.5, "center", on ? "800" : "500"); }
      for (let i = 1; i <= n; i++) txt(ctx, i, x0 + (i - .5) * cw, st.H - 22, i === qi ? C.ink : C.muted, 10, "center", i === qi ? "800" : "400");
      txt(ctx, mode === 0 ? `prefix query(${qi}): ${path.join(" + ")}  (i −= i & −i)` : `point update(${qi}): ${path.join(" → ")}  (i += i & −i)`, x0, 18, mode ? C.b : C.a, 13, "left", "800");
      st.info.innerHTML = `<span>${mode ? "update" : "query"} at i = <b>${qi}</b> (${qi.toString(2)}₂)</span><span>cells touched <b>${path.length}</b></span><span class="hint">bar width = range covered by T[i] = lowbit(i)</span>`; };
    st.controls({ step: true }); st.size();
  };
})();
