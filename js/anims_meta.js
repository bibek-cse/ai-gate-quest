/* Animations for Meta Learning. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const PAL = ["#2f5bd3", "#e0641a", "#15803d", "#a0306a", "#8a5a00", "#0f6e7a", "#c2352b", "#5b3a1e", "#6b4c9a", "#4a5a1c", "#1c2a52", "#b3261e"];
  const SHAPES = ["●", "▲", "■", "◆", "★", "✚", "⬟", "◐", "✦", "⬢", "♣", "♠"];

  /* episode sampling */
  A.episode = host => {
    const st = stage(host, { label: "Sampling a 5-way 1-shot episode", h: 320 });
    const r = R(9); let N = 5, K = 1, ep = 0, cls = [], lab = [];
    const sample = () => { const pool = [...Array(12).keys()]; cls = []; for (let i = 0; i < N; i++) cls.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); lab = [...Array(N).keys()].sort(() => r() - .5); ep++; }; sample();
    st.interval = 1800; st.tick = () => sample();
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cw = Math.min(34, (st.W - 30) / 12);
      txt(ctx, "base classes (meta-train pool)", 14, 16, C.ink, 12, "left", "600");
      for (let i = 0; i < 12; i++) { const x = 14 + i * cw, on = cls.includes(i); ctx.fillStyle = on ? PAL[i] + "22" : "#f3f1eb"; ctx.strokeStyle = on ? PAL[i] : C.grid; ctx.lineWidth = on ? 2 : 1; ctx.fillRect(x, 24, cw - 4, cw - 4); ctx.strokeRect(x, 24, cw - 4, cw - 4); txt(ctx, SHAPES[i], x + (cw - 4) / 2, 24 + (cw - 4) / 2 + 5, on ? PAL[i] : C.muted, 15, "center", "700"); }
      const y0 = 40 + cw, colW = (st.W - 28) / N;
      txt(ctx, `support set: ${N}×${K} = ${N * K} labelled`, 14, y0 + 10, C.a, 12, "left", "600");
      txt(ctx, `query set: ${N}×3 = ${N * 3} to predict`, 14, y0 + 60 + K * 22, C.b, 12, "left", "600");
      cls.forEach((c, j) => { const x = 14 + j * colW + colW / 2;
        for (let k = 0; k < K; k++) { const y = y0 + 30 + k * 22; txt(ctx, SHAPES[c], x - 12, y + 5, PAL[c], 17, "center", "700"); txt(ctx, "→ " + lab[j], x + 10, y + 4, C.ink, 12, "left", "700"); }
        for (let k = 0; k < 3; k++) { const y = y0 + 80 + K * 22 + k * 22; txt(ctx, SHAPES[c], x - 12, y + 5, PAL[c], 17, "center", "700"); txt(ctx, "→ ?", x + 10, y + 4, C.muted, 12, "left"); } });
      st.info.innerHTML = `<span>episode <b>${ep}</b></span><span>${N}-way ${K}-shot</span><span>chance = <b>${(100 / N).toFixed(0)} %</b></span><span class="hint">labels 0…${N - 1} reshuffled every episode</span>`; };
    st.controls({ step: true }); st.slider("ways N", 2, 6, 1, 5, v => { N = v; sample(); st.draw(); }); st.slider("shots K", 1, 3, 1, 1, v => { K = v; st.draw(); }); st.size();
  };

  /* prototypical network */
  A.protonet = host => {
    const st = stage(host, { label: "Prototypes and nearest-prototype regions", h: 330 });
    const ctrs = [[-2, 1.2], [2, 1.6], [0, -2]], cols = [C.a, C.b, C.ok]; let K = 3, r = R(5), S, Q;
    const gen = () => { r = R(5 + K * 13); S = ctrs.map(c => Array.from({ length: 10 }, () => [c[0] + 1.1 * r.n(), c[1] + 1.1 * r.n()])); Q = Array.from({ length: 9 }, (_, i) => { const c = ctrs[i % 3]; return [c[0] + 1.2 * r.n(), c[1] + 1.2 * r.n(), i % 3]; }); }; gen();
    let shown = 0; st.interval = 500; st.tick = () => { shown = (shown + 1) % 12; };
    st.draw = () => { const { ctx } = st, s = Math.min(st.W, st.H) / 9, cx = st.W / 2, cy = st.H / 2, P = (x, y) => [cx + x * s, cy - y * s]; ctx.clearRect(0, 0, st.W, st.H);
      const pr = S.map(pts => { const sl = pts.slice(0, K); return [sl.reduce((a, p) => a + p[0], 0) / K, sl.reduce((a, p) => a + p[1], 0) / K]; });
      const near = (x, y) => { let b = 0, bd = 1e9; pr.forEach((c, k) => { const d = (x - c[0]) ** 2 + (y - c[1]) ** 2; if (d < bd) { bd = d; b = k; } }); return b; };
      const g = 10; for (let px = 0; px < st.W; px += g) for (let py = 0; py < st.H; py += g) { const x = (px + g / 2 - cx) / s, y = -(py + g / 2 - cy) / s; ctx.fillStyle = cols[near(x, y)] + "14"; ctx.fillRect(px, py, g, g); }
      S.forEach((pts, k) => pts.slice(0, K).forEach(p => { dot(ctx, ...P(...p), 4, cols[k]); ctx.strokeStyle = cols[k] + "55"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(...P(...p)); ctx.lineTo(...P(...pr[k])); ctx.stroke(); }));
      pr.forEach((c, k) => { ctx.strokeStyle = cols[k]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(...P(...c), 10, 0, 7); ctx.stroke(); txt(ctx, "c" + (k + 1), P(...c)[0] + 13, P(...c)[1] - 8, cols[k], 12, "left", "700"); });
      let ok = 0; Q.forEach((q, i) => { const k = near(q[0], q[1]); if (k === q[2]) ok++; if (i >= shown) return; const [x, y] = P(q[0], q[1]); ctx.fillStyle = "#fff"; ctx.strokeStyle = cols[q[2]]; ctx.lineWidth = 2; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.strokeRect(x - 5, y - 5, 10, 10);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = cols[k]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...P(...pr[k])); ctx.stroke(); ctx.setLineDash([]); if (k !== q[2]) txt(ctx, "✗", x + 8, y + 4, C.bad, 13, "left", "800"); });
      st.info.innerHTML = `<span>${K}-shot prototypes</span><span>query accuracy <b>${ok}/9</b></span><span class="hint">square border = true class; dashed line = nearest prototype</span>`; };
    st.controls({ step: true }); st.slider("shots K", 1, 10, 1, 3, v => { K = v; gen(); st.draw(); }); st.size();
  };

  /* MAML on 1-D quadratic tasks */
  A.maml = host => {
    const st = stage(host, { label: "MAML: an initialisation that adapts in one step", h: 320 });
    const cs = [-3, 1, 4], a = .35, wts = [1, 1, 1]; let th, it;
    const reset = () => { th = -4.5; it = 0; }; reset();
    const L = (t, c) => .5 * (t - c) ** 2, adapt = (t, c) => t - a * (t - c);
    st.interval = 120; st.tick = () => { let g = 0; cs.forEach(c => { const tp = adapt(th, c); g += (tp - c) * (1 - a); }); th -= .25 * g / cs.length; it++; if (it > 60) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 28, X = t => pad + (t + 6) / 12 * (st.W - 2 * pad), Y = v => st.H - 34 - v / 14 * (st.H - 70), base = st.H - 34; const cl = [C.a, C.b, C.ok];
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(st.W - pad, base); ctx.stroke(); for (let t = -6; t <= 6; t += 2) txt(ctx, t, X(t), base + 14, C.muted, 10, "center");
      cs.forEach((c, k) => { ctx.strokeStyle = cl[k] + "99"; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const t = -6 + i / 10, v = Math.min(14, L(t, c)); i ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v)); } ctx.stroke(); dot(ctx, X(c), Y(0), 3.5, cl[k]); });
      let post = 0; cs.forEach((c, k) => { const tp = adapt(th, c); post += L(tp, c); const y = 22 + k * 16; ctx.strokeStyle = cl[k]; ctx.fillStyle = cl[k]; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(th), y); ctx.lineTo(X(tp), y); ctx.stroke();
        const dir = Math.sign(tp - th) || 1; ctx.beginPath(); ctx.moveTo(X(tp), y); ctx.lineTo(X(tp) - 7 * dir, y - 4); ctx.lineTo(X(tp) - 7 * dir, y + 4); ctx.fill(); dot(ctx, X(tp), Y(L(tp, c)), 4.5, "#fff", cl[k]); });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(th), 14); ctx.lineTo(X(th), base); ctx.stroke(); ctx.setLineDash([]); dot(ctx, X(th), base, 6, C.ink, "#fff"); txt(ctx, "θ", X(th) + 8, base - 8, C.ink, 13, "left", "800");
      st.info.innerHTML = `<span>meta-step <b>${it}</b></span><span>θ = <b>${th.toFixed(2)}</b></span><span>mean loss after 1 inner step <b>${(post / 3).toFixed(3)}</b></span><span class="hint">task optima −3, 1, 4; α = ${a}</span>`; };
    st.controls({ reset }); st.size(); wts.length;
  };

  /* memory read with content addressing */
  A.memread = host => {
    const st = stage(host, { label: "Content-based memory read", h: 320 });
    const M = [[1, 0, .2], [0, 1, 0], [.7, .7, 0], [0, .3, 1], [-.6, .8, .2], [.9, -.3, .4]].map(v => { const n = Math.hypot(...v); return v.map(x => x / n); });
    let beta = 4, ang = 0;
    st.interval = 50; st.tick = () => { ang += .02; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H);
      const k = [Math.cos(ang), Math.sin(ang) * .9, .3 + .3 * Math.sin(ang * 1.7)], kn = Math.hypot(...k), kk = k.map(x => x / kn);
      const sims = M.map(m => m[0] * kk[0] + m[1] * kk[1] + m[2] * kk[2]), e = sims.map(s => Math.exp(beta * s)), Z = e.reduce((a, b) => a + b, 0), w = e.map(v => v / Z), rv = [0, 1, 2].map(j => M.reduce((a, m, i) => a + w[i] * m[j], 0));
      const cell = Math.min(34, (st.H - 70) / M.length), mx = 40, my = 34;
      txt(ctx, "memory M", mx, 22, C.ink, 12, "left", "600"); txt(ctx, "cos", mx + 3 * cell + 14, 22, C.muted, 11); txt(ctx, "weight w", mx + 3 * cell + 64, 22, C.muted, 11);
      const cell2 = (v, x, y) => { ctx.fillStyle = v >= 0 ? `rgba(42,79,196,${Math.abs(v)})` : `rgba(224,100,26,${Math.abs(v)})`; ctx.fillRect(x, y, cell - 2, cell - 2); };
      M.forEach((m, i) => { const y = my + i * cell; txt(ctx, "M" + (i + 1), mx - 6, y + cell / 2 + 4, C.muted, 11, "right"); m.forEach((v, j) => cell2(v, mx + j * cell, y));
        txt(ctx, sims[i].toFixed(2), mx + 3 * cell + 14, y + cell / 2 + 4, C.ink, 11); const bw = (st.W - mx - 3 * cell - 150) * w[i]; ctx.fillStyle = C.a; ctx.fillRect(mx + 3 * cell + 64, y + 4, Math.max(1, bw), cell - 10); txt(ctx, w[i].toFixed(2), mx + 3 * cell + 70 + bw, y + cell / 2 + 4, C.ink, 11, "left", "700"); });
      const by = my + M.length * cell + 14; txt(ctx, "key k", mx - 6, by + cell / 2 + 4, C.b, 11, "right", "700"); kk.forEach((v, j) => cell2(v, mx + j * cell, by));
      txt(ctx, "read r", mx + 3 * cell + 60, by + cell / 2 + 4, C.ok, 11, "right", "700"); rv.forEach((v, j) => cell2(v, mx + 3 * cell + 66 + j * cell, by));
      const top = w.indexOf(Math.max(...w));
      st.info.innerHTML = `<span>β = <b>${beta}</b></span><span>focus on <b>M${top + 1}</b> (${w[top].toFixed(2)})</span><span class="hint">w = softmax(β·cos(k, Mᵢ)); r = Σ wᵢMᵢ</span>`; };
    st.controls({ step: false }); st.slider("key strength β", 0, 20, 1, 4, v => { beta = v; st.draw(); }); st.size();
  };

  /* CI narrowing */
  A.cinarrow = host => {
    const st = stage(host, { label: "Accuracy over test episodes with a 95 % CI", h: 300 });
    let r, accs, mu = 62, sd = 10;
    const reset = () => { r = R(3); accs = []; }; reset();
    st.interval = 30; st.tick = () => { for (let i = 0; i < 4; i++) accs.push(Math.max(0, Math.min(100, Math.round((mu + sd * r.n()) / 100 * 80) / 80 * 100))); if (accs.length >= 2000) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 34, n = accs.length, N = 2000, X = i => pad + Math.log10(i + 1) / Math.log10(N + 1) * (st.W - pad - 12), Y = a => 14 + (100 - a) / 70 * (st.H - 44);
      for (let a = 40; a <= 100; a += 10) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, Y(a)); ctx.lineTo(st.W - 12, Y(a)); ctx.stroke(); txt(ctx, a + "%", pad - 4, Y(a) + 3, C.muted, 10, "right"); }
      [1, 10, 100, 1000].forEach(i => txt(ctx, i, X(i), st.H - 14, C.muted, 10, "center")); txt(ctx, "episodes (log scale)", st.W - 12, st.H - 2, C.muted, 10, "right");
      accs.forEach((a, i) => dot(ctx, X(i), Y(a), 1.6, "rgba(107,112,128,.35)"));
      let s = 0, s2 = 0; const up = [], lo = [], mid = []; accs.forEach((a, i) => { s += a; s2 += a * a; const k = i + 1, m = s / k, v = k > 1 ? (s2 - k * m * m) / (k - 1) : 0, h = 1.96 * Math.sqrt(Math.max(v, 0) / k); mid.push(m); up.push(m + h); lo.push(m - h); });
      if (n > 1) { ctx.fillStyle = "rgba(42,79,196,.18)"; ctx.beginPath(); up.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))); for (let i = n - 1; i >= 0; i--) ctx.lineTo(X(i), Y(lo[i])); ctx.fill();
        ctx.strokeStyle = C.a; ctx.lineWidth = 2; ctx.beginPath(); mid.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))); ctx.stroke(); }
      const m = n ? mid[n - 1] : 0, h = n ? up[n - 1] - m : 0;
      st.info.innerHTML = `<span>episodes <b>${n}</b></span><span>mean <b>${m.toFixed(2)} %</b></span><span>± <b>${h.toFixed(2)} %</b> (95 % CI)</span><span class="hint">half-width ∝ 1/√n</span>`; };
    st.controls({ reset }); st.size();
  };

  /* meta-overfitting curves */
  A.metaoverfit = host => {
    const st = stage(host, { label: "Meta-train vs meta-test accuracy", h: 300 });
    let classes = 16, aug = false, t = 0; const T = 100;
    st.interval = 50; st.tick = () => { t++; if (t >= T) { t = T; return false; } };
    const curves = () => { const div = Math.min(1, (classes + (aug ? 40 : 0)) / 64); const tr = [], te = [];
      for (let i = 0; i <= T; i++) { const p = 1 - Math.exp(-i / 18), cap = 20 + 75 * p + (1 - div) * 4 * (i / T); tr.push(Math.min(99, cap));
        const peak = 20 + (35 + 25 * div) * p, dec = (1 - div) * 22 * Math.max(0, (i - 30) / 70) ** 1.3; te.push(peak - dec); } return [tr, te]; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 36, X = i => pad + i / T * (st.W - pad - 14), Y = a => 12 + (100 - a) / 90 * (st.H - 40);
      for (let a = 20; a <= 100; a += 20) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, Y(a)); ctx.lineTo(st.W - 14, Y(a)); ctx.stroke(); txt(ctx, a + "%", pad - 4, Y(a) + 3, C.muted, 10, "right"); }
      txt(ctx, "meta-training epochs →", st.W - 14, st.H - 6, C.muted, 10, "right");
      const [tr, te] = curves(); [[tr, C.a, "meta-train"], [te, C.b, "meta-test"]].forEach(([c, col, lab]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); for (let i = 0; i <= t; i++) i ? ctx.lineTo(X(i), Y(c[i])) : ctx.moveTo(X(i), Y(c[i])); ctx.stroke(); dot(ctx, X(t), Y(c[t]), 4, col, "#fff"); txt(ctx, lab, X(t) - 6, Y(c[t]) - 8, col, 11, "right", "700"); });
      const best = te.slice(0, t + 1).reduce((b, v, i) => v > te[b] ? i : b, 0); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(X(best), Y(100)); ctx.lineTo(X(best), Y(10)); ctx.stroke(); ctx.setLineDash([]); txt(ctx, "early stop", X(best) + 4, Y(14), C.muted, 10);
      st.info.innerHTML = `<span>base classes <b>${classes}</b>${aug ? " + task augmentation" : ""}</span><span>gap <b>${(tr[t] - te[t]).toFixed(1)}</b> points</span><span>best meta-test <b>${te[best].toFixed(1)} %</b></span>`; };
    st.controls({ reset: () => { t = 0; } }); st.slider("base classes", 4, 64, 4, 16, v => { classes = v; st.draw(); }); st.button("Toggle task augmentation", () => { aug = !aug; st.draw(); }); st.size();
  };

  /* Thompson sampling bandit */
  A.bandit = host => {
    const st = stage(host, { label: "Exploring a new 4-armed bandit", h: 380 });
    let r, mu, s, f, pulls, regret, hist;
    const lg = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, .1208650973866179e-2, -.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + .5) * Math.log(t); let ser = 1.000000000190015; for (const v of c) ser += v / ++y; return -t + Math.log(2.5066282746310005 * ser / x); };
    const betaPdf = (x, a, b) => Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - (lg(a) + lg(b) - lg(a + b)));
    const gam = a => { if (a < 1) return gam(a + 1) * Math.pow(r(), 1 / a); const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d); for (;;) { let x, v; do { x = r.n(); v = 1 + c * x; } while (v <= 0); v = v * v * v; const u = r(); if (u < 1 - .0331 * x ** 4 || Math.log(u) < .5 * x * x + d * (1 - v + Math.log(v))) return d * v; } };
    const reset = () => { r = R(Math.floor(Math.random() * 1e6)); mu = [r() * .9 + .05, r() * .9 + .05, r() * .9 + .05, r() * .9 + .05]; s = [0, 0, 0, 0]; f = [0, 0, 0, 0]; pulls = [0, 0, 0, 0]; regret = 0; hist = []; }; reset();
    let last = -1; st.interval = 120; st.tick = () => { const draws = s.map((x, i) => { const a = gam(x + 1), b = gam(f[i] + 1); return a / (a + b); }); const k = draws.indexOf(Math.max(...draws)); last = k; pulls[k]++; if (r() < mu[k]) s[k]++; else f[k]++; regret += Math.max(...mu) - mu[k]; hist.push(regret); if (hist.length >= 300) return false; };
    st.draw = () => { const { ctx } = st, cols = [C.a, C.b, C.ok, "#a0306a"]; ctx.clearRect(0, 0, st.W, st.H); const pad = 20, w1 = st.W - pad, base = st.H * .52, H = base - 28;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(w1, base); ctx.stroke(); [0, .5, 1].forEach(x => txt(ctx, x, pad + x * (w1 - pad), base + 12, C.muted, 10, "center")); txt(ctx, "posterior of each arm's success rate", pad, 14, C.ink, 12, "left", "600");
      const curves = mu.map((_, i) => { const pts = []; for (let j = 1; j < 100; j++) pts.push(betaPdf(j / 100, s[i] + 1, f[i] + 1)); return pts; }), mx = Math.max(4, ...curves.flat());
      curves.forEach((pts, i) => { ctx.strokeStyle = cols[i]; ctx.lineWidth = i === last ? 3 : 1.8; ctx.beginPath(); pts.forEach((v, j) => { const x = pad + (j + 1) / 100 * (w1 - pad), y = base - v / mx * H; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
        ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(pad + mu[i] * (w1 - pad), base); ctx.lineTo(pad + mu[i] * (w1 - pad), base - 12); ctx.stroke(); ctx.setLineDash([]); });
      const y2 = base + 34, h2 = st.H - y2 - 20, half = (st.W - 3 * pad) / 2, bw = half / 4, tot = Math.max(1, pulls.reduce((a, b) => a + b, 0));
      txt(ctx, "pulls per arm", pad, y2 - 4, C.ink, 11, "left", "600");
      pulls.forEach((p, i) => { const h = p / tot * h2; ctx.fillStyle = cols[i]; ctx.fillRect(pad + i * bw + 3, y2 + h2 - h, bw - 6, h); txt(ctx, "μ " + mu[i].toFixed(2), pad + i * bw + bw / 2, st.H - 6, cols[i], 9.5, "center", "700"); });
      const x0 = 2 * pad + half, mr = Math.max(5, ...hist); txt(ctx, "cumulative regret", x0, y2 - 4, C.ink, 11, "left", "600");
      ctx.strokeStyle = C.grid; ctx.strokeRect(x0, y2, half, h2);
      ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.beginPath(); hist.forEach((v, i) => { const x = x0 + i / 300 * half, y = y2 + h2 - v / mr * h2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      st.info.innerHTML = `<span>pull <b>${hist.length}</b></span><span>best arm <b>${mu.indexOf(Math.max(...mu)) + 1}</b> (μ = ${Math.max(...mu).toFixed(2)})</span><span>regret <b>${regret.toFixed(2)}</b></span><span class="hint">dashed ticks = true means (hidden from the agent)</span>`; };
    st.controls({ reset }); st.size();
  };

  /* in-context linear regression */
  A.iclreg = host => {
    const st = stage(host, { label: "In-context linear regression", h: 310 });
    let r, w, pts, k;
    const reset = () => { r = R(Math.floor(Math.random() * 1e6)); w = (r() * 2.4 + .4) * (r() < .5 ? -1 : 1); pts = Array.from({ length: 12 }, () => { const x = r() * 4 - 2; return [x, w * x + .5 * r.n()]; }); k = 0; }; reset();
    st.interval = 900; st.tick = () => { k++; if (k >= 12) { k = 12; return false; } };
    st.draw = () => { const { ctx } = st, sx = (st.W - 40) / 5, sy = (st.H - 40) / 14, cx = st.W / 2, cy = st.H / 2, P = (x, y) => [cx + x * sx, cy - y * sy]; ctx.clearRect(0, 0, st.W, st.H);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(st.W, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, st.H); ctx.stroke();
      const use = pts.slice(0, k), sxy = use.reduce((a, p) => a + p[0] * p[1], 0), sxx = use.reduce((a, p) => a + p[0] * p[0], 0), wls = sxx ? sxy / sxx : 0, wgd = .15 * sxy;
      const line = (m, col, dash, wd) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(...P(-2.5, -2.5 * m)); ctx.lineTo(...P(2.5, 2.5 * m)); ctx.stroke(); ctx.setLineDash([]); };
      line(w, "rgba(21,128,61,.45)", [2, 4], 2); if (k) { line(wgd, C.b, [7, 5], 2); line(wls, C.a, [], 2.6); }
      pts.forEach((p, i) => { if (i < k) dot(ctx, ...P(...p), 5, C.ink, "#fff"); });
      const xq = 1.2; if (k) { dot(ctx, ...P(xq, wls * xq), 6, C.a, "#fff"); txt(ctx, "prediction at x = 1.2", 12, 16, C.a, 11, "left", "700"); ctx.strokeStyle = C.a; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(P(xq, 0)[0], P(xq, 0)[1]); ctx.lineTo(...P(xq, wls * xq)); ctx.stroke(); ctx.setLineDash([]); }
      st.info.innerHTML = `<span>demonstrations in prompt <b>${k}</b></span><span>hidden w = <b>${w.toFixed(2)}</b></span><span style="color:${C.a}">least-squares ŵ = <b>${k ? wls.toFixed(2) : "–"}</b></span><span style="color:${C.b}">1 GD step (η = 0.15) = <b>${k ? wgd.toFixed(2) : "–"}</b></span>`; };
    st.controls({ reset }); st.size();
  };
})();
