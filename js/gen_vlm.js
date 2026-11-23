/* Numeric question generators for Vision-Language Models. */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000);
  const num = n => n.toLocaleString("en-US");
  const sg = z => 1 / (1 + Math.exp(-z));

  G.vitOps = { lvl: 2, make(r) {
    const kind = r.pick(["tokens", "embed", "rf"]);
    if (kind === "tokens") { const P = r.pick([14, 16, 32]), g = r.pick([7, 14, 16, 24, 32]), S = P * g, cls = r.pick([0, 1]);
      return { q: `A ViT with patch size ${P} on a ${S}×${S} image produces how many tokens${cls ? " including [CLS]" : " (patches only)"}?`, ans: g * g + cls,
        what: "Tokens = (H/P)·(W/P) (+1 for [CLS]).", why: "Token count drives attention cost.", how: `(${S}/${P})² = ${g}² = ${g * g}${cls ? " + 1 = " + (g * g + 1) : ""}.`, trap: "Divide the side by the patch size, then square." }; }
    if (kind === "embed") { const P = r.pick([14, 16, 32]), d = r.pick([384, 768, 1024, 1280]);
      return { q: `Patch embedding: ${P}×${P} RGB patches projected to d = ${d}. Number of weights (no bias)?`, ans: P * P * 3 * d,
        what: "Weights = P·P·3·d.", why: "Equivalent to a P×P convolution with stride P.", how: `${P}·${P}·3 = ${P * P * 3}; × ${d} = ${num(P * P * 3 * d)}.`, trap: "Include all 3 colour channels." }; }
    const k = r.pick([3, 5]), L = r.int(2, 8);
    return { q: `Stacking ${L} conv layers of size ${k}×${k}, stride 1, no pooling. The receptive field side length is ____.`, ans: 1 + L * (k - 1),
      what: "RF = 1 + L·(k − 1).", why: "Each layer widens the view by k − 1.", how: `1 + ${L}·${k - 1} = ${1 + L * (k - 1)}.`, trap: `Not ${k}·${L}.` };
  } };

  G.clipOps = { lvl: 3, make(r) {
    const kind = r.pick(["zs", "ce", "sig"]);
    if (kind === "zs") { const s = [r.pick([.28, .3, .32]), r.pick([.22, .25, .27]), r.pick([.18, .2, .21])], sc = r.pick([10, 50, 100]), e = s.map(x => Math.exp(sc * x)), Z = e.reduce((a, b) => a + b, 0);
      return { q: `Cosine similarities to 3 class prompts: ${s.join(", ")}. Logit scale ${sc}. Probability of class 1 = ____ (3 decimals).`, ans: e[0] / Z, tol: .002,
        what: "p = softmax(scale · cos).", why: "The scale converts small cosine gaps into confident predictions.", how: `logits (${s.map(x => f3(sc * x)).join(", ")}) → ${f3(e[0] / Z)}.`, trap: "Apply the scale before the softmax." }; }
    if (kind === "ce") { const N = r.pick([4, 8, 16]), p = r.pick([3, 4, 5, 6]), n = r.pick([0, 1]), v = Math.log(1 + (N - 1) * Math.exp(n - p));
      return { q: `CLIP batch of ${N}. Image 1's logits: ${p} for its caption and ${n} for each of the other ${N - 1}. Its image→text loss is ____ (3 decimals).`, ans: v, tol: .002,
        what: "CE = −log softmax(logits)[correct].", why: "InfoNCE: the true caption must beat all in-batch negatives.", how: `−log(e^${p}/(e^${p} + ${N - 1}e^${n})) = log(1 + ${N - 1}e^{${n - p}}) = ${f3(v)}.`, trap: `Chance level would be ln ${N} = ${f3(Math.log(N))}.` }; }
    const z = r.pick([-2, -1, 0, 1, 2, 3]), pos = r.pick([1, 0]), v = pos ? -Math.log(sg(z)) : -Math.log(sg(-z));
    return { q: `SigLIP: a ${pos ? "positive" : "negative"} image–text pair has logit z = ${z}. Its sigmoid loss is ____ (3 decimals).`, ans: v, tol: .002,
      what: "Positive: −log σ(z). Negative: −log σ(−z).", why: "Each pair is an independent binary decision.", how: `${pos ? `−ln σ(${z})` : `−ln σ(${-z})`} = ${f3(v)}.`, trap: "Flip the sign of z for negatives." };
  } };

  G.capOps = { lvl: 3, make(r) {
    const kind = r.pick(["vqa", "bp", "mix"]);
    if (kind === "vqa") { const m = r.int(0, 6); return { q: `${m} of 10 annotators gave the model's VQA answer. VQA accuracy = ____ (3 decimals).`, ans: Math.min(m / 3, 1), tol: .002,
      what: "acc = min(#matches/3, 1).", why: "Full credit when at least 3 people agree.", how: `min(${m}/3, 1) = ${f3(Math.min(m / 3, 1))}.`, trap: "It's not matches/10." }; }
    if (kind === "bp") { const c = r.int(5, 12), rr = r.int(c, 15), bp = c >= rr ? 1 : Math.exp(1 - rr / c);
      return { q: `BLEU brevity penalty for a ${c}-word candidate and a ${rr}-word reference = ____ (3 decimals).`, ans: bp, tol: .002,
        what: "BP = 1 if c ≥ r, else exp(1 − r/c).", why: "Penalises short, high-precision captions.", how: c >= rr ? "c ≥ r → 1." : `exp(1 − ${rr}/${c}) = ${f3(bp)}.`, trap: "Use r/c, not c/r." }; }
    const sh = [r.pick([.35, .38, .4]), r.pick([.1, .12, .15])]; sh.push(Math.round((1 - sh[0] - sh[1]) * 100) / 100); const ac = [r.int(75, 90), r.int(40, 60), r.int(50, 70)], v = sh.reduce((a, s, i) => a + s * ac[i], 0);
    return { q: `VQA per-type accuracy: yes/no ${ac[0]} %, number ${ac[1]} %, other ${ac[2]} %, with shares ${sh.join(", ")}. Overall accuracy (%) = ____.`, ans: v, tol: .01,
      what: "Weighted average by question-type share.", why: "Overall scores hide weak categories like counting.", how: `${sh.map((s, i) => s + "·" + ac[i]).join(" + ")} = ${f3(v)}.`, trap: "Don't average the three accuracies equally." };
  } };

  G.xattnOps = { lvl: 3, make(r) {
    const kind = r.pick(["gate", "size", "params"]);
    if (kind === "gate") { const a = r.pick([.1, .25, .5, 1, 2]); return { q: `A Flamingo gate has α = ${a}. The fraction of cross-attention output added, tanh(α), is ____ (3 decimals).`, ans: Math.tanh(a), tol: .002,
      what: "y = x + tanh(α)·xattn(x).", why: "α = 0 at init keeps the frozen LM unchanged.", how: `tanh(${a}) = ${f3(Math.tanh(a))}.`, trap: "It's tanh(α), not α." }; }
    if (kind === "size") { const L = r.pick([32, 64, 128]), f = r.pick([1, 4, 8]), p = r.pick([196, 256, 576]);
      return { q: `Perceiver resampler: ${L} latents attend to ${f} frame(s) × ${p} patches. Entries in the cross-attention matrix per head?`, ans: L * f * p,
        what: "latents × input tokens.", why: "Linear in input size; output stays fixed at the latent count.", how: `${L} × ${f * p} = ${num(L * f * p)}.`, trap: "It's not (latents + inputs)²." }; }
    const d = r.pick([1024, 2048, 4096, 5120]); return { q: `A cross-attention block with width d = ${num(d)} has Q, K, V, O projections (no bias). Parameters = ____.`, ans: 4 * d * d,
      what: "4·d².", why: "Each inserted cross-attention layer is as big as a self-attention layer.", how: `4 × ${num(d)}² = ${num(4 * d * d)}.`, trap: "Count all four matrices." };
  } };

  G.llavaOps = { lvl: 3, make(r) {
    const kind = r.pick(["tiles", "ctx", "shuffle"]);
    if (kind === "tiles") { const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3]), t = r.pick([576, 256, 144]), g = r.pick([0, 1]);
      return { q: `AnyRes with ${a}×${b} tiles${g ? " plus 1 global thumbnail" : ""}, ${t} tokens per view. Visual tokens per image = ____.`, ans: (a * b + g) * t,
        what: "(tiles + global) × tokens per view.", why: "High resolution multiplies context use.", how: `(${a * b}${g ? " + 1" : ""}) × ${t} = ${num((a * b + g) * t)}.`, trap: "Include the global view if present." }; }
    if (kind === "ctx") { const C = r.pick([2048, 4096, 8192]), T = r.pick([200, 300, 500, 800]), v = r.pick([576, 729, 256]);
      return { q: `Context ${num(C)} tokens, conversation uses ${T}. How many ${v}-token images fit?`, ans: Math.floor((C - T) / v),
        what: "floor((context − text)/tokens per image).", why: "Projection-style VLMs spend context on images.", how: `(${num(C)} − ${T})/${v} = ${f3((C - T) / v)} → ${Math.floor((C - T) / v)}.`, trap: "Round down." }; }
    const g = r.pick([24, 16, 32]), f = r.pick([2, 4].filter(x => g % x === 0)), d = r.pick([768, 1024, 1152]);
    return { q: `Pixel-shuffle with factor ${f} on a ${g}×${g} grid of ${d}-dim tokens. How many tokens come out?`, ans: (g / f) ** 2,
      what: `Each ${f}×${f} block merges into one token.`, why: "Fewer tokens for the LLM; wider features keep the information.", how: `(${g}/${f})² = ${(g / f) ** 2} tokens of ${d * f * f} dims.`, trap: "Width grows by f², count shrinks by f²." };
  } };

  G.iouOps = { lvl: 3, make(r) {
    const kind = r.pick(["iou", "f1", "norm"]);
    if (kind === "iou") { const a = [r.int(0, 3), r.int(0, 3)], w = r.int(3, 6), b = [a[0] + r.int(1, w - 1), a[1] + r.int(0, w - 1)], w2 = r.int(3, 6);
      const A = [a[0], a[1], a[0] + w, a[1] + w], B = [b[0], b[1], b[0] + w2, b[1] + w2], ix = Math.max(0, Math.min(A[2], B[2]) - Math.max(A[0], B[0])), iy = Math.max(0, Math.min(A[3], B[3]) - Math.max(A[1], B[1])), I = ix * iy, U = w * w + w2 * w2 - I;
      return { q: `Box A = (${A}) and box B = (${B}) as (x1, y1, x2, y2). IoU = ____ (3 decimals).`, ans: I / U, tol: .002,
        what: "IoU = intersection / union.", why: "Standard localisation overlap measure.", how: `intersection ${ix}×${iy} = ${I}; union ${w * w} + ${w2 * w2} − ${I} = ${U} → ${f3(I / U)}.`, trap: "Subtract the overlap once in the union." }; }
    if (kind === "f1") { const P = r.pick([.6, .7, .75, .8, .9]), R = r.pick([.5, .6, .7, .8]); return { q: `Precision ${P}, recall ${R}. F1 = ____ (3 decimals).`, ans: 2 * P * R / (P + R), tol: .002,
      what: "F1 = 2PR/(P + R).", why: "Harmonic mean punishes imbalance.", how: `2·${P}·${R}/${f3(P + R)} = ${f3(2 * P * R / (P + R))}.`, trap: "Not the arithmetic mean." }; }
    const W = r.pick([640, 800, 1024, 1280]), H = r.pick([480, 600, 768]), x = r.int(1, 9) * 100;
    return { q: `A normalised x-coordinate of ${x} (scale 0–1,000) on a ${W}×${H} image is ____ pixels.`, ans: x / 1000 * W, tol: .01,
      what: "x_px = x_norm/1,000 × width.", why: "Normalised boxes are resolution-independent.", how: `${x}/1,000 × ${W} = ${f3(x / 1000 * W)}.`, trap: "Use the width for x and the height for y." };
  } };

  G.popeOps = { lvl: 3, make(r) {
    const P = 500, tp = r.int(350, 490), fp = r.int(10, 250), kind = r.pick(["prec", "acc", "yes", "f1"]);
    const prec = tp / (tp + fp), rec = tp / P, acc = (tp + P - fp) / (2 * P), yes = (tp + fp) / (2 * P), f1 = 2 * prec * rec / (prec + rec);
    const map = { prec: ["precision", prec, `${tp}/(${tp} + ${fp})`], acc: ["accuracy", acc, `(${tp} + ${P - fp})/1,000`], yes: ["yes-ratio", yes, `(${tp} + ${fp})/1,000`], f1: ["F1", f1, `2·${f3(prec)}·${f3(rec)}/(${f3(prec)} + ${f3(rec)})`] }[kind];
    return { q: `POPE with 500 present and 500 absent objects: the model says 'yes' to ${tp} present and ${fp} absent objects. Its ${map[0]} is ____ (3 decimals).`, ans: map[1], tol: .002,
      what: "TP = yes on present, FP = yes on absent, TN = no on absent.", why: "Separating precision, recall and yes-ratio reveals yes-bias.", how: `${map[2]} = ${f3(map[1])}.`, trap: "Recall = TP/500; precision divides by all 'yes' answers." };
  } };
})();
