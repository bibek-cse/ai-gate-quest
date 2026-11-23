/* Theory for Data Structures (chapters ds1-ds10). */
window.THEORY = window.THEORY || {};

THEORY.ds1 = { mins: 10, sections: [
{ h: "Contiguous memory", html: String.raw`
<p class="lead">An array is a block of equal-sized slots. Because the address of any slot can be computed, access is <b>O(1)</b>; because elements are packed, inserting in the middle shifts everything after it, <b>O(n)</b>.</p>
<div class="formula">$$\text{row-major: } \text{addr}(A[i][j])=B+\big((i-l_r)\,C+(j-l_c)\big)w,\qquad \text{column-major: } B+\big((j-l_c)\,R+(i-l_r)\big)w$$</div>
<ul class="kp"><li>Subtract the lower bounds first when indices don't start at 0.</li><li>Dynamic arrays double capacity → amortised O(1) append (total copies &lt; 2n).</li></ul>` },
{ h: "Two pointers", anim: "twoptr", cap: "Pair-sum on a sorted array. If the current sum is too small, the left pointer moves right; if too large, the right pointer moves left. Each step rules out one element for good, so the search ends in at most n − 1 steps.", html: String.raw`
<ul class="kp"><li>Sorted pair-sum, palindromes, reversing, merging: all O(n), O(1) space.</li>
<li><b>Sliding window</b>: grow the right end, shrink the left end while the window is invalid (e.g. longest substring without repeats).</li></ul>` },
{ h: "Prefix sums and Kadane", html: String.raw`
<div class="formula">$$P[i]=\sum_{k\le i}A[k],\quad \text{sum}(l..r)=P[r]-P[l-1];\qquad \text{Kadane: } c=\max(x,\,c+x),\ b=\max(b,c)$$</div>
<ul class="kp"><li>Number of contiguous subarrays: $n(n+1)/2$.</li><li>Lower-triangular storage: index $i(i+1)/2+j$.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>A[10][20], 4 B, base 1000: A[3][5] → 1260 (row), 1212 (column).</li><li>Kadane on the classic array → 6.</li><li>Doubling to 17 items → 31 copies.</li><li>sum(l..r) = P[r] − P[l − 1].</li></ul>` }
] };

THEORY.ds2 = { mins: 10, sections: [
{ h: "Nodes and pointers", html: String.raw`
<p class="lead">A linked list chains nodes with pointers. There is no index arithmetic, so access is O(k), but inserting or deleting next to a known node is O(1).</p>
<table class="tbl cm"><tr><th>Operation</th><th>Array</th><th>Singly list</th><th>Doubly list</th></tr>
<tr><td>Access k-th</td><td>O(1)</td><td>O(k)</td><td>O(k)</td></tr><tr><td>Insert at head</td><td>O(n)</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>Delete known node</td><td>O(n)</td><td>O(n) (need predecessor)</td><td>O(1)</td></tr><tr><td>Insert at tail (tail ptr)</td><td>O(1)*</td><td>O(1)</td><td>O(1)</td></tr></table>` },
{ h: "Reversing a list", anim: "llreverse", cap: "Iterative reversal with three pointers: save next, point curr back at prev, then advance prev and curr. After n steps every arrow is flipped and prev is the new head.", html: String.raw`
<pre class="code">prev = None; curr = head
while curr:
    nxt = curr.next; curr.next = prev
    prev = curr; curr = nxt
head = prev</pre>
<ul class="kp"><li>Sentinel (dummy) heads remove front-of-list special cases.</li><li>Merge two sorted lists in O(m + n).</li></ul>` },
{ h: "Floyd's cycle detection", html: String.raw`
<ul class="kp"><li>Slow moves 1, fast moves 2. With a tail μ and cycle λ they meet at the first step $i\ge\mu$ with $\lambda\mid i$.</li>
<li>Reset one pointer to the head; moving both by 1, they meet at the cycle start after μ steps.</li><li>Middle of a list: when fast reaches the end, slow is at the middle.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Doubly insert between two nodes: 4 pointer updates.</li><li>Pairwise swap 1→2→3→4→5 → 2→1→4→3→5.</li><li>f(n) = data + 2f(next) on 1→2→3→4 → 49.</li><li>Intersection: align lengths, then walk together.</li></ul>` }
] };

THEORY.ds3 = { mins: 11, sections: [
{ h: "LIFO and FIFO", html: String.raw`
<table class="tbl cm"><tr><th></th><th>Stack (LIFO)</th><th>Queue (FIFO)</th></tr><tr><td>Operations</td><td>push, pop, top — O(1)</td><td>enqueue, dequeue, front — O(1)</td></tr>
<tr><td>Uses</td><td>Calls, undo, brackets, DFS, expression evaluation</td><td>BFS, scheduling, buffers</td></tr></table>
<ul class="kp"><li>Circular queue: indices mod n; full when (rear + 1) mod n = front; count = (rear − front + n) mod n.</li><li>Queue from two stacks: amortised O(1).</li><li>Valid pop orders of 1..n through a stack: Catalan $C_n$.</li></ul>` },
{ h: "Evaluating postfix", anim: "stackeval", cap: "Postfix evaluation: operands are pushed; an operator pops the top two (right operand first), applies itself, and pushes the result. The final stack holds the answer.", html: String.raw`
<ul class="kp"><li>Infix → postfix (shunting-yard): output operands; push operators, popping those of higher or equal precedence (left-associative) first; parentheses group.</li>
<li>'A + B * C' → 'A B C * +'; '(A + B) * (C − D) / E' → 'A B + C D − * E /'.</li></ul>` },
{ h: "Monotonic stacks and deques", html: String.raw`
<ul class="kp"><li>Next greater element: keep a decreasing stack; each element pushed and popped once → O(n).</li>
<li>Sliding-window maximum: a deque of candidate indices → O(n).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>'6 2 3 + − 3 8 2 / + *' = 7.</li><li>Push 1..5: '4 5 1 2 3' impossible.</li><li>Size 6, front 4, rear 1 → 3 elements.</li><li>'− * 2 3 / 8 4' = 4.</li></ul>` }
] };

THEORY.ds4 = { mins: 11, sections: [
{ h: "Direct addressing, approximately", html: String.raw`
<p class="lead">A hash function maps a key to a slot so that search, insert and delete take <b>expected O(1)</b>. Collisions are inevitable (birthday paradox: 23 people → 50 % shared birthday), so a resolution strategy is needed.</p>
<div class="formula">$$\alpha=\frac nm,\qquad \text{chaining: } \Theta(1+\alpha),\qquad \text{open addressing (uniform): } \frac1{1-\alpha}\ \text{(unsuccessful)}$$</div>` },
{ h: "Linear probing", anim: "hashprobe", cap: "Keys are inserted with h(k) = k mod 10 and linear probing. A collision walks to the next free slot (orange path). Clusters of occupied slots grow and attract more collisions: primary clustering.", html: String.raw`
<table class="tbl cm"><tr><th>Scheme</th><th>Probe i</th><th>Issue</th></tr><tr><td>Linear</td><td>$(h+i)\bmod m$</td><td>Primary clustering</td></tr>
<tr><td>Quadratic</td><td>$(h+c_1i+c_2i^2)\bmod m$</td><td>Secondary clustering; may miss slots</td></tr><tr><td>Double hashing</td><td>$(h_1+i\,h_2)\bmod m$</td><td>$h_2\neq0$, coprime with m</td></tr></table>
<ul class="kp"><li>Deletion in open addressing uses tombstones.</li><li>Universal hashing defeats adversarial key choices.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>12, 18, 13, 2, 3, 23, 5, 15 (mod 10) → 15 lands in slot 9.</li><li>α = 0.8 → 5 expected probes.</li><li>Double hashing for 27, m = 13: second probe slot 7.</li><li>100 keys / 25 buckets → chains of 4.</li></ul>` }
] };

THEORY.ds5 = { mins: 12, sections: [
{ h: "Binary trees", html: String.raw`
<ul class="kp"><li>Max nodes at height h (root 0): $2^{h+1}-1$; min height for n nodes: $\lceil\log_2(n+1)\rceil-1$.</li>
<li>Any binary tree: leaves $n_0=n_2+1$. Full tree with n internal nodes has n + 1 leaves.</li>
<li>Different shapes with n nodes: Catalan $C_n=\binom{2n}{n}/(n+1)$ (1, 2, 5, 14, 42…).</li>
<li>Preorder (or postorder) + inorder determine a binary tree uniquely.</li></ul>` },
{ h: "BST insertion", anim: "bstinsert", cap: "Keys are inserted one by one. Each new key walks down from the root, going left if smaller and right if larger, until it finds an empty spot. Inserting sorted keys produces a chain of height n − 1.", html: String.raw`
<ul class="kp"><li>Search/insert/delete cost O(h); h = O(log n) if balanced, O(n) if degenerate.</li>
<li>Delete with two children: replace by the inorder successor (min of right subtree).</li><li>Inorder traversal of a BST is sorted.</li></ul>` },
{ h: "AVL trees", html: String.raw`
<ul class="kp"><li>Balance factor ∈ {−1, 0, 1} at every node.</li><li>Rotations: LL → right rotation; RR → left rotation; LR/RL → double rotation.</li>
<li>Minimum nodes: $N(h)=N(h-1)+N(h-2)+1$ with $N(0)=1,N(1)=2$ → 1, 2, 4, 7, 12, 20…</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Pre 'A B D E C F' + in 'D B E A F C' → post 'D E B F C A'.</li><li>BSTs on 4 keys: 14.</li><li>Parent of index i (1-based): ⌊i/2⌋.</li><li>20 two-child nodes → 21 leaves.</li></ul>` }
] };

THEORY.ds6 = { mins: 10, sections: [
{ h: "The heap property", html: String.raw`
<p class="lead">A binary heap is a <b>complete</b> binary tree stored in an array where every parent is ≥ its children (max-heap). The root is the maximum; nothing else is ordered.</p>
<div class="formula">$$\text{0-based: children }2i+1,\,2i+2;\ \text{parent }\lfloor(i-1)/2\rfloor\qquad\text{1-based: }2i,\,2i+1;\ \lfloor i/2\rfloor$$</div>
<table class="tbl"><tr><th>Operation</th><th>Cost</th></tr><tr><td>find-max</td><td>O(1)</td></tr><tr><td>insert (sift-up)</td><td>O(log n)</td></tr><tr><td>extract-max (sift-down)</td><td>O(log n)</td></tr><tr><td>build-heap (bottom-up)</td><td>O(n)</td></tr><tr><td>heapsort</td><td>O(n log n), in place, unstable</td></tr></table>` },
{ h: "Bottom-up heapify", anim: "heapify", cap: "Build-heap sifts down each internal node, starting from the last one and moving toward the root. Highlighted nodes are being compared; swaps push small values down. Most nodes are near the leaves and move little, so the total work is O(n).", html: String.raw`
<ul class="kp"><li>Leaves are indices ⌊n/2⌋ + 1 … n (1-based) and need no work.</li><li>k-th largest with a size-k min-heap: O(n log k).</li>
<li>In a max-heap the minimum is among the leaves; the 2nd largest is a child of the root.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Insert 10, 20, 15, 30, 40 → [40, 30, 15, 10, 20].</li><li>Extract-max → [30, 20, 15, 10].</li><li>Heapify [3, 9, 2, 1, 4, 5] → [9, 4, 5, 1, 3, 2].</li><li>Heap of 1,000: ≤ 9 comparisons per insert.</li></ul>` }
] };

THEORY.ds7 = { mins: 10, sections: [
{ h: "Vocabulary", html: String.raw`
<ul class="kp"><li>Simple undirected graph: at most $\binom n2$ edges; directed: $n(n-1)$.</li><li>Handshake: $\sum\deg v=2E$ (number of odd-degree vertices is even).</li>
<li>Tree: connected, acyclic, $n-1$ edges. Cyclomatic number $E-V+c$.</li><li>Bipartite ⇔ no odd cycle. Cayley: $K_n$ has $n^{n-2}$ spanning trees.</li></ul>` },
{ h: "Matrix vs list", anim: "adjrep", cap: "The same graph shown as a drawing, an adjacency matrix and adjacency lists. Click through vertices: the highlighted row of the matrix and the highlighted list both give its neighbours. The matrix uses V² cells; the lists use 2E entries.", html: String.raw`
<table class="tbl cm"><tr><th></th><th>Adjacency matrix</th><th>Adjacency list</th></tr><tr><td>Space</td><td>$\Theta(V^2)$</td><td>$\Theta(V+E)$</td></tr>
<tr><td>Edge (u, v)?</td><td>O(1)</td><td>O(deg u)</td></tr><tr><td>All neighbours of u</td><td>O(V)</td><td>O(deg u)</td></tr><tr><td>Best for</td><td>Dense graphs</td><td>Sparse graphs</td></tr></table>
<ul class="kp"><li>$(A^k)_{ij}$ counts walks of length k; triangles = trace$(A^3)/6$.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>(3, 3, 2, 2, 2) → 6 edges.</li><li>(3, 3, 3, 1) is not graphical.</li><li>V = 10, E = 14, connected → 5 independent cycles.</li><li>10,000² bits ≈ 12.5 MB.</li></ul>` }
] };

THEORY.ds8 = { mins: 9, sections: [
{ h: "Prefix trees", html: String.raw`
<p class="lead">A trie stores strings character by character along root-to-node paths. Every node is a prefix; an end-of-word flag marks complete words. Search and insert cost <b>O(L)</b>, independent of how many words are stored.</p>` },
{ h: "Building a trie", anim: "trie", cap: "Words are inserted one at a time. Existing prefix nodes are reused (grey) and only new characters create nodes (blue); double-ringed nodes mark the end of a word. Shared prefixes like 'te' are stored once.", html: String.raw`
<ul class="kp"><li>Nodes = distinct prefixes + 1 (root); worst case $nL$.</li><li>Per-node counters answer "how many words start with p?" in O(|p|).</li>
<li>Compressed (radix/Patricia) tries merge unary chains; suffix trees index all substrings in O(n) nodes.</li><li>Binary tries over bits → IP longest-prefix match.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>{tea, ten, to, inn, in} → 9 nodes.</li><li>Prefix 'car' in {car, card, care, cat, dog} → 3.</li><li>Lexicographic order = DFS with sorted children.</li><li>Radix root edge for {romane, romanus, romulus} = 'rom'.</li></ul>` }
] };

THEORY.ds9 = { mins: 9, sections: [
{ h: "Maintaining a partition", html: String.raw`
<p class="lead">Union-find keeps elements in disjoint sets, each a rooted tree whose root names the set. <b>find</b> follows parents to the root; <b>union</b> links two roots.</p>
<ul class="kp"><li>Union by rank/size → height ≤ log₂ n (rank r needs ≥ 2^r nodes).</li><li>Path compression → every visited node points at the root.</li>
<li>Both → amortised $O(\alpha(n))$, with $\alpha(n)\le4$ in practice.</li></ul>` },
{ h: "Unions and path compression", anim: "unionfind", cap: "Union operations link roots (smaller tree under larger). A find on a deep node then compresses the path: every node on it is re-pointed directly at the root, flattening the tree for later queries.", html: String.raw`
<ul class="kp"><li>Components of a graph = V − successful unions.</li><li>Kruskal: sort edges, accept if find(u) ≠ find(v) → V − 1 edges.</li><li>Cannot split sets.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>6 elements, 5 merging unions → 1 set.</li><li>8 vertices, 5 effective edges → 3 components.</li><li>Rank 3 needs ≥ 8 elements.</li><li>α(n) ≤ 4.</li></ul>` }
] };

THEORY.ds10 = { mins: 11, sections: [
{ h: "Range queries with updates", html: String.raw`
<table class="tbl cm"><tr><th>Structure</th><th>Query</th><th>Update</th><th>Notes</th></tr>
<tr><td>Prefix sums</td><td>O(1)</td><td>O(n)</td><td>Static</td></tr><tr><td>Sparse table</td><td>O(1) (min/max)</td><td>—</td><td>O(n log n) build, static</td></tr>
<tr><td>Fenwick tree</td><td>O(log n)</td><td>O(log n)</td><td>Invertible ops (sum, xor)</td></tr><tr><td>Segment tree</td><td>O(log n)</td><td>O(log n)</td><td>Any associative op; lazy range updates</td></tr></table>` },
{ h: "Fenwick (binary indexed) tree", anim: "fenwick", cap: "Each index i of a Fenwick tree covers the range (i − lowbit(i), i]. A prefix query for i hops downward by clearing the lowest set bit (blue); a point update hops upward by adding it (orange). Both touch O(log n) cells.", html: String.raw`
<pre class="code">def update(i, x):
    while i &lt;= n: T[i] += x; i += i &amp; -i
def query(i):
    s = 0
    while i &gt; 0: s += T[i]; i -= i &amp; -i
    return s</pre>
<ul class="kp"><li>Range update + point query: Fenwick over the difference array (D[l] += x, D[r+1] −= x).</li></ul>` },
{ h: "Segment trees", html: String.raw`
<ul class="kp"><li>Node [l, r] stores combine of its halves; n = 2^k → 2n − 1 nodes (array of 4n is safe).</li>
<li>Build O(n); query visits ≤ 4 nodes per level; lazy propagation defers range updates.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>lowbit(12) = 4, lowbit(40) = 8.</li><li>Query 13 → 13, 12, 8.</li><li>Update 5 (n = 16) → 5, 6, 8, 16.</li><li>Segment tree on 8 elements → 15 nodes.</li></ul>` }
] };
