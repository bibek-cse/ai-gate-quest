/* Animations for Deep Learning. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const sg = z => 1 / (1 + Math.exp(-z));

  /* optimiser race on an elongated valley f = 0.05x² + y² */
  A.optrace = host => {
    const st = stage(host, { label: "SGD vs momentum vs Adam", h: 320 });
    const f = (x, y) => .05 * x * x + y * y, g = (x, y) => [.1 * x, 2 * y];
    let S, step;
    const reset = () => { step = 0; S = { sgd: { p: [-9, 2.2], path: [[-9, 2.2]] }, mom: { p: [-9, 2.2], v: [0, 0], path: [[-9, 2.2]] }, adam: { p: [-9, 2.2], m: [0, 0], s: [0, 0], path: [[-9, 2.2]] } }; }; reset();
    st.interval = 70; st.tick = () => { step++;
      { const o = S.sgd, gr = g(...o.p); o.p = [o.p[0] - .9 * gr[0], o.p[1] - .9 * gr[1]]; o.path.push(o.p.slice()); }
      { const o = S.mom, gr = g(...o.p); o.v = [.9 * o.v[0] + gr[0], .9 * o.v[1] + gr[1]]; o.p = [o.p[0] - .09 * o.v[0], o.p[1] - .09 * o.v[1]]; o.path.push(o.p.slice()); }
      { const o = S.adam, gr = g(...o.p); o.m = o.m.map((m, i) => .9 * m + .1 * gr[i]); o.s = o.s.map((s, i) => .999 * s + .001 * gr[i] * gr[i]);
        const mh = o.m.map(m => m / (1 - .9 ** step)), sh = o.s.map(s => s / (1 - .999 ** step)); o.p = o.p.map((p, i) => p - .25 * mh[i] / (Math.sqrt(sh[i]) + 1e-8)); o.path.push(o.p.slice()); }
      if (step >= 120) return false; };
    st.draw = () => { const { ctx } = st, sx = (st.W - 30) / 22, sy = (st.H - 30) / 6, P = (x, y) => [st.W / 2 + x * sx, st.H / 2 - y * sy]; ctx.clearRect(0, 0, st.W, st.H);
      [.05, .2, .5, 1, 2, 3.5, 5].forEach(c => { ctx.strokeStyle = "rgba(107,112,128,.22)"; ctx.beginPath(); for (let i = 0; i <= 90; i++) { const a = i / 90 * 2 * Math.PI, x = Math.sqrt(c / .05) * Math.cos(a), y = Math.sqrt(c) * Math.sin(a); i ? ctx.lineTo(...P(x, y)) : ctx.moveTo(...P(x, y)); } ctx.stroke(); });
      [["sgd", C.muted], ["mom", C.b], ["adam", C.a]].forEach(([k, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); S[k].path.forEach((q, i) => i ? ctx.lineTo(...P(...q)) : ctx.moveTo(...P(...q))); ctx.stroke(); dot(ctx, ...P(...S[k].p), 5, col, "#fff"); });
      dot(ctx, ...P(0, 0), 5, C.ok);
      st.info.innerHTML = `<span>step <b>${step}</b></span><span style="color:${C.muted}">SGD f = <b>${f(...S.sgd.p).toFixed(3)}</b></span><span style="color:${C.b}">Momentum f = <b>${f(...S.mom.p).toFixed(3)}</b></span><span style="color:${C.a}">Adam f = <b>${f(...S.adam.p).toFixed(3)}</b></span>`; };
    st.controls({ reset }); st.size();
  };

  /* batch norm strips */
  A.batchnorm = host => {
    const st = stage(host, { label: "Batch normalisation of a feature", h: 320 });
    const r = R(31); let t = 0, batch = [], gamma = 1.5, beta = .8;
    const newBatch = () => { const mu = 2.5 * Math.sin(t / 3) + 1, sd = 1.2 + .8 * Math.sin(t / 5 + 1); batch = Array.from({ length: 32 }, () => mu + sd * r.n()); t++; }; newBatch();
    st.interval = 900; st.tick = () => newBatch();
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 30, X = v => pad + (v + 6) / 12 * (st.W - 2 * pad);
      const mu = batch.reduce((a, b) => a + b, 0) / batch.length, sd = Math.sqrt(batch.reduce((a, x) => a + (x - mu) ** 2, 0) / batch.length), nx = batch.map(x => (x - mu) / sd), yx = nx.map(x => gamma * x + beta);
      const rows = [["raw activations x", batch, mu, sd], ["normalised x̂ = (x − μ_B)/σ_B", nx, 0, 1], [`output y = γx̂ + β  (γ = ${gamma}, β = ${beta})`, yx, beta, gamma]];
      rows.forEach(([lab, vals, m, s], k) => { const y0 = 28 + k * (st.H - 30) / 3, h = (st.H - 30) / 3 - 34;
        ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, y0 + h); ctx.lineTo(st.W - pad, y0 + h); ctx.stroke();
        for (let v = -6; v <= 6; v += 2) txt(ctx, v, X(v), y0 + h + 13, C.muted, 10, "center");
        ctx.fillStyle = "rgba(42,79,196,.10)"; ctx.fillRect(X(m - s), y0 + 4, X(m + s) - X(m - s), h - 4);
        vals.forEach((v, i) => dot(ctx, X(Math.max(-6, Math.min(6, v))), y0 + 8 + (i * 37 % 29) / 29 * (h - 14), 3.2, [C.a, C.b, C.ok][k]));
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(m), y0 + 2); ctx.lineTo(X(m), y0 + h); ctx.stroke();
        txt(ctx, lab, pad, y0 - 2, C.ink, 12, "left", "600"); });
      st.info.innerHTML = `<span>batch <b>${t}</b></span><span>μ_B = <b>${mu.toFixed(2)}</b></span><span>σ_B = <b>${sd.toFixed(2)}</b></span><span class="hint">shaded band = mean ± 1 std</span>`; };
    st.controls({ step: true }); st.slider("γ", .5, 3, .1, 1.5, v => { gamma = v; st.draw(); }); st.slider("β", -2, 2, .1, .8, v => { beta = v; st.draw(); }); st.size();
  };

  /* convolution with an edge kernel */
  A.conv = host => {
    const st = stage(host, { label: "A 3×3 kernel sliding over an image", h: 300, ratio: .6 });
    const img = Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (_, j) => j < 3 ? 1 : j === 3 ? 4 : 8 + ((i + j) % 2)));
    const K = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
    const out = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => { let s = 0; for (let u = 0; u < 3; u++) for (let v = 0; v < 3; v++) s += K[u][v] * img[i + u][j + v]; return s; }));
    let pos = 0; st.interval = 700; st.tick = () => { pos = (pos + 1) % 26; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const cs = Math.min((st.W - 60) / 12.5, (st.H - 40) / 7.4), ix = 14, iy = 30, ox = ix + 7 * cs + 34, oy = iy + cs;
      const done = Math.min(pos, 25), ci = Math.floor(Math.min(pos, 24) / 5), cj = Math.min(pos, 24) % 5;
      txt(ctx, "input 7×7", ix, iy - 8, C.ink, 12, "left", "600"); txt(ctx, "output 5×5", ox, oy - 8, C.ink, 12, "left", "600");
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { const v = img[i][j]; ctx.fillStyle = `rgb(${255 - v * 25},${255 - v * 25},${255 - v * 25})`; ctx.fillRect(ix + j * cs, iy + i * cs, cs - 1, cs - 1); txt(ctx, v, ix + j * cs + cs / 2, iy + i * cs + cs / 2 + 4, v > 5 ? "#fff" : C.ink, Math.min(12, cs * .45), "center", "600"); }
      if (pos < 25) { ctx.strokeStyle = C.bad; ctx.lineWidth = 3; ctx.strokeRect(ix + cj * cs, iy + ci * cs, 3 * cs - 1, 3 * cs - 1); }
      const mx = Math.max(...out.flat().map(Math.abs));
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const k = i * 5 + j, x = ox + j * cs, y = oy + i * cs; ctx.fillStyle = k < done ? `rgba(42,79,196,${.08 + .8 * Math.abs(out[i][j]) / mx})` : "#f3f1eb"; ctx.fillRect(x, y, cs - 1, cs - 1);
        if (k < done) txt(ctx, out[i][j], x + cs / 2, y + cs / 2 + 4, Math.abs(out[i][j]) / mx > .5 ? "#fff" : C.ink, Math.min(12, cs * .45), "center", "700"); }
      if (pos < 25) { ctx.strokeStyle = C.bad; ctx.lineWidth = 3; ctx.strokeRect(ox + cj * cs, oy + ci * cs, cs - 1, cs - 1); }
      const terms = []; if (pos < 25) for (let u = 0; u < 3; u++) for (let v = 0; v < 3; v++) if (K[u][v]) terms.push(`${K[u][v] > 0 ? "+" : "−"}${img[ci + u][cj + v]}`);
      st.info.innerHTML = `<span>kernel [[−1,0,1]]×3 (vertical-edge detector)</span>${pos < 25 ? `<span>position (${ci},${cj}): ${terms.join(" ")} = <b>${out[ci][cj]}</b></span>` : `<span><b>done</b>: strong response only at the edge columns</span>`}`; };
    st.controls({ reset: () => { pos = 0; } }); st.size();
  };

  /* gradient flow: plain vs residual */
  A.resflow = host => {
    const st = stage(host, { label: "Gradient flow through deep plain and residual nets", h: 300 });
    const L = 20, r = R(5), plain = [], res = []; let gp = 1, gr = 1;
    for (let l = L; l >= 1; l--) { plain[l] = gp; res[l] = gr; gp *= .6; gr *= 1 + (r() - .55) * .12; }
    let front = L + 1; st.interval = 140; st.tick = () => { front--; if (front <= 0) { front = 0; return false; } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 30, bw = (st.W - 2 * pad) / L, rowH = (st.H - 60) / 2;
      const draw = (vals, y0, col, lab) => { txt(ctx, lab, pad, y0 - 6, C.ink, 12, "left", "600"); ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, y0 + rowH - 18); ctx.lineTo(st.W - pad, y0 + rowH - 18); ctx.stroke();
        for (let l = 1; l <= L; l++) { const x = pad + (l - 1) * bw; const show = l >= front; const v = vals[l], h = Math.max(1, (Math.log10(v) + 6) / 6.4 * (rowH - 24));
          ctx.fillStyle = show ? col : "#ebe8e1"; ctx.fillRect(x + 2, y0 + rowH - 18 - (show ? h : 4), bw - 4, show ? h : 4); }
        if (front <= 1) txt(ctx, `layer 1 gets ${vals[1] < 1e-3 ? vals[1].toExponential(1) : vals[1].toFixed(2)}`, st.W - pad, y0 - 6, col, 12, "right", "700"); };
      draw(plain, 26, C.bad, "Plain net (×0.6 per layer)"); draw(res, 26 + rowH + 14, C.ok, "Residual net (×(1 + small))");
      txt(ctx, "layer 1 … 20 (log-scale gradient magnitude, backward pass flows right → left)", pad, st.H - 6, C.muted, 10.5);
      st.info.innerHTML = `<span>backward pass reached layer <b>${Math.max(1, front)}</b></span><span>0.6¹⁹ ≈ <b>${(0.6 ** 19).toExponential(1)}</b></span><span class="hint">y = x + F(x) ⇒ ∂y/∂x = I + ∂F/∂x</span>`; };
    st.controls({ reset: () => { front = L + 1; } }); st.size();
  };

  /* RNN vs LSTM gradient through time */
  A.rnnflow = host => {
    const st = stage(host, { label: "Gradient through time: RNN vs LSTM", h: 300 });
    const T = 30; let front = T + 1, rho = .85, f = .98;
    st.interval = 110; st.tick = () => { front--; if (front <= 0) { front = 0; return false; } };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 30, bw = (st.W - 2 * pad) / T, rowH = (st.H - 60) / 2;
      const row = (fac, y0, col, lab) => { txt(ctx, lab, pad, y0 - 6, C.ink, 12, "left", "600");
        for (let t = 1; t <= T; t++) { const v = fac ** (T - t), show = t >= front, x = pad + (t - 1) * bw, h = v * (rowH - 24); ctx.fillStyle = show ? col : "#ebe8e1"; ctx.fillRect(x + 1.5, y0 + rowH - 18 - (show ? Math.max(1.5, h) : 3), bw - 3, show ? Math.max(1.5, h) : 3); }
        if (front <= 1) txt(ctx, `t = 1 receives ${(fac ** (T - 1)).toFixed(3)}`, st.W - pad, y0 - 6, col, 12, "right", "700"); };
      row(rho, 26, C.bad, `Vanilla RNN (Jacobian norm ≈ ${rho})`); row(f, 26 + rowH + 14, C.ok, `LSTM cell path (forget gate ≈ ${f})`);
      txt(ctx, "time step 1 … 30 (gradient arriving from the loss at t = 30)", pad, st.H - 6, C.muted, 10.5);
      st.info.innerHTML = `<span>signal reached t = <b>${Math.max(1, front)}</b></span><span>RNN: ${rho}²⁹ = <b>${(rho ** 29).toFixed(4)}</b></span><span>LSTM: ${f}²⁹ = <b>${(f ** 29).toFixed(3)}</b></span>`; };
    st.controls({ reset: () => { front = T + 1; } });
    st.slider("RNN factor", .5, 1, .01, .85, v => { rho = v; st.draw(); }); st.slider("forget gate", .8, 1, .01, .98, v => { f = v; st.draw(); }); st.size();
  };

  /* attention weights over a sentence */
  A.attention = host => {
    const st = stage(host, { label: "Self-attention weights", h: 380, ratio: 1.05 });
    const toks = ["The", "cat", "sat", "on", "the", "mat", "because", "it", "was", "tired"], n = toks.length;
    const link = { "1,7": 3.2, "7,1": 3.5, "2,1": 2.4, "3,5": 2.2, "5,3": 1.6, "9,7": 2.2, "9,1": 2.6, "8,7": 1.8, "6,2": 1.6, "4,5": 2, "0,1": 2, "5,4": 1.5 };
    const r = R(3), S = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1.2 : 0) + (link[i + "," + j] || 0) + r() * .6));
    let q = 7, causal = false;
    const W = () => S.map((row, i) => { const s = row.map((v, j) => causal && j > i ? -Infinity : v), m = Math.max(...s), e = s.map(v => Math.exp(v - m)), z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); });
    st.interval = 1600; st.tick = () => { q = (q + 1) % n; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const Wm = W(), lh = Math.min(28, (st.H * .55) / n), lx = 18, rx = st.W * .44, top = 22;
      txt(ctx, "query", lx, 14, C.muted, 11); txt(ctx, "keys", rx, 14, C.muted, 11);
      toks.forEach((t, i) => { const y = top + i * lh + lh / 2; txt(ctx, t, lx + 40, y + 4, i === q ? C.a : C.ink, 13, "right", i === q ? "800" : "500"); txt(ctx, t, rx + 4, y + 4, C.ink, 13, "left", "500"); });
      toks.forEach((_, j) => { const w = Wm[q][j]; if (w < .01) return; ctx.strokeStyle = `rgba(42,79,196,${.15 + .85 * w})`; ctx.lineWidth = 1 + 12 * w; ctx.beginPath(); const y0 = top + q * lh + lh / 2, y1 = top + j * lh + lh / 2; ctx.moveTo(lx + 46, y0); ctx.bezierCurveTo((lx + rx) / 2, y0, (lx + rx) / 2, y1, rx - 2, y1); ctx.stroke(); });
      const mx = rx + 70, cs = Math.min((st.W - mx - 10) / n, lh); if (cs > 6) { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const w = Wm[i][j]; ctx.fillStyle = `rgba(42,79,196,${w})`; ctx.fillRect(mx + j * cs, top + i * cs, cs - 1, cs - 1); }
        ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.strokeRect(mx, top + q * cs, n * cs - 1, cs - 1); txt(ctx, "attention matrix", mx, 14, C.muted, 11); }
      const by = top + n * lh + 18, bw = (st.W - 36) / n; toks.forEach((t, j) => { const h = Wm[q][j] * (st.H - by - 22); ctx.fillStyle = C.a; ctx.fillRect(18 + j * bw + 2, st.H - 18 - h, bw - 4, h); txt(ctx, t.slice(0, 4), 18 + j * bw + bw / 2, st.H - 5, C.muted, 9.5, "center"); });
      const top2 = Wm[q].map((w, j) => [w, toks[j]]).sort((a, b) => b[0] - a[0]).slice(0, 2);
      st.info.innerHTML = `<span>query "<b>${toks[q]}</b>"</span><span>attends most to "<b>${top2[0][1]}</b>" (${top2[0][0].toFixed(2)}) and "<b>${top2[1][1]}</b>" (${top2[1][0].toFixed(2)})</span><span class="hint">${causal ? "causal mask on: no looking ahead" : "bidirectional"}</span>`; };
    st.controls({ step: true }); st.button("Toggle causal mask", () => { causal = !causal; st.draw(); }); st.size();
  };

  /* VAE latent space & reparameterisation */
  A.reparam = host => {
    const st = stage(host, { label: "VAE posteriors versus the prior", h: 320 });
    const base = [[-2.4, 1.6, .25, .35], [2.2, 1.8, .3, .2], [-1.8, -2.1, .2, .3], [2.6, -1.5, .35, .25]], cols = [C.a, C.b, C.ok, "#a0306a"], r = R(13);
    let beta = .3, eps = base.map(() => Array.from({ length: 14 }, () => [r.n(), r.n()]));
    st.interval = 500; st.tick = () => { eps = base.map(() => Array.from({ length: 14 }, () => [r.n(), r.n()])); };
    st.draw = () => { const { ctx } = st, s = Math.min(st.W, st.H) / 7.5, cx = st.W / 2, cy = st.H / 2, P = (x, y) => [cx + x * s, cy - y * s]; ctx.clearRect(0, 0, st.W, st.H);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(st.W, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, st.H); ctx.stroke();
      ctx.setLineDash([6, 5]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 2 * s, 0, 7); ctx.stroke(); ctx.setLineDash([]); txt(ctx, "prior N(0, I), 2σ circle", 8, st.H - 8, C.ink, 11);
      let kl = 0; base.forEach(([mx, my, sx, sy], k) => { const shrink = 1 - .55 * beta, mux = mx * shrink, muy = my * shrink, ssx = sx + (1 - sx) * .55 * beta, ssy = sy + (1 - sy) * .55 * beta;
        kl += .5 * (mux * mux + muy * muy + ssx * ssx + ssy * ssy - 2 - Math.log(ssx * ssx) - Math.log(ssy * ssy));
        ctx.fillStyle = cols[k] + "22"; ctx.strokeStyle = cols[k]; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(...P(mux, muy), 2 * ssx * s, 2 * ssy * s, 0, 0, 7); ctx.fill(); ctx.stroke();
        eps[k].forEach(([a, b]) => dot(ctx, ...P(mux + ssx * a, muy + ssy * b), 2.6, cols[k])); dot(ctx, ...P(mux, muy), 4.5, "#fff", cols[k]); });
      st.info.innerHTML = `<span>KL weight β = <b>${beta.toFixed(2)}</b></span><span>Σ KL to prior ≈ <b>${kl.toFixed(2)}</b></span><span class="hint">dots = samples z = μ + σ·ε; higher β pulls codes toward the prior (smoother, blurrier)</span>`; };
    st.controls({ step: false }); st.slider("KL weight β", 0, 1, .05, .3, v => { beta = v; st.draw(); }); st.size();
  };

  /* 1-D GAN */
  A.gan1d = host => {
    const st = stage(host, { label: "A GAN learning a 1-D distribution", h: 320 });
    const r = R(41); let a, b, w, it; const muR = 2, sdR = .5;
    const reset = () => { a = -2; b = .35; w = [0, 0, 0]; it = 0; }; reset();
    const D = x => sg(w[0] + w[1] * x + w[2] * x * x);
    st.interval = 40; st.tick = () => { for (let rep = 0; rep < 2; rep++) {
        const gd = [0, 0, 0]; for (let k = 0; k < 64; k++) { const xr = muR + sdR * r.n(), xf = a + b * r.n(), dr = D(xr), df = D(xf);
          [1, xr, xr * xr].forEach((v, i) => gd[i] += (1 - dr) * v); [1, xf, xf * xf].forEach((v, i) => gd[i] -= df * v); }
        w = w.map((v, i) => Math.max(-6, Math.min(6, v + .02 * gd[i] / 64))); }
      let ga = 0, gb = 0; for (let k = 0; k < 64; k++) { const z = r.n(), x = a + b * z, d = D(x), dd = (1 - d) * (w[1] + 2 * w[2] * x); ga += dd; gb += dd * z; }
      a += .05 * ga / 64; b = Math.max(.05, b + .02 * gb / 64); it++; if (it > 900) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 24, X = x => pad + (x + 4) / 8 * (st.W - 2 * pad), base = st.H - 26, H = st.H - 60;
      const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * 2.5066), sc = H / pdf(0, 0, .35);
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(st.W - pad, base); ctx.stroke(); for (let x = -4; x <= 4; x++) txt(ctx, x, X(x), base + 14, C.muted, 10, "center");
      [[muR, sdR, C.a, "real"], [a, b, C.b, "generated"]].forEach(([m, s, col]) => { ctx.fillStyle = col + "33"; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(-4), base); for (let i = 0; i <= 200; i++) { const x = -4 + i / 25; ctx.lineTo(X(x), base - Math.min(H, pdf(x, m, s) * sc)); } ctx.lineTo(X(4), base); ctx.closePath(); ctx.fill(); ctx.stroke(); });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = -4 + i / 25; i ? ctx.lineTo(X(x), base - D(x) * H) : ctx.moveTo(X(x), base - D(x) * H); } ctx.stroke();
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(pad, base - .5 * H); ctx.lineTo(st.W - pad, base - .5 * H); ctx.stroke(); ctx.setLineDash([]); txt(ctx, "D = 0.5", st.W - pad, base - .5 * H - 4, C.muted, 10, "right");
      st.info.innerHTML = `<span>step <b>${it}</b></span><span style="color:${C.b}">generator mean <b>${a.toFixed(2)}</b>, std <b>${b.toFixed(2)}</b></span><span style="color:${C.a}">real: mean 2, std 0.5</span><span>D at real mean <b>${D(2).toFixed(2)}</b></span>`; };
    st.controls({ reset }); st.size();
  };

  /* diffusion forward / reverse on a 2-D spiral */
  A.diffusion = host => {
    const st = stage(host, { label: "Forward noising and reverse denoising", h: 320 });
    const r = R(77), N = 260, T = 100, x0 = [], eps = [];
    for (let i = 0; i < N; i++) { const t = i / N * 3.2 * Math.PI + .6, rad = .25 + t / 10; x0.push([rad * Math.cos(t) + .03 * r.n(), rad * Math.sin(t) + .03 * r.n()]); eps.push([r.n(), r.n()]); }
    const betas = Array.from({ length: T }, (_, i) => .001 + (.06 - .001) * i / (T - 1)), ab = []; let p = 1; betas.forEach(b => { p *= 1 - b; ab.push(p); });
    let t = 0, dir = 1; st.interval = 60; st.tick = () => { t += dir; if (t >= T) { t = T; dir = -1; } else if (t <= 0) { t = 0; dir = 1; } };
    st.draw = () => { const { ctx } = st, s = Math.min(st.W, st.H) / 6.5, cx = st.W / 2, cy = st.H / 2; ctx.clearRect(0, 0, st.W, st.H);
      const a = t ? ab[t - 1] : 1, sa = Math.sqrt(a), sn = Math.sqrt(1 - a);
      x0.forEach((q, i) => dot(ctx, cx + (sa * q[0] + sn * eps[i][0]) * s, cy - (sa * q[1] + sn * eps[i][1]) * s, 2.4, dir > 0 ? C.b : C.a));
      const bw = st.W - 40; ctx.fillStyle = "#ebe8e1"; ctx.fillRect(20, st.H - 14, bw, 6); ctx.fillStyle = dir > 0 ? C.b : C.a; ctx.fillRect(20, st.H - 14, bw * t / T, 6);
      txt(ctx, dir > 0 ? "forward process q: adding noise →" : "← reverse process p_θ: denoising", 20, 16, dir > 0 ? C.b : C.a, 12.5, "left", "700");
      st.info.innerHTML = `<span>t = <b>${t}</b> / ${T}</span><span>ᾱ_t = <b>${a.toFixed(3)}</b></span><span>signal √ᾱ = <b>${sa.toFixed(2)}</b>, noise √(1−ᾱ) = <b>${sn.toFixed(2)}</b></span><span>SNR = <b>${(a / (1 - a + 1e-9)).toFixed(2)}</b></span>`; };
    st.controls({ reset: () => { t = 0; dir = 1; } }); st.size();
  };

  /* contrastive learning on the circle */
  A.contrastive = host => {
    const st = stage(host, { label: "Contrastive learning with InfoNCE", h: 330 });
    const K = 8, r = R(19), cols = ["#2f5bd3", "#e0641a", "#15803d", "#a0306a", "#8a5a00", "#0f6e7a", "#c2352b", "#5b3a1e"]; let Z, it; const tau = .3;
    const reset = () => { Z = Array.from({ length: 2 * K }, () => { const a = r() * 2 * Math.PI; return [Math.cos(a), Math.sin(a)]; }); it = 0; }; reset();
    const pos = i => i < K ? i + K : i - K;
    function lossGrad() { const G = Z.map(() => [0, 0]); let L = 0;
      for (let i = 0; i < 2 * K; i++) { const sims = Z.map((z, j) => j === i ? -Infinity : (z[0] * Z[i][0] + z[1] * Z[i][1]) / tau), m = Math.max(...sims.filter(isFinite)), e = sims.map(s => isFinite(s) ? Math.exp(s - m) : 0), Zs = e.reduce((a, b) => a + b, 0), p = e.map(v => v / Zs);
        L += -Math.log(p[pos(i)]);
        for (let j = 0; j < 2 * K; j++) { if (j === i) continue; const c = (p[j] - (j === pos(i) ? 1 : 0)) / tau; G[i][0] += c * Z[j][0]; G[i][1] += c * Z[j][1]; G[j][0] += c * Z[i][0]; G[j][1] += c * Z[i][1]; } }
      return [L / (2 * K), G]; }
    let curL = lossGrad()[0];
    st.interval = 60; st.tick = () => { const [L, G] = lossGrad(); curL = L; Z = Z.map((z, i) => { const n = [z[0] - .05 * G[i][0], z[1] - .05 * G[i][1]], l = Math.hypot(...n); return [n[0] / l, n[1] / l]; }); it++; if (it > 400) return false; };
    st.draw = () => { const { ctx } = st, rad = Math.min(st.W, st.H) / 2 - 30, cx = st.W / 2, cy = st.H / 2; ctx.clearRect(0, 0, st.W, st.H);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.stroke();
      for (let i = 0; i < K; i++) { ctx.strokeStyle = cols[i] + "88"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + Z[i][0] * rad, cy - Z[i][1] * rad); ctx.lineTo(cx + Z[i + K][0] * rad, cy - Z[i + K][1] * rad); ctx.stroke(); }
      Z.forEach((z, i) => dot(ctx, cx + z[0] * rad, cy - z[1] * rad, i < K ? 7 : 5, cols[i % K], "#fff"));
      const align = Array.from({ length: K }, (_, i) => Z[i][0] * Z[i + K][0] + Z[i][1] * Z[i + K][1]).reduce((a, b) => a + b, 0) / K;
      st.info.innerHTML = `<span>step <b>${it}</b></span><span>InfoNCE loss <b>${curL.toFixed(3)}</b> (chance = ln ${2 * K - 1} = ${Math.log(2 * K - 1).toFixed(2)})</span><span>mean positive cosine <b>${align.toFixed(2)}</b></span><span class="hint">τ = ${tau}; big dot = view 1, small dot = view 2</span>`; };
    st.controls({ reset: () => { reset(); curL = lossGrad()[0]; } }); st.size();
  };
})();
