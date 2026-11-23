/* Animations for Vision-Language Models. Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const sg = z => 1 / (1 + Math.exp(-z));
  /* a small procedural "photo": sky, sun, hill, house */
  const scene = (ctx, x, y, s) => { ctx.save(); ctx.beginPath(); ctx.rect(x, y, s, s); ctx.clip();
    let g = ctx.createLinearGradient(0, y, 0, y + s); g.addColorStop(0, "#bcd6f5"); g.addColorStop(1, "#eaf2fb"); ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = "#f4c542"; ctx.beginPath(); ctx.arc(x + s * .78, y + s * .22, s * .1, 0, 7); ctx.fill();
    ctx.fillStyle = "#7cb36b"; ctx.beginPath(); ctx.ellipse(x + s * .4, y + s * 1.05, s * .75, s * .42, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#c95f3b"; ctx.fillRect(x + s * .18, y + s * .5, s * .26, s * .22); ctx.fillStyle = "#8a3a22"; ctx.beginPath(); ctx.moveTo(x + s * .15, y + s * .5); ctx.lineTo(x + s * .31, y + s * .36); ctx.lineTo(x + s * .47, y + s * .5); ctx.fill();
    ctx.fillStyle = "#3b6b3a"; ctx.beginPath(); ctx.arc(x + s * .66, y + s * .56, s * .09, 0, 7); ctx.fill(); ctx.fillRect(x + s * .65, y + s * .6, s * .02, s * .12); ctx.restore(); };

  /* ViT patchify */
  A.patchify = host => {
    const st = stage(host, { label: "Patchify → tokens", h: 320 });
    let g = 4, k = 0; st.interval = 260; st.tick = () => { k = (k + 1) % (g * g + 8); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = Math.min(st.H - 40, st.W * .42), x0 = 14, y0 = 22, ps = S / g;
      scene(ctx, x0, y0, S); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; for (let i = 1; i < g; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * ps, y0); ctx.lineTo(x0 + i * ps, y0 + S); ctx.moveTo(x0, y0 + i * ps); ctx.lineTo(x0 + S, y0 + i * ps); ctx.stroke(); }
      const cur = Math.min(k, g * g - 1); if (k < g * g) { ctx.strokeStyle = C.b; ctx.lineWidth = 3; ctx.strokeRect(x0 + (cur % g) * ps, y0 + Math.floor(cur / g) * ps, ps, ps); }
      txt(ctx, `image, ${g}×${g} patches`, x0, 14, C.ink, 11.5, "left", "600");
      const tx = x0 + S + 24, tw = st.W - tx - 10, n = g * g + 1, per = Math.max(1, Math.floor(tw / 20)), cw = tw / Math.min(per, n), rows = Math.ceil(n / per);
      txt(ctx, "tokens", tx, 14, C.ink, 11.5, "left", "600");
      for (let i = 0; i < n; i++) { const shown = i === 0 || i - 1 < Math.min(k + 1, g * g), x = tx + (i % per) * cw, y = 24 + Math.floor(i / per) * 26;
        ctx.fillStyle = !shown ? "#efece5" : i === 0 ? C.ink : `hsl(${210 + (i * 37) % 60},55%,${55 + (i * 13) % 20}%)`; ctx.fillRect(x, y, cw - 3, 20); if (cw > 22) txt(ctx, i === 0 ? "CLS" : i, x + (cw - 3) / 2, y + 14, "#fff", 9, "center", "700"); }
      const yb = 24 + rows * 26 + 10; if (yb < st.H - 10) { txt(ctx, "→ Transformer encoder", tx, yb + 10, C.a, 12, "left", "700"); }
      st.info.innerHTML = `<span>grid ${g}×${g}</span><span>tokens = <b>${g * g}</b> + 1 CLS = <b>${g * g + 1}</b></span><span class="hint">ViT-B/16 @224 px: 14×14 = 196 (+1)</span>`; };
    st.controls({ reset: () => { k = 0; } }); st.slider("patches per side", 2, 8, 1, 4, v => { g = v; k = 0; st.draw(); }); st.size();
  };

  /* CLIP similarity matrix training */
  A.clipmatrix = host => {
    const st = stage(host, { label: "CLIP: similarity matrix during training", h: 340, ratio: .9 });
    const caps = ["dog on grass", "red car", "bowl of fruit", "city at night", "cat on sofa", "snowy hill"], n = caps.length, r = R(4);
    const base = Array.from({ length: n }, () => Array.from({ length: n }, () => r.n() * .15)); let t = 0;
    st.interval = 80; st.tick = () => { t = Math.min(1, t + .012); if (t >= 1) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const lab = Math.min(96, st.W * .28), cs = Math.min((st.W - lab - 14) / n, (st.H - 80) / n), x0 = lab, y0 = 60, scale = 10;
      const S = base.map((row, i) => row.map((v, j) => Math.max(-1, Math.min(1, v + (i === j ? .75 * t : -.1 * t)))));
      caps.forEach((c, j) => { ctx.save(); ctx.translate(x0 + j * cs + cs / 2, y0 - 6); ctx.rotate(-Math.PI / 4); txt(ctx, c, 0, 0, C.ink, 10, "left", "600"); ctx.restore(); txt(ctx, "img " + (j + 1), x0 - 6, y0 + j * cs + cs / 2 + 4, C.ink, 10.5, "right", "600"); });
      let loss = 0; S.forEach((row, i) => { const e = row.map(v => Math.exp(scale * v)), z = e.reduce((a, b) => a + b, 0); loss += -Math.log(e[i] / z);
        row.forEach((v, j) => { ctx.fillStyle = v >= 0 ? `rgba(42,79,196,${Math.min(1, v * 1.2)})` : `rgba(224,100,26,${Math.min(1, -v * 2)})`; ctx.fillRect(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2); if (cs > 30) txt(ctx, v.toFixed(2), x0 + j * cs + cs / 2 - 1, y0 + i * cs + cs / 2 + 4, v > .55 ? "#fff" : C.ink, 9.5, "center"); }); });
      for (let i = 0; i < n; i++) { ctx.strokeStyle = C.ok; ctx.lineWidth = 2; ctx.strokeRect(x0 + i * cs, y0 + i * cs, cs - 2, cs - 2); }
      st.info.innerHTML = `<span>training progress <b>${Math.round(t * 100)} %</b></span><span>image→text loss <b>${(loss / n).toFixed(3)}</b> (chance ln ${n} = ${Math.log(n).toFixed(2)})</span><span class="hint">green = true pairs; logit scale 10</span>`; };
    st.controls({ reset: () => { t = 0; } }); st.size();
  };

  /* captioning with attention */
  A.captioning = host => {
    const st = stage(host, { label: "Captioning with visual attention", h: 320 });
    const words = ["a", "dog", "catches", "a", "red", "frisbee", "on", "the", "grass"], G = 6;
    const focus = { dog: [[1, 3], [2, 3], [1, 4]], catches: [[2, 3], [2, 2], [1, 2]], red: [[1, 1], [1, 2]], frisbee: [[1, 1], [1, 2], [0, 1]], grass: [[4, 0], [4, 2], [5, 4], [5, 1]] };
    let k = 0; st.interval = 1100; st.tick = () => { k = (k + 1) % (words.length + 1); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = Math.min(st.H - 60, st.W * .48), x0 = 14, y0 = 14, cs = S / G;
      ctx.fillStyle = "#e7f0fb"; ctx.fillRect(x0, y0, S, S); ctx.fillStyle = "#8cc277"; ctx.fillRect(x0, y0 + S * .62, S, S * .38);
      ctx.fillStyle = "#b0773e"; ctx.beginPath(); ctx.ellipse(x0 + S * .55, y0 + S * .6, S * .16, S * .09, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x0 + S * .7, y0 + S * .5, S * .07, 0, 7); ctx.fill();
      ctx.fillStyle = "#d33a2c"; ctx.beginPath(); ctx.ellipse(x0 + S * .28, y0 + S * .24, S * .1, S * .035, -.3, 0, 7); ctx.fill();
      const w = k > 0 ? words[k - 1] : null, f = (w && focus[w]) || null;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { let a = .04; if (f) { if (f.some(([r2, c2]) => r2 === i && c2 === j)) a = .6; } else if (w) a = .12; ctx.fillStyle = `rgba(42,79,196,${a})`; ctx.fillRect(x0 + j * cs, y0 + i * cs, cs - 1, cs - 1); }
      const tx = x0 + S + 20; txt(ctx, "generated caption", tx, 22, C.ink, 12, "left", "600");
      let x = tx, y = 46; words.slice(0, k).forEach((wd, i) => { ctx.font = "600 14px Manrope, sans-serif"; const ww = ctx.measureText(wd + " ").width; if (x + ww > st.W - 8) { x = tx; y += 22; } txt(ctx, wd, x, y, i === k - 1 ? C.b : C.ink, 14, "left", i === k - 1 ? "800" : "600"); x += ww; });
      st.info.innerHTML = `<span>step <b>${k}</b></span>${w ? `<span>word "<b>${w}</b>" ${f ? "attends to its region" : "spreads attention"}</span>` : "<span>start token</span>"}<span class="hint">blue cells = cross-attention weights</span>`; };
    st.controls({ step: true }); st.size();
  };

  /* gated cross-attention */
  A.xattn = host => {
    const st = stage(host, { label: "Gated cross-attention (Flamingo)", h: 320 });
    let alpha = 0, auto = true; const nl = 6, nt = 7, r = R(6), W = Array.from({ length: nt }, () => { const e = Array.from({ length: nl }, () => Math.exp(2 * r.n())), z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); });
    st.interval = 70; st.tick = () => { if (auto) alpha = Math.min(2.5, alpha + .02); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const g = Math.tanh(alpha), yT = st.H - 44, yL = 40, wl = (st.W - 40) / nl, wt = (st.W - 40) / nt;
      txt(ctx, "visual latents", 20, 16, C.b, 11.5, "left", "700"); txt(ctx, "text tokens in the frozen LM", 20, st.H - 8, C.a, 11.5, "left", "700");
      const words = ["<img>", "A", "photo", "of", "a", "red", "car"];
      for (let i = 0; i < nt; i++) for (let j = 0; j < nl; j++) { const w = W[i][j] * g; if (w < .03) continue; ctx.strokeStyle = `rgba(160,48,106,${Math.min(.9, w * 1.6)})`; ctx.lineWidth = 1 + 6 * w; ctx.beginPath(); ctx.moveTo(20 + i * wt + wt / 2, yT); ctx.lineTo(20 + j * wl + wl / 2, yL + 22); ctx.stroke(); }
      for (let j = 0; j < nl; j++) { ctx.fillStyle = C.b; ctx.fillRect(20 + j * wl + 4, yL, wl - 8, 22); }
      words.forEach((wd, i) => { const x = 20 + i * wt + 3; ctx.fillStyle = `rgba(42,79,196,${.25 + .6 * g})`; ctx.fillRect(x, yT, wt - 6, 22); txt(ctx, wd, x + (wt - 6) / 2, yT + 15, "#fff", 10, "center", "700"); });
      const gx = st.W - 110, gy = 16; ctx.fillStyle = "#efece5"; ctx.fillRect(gx, gy, 90, 12); ctx.fillStyle = "#a0306a"; ctx.fillRect(gx, gy, 90 * g, 12); txt(ctx, `gate tanh(α) = ${g.toFixed(2)}`, gx + 45, gy - 6, C.ink, 11, "center", "700");
      st.info.innerHTML = `<span>α = <b>${alpha.toFixed(2)}</b></span><span>gate <b>${g.toFixed(3)}</b></span><span class="hint">y = x + tanh(α)·XAttn(x, visual) — at α = 0 the LM is unchanged</span>`; };
    st.controls({ reset: () => { alpha = 0; auto = true; } }); st.slider("α", 0, 2.5, .05, 0, v => { alpha = v; auto = false; st.draw(); }); st.size();
  };

  /* LLaVA projector */
  A.projector = host => {
    const st = stage(host, { label: "Vision encoder → projector → LLM input", h: 320 });
    let comp = false, t = 0; st.interval = 60; st.tick = () => { t = (t + .02) % 1; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = Math.min(st.H * .42, st.W * .22), x0 = 12, y0 = 30;
      scene(ctx, x0, y0, S); const g = 6; ctx.strokeStyle = "#fff"; for (let i = 1; i < g; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * S / g, y0); ctx.lineTo(x0 + i * S / g, y0 + S); ctx.moveTo(x0, y0 + i * S / g); ctx.lineTo(x0 + S, y0 + i * S / g); ctx.stroke(); }
      txt(ctx, "image", x0, y0 - 8, C.ink, 11, "left", "600");
      const bx = x0 + S + 14, bw = Math.max(54, st.W * .12); [["ViT", C.muted, "frozen"], ["MLP", C.b, "projector"]].forEach(([l, col, s], i) => { const x = bx + i * (bw + 10); ctx.fillStyle = col + "22"; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.fillRect(x, y0, bw, S); ctx.strokeRect(x, y0, bw, S); txt(ctx, l, x + bw / 2, y0 + S / 2, col, 13, "center", "800"); txt(ctx, s, x + bw / 2, y0 + S / 2 + 16, C.muted, 9.5, "center"); });
      const nVis = comp ? 9 : 36, seqY = y0 + S + 34, tw = st.W - 24, text = ["What", "is", "in", "the", "picture", "?"], tot = nVis + text.length, cw = Math.min(26, tw / tot);
      txt(ctx, `LLM input: ${comp ? 144 : 576} visual tokens (shown ÷16) + question`, 12, seqY - 10, C.ink, 11.5, "left", "700");
      for (let i = 0; i < tot; i++) { const x = 12 + i * cw, vis = i < nVis, lit = vis && Math.abs(i / tot - t) < .06; ctx.fillStyle = vis ? (lit ? C.b : "rgba(224,100,26,.55)") : C.a; ctx.fillRect(x, seqY, cw - 2, 22); if (!vis && cw > 18) txt(ctx, text[i - nVis].slice(0, 3), x + (cw - 2) / 2, seqY + 15, "#fff", 8.5, "center", "700"); }
      st.info.innerHTML = `<span>visual tokens <b>${comp ? 144 : 576}</b></span><span>${comp ? "pixel-shuffle 2×2: 4× fewer, 4× wider" : "LLaVA-1.5: ViT-L/14 @336 px"}</span><span class="hint">image before text, so causal attention lets the question see it</span>`; };
    st.controls({ step: false }); st.button("Toggle 2×2 compression", () => { comp = !comp; st.draw(); }); st.size();
  };

  /* IoU */
  A.iou = host => {
    const st = stage(host, { label: "Intersection over Union", h: 300 });
    let t = 0, sc = 1; st.interval = 50; st.tick = () => { t += .02; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const u = Math.min(st.W / 14, st.H / 9), ox = st.W / 2 - 4 * u, oy = st.H / 2 - 3 * u;
      const G = [0, 0, 5, 4], dx = 2.5 * Math.sin(t), dy = 1.2 * Math.sin(t * .7 + 1), P = [G[0] + dx, G[1] + dy, G[0] + dx + 5 * sc, G[1] + dy + 4 * sc];
      const X = v => ox + v * u, Y = v => oy + v * u, ix = Math.max(0, Math.min(G[2], P[2]) - Math.max(G[0], P[0])), iy = Math.max(0, Math.min(G[3], P[3]) - Math.max(G[1], P[1])), I = ix * iy, U = 20 + (P[2] - P[0]) * (P[3] - P[1]) - I, iou = I / U;
      ctx.fillStyle = "rgba(42,79,196,.15)"; ctx.fillRect(X(G[0]), Y(G[1]), 5 * u, 4 * u); ctx.fillStyle = "rgba(224,100,26,.15)"; ctx.fillRect(X(P[0]), Y(P[1]), (P[2] - P[0]) * u, (P[3] - P[1]) * u);
      if (I > 0) { ctx.fillStyle = "rgba(21,128,61,.5)"; ctx.fillRect(X(Math.max(G[0], P[0])), Y(Math.max(G[1], P[1])), ix * u, iy * u); }
      ctx.lineWidth = 2.5; ctx.strokeStyle = C.a; ctx.strokeRect(X(G[0]), Y(G[1]), 5 * u, 4 * u); ctx.strokeStyle = C.b; ctx.strokeRect(X(P[0]), Y(P[1]), (P[2] - P[0]) * u, (P[3] - P[1]) * u);
      txt(ctx, "ground truth", X(G[0]) + 4, Y(G[1]) + 14, C.a, 11, "left", "700"); txt(ctx, "prediction", X(P[2]) - 4, Y(P[3]) - 6, C.b, 11, "right", "700");
      const ok = iou >= .5; txt(ctx, `IoU = ${iou.toFixed(3)} ${ok ? "✓ match" : "✗ miss"}`, 12, 20, ok ? C.ok : C.bad, 14, "left", "800");
      st.info.innerHTML = `<span>intersection <b>${I.toFixed(2)}</b></span><span>union <b>${U.toFixed(2)}</b></span><span>IoU <b>${iou.toFixed(3)}</b></span><span class="hint">threshold 0.5</span>`; };
    st.controls({ step: false }); st.slider("pred. box scale", .5, 1.6, .05, 1, v => { sc = v; st.draw(); }); st.size();
  };

  /* POPE confusion */
  A.pope = host => {
    const st = stage(host, { label: "POPE: probing object hallucination", h: 320 });
    let bias = .25, r, c, n;
    const reset = () => { r = R(9); c = { tp: 0, fn: 0, fp: 0, tn: 0 }; n = 0; }; reset();
    st.interval = 60; st.tick = () => { for (let k = 0; k < 5; k++) { const present = r() < .5, pyes = present ? .88 + .1 * bias : .08 + .7 * bias, yes = r() < pyes; if (present) yes ? c.tp++ : c.fn++; else yes ? c.fp++ : c.tn++; n++; } if (n >= 1000) return false; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = Math.min(st.H - 50, st.W * .5), x0 = 70, y0 = 34, h = S / 2;
      txt(ctx, "model says", x0 + S / 2, 14, C.muted, 11, "center", "600"); txt(ctx, "yes", x0 + h / 2, 28, C.ink, 11, "center", "700"); txt(ctx, "no", x0 + h * 1.5, 28, C.ink, 11, "center", "700");
      txt(ctx, "present", x0 - 6, y0 + h / 2 + 4, C.ink, 11, "right", "700"); txt(ctx, "absent", x0 - 6, y0 + h * 1.5 + 4, C.ink, 11, "right", "700");
      const cells = [[c.tp, "TP", C.ok], [c.fn, "FN", C.muted], [c.fp, "FP", C.bad], [c.tn, "TN", C.ok]], mx = Math.max(1, n / 2);
      cells.forEach(([v, l, col], i) => { const x = x0 + (i % 2) * h, y = y0 + Math.floor(i / 2) * h; ctx.fillStyle = col + Math.round(30 + 160 * v / mx).toString(16).padStart(2, "0"); ctx.fillRect(x, y, h - 3, h - 3); txt(ctx, l, x + h / 2, y + h / 2 - 4, C.ink, 12, "center", "800"); txt(ctx, v, x + h / 2, y + h / 2 + 14, C.ink, 13, "center", "700"); });
      const P = c.tp / Math.max(1, c.tp + c.fp), Rc = c.tp / Math.max(1, c.tp + c.fn), acc = (c.tp + c.tn) / Math.max(1, n), yes = (c.tp + c.fp) / Math.max(1, n), F = 2 * P * Rc / Math.max(1e-9, P + Rc);
      const bx = x0 + S + 24, bw = st.W - bx - 14; [["accuracy", acc], ["precision", P], ["recall", Rc], ["F1", F], ["yes-ratio", yes]].forEach(([l, v], i) => { const y = y0 + i * 30; txt(ctx, `${l}  ${v.toFixed(2)}`, bx, y + 10, C.ink, 11, "left", "600"); ctx.fillStyle = "#efece5"; ctx.fillRect(bx, y + 14, bw, 8); ctx.fillStyle = l === "yes-ratio" && v > .55 ? C.bad : C.a; ctx.fillRect(bx, y + 14, bw * v, 8); });
      st.info.innerHTML = `<span>questions <b>${n}</b></span><span>yes-bias <b>${bias.toFixed(2)}</b></span><span class="hint">balanced: 50 % present, 50 % absent</span>`; };
    st.controls({ reset }); st.slider("yes-bias", 0, 1, .05, .25, v => { bias = v; reset(); st.draw(); }); st.size();
  };
})();
