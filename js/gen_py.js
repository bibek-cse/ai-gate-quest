/* Numeric question generators for Python (each answer computed with Python semantics). */
(function () {
  const G = window.GEN = window.GEN || {};
  const fdiv = (a, b) => Math.floor(a / b), fmod = (a, b) => a - b * Math.floor(a / b);
  const pyRange = (a, b, s) => { const o = []; if (s > 0) for (let i = a; i < b; i += s) o.push(i); else for (let i = a; i > b; i += s) o.push(i); return o; };
  const sliceIdx = (n, a, b, s) => { const out = []; const norm = (x, d) => x === null ? d : x < 0 ? Math.max(x + n, s > 0 ? 0 : -1) : Math.min(x, s > 0 ? n : n - 1); const st = norm(a, s > 0 ? 0 : n - 1), en = norm(b, s > 0 ? n : -1); if (s > 0) for (let i = st; i < en; i += s) out.push(i); else for (let i = st; i > en; i += s) out.push(i); return out; };
  const code = s => "\n```\n" + s + "\n```";

  G.pyOps = { lvl: 2, make(r) {
    const kind = r.pick(["div", "mod", "bit"]);
    if (kind === "bit") { const a = r.int(3, 30), b = r.int(1, 15), op = r.pick(["&", "|", "^"]), v = op === "&" ? a & b : op === "|" ? a | b : a ^ b;
      return { q: `What does this print?${code(`print(${a} ${op} ${b})`)}`, ans: v,
        what: `${op === "&" ? "AND" : op === "|" ? "OR" : "XOR"} on binary representations.`, why: "Bitwise operators work bit by bit.", how: `${a} = ${a.toString(2)}₂, ${b} = ${b.toString(2)}₂ → ${v.toString(2)}₂ = ${v}.`, trap: "Don't confuse & with 'and'." }; }
    const a = r.int(-30, 30), b = r.pick([-7, -4, -3, 2, 3, 4, 5, 7]);
    return kind === "div" ? { q: `What does this print?${code(`print(${a} // ${b})`)}`, ans: fdiv(a, b), what: "// floors toward −∞.", why: "Python keeps a == (a // b)·b + a % b.", how: `${a}/${b} = ${(a / b).toFixed(3)} → floor ${fdiv(a, b)}.`, trap: "C and Java truncate toward zero instead." }
      : { q: `What does this print?${code(`print(${a} % ${b})`)}`, ans: fmod(a, b), what: "a % b takes the sign of b in Python.", why: "Consistent with floor division.", how: `${a} − ${b}·${fdiv(a, b)} = ${fmod(a, b)}.`, trap: "The result's sign follows the divisor." };
  } };

  G.loopOps = { lvl: 2, make(r) {
    const kind = r.pick(["sum", "count", "while"]);
    if (kind === "sum") { const a = r.int(0, 5), b = r.int(8, 25), s = r.pick([1, 2, 3, 4]), xs = pyRange(a, b, s), v = xs.reduce((p, q) => p + q, 0);
      return { q: `What does this print?${code(`print(sum(range(${a}, ${b}, ${s})))`)}`, ans: v, what: "range(start, stop, step) excludes stop.", why: "Tracing ranges is a basic skill.", how: `${xs.join(" + ")} = ${v}.`, trap: `${b} itself is never included.` }; }
    if (kind === "count") { const n = r.int(3, 7), k = r.int(1, 3); let c = 0; for (let i = 0; i < n; i++) for (let j = i; j < n; j += k) c++;
      return { q: `How many times does the body run?${code(`for i in range(${n}):\n    for j in range(i, ${n}, ${k}):\n        pass`)}`, ans: c, what: "Count inner iterations for each i.", why: "Nested loop analysis.", how: `Total = ${c}.`, trap: "The inner range starts at i, not 0." }; }
    const n = r.int(20, 200), d = r.pick([2, 3]); let x = n, c = 0; while (x > 0) { x = Math.floor(x / d); c++; }
    return { q: `What does this print?${code(`n, c = ${n}, 0\nwhile n > 0:\n    n //= ${d}\n    c += 1\nprint(c)`)}`, ans: c, what: `Repeated // ${d} until zero.`, why: "Logarithmic loops.", how: `${c} iterations (≈ ⌊log_${d} ${n}⌋ + 1).`, trap: "The step that produces 0 also counts." };
  } };

  G.funcOps = { lvl: 3, make(r) {
    const kind = r.pick(["closure", "default", "rec"]);
    if (kind === "closure") { const s = r.int(0, 5), st = r.int(1, 4), k = r.int(2, 5);
      return { q: `What does this print?${code(`def make(start, step):\n    n = start\n    def nxt():\n        nonlocal n\n        n += step\n        return n\n    return nxt\nf = make(${s}, ${st})\nfor _ in range(${k - 1}): f()\nprint(f())`)}`, ans: s + k * st, what: "The closure keeps n between calls.", why: "nonlocal rebinds the enclosing variable.", how: `${s} + ${k}·${st} = ${s + k * st}.`, trap: "Count every call, including the one inside print." }; }
    if (kind === "default") { const a = r.int(1, 6), d = r.int(2, 5), b = r.int(1, 9), c = r.int(1, 4);
      return { q: `What does this print?${code(`def f(x, y=${d}, *rest):\n    return x * y + len(rest)\nprint(f(${a}) + f(${a}, ${b}, ${"0, ".repeat(c).slice(0, -2)}))`)}`, ans: a * d + a * b + c, what: "Defaults fill missing arguments; *rest collects extras.", why: "Argument binding rules.", how: `f(${a}) = ${a * d}; f(${a}, ${b}, …) = ${a * b} + ${c} → total ${a * d + a * b + c}.`, trap: "Extra positional arguments go into rest." }; }
    const n = r.int(3, 8), k = r.int(1, 3); const f = m => m <= 0 ? 0 : m + f(m - k);
    return { q: `What does this print?${code(`def f(n):\n    return 0 if n <= 0 else n + f(n - ${k})\nprint(f(${n}))`)}`, ans: f(n), what: "Unroll the recursion until n ≤ 0.", why: "Recursive accumulation.", how: `f(${n}) = ${f(n)}.`, trap: "Stop once n ≤ 0." };
  } };

  G.collOps = { lvl: 2, make(r) {
    const kind = r.pick(["slice", "set", "dict"]);
    if (kind === "slice") { const n = r.int(6, 12), a = r.pick([null, 1, 2, -3, -5]), b = r.pick([null, -1, 5, 8, 10]), s = r.pick([1, 2, 3, -1, -2]), idx = sliceIdx(n, a, b, s), fm = x => x === null ? "" : x;
      return { q: `What is len(x[${fm(a)}:${fm(b)}:${s}]) for x = list(range(${n}))?`, ans: idx.length, what: "Slices are [start:stop:step]; stop excluded; negatives count from the end.", why: "Slicing semantics show up everywhere.", how: `Indices ${idx.join(", ") || "none"} → ${idx.length} element(s).`, trap: "With a negative step, defaults start at the end." }; }
    if (kind === "set") { const A = new Set(Array.from({ length: 6 }, () => r.int(1, 12))), B = new Set(Array.from({ length: 6 }, () => r.int(1, 12))), op = r.pick(["&", "|", "-", "^"]); const res = op === "&" ? [...A].filter(x => B.has(x)) : op === "|" ? [...new Set([...A, ...B])] : op === "-" ? [...A].filter(x => !B.has(x)) : [...A].filter(x => !B.has(x)).concat([...B].filter(x => !A.has(x)));
      return { q: `What is len(A ${op} B) for A = {${[...A].sort((p, q) => p - q).join(", ")}} and B = {${[...B].sort((p, q) => p - q).join(", ")}}?`, ans: res.length, what: "& ∩, | ∪, − difference, ^ symmetric difference.", why: "Set algebra.", how: `Result {${res.sort((p, q) => p - q).join(", ")}}.`, trap: "Sets have no duplicates." }; }
    const w = r.pick(["banana", "mississippi", "abracadabra", "bookkeeper", "programming"]), ch = r.pick([...new Set(w)]); const c = [...w].filter(x => x === ch).length;
    return { q: `What does this print?${code(`d = {}\nfor c in '${w}':\n    d[c] = d.get(c, 0) + 1\nprint(d['${ch}'])`)}`, ans: c, what: "Counting with dict.get(key, 0).", why: "Frequency maps are a core idiom.", how: `'${ch}' occurs ${c} time(s); distinct letters ${new Set(w).size}.`, trap: "get supplies 0 for unseen keys." };
  } };

  G.compOps = { lvl: 2, make(r) {
    const n = r.int(5, 15), k = r.int(2, 4), p = r.pick([1, 2]); const xs = pyRange(0, n, 1).filter(x => x % k === 0), v = xs.reduce((a, x) => a + x ** p, 0);
    if (r.pick([0, 1])) return { q: `What does this print?${code(`print(sum(x${p === 2 ? " ** 2" : ""} for x in range(${n}) if x % ${k} == 0))`)}`, ans: v, what: "Filter, transform, then sum.", why: "Generator expressions avoid building a list.", how: `x ∈ {${xs.join(", ")}} → ${v}.`, trap: "0 passes the filter." };
    const ys = pyRange(1, n, 1).map(x => x % k), s = new Set(ys); return { q: `What does this print?${code(`print(len({x % ${k} for x in range(1, ${n})}))`)}`, ans: s.size, what: "Set comprehension keeps unique values.", why: "Duplicates disappear.", how: `Remainders {${[...s].sort().join(", ")}}.`, trap: "Count distinct values, not items." };
  } };

  G.oopOps = { lvl: 2, make(r) {
    const k = r.int(2, 6), s = r.int(0, 3);
    if (r.pick([0, 1])) return { q: `What does this print?${code(`class C:\n    n = ${s}\n    def __init__(self):\n        C.n += 1\nfor _ in range(${k}):\n    C()\nprint(C.n)`)}`, ans: s + k, what: "Class attributes are shared by all instances.", why: "Counting instances.", how: `${s} + ${k} = ${s + k}.`, trap: "self.n += 1 would create per-instance copies." };
    const a = r.int(1, 5), b = r.int(1, 5); return { q: `What does this print?${code(`class A:\n    def v(self): return ${a}\n    def w(self): return self.v() * 10\nclass B(A):\n    def v(self): return ${b}\nprint(B().w())`)}`, ans: b * 10, what: "self.v() dispatches to the subclass override.", why: "Polymorphism through dynamic dispatch.", how: `B.v returns ${b} → ${b * 10}.`, trap: "A.w doesn't call A.v when self is a B." };
  } };

  G.excOps = { lvl: 2, make(r) {
    const items = Array.from({ length: r.int(4, 7) }, () => r.pick(["1", "2", "5", "x", "10", "", "3.5", "-4"])), ok = items.filter(s => /^-?\d+$/.test(s)), v = ok.reduce((a, s) => a + parseInt(s, 10), 0), bad = items.length - ok.length;
    if (r.pick([0, 1])) return { q: `What does this print?${code(`total = 0\nfor s in ${JSON.stringify(items).replace(/"/g, "'").replace(/,/g, ", ")}:\n    try:\n        total += int(s)\n    except ValueError:\n        pass\nprint(total)`)}`, ans: v, what: "int() raises ValueError for non-integer strings.", why: "Handle bad input per item and continue.", how: `Valid: ${ok.join(", ") || "none"} → ${v}.`, trap: "int('3.5') and int('') also fail." };
    return { q: `How many times does 'E' print?${code(`for s in ${JSON.stringify(items).replace(/"/g, "'").replace(/,/g, ", ")}:\n    try:\n        int(s)\n    except ValueError:\n        print('E')\n    finally:\n        pass`)}`, ans: bad, what: "Count strings that aren't valid integers.", why: "Each failure is handled separately.", how: `Invalid: ${items.filter(s => !/^-?\d+$/.test(s)).map(s => `'${s}'`).join(", ") || "none"}.`, trap: "'-4' is a valid integer." };
  } };

  G.recOps = { lvl: 3, make(r) {
    const kind = r.pick(["lin", "hanoi", "calls"]);
    if (kind === "hanoi") { const n = r.int(3, 10); return { q: `Tower of Hanoi with ${n} discs: number of moves made by the standard recursive solution?`, ans: 2 ** n - 1, what: "M(n) = 2M(n − 1) + 1.", why: "Each disc count doubles the work.", how: `2^${n} − 1 = ${2 ** n - 1}.`, trap: "Not n²." }; }
    if (kind === "calls") { const n = r.int(3, 10), C = [1, 1]; for (let i = 2; i <= n; i++) C[i] = C[i - 1] + C[i - 2] + 1; return { q: `How many calls (including the first) does naive fib(${n}) make, with fib(0) and fib(1) as base cases?`, ans: C[n], what: "C(n) = C(n − 1) + C(n − 2) + 1, C(0) = C(1) = 1.", why: "Shows the exponential cost of overlapping subproblems.", how: `C(${n}) = ${C[n]}.`, trap: `With lru_cache it would be only ${n + 1}.` }; }
    const a = r.int(1, 3), b = r.int(1, 3), n = r.int(4, 8), f = [0, 1]; for (let i = 2; i <= n; i++) f[i] = a * f[i - 1] + b * f[i - 2];
    return { q: `What does this print?${code(`def f(n):\n    if n < 2:\n        return n\n    return ${a === 1 ? "" : a + " * "}f(n - 1) + ${b === 1 ? "" : b + " * "}f(n - 2)\nprint(f(${n}))`)}`, ans: f[n], what: "Compute bottom-up from the base cases.", why: "Tracing recursion via a table avoids errors.", how: `f = ${f.join(", ")}.`, trap: "Base cases: f(0) = 0, f(1) = 1." };
  } };

  G.npOps = { lvl: 2, make(r) {
    const kind = r.pick(["size", "axis", "bcast"]);
    if (kind === "size") { const a = r.int(0, 5), b = r.int(10, 40), s = r.int(2, 6); return { q: `What does this print?${code(`import numpy as np\nprint(np.arange(${a}, ${b}, ${s}).size)`)}`, ans: pyRange(a, b, s).length, what: "arange excludes the stop value.", why: "Array sizes drive shapes downstream.", how: `⌈(${b} − ${a})/${s}⌉ = ${pyRange(a, b, s).length}.`, trap: "Like range, not linspace." }; }
    if (kind === "axis") { const R = r.int(2, 4), Cc = r.int(2, 5), ax = r.pick([0, 1]), j = r.int(0, (ax === 0 ? Cc : R) - 1); const v = ax === 0 ? Array.from({ length: R }, (_, i) => i * Cc + j).reduce((p, q) => p + q, 0) : Array.from({ length: Cc }, (_, c) => j * Cc + c).reduce((p, q) => p + q, 0);
      return { q: `What is element [${j}] of the result?${code(`import numpy as np\na = np.arange(${R * Cc}).reshape(${R}, ${Cc})\nr = a.sum(axis=${ax})`)}`, ans: v, what: `axis=${ax} collapses ${ax === 0 ? "rows (column sums)" : "columns (row sums)"}.`, why: "The summed axis disappears.", how: `${ax === 0 ? "Column" : "Row"} ${j} sums to ${v}.`, trap: "axis=0 gives one value per column." }; }
    const s1 = [r.pick([1, 3, 4]), r.pick([1, 5])], s2 = [r.pick([1, 3, 4]), r.pick([1, 5])]; const out = s1.map((x, i) => (x === 1 ? s2[i] : s2[i] === 1 || s2[i] === x ? x : -1));
    if (out.includes(-1)) return { q: `Can arrays of shapes (${s1}) and (${s2}) be broadcast together? Answer 1 for yes, 0 for no.`, ans: 0, what: "Each dimension must match or be 1.", why: "Broadcasting rules.", how: "A dimension pair differs and neither is 1 → error.", trap: "Size-1 dimensions stretch; others must be equal." };
    return { q: `Number of elements in the result of broadcasting shapes (${s1}) and (${s2})?`, ans: out[0] * out[1], what: "Result shape takes the max of each dimension pair (1 stretches).", why: "Broadcasting avoids explicit tiling.", how: `Result shape (${out}) → ${out[0] * out[1]} elements.`, trap: "Dimensions must be equal or 1." };
  } };

  G.pdOps = { lvl: 2, make(r) {
    const g = Array.from({ length: r.int(5, 8) }, () => r.pick(["a", "b", "c"])), v = g.map(() => r.int(1, 9)), key = r.pick([...new Set(g)]), agg = r.pick(["sum", "max", "count"]);
    const vals = v.filter((_, i) => g[i] === key), ans = agg === "sum" ? vals.reduce((a, b) => a + b, 0) : agg === "max" ? Math.max(...vals) : vals.length;
    return { q: `What does this print?${code(`import pandas as pd\ndf = pd.DataFrame({'g': ${JSON.stringify(g).replace(/"/g, "'").replace(/,/g, ", ")},\n                   'v': ${JSON.stringify(v).replace(/,/g, ", ")}})\nprint(df.groupby('g')['v'].${agg}()['${key}'])`)}`, ans,
      what: `groupby splits rows by g, then ${agg} is applied to v within each group.`, why: "Split-apply-combine summarises data by category.", how: `Group '${key}' values: ${vals.join(", ")} → ${ans}.`, trap: "Only rows of the selected group count." };
  } };
})();
