/* Animations for Multimodal (MVLM). Uses helpers from anims.js (window.ANIMKIT). */
(function () {
  "use strict";
  const { stage, dot, txt, R, C } = window.ANIMKIT, A = window.ANIM;
  const PAL = ["#2f5bd3", "#e0641a", "#15803d", "#a0306a", "#8a5a00", "#0f6e7a", "#c2352b", "#5b3a1e"];

  /* vector quantisation */
  A.vqcode = host => {
    const st = stage(host, { label: "Vector quantisation into a codebook", h: 320 });
    let r, pts, cb, it, K = 6;
    const reset = () => { r = R(21); pts = []; [[-1.2, .8], [1, 1], [.2, -1.1], [1.4, -.4]].forEach(c => { for (let i = 0; i < 40; i++) pts.push([c[0] + .35 * r.n(), c[1] + .35 * r.n()]); }); cb = Array.from({ length: K }, (_, i) => [2.2 * Math.cos(i * 2.4) * .9, 1.6 * Math.sin(i * 2.4) * .9]); cb[K - 1] = [2.3, 1.9]; it = 0; }; reset();
    const assign = () => pts.map(p => { let b = 0, bd = 1e9; cb.forEach((e, j) => { const d = (p[0] - e[0]) ** 2 + (p[1] - e[1]) ** 2; if (d < bd) { bd = d; b = j; } }); return b; });
    st.interval = 260; st.tick = () => { const a = assign(); cb = cb.map((e, j) => { const m = pts.filter((_, i) => a[i] === j); if (!m.length) return e; const mx = m.reduce((s, p) => s + p[0], 0) / m.length, my = m.reduce((s, p) => s + p[1], 0) / m.length; return [e[0] + .3 * (mx - e[0]), e[1] + .3 * (my - e[1])]; }); it++; if (it > 30) return false; };
    st.draw = () => { const { ctx } = st, s = Math.min(st.W, st.H) / 5.4, cx = st.W / 2, cy = st.H / 2, P = (x, y) => [cx + x * s, cy - y * s]; ctx.clearRect(0, 0, st.W, st.H); const a = assign();
      pts.forEach((p, i) => { ctx.strokeStyle = PAL[a[i]] + "33"; ctx.beginPath(); ctx.moveTo(...P(...p)); ctx.lineTo(...P(...cb[a[i]])); ctx.stroke(); dot(ctx, ...P(...p), 2.6, PAL[a[i]]); });
      const used = new Set(a); let dist = 0; pts.forEach((p, i) => dist += (p[0] - cb[a[i]][0]) ** 2 + (p[1] - cb[a[i]][1]) ** 2);
      cb.forEach((e, j) => { const [x, y] = P(...e); ctx.fillStyle = used.has(j) ? PAL[j] : "#fff"; ctx.strokeStyle = used.has(j) ? "#fff" : C.muted; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.fill(); ctx.stroke(); txt(ctx, "e" + (j + 1), x + 11, y - 6, used.has(j) ? PAL[j] : C.muted, 11, "left", "700"); });
      st.info.innerHTML = `<span>iteration <b>${it}</b></span><span>codes used <b>${used.size}/${K}</b></span><span>quantisation error <b>${(dist / pts.length).toFixed(3)}</b></span><span class="hint">hollow diamond = dead code (collapse)</span>`; };
    st.controls({ reset }); st.size();
  };

  /* video frame sampling */
  A.frames = host => {
    const st = stage(host, { label: "Frame sampling and token budget", h: 300 });
    let F = 8, tpf = 144; const dur = 300, ev = [100, 108], ctxLen = 8192; let t = 0;
    st.interval = 60; st.tick = () => { t = (t + 1.5) % dur; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 18, X = s => pad + s / dur * (st.W - 2 * pad), y0 = 46;
      for (let s = 0; s < dur; s += 2) { ctx.fillStyle = `hsl(${200 + 40 * Math.sin(s / 30)},30%,${78 + 8 * Math.sin(s / 11)}%)`; ctx.fillRect(X(s), y0, X(2) - X(0) + .5, 34); }
      ctx.fillStyle = "rgba(224,100,26,.85)"; ctx.fillRect(X(ev[0]), y0 - 4, X(ev[1]) - X(ev[0]), 42); txt(ctx, "key event", X(ev[0]) + (X(ev[1]) - X(ev[0])) / 2, y0 - 8, C.b, 11, "center", "700");
      let caught = false; for (let i = 0; i < F; i++) { const s = (i + .5) * dur / F; if (s >= ev[0] && s <= ev[1]) caught = true; ctx.strokeStyle = C.a; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(s), y0 - 2); ctx.lineTo(X(s), y0 + 40); ctx.stroke(); dot(ctx, X(s), y0 + 46, 4, C.a); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(t), y0 - 2); ctx.lineTo(X(t), y0 + 36); ctx.stroke();
      for (let m = 0; m <= 5; m++) txt(ctx, m + " min", X(m * 60), y0 + 64, C.muted, 10, "center");
      const tok = F * tpf, by = st.H - 40, bw = st.W - 2 * pad; ctx.fillStyle = "#efece5"; ctx.fillRect(pad, by, bw, 14); ctx.fillStyle = tok > ctxLen ? C.bad : C.ok; ctx.fillRect(pad, by, Math.min(1, tok / ctxLen) * bw, 14);
      txt(ctx, `${tok.toLocaleString()} visual tokens of an 8,192 context`, pad, by - 6, C.ink, 11.5, "left", "700");
      txt(ctx, caught ? "✓ event sampled" : "✗ event missed", st.W - pad, 18, caught ? C.ok : C.bad, 13, "right", "800");
      st.info.innerHTML = `<span>frames <b>${F}</b> (one per ${(dur / F).toFixed(1)} s)</span><span>tokens/frame <b>${tpf}</b></span><span>total <b>${tok.toLocaleString()}</b></span>`; };
    st.controls({ step: false }); st.slider("frames", 2, 64, 1, 8, v => { F = v; st.draw(); }); st.slider("tokens/frame", 16, 576, 16, 144, v => { tpf = v; st.draw(); }); st.size();
  };

  /* mel spectrogram */
  A.melspec = host => {
    const st = stage(host, { label: "Waveform → Mel spectrogram", h: 320 });
    const T = 120, B = 32, r = R(5), spec = [], wave = [];
    const f0 = t => 6 + 3 * Math.sin(t / 14); for (let i = 0; i < T; i++) { const voiced = (i % 40) < 30, col = []; for (let b = 0; b < B; b++) { let v = .04 * r(); if (voiced) { for (let h = 1; h < 8; h++) { const fb = f0(i) * h * .55; v += Math.exp(-((b - fb) ** 2) / 1.2) * (1 / h) * (.9 + .2 * Math.sin(i / 5)); } const form = [8 + 3 * Math.sin(i / 9), 17 + 4 * Math.cos(i / 13)]; form.forEach(fm => v += .35 * Math.exp(-((b - fm) ** 2) / 6)); } else v += (i % 40 > 33 ? .25 * r() * (b / B) : 0); col.push(Math.min(1, v)); } spec.push(col); }
    for (let i = 0; i < T * 8; i++) { const fr = Math.floor(i / 8), voiced = (fr % 40) < 30; wave.push(voiced ? Math.sin(i * .9) * (.5 + .4 * Math.sin(i * .07)) + .2 * Math.sin(i * 2.3) : (fr % 40 > 33 ? .3 * r.n() : .02 * r.n())); }
    let k = 0; st.interval = 40; st.tick = () => { k = (k + 1) % (T + 15); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 14, w = st.W - 2 * pad, wh = st.H * .28, sy = wh + 34, sh = st.H - sy - 14, cw = w / T;
      txt(ctx, "waveform", pad, 12, C.muted, 11, "left", "600"); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); wave.forEach((v, i) => { const x = pad + i / wave.length * w, y = 18 + wh / 2 - v * wh * .45; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      const kk = Math.min(k, T - 1); ctx.fillStyle = "rgba(224,100,26,.2)"; ctx.fillRect(pad + kk * cw - cw, 18, cw * 3, wh);
      txt(ctx, "Mel spectrogram (low → high frequency upward)", pad, sy - 6, C.muted, 11, "left", "600");
      for (let i = 0; i < Math.min(k, T); i++) for (let b = 0; b < B; b++) { const v = spec[i][b]; ctx.fillStyle = `hsl(${250 - 200 * v},70%,${15 + 60 * v}%)`; ctx.fillRect(pad + i * cw, sy + sh - (b + 1) * sh / B, cw + .5, sh / B + .5); }
      st.info.innerHTML = `<span>frame <b>${Math.min(k, T)}</b>/${T}</span><span>10 ms hop → 100 frames/s</span><span class="hint">stripes = harmonics; broad bands = formants; noise = fricatives</span>`; };
    st.controls({ reset: () => { k = 0; } }); st.size();
  };

  /* classifier-free guidance */
  A.cfg = host => {
    const st = stage(host, { label: "Classifier-free guidance on a toy distribution", h: 320 });
    const modes = [[-1.6, 1], [1.6, 1], [0, -1.4]], tgt = 1; let w = 1, r = R(3), samples = [];
    const gen = () => { r = R(3); samples = Array.from({ length: 160 }, () => { const m = modes[Math.floor(r() * 3)], u = [m[0] + .45 * r.n(), m[1] + .45 * r.n()], c = [modes[tgt][0] + .45 * r.n(), modes[tgt][1] + .45 * r.n()]; return { u, c }; }); }; gen();
    let anim = 0; st.interval = 60; st.tick = () => { anim = Math.min(1, anim + .04); };
    st.draw = () => { const { ctx } = st, s = Math.min(st.W, st.H) / 6.2, cx = st.W / 2, cy = st.H / 2 + 10, P = (x, y) => [cx + x * s, cy - y * s]; ctx.clearRect(0, 0, st.W, st.H);
      modes.forEach((m, i) => { ctx.strokeStyle = i === tgt ? C.b : C.grid; ctx.setLineDash(i === tgt ? [] : [4, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(...P(...m), .9 * s, 0, 7); ctx.stroke(); ctx.setLineDash([]); txt(ctx, i === tgt ? "prompt: 'class B'" : ["class A", "", "class C"][i], P(...m)[0], P(...m)[1] - .9 * s - 6, i === tgt ? C.b : C.muted, 11, "center", "700"); });
      let inT = 0, sx = 0, sy2 = 0; const pts = samples.map(({ u, c }) => { const ww = 1 + (w - 1) * anim, p = [u[0] + ww * (c[0] - u[0]) * (w === 0 ? 0 : 1) , u[1] + ww * (c[1] - u[1]) * (w === 0 ? 0 : 1)]; return w === 0 ? u : p; });
      pts.forEach(p => { dot(ctx, ...P(...p), 2.8, C.a); if (Math.hypot(p[0] - modes[tgt][0], p[1] - modes[tgt][1]) < .9) inT++; sx += p[0]; sy2 += p[1]; });
      const mx = sx / pts.length, my = sy2 / pts.length, sd = Math.sqrt(pts.reduce((a, p) => a + (p[0] - mx) ** 2 + (p[1] - my) ** 2, 0) / pts.length);
      st.info.innerHTML = `<span>guidance w = <b>${w}</b></span><span>inside prompted cluster <b>${Math.round(100 * inT / pts.length)} %</b></span><span>spread <b>${sd.toFixed(2)}</b></span><span class="hint">w = 0 unconditional · 1 conditional · &gt;1 extrapolated</span>`; };
    st.controls({ step: false }); st.slider("guidance w", 0, 6, .5, 1, v => { w = v; anim = 0; st.draw(); }); st.size();
  };

  /* MoE routing */
  A.moe = host => {
    const st = stage(host, { label: "Top-2 routing to experts", h: 330 });
    const E = 6, cap = 9; let bal = true, r = R(7), toks = [], load;
    const pref = (mod) => mod ? [3.0, 2.5, .2, .3, .1, 0] : [.2, 2.4, 2.8, .4, .3, .1];
    const route = () => { load = Array(E).fill(0); const imp = Array(E).fill(0); toks.forEach(tk => { const lg = pref(tk.m).map((v, i) => v + .9 * tk.noise[i] - (bal ? .45 * load[i] : 0)); const idx = lg.map((v, i) => i).sort((a, b) => lg[b] - lg[a]).slice(0, 2); tk.e = idx; idx.forEach(i => load[i]++); }); };
    const reset = () => { r = R(7); toks = []; load = Array(E).fill(0); }; reset();
    st.interval = 160; st.tick = () => { toks.push({ m: r() < .5 ? 0 : 1, noise: Array.from({ length: E }, () => r.n()) }); if (toks.length > 24) toks.shift(); route(); };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const pad = 16, ex = st.W - 120, eh = (st.H - 30) / E, tw = Math.min(14, (ex - 120) / 24);
      txt(ctx, "tokens", pad, 16, C.ink, 11, "left", "700"); txt(ctx, "router", ex - 70, 16, C.ink, 11, "center", "700");
      toks.forEach((tk, i) => { const x = pad + i * tw, y = st.H / 2 - 8; ctx.fillStyle = tk.m ? C.b : C.a; ctx.fillRect(x, y, tw - 2, 16); if (i === toks.length - 1) tk.e.forEach(e => { ctx.strokeStyle = (tk.m ? C.b : C.a) + "aa"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + tw / 2, y + 8); ctx.lineTo(ex - 70, st.H / 2); ctx.lineTo(ex, 24 + e * eh + eh / 2 - 6); ctx.stroke(); }); });
      ctx.fillStyle = "#efece5"; ctx.beginPath(); ctx.arc(ex - 70, st.H / 2, 14, 0, 7); ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke(); txt(ctx, "R", ex - 70, st.H / 2 + 4, C.ink, 12, "center", "800");
      for (let e = 0; e < E; e++) { const y = 24 + e * eh; ctx.fillStyle = "#f3f1eb"; ctx.fillRect(ex, y, 104, eh - 12); const l = load[e] || 0; ctx.fillStyle = l > cap ? C.bad : C.ok; ctx.fillRect(ex, y, Math.min(104, 104 * l / (cap * 1.6)), eh - 12); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(ex + 104 / 1.6, y); ctx.lineTo(ex + 104 / 1.6, y + eh - 12); ctx.stroke(); txt(ctx, `E${e + 1}: ${l}`, ex + 4, y + (eh - 12) / 2 + 4, C.ink, 10.5, "left", "700"); }
      const over = (load || []).reduce((a, l) => a + Math.max(0, l - cap), 0), active = (load || []).filter(l => l > 0).length;
      st.info.innerHTML = `<span>balancing <b>${bal ? "on" : "off"}</b></span><span>experts used <b>${active}/${E}</b></span><span>overflow (dropped) <b>${over}</b></span><span class="hint">blue = text tokens, orange = image tokens; line = capacity</span>`; };
    st.controls({ reset }); st.button("Toggle load balancing", () => { bal = !bal; route(); st.draw(); }); st.size();
  };

  /* typographic attack */
  A.typo = host => {
    const st = stage(host, { label: "Typographic attack on a CLIP-like model", h: 300 });
    let op = 0, auto = true; st.interval = 60; st.tick = () => { if (auto) op = (op + .01) % 1.2; };
    st.draw = () => { const { ctx } = st; ctx.clearRect(0, 0, st.W, st.H); const S = Math.min(st.H - 30, st.W * .45), x0 = 14, y0 = 14, o = Math.min(1, op);
      ctx.fillStyle = "#dfe9d8"; ctx.fillRect(x0, y0, S, S); ctx.fillStyle = "#b0773e"; ctx.beginPath(); ctx.ellipse(x0 + S * .5, y0 + S * .62, S * .25, S * .14, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x0 + S * .73, y0 + S * .45, S * .11, 0, 7); ctx.fill();
      ctx.fillStyle = "#8a5426"; ctx.beginPath(); ctx.ellipse(x0 + S * .8, y0 + S * .37, S * .04, S * .08, .5, 0, 7); ctx.fill(); [[.33, .75], [.43, .76], [.58, .76], [.66, .75]].forEach(([a, b]) => ctx.fillRect(x0 + S * a, y0 + S * b, S * .04, S * .14));
      ctx.globalAlpha = o; ctx.fillStyle = "#fffbe6"; ctx.save(); ctx.translate(x0 + S * .32, y0 + S * .3); ctx.rotate(-.12); ctx.fillRect(-S * .2, -S * .1, S * .4, S * .2); ctx.strokeStyle = "#d9cf9b"; ctx.strokeRect(-S * .2, -S * .1, S * .4, S * .2); txt(ctx, "CAT", 0, S * .055, "#222", S * .14, "center", "800"); ctx.restore(); ctx.globalAlpha = 1;
      const sdog = 2.2 - 3.4 * o, scat = -.5 + 3.0 * o, sfox = .2, e = [sdog, scat, sfox].map(Math.exp), z = e.reduce((a, b) => a + b, 0), p = e.map(v => v / z);
      const bx = x0 + S + 24, bw = st.W - bx - 50; [["dog", p[0], C.ok], ["cat", p[1], C.bad], ["fox", p[2], C.muted]].forEach(([l, v, col], i) => { const y = y0 + 20 + i * 40; txt(ctx, `"a photo of a ${l}"`, bx, y, C.ink, 11.5, "left", "600"); ctx.fillStyle = "#efece5"; ctx.fillRect(bx, y + 6, bw, 12); ctx.fillStyle = col; ctx.fillRect(bx, y + 6, bw * v, 12); txt(ctx, v.toFixed(2), bx + bw + 6, y + 16, C.ink, 11, "left", "700"); });
      st.info.innerHTML = `<span>note visibility <b>${Math.round(o * 100)} %</b></span><span>prediction <b>${p[0] > p[1] ? "dog" : "cat"}</b></span><span class="hint">the model reads the note instead of looking at the animal</span>`; };
    st.controls({ step: false }); st.slider("note visibility", 0, 1, .05, 0, v => { op = v; auto = false; st.draw(); }); st.size();
  };
})();
