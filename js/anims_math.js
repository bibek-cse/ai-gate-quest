/* Animations for Maths for AI. Uses helpers exported by anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const arrow = (ctx, x0, y0, x1, y1, col, w = 3) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0), L = 11; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - L * Math.cos(a - .4), y1 - L * Math.sin(a - .4)); ctx.lineTo(x1 - L * Math.cos(a + .4), y1 - L * Math.sin(a + .4)); ctx.closePath(); ctx.fill(); };
  const plane = (st, span) => { const s = Math.min(st.W, st.H) / (2 * span), cx = st.W / 2, cy = st.H / 2; return { s, cx, cy, P: (x, y) => [cx + x * s, cy - y * s] }; };
  const gridLines = (ctx, st, pl, span) => { ctx.strokeStyle = C.grid; ctx.lineWidth = 1; for (let k = -Math.ceil(span * 2); k <= Math.ceil(span * 2); k++) { ctx.beginPath(); ctx.moveTo(...pl.P(k, -span * 2)); ctx.lineTo(...pl.P(k, span * 2)); ctx.moveTo(...pl.P(-span * 2, k)); ctx.lineTo(...pl.P(span * 2, k)); ctx.stroke(); }
    ctx.strokeStyle = "#c9c5bc"; ctx.beginPath(); ctx.moveTo(...pl.P(-span * 2, 0)); ctx.lineTo(...pl.P(span * 2, 0)); ctx.moveTo(...pl.P(0, -span * 2)); ctx.lineTo(...pl.P(0, span * 2)); ctx.stroke(); };

  /* vectors: dot product, angle, projection */
  A.vectors = host => {
    const st = stage(host, { label: "Dot product, angle and projection", h: 320 });
    const a = [3, 1]; let th = 1.2, len = 2.6, b = [len * Math.cos(th), len * Math.sin(th)];
    st.frame = dt => { th += dt / 1800; b = [len * Math.cos(th), len * Math.sin(th)]; };
    st.draw = () => { const { ctx } = st, pl = plane(st, 4); ctx.clearRect(0, 0, st.W, st.H); gridLines(ctx, st, pl, 4);
      const d = a[0] * b[0] + a[1] * b[1], na = Math.hypot(...a), nb = Math.hypot(...b), c = d / (na * nb), k = d / (na * na), pr = [k * a[0], k * a[1]];
      ctx.strokeStyle = "rgba(21,128,61,.5)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...pl.P(...b)); ctx.lineTo(...pl.P(...pr)); ctx.stroke(); ctx.setLineDash([]);
      arrow(ctx, ...pl.P(0, 0), ...pl.P(...pr), C.ok, 6);
      arrow(ctx, ...pl.P(0, 0), ...pl.P(...a), C.a); arrow(ctx, ...pl.P(0, 0), ...pl.P(...b), C.b);
      const ang1 = Math.atan2(a[1], a[0]), ang2 = Math.atan2(b[1], b[0]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(pl.cx, pl.cy, 26, -ang1, -ang2, ((ang2 - ang1 + 4 * Math.PI) % (2 * Math.PI)) < Math.PI); ctx.stroke();
      txt(ctx, "a", ...pl.P(a[0] + .2, a[1] + .2), C.a, 14, "left", "700"); txt(ctx, "b", ...pl.P(b[0] * 1.08, b[1] * 1.08), C.b, 14, "left", "700");
      const deg = Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI;
      st.info.innerHTML = `<span>a·b = <b>${d.toFixed(2)}</b></span><span>angle <b>${deg.toFixed(0)}°</b></span><span>cos θ = <b>${c.toFixed(3)}</b></span><span>proj of b on a = <b style="color:${C.ok}">${k.toFixed(2)}·a</b></span><span class="hint">${Math.abs(d) < .15 ? "orthogonal!" : d > 0 ? "acute: positive dot" : "obtuse: negative dot"}</span>`; };
    st.controls({ step: false });
    const pick = e => { const bb = st.cv.getBoundingClientRect(), pl = plane(st, 4); b = [(e.clientX - bb.left - pl.cx) / pl.s, (pl.cy - (e.clientY - bb.top)) / pl.s]; len = Math.hypot(...b); th = Math.atan2(b[1], b[0]); st.pause(); st.draw(); };
    st.cv.addEventListener("pointerdown", e => { pick(e); st.cv.setPointerCapture(e.pointerId); st.cv.onpointermove = pick; }); st.cv.addEventListener("pointerup", () => st.cv.onpointermove = null);
    st.size();
  };

  /* linear transformation of the grid */
  A.lintrans = host => {
    const st = stage(host, { label: "A 2×2 matrix transforming the plane", h: 330 });
    const mats = [["scale", [[1.6, 0], [0, .7]]], ["shear", [[1, 1], [0, 1]]], ["rotate 45°", [[.707, -.707], [.707, .707]]], ["reflect", [[-1, 0], [0, 1]]], ["general", [[2, 1], [1, 1.5]]], ["singular (det 0)", [[1, 2], [.5, 1]]]];
    let mi = 0, t = 0;
    st.frame = dt => { t += dt / 1600; if (t > 2) { t = 0; mi = (mi + 1) % mats.length; } };
    st.draw = () => { const { ctx } = st, pl = plane(st, 3.4); ctx.clearRect(0, 0, st.W, st.H);
      const M = mats[mi][1], s = Math.min(1, t), e = s * s * (3 - 2 * s), A2 = [[1 + (M[0][0] - 1) * e, M[0][1] * e], [M[1][0] * e, 1 + (M[1][1] - 1) * e]];
      const T = (x, y) => [A2[0][0] * x + A2[0][1] * y, A2[1][0] * x + A2[1][1] * y];
      ctx.lineWidth = 1; for (let k = -6; k <= 6; k++) { ctx.strokeStyle = k ? "#e2dfd8" : "#b9b5ac"; ctx.beginPath(); ctx.moveTo(...pl.P(...T(k, -6))); ctx.lineTo(...pl.P(...T(k, 6))); ctx.moveTo(...pl.P(...T(-6, k))); ctx.lineTo(...pl.P(...T(6, k))); ctx.stroke(); }
      const sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(p => pl.P(...T(...p))); ctx.fillStyle = "rgba(42,79,196,.18)"; ctx.beginPath(); sq.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill();
      arrow(ctx, ...pl.P(0, 0), ...pl.P(...T(1, 0)), C.a); arrow(ctx, ...pl.P(0, 0), ...pl.P(...T(0, 1)), C.b);
      const det = A2[0][0] * A2[1][1] - A2[0][1] * A2[1][0];
      st.info.innerHTML = `<span><b>${mats[mi][0]}</b></span><span>A = [[${A2[0].map(v => v.toFixed(2)).join(", ")}], [${A2[1].map(v => v.toFixed(2)).join(", ")}]]</span><span>det = area = <b>${det.toFixed(2)}</b></span><span class="hint">blue = A·e₁, orange = A·e₂</span>`; };
    st.controls({ step: false }); st.button("Next matrix", () => { mi = (mi + 1) % mats.length; t = 1.2; st.draw(); }); st.size();
  };

  /* eigenvectors: v vs Av */
  A.eigen = host => {
    const st = stage(host, { label: "Unit circle mapped by a symmetric matrix", h: 330 });
    const M = [[2, 1], [1, 2]]; let th = 0, trail = [];
    st.frame = dt => { th += dt / 1400; if (th > 2 * Math.PI) { th -= 2 * Math.PI; } };
    st.draw = () => { const { ctx } = st, pl = plane(st, 3.6); ctx.clearRect(0, 0, st.W, st.H); gridLines(ctx, st, pl, 3.6);
      ctx.strokeStyle = "rgba(42,79,196,.35)"; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const a = i / 100 * 2 * Math.PI; i ? ctx.lineTo(...pl.P(Math.cos(a), Math.sin(a))) : ctx.moveTo(...pl.P(1, 0)); } ctx.stroke();
      ctx.strokeStyle = "rgba(224,100,26,.4)"; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const a = i / 100 * 2 * Math.PI, v = [Math.cos(a), Math.sin(a)], w = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]; i ? ctx.lineTo(...pl.P(...w)) : ctx.moveTo(...pl.P(...w)); } ctx.stroke();
      [[1, 1, 3], [1, -1, 1]].forEach(([x, y, l]) => { const n = Math.SQRT2; ctx.strokeStyle = "rgba(21,128,61,.35)"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(...pl.P(-x / n * 3.5, -y / n * 3.5)); ctx.lineTo(...pl.P(x / n * 3.5, y / n * 3.5)); ctx.stroke(); ctx.setLineDash([]); });
      const v = [Math.cos(th), Math.sin(th)], w = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]], cross = Math.abs(v[0] * w[1] - v[1] * w[0]) / Math.hypot(...w), aligned = cross < .06;
      arrow(ctx, ...pl.P(0, 0), ...pl.P(...w), aligned ? C.ok : C.b, aligned ? 5 : 3); arrow(ctx, ...pl.P(0, 0), ...pl.P(...v), C.a, 3);
      st.info.innerHTML = `<span>A = [[2, 1], [1, 2]]</span><span>v = (${v.map(x => x.toFixed(2)).join(", ")})</span><span>|Av|/|v| = <b>${Math.hypot(...w).toFixed(2)}</b></span><span>${aligned ? `<b style="color:${C.ok}">eigenvector! λ ≈ ${Math.hypot(...w).toFixed(2)}</b>` : "v and Av point different ways"}</span><span class="hint">dashed = eigen-directions (λ = 3, 1)</span>`; };
    st.controls({ step: false }); st.size();
  };

  /* tangent line & derivative */
  A.tangent = host => {
    const st = stage(host, { label: "Tangent line and the derivative", h: 340, ratio: .72 });
    const f = x => .25 * x * x * x - 1.5 * x, fp = x => .75 * x * x - 1.5; let x0 = -3;
    st.frame = dt => { x0 += dt / 1500; if (x0 > 3) x0 = -3; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const top = st.H * .62, pad = 26;
      const X = x => pad + (x + 3.3) / 6.6 * (st.W - 2 * pad), Y1 = y => top / 2 - y * top / 9, Y2 = y => top + 14 + (st.H - top - 22) / 2 - y * (st.H - top - 22) / 10;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, Y1(0)); ctx.lineTo(st.W - pad, Y1(0)); ctx.moveTo(pad, Y2(0)); ctx.lineTo(st.W - pad, Y2(0)); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = -3.3 + i / 120 * 6.6; i ? ctx.lineTo(X(x), Y1(f(x))) : ctx.moveTo(X(x), Y1(f(x))); } ctx.stroke();
      const m = fp(x0); ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(x0 - 1.2), Y1(f(x0) - 1.2 * m)); ctx.lineTo(X(x0 + 1.2), Y1(f(x0) + 1.2 * m)); ctx.stroke(); dot(ctx, X(x0), Y1(f(x0)), 6, C.bad, "#fff");
      ctx.strokeStyle = C.a; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = -3.3 + i / 120 * 6.6; i ? ctx.lineTo(X(x), Y2(fp(x))) : ctx.moveTo(X(x), Y2(fp(x))); } ctx.stroke(); dot(ctx, X(x0), Y2(m), 6, C.a, "#fff");
      [-Math.SQRT2, Math.SQRT2].forEach(r => { ctx.strokeStyle = "rgba(21,128,61,.4)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(r), 8); ctx.lineTo(X(r), st.H - 6); ctx.stroke(); ctx.setLineDash([]); });
      txt(ctx, "f(x) = x³/4 − 1.5x", pad + 4, 16, C.ink, 12, "left", "600"); txt(ctx, "f′(x) = 0.75x² − 1.5", pad + 4, top + 12, C.a, 12, "left", "600");
      st.info.innerHTML = `<span>x = <b>${x0.toFixed(2)}</b></span><span>f(x) = <b>${f(x0).toFixed(2)}</b></span><span>slope f′(x) = <b>${m.toFixed(2)}</b></span><span class="hint">${Math.abs(m) < .12 ? "flat tangent: stationary point" : m > 0 ? "increasing" : "decreasing"} · green lines: f′ = 0 at ±√2</span>`; };
    st.controls({ step: false }); st.size();
  };

  /* gradient descent on an elongated bowl */
  A.gd2d = host => {
    const st = stage(host, { label: "Gradient descent on a quadratic bowl", h: 320 });
    let k = 4, eta = .2, p, path;
    const reset = () => { p = [-3.6, 2.2]; path = [p.slice()]; }; reset();
    st.interval = 380; st.tick = () => { const g = [2 * p[0], 2 * k * p[1]]; p = [p[0] - eta * g[0], p[1] - eta * g[1]]; path.push(p.slice()); if (path.length > 40 || Math.hypot(...p) > 60 || Math.hypot(...p) < 1e-3) return false; };
    st.draw = () => { const { ctx } = st, s = Math.min(st.W / 9, st.H / 6), cx = st.W / 2, cy = st.H / 2, P = (x, y) => [cx + x * s, cy - y * s]; ctx.clearRect(0, 0, st.W, st.H);
      [1, 2, 4, 7, 11, 16, 22, 30].forEach(c => { ctx.strokeStyle = "rgba(42,79,196,.25)"; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const a = i / 80 * 2 * Math.PI, x = Math.sqrt(c) * Math.cos(a), y = Math.sqrt(c / k) * Math.sin(a); i ? ctx.lineTo(...P(x, y)) : ctx.moveTo(...P(x, y)); } ctx.stroke(); });
      ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.beginPath(); path.forEach((q, i) => { const c = P(Math.max(-60, Math.min(60, q[0])), Math.max(-60, Math.min(60, q[1]))); i ? ctx.lineTo(...c) : ctx.moveTo(...c); }); ctx.stroke();
      path.forEach(q => { if (Math.abs(q[0]) < 6 && Math.abs(q[1]) < 4) dot(ctx, ...P(...q), 3.5, C.bad); }); dot(ctx, cx, cy, 5, C.ok);
      const lim = 2 / (2 * k), f = p[0] ** 2 + k * p[1] ** 2;
      st.info.innerHTML = `<span>f = x² + ${k}y²</span><span>step <b>${path.length - 1}</b></span><span>f = <b>${f > 1e4 ? "∞" : f.toFixed(4)}</b></span><span>stable if η &lt; 2/(2κ) = <b>${lim.toFixed(3)}</b></span><span class="hint">${eta >= lim ? "η too big: y diverges" : eta > 1 / (2 * k) ? "zig-zag in y" : "smooth"}</span>`; };
    st.controls({ reset });
    st.slider("η", .02, .6, .01, .2, v => { eta = v; reset(); st.draw(); }); st.slider("κ", 1, 10, 1, 4, v => { k = v; reset(); st.draw(); });
    st.size();
  };

  /* Bayes area diagram */
  A.bayesbox = host => {
    const st = stage(host, { label: "Bayes' theorem as areas", h: 300 });
    let prev = .1, sens = .9, fpr = .1, ph = 0;
    st.frame = dt => { ph += dt / 3000; prev = .02 + .28 * (0.5 + .5 * Math.sin(ph)); sl.value = prev.toFixed(2); sl.previousElementSibling.querySelector("b").textContent = prev.toFixed(2); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const x0 = 20, y0 = 14, W = st.W - 40, H = st.H - 40, wd = Math.max(2, prev * W);
      ctx.fillStyle = "#f3f1eb"; ctx.fillRect(x0, y0, W, H);
      ctx.fillStyle = "rgba(42,79,196,.75)"; ctx.fillRect(x0, y0, wd, sens * H); ctx.fillStyle = "rgba(42,79,196,.15)"; ctx.fillRect(x0, y0 + sens * H, wd, (1 - sens) * H);
      ctx.fillStyle = "rgba(224,100,26,.75)"; ctx.fillRect(x0 + wd, y0, W - wd, fpr * H);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, W, H); ctx.beginPath(); ctx.moveTo(x0 + wd, y0); ctx.lineTo(x0 + wd, y0 + H); ctx.stroke();
      txt(ctx, "has condition", x0 + 4, y0 + H + 16, C.a, 11.5, "left", "600"); txt(ctx, "healthy", x0 + W - 4, y0 + H + 16, C.muted, 11.5, "right", "600");
      txt(ctx, "false positives", x0 + wd + 8, y0 + fpr * H / 2 + 4, "#fff", 12, "left", "700");
      const tp = prev * sens, fp = (1 - prev) * fpr, post = tp / (tp + fp);
      st.info.innerHTML = `<span>prevalence <b>${(prev * 100).toFixed(1)}%</b></span><span>true + area <b style="color:${C.a}">${tp.toFixed(3)}</b></span><span>false + area <b style="color:${C.b}">${fp.toFixed(3)}</b></span><span>P(D | +) = <b>${post.toFixed(3)}</b></span>`; };
    st.controls({ step: false });
    const sl = st.slider("prevalence", .01, .5, .01, .1, v => { prev = v; st.draw(); }); st.slider("sensitivity", .5, 1, .01, .9, v => { sens = v; st.draw(); }); st.slider("FP rate", .01, .5, .01, .1, v => { fpr = v; st.draw(); });
    st.size();
  };

  /* central limit theorem */
  A.clt = host => {
    const st = stage(host, { label: "Central limit theorem", h: 340, ratio: .74 });
    const r = R(9), draw1 = () => -Math.log(1 - r()) * 1; // Exponential(1): mean 1, var 1
    let n = 1, means = [];
    st.interval = 30; st.tick = () => { for (let k = 0; k < 12; k++) { let s = 0; for (let i = 0; i < n; i++) s += draw1(); means.push(s / n); } if (means.length > 3000) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 24, top = st.H * .3;
      ctx.fillStyle = "rgba(224,100,26,.25)"; ctx.strokeStyle = C.b; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, top - 6); for (let i = 0; i <= 100; i++) { const x = i / 100 * 4; ctx.lineTo(pad + x / 4 * (st.W - 2 * pad), top - 6 - Math.exp(-x) * (top - 24)); } ctx.lineTo(st.W - pad, top - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      txt(ctx, "population: Exponential(1), very skewed", pad, 14, C.b, 12, "left", "600");
      const bins = 40, lo = 0, hi = 3, cnt = Array(bins).fill(0); means.forEach(m => { const b = Math.floor((m - lo) / (hi - lo) * bins); if (b >= 0 && b < bins) cnt[b]++; });
      const mx = Math.max(1, ...cnt), bw = (st.W - 2 * pad) / bins, base = st.H - 18, hh = st.H - top - 40;
      cnt.forEach((c, i) => { ctx.fillStyle = "rgba(42,79,196,.6)"; ctx.fillRect(pad + i * bw + 1, base - c / mx * hh, bw - 2, c / mx * hh); });
      if (means.length > 50) { const sd = 1 / Math.sqrt(n), peak = 1 / (sd * Math.sqrt(2 * Math.PI)) * (hi - lo) / bins * means.length; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 200; i++) { const x = lo + i / 200 * (hi - lo), y = means.length * (hi - lo) / bins * Math.exp(-((x - 1) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)); const px = pad + (x - lo) / (hi - lo) * (st.W - 2 * pad), py = base - Math.min(hh * 1.1, y / mx * hh); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
      txt(ctx, `histogram of sample means (n = ${n})  vs  N(1, 1/${n})`, pad, top + 14, C.a, 12, "left", "600");
      st.info.innerHTML = `<span>n = <b>${n}</b> per average</span><span>averages drawn <b>${means.length}</b></span><span>theory SD = 1/√n = <b>${(1 / Math.sqrt(n)).toFixed(3)}</b></span>`; };
    st.controls({ reset: () => { means = []; } }); st.slider("n", 1, 40, 1, 1, v => { n = v; means = []; st.draw(); });
    st.size();
  };

  /* likelihood for coin flips, with optional prior */
  A.likelihood = host => {
    const st = stage(host, { label: "Likelihood and posterior for a coin", h: 300 });
    const r = R(17), pTrue = .7; let flips = [], prior = false;
    st.interval = 650; st.tick = () => { flips.push(r() < pTrue ? 1 : 0); if (flips.length >= 60) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 26, base = st.H - 26, H = st.H - 70, X = p => pad + p * (st.W - 2 * pad);
      const n = flips.length, k = flips.reduce((a, b) => a + b, 0), a = prior ? 3 : 1, b = prior ? 3 : 1;
      const curve = (A2, B2, col, fill) => { const lp = p => (A2 - 1) * Math.log(Math.max(p, 1e-9)) + (B2 - 1) * Math.log(Math.max(1 - p, 1e-9)); let mx = -Infinity; for (let i = 1; i < 200; i++) mx = Math.max(mx, lp(i / 200));
        ctx.beginPath(); ctx.moveTo(X(0), base); for (let i = 1; i < 200; i++) { const p = i / 200; ctx.lineTo(X(p), base - Math.exp(lp(p) - mx) * H); } ctx.lineTo(X(1), base); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke(); };
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(st.W - pad, base); ctx.stroke();
      for (let i = 0; i <= 10; i++) txt(ctx, (i / 10).toFixed(1), X(i / 10), base + 15, C.muted, 10, "center");
      curve(k + 1, n - k + 1, C.a, "rgba(42,79,196,.12)"); if (prior) curve(k + a, n - k + b, C.b, "rgba(224,100,26,.12)");
      const mle = n ? k / n : .5, map = (k + a - 1) / (n + a + b - 2);
      ctx.strokeStyle = C.a; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(mle), base); ctx.lineTo(X(mle), base - H - 8); ctx.stroke(); if (prior) { ctx.strokeStyle = C.b; ctx.beginPath(); ctx.moveTo(X(map), base); ctx.lineTo(X(map), base - H - 8); ctx.stroke(); } ctx.setLineDash([]);
      txt(ctx, flips.slice(-30).map(f => f ? "H" : "T").join(" "), pad, 14, C.ink, 11.5, "left", "600");
      st.info.innerHTML = `<span>flips <b>${n}</b>, heads <b>${k}</b></span><span>MLE k/n = <b style="color:${C.a}">${mle.toFixed(3)}</b></span>${prior ? `<span>MAP with Beta(3,3) = <b style="color:${C.b}">${map.toFixed(3)}</b></span>` : ""}<span class="hint">true p = 0.7</span>`; };
    st.controls({ reset: () => { flips = []; } }); st.button("Toggle Beta(3,3) prior", () => { prior = !prior; st.draw(); }); st.size();
  };

  /* confidence interval coverage */
  A.cicover = host => {
    const st = stage(host, { label: "Coverage of 95% confidence intervals", h: 330 });
    const r = R(23), mu = 50, sigma = 10, n = 25, se = sigma / Math.sqrt(n); let cis = [];
    st.interval = 160; st.tick = () => { let s = 0; for (let i = 0; i < n; i++) s += mu + sigma * r.n(); const m = s / n; cis.push([m - 1.96 * se, m + 1.96 * se, m]); if (cis.length > 50) cis.shift(); };
    let total = 0, hit = 0; const tk = st.tick; st.tick = () => { tk(); const c = cis[cis.length - 1]; total++; if (c[0] <= mu && mu <= c[1]) hit++; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 20, X = v => pad + (v - 40) / 20 * (st.W - 2 * pad), rowH = (st.H - 20) / 50;
      ctx.strokeStyle = C.ink; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(mu), 4); ctx.lineTo(X(mu), st.H - 4); ctx.stroke(); ctx.setLineDash([]);
      cis.forEach((c, i) => { const ok = c[0] <= mu && mu <= c[1], y = 10 + i * rowH; ctx.strokeStyle = ok ? C.a : C.bad; ctx.lineWidth = ok ? 2 : 3; ctx.beginPath(); ctx.moveTo(X(c[0]), y); ctx.lineTo(X(c[1]), y); ctx.stroke(); dot(ctx, X(c[2]), y, 2.2, ok ? C.a : C.bad); });
      st.info.innerHTML = `<span>true μ = 50, σ = 10, n = 25</span><span>half-width = 1.96·σ/√n = <b>${(1.96 * se).toFixed(2)}</b></span><span>intervals <b>${total}</b></span><span>coverage <b>${total ? (100 * hit / total).toFixed(1) : "–"}%</b></span>`; };
    st.controls({ reset: () => { cis = []; total = 0; hit = 0; } }); st.size();
  };

  /* entropy & KL */
  A.entropy = host => {
    const st = stage(host, { label: "Entropy, cross-entropy and KL divergence", h: 340, ratio: .74 });
    let p = .5, ph = 0, P = [.5, .3, .2], Q = [.2, .3, .5];
    const H = d => -d.reduce((a, x) => a + (x > 0 ? x * Math.log2(x) : 0), 0);
    st.frame = dt => { ph += dt / 2200; p = .5 + .49 * Math.sin(ph); const t = .5 + .5 * Math.sin(ph * .7); Q = [.2 + .3 * t, .3, .5 - .3 * t]; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 26, top = st.H * .45, X = x => pad + x * (st.W - 2 * pad), Y = h => top - 10 - h * (top - 34);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, Y(0)); ctx.lineTo(st.W - pad, Y(0)); ctx.stroke();
      ctx.strokeStyle = C.a; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const x = i / 100; i ? ctx.lineTo(X(x), Y(H([x, 1 - x]))) : ctx.moveTo(X(0), Y(0)); } ctx.stroke(); dot(ctx, X(p), Y(H([p, 1 - p])), 6, C.bad, "#fff");
      txt(ctx, `coin entropy H(p): p = ${p.toFixed(2)} → ${H([p, 1 - p]).toFixed(3)} bits`, pad, 16, C.ink, 12, "left", "600");
      const by = top + 18, bh = st.H - by - 34, bw = (st.W - 2 * pad) / 3; ["x₁", "x₂", "x₃"].forEach((l, i) => { const x = pad + i * bw; ctx.fillStyle = "rgba(42,79,196,.7)"; ctx.fillRect(x + bw * .18, by + bh * (1 - P[i] / .8), bw * .3, bh * P[i] / .8); ctx.fillStyle = "rgba(224,100,26,.7)"; ctx.fillRect(x + bw * .52, by + bh * (1 - Q[i] / .8), bw * .3, bh * Q[i] / .8); txt(ctx, l, x + bw / 2, by + bh + 14, C.muted, 11, "center"); });
      const kl = P.reduce((a, x, i) => a + x * Math.log2(x / Q[i]), 0);
      st.info.innerHTML = `<span><b style="color:${C.a}">P</b> = (${P.join(", ")})</span><span><b style="color:${C.b}">Q</b> = (${Q.map(x => x.toFixed(2)).join(", ")})</span><span>H(P) = <b>${H(P).toFixed(3)}</b></span><span>KL(P‖Q) = <b>${kl.toFixed(3)}</b></span><span>H(P,Q) = <b>${(H(P) + kl).toFixed(3)}</b> bits</span>`; };
    st.controls({ step: false }); st.size();
  };
})();
