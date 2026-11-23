/* Algorithm animations for the theory pages. Each ANIM[name](host) builds a canvas demo with controls.
   Autoplay starts when the demo scrolls into view (unless the viewer prefers reduced motion). */
(function () {
  "use strict";
  const A = window.ANIM = {};
  const C = { ink: "#1a1d24", muted: "#6b7080", grid: "#e7e5df", a: "#2f5bd3", b: "#e0641a", ok: "#15803d", bad: "#c2352b", gold: "#d39b1f", soft: "#f3f1eb" };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function R(seed) { let s = seed >>> 0 || 1; const r = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    r.n = () => { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }; return r; }

  /* stage: canvas + control bar; returns helpers. draw(ctx,W,H) is called on every frame/resize */
  function stage(host, opt) {
    host.classList.add("anim");
    const cv = document.createElement("canvas"); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", opt.label || "animation");
    const bar = document.createElement("div"); bar.className = "anim-bar";
    const info = document.createElement("div"); info.className = "anim-info";
    host.append(cv, bar, info);
    const st = { cv, bar, info, W: 0, H: 0, ctx: cv.getContext("2d"), playing: false, raf: 0, last: 0, draw: () => { }, tick: null, interval: opt.interval || 700, acc: 0 };
    function size() {
      const w = host.clientWidth || 600, h = Math.round(Math.min(opt.h || 320, w * (opt.ratio || .62)));
      const d = window.devicePixelRatio || 1; cv.width = w * d; cv.height = h * d; cv.style.height = h + "px"; st.ctx.setTransform(d, 0, 0, d, 0, 0); st.W = w; st.H = h; st.draw();
    }
    st.size = size;
    st.button = (label, fn, cls = "") => { const b = document.createElement("button"); b.type = "button"; b.className = "abtn " + cls; b.textContent = label; b.onclick = fn; bar.append(b); return b; };
    st.slider = (label, min, max, step, val, fn) => {
      const w = document.createElement("label"); w.className = "aslider"; const id = "s" + Math.random().toString(36).slice(2, 8);
      w.innerHTML = `<span>${label} <b>${val}</b></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">`;
      const inp = w.querySelector("input"), out = w.querySelector("b"); inp.oninput = () => { out.textContent = inp.value; fn(+inp.value); }; bar.append(w); return inp;
    };
    st.play = () => { if (st.playing) return; st.playing = true; if (st.pb) st.pb.textContent = "Pause"; st.last = performance.now(); st.raf = requestAnimationFrame(loop); };
    st.pause = () => { st.playing = false; if (st.pb) st.pb.textContent = "Play"; cancelAnimationFrame(st.raf); };
    function loop(t) { if (!st.playing) return; const dt = t - st.last; st.last = t; st.acc += dt;
      if (st.frame) st.frame(dt); if (st.tick && st.acc >= st.interval) { st.acc = 0; if (st.tick() === false) st.pause(); } st.draw(); st.raf = requestAnimationFrame(loop); }
    st.controls = (o = {}) => {
      st.pb = st.button("Play", () => st.playing ? st.pause() : st.play(), "primary");
      if (o.step !== false) st.button("Step", () => { st.pause(); if (st.tick) st.tick(); st.draw(); });
      if (o.reset) st.button("Reset", () => { st.pause(); o.reset(); st.draw(); });
    };
    new ResizeObserver(() => size()).observe(host);
    if (!reduce) new IntersectionObserver((es, ob) => { es.forEach(e => { if (e.isIntersecting && !st.autoplayed) { st.autoplayed = true; st.play(); } else if (!e.isIntersecting && st.playing) st.pause(); }); }, { threshold: .45 }).observe(host);
    return st;
  }
  // map helpers
  const mapper = (st, x0, x1, y0, y1, pad = 28) => ({ X: x => pad + (x - x0) / (x1 - x0) * (st.W - 2 * pad), Y: y => st.H - pad - (y - y0) / (y1 - y0) * (st.H - 2 * pad) });
  function axes(ctx, st, pad = 28) { ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad, 10); ctx.lineTo(pad, st.H - pad); ctx.lineTo(st.W - 10, st.H - pad); ctx.stroke(); }
  function dot(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } }
  function txt(ctx, s, x, y, col = C.muted, size = 12, align = "left", weight = "500") { ctx.fillStyle = col; ctx.font = `${weight} ${size}px "IBM Plex Sans", system-ui, sans-serif`; ctx.textAlign = align; ctx.fillText(s, x, y); }
  function solve(M, v) { // Gaussian elimination, partial pivot
    const n = v.length, a = M.map((r, i) => r.concat([v[i]]));
    for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r; [a[c], a[p]] = [a[p], a[c]];
      for (let r = c + 1; r < n; r++) { const f = a[r][c] / a[c][c]; for (let k = c; k <= n; k++) a[r][k] -= f * a[c][k]; } }
    const x = Array(n).fill(0); for (let r = n - 1; r >= 0; r--) { let s = a[r][n]; for (let k = r + 1; k < n; k++) s -= a[r][k] * x[k]; x[r] = s / a[r][r]; } return x;
  }

  window.ANIMKIT = { stage, mapper, axes, dot, txt, solve, R, C, reduce };

  /* 1. bias–variance with polynomial fits */
  A.biasvar = host => {
    const st = stage(host, { label: "Polynomial fits on resampled noisy data", h: 300 });
    const f = x => Math.sin(2 * Math.PI * x); let deg = 1, r = R(3), fits = [], data = [], stats = { b: 0, v: 0 };
    const sample = () => Array.from({ length: 12 }, (_, i) => { const x = (i + .5 + (r() - .5) * .6) / 12; return [x, f(x) + .28 * r.n()]; });
    function fit(d) { const p = deg + 1, M = Array.from({ length: p }, () => Array(p).fill(0)), v = Array(p).fill(0);
      d.forEach(([x, y]) => { const t = 2 * x - 1, pw = Array.from({ length: p }, (_, k) => t ** k); for (let i = 0; i < p; i++) { v[i] += pw[i] * y; for (let j = 0; j < p; j++) M[i][j] += pw[i] * pw[j]; } });
      for (let i = 0; i < p; i++) M[i][i] += 1e-7; const c = solve(M, v); return x => c.reduce((s, ck, k) => s + ck * (2 * x - 1) ** k, 0); }
    function estimate() { const rr = R(99), G = 40, preds = Array.from({ length: G }, () => []);
      const save = r; r = rr; for (let k = 0; k < 40; k++) { const h = fit(sample()); for (let g = 0; g < G; g++) preds[g].push(Math.max(-3, Math.min(3, h((g + .5) / G)))); } r = save;
      let b = 0, v = 0; preds.forEach((ps, g) => { const m = ps.reduce((a, x) => a + x, 0) / ps.length; b += (m - f((g + .5) / G)) ** 2; v += ps.reduce((a, x) => a + (x - m) ** 2, 0) / ps.length; });
      stats = { b: b / G, v: v / G }; }
    function next() { data = sample(); fits.push(fit(data)); if (fits.length > 7) fits.shift(); }
    st.tick = () => { next(); };
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 1, -1.9, 1.9); ctx.clearRect(0, 0, st.W, st.H); axes(ctx, st);
      ctx.setLineDash([5, 5]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const x = i / 100; i ? ctx.lineTo(m.X(x), m.Y(f(x))) : ctx.moveTo(m.X(x), m.Y(f(x))); } ctx.stroke(); ctx.setLineDash([]);
      fits.forEach((h, k) => { const last = k === fits.length - 1; ctx.strokeStyle = last ? C.a : "rgba(47,91,211,.22)"; ctx.lineWidth = last ? 2.6 : 1.5; ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const x = i / 120, y = Math.max(-1.9, Math.min(1.9, h(x))); i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y)); } ctx.stroke(); });
      data.forEach(([x, y]) => dot(ctx, m.X(x), m.Y(y), 4, C.b));
      txt(ctx, "true f(x) = sin 2πx (dashed)", st.W - 12, 18, C.muted, 12, "right");
      st.info.innerHTML = `<span>degree <b>${deg}</b></span><span>bias² ≈ <b>${stats.b.toFixed(3)}</b></span><span>variance ≈ <b>${stats.v.toFixed(3)}</b></span><span class="hint">${deg <= 2 ? "underfitting: high bias" : deg >= 7 ? "overfitting: high variance" : "a good balance"}</span>`; };
    st.controls({ reset: () => { fits = []; next(); } });
    st.slider("degree", 1, 9, 1, 1, v => { deg = v; fits = []; estimate(); next(); st.draw(); });
    st.interval = 900; estimate(); next(); st.size();
  };

  /* 2. linear regression by gradient descent */
  A.linreg = host => {
    const st = stage(host, { label: "Gradient descent fitting a line", h: 300 });
    const r = R(7), pts = Array.from({ length: 14 }, () => { const x = r() * 8 + 1; return [x, 0.8 * x + 1.2 + r.n() * 1.1]; });
    const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    const b1o = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0), b0o = my - b1o * mx;
    let b0, b1, it, hist; const eta = 0.012;
    const mse = () => pts.reduce((a, [x, y]) => a + (y - b0 - b1 * x) ** 2, 0) / n;
    const reset = () => { b0 = 0; b1 = -0.3; it = 0; hist = [mse()]; }; reset();
    st.tick = () => { let g0 = 0, g1 = 0; pts.forEach(([x, y]) => { const e = b0 + b1 * x - y; g0 += 2 * e / n; g1 += 2 * e * x / n; }); b0 -= eta * 8 * g0; b1 -= eta * g1; it++; hist.push(mse()); if (hist.length > 160) hist.shift(); return it < 400; };
    st.interval = 70;
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 10, -1, 11); ctx.clearRect(0, 0, st.W, st.H); axes(ctx, st);
      ctx.setLineDash([6, 5]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(b0o)); ctx.lineTo(m.X(10), m.Y(b0o + 10 * b1o)); ctx.stroke(); ctx.setLineDash([]);
      pts.forEach(([x, y]) => { ctx.strokeStyle = "rgba(194,53,43,.55)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.X(x), m.Y(y)); ctx.lineTo(m.X(x), m.Y(b0 + b1 * x)); ctx.stroke(); });
      ctx.strokeStyle = C.a; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(b0)); ctx.lineTo(m.X(10), m.Y(b0 + 10 * b1)); ctx.stroke();
      pts.forEach(([x, y]) => dot(ctx, m.X(x), m.Y(y), 4.5, C.ink));
      // inset loss curve
      const iw = Math.min(150, st.W * .32), ih = 70, ix = st.W - iw - 12, iy = 12; ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.strokeStyle = C.grid; ctx.fillRect(ix, iy, iw, ih); ctx.strokeRect(ix, iy, iw, ih);
      const mxh = Math.max(...hist); ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.beginPath(); hist.forEach((v, i) => { const px = ix + 6 + i / 159 * (iw - 12), py = iy + ih - 8 - v / mxh * (ih - 22); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
      txt(ctx, "MSE vs steps", ix + 6, iy + 14, C.muted, 11);
      st.info.innerHTML = `<span>step <b>${it}</b></span><span>β₀ = <b>${b0.toFixed(2)}</b> → ${b0o.toFixed(2)}</span><span>β₁ = <b>${b1.toFixed(3)}</b> → ${b1o.toFixed(3)}</span><span>MSE <b>${mse().toFixed(3)}</b></span>`; };
    st.controls({ reset }); st.size();
  };

  /* 3. logistic regression boundary */
  A.logreg = host => {
    const st = stage(host, { label: "Logistic regression learning a boundary", h: 320 });
    const r = R(11), pts = []; for (let i = 0; i < 26; i++) { pts.push([2.6 + r.n() * .9, 2.8 + r.n() * .9, 0]); pts.push([5.4 + r.n() * .9, 5.0 + r.n() * .9, 1]); }
    let w, it; const sg = z => 1 / (1 + Math.exp(-z));
    const reset = () => { w = [0, 0.4, -0.6]; it = 0; }; reset();
    const loss = () => -pts.reduce((a, [x, y, t]) => { const p = Math.min(1 - 1e-9, Math.max(1e-9, sg(w[0] + w[1] * (x - 4) + w[2] * (y - 4)))); return a + (t ? Math.log(p) : Math.log(1 - p)); }, 0) / pts.length;
    st.tick = () => { const g = [0, 0, 0]; pts.forEach(([x, y, t]) => { const e = sg(w[0] + w[1] * (x - 4) + w[2] * (y - 4)) - t; g[0] += e; g[1] += e * (x - 4); g[2] += e * (y - 4); }); w = w.map((v, i) => v - 0.6 * g[i] / pts.length); it++; return it < 300; };
    st.interval = 60;
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 8, 0, 8, 14); ctx.clearRect(0, 0, st.W, st.H);
      const cs = 14; for (let px = 14; px < st.W - 14; px += cs) for (let py = 14; py < st.H - 14; py += cs) { const x = (px + cs / 2 - 14) / (st.W - 28) * 8, y = 8 - (py + cs / 2 - 14) / (st.H - 28) * 8, p = sg(w[0] + w[1] * (x - 4) + w[2] * (y - 4));
        ctx.fillStyle = p > .5 ? `rgba(224,100,26,${(p - .5) * .5})` : `rgba(47,91,211,${(.5 - p) * .5})`; ctx.fillRect(px, py, cs, cs); }
      if (Math.abs(w[2]) > 1e-6) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); const yAt = x => 4 - (w[0] + w[1] * (x - 4)) / w[2]; ctx.moveTo(m.X(0), m.Y(yAt(0))); ctx.lineTo(m.X(8), m.Y(yAt(8))); ctx.stroke(); }
      pts.forEach(([x, y, t]) => dot(ctx, m.X(x), m.Y(y), 4.5, t ? C.b : C.a, "#fff"));
      const acc = pts.filter(([x, y, t]) => (sg(w[0] + w[1] * (x - 4) + w[2] * (y - 4)) > .5) === !!t).length / pts.length;
      st.info.innerHTML = `<span>step <b>${it}</b></span><span>cross-entropy <b>${loss().toFixed(3)}</b></span><span>accuracy <b>${(acc * 100).toFixed(0)}%</b></span><span class="hint">blue = class 0, orange = class 1</span>`; };
    st.controls({ reset }); st.size();
  };

  /* 4. threshold → confusion matrix, metrics, ROC */
  A.threshold = host => {
    const st = stage(host, { label: "Moving a classification threshold", h: 340, ratio: .75 });
    const erf = x => { const t = 1 / (1 + .3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
    const cdf = (x, m, s) => .5 * (1 + erf((x - m) / (s * Math.SQRT2))), pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * 2.5066);
    const mN = .38, mP = .64, sd = .11; let t = .5, dir = 1, NP = 100, NN = 400;
    st.interval = 16; st.tick = () => { t += dir * .004; if (t > .85 || t < .2) dir *= -1; thr.value = t.toFixed(2); thr.dispatchEvent(new Event("sync")); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const top = st.H * .55, pad = 28;
      const X = x => pad + x * (st.W - 2 * pad), Yd = v => top - 6 - v / 3.8 * (top - 26);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, top - 6); ctx.lineTo(st.W - pad, top - 6); ctx.stroke();
      [[mN, C.a, NN], [mP, C.b, NP]].forEach(([mu, col, cnt]) => { const sc = cnt / (NN + NP) * 2;
        ctx.beginPath(); ctx.moveTo(X(0), Yd(0)); for (let i = 0; i <= 200; i++) { const x = i / 200; ctx.lineTo(X(x), Yd(pdf(x, mu, sd) * sc)); } ctx.lineTo(X(1), Yd(0)); ctx.closePath();
        ctx.fillStyle = col + "22"; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.rect(X(t), 0, st.W, top); ctx.clip(); ctx.beginPath(); ctx.moveTo(X(0), Yd(0)); for (let i = 0; i <= 200; i++) { const x = i / 200; ctx.lineTo(X(x), Yd(pdf(x, mu, sd) * sc)); } ctx.lineTo(X(1), Yd(0)); ctx.closePath(); ctx.fillStyle = col + "55"; ctx.fill(); ctx.restore(); });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(t), 10); ctx.lineTo(X(t), top - 6); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, "negatives", X(mN), 22, C.a, 12, "center", "600"); txt(ctx, "positives", X(mP), 22, C.b, 12, "center", "600"); txt(ctx, "score →", st.W - pad, top + 10, C.muted, 11, "right");
      // ROC
      const rs = st.H - top - 26, rx = pad, ry = top + 16;
      ctx.strokeStyle = C.grid; ctx.strokeRect(rx, ry, rs, rs); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(rx, ry + rs); ctx.lineTo(rx + rs, ry); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.a; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const th = i / 100, tpr = 1 - cdf(th, mP, sd), fpr = 1 - cdf(th, mN, sd); const px = rx + fpr * rs, py = ry + rs - tpr * rs; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
      const TPR = 1 - cdf(t, mP, sd), FPR = 1 - cdf(t, mN, sd); dot(ctx, rx + FPR * rs, ry + rs - TPR * rs, 6, C.bad, "#fff");
      txt(ctx, "ROC", rx + 4, ry + 14, C.muted, 11); txt(ctx, "FPR", rx + rs, ry + rs + 12, C.muted, 10, "right");
      const TP = Math.round(TPR * NP), FN = NP - TP, FP = Math.round(FPR * NN), TN = NN - FP;
      const P = TP + FP ? TP / (TP + FP) : 0, Rr = TP / NP, F1 = 2 * TP / (2 * TP + FP + FN), acc = (TP + TN) / (NP + NN);
      const cx = rx + rs + 24, cw = Math.min(70, (st.W - cx - 12) / 2), ch = Math.min(34, rs / 3);
      const cell = (i, j, label, v, col) => { ctx.fillStyle = col; ctx.fillRect(cx + j * cw, ry + 18 + i * ch, cw - 4, ch - 4); txt(ctx, `${label} ${v}`, cx + j * cw + (cw - 4) / 2, ry + 18 + i * ch + ch / 2 + 2, C.ink, 12, "center", "600"); };
      txt(ctx, "pred +      pred −", cx, ry + 12, C.muted, 10.5);
      cell(0, 0, "TP", TP, "#d9f0e1"); cell(0, 1, "FN", FN, "#fbe2df"); cell(1, 0, "FP", FP, "#fbe2df"); cell(1, 1, "TN", TN, "#d9f0e1");
      st.info.innerHTML = `<span>threshold <b>${t.toFixed(2)}</b></span><span>precision <b>${P.toFixed(3)}</b></span><span>recall <b>${Rr.toFixed(3)}</b></span><span>F1 <b>${F1.toFixed(3)}</b></span><span>accuracy <b>${acc.toFixed(3)}</b></span><span class="hint">${NP} positives, ${NN} negatives</span>`; };
    st.controls({ step: false });
    const thr = st.slider("threshold", .1, .9, .01, .5, v => { t = v; st.draw(); });
    thr.addEventListener("sync", () => { thr.previousElementSibling.querySelector("b").textContent = (+thr.value).toFixed(2); });
    st.button("Balanced classes", function () { if (NP === 100) { NP = 250; NN = 250; this.textContent = "Imbalanced classes"; } else { NP = 100; NN = 400; this.textContent = "Balanced classes"; } st.draw(); });
    st.size();
  };

  /* 5. k-NN */
  A.knn = host => {
    const st = stage(host, { label: "k-nearest neighbours voting", h: 320 });
    const r = R(5), pts = []; for (let i = 0; i < 22; i++) { pts.push([3 + r.n() * 1.3, 3.2 + r.n() * 1.3, 0]); pts.push([6 + r.n() * 1.3, 5.2 + r.n() * 1.3, 1]); }
    let k = 3, q = [4.5, 4.2], ph = 0, map = null;
    const vote = (x, y) => { const d = pts.map(p => [Math.hypot(p[0] - x, p[1] - y), p]).sort((a, b) => a[0] - b[0]).slice(0, k); return [d, d.filter(e => e[1][2]).length > k / 2 ? 1 : 0]; };
    function buildMap() { map = []; const G = 36; for (let i = 0; i < G; i++) for (let j = 0; j < G * .62; j++) { const x = (i + .5) / G * 9, y = (j + .5) / (G * .62) * 8.5; map.push([x, y, vote(x, y)[1]]); } }
    st.frame = dt => { ph += dt / 2600; q = [4.5 + 2.6 * Math.cos(ph), 4.3 + 2.2 * Math.sin(ph * 1.7)]; };
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 9, 0, 8.5, 12); ctx.clearRect(0, 0, st.W, st.H); if (!map) buildMap();
      const cw = (st.W - 24) / 36 + 1, chh = (st.H - 24) / (36 * .62) + 1; map.forEach(([x, y, c]) => { ctx.fillStyle = c ? "rgba(224,100,26,.10)" : "rgba(47,91,211,.10)"; ctx.fillRect(m.X(x) - cw / 2, m.Y(y) - chh / 2, cw, chh); });
      const [near, cls] = vote(q[0], q[1]);
      const rad = near[near.length - 1][0]; ctx.strokeStyle = "rgba(26,29,36,.35)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(m.X(q[0]), m.Y(q[1]), Math.abs(m.X(rad) - m.X(0)), Math.abs(m.Y(rad) - m.Y(0)), 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      near.forEach(([d, p]) => { ctx.strokeStyle = p[2] ? C.b : C.a; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m.X(q[0]), m.Y(q[1])); ctx.lineTo(m.X(p[0]), m.Y(p[1])); ctx.stroke(); });
      pts.forEach(p => dot(ctx, m.X(p[0]), m.Y(p[1]), 4.5, p[2] ? C.b : C.a, "#fff"));
      dot(ctx, m.X(q[0]), m.Y(q[1]), 9, cls ? C.b : C.a, C.ink); dot(ctx, m.X(q[0]), m.Y(q[1]), 4, "#fff");
      const nb = near.filter(e => e[1][2]).length; st.info.innerHTML = `<span>k = <b>${k}</b></span><span>votes: <b style="color:${C.a}">${k - nb} blue</b> · <b style="color:${C.b}">${nb} orange</b></span><span>prediction <b style="color:${cls ? C.b : C.a}">${cls ? "orange" : "blue"}</b></span><span class="hint">drag inside the plot to place the query</span>`; };
    st.controls({ step: false });
    st.slider("k", 1, 15, 2, 3, v => { k = v; map = null; st.draw(); });
    const pick = e => { const b = st.cv.getBoundingClientRect(); q = [(e.clientX - b.left - 12) / (b.width - 24) * 9, (b.height - 12 - (e.clientY - b.top)) / (b.height - 24) * 8.5]; st.pause(); st.draw(); };
    st.cv.addEventListener("pointerdown", e => { pick(e); st.cv.setPointerCapture(e.pointerId); st.cv.onpointermove = pick; });
    st.cv.addEventListener("pointerup", () => { st.cv.onpointermove = null; });
    st.size();
  };

  /* 6. SVM: sweep directions, keep widest street */
  A.svm = host => {
    const st = stage(host, { label: "Searching for the maximum-margin separator", h: 320 });
    const P = [[5.5, 5.5], [6.6, 4.6], [7.2, 6.4], [6, 7.2], [7.8, 5.2], [5.2, 6.8], [8, 7]], N = [[2, 2.4], [3.2, 1.6], [2.6, 3.6], [4, 3], [1.6, 4.2], [3.4, 4.2], [1.4, 1.4]];
    let ang = 0, best = null, fin = false;
    function street(a) { const u = [Math.cos(a), Math.sin(a)], pp = P.map(p => p[0] * u[0] + p[1] * u[1]), nn = N.map(p => p[0] * u[0] + p[1] * u[1]);
      const lo = Math.min(...pp), hi = Math.max(...nn); return { u, lo, hi, gap: lo - hi, c: (lo + hi) / 2, sv: [...P.filter((p, i) => Math.abs(pp[i] - lo) < 1e-6), ...N.filter((p, i) => Math.abs(nn[i] - hi) < 1e-6)] }; }
    st.interval = 30; st.tick = () => { ang += Math.PI / 180; const s = street(ang); if (s.gap > 0 && (!best || s.gap > best.gap)) best = { ...s, a: ang }; if (ang >= Math.PI / 2 + .02) { ang = Math.PI / 2 + .02; fin = true; return false; } };
    const reset = () => { ang = 0; best = null; fin = false; };
    function drawStreet(ctx, m, s, col, alpha) { const [ux, uy] = s.u, vx = -uy, vy = ux; const line = c => { const x0 = ux * c, y0 = uy * c; ctx.beginPath(); ctx.moveTo(m.X(x0 - vx * 20), m.Y(y0 - vy * 20)); ctx.lineTo(m.X(x0 + vx * 20), m.Y(y0 + vy * 20)); ctx.stroke(); };
      if (s.gap > 0) { ctx.fillStyle = col + alpha; ctx.beginPath(); const c1 = s.hi, c2 = s.lo; const pts = [[ux * c1 - vx * 20, uy * c1 - vy * 20], [ux * c1 + vx * 20, uy * c1 + vy * 20], [ux * c2 + vx * 20, uy * c2 + vy * 20], [ux * c2 - vx * 20, uy * c2 - vy * 20]];
        pts.forEach(([x, y], i) => i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y))); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; line(s.c); ctx.lineWidth = 1; ctx.setLineDash([5, 4]); line(s.lo); line(s.hi); ctx.setLineDash([]); }
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 9.5, 0, 8.5, 12); ctx.clearRect(0, 0, st.W, st.H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, st.W, st.H); ctx.clip();
      const cur = street(ang); if (!fin) drawStreet(ctx, m, cur, cur.gap > 0 ? "#6b7080" : C.bad, "18");
      if (best) drawStreet(ctx, m, best, C.ok, "26"); ctx.restore();
      P.forEach(p => dot(ctx, m.X(p[0]), m.Y(p[1]), 5, C.b, "#fff")); N.forEach(p => dot(ctx, m.X(p[0]), m.Y(p[1]), 5, C.a, "#fff"));
      if (best && fin) best.sv.forEach(p => dot(ctx, m.X(p[0]), m.Y(p[1]), 10, null, C.ink));
      st.info.innerHTML = `<span>direction <b>${(ang * 180 / Math.PI).toFixed(0)}°</b></span><span>street width <b>${cur.gap > 0 ? cur.gap.toFixed(2) : "overlap"}</b></span><span>widest so far <b style="color:${C.ok}">${best ? best.gap.toFixed(2) : "–"}</b></span><span class="hint">${fin ? "done: circled = support vectors" : "grey = current, green = best"}</span>`; };
    st.controls({ reset }); st.size();
  };

  /* 7. decision tree, greedy Gini splits */
  A.tree = host => {
    const st = stage(host, { label: "Growing a decision tree with Gini splits", h: 320 });
    const r = R(21), pts = []; for (let i = 0; i < 70; i++) { const x = r() * 10, y = r() * 8; let c = (x < 4.2) ? (y > 5.2 ? 1 : 0) : (y < 3 ? 1 : (x > 7.6 ? 1 : 0)); if (r() < .06) c = 1 - c; pts.push([x, y, c]); }
    const gini = s => { if (!s.length) return 0; const p = s.filter(q => q[2]).length / s.length; return 2 * p * (1 - p); };
    let nodes, queue, scan, splits, msg;
    function bestSplit(n) { let b = null; for (const f of [0, 1]) { const vals = [...new Set(n.pts.map(p => p[f]))].sort((a, c) => a - c);
      for (let i = 0; i < vals.length - 1; i++) { const t = (vals[i] + vals[i + 1]) / 2, L = n.pts.filter(p => p[f] < t), Rr = n.pts.filter(p => p[f] >= t); if (L.length < 3 || Rr.length < 3) continue;
        const g = (L.length * gini(L) + Rr.length * gini(Rr)) / n.pts.length; if (!b || g < b.g) b = { f, t, g, L, R: Rr }; } } return b; }
    const reset = () => { nodes = [{ box: [0, 10, 0, 8], pts, d: 0 }]; queue = [nodes[0]]; scan = null; splits = []; msg = "Root: all 70 points, Gini " + gini(pts).toFixed(3); }; reset();
    st.interval = 45;
    st.tick = () => {
      if (!scan) { while (queue.length && (queue[0].d >= 3 || gini(queue[0].pts) < .05 || queue[0].pts.length < 8)) queue.shift(); if (!queue.length) { msg = "Done: every leaf is pure, small, or at depth 3."; return false; }
        const n = queue[0], b = bestSplit(n); if (!b) { queue.shift(); return; } scan = { n, b, f: 0, pos: n.box[0], cur: null }; return; }
      const { n, b } = scan, lo = scan.f ? n.box[2] : n.box[0], hi = scan.f ? n.box[3] : n.box[1];
      scan.pos += (hi - lo) / 22; if (scan.pos > hi) { if (scan.f === 0) { scan.f = 1; scan.pos = n.box[2]; return; }
        splits.push({ ...b, box: n.box }); queue.shift();
        const bx = n.box, Lb = b.f ? [bx[0], bx[1], bx[2], b.t] : [bx[0], b.t, bx[2], bx[3]], Rb = b.f ? [bx[0], bx[1], b.t, bx[3]] : [b.t, bx[1], bx[2], bx[3]];
        const cL = { box: Lb, pts: b.L, d: n.d + 1 }, cR = { box: Rb, pts: b.R, d: n.d + 1 }; nodes.push(cL, cR); queue.push(cL, cR);
        msg = `Split on ${b.f ? "y" : "x"} < ${b.t.toFixed(2)}: Gini ${gini(n.pts).toFixed(3)} → ${b.g.toFixed(3)} (depth ${n.d + 1})`; scan = null; return; }
      const L = n.pts.filter(p => p[scan.f] < scan.pos), Rr = n.pts.filter(p => p[scan.f] >= scan.pos); scan.cur = (L.length * gini(L) + Rr.length * gini(Rr)) / n.pts.length;
      msg = `Scanning ${scan.f ? "y" : "x"} = ${scan.pos.toFixed(2)} → weighted Gini ${scan.cur.toFixed(3)}  (best ${b.g.toFixed(3)})`; };
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 10, 0, 8, 12); ctx.clearRect(0, 0, st.W, st.H);
      nodes.filter(n => !nodes.some(c => c !== n && c.d === n.d + 1 && c.box[0] >= n.box[0] && c.box[1] <= n.box[1] && c.box[2] >= n.box[2] && c.box[3] <= n.box[3])).forEach(n => { if (!n.pts.length) return; const p = n.pts.filter(q => q[2]).length / n.pts.length;
        ctx.fillStyle = p > .5 ? "rgba(224,100,26,.10)" : "rgba(47,91,211,.10)"; ctx.fillRect(m.X(n.box[0]), m.Y(n.box[3]), m.X(n.box[1]) - m.X(n.box[0]), m.Y(n.box[2]) - m.Y(n.box[3])); });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; splits.forEach(s => { ctx.beginPath(); if (s.f) { ctx.moveTo(m.X(s.box[0]), m.Y(s.t)); ctx.lineTo(m.X(s.box[1]), m.Y(s.t)); } else { ctx.moveTo(m.X(s.t), m.Y(s.box[2])); ctx.lineTo(m.X(s.t), m.Y(s.box[3])); } ctx.stroke(); });
      if (scan) { const n = scan.n; ctx.strokeStyle = C.bad; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); if (scan.f) { ctx.moveTo(m.X(n.box[0]), m.Y(scan.pos)); ctx.lineTo(m.X(n.box[1]), m.Y(scan.pos)); } else { ctx.moveTo(m.X(scan.pos), m.Y(n.box[2])); ctx.lineTo(m.X(scan.pos), m.Y(n.box[3])); } ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(194,53,43,.5)"; ctx.strokeRect(m.X(n.box[0]), m.Y(n.box[3]), m.X(n.box[1]) - m.X(n.box[0]), m.Y(n.box[2]) - m.Y(n.box[3])); }
      pts.forEach(p => dot(ctx, m.X(p[0]), m.Y(p[1]), 3.8, p[2] ? C.b : C.a, "#fff"));
      st.info.innerHTML = `<span>${msg}</span><span class="hint">${splits.length} split${splits.length === 1 ? "" : "s"}</span>`; };
    st.controls({ reset }); st.size();
  };

  /* 8. MLP forward + backprop walkthrough */
  A.mlp = host => {
    const st = stage(host, { label: "Forward and backward pass in a small network", h: 330, ratio: .7 });
    const x = [1, 2], W1 = [[.5, -.4], [-.3, .8], [.6, .2]], b1 = [.1, 0, -.5], W2 = [.7, -.5, .4], b2 = .1, y = 1, eta = .5;
    const relu = z => Math.max(0, z), sg = z => 1 / (1 + Math.exp(-z));
    const z1 = W1.map((w, i) => w[0] * x[0] + w[1] * x[1] + b1[i]), h = z1.map(relu), z2 = W2.reduce((a, w, i) => a + w * h[i], 0) + b2, yh = sg(z2), L = -Math.log(yh);
    const d2 = yh - y, gW2 = h.map(v => d2 * v), d1 = W2.map((w, i) => w * d2 * (z1[i] > 0 ? 1 : 0)), W2n = W2.map((w, i) => w - eta * gW2[i]);
    const steps = [
      ["Inputs x = (1, 2) enter the network. Target y = 1.", 0],
      [`Hidden pre-activations z = W₁x + b₁ = (${z1.map(v => v.toFixed(2)).join(", ")})`, 1],
      [`ReLU: h = max(0, z) = (${h.map(v => v.toFixed(2)).join(", ")}). Neuron 3 is switched off.`, 1],
      [`Output z = W₂·h + b₂ = ${z2.toFixed(3)},  ŷ = σ(z) = ${yh.toFixed(3)}`, 2],
      [`Loss L = −log ŷ = ${L.toFixed(3)}`, 2],
      [`Backward: δ_out = ŷ − y = ${d2.toFixed(3)}.  ∂L/∂W₂ = δ_out·h = (${gW2.map(v => v.toFixed(3)).join(", ")})`, 3],
      [`Hidden deltas δ = W₂·δ_out ⊙ ReLU′(z) = (${d1.map(v => v.toFixed(3)).join(", ")}). The dead unit gets 0 gradient.`, 4],
      [`Update (η = 0.5): W₂ → (${W2n.map(v => v.toFixed(3)).join(", ")}). Repeat for every example: that's training.`, 5]];
    let s = 0, t = 0;
    st.interval = 2200; st.tick = () => { s = (s + 1) % steps.length; t = 0; };
    st.frame = dt => { t = Math.min(1, t + dt / 900); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const ph = steps[s][1];
      const lx = [st.W * .14, st.W * .5, st.W * .86], ys = n => Array.from({ length: n }, (_, i) => st.H * (.5 + (i - (n - 1) / 2) * .26));
      const L0 = ys(2).map(yy => [lx[0], yy]), L1 = ys(3).map(yy => [lx[1], yy]), L2 = [[lx[2], st.H * .5]];
      const edge = (a, b, w, active, col) => { ctx.strokeStyle = active ? col : "#d9d6cf"; ctx.lineWidth = 1 + Math.min(4, Math.abs(w) * 4); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
        if (active && t < 1) { const p = col === C.bad ? 1 - t : t; dot(ctx, a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, 5, col); } };
      L0.forEach((a, i) => L1.forEach((b, j) => edge(a, b, W1[j][i], ph === 1, C.a)));
      L1.forEach((a, j) => edge(a, L2[0], W2[j], ph === 2, C.a));
      if (ph >= 3) L1.forEach((a, j) => edge(a, L2[0], W2[j], ph === 3 || ph === 5, C.bad)); if (ph === 4) L0.forEach((a, i) => L1.forEach((b, j) => edge(a, b, W1[j][i], d1[j] !== 0, C.bad)));
      const node = ([px, py], label, val, on) => { dot(ctx, px, py, 24, on ? "#eaf0ff" : "#fff", on ? C.a : "#c9c5bc"); txt(ctx, label, px, py - 3, C.ink, 12, "center", "700"); if (val !== null) txt(ctx, val, px, py + 12, C.muted, 11, "center"); };
      L0.forEach((p, i) => node(p, "x" + "₁₂"[i], x[i].toFixed(1), true));
      L1.forEach((p, j) => node(p, "h" + "₁₂₃"[j], ph >= 1 ? (ph === 1 && s === 1 ? z1[j] : h[j]).toFixed(2) : null, ph >= 1 && h[j] > 0));
      node(L2[0], "ŷ", ph >= 2 && s >= 3 ? yh.toFixed(3) : null, s >= 3);
      if (s >= 4) txt(ctx, `L = ${L.toFixed(3)}`, lx[2], st.H * .5 + 44, C.bad, 12, "center", "600");
      txt(ctx, "input", lx[0], 18, C.muted, 11, "center"); txt(ctx, "hidden (ReLU)", lx[1], 18, C.muted, 11, "center"); txt(ctx, "output (σ)", lx[2], 18, C.muted, 11, "center");
      st.info.innerHTML = `<span>step <b>${s + 1}/${steps.length}</b></span><span>${steps[s][0]}</span>`; };
    st.controls({ reset: () => { s = 0; t = 0; } }); st.size();
  };

  /* 9. k-means */
  A.kmeans = host => {
    const st = stage(host, { label: "k-means assign and update steps", h: 320 });
    const r = R(8), pts = []; [[2.5, 2.5], [6.8, 3], [4.6, 6.4]].forEach(([cx, cy]) => { for (let i = 0; i < 22; i++) pts.push([cx + r.n() * .8, cy + r.n() * .8]); });
    let cents, target, assign, phase, it, rr = R(4);
    const reset = () => { cents = [0, 1, 2].map(() => pts[Math.floor(rr() * pts.length)].slice()); target = cents.map(c => c.slice()); assign = pts.map(() => -1); phase = 0; it = 0; }; reset();
    const wcss = () => pts.reduce((a, p, i) => a + (assign[i] < 0 ? 0 : (p[0] - cents[assign[i]][0]) ** 2 + (p[1] - cents[assign[i]][1]) ** 2), 0);
    st.interval = 1100;
    st.tick = () => { if (phase === 0) { const na = pts.map(p => { let b = 0, bd = 1e9; cents.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = k; } }); return b; });
        const changed = na.some((a, i) => a !== assign[i]); assign = na; phase = 1; it++; if (!changed && it > 1) { phase = 2; return false; } }
      else { target = cents.map((c, k) => { const m = pts.filter((_, i) => assign[i] === k); return m.length ? [m.reduce((a, p) => a + p[0], 0) / m.length, m.reduce((a, p) => a + p[1], 0) / m.length] : c; }); phase = 0; } };
    st.frame = dt => { cents = cents.map((c, k) => [c[0] + (target[k][0] - c[0]) * Math.min(1, dt / 160), c[1] + (target[k][1] - c[1]) * Math.min(1, dt / 160)]); };
    const cols = [C.a, C.b, C.ok];
    st.draw = () => { const { ctx } = st, m = mapper(st, 0, 9.5, 0, 8.8, 12); ctx.clearRect(0, 0, st.W, st.H);
      pts.forEach((p, i) => { if (assign[i] >= 0) { ctx.strokeStyle = cols[assign[i]] + "33"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.X(p[0]), m.Y(p[1])); ctx.lineTo(m.X(cents[assign[i]][0]), m.Y(cents[assign[i]][1])); ctx.stroke(); } });
      pts.forEach((p, i) => dot(ctx, m.X(p[0]), m.Y(p[1]), 4, assign[i] >= 0 ? cols[assign[i]] : "#a9a59c", "#fff"));
      cents.forEach((c, k) => { const X = m.X(c[0]), Y = m.Y(c[1]); ctx.fillStyle = cols[k]; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, Y - 11); ctx.lineTo(X + 10, Y + 7); ctx.lineTo(X - 10, Y + 7); ctx.closePath(); ctx.fill(); ctx.stroke(); });
      st.info.innerHTML = `<span>iteration <b>${it}</b></span><span>${phase === 2 ? "<b style='color:" + C.ok + "'>converged</b>: assignments stopped changing" : phase === 1 ? "next: <b>update</b>, each centroid moves to its cluster mean" : "next: <b>assign</b>, each point joins its nearest centroid"}</span><span>WCSS <b>${wcss().toFixed(1)}</b></span>`; };
    st.controls({ reset }); st.button("New random start", () => { st.pause(); rr = R(Math.random() * 1e9); reset(); st.draw(); });
    st.size();
  };

  /* 10. PCA rotating direction */
  A.pca = host => {
    const st = stage(host, { label: "Finding the direction of maximum variance", h: 360, ratio: .8 });
    const r = R(12), pts = Array.from({ length: 60 }, () => { const a = r.n() * 2, b = r.n() * .7; return [a * .87 - b * .5, a * .5 + b * .87]; });
    const S = [[0, 0], [0, 0]]; pts.forEach(([x, y]) => { S[0][0] += x * x; S[0][1] += x * y; S[1][1] += y * y; }); S[1][0] = S[0][1]; [0, 1].forEach(i => [0, 1].forEach(j => S[i][j] /= pts.length - 1));
    const varAt = a => { const u = [Math.cos(a), Math.sin(a)]; return u[0] * u[0] * S[0][0] + 2 * u[0] * u[1] * S[0][1] + u[1] * u[1] * S[1][1]; };
    const tr = S[0][0] + S[1][1], det = S[0][0] * S[1][1] - S[0][1] ** 2, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det);
    const aStar = Math.atan2(l1 - S[0][0], S[0][1]);
    let ang = 0, done = false;
    st.interval = 25; st.tick = () => { ang += Math.PI / 120; if (ang >= Math.PI) { ang = (aStar + Math.PI) % Math.PI; done = true; return false; } };
    const reset = () => { ang = 0; done = false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const top = st.H * .68, cx = st.W / 2, cy = top / 2 + 4, sc = Math.min(st.W, top) / 9.5;
      const P = (x, y) => [cx + x * sc, cy - y * sc], u = [Math.cos(ang), Math.sin(ang)];
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(...P(-6, 0)); ctx.lineTo(...P(6, 0)); ctx.moveTo(...P(0, -4.2)); ctx.lineTo(...P(0, 4.2)); ctx.stroke();
      ctx.strokeStyle = done ? C.ok : C.bad; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...P(-u[0] * 6, -u[1] * 6)); ctx.lineTo(...P(u[0] * 6, u[1] * 6)); ctx.stroke();
      if (done) { ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...P(u[1] * 3, -u[0] * 3)); ctx.lineTo(...P(-u[1] * 3, u[0] * 3)); ctx.stroke(); txt(ctx, "PC2", ...P(-u[1] * 3.2, u[0] * 3.2), C.gold, 12, "center", "700"); txt(ctx, "PC1", ...P(u[0] * 5.4, u[1] * 5.4 + .35), C.ok, 12, "center", "700"); }
      pts.forEach(([x, y]) => { const s = x * u[0] + y * u[1], [px, py] = P(s * u[0], s * u[1]); ctx.strokeStyle = "rgba(107,112,128,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(...P(x, y)); ctx.lineTo(px, py); ctx.stroke(); dot(ctx, px, py, 2.5, done ? C.ok : C.bad); });
      pts.forEach(([x, y]) => dot(ctx, ...P(x, y), 3.6, C.a, "#fff"));
      // variance vs angle chart
      const gx = 30, gy = top + 14, gw = st.W - 44, gh = st.H - top - 30; ctx.strokeStyle = C.grid; ctx.strokeRect(gx, gy, gw, gh);
      ctx.strokeStyle = C.a; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI, v = varAt(a), X = gx + i / 120 * gw, Y = gy + gh - (v - l2) / (l1 - l2) * (gh - 8) - 4; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
      const v = varAt(ang), X = gx + (ang % Math.PI) / Math.PI * gw, Y = gy + gh - (v - l2) / (l1 - l2) * (gh - 8) - 4; dot(ctx, X, Y, 5.5, done ? C.ok : C.bad, "#fff");
      txt(ctx, "projected variance vs angle 0°…180°", gx + 6, gy + 13, C.muted, 11);
      st.info.innerHTML = `<span>angle <b>${(ang * 180 / Math.PI % 180).toFixed(0)}°</b></span><span>variance along u <b>${v.toFixed(2)}</b></span><span>λ₁ = <b>${l1.toFixed(2)}</b>, λ₂ = <b>${l2.toFixed(2)}</b></span><span>PC1 explains <b>${(100 * l1 / (l1 + l2)).toFixed(0)}%</b></span>`; };
    st.controls({ reset }); st.size();
  };
})();
