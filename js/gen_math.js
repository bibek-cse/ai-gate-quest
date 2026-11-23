/* Numeric question generators for Maths for AI. Same contract as gen_ml.js. */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000), f2 = x => String(Math.round(x * 100) / 100);
  const v2s = v => "(" + v.join(", ") + ")";

  G.vecOps = { lvl: 2, make(r) {
    const a = [r.int(-4, 5), r.int(-4, 5), r.int(-3, 4)], b = [r.int(-4, 5), r.int(-4, 5), r.int(-3, 4)];
    if (a.every(x => !x)) a[0] = 1; if (b.every(x => !x)) b[1] = 2;
    const dot = a.reduce((s, x, i) => s + x * b[i], 0), na = Math.hypot(...a), nb = Math.hypot(...b), kind = r.pick(["dot", "cos", "dist"]);
    const val = kind === "dot" ? dot : kind === "cos" ? dot / (na * nb) : Math.hypot(...a.map((x, i) => x - b[i]));
    return { q: `a = ${v2s(a)}, b = ${v2s(b)}. ${kind === "dot" ? "a·b" : kind === "cos" ? "The cosine similarity of a and b" : "The Euclidean distance ‖a − b‖"} is ____${kind === "dot" ? "." : " (3 decimals)."}`,
      ans: val, tol: kind === "dot" ? 0 : .002,
      what: "a·b = Σ aᵢbᵢ.  cos θ = a·b/(‖a‖‖b‖).  ‖a − b‖ = √Σ(aᵢ − bᵢ)².",
      why: "Dot products, cosines and distances are the basic similarity tools in ML (k-NN, attention, embeddings).",
      how: `a·b = ${dot}; ‖a‖ = ${f3(na)}, ‖b‖ = ${f3(nb)}; ${kind === "cos" ? `cos = ${dot}/(${f3(na)}·${f3(nb)}) = ${f3(val)}` : kind === "dist" ? `a − b = ${v2s(a.map((x, i) => x - b[i]))}, length ${f3(val)}` : `answer ${dot}`}.`,
      trap: "Watch the signs of negative components when multiplying." }; } };

  G.matOps = { lvl: 2, make(r) {
    const A = [[r.int(-3, 5), r.int(-3, 5)], [r.int(-3, 5), r.int(-3, 5)]], B = [[r.int(-2, 4), r.int(-2, 4)], [r.int(-2, 4), r.int(-2, 4)]];
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0], kind = det !== 0 && r.next() < .35 ? "inv" : r.pick(["det", "prod"]);
    const i = r.int(0, 1), j = r.int(0, 1), prod = A[i][0] * B[0][j] + A[i][1] * B[1][j];
    const inv = det ? [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]] : null;
    const val = kind === "det" ? det : kind === "prod" ? prod : inv[i][j];
    const M = m => `[[${m[0].join(", ")}], [${m[1].join(", ")}]]`;
    return { q: kind === "det" ? `det ${M(A)} = ____.` : kind === "prod" ? `A = ${M(A)}, B = ${M(B)}. The entry (AB)${"₁₂"[i]}${"₁₂"[j]} = ____.` : `A = ${M(A)}. The entry (A⁻¹)${"₁₂"[i]}${"₁₂"[j]} = ____ (3 decimals).`,
      ans: val, tol: kind === "inv" ? .002 : 0,
      what: "2×2: det = ad − bc. (AB)ᵢⱼ = row i of A · column j of B. A⁻¹ = (1/det)[[d, −b], [−c, a]].",
      why: "Determinants test invertibility, and products are what every neural layer computes.",
      how: kind === "det" ? `${A[0][0]}·${A[1][1]} − ${A[0][1]}·${A[1][0]} = ${det}` : kind === "prod" ? `${A[i][0]}·${B[0][j]} + ${A[i][1]}·${B[1][j]} = ${prod}` : `det = ${det}; A⁻¹ = (1/${det})[[${A[1][1]}, ${-A[0][1]}], [${-A[1][0]}, ${A[0][0]}]] so the entry is ${f3(val)}`,
      trap: "For the inverse: swap a and d, negate b and c, and divide by det." }; } };

  G.eigOps = { lvl: 3, make(r) {
    const l1 = r.int(1, 6), l2 = r.int(-3, 5), kind = r.pick(["sq", "shift", "inv", "det", "trace"]), c = r.int(1, 3);
    let q, v, how;
    if (kind === "sq") { v = Math.max(l1 * l1, l2 * l2); q = `A has eigenvalues ${l1} and ${l2}. The LARGEST eigenvalue of A² is ____.`; how = `A² has eigenvalues ${l1}² = ${l1 * l1} and ${l2}² = ${l2 * l2}.`; }
    else if (kind === "shift") { v = (l1 - c) * (l2 - c); q = `A (2×2) has eigenvalues ${l1} and ${l2}. det(A − ${c}I) = ____.`; how = `A − ${c}I has eigenvalues ${l1 - c} and ${l2 - c}; product = ${v}.`; }
    else if (kind === "inv" && l2 !== 0) { v = 1 / l1 + 1 / l2; q = `A (2×2) has eigenvalues ${l1} and ${l2}. trace(A⁻¹) = ____ (3 decimals).`; how = `A⁻¹ has eigenvalues 1/${l1} and 1/${l2}; sum = ${f3(v)}.`; }
    else if (kind === "det") { v = l1 * l2; q = `A 2×2 matrix has eigenvalues ${l1} and ${l2}. det(A) = ____.`; how = `det = product of eigenvalues = ${l1}·${l2} = ${v}.`; }
    else { const a = r.int(1, 6), b = r.pick([1, 2, 3]); v = a + b; q = `S = [[${a}, ${b}], [${b}, ${a}]]. Its largest eigenvalue is ____.`; how = `[[a, b], [b, a]] has eigenvalues a ± b = ${a + b}, ${a - b}.`; }
    return { q, ans: v, tol: .002,
      what: "Eigenvalues of p(A) are p(λ). det = Π λ, trace = Σ λ. The inverse has 1/λ.", why: "Eigenvalue arithmetic answers matrix questions without computing the matrix.", how, trap: "Shifting by cI shifts every eigenvalue by c. Don't shift the determinant directly." }; } };

  G.derivOps = { lvl: 2, make(r) {
    const a = r.int(-2, 3), b = r.int(-3, 3), c = r.int(-4, 4), x0 = r.int(-2, 3), kind = r.pick(["poly", "grad", "chain"]);
    if (kind === "poly") { const v = 3 * a * x0 * x0 + 2 * b * x0 + c;
      return { q: `f(x) = ${a}x³ + ${b}x² + ${c}x + 7. f′(${x0}) = ____.`, ans: v, tol: 0,
        what: "Power rule term by term: d/dx xⁿ = n xⁿ⁻¹.", why: "Derivatives give the slope the optimiser follows.", how: `f′(x) = ${3 * a}x² + ${2 * b}x + ${c}; at x = ${x0}: ${v}.`, trap: "Constants vanish. Remember to evaluate at x₀." }; }
    if (kind === "grad") { const y0 = r.int(-2, 3), gx = 2 * a * x0 + b * y0, gy = b * x0 + 2 * c * y0, comp = r.pick(["x", "y"]);
      return { q: `f(x, y) = ${a}x² + ${b}xy + ${c}y². At (${x0}, ${y0}), ∂f/∂${comp} = ____.`, ans: comp === "x" ? gx : gy, tol: 0,
        what: "Partial derivative: differentiate in one variable and hold the others fixed.", why: "Gradients are vectors of partials, one per weight.", how: `∂f/∂x = ${2 * a}x + ${b}y = ${gx}; ∂f/∂y = ${b}x + ${2 * c}y = ${gy}.`, trap: "The cross term bxy contributes to BOTH partials." }; }
    const k = r.int(2, 4), m = r.int(1, 3), v = k * m * (m * x0 + 1) ** (k - 1);
    return { q: `f(x) = (${m}x + 1)^${k}. f′(${x0}) = ____.`, ans: v, tol: 0,
      what: "Chain rule: d/dx g(h(x)) = g′(h(x))·h′(x).", why: "Backprop is the chain rule applied through layers.", how: `f′(x) = ${k}(${m}x + 1)^${k - 1}·${m}; at ${x0}: ${k}·${(m * x0 + 1) ** (k - 1)}·${m} = ${v}.`, trap: "Don't forget the inner derivative m." }; } };

  G.gdStep = { lvl: 2, make(r) {
    const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4, 5]), x = r.int(-3, 4), y = r.int(-3, 4), eta = r.pick([.1, .2, .25]), comp = r.pick(["x", "y"]);
    const nx = x - eta * 2 * a * x, ny = y - eta * 2 * b * y;
    return { q: `f(x, y) = ${a}x² + ${b}y². One gradient-descent step from (${x}, ${y}) with η = ${eta}. The new ${comp}-coordinate is ____ (2 decimals).`,
      ans: comp === "x" ? nx : ny, tol: .011,
      what: "w ← w − η∇f(w).", why: "Each coordinate is scaled by (1 − 2η·curvature) for a quadratic.",
      how: `∇f = (${2 * a}x, ${2 * b}y) = (${2 * a * x}, ${2 * b * y}). New point = (${f2(nx)}, ${f2(ny)}).`, trap: "Use MINUS the gradient, evaluated at the current point." }; } };
  G.lagrange = { lvl: 3, make(r) {
    const p = r.int(1, 3), q = r.int(1, 3), c = r.int(2, 9);
    const v = c * c / (p * p + q * q);
    return { q: `Minimise x² + y² subject to ${p}x + ${q}y = ${c}. The minimum value is ____ (3 decimals).`, ans: v, tol: .002,
      what: "Lagrange: ∇(x² + y²) = λ∇(px + qy) gives (x, y) ∥ (p, q).", why: "The closest point on a line to the origin lies along its normal vector.",
      how: `(x, y) = t(${p}, ${q}), with t = ${c}/${p * p + q * q}. Minimum = c²/(p² + q²) = ${c * c}/${p * p + q * q} = ${f3(v)}.`, trap: "The minimum value is the squared distance c²/(p² + q²), not the distance itself." }; } };

  G.bayesTest2 = { lvl: 3, make(r) {
    const prev = r.pick([.005, .01, .02, .05, .1]), sens = r.pick([.9, .95, .98, .99]), fpr = r.pick([.01, .02, .05, .1]);
    const v = sens * prev / (sens * prev + fpr * (1 - prev));
    return { q: `Prevalence ${prev * 100} %, sensitivity ${sens * 100} %, false-positive rate ${fpr * 100} %. P(condition | positive test) = ____ (3 decimals).`, ans: v, tol: .002,
      what: "Bayes: P(D | +) = P(+ | D)P(D) / [P(+ | D)P(D) + P(+ | ¬D)P(¬D)].", why: "Rare conditions make most positives false: the base-rate effect.",
      how: `TP mass = ${sens}·${prev} = ${f3(sens * prev)}; FP mass = ${fpr}·${f3(1 - prev)} = ${f3(fpr * (1 - prev))}; posterior = ${f3(v)}.`, trap: "Sensitivity is P(+ | D), not P(D | +)." }; } };
  G.diceSum = { lvl: 2, make(r) {
    const s = r.int(2, 12), ways = 6 - Math.abs(7 - s);
    return { q: `Two fair dice are rolled. P(sum = ${s}) = ____ (3 decimals).`, ans: ways / 36, tol: .002,
      what: "Count the favourable ordered outcomes out of 36.", why: "Equally likely outcomes: probability = count/total.", how: `There are ${ways} ordered pairs summing to ${s}; ${ways}/36 = ${f3(ways / 36)}.`, trap: "(1, 6) and (6, 1) are different outcomes." }; } };

  G.binomStats = { lvl: 2, make(r) {
    const n = r.pick([5, 8, 10, 12, 20, 25, 50]), p = r.pick([.1, .2, .25, .3, .4, .5, .6, .8]), kind = r.pick(["mean", "var", "sd"]);
    const v = kind === "mean" ? n * p : kind === "var" ? n * p * (1 - p) : Math.sqrt(n * p * (1 - p));
    return { q: `X ~ Binomial(n = ${n}, p = ${p}). The ${kind === "mean" ? "mean" : kind === "var" ? "variance" : "standard deviation"} of X is ____ (3 decimals).`, ans: v, tol: .002,
      what: "Binomial = sum of n Bernoulli(p): mean np, variance np(1 − p).", why: "Means add, and variances add for independent trials.", how: `np = ${f3(n * p)}, np(1 − p) = ${f3(n * p * (1 - p))}, SD = ${f3(Math.sqrt(n * p * (1 - p)))}.`, trap: "SD is the square root of the variance." }; } };
  G.pmfStats = { lvl: 3, make(r) {
    const xs = [0, 1, 2, 3], w = xs.map(() => r.int(1, 4)), tot = w.reduce((a, b) => a + b, 0), p = w.map(x => x / tot);
    const E = xs.reduce((a, x, i) => a + x * p[i], 0), E2 = xs.reduce((a, x, i) => a + x * x * p[i], 0), V = E2 - E * E, kind = r.pick(["E", "V"]);
    return { q: `X takes values 0, 1, 2, 3 with probabilities ${w.map(x => x + "/" + tot).join(", ")}. ${kind === "E" ? "E[X]" : "Var(X)"} = ____ (3 decimals).`, ans: kind === "E" ? E : V, tol: .002,
      what: "E[X] = Σ x p(x).  Var = E[X²] − E[X]².", why: "These summarise centre and spread for any discrete distribution.", how: `E[X] = ${f3(E)}, E[X²] = ${f3(E2)}, Var = ${f3(E2)} − ${f3(E)}² = ${f3(V)}.`, trap: "Var needs E[X²] − (E[X])², not E[X²] alone." }; } };

  G.mleOps = { lvl: 2, make(r) {
    const kind = r.pick(["bern", "map", "pois", "var"]);
    if (kind === "bern") { const n = r.pick([10, 20, 25, 40]), k = r.int(1, n - 1);
      return { q: `${k} successes in ${n} Bernoulli trials. The MLE of p is ____ (3 decimals).`, ans: k / n, tol: .002, what: "Bernoulli MLE: p̂ = k/n.", why: "The likelihood pᵏ(1 − p)ⁿ⁻ᵏ peaks at the observed frequency.", how: `${k}/${n} = ${f3(k / n)}.`, trap: "Use successes / trials, not successes / failures." }; }
    if (kind === "map") { const a = r.int(2, 4), b = r.int(2, 4), n = r.pick([8, 10, 12]), k = r.int(1, n - 1), v = (a + k - 1) / (a + b + n - 2);
      return { q: `Prior Beta(${a}, ${b}) on p; observe ${k} heads in ${n} tosses. The MAP estimate of p is ____ (3 decimals).`, ans: v, tol: .002, what: "Posterior Beta(a + k, b + n − k); its mode is (α − 1)/(α + β − 2).", why: "The prior acts like extra pseudo-observations.", how: `Posterior Beta(${a + k}, ${b + n - k}); MAP = ${a + k - 1}/${a + b + n - 2} = ${f3(v)}.`, trap: "The posterior MEAN is α/(α + β), which is a different number." }; }
    if (kind === "pois") { const d = Array.from({ length: r.int(4, 6) }, () => r.int(0, 7)), v = d.reduce((a, b) => a + b, 0) / d.length;
      return { q: `Poisson counts ${d.join(", ")}. The MLE of λ is ____ (3 decimals).`, ans: v, tol: .002, what: "Poisson MLE: λ̂ = sample mean.", why: "d/dλ Σ(xᵢ log λ − λ) = 0 gives λ = x̄.", how: `Sum = ${d.reduce((a, b) => a + b, 0)}, n = ${d.length}, λ̂ = ${f3(v)}.`, trap: "Divide by n." }; }
    const d = Array.from({ length: 5 }, () => r.int(1, 9)), m = d.reduce((a, b) => a + b, 0) / 5, ss = d.reduce((a, x) => a + (x - m) ** 2, 0), unb = r.next() < .5;
    return { q: `Data ${d.join(", ")}. The ${unb ? "unbiased sample variance (divide by n − 1)" : "MLE of the variance (divide by n)"} is ____ (3 decimals).`, ans: unb ? ss / 4 : ss / 5, tol: .002,
      what: "Σ(xᵢ − x̄)² divided by n (MLE, biased) or n − 1 (unbiased).", why: "Using x̄ instead of μ makes deviations slightly too small, and n − 1 corrects this.", how: `x̄ = ${f3(m)}, Σ(x − x̄)² = ${f3(ss)}; /${unb ? 4 : 5} = ${f3(unb ? ss / 4 : ss / 5)}.`, trap: "Read which divisor is asked for." }; } };

  G.zOps = { lvl: 3, make(r) {
    const sigma = r.pick([4, 5, 8, 10, 12, 15]), n = r.pick([16, 25, 36, 64, 100]), mu0 = r.pick([50, 100, 20]), se = sigma / Math.sqrt(n), xb = mu0 + Math.round(r.int(-30, 30) * se / 10 * 10) / 10;
    const kind = r.pick(["z", "lo", "hi"]), z = (xb - mu0) / se;
    const v = kind === "z" ? z : kind === "lo" ? xb - 1.96 * se : xb + 1.96 * se;
    return { q: kind === "z" ? `x̄ = ${xb}, σ = ${sigma}, n = ${n}, H₀: μ = ${mu0}. The z-statistic is ____ (3 decimals).` : `x̄ = ${xb}, σ = ${sigma}, n = ${n}. The ${kind === "lo" ? "LOWER" : "UPPER"} limit of the 95 % CI for μ is ____ (3 decimals).`,
      ans: v, tol: .003,
      what: "SE = σ/√n.  z = (x̄ − μ₀)/SE.  95 % CI = x̄ ± 1.96·SE.", why: "Everything is measured in standard errors of the mean.",
      how: `SE = ${sigma}/√${n} = ${f3(se)}. ${kind === "z" ? `z = (${xb} − ${mu0})/${f3(se)} = ${f3(z)}${Math.abs(z) > 1.96 ? ", so reject at 5 %" : ", so don't reject at 5 %"}.` : `${xb} ${kind === "lo" ? "−" : "+"} 1.96·${f3(se)} = ${f3(v)}.`}`,
      trap: "Divide σ by √n before using it." }; } };

  G.entropyOps = { lvl: 2, make(r) {
    const dists = [[.5, .5], [.5, .25, .25], [.25, .25, .25, .25], [.5, .25, .125, .125], [.75, .25], [.125, .125, .25, .5], [.9, .1], [.6, .4], [.2, .3, .5]];
    const kind = r.pick(["H", "H", "KL", "CE"]);
    const H = p => -p.reduce((a, x) => a + (x ? x * Math.log2(x) : 0), 0);
    if (kind === "H") { const p = r.pick(dists), v = H(p);
      return { q: `The entropy (bits) of the distribution (${p.join(", ")}) is ____ (3 decimals).`, ans: v, tol: .002, what: "H = −Σ p log₂ p.", why: "This is the average number of yes/no questions needed with an optimal strategy.", how: p.map(x => `${x}·log₂(1/${x}) = ${f3(-x * Math.log2(x))}`).join(" + ") + ` = ${f3(v)}.`, trap: "Use log base 2 for bits." }; }
    const P = r.pick([[.5, .5], [.75, .25], [.25, .75], [.6, .4]]); let Q; do { Q = r.pick([[.5, .5], [.25, .75], [.8, .2], [.4, .6]]); } while (Q[0] === P[0]);
    const KL = P.reduce((a, p, i) => a + p * Math.log2(p / Q[i]), 0), CE = -P.reduce((a, p, i) => a + p * Math.log2(Q[i]), 0);
    return { q: `P = (${P.join(", ")}), Q = (${Q.join(", ")}). ${kind === "KL" ? "D_KL(P‖Q)" : "The cross-entropy H(P, Q)"} in bits is ____ (3 decimals).`, ans: kind === "KL" ? KL : CE, tol: .002,
      what: "D_KL(P‖Q) = Σ P log₂(P/Q).  H(P, Q) = −Σ P log₂ Q = H(P) + D_KL.", why: "This is the extra coding cost of using Q when the truth is P, i.e. the loss we minimise in training.", how: `H(P) = ${f3(H(P))}, D_KL = ${f3(KL)}, H(P, Q) = ${f3(CE)}.`, trap: "Weights come from P (the true distribution), not from Q." }; } };
})();
