/* Numeric question generators for Meta Learning. Same contract as gen_ml.js. */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000);
  const num = n => n.toLocaleString("en-US");
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };

  G.episodeOps = { lvl: 2, make(r) {
    const kind = r.pick(["size", "chance", "combos"]);
    const N = r.pick([5, 10, 20]), K = r.pick([1, 5, 10]), Q = r.pick([5, 10, 15]);
    if (kind === "size") return { q: `An episode is ${N}-way ${K}-shot with ${Q} queries per class. The total number of labelled images it uses is ____.`, ans: N * K + N * Q,
      what: "Support has N·K images; query has N·Q images.", why: "Both sets are labelled during meta-training: the support for adapting, the query for the loss.", how: `${N}·${K} + ${N}·${Q} = ${N * K} + ${N * Q} = ${N * K + N * Q}.`, trap: "Counting only the support set." };
    if (kind === "chance") return { q: `Chance-level accuracy (in %) on a ${N}-way ${K}-shot task is ____.`, ans: 100 / N, tol: .01,
      what: "Uniform guessing among N classes.", why: "It is the floor every few-shot method must beat.", how: `100 / ${N} = ${f3(100 / N)} %.`, trap: "The number of shots K does not affect chance level." };
    const P = r.pick([16, 20, 24, 30]), n = r.pick([3, 5]);
    return { q: `The meta-test split has ${P} classes. How many distinct ${n}-way class combinations exist (order ignored)?`, ans: C(P, n),
      what: `Choose ${n} of ${P} classes: C(${P}, ${n}).`, why: "This is how many different test tasks you can sample before label permutations.", how: `C(${P},${n}) = ${num(C(P, n))}.`, trap: "Don't count orderings (that would be a permutation)." };
  } };

  G.protoOps = { lvl: 3, make(r) {
    const kind = r.pick(["proto", "triplet", "softmax"]);
    if (kind === "proto") {
      const a = [[r.int(0, 3), r.int(0, 3)], [r.int(0, 3), r.int(0, 3)]], b = [[r.int(5, 8), r.int(4, 8)], [r.int(5, 8), r.int(4, 8)]];
      const ca = [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2], cb = [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2];
      let q, da, db; do { q = [r.int(1, 7), r.int(1, 7)]; da = (q[0] - ca[0]) ** 2 + (q[1] - ca[1]) ** 2; db = (q[0] - cb[0]) ** 2 + (q[1] - cb[1]) ** 2; } while (Math.abs(da - db) < .5);
      const w = da < db ? "A" : "B";
      return { q: `ProtoNet embeddings. Class A support: (${a[0]}), (${a[1]}). Class B support: (${b[0]}), (${b[1]}). The query (${q}) is assigned to class…`,
        opts: [`${w} (d² ${f3(da)} vs ${f3(db)})`, `${w === "A" ? "B" : "A"} (d² ${f3(da)} vs ${f3(db)})`, "A tie", "Neither class"], ans: 0,
        what: "Prototype = mean of the class's support embeddings; pick the nearest.", why: "ProtoNets compare queries to class means.", how: `c_A = (${ca}), c_B = (${cb}). d²_A = ${f3(da)}, d²_B = ${f3(db)} → class ${w}.`, trap: "Average the support points before measuring distance." }; }
    if (kind === "triplet") { const dp = r.pick([.4, .6, .8, 1, 1.2]), dn = r.pick([.5, .9, 1.1, 1.5, 2]), m = r.pick([.2, .5, 1]), L = Math.max(0, dp - dn + m);
      return { q: `Triplet loss with d(a,p) = ${dp}, d(a,n) = ${dn}, margin m = ${m}. The loss is ____.`, ans: L, tol: .001,
        what: "L = max(0, d(a,p) − d(a,n) + m).", why: "It demands that the negative be at least m farther than the positive.", how: `${dp} − ${dn} + ${m} = ${f3(dp - dn + m)} → max with 0 = ${f3(L)}.`, trap: "The hinge clips negative values to zero." }; }
    const d = [r.int(1, 4), r.int(1, 4), r.int(2, 6)], e = d.map(x => Math.exp(-x)), Z = e.reduce((a, b) => a + b, 0), i = d.indexOf(Math.min(...d));
    return { q: `Squared distances from a query to three prototypes are ${d.join(", ")}. The ProtoNet probability of class ${i + 1} (softmax of −d) is ____ (3 decimals).`, ans: e[i] / Z, tol: .002,
      what: "p_k = exp(−d_k) / Σ_j exp(−d_j).", why: "Smaller distance → larger probability.", how: `e^{−${d[i]}} / (${e.map(f3).join(" + ")}) = ${f3(e[i] / Z)}.`, trap: "Use −d as the logit, not +d." };
  } };

  G.mamlOps = { lvl: 3, make(r) {
    const kind = r.pick(["inner", "meta", "reptile"]);
    const c = r.int(-3, 6), th = r.int(-3, 3), a = r.pick([.1, .2, .25]);
    if (kind === "inner") { const tp = th - a * 2 * (th - c);
      return { q: `Task loss L(θ) = (θ − ${c})², θ = ${th}, inner learning rate α = ${a}. After one inner step θ' = ____.`, ans: tp, tol: .001,
        what: "θ' = θ − α·L'(θ), with L'(θ) = 2(θ − c).", why: "The inner loop is plain gradient descent on the support loss.", how: `L'(${th}) = ${2 * (th - c)}, θ' = ${th} − ${a}·${2 * (th - c)} = ${f3(tp)}.`, trap: "Watch the sign of the gradient." }; }
    if (kind === "meta") { const tp = th - a * 2 * (th - c), g = 2 * (tp - c) * (1 - 2 * a);
      return { q: `MAML with one inner step on L(θ) = (θ − ${c})² (same loss for support and query), θ = ${th}, α = ${a}. The exact meta-gradient dL(θ')/dθ is ____.`, ans: g, tol: .002,
        what: "dL(θ')/dθ = L'(θ')·(1 − α L''(θ)), with L'' = 2.", why: "Differentiating through the inner step adds the (1 − αH) factor.", how: `θ' = ${f3(tp)}, L'(θ') = ${f3(2 * (tp - c))}, factor 1 − 2·${a} = ${f3(1 - 2 * a)} → ${f3(g)}.`, trap: `FOMAML would give ${f3(2 * (tp - c))} (no factor).` }; }
    const t = [r.int(-2, 2), r.int(-2, 2)], tt = [r.int(-5, 5), r.int(-5, 5)], e = r.pick([.1, .2, .5]), n = t.map((v, i) => v + e * (tt[i] - v));
    return { q: `Reptile: θ = (${t}), task-adapted θ̃ = (${tt}), outer step ε = ${e}. The first coordinate of the new θ is ____.`, ans: n[0], tol: .001,
      what: "θ ← θ + ε(θ̃ − θ).", why: "Reptile moves the initialisation toward each task's solution.", how: `${t[0]} + ${e}·(${tt[0]} − ${t[0]}) = ${f3(n[0])}; full θ = (${n.map(f3)}).`, trap: "Step toward θ̃, not away from it." };
  } };

  G.memOps = { lvl: 3, make(r) {
    const kind = r.pick(["read", "cnp", "hyper"]);
    if (kind === "read") { const b = r.pick([1, 2, 3, 5]), s = [1, r.pick([0, .5, -.5])], e = s.map(x => Math.exp(b * x)), w = e[0] / (e[0] + e[1]);
      return { q: `Content addressing: cosine similarities of the key to memory rows M1, M2 are ${s.join(" and ")}; key strength β = ${b}. The read weight on M1 is ____ (3 decimals).`, ans: w, tol: .002,
        what: "w = softmax(β · similarity).", why: "β sharpens the focus on the best-matching row.", how: `e^{${b}·${s[0]}} / (e^{${b}·${s[0]}} + e^{${b}·${s[1]}}) = ${f3(w)}.`, trap: "Multiply by β before the softmax." }; }
    if (kind === "cnp") { const n = r.pick([2, 3, 4]), h = Array.from({ length: n }, () => r.int(-4, 6)), m = h.reduce((a, b) => a + b, 0) / n;
      return { q: `A CNP's context encodings (first coordinate) are ${h.join(", ")}. The mean-aggregated representation's first coordinate is ____.`, ans: m, tol: .002,
        what: "r = (1/n) Σ h_i.", why: "Mean pooling is permutation-invariant and independent of set size.", how: `(${h.join(" + ")}) / ${n} = ${f3(m)}.`, trap: "A sum would scale with the number of context points." }; }
    const d = r.pick([64, 128, 256, 512]), N = r.pick([5, 10, 20]);
    return { q: `A hypernetwork outputs a ${d} → ${N} linear classifier head (weights and biases) per task. How many numbers does it output?`, ans: d * N + N,
      what: "Weights d·N plus N biases.", why: "Output size drives the hypernetwork's cost.", how: `${d}·${N} + ${N} = ${num(d * N + N)}.`, trap: "Don't forget the biases." };
  } };

  G.evalOps = { lvl: 3, make(r) {
    const kind = r.pick(["ci", "n", "sigma"]);
    const s = r.pick([6, 8, 10, 12, 15]);
    if (kind === "ci") { const n = r.pick([100, 600, 1000, 2000, 10000]), h = 1.96 * s / Math.sqrt(n);
      return { q: `Per-episode accuracy std is ${s} % over ${num(n)} test episodes. The 95 % CI half-width (in %) is ____ (3 decimals).`, ans: h, tol: .005,
        what: "h = 1.96 · σ / √n.", why: "Intervals show whether a gap between methods is real.", how: `1.96·${s}/√${n} = 1.96·${s}/${f3(Math.sqrt(n))} = ${f3(h)}.`, trap: "Divide by √n, not n." }; }
    if (kind === "n") { const h = r.pick([.25, .5, 1]), n = Math.ceil((1.96 * s / h) ** 2);
      return { q: `Per-episode std is ${s} %. The minimum number of episodes for a 95 % CI half-width ≤ ${h} % is ____.`, ans: n,
        what: "Solve 1.96σ/√n ≤ h → n ≥ (1.96σ/h)².", why: "Plan the evaluation budget before comparing methods.", how: `(1.96·${s}/${h})² = ${f3((1.96 * s / h) ** 2)} → round up to ${num(n)}.`, trap: "Squaring is the step people forget; round up." }; }
    const n = r.pick([600, 1000, 2000]), h = r.pick([.3, .4, .5, .8]), sg = h * Math.sqrt(n) / 1.96;
    return { q: `A paper reports ±${h} % (95 % CI) over ${num(n)} episodes. The implied per-episode std (in %) is ____ (2 decimals).`, ans: sg, tol: .02,
      what: "σ = h·√n / 1.96.", why: "Back-computing σ is a sanity check on reported numbers.", how: `${h}·√${n}/1.96 = ${h}·${f3(Math.sqrt(n))}/1.96 = ${f3(sg)}.`, trap: "The half-width is not the std." };
  } };

  G.taskAug = { lvl: 3, make(r) {
    const kind = r.pick(["combos", "perm", "mix"]);
    if (kind === "combos") { const P = r.pick([20, 32, 64, 100]), n = r.pick([2, 3, 5]);
      return { q: `From ${P} base classes, how many distinct ${n}-way tasks can be formed (label order ignored)?`, ans: C(P, n),
        what: `C(${P}, ${n}).`, why: "Task diversity is one defence against meta-overfitting.", how: `C(${P},${n}) = ${num(C(P, n))}.`, trap: "Combinations, not permutations." }; }
    if (kind === "perm") { const n = r.pick([3, 4, 5, 6]); let f = 1; for (let i = 2; i <= n; i++) f *= i;
      return { q: `Label shuffling on a fixed set of ${n} classes can produce how many different label assignments?`, ans: f,
        what: `${n}! permutations of labels 0…${n - 1}.`, why: "Each permutation is a mutually exclusive task, forcing use of the support set.", how: `${n}! = ${f}.`, trap: `${n}^${n} would allow repeated labels.` }; }
    const l = r.pick([.6, .7, .75, .8, .9]), x1 = r.int(0, 10), x2 = r.int(0, 10), v = l * x1 + (1 - l) * x2;
    return { q: `MixUp with λ = ${l} mixes a feature value ${x1} (class A) with ${x2} (class B). The mixed feature is ____ and the label weight on class A is λ.`, ans: v, tol: .001,
      what: "x̃ = λx₁ + (1 − λ)x₂, ỹ = λy₁ + (1 − λ)y₂.", why: "Interpolated samples create new, in-between tasks.", how: `${l}·${x1} + ${f3(1 - l)}·${x2} = ${f3(v)}.`, trap: "Use λ on the first sample and 1 − λ on the second." };
  } };

  G.metaRL = { lvl: 3, make(r) {
    const kind = r.pick(["return", "regret", "beta"]);
    if (kind === "return") { const g = r.pick([.5, .8, .9]), rw = [r.int(0, 3), r.int(0, 3), r.int(0, 5)], G0 = rw[0] + g * rw[1] + g * g * rw[2];
      return { q: `Rewards ${rw.join(", ")} with γ = ${g}. The discounted return G₀ is ____.`, ans: G0, tol: .001,
        what: "G₀ = r₀ + γr₁ + γ²r₂.", why: "Discounting values earlier rewards more.", how: `${rw[0]} + ${g}·${rw[1]} + ${f3(g * g)}·${rw[2]} = ${f3(G0)}.`, trap: "The third reward uses γ²." }; }
    if (kind === "regret") { const mu = [r.pick([.1, .2, .3]), r.pick([.4, .5]), r.pick([.7, .8, .9])], p = [r.int(5, 30), r.int(5, 30), r.int(20, 100)], reg = p[0] * (mu[2] - mu[0]) + p[1] * (mu[2] - mu[1]);
      return { q: `Bernoulli arms have means ${mu.join(", ")}. An agent pulls them ${p.join(", ")} times. The expected regret is ____.`, ans: reg, tol: .001,
        what: "Regret = Σ_a pulls_a · (μ* − μ_a).", why: "Each suboptimal pull costs its gap to the best arm.", how: `${p[0]}·${f3(mu[2] - mu[0])} + ${p[1]}·${f3(mu[2] - mu[1])} = ${f3(reg)}.`, trap: "Gaps are measured from the best arm's mean." }; }
    const s = r.int(0, 8), f = r.int(0, 8), m = (s + 1) / (s + f + 2);
    return { q: `An arm has ${s} successes and ${f} failures. With a uniform Beta(1,1) prior, its posterior mean is ____ (3 decimals).`, ans: m, tol: .002,
      what: `Posterior Beta(${s + 1}, ${f + 1}).`, why: "Thompson sampling draws from this posterior to choose arms.", how: `(${s} + 1)/(${s} + ${f} + 2) = ${f3(m)}.`, trap: "Forgetting the prior pseudo-counts." };
  } };

  G.iclOps = { lvl: 3, make(r) {
    const kind = r.pick(["ls", "gd", "ctx"]);
    if (kind === "ls") { const w = r.pick([-2, -1, .5, 2, 3]), xs = [r.int(1, 3), r.int(4, 6)], ys = xs.map(x => w * x + r.pick([-1, 0, 1])), sxy = xs[0] * ys[0] + xs[1] * ys[1], sxx = xs[0] ** 2 + xs[1] ** 2, wh = sxy / sxx, xq = r.int(2, 8);
      return { q: `In-context examples (${xs[0]}, ${ys[0]}) and (${xs[1]}, ${ys[1]}). Least squares through the origin predicts y at x = ${xq} as ____ (3 decimals).`, ans: wh * xq, tol: .005,
        what: "ŵ = Σxy / Σx², prediction ŵ·x.", why: "Transformers trained on regression prompts match this estimator.", how: `ŵ = ${sxy}/${sxx} = ${f3(wh)} → ${f3(wh)}·${xq} = ${f3(wh * xq)}.`, trap: "Use Σx², not Σx." }; }
    if (kind === "gd") { const xs = [1, 2], w = r.pick([1, 2, 3]), ys = xs.map(x => w * x), lr = r.pick([.05, .1, .2]), g = xs[0] * ys[0] + xs[1] * ys[1];
      return { q: `One GD step from w = 0 on L = ½Σ(y − wx)² with examples (1, ${ys[0]}) and (2, ${ys[1]}), learning rate ${lr}. New w = ____.`, ans: lr * g, tol: .001,
        what: "w ← w + η Σ (y_i − w x_i) x_i.", why: "A linear-attention layer can emulate exactly this step.", how: `At w = 0: Σ y_i x_i = ${ys[0]} + ${2 * ys[1]} = ${g} → ${lr}·${g} = ${f3(lr * g)}.`, trap: `One step need not reach the optimum (${w}).` }; }
    const ctx = r.pick([2048, 4096, 8192]), d = r.pick([30, 40, 50, 64]), k = r.int(3, 10), qn = r.pick([20, 30, 50]), more = Math.floor((ctx - k * d - qn) / d);
    return { q: `Context window ${num(ctx)} tokens. The prompt has ${k} demonstrations of ${d} tokens plus a ${qn}-token query. How many more demonstrations fit?`, ans: more,
      what: "Free tokens / tokens per demonstration, rounded down.", why: "Context length caps in-context 'training data'.", how: `(${ctx} − ${k * d} − ${qn}) / ${d} = ${f3((ctx - k * d - qn) / d)} → ${more}.`, trap: "The query must still fit; round down." };
  } };
})();
