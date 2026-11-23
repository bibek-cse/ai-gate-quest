/* Numeric question generators for Deep Learning. Same contract as gen_ml.js. */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000), f4 = x => String(Math.round(x * 10000) / 10000);
  const num = n => n.toLocaleString("en-US");

  G.optStep = { lvl: 3, make(r) {
    const kind = r.pick(["mom", "adam", "sgdwd"]);
    if (kind === "mom") { const b = r.pick([.5, .8, .9]), g = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]; let v = 0; const tr = []; g.forEach(x => { v = b * v + x; tr.push(f3(v)); });
      return { q: `Momentum SGD with v ← ${b}·v + g, v₀ = 0. Gradients ${g.join(", ")} arrive in order. Final v is ____ (3 decimals).`, ans: v, tol: .002,
        what: "Momentum keeps an exponentially decaying sum of past gradients.", why: "Consistent directions accumulate while oscillations cancel.", how: `v after each step: ${tr.join(" → ")}.`, trap: "Apply β to the OLD velocity before adding the new gradient." }; }
    if (kind === "adam") { const g = r.pick([-2, -.5, .1, .4, 3]), eta = r.pick([.001, .01, .1]);
      return { q: `Adam's very first step (t = 1, bias-corrected, ε ≈ 0) with gradient g = ${g} and η = ${eta}. The change Δw is ____.`, ans: -eta * Math.sign(g), tol: 1e-6,
        what: "At t = 1, m̂ = g and ŝ = g², so the step is η·g/|g|.", why: "Adam's first step has size η regardless of the gradient's magnitude.", how: `Δw = −${eta}·${g}/${Math.abs(g)} = ${-eta * Math.sign(g)}.`, trap: "It is not −ηg like plain SGD." }; }
    const w = r.pick([1, 2, .5]), eta = r.pick([.1, .01, .05]), lam = r.pick([.01, .1, .001]), g = r.pick([0, .5, -1]), nw = w - eta * (g + lam * w);
    return { q: `SGD with L2 weight decay: w = ${w}, gradient of the data loss g = ${g}, η = ${eta}, λ = ${lam}. The new w is ____ (4 decimals).`, ans: nw, tol: .00006,
      what: "w ← w − η(g + λw).", why: "Weight decay shrinks w by the factor (1 − ηλ) every step.", how: `${w} − ${eta}·(${g} + ${lam}·${w}) = ${f4(nw)}.`, trap: "The decay term uses the current w." }; } };

  G.bnDrop = { lvl: 2, make(r) {
    if (r.next() < .5) { const p = r.pick([.1, .2, .25, .4, .5]);
      return { q: `Inverted dropout with drop probability p = ${p}. During training, surviving activations are multiplied by ____ (3 decimals).`, ans: 1 / (1 - p), tol: .002,
        what: "Scale by 1/(1 − p).", why: "This keeps the expected activation equal during training and inference.", how: `1/(1 − ${p}) = ${f3(1 / (1 - p))}.`, trap: "p is the DROP probability, not the keep probability." }; }
    const xs = [r.int(0, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)]; if (new Set(xs).size === 1) xs[0] += 2;
    const m = xs.reduce((a, b) => a + b, 0) / 4, v = xs.reduce((a, x) => a + (x - m) ** 2, 0) / 4, i = r.int(0, 3), out = (xs[i] - m) / Math.sqrt(v);
    return { q: `Batch norm on one feature, batch = (${xs.join(", ")}), ε ≈ 0, population variance, γ = 1, β = 0. The normalised value of ${xs[i]} is ____ (3 decimals).`, ans: out, tol: .002,
      what: "x̂ = (x − μ_B)/√(σ²_B + ε).", why: "This standardises each feature within the batch.", how: `μ = ${f3(m)}, σ² = ${f3(v)}, σ = ${f3(Math.sqrt(v))}, x̂ = ${f3(out)}.`, trap: "BN uses the batch (population) variance, dividing by n." }; } };

  G.convOps = { lvl: 2, make(r) {
    const kind = r.pick(["out", "out", "params", "rf"]);
    if (kind === "out") { const W = r.pick([28, 32, 64, 96, 128, 224, 227]), K = r.pick([1, 3, 5, 7, 11]), S = r.pick([1, 2, 4]), P = r.pick([0, 1, 2, 3]); if (W - K + 2 * P < 0) return G.convOps.make(r);
      const o = Math.floor((W - K + 2 * P) / S) + 1;
      return { q: `Input ${W}×${W}, kernel ${K}×${K}, stride ${S}, padding ${P}. The output spatial size is ____ (one side).`, ans: o, tol: 0,
        what: "out = ⌊(W − K + 2P)/S⌋ + 1.", why: "It counts the kernel positions that fit.", how: `⌊(${W} − ${K} + ${2 * P})/${S}⌋ + 1 = ⌊${(W - K + 2 * P) / S}⌋ + 1 = ${o}.`, trap: "Floor the division, then add 1." }; }
    if (kind === "params") { const K = r.pick([1, 3, 5]), ci = r.pick([3, 16, 32, 64, 128]), co = r.pick([16, 32, 64, 128, 256]), b = r.next() < .7, p = K * K * ci * co + (b ? co : 0);
      return { q: `A ${K}×${K} conv layer from ${ci} to ${co} channels ${b ? "with" : "without"} bias has how many parameters?`, ans: p, tol: 0,
        what: "Parameters = K·K·C_in·C_out (+ C_out biases).", why: "Each output filter spans all the input channels.", how: `${K}·${K}·${ci}·${co}${b ? ` + ${co}` : ""} = ${num(p)}.`, trap: "The spatial input size doesn't matter for the parameter count." }; }
    const L = r.int(2, 5), K = r.pick([3, 5]), rf = 1 + L * (K - 1);
    return { q: `${L} stacked ${K}×${K} convolutions, stride 1, no pooling. The receptive field of one output unit is ____ (one side).`, ans: rf, tol: 0,
      what: "With stride 1, RF = 1 + Σ(K − 1).", why: "Each layer extends the view by K − 1 pixels.", how: `1 + ${L}·${K - 1} = ${rf}.`, trap: "Receptive fields add (K − 1) per layer. They don't multiply." }; } };

  G.resnetOps = { lvl: 3, make(r) {
    const c = r.pick([64, 128, 256]), kind = r.pick(["basic", "bottleneck", "proj"]);
    if (kind === "basic") { const p = 2 * 9 * c * c;
      return { q: `A ResNet basic block: two 3×3 convs, ${c} → ${c} channels, no bias (ignore BN). The number of conv parameters is ____.`, ans: p, tol: 0, what: "Each conv has 3·3·C·C weights.", why: "Basic blocks are used in ResNet-18/34.", how: `2·9·${c}·${c} = ${num(p)}.`, trap: "There are two convs per block." }; }
    if (kind === "bottleneck") { const m = c / 4 >= 16 ? c / 4 : c, o = m * 4, p = c * m + 9 * m * m + m * o;
      return { q: `A bottleneck block with input ${c} channels: 1×1 conv to ${m}, 3×3 conv ${m}→${m}, 1×1 conv to ${o} (no bias, no BN). The number of parameters is ____.`, ans: p, tol: 0, what: "Sum the three convs: C_in·m + 9m² + m·C_out.", why: "The cheap 1×1 layers sandwich the expensive 3×3.", how: `${c}·${m} + 9·${m}² + ${m}·${o} = ${num(c * m)} + ${num(9 * m * m)} + ${num(m * o)} = ${num(p)}.`, trap: "The 3×3 conv operates on the reduced width m." }; }
    const p = c * 2 * c + 2 * c;
    return { q: `A projection shortcut 1×1 conv (stride 2) mapping ${c} → ${2 * c} channels, with bias. The number of parameters is ____.`, ans: p, tol: 0, what: "1×1 conv: C_in·C_out + C_out.", why: "It matches the shapes so the residual addition works when downsampling.", how: `${c}·${2 * c} + ${2 * c} = ${num(p)}.`, trap: "The stride doesn't change the parameter count." }; } };

  G.rnnParams = { lvl: 3, make(r) {
    const x = r.pick([8, 10, 16, 32, 50, 100]), h = r.pick([16, 20, 32, 64, 128]), cell = r.pick(["RNN", "LSTM", "GRU"]), g = { RNN: 1, LSTM: 4, GRU: 3 }[cell], p = g * (h * (h + x) + h);
    return { q: `A single-layer ${cell} with input size ${x} and hidden size ${h} (one bias vector per gate block) has how many parameters?`, ans: p, tol: 0,
      what: "Each block has h(h + x) + h parameters. RNN has 1 block, GRU 3, LSTM 4.", why: "Every gate has its own input weights, recurrent weights and bias.", how: `${g}·(${h}·${h + x} + ${h}) = ${num(p)}.`, trap: "PyTorch uses two bias vectors per block (+gh more). Read the question's convention." }; } };

  G.attnOps = { lvl: 3, make(r) {
    const kind = r.pick(["soft", "mha", "ffn", "scale"]);
    if (kind === "soft") { const s = [r.int(-1, 3), r.int(-1, 3), r.int(-1, 3)], e = s.map(Math.exp), Z = e.reduce((a, b) => a + b, 0), i = r.int(0, 2);
      return { q: `Scaled attention scores for one query are [${s.join(", ")}]. The attention weight on key ${i + 1} is ____ (3 decimals).`, ans: e[i] / Z, tol: .002,
        what: "Weights = softmax(scores).", why: "Softmax turns scores into a probability distribution over keys.", how: `exp: [${e.map(f3).join(", ")}], sum ${f3(Z)}, so w${i + 1} = ${f3(e[i] / Z)}.`, trap: "Exponentiate before normalising." }; }
    if (kind === "mha") { const d = r.pick([256, 512, 768, 1024]), p = 4 * d * d + 4 * d;
      return { q: `A multi-head self-attention layer with d_model = ${d} and biases on the Q, K, V, O projections has how many parameters?`, ans: p, tol: 0, what: "4 projection matrices d×d + 4 bias vectors.", why: "The number of heads splits d but doesn't change the total.", how: `4·${d}² + 4·${d} = ${num(p)}.`, trap: "Don't multiply by the number of heads." }; }
    if (kind === "ffn") { const d = r.pick([256, 512, 768]), m = r.pick([2, 4]), p = 2 * d * m * d + m * d + d;
      return { q: `A Transformer FFN with d_model = ${d} and hidden size ${m * d} (with biases) has how many parameters?`, ans: p, tol: 0, what: "Two linear layers: d→md and md→d, each with a bias.", why: "The MLP holds most of each layer's parameters.", how: `2·${d}·${m * d} + ${m * d} + ${d} = ${num(p)}.`, trap: "Count both biases." }; }
    const dk = r.pick([16, 25, 36, 64, 100, 128]);
    return { q: `In scaled dot-product attention with d_k = ${dk}, the scores are divided by ____ (3 decimals).`, ans: Math.sqrt(dk), tol: .002, what: "Divide by √d_k.", why: "It keeps the score variance near 1, so softmax doesn't saturate.", how: `√${dk} = ${f3(Math.sqrt(dk))}.`, trap: "The divisor is √d_k, not d_k." }; } };

  G.vaeKL = { lvl: 3, make(r) {
    if (r.next() < .3) { const mu = r.pick([-1, 0, .5, 2]), lv = r.pick([0, Math.log(4), Math.log(.25)]), e = r.pick([-1, -.5, .5, 1]), s = Math.exp(lv / 2), z = mu + s * e;
      return { q: `VAE reparameterisation: μ = ${mu}, log σ² = ${f3(lv)}, ε = ${e}. The sample z is ____ (3 decimals).`, ans: z, tol: .002, what: "z = μ + σ·ε with σ = exp(½ log σ²).", why: "The randomness sits in ε, so gradients flow through μ and σ.", how: `σ = ${f3(s)}, z = ${mu} + ${f3(s)}·${e} = ${f3(z)}.`, trap: "Use σ, not σ² or log σ²." }; }
    const mu = r.pick([0, .5, 1, -1, 2]), s = r.pick([.5, .8, 1, 1.5, 2]), kl = .5 * (mu * mu + s * s - 1 - Math.log(s * s));
    return { q: `KL( N(${mu}, ${s}²) ‖ N(0, 1) ) is ____ (3 decimals, nats).`, ans: kl, tol: .002,
      what: "KL = ½(μ² + σ² − 1 − ln σ²).", why: "This is the regulariser that keeps VAE codes near the prior.", how: `½(${mu * mu} + ${f3(s * s)} − 1 − ${f3(Math.log(s * s))}) = ${f3(kl)}.`, trap: "It is −ln σ², so it is positive when σ < 1." }; } };

  G.ganOps = { lvl: 3, make(r) {
    if (r.next() < .5) { const pd = r.pick([.1, .2, .3, .4, .5]), pg = r.pick([.05, .1, .2, .3, .5]);
      return { q: `At some x, p_data(x) = ${pd} and p_g(x) = ${pg}. The optimal discriminator D*(x) is ____ (3 decimals).`, ans: pd / (pd + pg), tol: .002,
        what: "D* = p_data/(p_data + p_g).", why: "It is the Bayes-optimal real-vs-fake classifier with equal priors.", how: `${pd}/(${pd} + ${pg}) = ${f3(pd / (pd + pg))}.`, trap: "It equals 0.5 only where the densities are equal." }; }
    const dr = r.pick([.6, .7, .8, .9, .95]), df = r.pick([.05, .1, .2, .3, .4]), L = -Math.log(dr) - Math.log(1 - df);
    return { q: `The discriminator outputs D(x) = ${dr} on a real sample and D(G(z)) = ${df} on a fake. Its loss −[ln D(x) + ln(1 − D(G(z)))] is ____ (3 decimals).`, ans: L, tol: .002,
      what: "Binary cross-entropy summed over the real and fake terms.", why: "Low loss means D separates real from fake well.", how: `−ln ${dr} = ${f3(-Math.log(dr))}; −ln ${f3(1 - df)} = ${f3(-Math.log(1 - df))}; total ${f3(L)}.`, trap: "The fake term uses 1 − D(G(z))." }; } };

  G.diffOps = { lvl: 3, make(r) {
    const bs = Array.from({ length: r.int(2, 4) }, () => r.pick([.05, .1, .2, .3])), ab = bs.reduce((a, b) => a * (1 - b), 1), kind = r.pick(["ab", "xt", "snr"]);
    if (kind === "ab") return { q: `Noise schedule β = (${bs.join(", ")}). ᾱ_${bs.length} = ____ (4 decimals).`, ans: ab, tol: .00006, what: "ᾱ_t = Π(1 − β_s).", why: "It is the fraction of signal variance retained after t steps.", how: bs.map(b => (1 - b).toFixed(2)).join(" × ") + ` = ${f4(ab)}.`, trap: "Multiply (1 − β). Don't subtract Σβ." };
    if (kind === "snr") return { q: `ᾱ_t = ${f4(ab)}. The signal-to-noise ratio ᾱ/(1 − ᾱ) is ____ (3 decimals).`, ans: ab / (1 - ab), tol: .003, what: "SNR(t) = ᾱ_t/(1 − ᾱ_t).", why: "SNR falls monotonically as noise is added.", how: `${f4(ab)}/${f4(1 - ab)} = ${f3(ab / (1 - ab))}.`, trap: "Use ᾱ, not √ᾱ." };
    const x0 = r.pick([1, -1, 2, .5]), e = r.pick([-1, -.5, .5, 1]), xt = Math.sqrt(ab) * x0 + Math.sqrt(1 - ab) * e;
    return { q: `ᾱ_t = ${f4(ab)}, x₀ = ${x0}, ε = ${e}. x_t = √ᾱ·x₀ + √(1 − ᾱ)·ε = ____ (3 decimals).`, ans: xt, tol: .002, what: "Closed-form forward noising.", why: "This lets training jump to any t in one step.", how: `√ᾱ = ${f3(Math.sqrt(ab))}, √(1 − ᾱ) = ${f3(Math.sqrt(1 - ab))}, x_t = ${f3(xt)}.`, trap: "Take square roots of ᾱ and of 1 − ᾱ." }; } };

  G.infonce = { lvl: 3, make(r) {
    const sp = r.pick([.6, .7, .8, .9]), negs = [r.pick([-.2, 0, .1, .2, .3, .5]), r.pick([-.1, 0, .1, .2, .4])], t = r.pick([.1, .2, .5, 1]);
    const z = [sp, ...negs].map(s => Math.exp(s / t)), L = -Math.log(z[0] / z.reduce((a, b) => a + b, 0));
    return { q: `InfoNCE: positive similarity ${sp}, negatives ${negs.join(" and ")}, temperature τ = ${t}. The loss is ____ (3 decimals, natural log).`, ans: L, tol: .002,
      what: "L = −log[e^(s⁺/τ) / Σⱼ e^(sⱼ/τ)].", why: "It is a softmax classification of the positive against the negatives.", how: `logits ${[sp, ...negs].map(s => f3(s / t)).join(", ")}; p(positive) = ${f3(z[0] / z.reduce((a, b) => a + b, 0))}; loss ${f3(L)}.`, trap: "Divide the similarities by τ before exponentiating." }; } };
})();
