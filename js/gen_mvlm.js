/* Numeric question generators for Multimodal (MVLM). */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000);
  const num = n => n.toLocaleString("en-US");

  G.tokOps = { lvl: 2, make(r) {
    const kind = r.pick(["img", "audio", "bits"]);
    if (kind === "img") { const S = r.pick([256, 384, 512]), f = r.pick([8, 16, 32]);
      return { q: `A ${S}×${S} image through a tokenizer with downsampling factor ${f} gives how many tokens?`, ans: (S / f) ** 2,
        what: "(side / factor)².", why: "Token count sets generation cost.", how: `(${S}/${f})² = ${(S / f) ** 2}.`, trap: "Square the grid side." }; }
    if (kind === "audio") { const fr = r.pick([25, 50, 75]), cb = r.pick([1, 2, 4, 8]), s = r.pick([5, 10, 20, 30]);
      return { q: `Audio codec at ${fr} frames/s with ${cb} codebook(s). Tokens for ${s} s?`, ans: fr * cb * s,
        what: "frames/s × codebooks × seconds.", why: "Speech LMs must budget these long sequences.", how: `${fr} × ${cb} × ${s} = ${num(fr * cb * s)}.`, trap: "Count every codebook." }; }
    const K = r.pick([256, 512, 1024, 4096, 8192, 16384]), fr = r.pick([50, 75]), cb = r.pick([2, 4, 8]);
    return { q: `Codec: ${fr} frames/s, ${cb} codebooks of size ${num(K)}. Bitrate in kbps?`, ans: fr * cb * Math.log2(K) / 1000, tol: .001,
      what: "bits/s = frames/s × codebooks × log₂ K.", why: "Compares codecs fairly.", how: `${fr} × ${cb} × ${Math.log2(K)} = ${num(fr * cb * Math.log2(K))} bit/s.`, trap: "Use log₂ of the codebook size." };
  } };

  G.videoOps = { lvl: 2, make(r) {
    const kind = r.pick(["budget", "tubelet", "fit"]);
    if (kind === "budget") { const m = r.pick([1, 2, 5, 10]), fps = r.pick([.5, 1, 2]), t = r.pick([32, 64, 144, 256]);
      return { q: `A ${m}-minute video sampled at ${fps} frame/s with ${t} tokens per frame. Visual tokens?`, ans: m * 60 * fps * t,
        what: "frames × tokens per frame.", why: "Video context budgets explode quickly.", how: `${m * 60 * fps} frames × ${t} = ${num(m * 60 * fps * t)}.`, trap: "Use the sampling rate, not the native fps." }; }
    if (kind === "tubelet") { const T = r.pick([8, 16, 32]), t = r.pick([2, 4]), S = r.pick([224, 256]), P = 16;
      return { q: `Tubelets of ${t} frames × ${P}×${P} on ${T} frames of ${S}×${S}. Tokens?`, ans: (T / t) * (S / P) ** 2,
        what: "(T/t)·(H/P)·(W/P).", why: "Space-time patches cut tokens versus per-frame patches.", how: `${T / t} × ${S / P}² = ${num((T / t) * (S / P) ** 2)}.`, trap: "Divide time by the tubelet length too." }; }
    const C = r.pick([8000, 16000, 32000, 128000]), res = r.pick([1000, 2000, 4000]), t = r.pick([64, 144, 196, 256]);
    return { q: `Context ${num(C)} tokens, ${num(res)} reserved for text, ${t} tokens per frame. Maximum frames?`, ans: Math.floor((C - res) / t),
      what: "⌊(context − text)/tokens per frame⌋.", why: "Trades frame count against per-frame detail.", how: `(${num(C)} − ${num(res)})/${t} = ${f3((C - res) / t)} → ${Math.floor((C - res) / t)}.`, trap: "Round down." };
  } };

  G.audioOps = { lvl: 3, make(r) {
    const kind = r.pick(["wer", "frames", "mel"]);
    if (kind === "wer") { const N = r.int(5, 20), S = r.int(0, 3), D = r.int(0, 3), I = r.int(0, 3);
      return { q: `Reference has ${N} words. The hypothesis has ${S} substitution(s), ${D} deletion(s), ${I} insertion(s). WER (%) = ____.`, ans: 100 * (S + D + I) / N, tol: .01,
        what: "WER = (S + D + I)/N.", why: "Word-level edit distance normalised by reference length.", how: `(${S} + ${D} + ${I})/${N} = ${f3(100 * (S + D + I) / N)} %.`, trap: "Divide by the reference length." }; }
    if (kind === "frames") { const hop = r.pick([10, 12.5, 20, 25]), s = r.pick([2, 5, 10, 30]);
      return { q: `Spectrogram hop of ${hop} ms. About how many frames in ${s} s of audio?`, ans: Math.round(s * 1000 / hop),
        what: "frames ≈ duration / hop.", why: "The hop sets the frame rate.", how: `${s * 1000}/${hop} = ${Math.round(s * 1000 / hop)}.`, trap: "The window length doesn't set the count; the hop does." }; }
    const f = r.pick([200, 500, 1000, 2000, 4000, 8000]), m = 2595 * Math.log10(1 + f / 700);
    return { q: `Convert ${num(f)} Hz to mel using mel = 2595·log₁₀(1 + f/700) (1 decimal).`, ans: m, tol: .1,
      what: "The Mel scale is roughly linear below 1 kHz and logarithmic above.", why: "It mimics human pitch perception.", how: `2595·log₁₀(${f3(1 + f / 700)}) = ${m.toFixed(1)}.`, trap: "Use log base 10." };
  } };

  G.anyOps = { lvl: 3, make(r) {
    const kind = r.pick(["cfg", "passes", "latent"]);
    if (kind === "cfg") { const u = r.pick([-.2, 0, .1, .2, .3]), c = r.pick([.4, .5, .6, .8]), w = r.pick([1, 3, 5, 7.5, 10]);
      return { q: `CFG with ε_u = ${u}, ε_c = ${c}, scale w = ${w}. Guided ε̂ = ____.`, ans: u + w * (c - u), tol: .001,
        what: "ε̂ = ε_u + w(ε_c − ε_u).", why: "Extrapolates toward the prompt-conditioned prediction.", how: `${u} + ${w}·(${c} − ${u}) = ${f3(u + w * (c - u))}.`, trap: "w = 1 just returns ε_c." }; }
    if (kind === "passes") { const s = r.pick([4, 20, 25, 30, 50]), cfg = r.pick([0, 1]);
      return { q: `A diffusion sampler with ${s} steps${cfg ? " and classifier-free guidance" : " without guidance"}. Network evaluations?`, ans: s * (cfg ? 2 : 1),
        what: "CFG needs conditional + unconditional passes per step.", why: "Guidance doubles sampling cost.", how: `${s} × ${cfg ? 2 : 1} = ${s * (cfg ? 2 : 1)}.`, trap: "Without CFG, one pass per step." }; }
    const S = r.pick([512, 768, 1024]), f = 8, ch = 4, ratio = (S * S * 3) / ((S / f) ** 2 * ch);
    return { q: `Latent diffusion: a ${S}×${S}×3 image maps to a ${S / f}×${S / f}×${ch} latent. Compression ratio in number of values?`, ans: ratio,
      what: "pixel values / latent values.", why: "Diffusing in latent space is far cheaper.", how: `${num(S * S * 3)} / ${num((S / f) ** 2 * ch)} = ${ratio}.`, trap: "Include the channel counts." };
  } };

  G.moeOps = { lvl: 3, make(r) {
    const kind = r.pick(["active", "cap", "gate"]);
    if (kind === "active") { const sh = r.pick([1, 1.3, 2, 5]), e = r.pick([.1, .117, .5, 1.4]), k = r.pick([1, 2]), N = r.pick([8, 16, 64]);
      return { q: `MoE: shared parameters ${sh}B, ${N} experts of ${e}B each, top-${k}. Active parameters per token (B, 3 decimals)?`, ans: sh + k * e, tol: .001,
        what: "shared + k × expert size.", why: "Compute follows active, not total, parameters.", how: `${sh} + ${k}×${e} = ${f3(sh + k * e)}B (total ${f3(sh + N * e)}B).`, trap: "Don't multiply by the number of experts." }; }
    if (kind === "cap") { const T = r.pick([512, 800, 1024, 2048]), E = r.pick([4, 8, 16]), cf = r.pick([1, 1.25, 1.5, 2]);
      return { q: `${num(T)} tokens, ${E} experts, top-1, capacity factor ${cf}. Tokens per expert (max)?`, ans: Math.floor(cf * T / E),
        what: "capacity = factor × tokens / experts.", why: "Overflow tokens are dropped or rerouted.", how: `${cf} × ${T}/${E} = ${f3(cf * T / E)}.`, trap: "Factor 1.0 means zero slack." }; }
    const a = r.pick([1, 1.5, 2, 3]), b = r.pick([0, .5, 1]), w = 1 / (1 + Math.exp(b - a));
    return { q: `Top-2 router: selected logits ${a} and ${b}. Weight on the first expert after softmax over the two = ____ (3 decimals).`, ans: w, tol: .002,
      what: "Softmax over the selected logits only.", why: "Combines the chosen experts' outputs.", how: `1/(1 + e^{${b} − ${a}}) = ${f3(w)}.`, trap: "Ignore experts not selected." };
  } };

  G.mmEval = { lvl: 3, make(r) {
    const kind = r.pick(["asr", "tpr", "pool"]);
    if (kind === "asr") { const n = r.pick([100, 200, 500]), k = r.int(2, 60); return { q: `${k} of ${n} harmful prompts succeed against a model. Attack success rate (%)?`, ans: 100 * k / n, tol: .01,
      what: "ASR = successes / attempts.", why: "Lower ASR = more robust.", how: `${k}/${n} = ${f3(100 * k / n)} %.`, trap: "Also check over-refusal on benign prompts." }; }
    if (kind === "tpr") { const P = 100, tp = r.int(70, 99), fp = r.int(0, 10); return { q: `A detector flags ${tp} of ${P} fake images and ${fp} of 100 real images. Precision (3 decimals)?`, ans: tp / (tp + fp), tol: .002,
      what: "precision = TP/(TP + FP).", why: "How trustworthy a 'fake' flag is.", how: `${tp}/(${tp} + ${fp}) = ${f3(tp / (tp + fp))}.`, trap: "TPR is TP/positives; precision divides by all flags." }; }
    const a = r.int(900, 1800), am = 2000, b = r.int(150, 600), bm = 800;
    return { q: `Benchmark points: perception ${a}/${am}, cognition ${b}/${bm}. Pooled score (%)?`, ans: 100 * (a + b) / (am + bm), tol: .01,
      what: "Sum of points / sum of maxima.", why: "Pooling weights categories by size.", how: `${a + b}/${am + bm} = ${f3(100 * (a + b) / (am + bm))} %.`, trap: "Not the average of the two percentages." };
  } };
})();
