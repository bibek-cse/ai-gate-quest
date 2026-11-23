/* Animations for Large Language Models. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const sg = z => 1 / (1 + Math.exp(-z));
  const rr = (ctx, x, y, w, h, rad) => { ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad); ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath(); };

  /* BPE merges */
  A.bpe = host => {
    const st = stage(host, { label: "Byte-Pair Encoding merges", h: 330 });
    const corpus = [["low", 5], ["lower", 2], ["newest", 6], ["widest", 3]];
    let words, merges, best;
    const count = () => { const c = {}; words.forEach(([w, f]) => { for (let i = 0; i < w.length - 1; i++) { const k = w[i] + "\u0001" + w[i + 1]; c[k] = (c[k] || 0) + f; } }); return c; };
    const reset = () => { words = corpus.map(([w, f]) => [w.split(""), f]); merges = []; best = null; const c = count(); best = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; }; reset();
    st.interval = 1700; st.tick = () => { if (!best || merges.length >= 6) return false; const [a, b] = best[0].split("\u0001");
      words = words.map(([w, f]) => { const o = []; for (let i = 0; i < w.length; i++) { if (i < w.length - 1 && w[i] === a && w[i + 1] === b) { o.push(a + b); i++; } else o.push(w[i]); } return [o, f]; });
      merges.push([a, b, best[1]]); const c = count(), e = Object.entries(c).sort((x, y) => y[1] - x[1]); best = e.length ? e[0] : null; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H);
      txt(ctx, "corpus (word × frequency), current tokens", 14, 18, C.ink, 12, "left", "600");
      const [ba, bb] = best ? best[0].split("\u0001") : ["", ""];
      words.forEach(([w, f], k) => { let x = 14; const y = 36 + k * 36; w.forEach((t, i) => { const hit = best && ((t === ba && w[i + 1] === bb) || (t === bb && w[i - 1] === ba)); ctx.font = "600 14px 'JetBrains Mono', monospace"; const tw = ctx.measureText(t).width + 14;
          ctx.fillStyle = hit ? "rgba(224,100,26,.18)" : t.length > 1 ? "rgba(42,79,196,.12)" : "#f3f1eb"; ctx.strokeStyle = hit ? C.b : t.length > 1 ? C.a : C.grid; ctx.lineWidth = 1.5; rr(ctx, x, y, tw, 26, 6); ctx.fill(); ctx.stroke(); txt(ctx, t, x + tw / 2, y + 18, C.ink, 14, "center", "600"); x += tw + 4; });
        txt(ctx, "× " + f, x + 8, y + 18, C.muted, 12, "left"); });
      const y0 = 36 + 4 * 36 + 10; txt(ctx, "learned merges (in order)", 14, y0, C.ink, 12, "left", "600");
      merges.forEach(([a, b, c], i) => txt(ctx, `${i + 1}. ${a} + ${b} → ${a + b}  (${c})`, 14 + (i % 2) * (st.W / 2), y0 + 20 + Math.floor(i / 2) * 18, C.a, 12, "left", "600"));
      st.info.innerHTML = `<span>merges <b>${merges.length}</b></span>${best ? `<span>next: <b>${ba} + ${bb}</b> (count ${best[1]})</span>` : "<span>no more pairs</span>"}<span class="hint">orange = pair about to merge</span>`; };
    st.controls({ reset }); st.size();
  };

  /* RoPE */
  A.rope = host => {
    const st = stage(host, { label: "Rotary position embedding", h: 380, ratio: 1 });
    let m = 5, n = 2, th = .35, auto = 0;
    st.interval = 60; st.tick = () => { auto += .03; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const top = 86, R0 = Math.max(30, Math.min(st.W / 2, st.H - top) / 2 - 14), cx = st.W / 2, cy = top + (st.H - top) / 2;
      const shift = Math.floor(auto) % 6, mm = m + shift, nn = n + shift, base = .4;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - R0 - 10, cy); ctx.lineTo(cx + R0 + 10, cy); ctx.moveTo(cx, cy - R0 - 6); ctx.lineTo(cx, cy + R0 + 6); ctx.stroke();
      const arrow = (ang, col, len) => { const x = cx + len * Math.cos(ang), y = cy - len * Math.sin(ang); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); dot(ctx, x, y, 5, col); };
      const aq = base + mm * th, ak = base - .9 + nn * th;
      ctx.strokeStyle = "rgba(160,48,106,.7)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, R0 * .35, -Math.max(aq, ak), -Math.min(aq, ak)); ctx.stroke();
      arrow(aq, C.a, R0); arrow(ak, C.b, R0 * .8);
      const dp = Math.cos(aq - ak);
      txt(ctx, `q (pos ${mm}) rotated by ${mm}·θ = ${(mm * th).toFixed(2)} rad`, 12, 18, C.a, 12, "left", "700"); txt(ctx, `k (pos ${nn}) rotated by ${nn}·θ = ${(nn * th).toFixed(2)} rad`, 12, 38, C.b, 12, "left", "700");
      txt(ctx, `angle between them: ${((mm - nn) * th).toFixed(2)} rad + fixed offset`, 12, 58, "#a0306a", 12, "left", "600"); txt(ctx, `q·k = ${dp.toFixed(3)} (unchanged as both shift)`, 12, 78, C.ink, 12, "left", "800");
      st.info.innerHTML = `<span>m = <b>${mm}</b>, n = <b>${nn}</b></span><span>offset <b>${mm - nn}</b></span><span class="hint">both positions slide; the score stays fixed because only m − n matters</span>`; };
    st.controls({ step: false }); st.slider("query pos m", 0, 12, 1, 5, v => { m = v; st.draw(); }); st.slider("key pos n", 0, 12, 1, 2, v => { n = v; st.draw(); }); st.slider("θ", .1, 1, .05, .35, v => { th = v; st.draw(); }); st.size();
  };

  /* causal attention matrix */
  A.causal = host => {
    const st = stage(host, { label: "Causal self-attention", h: 340, ratio: .95 });
    const toks = ["<bos>", "The", "cat", "sat", "on", "the", "mat"], n = toks.length, r = R(8);
    const S = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j === i ? 1 : 0) + (j === 0 ? .8 : 0) + ((i === 3 && j === 2) || (i === 6 && j === 5) || (i === 5 && j === 4) || (i === 4 && j === 3) ? 2.2 : 0) + r() * .8));
    const W = S.map((row, i) => { const e = row.map((v, j) => j <= i ? Math.exp(v) : 0), z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); });
    let row = 0; st.interval = 1100; st.tick = () => { row = (row + 1) % n; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const lab = 48, cs = Math.min((st.W - lab - 20) / n, (st.H - lab - 30) / n), x0 = lab + 8, y0 = lab;
      toks.forEach((t, j) => { ctx.save(); ctx.translate(x0 + j * cs + cs / 2, y0 - 6); ctx.rotate(-Math.PI / 4); txt(ctx, t, 0, 0, C.ink, 11, "left", "600"); ctx.restore(); txt(ctx, t, x0 - 6, y0 + j * cs + cs / 2 + 4, j === row ? C.a : C.ink, 11, "right", j === row ? "800" : "500"); });
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = x0 + j * cs, y = y0 + i * cs;
        if (j > i) { ctx.fillStyle = "#ece9e2"; ctx.fillRect(x, y, cs - 2, cs - 2); ctx.strokeStyle = "#d8d4ca"; ctx.beginPath(); ctx.moveTo(x + 3, y + cs - 5); ctx.lineTo(x + cs - 5, y + 3); ctx.stroke(); continue; }
        const w = W[i][j]; ctx.fillStyle = `rgba(42,79,196,${.08 + .92 * w})`; ctx.fillRect(x, y, cs - 2, cs - 2); if (i === row && cs > 26) txt(ctx, w.toFixed(2), x + cs / 2 - 1, y + cs / 2 + 4, w > .45 ? "#fff" : C.ink, 10, "center", "700"); }
      ctx.strokeStyle = C.b; ctx.lineWidth = 2.5; ctx.strokeRect(x0 - 1, y0 + row * cs - 1, n * cs, cs);
      const esc = t => t.replace("<", "&lt;").replace(">", "&gt;"); const top = W[row].map((w, j) => [w, toks[j]]).filter((_, j) => j <= row).sort((a, b) => b[0] - a[0])[0];
      st.info.innerHTML = `<span>query "<b>${esc(toks[row])}</b>" sees ${row + 1} token(s)</span><span>strongest: "<b>${esc(top[1])}</b>" (${top[0].toFixed(2)})</span><span>row sum = <b>${W[row].reduce((a, b) => a + b, 0).toFixed(2)}</b></span><span class="hint">grey = masked future (−∞ before softmax)</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* scaling laws */
  A.scaling = host => {
    const st = stage(host, { label: "Scaling laws and the Chinchilla point", h: 330 });
    const E = 1.69, Ac = 406.4, Bc = 410.7, al = .34, be = .28, L = (N, D) => E + Ac / N ** al + Bc / D ** be;
    let logC = 22, prog = 0; st.interval = 40; st.tick = () => { prog = Math.min(1, prog + .02); if (prog >= 1) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 40, cmin = 18, cmax = 25, lmin = 1.8, lmax = 4.2,
        X = lc => pad + (lc - cmin) / (cmax - cmin) * (st.W - pad - 12), Y = l => 12 + (lmax - l) / (lmax - lmin) * (st.H - 46);
      for (let c = cmin; c <= cmax; c++) { ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(c), 12); ctx.lineTo(X(c), st.H - 34); ctx.stroke(); txt(ctx, "1e" + c, X(c), st.H - 20, C.muted, 10, "center"); }
      for (let l = 2; l <= 4; l += .5) txt(ctx, l.toFixed(1), pad - 5, Y(l) + 3, C.muted, 10, "right"); txt(ctx, "compute C (FLOPs)", st.W - 12, st.H - 4, C.muted, 10, "right"); txt(ctx, "loss", 6, 12, C.muted, 10);
      const sizes = [7.5, 8.5, 9.5, 10.5, 11.5];
      sizes.forEach(lN => { const N = 10 ** lN; ctx.strokeStyle = "rgba(107,112,128,.55)"; ctx.lineWidth = 1.5; ctx.beginPath(); let started = false;
        for (let lc = cmin; lc <= cmin + (cmax - cmin) * prog; lc += .05) { const D = 10 ** lc / (6 * N); if (D < N * .5) continue; const l = L(N, D); if (l > lmax) continue; started ? ctx.lineTo(X(lc), Y(l)) : ctx.moveTo(X(lc), Y(l)); started = true; } ctx.stroke();
        const lab = Math.min(cmax - .2, cmin + (cmax - cmin) * prog); const D = 10 ** lab / (6 * N); if (prog > .9 && D > N * .5 && lN !== 9.5) txt(ctx, (N >= 1e9 ? Math.round(N / 1e9) + "B" : Math.round(N / 1e6) + "M"), X(lab) + 2, Y(L(N, D)) - 4, C.muted, 9.5, "right"); });
      ctx.strokeStyle = C.a; ctx.lineWidth = 2.6; ctx.beginPath(); for (let lc = cmin; lc <= cmin + (cmax - cmin) * prog; lc += .05) { const N = Math.sqrt(10 ** lc / 120), l = L(N, 20 * N); lc === cmin ? ctx.moveTo(X(lc), Y(l)) : ctx.lineTo(X(lc), Y(l)); } ctx.stroke();
      const N = Math.sqrt(10 ** logC / 120), D = 20 * N; dot(ctx, X(logC), Y(L(N, D)), 7, C.b, "#fff");
      const fmt = x => x >= 1e12 ? (x / 1e12).toFixed(2) + "T" : x >= 1e9 ? (x / 1e9).toFixed(1) + "B" : (x / 1e6).toFixed(0) + "M";
      st.info.innerHTML = `<span>budget C = <b>1e${logC.toFixed(1)}</b></span><span style="color:${C.b}">optimal N ≈ <b>${fmt(N)}</b>, D ≈ <b>${fmt(D)}</b> tokens</span><span>loss ≈ <b>${L(N, D).toFixed(3)}</b></span><span class="hint">blue = compute-optimal frontier (D = 20N)</span>`; };
    st.controls({ reset: () => { prog = 0; } }); st.slider("budget log₁₀ C", 19, 25, .1, 22, v => { logC = v; st.draw(); }); st.size();
  };

  /* LoRA */
  A.lora = host => {
    const st = stage(host, { label: "LoRA: a low-rank update", h: 300 });
    let r = 8, ph = 0; const d = 64; st.interval = 60; st.tick = () => { ph += .05; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = Math.min(st.H - 70, st.W * .28), y0 = 34, sc = S / d;
      const xW = 16; ctx.fillStyle = "#e5e2da"; ctx.fillRect(xW, y0, S, S); ctx.strokeStyle = C.muted; ctx.strokeRect(xW, y0, S, S); txt(ctx, "W (frozen)", xW + S / 2, y0 - 8, C.muted, 12, "center", "700"); txt(ctx, "d × k", xW + S / 2, y0 + S / 2 + 4, C.muted, 12, "center");
      const xp = xW + S + 18; txt(ctx, "+", xp, y0 + S / 2 + 6, C.ink, 20, "center", "700");
      const xB = xp + 18, wB = Math.max(3, r * sc); ctx.fillStyle = `rgba(224,100,26,${.35 + .2 * Math.sin(ph)})`; ctx.fillRect(xB, y0, wB, S); ctx.strokeStyle = C.b; ctx.strokeRect(xB, y0, wB, S); txt(ctx, "B", xB + wB / 2, y0 - 8, C.b, 12, "center", "700");
      const xA = xB + wB + 10; ctx.fillStyle = `rgba(42,79,196,${.35 + .2 * Math.cos(ph)})`; ctx.fillRect(xA, y0, S, Math.max(3, r * sc)); ctx.strokeStyle = C.a; ctx.strokeRect(xA, y0, S, Math.max(3, r * sc)); txt(ctx, "A", xA + S / 2, y0 - 8, C.a, 12, "center", "700");
      txt(ctx, `d × r`, xB + wB / 2, y0 + S + 16, C.b, 11, "center"); txt(ctx, `r × k`, xA + S / 2, y0 + Math.max(3, r * sc) + 16, C.a, 11, "center");
      const D = 4096, full = D * D, lo = r * (D + D), frac = lo / full;
      const by = st.H - 22, bw = st.W - 32; ctx.fillStyle = "#e5e2da"; ctx.fillRect(16, by, bw, 10); ctx.fillStyle = C.b; ctx.fillRect(16, by, Math.max(2, bw * frac), 10); txt(ctx, `trainable share of a 4,096 × 4,096 matrix: ${(frac * 100).toFixed(2)} %`, 16, by - 5, C.ink, 11, "left", "600");
      st.info.innerHTML = `<span>rank r = <b>${r}</b></span><span>LoRA params <b>${lo.toLocaleString()}</b></span><span>full matrix <b>${full.toLocaleString()}</b></span><span class="hint">B starts at 0, so W + BA = W at step 0</span>`; };
    st.controls({ step: false }); st.slider("rank r", 1, 64, 1, 8, v => { r = v; st.draw(); }); st.size();
  };

  /* preference / Bradley-Terry */
  A.pref = host => {
    const st = stage(host, { label: "Bradley–Terry preference and reward-model loss", h: 300 });
    let gap = 1.5, t = 0; st.interval = 50; st.tick = () => { t += .04; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 36, X = z => pad + (z + 5) / 10 * (st.W - pad - 14), Yp = p => 14 + (1 - p) * (st.H - 60), Yl = l => 14 + (1 - Math.min(l, 5) / 5) * (st.H - 60), base = st.H - 46;
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(st.W - 14, base); ctx.stroke(); for (let z = -4; z <= 4; z += 2) txt(ctx, z, X(z), base + 14, C.muted, 10, "center"); txt(ctx, "reward gap r_chosen − r_rejected", st.W - 14, st.H - 6, C.muted, 10, "right");
      ctx.strokeStyle = C.a; ctx.lineWidth = 2.5; ctx.beginPath(); for (let z = -5; z <= 5; z += .05) z === -5 ? ctx.moveTo(X(z), Yp(sg(z))) : ctx.lineTo(X(z), Yp(sg(z))); ctx.stroke(); txt(ctx, "P(chosen wins)", X(4.8), Yp(.86) + 14, C.a, 11, "right", "700");
      ctx.strokeStyle = C.b; ctx.lineWidth = 2.5; ctx.beginPath(); for (let z = -5; z <= 5; z += .05) z === -5 ? ctx.moveTo(X(z), Yl(-Math.log(sg(z)))) : ctx.lineTo(X(z), Yl(-Math.log(sg(z)))); ctx.stroke(); txt(ctx, "loss = −log σ(gap)", X(-4.8), Yl(4.3), C.b, 11, "left", "700");
      const g = gap + .15 * Math.sin(t); dot(ctx, X(g), Yp(sg(g)), 6, C.a, "#fff"); dot(ctx, X(g), Yl(-Math.log(sg(g))), 6, C.b, "#fff");
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(X(g), 14); ctx.lineTo(X(g), base); ctx.stroke(); ctx.setLineDash([]);
      st.info.innerHTML = `<span>gap <b>${gap.toFixed(2)}</b></span><span style="color:${C.a}">P = <b>${sg(gap).toFixed(3)}</b></span><span style="color:${C.b}">loss = <b>${(-Math.log(sg(gap))).toFixed(3)}</b></span><span class="hint">gap 0 → P = 0.5, loss = ln 2</span>`; };
    st.controls({ step: false }); st.slider("reward gap", -4, 4, .1, 1.5, v => { gap = v; st.draw(); }); st.size();
  };

  /* temperature & top-p */
  A.sampling = host => {
    const st = stage(host, { label: "Temperature and top-p", h: 340, ratio: .8 });
    const words = ["mat", "floor", "sofa", "bed", "rug", "chair", "roof", "table", "moon", "piano"], logits = [3.2, 2.4, 2.0, 1.6, 1.3, 1.0, .5, .3, -.8, -1.5];
    let T = 1, P = .9, r = R(4), samples = [];
    st.interval = 400; st.tick = () => { const p = probs(), keep = nucleus(p), z = keep.reduce((a, i) => a + p[i], 0); let u = r() * z, pick = keep[0]; for (const i of keep) { u -= p[i]; if (u <= 0) { pick = i; break; } } samples.push(pick); if (samples.length > 14) samples.shift(); };
    const probs = () => { const e = logits.map(l => Math.exp(l / T)), z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); };
    const nucleus = p => { const idx = p.map((v, i) => i).sort((a, b) => p[b] - p[a]); const k = []; let c = 0; for (const i of idx) { k.push(i); c += p[i]; if (c >= P - 1e-9) break; } return k; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const p = probs(), keep = nucleus(p), pad = 20, bw = (st.W - 2 * pad) / words.length, base = st.H - 70, H = base - 30;
      txt(ctx, "The cat sat on the …", pad, 16, C.ink, 13, "left", "700");
      words.forEach((w, i) => { const h = p[i] * H, k = keep.includes(i); ctx.fillStyle = k ? C.a : "#d9d5cc"; ctx.fillRect(pad + i * bw + 3, base - h, bw - 6, h); txt(ctx, w, pad + i * bw + bw / 2, base + 13 + (bw < 46 ? (i % 2) * 12 : 0), k ? C.ink : C.muted, 10, "center", k ? "700" : "500"); if (bw > 30) txt(ctx, p[i].toFixed(2), pad + i * bw + bw / 2, base - h - 4, C.muted, 9.5, "center"); });
      txt(ctx, "sampled: " + samples.map(i => words[i]).join(" · "), pad, st.H - 30, C.b, 11.5, "left", "600");
      const kept = keep.reduce((a, i) => a + p[i], 0);
      st.info.innerHTML = `<span>T = <b>${T.toFixed(2)}</b></span><span>top-p = <b>${P.toFixed(2)}</b> → keeps <b>${keep.length}</b> token(s), mass ${kept.toFixed(2)}</span><span>p(mat) = <b>${p[0].toFixed(3)}</b></span>`; };
    st.controls({ step: true }); st.slider("temperature T", .1, 2.5, .05, 1, v => { T = v; samples = []; st.draw(); }); st.slider("top-p", .1, 1, .05, .9, v => { P = v; samples = []; st.draw(); }); st.size();
  };

  /* RAG retrieval */
  A.rag = host => {
    const st = stage(host, { label: "Dense retrieval: top-k chunks", h: 340, ratio: .8 });
    const topics = [["sports", 0.3, C.ok], ["finance", 1.9, C.b], ["medicine", 3.4, "#a0306a"], ["space", 4.9, C.a]], r = R(12);
    const docs = []; topics.forEach(([nm, a, col]) => { for (let i = 0; i < 9; i++) { const ang = a + .35 * r.n(), rad = .55 + .4 * r(); docs.push({ x: rad * Math.cos(ang), y: rad * Math.sin(ang), col, nm }); } });
    let k = 4, qa = 1.9, t = 0; st.interval = 60; st.tick = () => { t += .012; qa = 1.9 + 2.4 * Math.sin(t); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const s = Math.min(st.W * .62, st.H) / 2.5, cx = st.W * .33, cy = st.H / 2, P = (x, y) => [cx + x * s, cy - y * s];
      ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.arc(cx, cy, s, 0, 7); ctx.stroke();
      const q = [Math.cos(qa), Math.sin(qa)], sc = docs.map((d, i) => [(d.x * q[0] + d.y * q[1]) / Math.hypot(d.x, d.y), i]).sort((a, b) => b[0] - a[0]), top = sc.slice(0, k).map(v => v[1]);
      docs.forEach((d, i) => { const on = top.includes(i); if (on) { ctx.strokeStyle = d.col + "88"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...P(q[0] * 1.05, q[1] * 1.05)); ctx.lineTo(...P(d.x, d.y)); ctx.stroke(); } dot(ctx, ...P(d.x, d.y), on ? 6 : 4, on ? d.col : d.col + "55", on ? "#fff" : null); });
      txt(ctx, "★", ...P(q[0] * 1.05, q[1] * 1.05).map((v, j) => v + (j ? 6 : 0)), C.ink, 20, "center", "800");
      const x2 = st.W * .66; txt(ctx, "prompt context", x2, 22, C.ink, 12, "left", "700");
      sc.slice(0, k).forEach(([c, i], j) => { const d = docs[i], y = 34 + j * 26; ctx.fillStyle = d.col + "22"; ctx.strokeStyle = d.col; rr(ctx, x2, y, st.W - x2 - 12, 20, 5); ctx.fill(); ctx.stroke(); txt(ctx, `[${j + 1}] ${d.nm} ${c.toFixed(2)}`, x2 + 5, y + 14, C.ink, 10, "left", "600"); });
      const qTopic = topics.reduce((b, tp) => Math.abs(Math.atan2(Math.sin(qa - tp[1]), Math.cos(qa - tp[1]))) < Math.abs(Math.atan2(Math.sin(qa - b[1]), Math.cos(qa - b[1]))) ? tp : b, topics[0]);
      const prec = top.filter(i => docs[i].nm === qTopic[0]).length / k;
      st.info.innerHTML = `<span>query about <b>${qTopic[0]}</b></span><span>k = <b>${k}</b></span><span>on-topic share <b>${(prec * 100).toFixed(0)} %</b></span><span class="hint">bigger k: more recall, more noise and tokens</span>`; };
    st.controls({ step: false }); st.slider("k", 1, 10, 1, 4, v => { k = v; st.draw(); }); st.size();
  };

  /* KV cache */
  A.kvcache = host => {
    const st = stage(host, { label: "Decoding with and without a KV cache", h: 320, ratio: .85 });
    const words = ["The", "cat", "sat", "on", "a", "warm", "mat"]; let t = 1, noC = 0, wC = 0;
    st.interval = 900; st.tick = () => { if (t >= words.length) { t = 1; noC = 0; wC = 0; return; } t++; noC += t; wC += 1; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const n = words.length, cw = (st.W - 60) / n, h = Math.min(26, (st.H - 120) / 4);
      const row = (y0, cache) => { txt(ctx, cache ? "with KV cache" : "no cache", 12, y0 - 10, cache ? C.ok : C.bad, 12, "left", "700");
        ["K", "V"].forEach((lab, r2) => { const y = y0 + r2 * (h + 6); txt(ctx, lab, 40, y + h / 2 + 4, C.muted, 12, "right", "700");
          for (let i = 0; i < n; i++) { const x = 50 + i * cw; if (i >= t) { ctx.strokeStyle = C.grid; ctx.strokeRect(x, y, cw - 4, h); continue; }
            const fresh = cache ? i === t - 1 : true; ctx.fillStyle = fresh ? (cache ? "rgba(21,128,61,.75)" : "rgba(194,53,43,.65)") : "rgba(21,128,61,.18)"; ctx.fillRect(x, y, cw - 4, h); if (fresh && cw > 34) txt(ctx, "new", x + (cw - 4) / 2, y + h / 2 + 4, "#fff", 10, "center", "700"); } }); };
      words.forEach((w, i) => txt(ctx, w, 50 + i * cw + (cw - 4) / 2, 22, i < t ? C.ink : C.muted, 11, "center", i === t - 1 ? "800" : "500"));
      row(54, false); row(54 + 2 * (h + 6) + 34, true);
      st.info.innerHTML = `<span>step <b>${t}</b></span><span style="color:${C.bad}">K/V computed without cache: <b>${noC}</b></span><span style="color:${C.ok}">with cache: <b>${wC}</b></span><span class="hint">red/green solid = recomputed this step</span>`; };
    st.controls({ reset: () => { t = 1; noC = 0; wC = 0; } }); st.size();
  };

  /* calibration diagram */
  A.calib = host => {
    const st = stage(host, { label: "Reliability diagram", h: 320, ratio: .9 });
    let over = .15; const bins = [.15, .25, .35, .45, .55, .65, .75, .85, .95], cnt = [20, 30, 40, 60, 80, 110, 150, 200, 310];
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 40, S = Math.min(st.W - pad - 20, st.H - 50), X = v => pad + v * S, Y = v => 12 + (1 - v) * S;
      ctx.strokeStyle = C.grid; ctx.strokeRect(X(0), Y(1), S, S); for (let v = 0; v <= 1; v += .2) { txt(ctx, v.toFixed(1), X(v), Y(0) + 14, C.muted, 10, "center"); txt(ctx, v.toFixed(1), X(0) - 5, Y(v) + 3, C.muted, 10, "right"); }
      txt(ctx, "confidence", X(1), Y(0) + 28, C.muted, 10, "right"); txt(ctx, "accuracy", 4, 10, C.muted, 10);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1), Y(1)); ctx.stroke(); ctx.setLineDash([]);
      let ece = 0; const N = cnt.reduce((a, b) => a + b, 0);
      bins.forEach((c, i) => { const acc = Math.max(0, Math.min(1, c - over * (c - .1) / .9 * 1.2)), w = S / 10; ctx.fillStyle = "rgba(42,79,196,.65)"; ctx.fillRect(X(c) - w / 2 + 1, Y(acc), w - 2, Y(0) - Y(acc));
        if (c > acc) { ctx.fillStyle = "rgba(194,53,43,.25)"; ctx.fillRect(X(c) - w / 2 + 1, Y(c), w - 2, Y(acc) - Y(c)); } ece += cnt[i] / N * Math.abs(acc - c); });
      st.info.innerHTML = `<span>overconfidence <b>${over.toFixed(2)}</b></span><span>ECE = <b>${ece.toFixed(3)}</b></span><span class="hint">red = gap between stated confidence and actual accuracy</span>`; };
    st.controls({ step: false }); st.slider("overconfidence", 0, .4, .01, .15, v => { over = v; st.draw(); }); st.size();
  };
})();
