/* Numeric question generators for Data Structures (each answer is computed by simulation). */
(function () {
  const G = window.GEN = window.GEN || {};
  const f3 = x => String(Math.round(x * 1000) / 1000);
  const shuffle = (r, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r.int(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const distinct = (r, n, lo, hi) => { const s = new Set(); while (s.size < n) s.add(r.int(lo, hi)); return [...s]; };

  G.arrayOps = { lvl: 2, make(r) {
    const kind = r.pick(["row", "col", "kadane"]);
    if (kind === "row" || kind === "col") { const R = r.int(4, 12), Cc = r.int(4, 12), w = r.pick([1, 2, 4, 8]), base = r.pick([100, 1000, 2000]), i = r.int(0, R - 1), j = r.int(0, Cc - 1);
      const off = kind === "row" ? i * Cc + j : j * R + i;
      return { q: `A[${R}][${Cc}] of ${w}-byte elements stored in ${kind === "row" ? "row" : "column"}-major order at base ${base} (0-based). Address of A[${i}][${j}]?`, ans: base + off * w,
        what: kind === "row" ? "base + (i·cols + j)·w." : "base + (j·rows + i)·w.", why: "Address arithmetic gives O(1) access.", how: `${base} + ${off}·${w} = ${base + off * w}.`, trap: kind === "row" ? "Multiply i by the number of columns." : "Multiply j by the number of rows." }; }
    const a = Array.from({ length: 8 }, () => r.int(-6, 7)); let best = -1e9, cur = 0; a.forEach(x => { cur = Math.max(x, cur + x); best = Math.max(best, cur); });
    return { q: `Maximum-sum contiguous subarray of [${a.join(", ")}] (Kadane)?`, ans: best,
      what: "cur = max(x, cur + x); best = max(best, cur).", why: "One pass, O(n).", how: `Running best gives ${best}.`, trap: "The subarray must be non-empty; if all are negative, it's the largest element." };
  } };

  G.llOps = { lvl: 2, make(r) {
    const kind = r.pick(["floyd", "rec", "pairs"]);
    if (kind === "floyd") { const mu = r.int(1, 8), lam = r.int(2, 7), meet = Math.ceil(mu / lam) * lam || lam;
      return { q: `A list has ${mu} node(s) before a cycle of length ${lam}. Floyd's slow pointer (1 step) and fast pointer (2 steps) start at the head. After how many slow steps do they first meet?`, ans: meet,
        what: "They meet at the smallest i ≥ μ with i a multiple of λ (i > 0).", why: "Fast gains one node per step inside the cycle.", how: `Smallest multiple of ${lam} that is ≥ ${mu}: ${meet}.`, trap: "Count steps, not nodes visited." }; }
    if (kind === "rec") { const n = r.int(3, 5), v = Array.from({ length: n }, () => r.int(1, 5)), k = r.pick([2, 3]); let res = 0; for (let i = n - 1; i >= 0; i--) res = v[i] + k * res;
      return { q: `f(node) = 0 if node is None else node.data + ${k}·f(node.next). For list ${v.join("→")}, f(head) = ____.`, ans: res,
        what: "Evaluate from the tail back to the head.", why: "Recursion on lists unwinds from the end.", how: `Horner-style: result = ${res}.`, trap: "Start at the last node, not the first." }; }
    const n = r.int(4, 9), v = Array.from({ length: n }, (_, i) => i + 1), o = v.slice(); for (let i = 0; i + 1 < n; i += 2) [o[i], o[i + 1]] = [o[i + 1], o[i]]; const k = r.int(1, n);
    return { q: `Pairwise-swap the data of list ${v.join("→")} (swap 1st/2nd, 3rd/4th, …). What value is at position ${k}?`, ans: o[k - 1],
      what: "Swap each adjacent pair; an odd last node stays.", why: "Classic pointer/data manipulation.", how: `Result: ${o.join("→")}.`, trap: "Pairs don't overlap." };
  } };

  const evalPost = toks => { const st = []; let mx = 0; for (const t of toks) { if (typeof t === "number") { st.push(t); mx = Math.max(mx, st.length); } else { const b = st.pop(), a = st.pop(); st.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : a / b); } } return [st[0], mx]; };
  G.stackOps = { lvl: 3, make(r) {
    const kind = r.pick(["post", "cq", "post2"]);
    if (kind === "cq") { const n = r.int(5, 12), f = r.int(0, n - 1), rr = r.int(0, n - 1);
      return { q: `Circular queue array of size ${n} (one slot kept empty), front = ${f}, rear = ${rr} (rear = next free slot). Number of elements?`, ans: ((rr - f) % n + n) % n,
        what: "count = (rear − front + n) mod n.", why: "Indices wrap around.", how: `(${rr} − ${f} + ${n}) mod ${n} = ${((rr - f) % n + n) % n}.`, trap: "Don't subtract without wrapping." }; }
    let toks; for (;;) { const a = r.int(1, 9), b = r.int(1, 9), c = r.int(1, 9), d = r.int(1, 9), o1 = r.pick(["+", "-", "*"]), o2 = r.pick(["+", "-", "*"]), o3 = r.pick(["+", "-", "*"]);
      toks = kind === "post" ? [a, b, o1, c, d, o2, o3] : [a, b, c, o1, o2, d, o3]; const [v] = evalPost(toks); if (Number.isInteger(v) && Math.abs(v) < 500) break; }
    const [v, mx] = evalPost(toks), s = toks.map(t => typeof t === "number" ? t : t === "-" ? "−" : t === "*" ? "×" : t).join(" ");
    return { q: `Evaluate the postfix expression: ${s}`, ans: v,
      what: "Push operands; on an operator pop b then a, push a op b.", why: "Postfix needs no parentheses or precedence rules.", how: `Stack evaluation gives ${v} (max depth ${mx}).`, trap: "For − the first popped value is the right operand." };
  } };

  G.hashOps = { lvl: 3, make(r) {
    const kind = r.pick(["lin", "probes", "alpha"]);
    if (kind === "alpha") { const a = r.pick([.5, .6, .75, .8, .9]); return { q: `Expected probes for an unsuccessful search with uniform open addressing at load factor α = ${a} (3 decimals)?`, ans: 1 / (1 - a), tol: .002,
      what: "≈ 1/(1 − α).", why: "Cost explodes as the table fills.", how: `1/(1 − ${a}) = ${f3(1 / (1 - a))}.`, trap: "Chaining gives ≈ 1 + α instead." }; }
    const m = r.pick([7, 10, 11, 13]), keys = distinct(r, r.int(5, Math.min(8, m - 1)), 0, 60), T = Array(m).fill(null), probes = {};
    keys.forEach(k => { let i = 0; while (T[(k + i) % m] !== null) i++; T[(k + i) % m] = k; probes[k] = i + 1; });
    const k = keys[keys.length - 1];
    if (kind === "lin") return { q: `Table size ${m}, h(k) = k mod ${m}, linear probing. Insert ${keys.join(", ")} in order. Which slot holds ${k}?`, ans: T.indexOf(k),
      what: "Probe h, h+1, h+2, … (mod m) until empty.", why: "Clusters push later keys further.", how: `Final table: [${T.map(x => x === null ? "–" : x).join(", ")}].`, trap: "Wrap around past the last slot." };
    const q = r.pick(keys); return { q: `Table size ${m}, h(k) = k mod ${m}, linear probing; keys inserted: ${keys.join(", ")}. Probes for a successful search of ${q}?`, ans: probes[q],
      what: "Count slots inspected from h(k) to the key.", why: "Search cost equals the insertion path length.", how: `Table: [${T.map(x => x === null ? "–" : x).join(", ")}]; ${q} needs ${probes[q]}.`, trap: "The first probe counts." };
  } };

  const bstInsert = (keys) => { const nodes = {}; let root = null; const depth = {}; keys.forEach(k => { if (root === null) { root = k; nodes[k] = { l: null, r: null }; depth[k] = 0; return; } let c = root, d = 0; for (;;) { d++; const n = nodes[c]; if (k < c) { if (n.l === null) { n.l = k; break; } c = n.l; } else { if (n.r === null) { n.r = k; break; } c = n.r; } } nodes[k] = { l: null, r: null }; depth[k] = d; }); return { root, nodes, depth }; };
  G.bstOps = { lvl: 3, make(r) {
    const kind = r.pick(["height", "leaves", "cat", "avl"]);
    if (kind === "cat") { const n = r.int(2, 7), C = [1]; for (let i = 1; i <= n; i++) C[i] = C[i - 1] * 2 * (2 * i - 1) / (i + 1);
      return { q: `How many structurally different BSTs can hold ${n} distinct keys?`, ans: C[n],
        what: `Catalan number C_${n} = (2n choose n)/(n + 1).`, why: "Each root choice splits keys into left and right subtrees.", how: `C_${n} = ${C[n]}.`, trap: `Not ${n}!.` }; }
    if (kind === "avl") { const h = r.int(1, 7), N = [1, 2]; for (let i = 2; i <= h; i++) N[i] = N[i - 1] + N[i - 2] + 1;
      return { q: `Minimum number of nodes in an AVL tree of height ${h} (a single node has height 0)?`, ans: N[h],
        what: "N(h) = N(h − 1) + N(h − 2) + 1, N(0) = 1, N(1) = 2.", why: "Sparsest balanced tree → height O(log n).", how: `N = ${N.slice(0, h + 1).join(", ")}.`, trap: "Height counts edges here." }; }
    const keys = distinct(r, r.int(6, 9), 1, 99), t = bstInsert(keys);
    if (kind === "height") { const h = Math.max(...Object.values(t.depth)); return { q: `Insert ${keys.join(", ")} into an empty BST. Height (edges on the longest root-to-leaf path)?`, ans: h,
      what: "Trace insertions; height = max depth.", why: "BST cost is O(height).", how: `Depths: ${keys.map(k => k + ":" + t.depth[k]).join(", ")} → ${h}.`, trap: "Count edges, not nodes." }; }
    const lv = keys.filter(k => t.nodes[k].l === null && t.nodes[k].r === null).length;
    return { q: `Insert ${keys.join(", ")} into an empty BST. How many leaves?`, ans: lv,
      what: "Leaves have no children.", why: "Shape depends on insertion order.", how: `Leaves: ${keys.filter(k => t.nodes[k].l === null && t.nodes[k].r === null).join(", ")}.`, trap: "The root is a leaf only if the tree has one node." };
  } };

  G.heapOps = { lvl: 3, make(r) {
    const kind = r.pick(["ins", "ext", "build"]);
    const siftUp = (h, i) => { while (i > 0) { const p = (i - 1) >> 1; if (h[p] >= h[i]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } };
    const siftDown = (h, i, n) => { for (;;) { let l = 2 * i + 1, rr = l + 1, b = i; if (l < n && h[l] > h[b]) b = l; if (rr < n && h[rr] > h[b]) b = rr; if (b === i) break; [h[b], h[i]] = [h[i], h[b]]; i = b; } };
    const keys = distinct(r, r.int(5, 8), 1, 99), h = [];
    if (kind === "build") { const a = keys.slice(); for (let i = (a.length >> 1) - 1; i >= 0; i--) siftDown(a, i, a.length); const k = r.int(1, a.length);
      return { q: `Bottom-up heapify [${keys.join(", ")}] into a max-heap. What is at position ${k} (1-based)?`, ans: a[k - 1],
        what: "Sift down from the last internal node back to the root.", why: "Builds a heap in O(n).", how: `Heap: [${a.join(", ")}].`, trap: "Sift each node all the way down." }; }
    keys.forEach(k => { h.push(k); siftUp(h, h.length - 1); });
    if (kind === "ins") { const k = r.int(1, h.length); return { q: `Insert ${keys.join(", ")} one by one into an empty max-heap. What is at position ${k} (1-based) of the array?`, ans: h[k - 1],
      what: "Append, then sift up while larger than the parent.", why: "Insertion order shapes the array.", how: `Heap: [${h.join(", ")}].`, trap: "It's not simply sorted order." }; }
    const a = h.slice(); a[0] = a.pop(); siftDown(a, 0, a.length); const k = r.int(1, a.length);
    return { q: `Max-heap [${h.join(", ")}]. After one extract-max, what is at position ${k} (1-based)?`, ans: a[k - 1],
      what: "Move the last element to the root, sift down to the larger child.", why: "O(log n) deletion.", how: `Result: [${a.join(", ")}].`, trap: "Swap with the larger child." };
  } };

  G.graphOps = { lvl: 2, make(r) {
    const kind = r.pick(["deg", "complete", "cyc", "tree"]);
    if (kind === "deg") { let d; do { d = Array.from({ length: r.int(4, 7) }, () => r.int(1, 5)); } while (d.reduce((a, b) => a + b, 0) % 2); return { q: `Degree sequence (${d.join(", ")}). Number of edges?`, ans: d.reduce((a, b) => a + b, 0) / 2,
      what: "Handshake lemma: Σ deg = 2E.", why: "Each edge has two endpoints.", how: `${d.reduce((a, b) => a + b, 0)}/2 = ${d.reduce((a, b) => a + b, 0) / 2}.`, trap: "Halve the sum." }; }
    if (kind === "complete") { const n = r.int(4, 30), dir = r.pick([0, 1]); return { q: `Maximum edges in a simple ${dir ? "directed" : "undirected"} graph with ${n} vertices (no self-loops)?`, ans: dir ? n * (n - 1) : n * (n - 1) / 2,
      what: dir ? "n(n − 1)." : "n(n − 1)/2.", why: "Every (ordered) pair can be an edge.", how: dir ? `${n}·${n - 1} = ${n * (n - 1)}.` : `${n}·${n - 1}/2 = ${n * (n - 1) / 2}.`, trap: "Directed doubles the count." }; }
    if (kind === "cyc") { const V = r.int(5, 20), E = r.int(V, 2 * V), c = r.pick([1, 2]); return { q: `A graph with ${V} vertices, ${E} edges and ${c} connected component(s). Cyclomatic number E − V + c?`, ans: E - V + c,
      what: "Independent cycles = E − V + c.", why: "Edges beyond a spanning forest each add a cycle.", how: `${E} − ${V} + ${c} = ${E - V + c}.`, trap: "Use the number of components." }; }
    const n = r.int(3, 7); return { q: `Number of labelled spanning trees of the complete graph K${n}?`, ans: n ** (n - 2),
      what: "Cayley's formula n^{n−2}.", why: "Counts all trees on n labelled vertices.", how: `${n}^${n - 2} = ${n ** (n - 2)}.`, trap: "Not n!." };
  } };

  G.trieOps = { lvl: 2, make(r) {
    const pool = ["tea", "ten", "to", "inn", "in", "car", "card", "care", "cat", "dog", "do", "dot", "ant", "and", "an", "bat", "bad", "ban", "be", "bed"];
    const words = shuffle(r, pool).slice(0, r.int(4, 7)), pre = new Set(); words.forEach(w => { for (let i = 1; i <= w.length; i++) pre.add(w.slice(0, i)); });
    if (r.pick([0, 1])) return { q: `Insert {${words.join(", ")}} into an empty trie. Number of nodes including the root?`, ans: pre.size + 1,
      what: "One node per distinct prefix, plus the root.", why: "Shared prefixes are stored once.", how: `${pre.size} distinct prefixes + root = ${pre.size + 1}.`, trap: "A word that is a prefix of another adds no node." };
    const p = r.pick([...pre].filter(x => x.length <= 2)), c = words.filter(w => w.startsWith(p)).length;
    return { q: `Trie with {${words.join(", ")}}. How many stored words have prefix '${p}'?`, ans: c,
      what: "Words in the subtree below the prefix node.", why: "Prefix queries are a trie's strength.", how: `${words.filter(w => w.startsWith(p)).join(", ") || "none"}.`, trap: "Include a word equal to the prefix." };
  } };

  G.ufOps = { lvl: 2, make(r) {
    const n = r.int(6, 10), m = r.int(3, 8), par = Array.from({ length: n + 1 }, (_, i) => i), find = x => { while (par[x] !== x) x = par[x]; return x; };
    const ops = []; let ok = 0; for (let i = 0; i < m; i++) { const a = r.int(1, n), b = r.int(1, n); ops.push(`(${a},${b})`); const ra = find(a), rb = find(b); if (ra !== rb) { par[rb] = ra; ok++; } }
    return { q: `Elements 1–${n}, each initially its own set. union${ops.join(", union")}. How many sets remain?`, ans: n - ok,
      what: "Sets = n − (number of unions that merged different sets).", why: "Redundant unions change nothing.", how: `${ok} successful unions → ${n} − ${ok} = ${n - ok}.`, trap: "Unions within the same set don't count." };
  } };

  G.segOps = { lvl: 2, make(r) {
    const kind = r.pick(["low", "query", "update", "nodes"]);
    if (kind === "low") { const i = r.int(2, 120); return { q: `lowbit(${i}) = i & (−i) = ____.`, ans: i & -i,
      what: "The lowest set bit of i.", why: "Determines a Fenwick node's range length.", how: `${i} = ${i.toString(2)}₂ → ${i & -i}.`, trap: "Not the highest set bit." }; }
    if (kind === "query") { const i = r.int(3, 63), path = []; let x = i; while (x > 0) { path.push(x); x -= x & -x; } return { q: `A Fenwick prefix query for i = ${i} visits how many indices?`, ans: path.length,
      what: "i −= lowbit(i) until 0: one step per set bit.", why: "Prefix sums in O(log n).", how: `${path.join(" → ")} (${path.length} indices).`, trap: "It equals the number of 1-bits in i." }; }
    if (kind === "update") { const n = r.pick([16, 32, 64]), i = r.int(1, n - 1), path = []; let x = i; while (x <= n) { path.push(x); x += x & -x; } return { q: `Fenwick point update at i = ${i} with n = ${n}. How many indices are updated?`, ans: path.length,
      what: "i += lowbit(i) while i ≤ n.", why: "Every node whose range covers i is updated.", how: `${path.join(" → ")}.`, trap: "Updates move upward; queries downward." }; }
    const k = r.int(2, 7), n = 2 ** k; return { q: `A segment tree over n = ${n} elements (perfect binary tree). Total nodes?`, ans: 2 * n - 1,
      what: "2n − 1 nodes for n a power of two.", why: "n leaves + n − 1 internal nodes.", how: `2·${n} − 1 = ${2 * n - 1}.`, trap: "4n is only a safe array size." };
  } };
})();
