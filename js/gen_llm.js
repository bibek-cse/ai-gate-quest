/* Numeric question generators for LLMs. Same contract as gen_ml.js. */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000);
  const num = n => n.toLocaleString("en-US");
  const sg = z => 1 / (1 + Math.exp(-z));
  const C = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };

  G.bpeOps = { lvl: 2, make(r) {
    const kind = r.pick(["emb", "merges", "tokens"]);
    if (kind === "emb") { const V = r.pick([32000, 50257, 100000, 128000]), d = r.pick([768, 1024, 2048, 4096]);
      return { q: `An embedding table with vocabulary V = ${num(V)} and width d = ${num(d)} has how many parameters (in millions, 3 decimals)?`, ans: V * d / 1e6, tol: .002,
        what: "Parameters = V × d.", why: "Vocabulary size directly drives embedding and output-layer size.", how: `${num(V)} × ${num(d)} = ${num(V * d)} ≈ ${f3(V * d / 1e6)} M.`, trap: "An untied output head doubles this." }; }
    if (kind === "merges") { const M = r.pick([10000, 30000, 50000, 99744]), sp = r.pick([1, 2, 3]);
      return { q: `A byte-level BPE tokenizer learns ${num(M)} merges and adds ${sp} special token(s). Its vocabulary size is ____.`, ans: 256 + M + sp,
        what: "256 base bytes + one new symbol per merge + special tokens.", why: "Each merge adds exactly one token.", how: `256 + ${num(M)} + ${sp} = ${num(256 + M + sp)}.`, trap: "Don't forget the 256 base byte tokens." }; }
    const ch = r.pick([2000, 3000, 6000, 10000]), cpt = r.pick([3, 4, 5]), t = Math.ceil(ch / cpt);
    return { q: `A text of ${num(ch)} characters averages ${cpt} characters per token. About how many tokens is it (round up)?`, ans: t,
      what: "tokens ≈ characters / characters-per-token.", why: "Token counts set context usage and cost.", how: `${num(ch)} / ${cpt} = ${f3(ch / cpt)} → ${num(t)}.`, trap: "Compare tokens, not characters, with the context limit." };
  } };

  G.posOps = { lvl: 3, make(r) {
    const kind = r.pick(["rope", "alibi", "cos"]);
    if (kind === "rope") { const th = r.pick([.1, .25, .5, 1]), m = r.int(3, 20), n = r.int(0, m - 1);
      return { q: `RoPE rotates a 2-D pair by angle pos·θ with θ = ${th} rad. For a query at position ${m} and key at position ${n}, the relative rotation is ____ rad.`, ans: (m - n) * th, tol: .001,
        what: "Relative angle = (m − n)·θ.", why: "RoPE scores depend only on the offset between positions.", how: `(${m} − ${n})·${th} = ${f3((m - n) * th)}.`, trap: "It is not m·θ alone." }; }
    if (kind === "alibi") { const sl = r.pick([.5, .25, .125, .0625]), i = r.int(5, 30), j = r.int(0, i);
      return { q: `ALiBi slope m = ${sl}. The bias added to the attention score between positions ${i} and ${j} is ____.`, ans: -sl * (i - j), tol: .001,
        what: "bias = −m·|i − j|.", why: "A linear penalty makes distant tokens less attended.", how: `−${sl}·${i - j} = ${f3(-sl * (i - j))}.`, trap: "The bias is negative." }; }
    const u = [r.int(-2, 3), r.int(-2, 3), r.int(1, 3)], v = [r.int(-2, 3), r.int(1, 3), r.int(-2, 3)], dp = u[0] * v[0] + u[1] * v[1] + u[2] * v[2], c = dp / (Math.hypot(...u) * Math.hypot(...v));
    return { q: `Embeddings u = (${u}) and v = (${v}). Their cosine similarity is ____ (3 decimals).`, ans: c, tol: .002,
      what: "cos = u·v / (‖u‖‖v‖).", why: "Normalising removes vector length effects.", how: `u·v = ${dp}; ‖u‖ = ${f3(Math.hypot(...u))}, ‖v‖ = ${f3(Math.hypot(...v))} → ${f3(c)}.`, trap: "The raw dot product is not the cosine." };
  } };

  G.paramCount = { lvl: 3, make(r) {
    const kind = r.pick(["block", "total", "flops"]);
    const d = r.pick([512, 768, 1024, 2048, 4096]), L = r.pick([6, 12, 24, 32]);
    if (kind === "block") return { q: `Using 12·d² parameters per Transformer block, a model with d = ${num(d)} and ${L} layers has about ____ million block parameters (3 decimals).`, ans: 12 * d * d * L / 1e6, tol: .002,
      what: "Attention 4d² + MLP 8d² = 12d² per block.", why: "Quick back-of-envelope model sizing.", how: `12·${num(d)}²·${L} = ${num(12 * d * d * L)} ≈ ${f3(12 * d * d * L / 1e6)} M.`, trap: "Embeddings are counted separately." };
    if (kind === "total") { const V = r.pick([32000, 50257]); const tot = 12 * d * d * L + V * d;
      return { q: `d = ${num(d)}, ${L} layers (12d² each), vocabulary ${num(V)} with tied input/output embeddings. Total parameters (millions, 3 decimals; ignore positions and norms) ≈ ____.`, ans: tot / 1e6, tol: .002,
        what: "Blocks + one V×d embedding.", why: "Tied weights count the embedding once.", how: `${f3(12 * d * d * L / 1e6)} M + ${f3(V * d / 1e6)} M = ${f3(tot / 1e6)} M.`, trap: "Untied would add V·d again." }; }
    const N = r.pick([1, 3, 7, 13, 70]), D = r.pick([20, 100, 300, 1000, 2000]), c = 6 * N * 1e9 * D * 1e9;
    return { q: `Training compute C ≈ 6·N·D. For N = ${N}B parameters and D = ${D}B tokens, C ≈ ____ × 10²¹ FLOPs (3 decimals).`, ans: c / 1e21, tol: .002,
      what: "2ND forward + 4ND backward.", why: "Lets you estimate GPU time for a run.", how: `6 × ${N}e9 × ${D}e9 = ${f3(c / 1e21)} × 10²¹.`, trap: "Use 6, not 2 (that's inference per token)." };
  } };

  G.scaleOps = { lvl: 3, make(r) {
    const kind = r.pick(["ppl", "chin", "uni"]);
    if (kind === "ppl") { const L = r.pick([1.5, 2, 2.3, 2.8, 3.2]);
      return { q: `A model's average cross-entropy is ${L} nats per token. Its perplexity is ____ (3 decimals).`, ans: Math.exp(L), tol: .005,
        what: "PPL = e^{loss}.", why: "Perplexity is the effective branching factor.", how: `e^${L} = ${f3(Math.exp(L))}.`, trap: "With log₂ losses use 2^{bits}." }; }
    if (kind === "chin") { const N = r.pick([1, 3, 7, 13, 34, 70]);
      return { q: `Chinchilla rule (≈ 20 tokens per parameter): a ${N}B-parameter model should be trained on about ____ billion tokens.`, ans: 20 * N,
        what: "D_opt ≈ 20·N.", why: "Compute-optimal balance between size and data.", how: `20 × ${N}B = ${20 * N}B tokens.`, trap: "Serving-heavy models are often trained on far more." }; }
    const V = r.pick([256, 1000, 32000, 50257, 128000]);
    return { q: `An untrained model guessing uniformly over V = ${num(V)} tokens has a loss of ____ nats (3 decimals).`, ans: Math.log(V), tol: .002,
      what: "Loss = −ln(1/V) = ln V.", why: "Training curves start near this value.", how: `ln ${num(V)} = ${f3(Math.log(V))}.`, trap: "Its perplexity is exactly V." };
  } };

  G.loraOps = { lvl: 3, make(r) {
    const kind = r.pick(["lora", "mem", "scale"]);
    if (kind === "lora") { const d = r.pick([1024, 2048, 4096, 5120]), k = r.pick([d, 4 * d]), rk = r.pick([4, 8, 16, 32, 64]), n = r.pick([1, 2, 4]), L = r.pick([1, 24, 32]);
      const p = rk * (d + k) * n * L;
      return { q: `LoRA rank r = ${rk} on ${n} matrix/matrices of shape ${num(d)} × ${num(k)} in each of ${L} layer(s). Trainable parameters = ____.`, ans: p,
        what: "Per matrix r·(d + k).", why: "A tiny fraction of the full d·k.", how: `${rk}·(${num(d)} + ${num(k)}) = ${num(rk * (d + k))}; × ${n} × ${L} = ${num(p)}.`, trap: "Count every adapted matrix in every layer." }; }
    if (kind === "mem") { const N = r.pick([1, 7, 13, 70]), b = r.pick([[16, "fp16"], [8, "int8"], [4, "4-bit"]]);
      return { q: `Weights of a ${N}B-parameter model stored in ${b[1]} occupy about ____ GB.`, ans: N * b[0] / 8,
        what: "Bytes per parameter = bits / 8.", why: "Weight memory decides which GPU you need.", how: `${N}e9 × ${b[0] / 8} B = ${f3(N * b[0] / 8)} GB.`, trap: "Training with Adam needs ~16 B/param, not 2." }; }
    const a = r.pick([8, 16, 32, 64]), rk = r.pick([4, 8, 16, 32]);
    return { q: `LoRA with α = ${a} and r = ${rk}. The update is ΔW = s·BA with scale s = ____.`, ans: a / rk, tol: .001,
      what: "s = α / r.", why: "Keeps update magnitude stable as r changes.", how: `${a}/${rk} = ${f3(a / rk)}.`, trap: "It's a ratio, not a product." };
  } };

  G.alignOps = { lvl: 3, make(r) {
    const kind = r.pick(["bt", "rmloss", "dpo"]);
    if (kind === "bt") { const a = r.pick([-1, 0, .5, 1, 2, 3]), b = r.pick([-2, -1, 0, .5, 1]); return { q: `Reward scores r(A) = ${a}, r(B) = ${b}. Bradley–Terry P(A ≻ B) = ____ (3 decimals).`, ans: sg(a - b), tol: .002,
      what: "P = σ(r_A − r_B).", why: "Only the score difference matters.", how: `σ(${f3(a - b)}) = ${f3(sg(a - b))}.`, trap: "Not the ratio of scores." }; }
    if (kind === "rmloss") { const g = r.pick([-1, -.5, 0, .5, 1, 2, 3]); return { q: `Reward-model loss −log σ(r_chosen − r_rejected) for a score gap of ${g} is ____ (3 decimals).`, ans: -Math.log(sg(g)), tol: .002,
      what: "Pairwise logistic loss.", why: "Large positive gaps give small loss; wrong orderings give large loss.", how: `σ(${g}) = ${f3(sg(g))} → −ln = ${f3(-Math.log(sg(g)))}.`, trap: "At gap 0 the loss is ln 2 ≈ 0.693." }; }
    const b = r.pick([.05, .1, .2, .5]), lw = r.pick([-1, 0, 1, 2, 3]), ll = r.pick([-3, -2, -1, 0, 1]), z = b * (lw - ll);
    return { q: `DPO with β = ${b}: log π/π_ref is ${lw} for the chosen and ${ll} for the rejected response. The DPO loss is ____ (3 decimals).`, ans: -Math.log(sg(z)), tol: .002,
      what: "Loss = −log σ(β[(log-ratio)_w − (log-ratio)_l]).", why: "It widens the implicit reward margin between chosen and rejected.", how: `β·(${lw} − ${ll}) = ${f3(z)}; −ln σ(${f3(z)}) = ${f3(-Math.log(sg(z)))}.`, trap: "Multiply the difference by β before the sigmoid." };
  } };

  G.decodeOps = { lvl: 3, make(r) {
    const kind = r.pick(["temp", "topp", "spec"]);
    if (kind === "temp") { const lg = [r.int(1, 4), r.int(0, 2), r.int(-1, 1)].sort((a, b) => b - a), T = r.pick([.5, 1, 2]), e = lg.map(x => Math.exp(x / T)), Z = e.reduce((a, b) => a + b, 0);
      return { q: `Logits (${lg.join(", ")}), temperature T = ${T}. The probability of the first token is ____ (3 decimals).`, ans: e[0] / Z, tol: .002,
        what: "p_i = exp(z_i/T) / Σ exp(z_j/T).", why: "Lower T sharpens, higher T flattens.", how: `scaled logits (${lg.map(x => f3(x / T)).join(", ")}) → ${f3(e[0] / Z)}.`, trap: "Divide by T, don't multiply." }; }
    if (kind === "topp") { let ps; do { const raw = [r.int(20, 50), r.int(10, 25), r.int(5, 15), r.int(3, 10), r.int(1, 5)].sort((a, b) => b - a), s = raw.reduce((a, b) => a + b, 0); ps = raw.map(x => Math.round(x / s * 100) / 100); } while (Math.abs(ps.reduce((a, b) => a + b, 0) - 1) > .001);
      const p = r.pick([.5, .7, .8, .9]); let c = 0, k = 0; while (c < p - 1e-9) { c += ps[k]; k++; }
      return { q: `Sorted token probabilities ${ps.join(", ")}. With top-p = ${p}, how many tokens are kept?`, ans: k,
        what: "Smallest prefix whose cumulative probability ≥ p.", why: "The nucleus adapts to how peaked the distribution is.", how: `cumulative: ${ps.map((_, i) => f3(ps.slice(0, i + 1).reduce((a, b) => a + b, 0))).join(", ")} → first ≥ ${p} at token ${k}.`, trap: "Stop at the first cumulative value that reaches p." }; }
    const a = r.pick([.5, .6, .7, .8, .9]), k = r.pick([2, 3, 4, 5]), E = (1 - a ** (k + 1)) / (1 - a);
    return { q: `Speculative decoding drafts k = ${k} tokens, each accepted with probability α = ${a}. Expected tokens per big-model pass (with the bonus token) = ____ (3 decimals).`, ans: E, tol: .002,
      what: "E = (1 − α^{k+1}) / (1 − α).", why: "Higher acceptance gives bigger speed-ups.", how: `(1 − ${a}^${k + 1})/(1 − ${a}) = ${f3(E)}.`, trap: "Acceptance stops at the first rejection." };
  } };

  G.ragOps = { lvl: 3, make(r) {
    const kind = r.pick(["chunks", "rrf", "store", "e2e"]);
    if (kind === "chunks") { const L = r.pick([20000, 50000, 100000]), c = r.pick([256, 500, 512, 1000]), o = r.pick([0, 50, 100]), s = c - o, n = Math.ceil((L - o) / s);
      return { q: `A ${num(L)}-token document is split into ${c}-token chunks with ${o}-token overlap. How many chunks?`, ans: n,
        what: "Stride = chunk − overlap; chunks = ⌈(L − overlap)/stride⌉.", why: "Overlap avoids cutting key sentences in half.", how: `stride ${s}; ⌈(${num(L)} − ${o})/${s}⌉ = ${n}.`, trap: "Overlap increases the count." }; }
    if (kind === "rrf") { const a = r.int(1, 10), b = r.int(1, 10), k = 60, v = 1 / (k + a) + 1 / (k + b);
      return { q: `Reciprocal rank fusion (k = 60): a document is ranked ${a} by BM25 and ${b} by dense retrieval. Its RRF score is ____ (4 decimals).`, ans: v, tol: .00005,
        what: "RRF = Σ 1/(k + rank).", why: "Fuses rankings without comparing raw score scales.", how: `1/${k + a} + 1/${k + b} = ${v.toFixed(5)}.`, trap: "Use k + rank, not rank alone." }; }
    if (kind === "store") { const N = r.pick([1e5, 1e6, 1e7]), d = r.pick([384, 768, 1024, 1536]), b = r.pick([4, 2]);
      return { q: `${num(N)} chunks with ${d}-dimensional embeddings stored in ${b === 4 ? "float32" : "float16"}. Raw storage in GB (3 decimals)?`, ans: N * d * b / 1e9, tol: .002,
        what: "N × d × bytes.", why: "Index size drives hardware and cost.", how: `${num(N)} × ${d} × ${b} = ${f3(N * d * b / 1e9)} GB.`, trap: "float32 = 4 bytes." }; }
    const rc = r.pick([.5, .6, .7, .8, .9]), ah = r.pick([.8, .9, .95]), am = r.pick([.05, .1, .2]), v = rc * ah + (1 - rc) * am;
    return { q: `Recall@k = ${rc}. With the right chunk the LLM is correct ${ah * 100} % of the time; without it ${am * 100} %. Overall accuracy (in %) = ____.`, ans: v * 100, tol: .01,
      what: "Total probability over retrieved vs not retrieved.", why: "Retrieval recall caps end-to-end accuracy.", how: `${rc}·${ah} + ${f3(1 - rc)}·${am} = ${f3(v)} → ${f3(v * 100)} %.`, trap: "Include the miss case." };
  } };

  G.kvOps = { lvl: 3, make(r) {
    const kind = r.pick(["kv", "bw", "q8"]);
    if (kind === "kv") { const L = r.pick([24, 32, 40, 80]), h = r.pick([8, 32, 40]), hd = 128, T = r.pick([2048, 4096, 8192]), B = r.pick([1, 4, 8]), bytes = 2 * L * h * hd * 2 * T * B;
      return { q: `KV cache: ${L} layers, ${h} KV heads, head_dim ${hd}, fp16, context ${num(T)}, batch ${B}. Size in GiB (3 decimals)?`, ans: bytes / 2 ** 30, tol: .002,
        what: "2 (K,V) × layers × KV-heads × head_dim × 2 bytes × tokens × batch.", why: "KV cache often dominates memory at long context.", how: `per token ${num(2 * L * h * hd * 2)} B; × ${num(T)} × ${B} = ${f3(bytes / 2 ** 30)} GiB.`, trap: "Count both K and V." }; }
    if (kind === "bw") { const N = r.pick([3, 7, 13, 70]), bits = r.pick([16, 8, 4]), bw = r.pick([1000, 2000, 3350]), gb = N * bits / 8;
      return { q: `A ${N}B model in ${bits}-bit weights on a GPU with ${num(bw)} GB/s bandwidth. Upper bound on single-stream decode tokens/s (3 decimals)?`, ans: bw / gb, tol: .005,
        what: "tokens/s ≈ bandwidth / model bytes.", why: "Batch-1 decoding reads every weight once per token.", how: `${N}e9 × ${bits / 8} B = ${f3(gb)} GB → ${num(bw)} / ${f3(gb)} = ${f3(bw / gb)}.`, trap: "Bits ÷ 8 = bytes." }; }
    const mx = r.pick([1.27, 2.54, 3.81, 6.35]), s = mx / 127, w = r.pick([.5, 1, -1.2, .3]), q = Math.round(w / s);
    return { q: `Symmetric int8 quantisation with max |w| = ${mx}. The int8 code of w = ${w} is ____.`, ans: q,
      what: "scale = max|w|/127; q = round(w/scale).", why: "One large value sets the resolution for all weights.", how: `scale = ${f3(s)}; ${w}/${f3(s)} = ${f3(w / s)} → ${q}.`, trap: "Divide by 127, not 255, for symmetric int8." };
  } };

  G.evalLLM = { lvl: 3, make(r) {
    const kind = r.pick(["passk", "ece", "bt"]);
    if (kind === "passk") { const n = r.pick([10, 20]), c = r.int(1, 6), k = r.pick([1, 2, 5]), v = 1 - C(n - c, k) / C(n, k);
      return { q: `n = ${n} samples, c = ${c} pass the tests. Unbiased pass@${k} = ____ (3 decimals).`, ans: v, tol: .002,
        what: "pass@k = 1 − C(n − c, k) / C(n, k).", why: "Probability that at least one of k random samples passes.", how: `1 − C(${n - c},${k})/C(${n},${k}) = 1 − ${C(n - c, k)}/${C(n, k)} = ${f3(v)}.`, trap: "Not k × pass@1." }; }
    if (kind === "ece") { const n1 = r.pick([100, 200]), n2 = r.pick([200, 300]), c1 = r.pick([.9, .8]), a1 = r.pick([.6, .7, .8]), c2 = r.pick([.6, .5]), a2 = r.pick([.5, .6, .7]), v = (n1 * Math.abs(a1 - c1) + n2 * Math.abs(a2 - c2)) / (n1 + n2);
      return { q: `Calibration bins: ${n1} examples with confidence ${c1}, accuracy ${a1}; ${n2} with confidence ${c2}, accuracy ${a2}. ECE = ____ (3 decimals).`, ans: v, tol: .002,
        what: "ECE = Σ (n_b/N)·|acc_b − conf_b|.", why: "Weighted average gap between confidence and accuracy.", how: `(${n1}·${f3(Math.abs(a1 - c1))} + ${n2}·${f3(Math.abs(a2 - c2))})/${n1 + n2} = ${f3(v)}.`, trap: "Weight each bin by its size." }; }
    const w = r.int(52, 80);
    return { q: `Model A wins ${w} of 100 pairwise judgements against B. The Bradley–Terry rating gap ln(p/(1−p)) is ____ (3 decimals).`, ans: Math.log(w / (100 - w)), tol: .002,
      what: "p = σ(Δ) → Δ = logit(p).", why: "Converts win rates into rating differences.", how: `ln(${w}/${100 - w}) = ${f3(Math.log(w / (100 - w)))}.`, trap: "Elo uses base 10 and a 400 scale." };
  } };
})();
