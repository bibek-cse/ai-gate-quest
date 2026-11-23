/* Numeric question generators for Algorithms (answers computed by simulation). */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000);
  const num = n => n.toLocaleString("en-US");

  G.masterOps = { lvl: 3, make(r) {
    const cases = [[2, 2, "n", "Θ(n log n)", 2], [8, 2, "n²", "Θ(n³)", 1], [2, 2, "n²", "Θ(n²)", 3], [4, 2, "n", "Θ(n²)", 1], [4, 2, "n²", "Θ(n² log n)", 2], [1, 2, "1", "Θ(log n)", 2], [3, 2, "n", "Θ(n^{log₂3})", 1], [7, 2, "n²", "Θ(n^{log₂7})", 1], [9, 3, "n", "Θ(n²)", 1], [1, 3, "n", "Θ(n)", 3], [2, 4, "√n", "Θ(√n log n)", 2], [3, 3, "n", "Θ(n log n)", 2], [16, 4, "n²", "Θ(n² log n)", 2], [2, 2, "n³", "Θ(n³)", 3]];
    const [a, b, f, ans, cs] = r.pick(cases), wrong = ["Θ(n)", "Θ(n log n)", "Θ(n²)", "Θ(n² log n)", "Θ(n³)", "Θ(log n)", "Θ(n log² n)"].filter(x => x !== ans);
    const w = []; while (w.length < 3) { const x = r.pick(wrong); if (!w.includes(x)) w.push(x); }
    return { q: `Solve T(n) = ${a === 1 ? "" : a}T(n/${b}) + ${f} with the Master theorem.`, opts: [ans, ...w], ans: 0,
      what: `Compare f(n) = ${f} with n^{log_b a} = n^{log_${b} ${a}}.`, why: "The larger of the two dominates; equal → extra log factor.", how: `Case ${cs}: T(n) = ${ans}.`, trap: "Check whether f is polynomially smaller, equal, or larger." };
  } };

  G.sortOps = { lvl: 3, make(r) {
    const kind = r.pick(["inv", "lb", "merge"]);
    if (kind === "inv") { const a = Array.from({ length: r.int(5, 8) }, () => r.int(1, 20)); let c = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
      return { q: `Number of inversions in [${a.join(", ")}] (= adjacent swaps insertion sort performs)?`, ans: c,
        what: "Count pairs i < j with A[i] > A[j].", why: "Insertion sort fixes exactly one inversion per shift.", how: `Counting all pairs gives ${c}.`, trap: "Equal elements are not inversions." }; }
    if (kind === "lb") { const n = r.int(3, 12); let f = 1; for (let i = 2; i <= n; i++) f *= i; const v = Math.ceil(Math.log2(f) - 1e-12);
      return { q: `Comparison-sort lower bound: minimum worst-case comparisons to sort ${n} elements is at least ⌈log₂ ${n}!⌉ = ____.`, ans: v,
        what: "Decision tree with n! leaves has height ≥ log₂ n!.", why: "Proves Ω(n log n) for comparison sorts.", how: `${n}! = ${num(f)}, log₂ = ${f3(Math.log2(f))} → ${v}.`, trap: "Round up." }; }
    const k = r.int(2, 6), n = 2 ** k; let w = 0; for (let s = 1; s < n; s *= 2) w += (n / (2 * s)) * (2 * s - 1);
    return { q: `Worst-case comparisons of merge sort on n = ${n} elements (each merge of total size m costs m − 1)?`, ans: w,
      what: "Sum over levels of (number of merges × (merged size − 1)).", why: "Exact count behind n log n.", how: `Total = n log₂ n − n + 1 = ${w}.`, trap: "Each merge saves one comparison." };
  } };

  G.bsearchOps = { lvl: 2, make(r) {
    const kind = r.pick(["worst", "trace", "maxn"]);
    if (kind === "worst") { const n = r.pick([10, 100, 500, 1000, 4096, 1e5, 1e6]); return { q: `Worst-case number of (three-way) comparisons for binary search on ${num(n)} sorted elements?`, ans: Math.ceil(Math.log2(n + 1)),
      what: "⌈log₂(n + 1)⌉.", why: "Each comparison halves the remaining range.", how: `⌈log₂ ${num(n + 1)}⌉ = ${Math.ceil(Math.log2(n + 1))}.`, trap: "It's logarithmic, not n/2." }; }
    if (kind === "maxn") { const k = r.int(3, 20); return { q: `Largest sorted array size for which binary search needs at most ${k} comparisons?`, ans: 2 ** k - 1,
      what: "2^k − 1 elements fit in a decision tree of height k.", why: "Each level doubles the capacity.", how: `2^${k} − 1 = ${num(2 ** k - 1)}.`, trap: `2^${k} would need ${k + 1}.` }; }
    const a = []; let x = r.int(1, 5); for (let i = 0; i < r.int(8, 14); i++) { a.push(x); x += r.int(1, 9); } const t = r.pick(a); let lo = 0, hi = a.length - 1, c = 0; while (lo <= hi) { const m = (lo + hi) >> 1; c++; if (a[m] === t) break; if (a[m] < t) lo = m + 1; else hi = m - 1; }
    return { q: `Binary search (mid = ⌊(lo + hi)/2⌋) for ${t} in [${a.join(", ")}]. How many elements are compared?`, ans: c,
      what: "Trace lo, hi and mid until found.", why: "Shows the halving behaviour concretely.", how: `${c} probe(s).`, trap: "Use integer division for mid." };
  } };

  G.dncOps = { lvl: 3, make(r) {
    const kind = r.pick(["kara", "stras", "pow", "rec"]);
    if (kind === "kara") { const k = r.int(1, 6); return { q: `Karatsuba on two ${2 ** k}-digit numbers (recursing to single digits) uses how many digit multiplications?`, ans: 3 ** k,
      what: "3^{log₂ n}.", why: "One fewer recursive product per level than the schoolbook method.", how: `3^${k} = ${3 ** k} (schoolbook ${4 ** k}).`, trap: "Not 3n." }; }
    if (kind === "stras") { const k = r.int(1, 5); return { q: `Strassen on ${2 ** k}×${2 ** k} matrices (recursing to 1×1) uses how many scalar multiplications?`, ans: 7 ** k,
      what: "7^{log₂ n}.", why: "Seven half-size products instead of eight.", how: `7^${k} = ${num(7 ** k)} (naive ${num(8 ** k)}).`, trap: "Additions are not counted." }; }
    if (kind === "pow") { const n = r.int(5, 200), b = n.toString(2), ones = [...b].filter(c => c === "1").length; return { q: `Binary exponentiation for x^${n}: number of multiplications (squarings + extra multiplies)?`, ans: (b.length - 1) + (ones - 1),
      what: "(bits − 1) squarings + (1-bits − 1) multiplies.", why: "O(log n) instead of n − 1.", how: `${n} = ${b}₂: ${b.length - 1} + ${ones - 1} = ${b.length - 1 + ones - 1}.`, trap: "The leading 1 needs no multiply." }; }
    const a = r.pick([1, 2, 3]), c = r.pick([0, 1]), k = r.int(2, 5), n = 2 ** k; const T = m => m === 1 ? 1 : a * T(m / 2) + (c ? m : 1);
    return { q: `T(n) = ${a}T(n/2) + ${c ? "n" : "1"}, T(1) = 1. Compute T(${n}).`, ans: T(n),
      what: "Unroll the recurrence.", why: "Exact values build intuition for the recursion tree.", how: `T(${n}) = ${T(n)}.`, trap: "Apply the base case T(1) = 1." };
  } };

  G.greedyOps = { lvl: 3, make(r) {
    const kind = r.pick(["act", "frac", "huff"]);
    if (kind === "act") { const acts = Array.from({ length: r.int(6, 9) }, () => { const s = r.int(0, 14); return [s, s + r.int(1, 5)]; }); const so = acts.slice().sort((a, b) => a[1] - b[1]); let last = -1, c = 0, ch = []; so.forEach(([s, f]) => { if (s >= last) { c++; last = f; ch.push(`(${s},${f})`); } });
      return { q: `Activities (start, finish): ${acts.map(a => `(${a[0]},${a[1]})`).join(", ")}. Maximum number of non-overlapping activities (an activity may start when another finishes)?`, ans: c,
        what: "Sort by finish time; take each that starts after the last chosen one finishes.", why: "Earliest finish leaves the most room.", how: `Chosen: ${ch.join(" → ")}.`, trap: "Sorting by start time can fail." }; }
    if (kind === "frac") { const it = Array.from({ length: 3 }, () => [r.int(2, 12) * 10, r.int(1, 6) * 5]), W = r.int(2, 8) * 5; const so = it.slice().sort((a, b) => b[0] / b[1] - a[0] / a[1]); let cap = W, v = 0; so.forEach(([val, w]) => { const t = Math.min(w, cap); v += val * t / w; cap -= t; });
      return { q: `Fractional knapsack, capacity ${W}. Items (value, weight): ${it.map(x => `(${x[0]},${x[1]})`).join(", ")}. Maximum value (3 decimals)?`, ans: v, tol: .002,
        what: "Take items by decreasing value/weight, splitting the last.", why: "Greedy is optimal when fractions are allowed.", how: `Ratios ${so.map(x => f3(x[0] / x[1])).join(" ≥ ")} → ${f3(v)}.`, trap: "0/1 knapsack would need DP." }; }
    const fr = Array.from({ length: r.int(4, 6) }, () => r.int(1, 30)); const h = fr.slice(); let cost = 0; while (h.length > 1) { h.sort((a, b) => a - b); const s = h.shift() + h.shift(); cost += s; h.push(s); }
    return { q: `Huffman coding with frequencies ${fr.join(", ")}. Total encoded length Σ freq × code length?`, ans: cost,
      what: "Repeatedly merge the two smallest; total = sum of all merge results.", why: "Each merge adds one bit to every symbol beneath it.", how: `Sum of internal node weights = ${cost}.`, trap: "Don't include the original leaf weights." };
  } };

  G.dpOps = { lvl: 3, make(r) {
    const kind = r.pick(["lcs", "edit", "knap", "coins", "chain"]);
    const words = ["ABCBDAB", "BDCABA", "AGGTAB", "GXTXAYB", "KITTEN", "SITTING", "SUNDAY", "SATURDAY", "HORSE", "ROS", "INTENTION", "EXECUTION", "DYNAMIC", "PROGRAM"];
    if (kind === "lcs" || kind === "edit") { const a = r.pick(words), b = r.pick(words.filter(w => w !== a)), m = a.length, n = b.length; const L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)), E = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
      for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) { L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]); E[i][j] = a[i - 1] === b[j - 1] ? E[i - 1][j - 1] : 1 + Math.min(E[i - 1][j], E[i][j - 1], E[i - 1][j - 1]); }
      if (kind === "lcs") return { q: `Length of the longest common subsequence of '${a}' and '${b}'?`, ans: L[m][n], what: "L[i][j] = L[i−1][j−1] + 1 on a match, else max(L[i−1][j], L[i][j−1]).", why: "Overlapping subproblems over prefixes.", how: `Table gives ${L[m][n]}.`, trap: "Subsequence ≠ substring." };
      return { q: `Edit distance (insert, delete, substitute, cost 1 each) between '${a}' and '${b}'?`, ans: E[m][n], what: "E[i][j] = E[i−1][j−1] on match, else 1 + min(delete, insert, substitute).", why: "Classic prefix DP.", how: `Table gives ${E[m][n]}.`, trap: "Base row/column are i and j." }; }
    if (kind === "knap") { const it = Array.from({ length: 4 }, () => [r.int(1, 6), r.int(1, 10)]), W = r.int(5, 12), dp = Array(W + 1).fill(0); it.forEach(([w, v]) => { for (let c = W; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + v); });
      return { q: `0/1 knapsack, capacity ${W}. Items (weight, value): ${it.map(x => `(${x[0]},${x[1]})`).join(", ")}. Maximum value?`, ans: dp[W], what: "dp[c] = max(dp[c], dp[c − w] + v), capacities iterated downward.", why: "Each item is used at most once.", how: `DP gives ${dp[W]}.`, trap: "Iterating capacities upward would allow reuse." }; }
    if (kind === "coins") { const cs = r.pick([[1, 2, 5], [1, 3, 4], [2, 3, 5], [1, 5, 10], [1, 2, 3]]), N = r.int(5, 15), w = Array(N + 1).fill(0); w[0] = 1; cs.forEach(c => { for (let a = c; a <= N; a++) w[a] += w[a - c]; });
      return { q: `Number of ways to make ${N} with coins {${cs.join(", ")}} (unlimited supply, order doesn't matter)?`, ans: w[N], what: "ways[a] += ways[a − c], coins in the outer loop.", why: "Outer loop over coins counts combinations, not orders.", how: `ways[${N}] = ${w[N]}.`, trap: "Swapping loops counts ordered sequences." }; }
    const p = Array.from({ length: r.int(4, 5) }, () => r.int(2, 9) * 5), n = p.length - 1, m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    for (let len = 2; len <= n; len++) for (let i = 1; i + len - 1 <= n; i++) { const j = i + len - 1; m[i][j] = Infinity; for (let k = i; k < j; k++) m[i][j] = Math.min(m[i][j], m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]); }
    return { q: `Matrix chain with dimensions ${p.join(" × ")} (${n} matrices). Minimum scalar multiplications?`, ans: m[1][n], what: "m[i][j] = min_k m[i][k] + m[k+1][j] + p_{i−1}p_k p_j.", why: "Parenthesisation changes cost dramatically.", how: `DP gives ${num(m[1][n])}.`, trap: "Use p_{i−1}·p_k·p_j for the split cost." };
  } };

  G.bfsOps = { lvl: 2, make(r) {
    const kind = r.pick(["forest", "grid", "indeg"]);
    if (kind === "forest") { const V = r.int(6, 20), E = r.int(1, V - 1); return { q: `An undirected acyclic graph (forest) has ${V} vertices and ${E} edges. Number of connected components?`, ans: V - E,
      what: "Forest: components = V − E.", why: "Each tree has (vertices − 1) edges.", how: `${V} − ${E} = ${V - E}.`, trap: "Only valid without cycles." }; }
    if (kind === "grid") { const R = r.int(2, 6), Cc = r.int(2, 6); return { q: `BFS on an ${R}×${Cc} grid graph (4-neighbour). Distance from the top-left to the bottom-right cell?`, ans: R + Cc - 2,
      what: "Manhattan distance.", why: "BFS layers are diagonals in a grid.", how: `(${R} − 1) + (${Cc} − 1) = ${R + Cc - 2}.`, trap: "No diagonal moves." }; }
    const n = r.int(5, 8), edges = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (r.next() < .3) edges.push([i, j]); const indeg = Array(n).fill(0); edges.forEach(([a, b]) => indeg[b]++);
    return { q: `DAG on vertices 0..${n - 1} with edges ${edges.map(e => e.join("→")).join(", ") || "(none)"}. How many vertices have in-degree 0?`, ans: indeg.filter(x => x === 0).length,
      what: "Count vertices with no incoming edges.", why: "They can start a topological order (Kahn's initial queue).", how: `In-degrees: ${indeg.join(", ")}.`, trap: "Isolated vertices count too." };
  } };

  const dijkstra = (n, adj, s) => { const d = Array(n).fill(Infinity), done = Array(n).fill(false); d[s] = 0; for (let it = 0; it < n; it++) { let u = -1; for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || d[i] < d[u])) u = i; if (d[u] === Infinity) break; done[u] = true; adj[u].forEach(([v, w]) => { if (d[u] + w < d[v]) d[v] = d[u] + w; }); } return d; };
  G.spOps = { lvl: 3, make(r) {
    const kind = r.pick(["dij", "bf", "fw"]);
    if (kind === "bf") { const V = r.int(4, 12), E = r.int(V, 3 * V); return { q: `Bellman-Ford on V = ${V}, E = ${E}: maximum relaxations before the negative-cycle check?`, ans: (V - 1) * E,
      what: "(V − 1) rounds × E edges.", why: "A shortest path has at most V − 1 edges.", how: `${V - 1} × ${E} = ${(V - 1) * E}.`, trap: "The check adds one more round." }; }
    if (kind === "fw") { const V = r.pick([10, 20, 50, 100, 200]); return { q: `Floyd-Warshall on ${V} vertices performs how many inner-loop updates?`, ans: V ** 3,
      what: "V³ from the triple loop.", why: "All pairs × all intermediate vertices.", how: `${V}³ = ${num(V ** 3)}.`, trap: "Space is only V²." }; }
    const n = 5, names = "SABCD", adj = Array.from({ length: n }, () => []), es = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && r.next() < .4) { const w = r.int(1, 9); adj[i].push([j, w]); es.push(`${names[i]}→${names[j]} ${w}`); }
    if (!adj[0].length) { adj[0].push([1, 3]); es.push("S→A 3"); } const d = dijkstra(n, adj, 0), t = r.int(1, 4), reach = d[t] < Infinity;
    if (!reach) { adj[0].push([t, 7]); es.push(`S→${names[t]} 7`); } const d2 = dijkstra(n, adj, 0);
    return { q: `Directed graph: ${es.join(", ")}. Shortest distance from S to ${names[t]}?`, ans: d2[t],
      what: "Dijkstra: finalise the closest vertex, relax its edges.", why: "Non-negative weights make greedy finalisation correct.", how: `Distances: ${names.split("").map((c, i) => c + "=" + (d2[i] === Infinity ? "∞" : d2[i])).join(", ")}.`, trap: "A longer path with more edges can be cheaper." };
  } };

  G.mstOps = { lvl: 3, make(r) {
    const n = r.int(4, 6), names = "ABCDEF", E = []; for (let i = 1; i < n; i++) E.push([r.int(0, i - 1), i, r.int(1, 9)]); for (let k = 0; k < n; k++) { const a = r.int(0, n - 1), b = r.int(0, n - 1); if (a !== b && !E.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) E.push([a, b, r.int(1, 9)]); }
    const par = [...Array(n).keys()], f = x => { while (par[x] !== x) x = par[x]; return x; }; let tot = 0; const pick = []; E.slice().sort((a, b) => a[2] - b[2]).forEach(([a, b, w]) => { const ra = f(a), rb = f(b); if (ra !== rb) { par[ra] = rb; tot += w; pick.push(names[a] + names[b]); } });
    return { q: `Undirected edges: ${E.map(e => names[e[0]] + names[e[1]] + " " + e[2]).join(", ")}. Total weight of the minimum spanning tree?`, ans: tot,
      what: "Kruskal: add edges by increasing weight unless they form a cycle.", why: "Cut property guarantees each accepted edge is safe.", how: `MST edges: ${pick.join(", ")} → ${tot}.`, trap: "Stop after V − 1 edges; skip cycle-makers." };
  } };

  G.npOps = { lvl: 2, make(r) {
    const kind = r.pick(["sat", "tsp", "exp"]);
    if (kind === "sat") { const n = r.int(5, 30); return { q: `Brute-force SAT over ${n} variables checks how many assignments in the worst case?`, ans: 2 ** n,
      what: "2ⁿ truth assignments.", why: "Exponential search space.", how: `2^${n} = ${num(2 ** n)}.`, trap: "Not n²." }; }
    if (kind === "tsp") { const n = r.int(4, 11); let f = 1; for (let i = 2; i < n; i++) f *= i; return { q: `Distinct Hamiltonian tours of the complete graph on ${n} cities (undirected, start fixed)?`, ans: f / 2,
      what: "(n − 1)!/2.", why: "Brute-force TSP is factorial.", how: `${n - 1}!/2 = ${num(f / 2)}.`, trap: "Divide by 2 for direction." }; }
    const b = r.pick([1.5, 2, 1.2]), d = r.pick([5, 10, 20]); return { q: `An O(${b}ⁿ) algorithm: by what factor does the running time grow when n increases by ${d}? (3 decimals)`, ans: b ** d, tol: .005,
      what: `${b}^${d}.`, why: "Exponential growth explodes with small size increases.", how: `${b}^${d} = ${f3(b ** d)}.`, trap: "Polynomial algorithms grow far more slowly." };
  } };
})();
