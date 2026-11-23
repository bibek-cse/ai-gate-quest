/* Animations for Algorithms. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const box = (ctx, x, y, w, h, fill, stroke, lw) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.strokeRect(x, y, w, h); } };
  const circ = (ctx, x, y, rad, fill, stroke, label, tc) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } if (label !== undefined) txt(ctx, label, x, y + 4, tc || "#fff", Math.min(13, rad), "center", "700"); };

  /* recursion tree */
  A.rectree = host => {
    const st = stage(host, { label: "Recursion tree of T(n) = aT(n/b) + f(n)", h: 330 });
    let a = 2, b = 2, fe = 1; const N = 64;
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const L = Math.round(Math.log(N) / Math.log(b)), crit = Math.log(a) / Math.log(b), rows = [];
      for (let d = 0; d <= L; d++) { const cnt = a ** d, size = N / b ** d, work = cnt * size ** fe; rows.push([cnt, size, work]); }
      const mx = Math.max(...rows.map(r => r[2])), rh = (st.H - 40) / (L + 1), bx = st.W * .42, bw = st.W - bx - 16;
      rows.forEach(([cnt, size, work], d) => { const y = 16 + d * rh, show = Math.min(cnt, 32), dw = (bx - 30) / show;
        for (let i = 0; i < show; i++) dot(ctx, 14 + (i + .5) * dw, y + rh / 2, Math.max(2, Math.min(8, dw / 2.5)), C.a);
        if (cnt > show) txt(ctx, "…", bx - 12, y + rh / 2 + 4, C.muted, 12, "center");
        ctx.fillStyle = "rgba(224,100,26,.75)"; ctx.fillRect(bx, y + rh * .2, Math.max(2, bw * work / mx), rh * .6); txt(ctx, `${cnt}×(${size % 1 ? size.toFixed(1) : size})^${fe} = ${Math.round(work)}`, bx + 4, y + rh / 2 + 4, C.ink, 10.5, "left", "600"); });
      const cs = Math.abs(fe - crit) < 1e-9 ? 2 : fe < crit ? 1 : 3, res = cs === 1 ? `Θ(n^${crit.toFixed(2)})` : cs === 2 ? `Θ(n^${crit.toFixed(2)} log n)` : `Θ(n^${fe})`;
      st.info.innerHTML = `<span>a = <b>${a}</b>, b = <b>${b}</b>, f = n^<b>${fe}</b></span><span>log_b a = <b>${crit.toFixed(2)}</b></span><span>case ${cs}: <b>${res}</b></span><span class="hint">orange bar = work at that level</span>`; };
    st.controls({ step: false }); st.slider("a", 1, 8, 1, 2, v => { a = v; st.draw(); }); st.slider("b", 2, 4, 1, 2, v => { b = v; st.draw(); }); st.slider("f = n^k, k", 0, 3, 1, 1, v => { fe = v; st.draw(); }); st.size();
  };

  /* sorting race */
  A.sortrace = host => {
    const st = stage(host, { label: "Sorting race: comparisons", h: 330 });
    const n = 40; let mode = "random", runs, t;
    const gen = () => { const r = R(mode === "random" ? 5 : 9); let a = Array.from({ length: n }, (_, i) => i + 1); if (mode === "random") { for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } } else { for (let k = 0; k < 3; k++) { const i = Math.floor(r() * (n - 1)); [a[i], a[i + 1]] = [a[i + 1], a[i]]; } } return a; };
    const record = (a, fn) => { const frames = [], arr = a.slice(); let c = 0; fn(arr, () => c++, () => frames.push([arr.slice(), c])); frames.push([arr.slice(), c]); return frames; };
    const ins = (a, cmp, snap) => { for (let i = 1; i < a.length; i++) { let j = i; while (j > 0) { cmp(); if (a[j - 1] > a[j]) { [a[j - 1], a[j]] = [a[j], a[j - 1]]; j--; } else break; } snap(); } };
    const mer = (a, cmp, snap) => { for (let w = 1; w < a.length; w *= 2) { for (let l = 0; l < a.length; l += 2 * w) { const m = Math.min(l + w, a.length), r2 = Math.min(l + 2 * w, a.length), L = a.slice(l, m), Rr = a.slice(m, r2); let i = 0, j = 0, k = l; while (i < L.length && j < Rr.length) { cmp(); a[k++] = L[i] <= Rr[j] ? L[i++] : Rr[j++]; } while (i < L.length) a[k++] = L[i++]; while (j < Rr.length) a[k++] = Rr[j++]; snap(); } } };
    const qs = (a, cmp, snap) => { const go = (lo, hi) => { if (lo >= hi) return; const p = a[hi]; let i = lo; for (let j = lo; j < hi; j++) { cmp(); if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; i++; } } [a[i], a[hi]] = [a[hi], a[i]]; snap(); go(lo, i - 1); go(i + 1, hi); }; go(0, a.length - 1); };
    const reset = () => { const a = gen(); runs = [["insertion", record(a, ins)], ["merge", record(a, mer)], ["quick (last pivot)", record(a, qs)]]; t = 0; }; reset();
    st.interval = 60; st.tick = () => { t++; if (runs.every(([, f]) => t >= f.length + 10)) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const ph = (st.H - 20) / 3;
      runs.forEach(([nm, fr], k) => { const [arr, c] = fr[Math.min(t, fr.length - 1)], y0 = 8 + k * ph, bw = (st.W * .62) / n, done = t >= fr.length - 1;
        arr.forEach((v, i) => { ctx.fillStyle = done ? C.ok : [C.a, C.b, "#a0306a"][k]; ctx.fillRect(10 + i * bw, y0 + ph - 10 - v / n * (ph - 22), bw - 1, v / n * (ph - 22)); });
        txt(ctx, nm, st.W * .62 + 22, y0 + 18, C.ink, 12, "left", "700"); txt(ctx, `${c} comparisons${done ? " ✓" : ""}`, st.W * .62 + 22, y0 + 36, done ? C.ok : C.muted, 11.5, "left", "600"); });
      st.info.innerHTML = `<span>n = <b>${n}</b>, input <b>${mode}</b></span><span class="hint">n log₂ n ≈ ${Math.round(n * Math.log2(n))}, n²/4 = ${n * n / 4}</span>`; };
    st.controls({ reset }); st.button("Toggle nearly-sorted input", () => { mode = mode === "random" ? "nearly sorted" : "random"; reset(); st.draw(); }); st.size();
  };

  /* binary search */
  A.bsearch = host => {
    const st = stage(host, { label: "Binary search", h: 250 });
    const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 99, 105, 120, 133, 150]; let x = 23, steps, k;
    const plan = () => { const s = []; let lo = 0, hi = a.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; s.push([lo, hi, m]); if (a[m] === x) break; if (a[m] < x) lo = m + 1; else hi = m - 1; } return s; };
    const reset = () => { steps = plan(); k = 0; }; reset();
    st.interval = 1200; st.tick = () => { k++; if (k > steps.length + 1) k = 0; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const n = a.length, cw = Math.min(46, (st.W - 20) / n), x0 = (st.W - cw * n) / 2, y = 80, s = steps[Math.min(k, steps.length) - 1];
      a.forEach((v, i) => { const inR = s ? i >= s[0] && i <= s[1] : true, isM = s && i === s[2]; box(ctx, x0 + i * cw + 1, y, cw - 2, 38, isM ? (a[i] === x ? "rgba(21,128,61,.3)" : "rgba(224,100,26,.3)") : inR ? "#fff" : "#efece5", isM ? (a[i] === x ? C.ok : C.b) : inR ? C.a : "#e0ddd4", isM ? 2.5 : 1); txt(ctx, v, x0 + i * cw + cw / 2, y + 24, inR ? C.ink : C.muted, Math.min(13, cw * .38), "center", "700"); txt(ctx, i, x0 + i * cw + cw / 2, y + 54, C.muted, 9.5, "center"); });
      if (s) { txt(ctx, "lo", x0 + s[0] * cw + cw / 2, y - 22, C.a, 11, "center", "800"); txt(ctx, "hi", x0 + s[1] * cw + cw / 2, y - 8, C.a, 11, "center", "800"); }
      const msg = !s ? `search for ${x}` : a[s[2]] === x ? `A[${s[2]}] = ${x} found in ${steps.length} comparison(s)` : `A[${s[2]}] = ${a[s[2]]} ${a[s[2]] < x ? "< " + x + " → go right" : "> " + x + " → go left"}`;
      txt(ctx, msg, st.W / 2, 30, C.ink, 14, "center", "700");
      st.info.innerHTML = `<span>target <b>${x}</b></span><span>comparisons <b>${steps.length}</b> (max ⌈log₂ 16⌉ = 4)</span>`; };
    st.controls({ reset }); st.slider("target index", 0, 14, 1, 5, v => { x = a[v]; reset(); st.draw(); }); st.size();
  };

  /* merge sort levels */
  A.mergesort = host => {
    const st = stage(host, { label: "Merge sort, level by level", h: 300 });
    const init = [38, 27, 43, 3, 9, 82, 10, 19]; let lvl = 0; st.interval = 1300; st.tick = () => { lvl = (lvl + 1) % 8; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const n = init.length, rows = [];
      for (let w = n; w >= 1; w /= 2) { const r2 = []; for (let i = 0; i < n; i += w) r2.push(init.slice(i, i + w)); rows.push(r2); }
      const up = []; for (let w = 1; w <= n; w *= 2) { const r2 = []; for (let i = 0; i < n; i += w) r2.push(init.slice(i, i + w).sort((p, q) => p - q)); up.push(r2); }
      const all = rows.concat(up.slice(1)), show = Math.min(lvl, all.length - 1), rh = Math.min(38, (st.H - 20) / all.length), cw = Math.min(34, (st.W - 60) / (n + 3));
      for (let l = 0; l <= show; l++) { const groups = all[l], y = 10 + l * rh; let x = (st.W - (n * cw + (groups.length - 1) * 10)) / 2; groups.forEach(g => { g.forEach(v => { box(ctx, x, y, cw - 2, rh - 8, l >= rows.length ? "rgba(21,128,61,.18)" : "rgba(42,79,196,.12)", l === show ? C.b : C.grid, 1.2); txt(ctx, v, x + (cw - 2) / 2, y + (rh - 8) / 2 + 4, C.ink, 11, "center", "700"); x += cw; }); x += 10; }); }
      st.info.innerHTML = `<span>${show < rows.length ? "splitting" : "merging"}: level <b>${show}</b></span><span>levels log₂ 8 = <b>3</b> each way</span><span class="hint">blue = split, green = merged (sorted) runs</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* activity selection */
  A.activity = host => {
    const st = stage(host, { label: "Activity selection by earliest finish", h: 320 });
    const acts = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]].sort((a, b) => a[1] - b[1]); let k = 0;
    st.interval = 900; st.tick = () => { k = (k + 1) % (acts.length + 3); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 30, X = t => pad + t / 16 * (st.W - pad - 14), rh = (st.H - 40) / acts.length; let last = -1, cnt = 0;
      for (let t = 0; t <= 16; t += 2) { ctx.strokeStyle = "#eeebe3"; ctx.beginPath(); ctx.moveTo(X(t), 8); ctx.lineTo(X(t), st.H - 24); ctx.stroke(); txt(ctx, t, X(t), st.H - 10, C.muted, 10, "center"); }
      acts.forEach(([s, f], i) => { const y = 10 + i * rh; let col = "#ece9e2", st2 = "#d8d4ca"; if (i < k) { if (s >= last) { col = "rgba(21,128,61,.6)"; st2 = C.ok; last = f; cnt++; } else { col = "rgba(194,53,43,.15)"; st2 = "rgba(194,53,43,.4)"; } } else if (i === k) { col = "rgba(224,100,26,.35)"; st2 = C.b; } box(ctx, X(s), y + 2, X(f) - X(s), rh - 5, col, st2, 1.2); txt(ctx, `(${s},${f})`, X(s) - 3, y + rh / 2 + 3, C.muted, 9.5, "right"); });
      if (last >= 0) { ctx.strokeStyle = C.ok; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(last), 8); ctx.lineTo(X(last), st.H - 24); ctx.stroke(); ctx.setLineDash([]); }
      st.info.innerHTML = `<span>examined <b>${Math.min(k, acts.length)}</b>/${acts.length}</span><span>selected <b>${cnt}</b></span><span class="hint">sorted by finish time; dashed line = last finish</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* LCS table */
  A.lcs = host => {
    const st = stage(host, { label: "Filling the LCS table", h: 330, ratio: .95 });
    const X = "ABCBDAB", Y = "BDCABA", m = X.length, n = Y.length, L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) L[i][j] = X[i - 1] === Y[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
    let k = 0; const tot = m * n; st.interval = 160; st.tick = () => { k++; if (k > tot + 25) k = 0; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cs = Math.min((st.W - 30) / (n + 2), (st.H - 40) / (m + 2)), x0 = (st.W - cs * (n + 2)) / 2, y0 = 10;
      for (let j = 0; j < n; j++) txt(ctx, Y[j], x0 + (j + 2.5) * cs, y0 + cs * .65, C.b, 13, "center", "800"); for (let i = 0; i < m; i++) txt(ctx, X[i], x0 + cs * .5, y0 + (i + 2.65) * cs, C.a, 13, "center", "800");
      const path = new Set(); if (k >= tot) { let i = m, j = n; while (i > 0 && j > 0) { if (X[i - 1] === Y[j - 1]) { path.add(i + "," + j); i--; j--; } else if (L[i - 1][j] >= L[i][j - 1]) i--; else j--; } }
      for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) { const idx = (i - 1) * n + (j - 1), filled = i === 0 || j === 0 || idx < k, cur = idx === k - 1 && i > 0 && j > 0, match = i > 0 && j > 0 && X[i - 1] === Y[j - 1];
        box(ctx, x0 + (j + 1) * cs, y0 + (i + 1) * cs, cs - 2, cs - 2, path.has(i + "," + j) ? "rgba(21,128,61,.45)" : cur ? "rgba(224,100,26,.4)" : filled && match ? "rgba(21,128,61,.15)" : filled ? "#fff" : "#f3f1eb", cur ? C.b : C.grid, cur ? 2 : 1);
        if (filled) txt(ctx, L[i][j], x0 + (j + 1.5) * cs - 1, y0 + (i + 1.5) * cs + 3, C.ink, Math.min(13, cs * .45), "center", "700"); }
      st.info.innerHTML = `<span>X = <b>${X}</b>, Y = <b>${Y}</b></span><span>${k >= tot ? `LCS length <b>${L[m][n]}</b> (traceback in green)` : "match → diagonal + 1, else max(up, left)"}</span>`; };
    st.controls({ reset: () => { k = 0; } }); st.size();
  };

  /* BFS layers */
  A.bfs = host => {
    const st = stage(host, { label: "Breadth-first search layers", h: 320 });
    const P = [[.08, .5], [.28, .2], [.28, .8], [.5, .1], [.5, .45], [.5, .85], [.72, .3], [.72, .7], [.92, .5]], E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [7, 8]];
    const n = P.length, adj = Array.from({ length: n }, () => []); E.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    const dist = Array(n).fill(-1), par = Array(n).fill(-1), order = []; dist[0] = 0; const q = [0]; while (q.length) { const u = q.shift(); order.push(u); adj[u].forEach(v => { if (dist[v] < 0) { dist[v] = dist[u] + 1; par[v] = u; q.push(v); } }); }
    let k = 0; st.interval = 800; st.tick = () => { k = (k + 1) % (n + 3); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const Q = i => [20 + P[i][0] * (st.W - 40), 16 + P[i][1] * (st.H - 40)], seen = new Set(order.slice(0, k));
      E.forEach(([a, b]) => { const tree = (par[b] === a || par[a] === b) && seen.has(a) && seen.has(b); ctx.strokeStyle = tree ? C.b : C.grid; ctx.lineWidth = tree ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(...Q(a)); ctx.lineTo(...Q(b)); ctx.stroke(); });
      for (let i = 0; i < n; i++) { const s = seen.has(i), col = s ? ["#1c2a52", C.a, "#0f6e7a", C.ok, C.b][dist[i]] : "#d9d5cc"; circ(ctx, ...Q(i), 15, col, i === order[k - 1] ? C.ink : null, s ? dist[i] : "", "#fff"); txt(ctx, String.fromCharCode(65 + i), Q(i)[0], Q(i)[1] - 20, C.muted, 10, "center", "700"); }
      const qState = order.slice(k).filter(v => order.slice(0, k).some(u => adj[u].includes(v)));
      st.info.innerHTML = `<span>visited <b>${Math.min(k, n)}</b>/${n}</span><span>queue: ${qState.map(v => String.fromCharCode(65 + v)).join(" ") || "—"}</span><span class="hint">numbers = distance from A; orange = BFS tree</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* Dijkstra */
  A.dijkstra = host => {
    const st = stage(host, { label: "Dijkstra's algorithm", h: 300 });
    const names = ["S", "A", "B", "C", "D"], P = [[.08, .5], [.45, .15], [.45, .85], [.85, .3], [.85, .8]], E = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [2, 4, 7], [3, 4, 2]];
    let steps, k;
    const plan = () => { const n = 5, d = [0, 1e9, 1e9, 1e9, 1e9], done = Array(n).fill(false), s = [{ d: d.slice(), done: done.slice(), u: -1, relax: [] }]; for (let it = 0; it < n; it++) { let u = -1; for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || d[i] < d[u])) u = i; done[u] = true; const rl = []; E.forEach(([a, b, w]) => { if (a === u && d[u] + w < d[b]) { d[b] = d[u] + w; rl.push([a, b]); } }); s.push({ d: d.slice(), done: done.slice(), u, relax: rl }); } return s; };
    const reset = () => { steps = plan(); k = 0; }; reset();
    st.interval = 1500; st.tick = () => { k = (k + 1) % (steps.length + 1); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = steps[Math.min(k, steps.length - 1)], Q = i => [26 + P[i][0] * (st.W - 52), 20 + P[i][1] * (st.H - 50)];
      E.forEach(([a, b, w]) => { const hot = S.relax.some(e => e[0] === a && e[1] === b), p = Q(a), q = Q(b), ang = Math.atan2(q[1] - p[1], q[0] - p[0]), ex = q[0] - 19 * Math.cos(ang), ey = q[1] - 19 * Math.sin(ang); ctx.strokeStyle = hot ? C.b : C.grid; ctx.fillStyle = hot ? C.b : C.grid; ctx.lineWidth = hot ? 3 : 2; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(ex, ey); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 9 * Math.cos(ang - .4), ey - 9 * Math.sin(ang - .4)); ctx.lineTo(ex - 9 * Math.cos(ang + .4), ey - 9 * Math.sin(ang + .4)); ctx.fill(); txt(ctx, w, (p[0] + q[0]) / 2 + 6, (p[1] + q[1]) / 2 - 6, hot ? C.b : C.muted, 12, "center", "800"); });
      names.forEach((nm, i) => { const [x, y] = Q(i), dd = S.d[i]; circ(ctx, x, y, 17, S.done[i] ? C.ink : "#fff", S.u === i ? C.b : C.a, nm, S.done[i] ? "#fff" : C.ink); txt(ctx, "d=" + (dd >= 1e9 ? "∞" : dd), x + 20, y - 16, C.a, 12, "left", "800"); });
      st.info.innerHTML = `<span>step <b>${k}</b></span><span>${S.u >= 0 ? `finalised <b>${names[S.u]}</b> (d = ${S.d[S.u]})` : "start: d(S) = 0"}</span><span class="hint">dark = final; orange = edges relaxed this step</span>`; };
    st.controls({ reset }); st.size();
  };

  /* Kruskal */
  A.kruskal = host => {
    const st = stage(host, { label: "Kruskal's algorithm", h: 300 });
    const names = "ABCDE", P = [[.1, .25], [.45, .1], [.4, .65], [.75, .45], [.9, .9]], E = [[0, 1, 4], [0, 2, 3], [1, 2, 1], [1, 3, 2], [2, 3, 4], [3, 4, 2], [2, 4, 5]].sort((a, b) => a[2] - b[2]);
    let k = 0; st.interval = 1300; st.tick = () => { k = (k + 1) % (E.length + 3); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const par = [0, 1, 2, 3, 4], f = x => { while (par[x] !== x) x = par[x]; return x; }, status = []; let tot = 0;
      E.forEach(([a, b, w], i) => { if (i >= k) { status.push("todo"); return; } const ra = f(a), rb = f(b); if (ra !== rb) { par[ra] = rb; status.push("ok"); tot += w; } else status.push("no"); });
      const Q = i => [24 + P[i][0] * (st.W * .62 - 30), 20 + P[i][1] * (st.H - 46)];
      E.forEach(([a, b, w], i) => { const s = status[i]; ctx.strokeStyle = s === "ok" ? C.ok : s === "no" ? "rgba(194,53,43,.5)" : i === k ? C.b : C.grid; ctx.lineWidth = s === "ok" ? 4 : i === k ? 3 : 1.8; ctx.setLineDash(s === "no" ? [5, 4] : []); ctx.beginPath(); ctx.moveTo(...Q(a)); ctx.lineTo(...Q(b)); ctx.stroke(); ctx.setLineDash([]); const p = Q(a), q = Q(b); txt(ctx, w, (p[0] + q[0]) / 2 + 7, (p[1] + q[1]) / 2 - 5, C.ink, 12, "center", "800"); });
      const comp = [0, 1, 2, 3, 4].map(f), cols = {}; let ci = 0; comp.forEach(c => { if (cols[c] === undefined) cols[c] = [C.a, C.b, "#a0306a", "#0f6e7a", "#8a5a00"][ci++]; });
      for (let i = 0; i < 5; i++) circ(ctx, ...Q(i), 15, cols[comp[i]], null, names[i]);
      const lx = st.W * .66; txt(ctx, "edges by weight", lx, 18, C.ink, 11.5, "left", "700"); E.forEach(([a, b, w], i) => { const s = status[i]; txt(ctx, `${names[a]}${names[b]} ${w} ${s === "ok" ? "✓" : s === "no" ? "✗ cycle" : i === k ? "←" : ""}`, lx, 38 + i * 19, s === "ok" ? C.ok : s === "no" ? C.bad : C.ink, 12, "left", i === k ? "800" : "600"); });
      st.info.innerHTML = `<span>accepted <b>${status.filter(s => s === "ok").length}</b>/4</span><span>weight <b>${tot}</b></span><span class="hint">node colour = component</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* growth chart */
  A.growth = host => {
    const st = stage(host, { label: "Polynomial vs exponential time", h: 320 });
    let speed = 9; const fns = [["n²", n => 2 * Math.log10(n), C.ok], ["n³", n => 3 * Math.log10(n), C.a], ["2ⁿ", n => n * Math.log10(2), C.b], ["n!", n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log10(i); return s; }, C.bad]];
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 44, nmax = 100, ymax = 30, X = n => pad + n / nmax * (st.W - pad - 14), Y = l => 10 + (1 - Math.min(l, ymax) / ymax) * (st.H - 40);
      [0, 5, 10, 15, 20, 25, 30].forEach(l => { ctx.strokeStyle = "#eeebe3"; ctx.beginPath(); ctx.moveTo(pad, Y(l)); ctx.lineTo(st.W - 14, Y(l)); ctx.stroke(); txt(ctx, "1e" + l, pad - 4, Y(l) + 3, C.muted, 9.5, "right"); });
      [0, 20, 40, 60, 80, 100].forEach(n => txt(ctx, n, X(n), st.H - 14, C.muted, 10, "center")); txt(ctx, "n", st.W - 14, st.H - 2, C.muted, 10, "right");
      const lim = speed + Math.log10(3.15e7 * 13.8e9); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(pad, Y(lim)); ctx.lineTo(st.W - 14, Y(lim)); ctx.stroke(); ctx.setLineDash([]); txt(ctx, "age of universe at this speed", st.W - 16, Y(lim) - 5, C.ink, 10, "right", "600");
      const reach = []; fns.forEach(([nm, f, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); let first = true, lastN = 0; for (let n = 1; n <= nmax; n++) { const l = f(n); if (l > ymax + 1) break; if (first) { ctx.moveTo(X(n), Y(l)); first = false; } else ctx.lineTo(X(n), Y(l)); } ctx.stroke(); let nn = 1; while (nn < 1e6 && f(nn + 1) <= lim) nn++; reach.push([nm, nn, col]); });
      fns.forEach(([nm, f, col], i) => { const n = Math.min(nmax, [100, 100, 40, 25][i]); txt(ctx, nm, X(n) - 4, Y(f(n)) - 6, col, 12, "right", "800"); });
      st.info.innerHTML = `<span>machine: <b>10^${speed}</b> ops/s</span>${reach.map(([nm, n, col]) => `<span style="color:${col}">${nm}: n ≤ <b>${n >= 1e6 ? "10⁶+" : n.toLocaleString()}</b></span>`).join("")}`; };
    st.controls({ step: false }); st.slider("ops/s (log₁₀)", 6, 18, 1, 9, v => { speed = v; st.draw(); }); st.size();
  };
})();
