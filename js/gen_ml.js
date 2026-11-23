/* Numeric question generators for Machine Learning. Each one makes a fresh, self-checked question
   from a seeded random source, so every chapter has an endless supply of practice.
   A generator returns {q, opts?, ans, tol?, what, why, how, trap}.  opts given → MCQ (ans = index);
   no opts → NAT (ans = number, tol = allowed absolute error). */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => (Math.round(x * 1000) / 1000).toString();
  const f2 = x => (Math.round(x * 100) / 100).toString();
  const H2 = p => (p <= 0 || p >= 1) ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  const sig = z => 1 / (1 + Math.exp(-z));
  function mcq(correct, wrongs, fmt) {
    const seen = new Set([fmt(correct)]); const opts = [fmt(correct)];
    for (const w of wrongs) { const s = fmt(w); if (!seen.has(s) && isFinite(w)) { seen.add(s); opts.push(s); } if (opts.length === 4) break; }
    return opts;
  }

  // ---------- ch1
  G.biasVar = { lvl: 3, make(r) {
    const t = r.int(2, 9), base = t + r.pick([-3, -2, -1, 1, 2, 3]);
    const p = [base + r.int(-2, 2), base + r.int(-2, 2), base + r.int(-2, 2)];
    const m = (p[0] + p[1] + p[2]) / 3, bias2 = (m - t) ** 2, v = p.reduce((s, x) => s + (x - m) ** 2, 0) / 3;
    const askVar = r.next() < .5;
    return { q: `A model is trained on 3 different training sets. At x₀ it predicts ${p.join(', ')}. The true value is f(x₀) = ${t}. ${askVar ? 'The VARIANCE of the prediction (divide by 3)' : 'The squared BIAS'} at x₀ is ____ (2 decimals).`,
      ans: askVar ? v : bias2, tol: .011,
      what: "Bias² = (average prediction − truth)². Variance = average squared spread of the predictions around their own mean.",
      why: "Bias measures systematic error, variance measures instability across training sets. Together with noise they make up the expected error.",
      how: `Mean = (${p.join(' + ')})/3 = ${f3(m)}. Bias² = (${f3(m)} − ${t})² = ${f3(bias2)}. Variance = Σ(pᵢ − ${f3(m)})²/3 = ${f3(v)}.`,
      trap: "Variance is measured around the MEAN prediction, not around the truth." }; } };

  // ---------- ch2
  G.olsSlope = { lvl: 2, make(r) {
    const b0 = r.int(-2, 4), b1 = r.pick([0.5, 1, 1.5, 2, 2.5, 3]);
    const y = [1, 2, 3].map(x => Math.round(b0 + b1 * x + r.pick([-1, 0, 0, 1])));
    const ybar = (y[0] + y[1] + y[2]) / 3, slope = (y[2] - y[0]) / 2, inter = ybar - slope * 2;
    const askPred = r.next() < .4; const pred = inter + slope * 4;
    return { q: `Fit simple OLS to (1, ${y[0]}), (2, ${y[1]}), (3, ${y[2]}). ${askPred ? 'The predicted y at x = 4' : 'The slope β₁'} is ____ (2 decimals).`,
      ans: askPred ? pred : slope, tol: .011,
      what: "β₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², and β₀ = ȳ − β₁x̄.",
      why: "With x = 1, 2, 3 the deviations are −1, 0, 1, so the slope reduces to (y₃ − y₁)/2. That's a GATE speed trick.",
      how: `x̄ = 2, ȳ = ${f3(ybar)}. β₁ = [(−1)(${y[0]} − ȳ) + (1)(${y[2]} − ȳ)] / 2 = ${f3(slope)}. β₀ = ${f3(ybar)} − ${f3(slope)}·2 = ${f3(inter)}.${askPred ? ` ŷ(4) = ${f3(inter)} + ${f3(slope)}·4 = ${f3(pred)}.` : ''}`,
      trap: "The middle point does not affect the slope here, but it does affect ȳ and hence β₀." }; } };
  G.ridge1d = { lvl: 3, make(r) {
    const xs = [r.int(1, 3), r.int(1, 3), r.int(1, 4)], ys = xs.map(x => x * r.int(1, 3) + r.int(-1, 1));
    const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0), sxx = xs.reduce((s, x) => s + x * x, 0), lam = r.pick([1, 2, 5, 10]);
    const w = sxy / (sxx + lam);
    return { q: `One-feature ridge regression WITHOUT intercept: minimise Σ(yᵢ − w xᵢ)² + λw², λ = ${lam}, data x = (${xs.join(', ')}), y = (${ys.join(', ')}). The optimal w is ____ (3 decimals).`,
      ans: w, tol: .002,
      what: "1-D ridge has the closed form w = Σxy / (Σx² + λ).",
      why: "Setting the derivative −2Σx(y − wx) + 2λw to 0 gives it. λ simply adds to the denominator and shrinks w towards 0.",
      how: `Σxy = ${sxy}, Σx² = ${sxx}. w = ${sxy}/(${sxx} + ${lam}) = ${f3(w)}. (OLS would give ${f3(sxy / sxx)}.)`,
      trap: "λ goes in the denominator, not subtracted from the numerator." }; } };

  // ---------- ch3
  G.sigmoidProb = { lvl: 2, make(r) {
    let w, x, b, z;
    do { w = [r.int(-2, 2), r.int(-2, 2)]; x = [r.int(-1, 2), r.int(-1, 2)]; b = r.int(-2, 2); z = w[0] * x[0] + w[1] * x[1] + b; } while (Math.abs(z) > 3 || z === 0);
    const p = sig(z), opts = mcq(p, [sig(-z), sig(z - b), 0.5, sig(z + 1), sig(z - 1), sig(z + 2), sig(z - 2)], f3);
    return { q: `Logistic regression: w = [${w.join(', ')}], b = ${b}, x = [${x.join(', ')}]. P(y = 1 | x) ≈ ?`,
      opts, ans: 0,
      what: "p = σ(z) with z = wᵀx + b. Useful values: σ(1) ≈ 0.731, σ(2) ≈ 0.881, σ(3) ≈ 0.953, σ(−z) = 1 − σ(z).",
      why: "z is the log-odds. The sigmoid squashes it into a probability.",
      how: `z = ${w[0]}·${x[0]} + ${w[1]}·${x[1]} + (${b}) = ${z}. p = σ(${z}) = ${f3(p)}.`,
      trap: "Forgetting b, or flipping the sign (σ(−z)), are the two classic slips." }; } };
  G.logLoss = { lvl: 3, make(r) {
    const y = r.int(0, 1), p = r.pick([.1, .2, .25, .4, .5, .6, .75, .8, .9]);
    const L = -(y ? Math.log(p) : Math.log(1 - p));
    return { q: `Binary cross-entropy (natural log) for one example with true label y = ${y} and predicted p = P(y = 1) = ${p} is ____ (3 decimals).`,
      ans: L, tol: .002,
      what: "L = −[y ln p + (1 − y) ln(1 − p)].",
      why: "Only the term for the true class survives. Confident wrong predictions explode the loss.",
      how: `y = ${y}, so L = −ln(${y ? p : f2(1 - p)}) = ${f3(L)}.`,
      trap: y ? "With y = 1 use ln p, not ln(1 − p)." : "With y = 0 the relevant probability is 1 − p." }; } };

  // ---------- ch4
  G.confusion = { lvl: 2, make(r) {
    const TP = r.int(10, 60), FP = r.int(2, 30), FN = r.int(2, 30), TN = r.int(20, 90);
    const m = r.pick(['precision', 'recall', 'F1', 'accuracy', 'specificity']);
    const P = TP / (TP + FP), R = TP / (TP + FN);
    const val = { precision: P, recall: R, F1: 2 * TP / (2 * TP + FP + FN), accuracy: (TP + TN) / (TP + FP + FN + TN), specificity: TN / (TN + FP) }[m];
    const form = { precision: 'TP/(TP + FP)', recall: 'TP/(TP + FN)', F1: '2TP/(2TP + FP + FN)', accuracy: '(TP + TN)/total', specificity: 'TN/(TN + FP)' }[m];
    return { q: `Confusion matrix: TP = ${TP}, FP = ${FP}, FN = ${FN}, TN = ${TN}. The ${m} is ____ (3 decimals).`,
      ans: val, tol: .0015,
      what: `${m} = ${form}.`,
      why: "Each metric answers a different question: trust in positives (precision), coverage of positives (recall), balance (F1).",
      how: `${m} = ${form} = ${f3(val)}.  (P = ${f3(P)}, R = ${f3(R)})`,
      trap: "Precision divides by predicted positives (TP + FP), recall by actual positives (TP + FN)." }; } };

  // ---------- ch5
  G.knn1d = { lvl: 2, make(r) {
    let pts, q, d;
    do {
      pts = []; const used = new Set();
      while (pts.length < 6) { const x = r.int(0, 20); if (!used.has(x)) { used.add(x); pts.push([x, r.pick(['A', 'B'])]); } }
      q = r.int(0, 20) + 0.5; d = pts.map(([x]) => Math.abs(x - q)).sort((a, b) => a - b);
    } while (d[2] === d[3] || new Set(pts.map(p => p[1])).size < 2);
    const k = 3, near = pts.slice().sort((a, b) => Math.abs(a[0] - q) - Math.abs(b[0] - q)).slice(0, k);
    const nA = near.filter(p => p[1] === 'A').length, win = nA >= 2 ? 'A' : 'B';
    const opts = [`Class ${win}`, `Class ${win === 'A' ? 'B' : 'A'}`, 'A tie, so it cannot decide', 'The class of the farthest point'];
    return { q: `1-D training data (x, label): ${pts.map(p => `(${p[0]}, ${p[1]})`).join(', ')}. Using 3-NN, the query x = ${q} is classified as…`,
      opts, ans: 0,
      what: "k-NN votes among the k training points closest to the query.",
      why: "Nearby points are assumed to share labels. The vote smooths out single noisy neighbours.",
      how: `Distances: ${pts.map(p => `${p[0]}→${Math.abs(p[0] - q)}`).join(', ')}. The 3 nearest are ${near.map(p => `${p[0]}(${p[1]})`).join(', ')}, so the majority is ${win}.`,
      trap: "Sort by DISTANCE to the query, not by x value." }; } };
  G.bayesPost = { lvl: 3, make(r) {
    const prior = r.pick([.1, .2, .3, .4, .5]), l1 = r.pick([.5, .6, .7, .8, .9]), l0 = r.pick([.05, .1, .2, .3]);
    const post = l1 * prior / (l1 * prior + l0 * (1 - prior));
    return { q: `P(disease) = ${prior}. A test is positive with probability ${l1} if diseased and ${l0} if healthy. Given a positive test, P(disease | +) is ____ (3 decimals).`,
      ans: post, tol: .002,
      what: "Bayes: P(D | +) = P(+ | D)P(D) / [P(+ | D)P(D) + P(+ | ¬D)P(¬D)].",
      why: "A positive result must be weighed against how rare the disease is (the base rate).",
      how: `Numerator = ${l1}×${prior} = ${f3(l1 * prior)}. Evidence = ${f3(l1 * prior)} + ${l0}×${f2(1 - prior)} = ${f3(l1 * prior + l0 * (1 - prior))}. Posterior = ${f3(post)}.`,
      trap: "P(+ | D) is not P(D | +). Ignoring the prior is the base-rate fallacy." }; } };

  // ---------- ch6
  G.svmMargin = { lvl: 2, make(r) {
    const [a, b, n] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [1, 0, 1], [0, 2, 2], [2, 0, 2], [9, 12, 15]]);
    const m = 2 / n;
    return { q: `A linear SVM (constraints yᵢ(wᵀxᵢ + b) ≥ 1) has w = (${a}, ${b}). The margin width is ____ (3 decimals).`,
      ans: m, tol: .002,
      what: "Margin = 2 / ‖w‖.",
      why: "The margin hyperplanes are wᵀx + b = ±1, and their distance apart is 2/‖w‖.",
      how: `‖w‖ = √(${a}² + ${b}²) = ${n}. Margin = 2/${n} = ${f3(m)}.`,
      trap: "1/‖w‖ is only the half-margin." }; } };
  G.hinge = { lvl: 2, make(r) {
    const y = r.pick([-1, 1]), f = Math.round((r.next() * 4 - 2) * 10) / 10, L = Math.max(0, 1 - y * f);
    return { q: `SVM hinge loss for a point with label y = ${y > 0 ? '+1' : '−1'} and score f(x) = ${f} is ____ (1 decimal).`,
      ans: L, tol: .051,
      what: "Hinge loss = max(0, 1 − y·f(x)).",
      why: "There is no loss only when the point is on the correct side AND at least 1 unit beyond the boundary.",
      how: `y·f = ${f2(y * f)}. 1 − y·f = ${f2(1 - y * f)}. max(0, ·) = ${f2(L)}.`,
      trap: "A correctly classified point (y·f > 0) can still have positive loss if y·f < 1." }; } };

  // ---------- ch7
  G.entropyQ = { lvl: 2, make(r) {
    const a = r.int(1, 9), b = r.int(1, 9), p = a / (a + b), useG = r.next() < .5;
    const val = useG ? 1 - p * p - (1 - p) ** 2 : H2(p);
    return { q: `A node holds ${a} positive and ${b} negative samples. Its ${useG ? 'Gini impurity' : 'entropy (bits)'} is ____ (3 decimals).`,
      ans: val, tol: .002,
      what: useG ? "Gini = 1 − Σ pₖ² (binary: 2p(1 − p))." : "Entropy H = −Σ pₖ log₂ pₖ.",
      why: "Both are 0 for a pure node and largest for a 50/50 node. Trees split to reduce them.",
      how: `p = ${a}/${a + b} = ${f3(p)}. ${useG ? `Gini = 2·${f3(p)}·${f3(1 - p)} = ${f3(val)}` : `H = −${f3(p)}·log₂${f3(p)} − ${f3(1 - p)}·log₂${f3(1 - p)} = ${f3(val)}`}.`,
      trap: "Entropy uses log base 2 (bits). Don't mix it up with the Gini value." }; } };
  G.infoGain = { lvl: 3, make(r) {
    let a1, b1, a2, b2;
    const ig = (a1, b1, a2, b2) => { const N = a1 + b1 + a2 + b2; return H2((a1 + a2) / N) - ((a1 + b1) / N) * H2(a1 / (a1 + b1)) - ((a2 + b2) / N) * H2(a2 / (a2 + b2)); };
    do { a1 = r.int(0, 8); b1 = r.int(0, 8); a2 = r.int(0, 8); b2 = r.int(0, 8); } while (a1 + b1 === 0 || a2 + b2 === 0 || a1 + a2 === 0 || b1 + b2 === 0 || ig(a1, b1, a2, b2) < 0.02);
    const A = a1 + a2, B = b1 + b2, N = A + B, n1 = a1 + b1, n2 = a2 + b2;
    const Hp = H2(A / N), Hc = (n1 / N) * H2(a1 / n1) + (n2 / N) * H2(a2 / n2), IG = Hp - Hc;
    return { q: `Parent node: ${A}+ / ${B}−. A split gives children (${a1}+, ${b1}−) and (${a2}+, ${b2}−). The information gain (bits) is ____ (3 decimals).`,
      ans: IG, tol: .003,
      what: "IG = H(parent) − Σ (nᵢ/n) H(childᵢ).",
      why: "The gain is how much the split reduces uncertainty about the label.",
      how: `H(parent) = ${f3(Hp)}. H(left) = ${f3(H2(a1 / n1))} (weight ${n1}/${N}), H(right) = ${f3(H2(a2 / n2))} (weight ${n2}/${N}). Weighted = ${f3(Hc)}. IG = ${f3(IG)}.`,
      trap: "Weight each child's entropy by its share of the samples. Don't just average them." }; } };

  // ---------- ch8
  G.mlpParams = { lvl: 2, make(r) {
    const L = r.int(2, 3), sizes = [r.pick([2, 3, 4, 8, 10, 16])];
    for (let i = 0; i < L; i++) sizes.push(r.pick([2, 3, 4, 5, 8, 10, 16, 32]));
    let tot = 0, parts = [];
    for (let i = 0; i < sizes.length - 1; i++) { const p = sizes[i] * sizes[i + 1] + sizes[i + 1]; tot += p; parts.push(`${sizes[i]}·${sizes[i + 1]} + ${sizes[i + 1]} = ${p}`); }
    return { q: `A fully connected network has layer sizes ${sizes.join(' → ')} (biases included). The number of trainable parameters is ____.`,
      ans: tot, tol: 0,
      what: "Each dense layer has d_in × d_out weights + d_out biases.",
      why: "Every input connects to every output, and each output neuron has one bias.",
      how: parts.join(';  ') + `.  Total = ${tot}.`,
      trap: "Don't forget the biases, and don't count the input layer as having parameters." }; } };
  G.neuronForward = { lvl: 2, make(r) {
    const w = [r.pick([-1, -.5, .5, 1, 2]), r.pick([-2, -1, .5, 1, 1.5])], x = [r.int(-2, 3), r.int(-2, 3)], b = r.pick([-1, -.5, 0, .5, 1]);
    const z = w[0] * x[0] + w[1] * x[1] + b, out = Math.max(0, z);
    return { q: `A ReLU neuron has w = [${w.join(', ')}], b = ${b}, and input x = [${x.join(', ')}]. Its output is ____ (2 decimals).`,
      ans: out, tol: .011,
      what: "Neuron output = ReLU(wᵀx + b) = max(0, z).",
      why: "A weighted sum followed by a non-linearity is the building block of every MLP.",
      how: `z = ${w[0]}·${x[0]} + ${w[1]}·${x[1]} + ${b} = ${f2(z)}. ReLU → ${f2(out)}.`,
      trap: z < 0 ? "z is negative, so ReLU outputs 0, not z." : "Remember to add the bias." }; } };

  // ---------- ch9
  G.kmeans1d = { lvl: 3, make(r) {
    const g1 = r.int(0, 3), g2 = r.int(10, 14);
    const pts = [g1, g1 + r.int(1, 2), g1 + r.int(3, 4), g2, g2 + r.int(1, 2), g2 + r.int(3, 4)].sort((a, b) => a - b);
    const start = [pts[0], pts[r.int(1, 2)]]; let c = start.slice(); const steps = [];
    for (let it = 0; it < 10; it++) {
      const A = pts.filter(p => Math.abs(p - c[0]) <= Math.abs(p - c[1])), B = pts.filter(p => Math.abs(p - c[0]) > Math.abs(p - c[1]));
      const nc = [A.reduce((s, x) => s + x, 0) / A.length, B.length ? B.reduce((s, x) => s + x, 0) / B.length : c[1]];
      steps.push(`iter ${it + 1}: {${A.join(',')}} | {${B.join(',')}} → μ = ${f3(nc[0])}, ${f3(nc[1])}`);
      if (Math.abs(nc[0] - c[0]) < 1e-9 && Math.abs(nc[1] - c[1]) < 1e-9) break; c = nc;
    }
    const hi = Math.max(...c);
    return { q: `1-D k-means with k = 2 on points {${pts.join(', ')}}, initial centroids ${start[0]} and ${start[1]}. After convergence, the LARGER centroid is ____ (2 decimals).`,
      ans: hi, tol: .011,
      what: "k-means alternates: assign each point to its nearest centroid, then move each centroid to the mean of its assigned points.",
      why: "Each step can only lower the within-cluster sum of squares, so the algorithm converges (to a local optimum).",
      how: steps.join(';  '),
      trap: "Keep iterating until the assignments stop changing. A bad start needs several rounds." }; } };
  G.linkage1d = { lvl: 3, make(r) {
    let pts;
    do { pts = [0, r.int(1, 3), r.int(5, 8), r.int(9, 13)].map((x, i) => x + i * 0); pts = [...new Set(pts)].sort((a, b) => a - b); } while (pts.length < 4);
    const type = r.pick(['single', 'complete']);
    let cl = pts.map(p => [p]); const log = [];
    const dist = (A, B) => { const ds = []; A.forEach(a => B.forEach(b => ds.push(Math.abs(a - b)))); return type === 'single' ? Math.min(...ds) : Math.max(...ds); };
    let last = 0;
    while (cl.length > 1) {
      let best = [0, 1, Infinity];
      for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) { const d = dist(cl[i], cl[j]); if (d < best[2]) best = [i, j, d]; }
      const [i, j, d] = best; log.push(`merge {${cl[i]}} + {${cl[j]}} at ${d}`); last = d;
      cl = cl.filter((_, k) => k !== i && k !== j).concat([cl[i].concat(cl[j])]);
    }
    return { q: `Agglomerative clustering with ${type} linkage on the 1-D points {${pts.join(', ')}}. The distance at which the FINAL merge happens is ____.`,
      ans: last, tol: 0,
      what: type === 'single' ? "Single linkage: cluster distance = the MINIMUM distance over all cross pairs." : "Complete linkage: cluster distance = the MAXIMUM distance over all cross pairs.",
      why: "The linkage rule decides which clusters count as 'closest', and that shapes the whole dendrogram.",
      how: log.join(';  '),
      trap: "Recompute cluster distances after every merge using the linkage rule, not the old point distances." }; } };

  // ---------- ch10
  G.pcaVar = { lvl: 2, make(r) {
    const ev = Array.from({ length: r.int(3, 5) }, () => r.int(1, 9)).sort((a, b) => b - a), k = r.int(1, ev.length - 1);
    const tot = ev.reduce((s, x) => s + x, 0), top = ev.slice(0, k).reduce((s, x) => s + x, 0), pct = 100 * top / tot;
    return { q: `A covariance matrix has eigenvalues ${ev.join(', ')}. The percentage of variance explained by the first ${k} principal component${k > 1 ? 's' : ''} is ____ % (1 decimal).`,
      ans: pct, tol: .06,
      what: "Explained ratio = (sum of the kept eigenvalues) / (sum of all eigenvalues).",
      why: "Each eigenvalue is the variance along its principal direction, and their sum is the total variance (the trace).",
      how: `${ev.slice(0, k).join(' + ')} = ${top}; total = ${tot}; ${top}/${tot} = ${f2(pct)} %.`,
      trap: "Sort the eigenvalues in descending order first. 'First k' means the largest k." }; } };
  G.pcaEig = { lvl: 3, make(r) {
    const b = r.pick([-3, -2, -1, 1, 2, 3]), a = r.int(Math.abs(b) + 1, 9);   // a > |b| keeps S positive definite
    const big = a + Math.abs(b), dir = b > 0 ? '(1, 1)/√2' : '(1, −1)/√2', other = b > 0 ? '(1, −1)/√2' : '(1, 1)/√2';
    const opts = [`λ_max = ${big}, PC1 along ${dir}`, `λ_max = ${big}, PC1 along ${other}`, `λ_max = ${a}, PC1 along (1, 0)`, `λ_max = ${2 * a}, PC1 along ${dir}`];
    return { q: `Covariance matrix S = [[${a}, ${b}], [${b}, ${a}]]. Which is correct?`,
      opts, ans: 0,
      what: "For [[a, b], [b, a]], the eigenvalues are a + b and a − b, with eigenvectors (1, 1) and (1, −1).",
      why: "Positive covariance stretches the data along y = x, and negative along y = −x.",
      how: `Eigenvalues ${a + b} and ${a - b}. Largest = ${big}, along ${dir}. Check: trace = ${2 * a} ✓, det = ${a * a - b * b} = ${(a + b) * (a - b)} ✓.`,
      trap: "Match each eigenvalue to its eigenvector. The sign of b decides which diagonal wins." }; } };
})();
