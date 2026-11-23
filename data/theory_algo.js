/* Theory for Algorithms (chapters al1-al10). */
window.THEORY = window.THEORY || {};

THEORY.al1 = { mins: 12, sections: [
{ h: "Measuring growth", html: String.raw`
<p class="lead">Asymptotic notation describes how running time grows as input size n grows, ignoring constant factors and small n.</p>
<table class="tbl cm"><tr><th>Notation</th><th>Meaning</th><th>Definition</th></tr>
<tr><td>$O(g)$</td><td>upper bound</td><td>$f\le c\,g$ for $n\ge n_0$</td></tr><tr><td>$\Omega(g)$</td><td>lower bound</td><td>$f\ge c\,g$ for $n\ge n_0$</td></tr>
<tr><td>$\Theta(g)$</td><td>tight bound</td><td>both</td></tr><tr><td>$o(g)$</td><td>strictly smaller</td><td>$f/g\to0$</td></tr></table>
<div class="formula">$$1<\log n<\sqrt n<n<n\log n<n^2<n^3<2^n<n!<n^n$$</div>
<ul class="kp"><li>Compare fast-growing functions by their logarithms: $\log(n^{\log n})=\log^2n$ vs $\log 2^{\sqrt n}=\sqrt n$.</li><li>$\log(n!)=\Theta(n\log n)$ (Stirling).</li></ul>` },
{ h: "Recursion trees", anim: "rectree", cap: "The recursion tree of T(n) = aT(n/b) + f(n). Each level shows the number of subproblems and the work done at that level. Change a, b and f: when the leaf level dominates you get case 1, equal levels give case 2 (an extra log n), and when the root dominates you get case 3.", html: String.raw`
<div class="formula">$$T(n)=aT(n/b)+f(n),\qquad n^{\log_ba}\text{ vs }f(n)$$</div>
<ol class="steps"><li>$f=O(n^{\log_ba-\epsilon})$ → $\Theta(n^{\log_ba})$ (leaves dominate).</li><li>$f=\Theta(n^{\log_ba}\log^kn)$ → $\Theta(n^{\log_ba}\log^{k+1}n)$.</li><li>$f=\Omega(n^{\log_ba+\epsilon})$ and $af(n/b)\le cf(n)$ → $\Theta(f)$.</li></ol>` },
{ h: "Beyond the Master theorem", html: String.raw`
<ul class="kp"><li>$T(n)=T(n-1)+n=\Theta(n^2)$; $T(n)=2T(n-1)+1=\Theta(2^n)$ (subtract-and-conquer).</li>
<li>Change variables: $T(n)=2T(\sqrt n)+\log n$ with $m=\log n$ → $\Theta(\log n\log\log n)$.</li><li>Uneven splits $T(n/3)+T(2n/3)+n$: each level sums to n → $\Theta(n\log n)$.</li>
<li>Loops: doubling/halving index → log; geometric inner loops (n + n/2 + …) → linear.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>8T(n/2) + n² → n³; 2T(n/2) + n² → n²; 4T(n/2) + n² → n² log n.</li><li>3T(n/4) + n log n → n log n.</li><li>Halving outer + linear inner loop → Θ(n).</li><li>Order: log(n!) < n¹⁰ < n^{log n} < 2^{√n}.</li></ul>` }
] };

THEORY.al2 = { mins: 12, sections: [
{ h: "The sorting zoo", html: String.raw`
<table class="tbl cm"><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr>
<tr><td>Insertion</td><td>n</td><td>n²</td><td>n²</td><td>1</td><td>Yes</td></tr><tr><td>Selection</td><td>n²</td><td>n²</td><td>n²</td><td>1</td><td>No</td></tr>
<tr><td>Bubble (early exit)</td><td>n</td><td>n²</td><td>n²</td><td>1</td><td>Yes</td></tr><tr><td>Merge</td><td>n log n</td><td>n log n</td><td>n log n</td><td>n</td><td>Yes</td></tr>
<tr><td>Quick</td><td>n log n</td><td>n log n</td><td>n²</td><td>log n</td><td>No</td></tr><tr><td>Heap</td><td>n log n</td><td>n log n</td><td>n log n</td><td>1</td><td>No</td></tr>
<tr><td>Counting / Radix</td><td colspan="3">n + k / d(n + b)</td><td>n + k</td><td>Yes</td></tr></table>` },
{ h: "Watch them race", anim: "sortrace", cap: "Insertion sort, merge sort and quicksort on the same random array, counting comparisons. Insertion sort's count grows with the number of inversions (≈ n²/4); the n log n algorithms pull ahead quickly. Try the nearly-sorted input to see insertion sort win.", html: String.raw`
<ul class="kp"><li>Insertion sort does exactly one shift per inversion.</li><li>Lomuto quicksort on sorted input: $n(n-1)/2$ comparisons.</li><li>Merge sort worst case on $n=2^k$: $n\log_2n-n+1$ comparisons (8 → 17).</li></ul>` },
{ h: "The Ω(n log n) lower bound", html: String.raw`
<p>A comparison sort is a binary decision tree whose leaves are the $n!$ possible orders. Its height is at least $\log_2 n! = \Theta(n\log n)$.</p>
<ul class="kp"><li>Sorting 5 elements needs ≥ ⌈log₂ 120⌉ = 7 comparisons.</li><li>Counting/radix sort escape the bound by not comparing.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>[5, 2, 4, 6, 1, 3] has 9 inversions.</li><li>Selection sort: n − 1 swaps, always n(n − 1)/2 comparisons.</li><li>Heapsort: in place, O(n log n), unstable.</li><li>Radix needs a stable inner sort.</li></ul>` }
] };

THEORY.al3 = { mins: 9, sections: [
{ h: "Halving the search space", anim: "bsearch", cap: "Binary search keeps an interval [lo, hi] that must contain the target. Each comparison with the middle element discards half. Change the target to see the path; at most ⌈log₂(n + 1)⌉ comparisons are needed.", html: String.raw`
<pre class="code">lo, hi = 0, n - 1
while lo &lt;= hi:
    mid = lo + (hi - lo) // 2
    if A[mid] == x: return mid
    if A[mid] &lt; x: lo = mid + 1
    else: hi = mid - 1
return -1</pre>
<ul class="kp"><li>Invariant: if x is present, it lies in A[lo..hi].</li><li>lower_bound / upper_bound give first ≥ x and first > x; count = difference.</li></ul>` },
{ h: "Variants", html: String.raw`
<table class="tbl cm"><tr><th>Variant</th><th>Idea</th><th>Cost</th></tr>
<tr><td>Rotated sorted array</td><td>One half is always sorted</td><td>O(log n)</td></tr><tr><td>Search on answer</td><td>Monotone feasibility predicate</td><td>O(log range × check)</td></tr>
<tr><td>Exponential search</td><td>Probe 1, 2, 4, … then binary search</td><td>O(log i)</td></tr><tr><td>Interpolation</td><td>Guess position from value</td><td>O(log log n) avg (uniform)</td></tr>
<tr><td>Ternary search</td><td>Unimodal max/min; keep 2/3</td><td>O(log₁.₅ n)</td></tr><tr><td>Peak finding</td><td>Move toward a larger neighbour</td><td>O(log n)</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>1,000 elements → ≤ 10 comparisons; k comparisons cover 2^k − 1 elements.</li><li>mid = lo + (hi − lo)/2 avoids overflow.</li><li>[1, 2, 2, 2, 3, 5]: lower 1, upper 4.</li><li>Sorted-matrix staircase search: O(n).</li></ul>` }
] };

THEORY.al4 = { mins: 11, sections: [
{ h: "Divide, conquer, combine", html: String.raw`
<p class="lead">Split a problem into independent smaller copies, solve them recursively, and combine. The cost follows the recurrence of the split.</p>
<table class="tbl cm"><tr><th>Algorithm</th><th>Recurrence</th><th>Result</th></tr>
<tr><td>Merge sort</td><td>2T(n/2) + n</td><td>n log n</td></tr><tr><td>Binary search</td><td>T(n/2) + 1</td><td>log n</td></tr>
<tr><td>Karatsuba</td><td>3T(n/2) + n</td><td>$n^{\log_23}\approx n^{1.585}$</td></tr><tr><td>Strassen</td><td>7T(n/2) + n²</td><td>$n^{\log_27}\approx n^{2.81}$</td></tr>
<tr><td>Closest pair</td><td>2T(n/2) + n</td><td>n log n</td></tr><tr><td>Quickselect (avg)</td><td>T(n/2) + n</td><td>n</td></tr></table>` },
{ h: "Merge sort, step by step", anim: "mergesort", cap: "Merge sort splits the array down to single elements, then merges sorted runs level by level. Each merge walks both runs with two pointers, so every level costs about n comparisons and there are log₂ n levels.", html: String.raw`
<ul class="kp"><li>Counting inversions: when a right-half element is output first, it forms inversions with every remaining left element.</li>
<li>Min and max together: compare in pairs → $\lceil3n/2\rceil-2$ comparisons.</li><li>Fast power: $x^n$ with (bits − 1) squarings + (ones − 1) multiplies.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Karatsuba on 8 digits: 3³ = 27 products.</li><li>Strassen on 8×8: 7³ = 343.</li><li>Inversions in [2, 4, 1, 3, 5] = 3.</li><li>T(n) = 2T(n/2) + 1 → 2n − 1.</li></ul>` }
] };

THEORY.al5 = { mins: 11, sections: [
{ h: "Locally best, globally optimal?", html: String.raw`
<p class="lead">A greedy algorithm commits to the best-looking choice and never looks back. It is correct only when the problem has the <b>greedy-choice property</b> and <b>optimal substructure</b>, proved with an exchange argument.</p>
<table class="tbl cm"><tr><th>Problem</th><th>Greedy rule</th><th>Optimal?</th></tr>
<tr><td>Activity selection</td><td>Earliest finish</td><td>Yes</td></tr><tr><td>Fractional knapsack</td><td>Highest value/weight</td><td>Yes</td></tr>
<tr><td>Huffman coding</td><td>Merge two least frequent</td><td>Yes</td></tr><tr><td>Job sequencing</td><td>Highest profit into latest free slot</td><td>Yes</td></tr>
<tr><td>0/1 knapsack</td><td>Any greedy</td><td>No (use DP)</td></tr><tr><td>Coins {1, 3, 4}, amount 6</td><td>Largest coin</td><td>No (4+1+1 vs 3+3)</td></tr></table>` },
{ h: "Activity selection", anim: "activity", cap: "Intervals sorted by finish time. The greedy scan accepts an interval (green) if it starts after the last accepted one finishes, otherwise rejects it (grey). Picking the earliest finisher always leaves the most room for the rest.", html: String.raw`
<ul class="kp"><li>Huffman: total cost = sum of all merged weights; $H\le L&lt;H+1$.</li><li>Scheduling: shortest-processing-time minimises total completion time; earliest-deadline-first minimises max lateness.</li>
<li>Interval partitioning: rooms needed = maximum overlap depth.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>CLRS 11 activities → 4.</li><li>Fractional knapsack (60,10), (100,20), (120,30), W = 50 → 240.</li><li>Huffman a5 b9 c12 d13 e16 f45 → 224 bits.</li><li>Coins {1, 7, 10}, 14: greedy 5 coins vs optimal 2.</li></ul>` }
] };

THEORY.al6 = { mins: 13, sections: [
{ h: "Remember, don't recompute", html: String.raw`
<p class="lead">Dynamic programming solves problems whose subproblems <b>overlap</b>: store each subproblem's answer once (memoisation top-down, or tabulation bottom-up). Define the <b>state</b>, the <b>recurrence</b>, the <b>base cases</b> and the <b>order</b>.</p>
<table class="tbl cm"><tr><th>Problem</th><th>Recurrence</th><th>Time</th></tr>
<tr><td>LCS</td><td>match: L[i−1][j−1] + 1; else max(L[i−1][j], L[i][j−1])</td><td>O(mn)</td></tr>
<tr><td>Edit distance</td><td>match: E[i−1][j−1]; else 1 + min(del, ins, sub)</td><td>O(mn)</td></tr>
<tr><td>0/1 knapsack</td><td>max(dp[i−1][w], v_i + dp[i−1][w − w_i])</td><td>O(nW)</td></tr>
<tr><td>Matrix chain</td><td>min_k m[i][k] + m[k+1][j] + p_{i−1}p_kp_j</td><td>O(n³)</td></tr>
<tr><td>Coin change (ways)</td><td>ways[a] += ways[a − c]</td><td>O(nN)</td></tr><tr><td>LIS</td><td>patience tails + binary search</td><td>O(n log n)</td></tr></table>` },
{ h: "Filling an LCS table", anim: "lcs", cap: "The LCS table for two strings fills row by row. A match (green) copies the diagonal plus one; a mismatch takes the larger of the cell above and the cell to the left. The bottom-right cell is the LCS length; tracing back the arrows recovers one subsequence.", html: String.raw`
<ul class="kp"><li>Knapsack DP is pseudo-polynomial: polynomial in W's value, exponential in its bit length.</li><li>Chain of n matrices has Catalan $C_{n-1}$ parenthesisations.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>A(10×30)B(30×5)C(5×60): (AB)C = 4,500.</li><li>'kitten' → 'sitting': 3.</li><li>Make 5 from {1, 2, 5}: 4 ways.</li><li>LIS of [10, 9, 2, 5, 3, 7, 101, 18] = 4.</li></ul>` }
] };

THEORY.al7 = { mins: 11, sections: [
{ h: "Two ways to explore", html: String.raw`
<table class="tbl cm"><tr><th></th><th>BFS</th><th>DFS</th></tr><tr><td>Frontier</td><td>Queue</td><td>Stack / recursion</td></tr>
<tr><td>Finds</td><td>Shortest paths (unweighted), layers, bipartiteness</td><td>Cycles, topological order, SCCs, articulation points</td></tr>
<tr><td>Time</td><td colspan="2">O(V + E) with adjacency lists</td></tr></table>` },
{ h: "BFS layers", anim: "bfs", cap: "BFS from the source expands the frontier one layer at a time using a queue. Numbers are distances (edges from the source); the highlighted edges form the BFS tree, which contains a shortest path to every vertex.", html: String.raw`
<ul class="kp"><li>DFS edge types (directed): tree, back (→ ancestor: cycle!), forward, cross. Undirected DFS has only tree and back edges.</li>
<li>Parenthesis theorem: discovery/finish intervals nest or are disjoint.</li></ul>` },
{ h: "Topological sort and SCCs", html: String.raw`
<ul class="kp"><li>Exists iff the graph is a DAG.</li><li><b>Kahn</b>: repeatedly remove an in-degree-0 vertex. <b>DFS</b>: reverse order of finishing times.</li>
<li><b>SCCs</b>: Kosaraju (DFS, transpose, DFS by decreasing finish) or Tarjan (low-links), O(V + E).</li><li>Forest components = V − E.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>5→2, 5→0, 4→0, 4→1, 2→3, 3→1: order 5, 4, 2, 3, 1, 0.</li><li>a→b, a→c has 2 topological orders.</li><li>Edge to an ancestor (nested interval) = back edge.</li><li>3×3 grid corner to corner = 4.</li></ul>` }
] };

THEORY.al8 = { mins: 12, sections: [
{ h: "Relaxation", html: String.raw`
<div class="formula">$$\text{relax}(u,v):\quad \text{if } d[u]+w(u,v)<d[v]\ \text{then } d[v]\leftarrow d[u]+w(u,v),\ \pi[v]\leftarrow u$$</div>
<table class="tbl cm"><tr><th>Algorithm</th><th>Setting</th><th>Time</th></tr>
<tr><td>BFS</td><td>Unit weights</td><td>O(V + E)</td></tr><tr><td>DAG relaxation</td><td>DAG, any weights</td><td>O(V + E)</td></tr>
<tr><td>Dijkstra</td><td>Non-negative weights</td><td>O((V + E) log V)</td></tr><tr><td>Bellman-Ford</td><td>Negative edges, detects negative cycles</td><td>O(VE)</td></tr>
<tr><td>Floyd-Warshall</td><td>All pairs</td><td>O(V³)</td></tr><tr><td>Johnson</td><td>All pairs, sparse, reweighting</td><td>O(VE log V)</td></tr></table>` },
{ h: "Dijkstra in action", anim: "dijkstra", cap: "Dijkstra repeatedly finalises the unvisited vertex with the smallest tentative distance (dark) and relaxes its outgoing edges (orange). Watch A's label improve from 4 to 3 when B is processed: a longer path with more edges can be cheaper.", html: String.raw`
<ul class="kp"><li>Fails with negative edges: a finalised vertex could later improve.</li><li>Bellman-Ford: V − 1 rounds; if round V still relaxes → negative cycle.</li>
<li>Floyd-Warshall: $d_k[i][j]=\min(d_{k-1}[i][j],\,d_{k-1}[i][k]+d_{k-1}[k][j])$; negative cycle if some $d[i][i]&lt;0$.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>S→A 4, S→B 1, B→A 2, A→C 1, B→C 5: d(C) = 4, order S, B, A, C.</li><li>Bellman-Ford V = 6, E = 9: 45 relaxations.</li><li>Adding a constant to weights can change shortest paths.</li><li>Longest path: easy in a DAG, NP-hard in general.</li></ul>` }
] };

THEORY.al9 = { mins: 10, sections: [
{ h: "Cheapest connection", html: String.raw`
<p class="lead">A minimum spanning tree connects all V vertices with V − 1 edges of minimum total weight. Two properties justify every MST algorithm.</p>
<ul class="kp"><li><b>Cut property</b>: the lightest edge crossing any cut is in some MST.</li><li><b>Cycle property</b>: the unique heaviest edge on a cycle is in no MST.</li>
<li>Distinct weights → unique MST. Adding a constant to all weights doesn't change the MST.</li><li>An MST is not a shortest-path tree in general.</li></ul>` },
{ h: "Kruskal's algorithm", anim: "kruskal", cap: "Edges are considered in increasing weight. An edge joining two different components (colours) is accepted (green) and the components merge; an edge inside one component would form a cycle and is rejected (red). After V − 1 acceptances the tree is complete.", html: String.raw`
<table class="tbl cm"><tr><th></th><th>Kruskal</th><th>Prim</th></tr><tr><td>Grows</td><td>A forest (edges by weight)</td><td>One tree (cheapest crossing edge)</td></tr>
<tr><td>Data structure</td><td>Union-find</td><td>Priority queue / array</td></tr><tr><td>Time</td><td>O(E log E)</td><td>O(E log V) heap, O(V²) array</td></tr><tr><td>Best for</td><td>Sparse graphs</td><td>Dense graphs</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>AB4 AC3 BC1 BD2 CD4 DE2 CE5 → MST 8, last edge AC.</li><li>K₆ with unit weights → MST weight 5.</li><li>A bridge is in every MST, however heavy.</li><li>Borůvka: O(log V) rounds.</li></ul>` }
] };

THEORY.al10 = { mins: 11, sections: [
{ h: "Easy to check vs easy to solve", html: String.raw`
<ul class="kp"><li><b>P</b>: decision problems solvable in polynomial time.</li><li><b>NP</b>: 'yes' answers have certificates checkable in polynomial time.</li>
<li><b>NP-hard</b>: every NP problem reduces to it. <b>NP-complete</b>: NP-hard and in NP.</li><li>Known: P ⊆ NP ⊆ PSPACE ⊆ EXP and P ≠ EXP. Open: P = NP?</li></ul>
<div class="formula">$$A\le_pB:\quad B\in P\Rightarrow A\in P,\qquad A\ \text{NP-hard}\Rightarrow B\ \text{NP-hard}$$</div>` },
{ h: "Why exponential is hopeless", anim: "growth", cap: "Running time (log scale) of polynomial and exponential algorithms as n grows. Polynomial curves bend gently; 2ⁿ and n! shoot past the age of the universe for modest n. Drag the machine speed: a 1,000× faster computer barely moves the exponential limit.", html: String.raw`
<table class="tbl cm"><tr><th>In P</th><th>NP-complete cousin</th></tr><tr><td>2-SAT</td><td>3-SAT</td></tr><tr><td>2-colouring</td><td>3-colouring</td></tr>
<tr><td>Shortest path</td><td>Longest simple path</td></tr><tr><td>Euler tour</td><td>Hamiltonian cycle</td></tr><tr><td>Min cut</td><td>Max cut</td></tr></table>` },
{ h: "Proving hardness and coping", html: String.raw`
<ol class="steps"><li>Show X ∈ NP (give a polynomial verifier).</li><li>Reduce a known NP-complete problem <b>to</b> X in polynomial time.</li></ol>
<ul class="kp"><li>Coping: approximation (vertex cover 2-approx via maximal matching), pseudo-polynomial DP (knapsack O(nW)), FPT, heuristics, special cases.</li><li>Halting problem: undecidable — NP-hard but not in NP.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Brute-force SAT, 30 variables: 2³⁰ assignments.</li><li>TSP tours on 10 cities: 9!/2 = 181,440.</li><li>Independent set S ⇔ V − S is a vertex cover.</li><li>O(1.5ⁿ): n + 10 → ×57.7.</li></ul>` }
] };
