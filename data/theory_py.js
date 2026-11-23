/* Theory for Python (chapters py1-py10). */
window.THEORY = window.THEORY || {};

THEORY.py1 = { mins: 10, sections: [
{ h: "Names point to objects", anim: "pymem", cap: "Python variables are names bound to objects. Assignment copies the reference, not the object. Rebinding an int creates a new object; mutating a list changes the one object that both names share.", html: String.raw`
<p class="lead">Every value is an object with a <b>type</b>, an <b>identity</b> and a <b>value</b>. Variables are just labels. <code class="k">==</code> compares values; <code class="k">is</code> compares identity.</p>
<table class="tbl cm"><tr><th>Type</th><th>Mutable?</th><th>Example</th></tr><tr><td>int, float, bool, str, tuple</td><td>No</td><td>x = 5; x += 1 makes a new object</td></tr><tr><td>list, dict, set</td><td>Yes</td><td>b = a; b.append(3) changes a too</td></tr></table>` },
{ h: "Operators that trip people up", html: String.raw`
<table class="tbl cm"><tr><th>Expression</th><th>Result</th><th>Why</th></tr>
<tr><td>7 // 2, −7 // 2</td><td>3, −4</td><td>Floor toward −∞</td></tr><tr><td>−7 % 2</td><td>1</td><td>Sign of the divisor</td></tr>
<tr><td>7 / 2</td><td>3.5</td><td>True division → float</td></tr><tr><td>2 ** 3 ** 2</td><td>512</td><td>** is right-associative</td></tr>
<tr><td>round(2.5)</td><td>2</td><td>Round half to even</td></tr><tr><td>0.1 + 0.2 == 0.3</td><td>False</td><td>Binary floating point</td></tr>
<tr><td>1 &lt; 3 &gt; 2</td><td>True</td><td>Chained comparisons</td></tr><tr><td>~5</td><td>−6</td><td>~x = −x − 1</td></tr></table>
<ul class="kp"><li>Precedence: ** &gt; unary − &gt; * / // % &gt; + − &gt; comparisons &gt; not &gt; and &gt; or.</li><li>and/or return an operand: <code class="k">0 or 'x'</code> → 'x'.</li>
<li>Falsy: 0, 0.0, '', [], {}, set(), None, False.</li><li>Slicing <code class="k">s[a:b:c]</code> excludes b; <code class="k">s[::-1]</code> reverses.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>print(-7 // 2, -7 % 2) → −4 1.</li><li>'3' * 3 + '3' → '3333'.</li><li>[1] == [1] True, [1] is [1] False.</li><li>True + True = 2.</li></ul>` }
] };

THEORY.py2 = { mins: 9, sections: [
{ h: "Branching and looping", html: String.raw`
<pre class="code">for i in range(start, stop, step):   # stop excluded
    if cond: continue                  # next iteration
    if other: break                    # leave loop (skips else)
else:
    print("ran without break")</pre>
<ul class="kp"><li>Only the first true branch of if/elif/else runs.</li><li>The loop variable keeps its last value after the loop.</li>
<li><code class="k">match</code> (3.10+) does structural pattern matching with captures: <code class="k">case (x, 0):</code>.</li><li>Conditional expression: <code class="k">a if cond else b</code>.</li></ul>` },
{ h: "Tracing a loop", anim: "pyloop", cap: "A loop tracer: each step shows the current line, the variables and the output. Watch continue skip the update for even numbers and how the else clause runs only because there was no break.", html: String.raw`
<ul class="kp"><li>Write a variable table, one row per iteration: the most reliable way to trace output questions.</li><li>Nested loops: count inner iterations per outer value (triangular sums).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>range(1, 10, 3) → 1 4 7.</li><li>for/else: else skipped after break.</li><li>Collatz from 12: 9 steps.</li><li>Sum of odd 1..5 with continue = 9.</li></ul>` }
] };

THEORY.py3 = { mins: 11, sections: [
{ h: "Parameters and arguments", html: String.raw`
<pre class="code">def f(a, b=2, *args, c=5, **kw): ...
# a, b: positional-or-keyword (b has a default)
# *args: extra positionals (tuple); c: keyword-only; **kw: extra keywords (dict)</pre>
<ul class="kp"><li>Defaults are evaluated <b>once</b> at definition: never use a mutable default (use None).</li><li>Arguments are passed by object reference: mutation is visible to the caller, rebinding is not.</li></ul>` },
{ h: "Scope: LEGB", anim: "pyscope", cap: "Name lookup walks outward: Local → Enclosing → Global → Built-in. Pick a name to see where Python finds it. Assigning anywhere in a function makes the name local to that function unless declared global or nonlocal.", html: String.raw`
<ul class="kp"><li>Reading a local before assigning it → UnboundLocalError.</li><li><code class="k">global x</code> rebinds the module variable; <code class="k">nonlocal x</code> rebinds the enclosing function's variable.</li>
<li><b>Closures</b> capture variables, not values: <code class="k">[lambda: i for i in range(3)]</code> all return 2. Fix with <code class="k">lambda i=i: i</code> or a factory.</li>
<li><b>Decorators</b>: <code class="k">@d</code> above <code class="k">def f</code> means <code class="k">f = d(f)</code>.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Mutable default: f(1); f(2) → [1, 2].</li><li>Counter closure called 3 times → 3.</li><li>f(1, 2, 3, 4, c=10, d=1, e=2) → 17.</li><li>Function without return → None.</li></ul>` }
] };

THEORY.py4 = { mins: 11, sections: [
{ h: "Choosing a container", html: String.raw`
<table class="tbl cm"><tr><th></th><th>list</th><th>tuple</th><th>dict</th><th>set</th></tr>
<tr><td>Ordered</td><td>Yes</td><td>Yes</td><td>Insertion (3.7+)</td><td>No</td></tr><tr><td>Mutable</td><td>Yes</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Lookup</td><td>index O(1), search O(n)</td><td>same</td><td>key O(1) avg</td><td>member O(1) avg</td></tr><tr><td>Hashable</td><td>No</td><td>Yes (if items are)</td><td>No</td><td>No (frozenset yes)</td></tr></table>
<ul class="kp"><li>append O(1) amortised; insert(0, x) O(n) — use deque for both ends.</li><li>sorted() returns a new list; list.sort() sorts in place and returns None.</li></ul>` },
{ h: "References, copies and aliasing", anim: "pyalias", cap: "Three ways to 'copy' a nested list. Assignment shares everything, a shallow copy shares the inner lists, and deepcopy duplicates all levels. Mutate an inner list and see which names change. The last panel shows the [[0]*2]*2 trap: both rows are the same object.", html: String.raw`
<ul class="kp"><li><code class="k">a = a + [4]</code> rebinds (new list); <code class="k">a += [4]</code> mutates in place.</li><li>A tuple can contain a mutable list: the tuple's immutability is shallow.</li>
<li>Iterate over <code class="k">list(d)</code> when changing a dict's keys during the loop.</li><li><code class="k">zip(*m)</code> transposes a matrix.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>[[0]*2]*2 then a[0][0] = 1 → [[1, 0], [1, 0]].</li><li>Shallow copy shares inner lists.</li><li>{1, 2, 3} &amp; {2, 3, 4} = {2, 3}.</li><li>y = x.sort() → y is None.</li></ul>` }
] };

THEORY.py5 = { mins: 10, sections: [
{ h: "Comprehensions", html: String.raw`
<pre class="code">[f(x) for x in xs if cond(x)]          # list
{k: v for k, v in pairs}               # dict
{f(x) for x in xs}                     # set
(f(x) for x in xs)                     # generator (lazy)
[x for row in m for x in row]          # nested = nested loops, left to right</pre>` },
{ h: "Laziness and generators", anim: "pygen", cap: "A generator pipeline pulls one value at a time: the consumer asks for the next item, the generator runs until its next yield and pauses. Nothing is computed before it's needed, so an infinite counter is safe when only a few items are taken.", html: String.raw`
<ul class="kp"><li><code class="k">yield</code> pauses the function and hands a value out; <code class="k">next()</code> resumes it.</li><li>Generators are single-use: a second <code class="k">list(g)</code> is empty.</li>
<li><code class="k">return v</code> in a generator stops it (v goes into StopIteration, not the output).</li><li><code class="k">send(x)</code> resumes with x as the value of the yield expression; <code class="k">yield from</code> delegates.</li>
<li>itertools: count, islice, chain, product, groupby — all lazy.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>[x*x for x in range(5) if x % 2 == 0] → [0, 4, 16].</li><li>Generator consumed once → second list is [].</li><li>Late evaluation sees later list changes.</li><li>send(5) after next() → x = 5.</li></ul>` }
] };

THEORY.py6 = { mins: 11, sections: [
{ h: "Classes and instances", html: String.raw`
<pre class="code">class Account:
    rate = 0.03                    # class attribute (shared)
    def __init__(self, owner):
        self.owner = owner         # instance attribute
        self._bal = 0              # 'protected' by convention
    @property
    def balance(self): return self._bal
    def __str__(self): return f"{self.owner}: {self._bal}"</pre>
<ul class="kp"><li>Mutable class attributes are shared by every instance — initialise per-instance data in __init__.</li><li><code class="k">__x</code> is name-mangled to <code class="k">_Class__x</code>.</li>
<li>Dunder methods customise operators: __add__, __len__, __iter__, __eq__, __bool__.</li><li>@staticmethod: no self/cls; @classmethod: receives the class (great for alternative constructors).</li></ul>` },
{ h: "Inheritance and the MRO", anim: "pymro", cap: "Diamond inheritance D(B, C) with B and C both inheriting A. Python's C3 linearisation gives the method resolution order D → B → C → A → object; a method call searches the classes in this order and super() moves to the next class in it.", html: String.raw`
<ul class="kp"><li>self.method() dispatches on the actual object's class — even from a parent's __init__.</li><li>isinstance follows inheritance; issubclass(A, B) is one-way.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Instance counter via C.n += 1.</li><li>super().hi() in B → 'BA'.</li><li>D(B, C) MRO: D, B, C, A.</li><li>bool() prefers __bool__ over __len__.</li></ul>` }
] };

THEORY.py7 = { mins: 9, sections: [
{ h: "The full try statement", anim: "pytry", cap: "Control flow through try / except / else / finally. Toggle whether the try block raises: on success, else then finally run; on error, the matching except then finally run. finally always runs, even after a return.", html: String.raw`
<pre class="code">try:
    risky()
except (ValueError, KeyError) as e:   # first matching handler wins
    handle(e)
else:
    only_if_no_exception()
finally:
    always_cleanup()</pre>
<ul class="kp"><li>Put specific exceptions before general ones.</li><li>A <code class="k">return</code> in finally overrides earlier returns and swallows exceptions — avoid it.</li>
<li>Raising inside an except keeps the original in <code class="k">__context__</code>; <code class="k">raise X from e</code> sets <code class="k">__cause__</code>.</li><li>Custom exceptions: <code class="k">class MyErr(Exception): pass</code>.</li></ul>` },
{ h: "Files and context managers", html: String.raw`
<table class="tbl cm"><tr><th>Mode</th><th>Meaning</th></tr><tr><td>'r'</td><td>Read (default), error if missing</td></tr><tr><td>'w'</td><td>Write: create or truncate</td></tr>
<tr><td>'a'</td><td>Append</td></tr><tr><td>'x'</td><td>Create, error if exists</td></tr><tr><td>'b' / '+'</td><td>Binary / read-and-write</td></tr></table>
<ul class="kp"><li><code class="k">with open(p) as f:</code> closes the file even on errors.</li><li><code class="k">for line in f</code> streams lazily; lines keep their '\n'.</li><li>__exit__ returning True suppresses the exception.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>try returns, finally prints → 'fin try'.</li><li>No exception → else then finally: 'LF'.</li><li>return in finally wins: 2.</li><li>readlines() keeps newlines.</li></ul>` }
] };

THEORY.py8 = { mins: 9, sections: [
{ h: "Thinking recursively", html: String.raw`
<ol class="steps"><li><b>Base case</b>: solve the smallest input directly.</li><li><b>Recursive case</b>: express the answer through smaller inputs.</li><li><b>Progress</b>: every call must move toward the base case.</li></ol>
<ul class="kp"><li>Default recursion limit ≈ 1000; no tail-call optimisation in Python.</li><li><code class="k">@functools.lru_cache</code> memoises: fib(10) makes 11 calls instead of 177.</li></ul>` },
{ h: "The call stack", anim: "pystack", cap: "Each recursive call pushes a frame holding its own n. Prints before the call happen on the way down; prints after the call happen on the way back up, in reverse order. That's why p(3) prints 3 2 1 1 2 3.", html: String.raw`
<ul class="kp"><li>Naive fib calls: C(n) = C(n − 1) + C(n − 2) + 1 (fib(5) → 15).</li><li>Hanoi: 2ⁿ − 1 moves.</li>
<li>Permutations of n items: n! results; generation order follows the choice of first element.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>f(n) = f(n−1) + 2f(n−2): f(5) = 11.</li><li>g(4) with two g(n//2) calls prints 4 2 1 1 2 1 1.</li><li>perms('abc')[3] = 'bca'.</li><li>Digit sum of 1234 = 10.</li></ul>` }
] };

THEORY.py9 = { mins: 11, sections: [
{ h: "Arrays, not lists", html: String.raw`
<p class="lead">A NumPy <b>ndarray</b> is a typed, contiguous block of numbers with a <b>shape</b>. Operations run as compiled loops over whole arrays (vectorisation) — often 10–100× faster than Python loops.</p>
<table class="tbl cm"><tr><th>Operation</th><th>Result</th></tr><tr><td><code class="k">a * 2</code></td><td>element-wise (lists would repeat)</td></tr>
<tr><td><code class="k">A @ B</code></td><td>matrix product; <code class="k">A * B</code> is element-wise</td></tr><tr><td><code class="k">a.sum(axis=0)</code></td><td>collapses rows → per-column</td></tr>
<tr><td><code class="k">a[a &gt; 3]</code></td><td>boolean mask (copy)</td></tr><tr><td><code class="k">a[1:3]</code></td><td>basic slice (view: shares memory)</td></tr><tr><td><code class="k">a[[0, 2]]</code></td><td>fancy index (copy)</td></tr></table>` },
{ h: "Broadcasting", anim: "npbroadcast", cap: "Broadcasting aligns shapes from the right; any dimension of size 1 is stretched to match. A (3, 1) column plus a (1, 4) row becomes a (3, 4) grid without copying data. Incompatible sizes (neither equal nor 1) raise an error.", html: String.raw`
<ul class="kp"><li>Rule: compare trailing dimensions; each pair must be equal or contain a 1.</li><li><code class="k">x[:, None]</code> or <code class="k">x.reshape(-1, 1)</code> makes a column.</li>
<li>Centring: <code class="k">a - a.mean(axis=0)</code>. ReLU: <code class="k">np.where(x &gt; 0, x, 0)</code>.</li><li>dtype overflow wraps silently (int8: 200 → −56).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>arange(6).reshape(2, 3).sum(axis=0) → [3 5 7].</li><li>(3,1) + (1,4) → (3,4).</li><li>Slice then assign changes the original.</li><li>argsort([3, 1, 2]) → [1 2 0].</li></ul>` }
] };

THEORY.py10 = { mins: 10, sections: [
{ h: "Series and DataFrames", html: String.raw`
<p class="lead">pandas adds <b>labels</b> to NumPy arrays: a Series is a labelled column; a DataFrame is a table of Series sharing an index.</p>
<table class="tbl cm"><tr><th>Task</th><th>Code</th></tr><tr><td>Column</td><td><code class="k">df['a']</code> (Series), <code class="k">df[['a']]</code> (DataFrame)</td></tr>
<tr><td>By label / position</td><td><code class="k">df.loc[r, c]</code> (end inclusive) / <code class="k">df.iloc[i, j]</code> (end exclusive)</td></tr>
<tr><td>Filter</td><td><code class="k">df[df.x &gt; 2]</code></td></tr><tr><td>Missing</td><td><code class="k">isna().sum()</code>, <code class="k">fillna</code>, <code class="k">dropna</code></td></tr>
<tr><td>Join</td><td><code class="k">pd.merge(l, r, on='k', how='inner'|'left'|'outer')</code></td></tr><tr><td>Reshape</td><td><code class="k">pivot_table</code>, <code class="k">melt</code></td></tr></table>` },
{ h: "Split → apply → combine", anim: "pdgroupby", cap: "groupby splits rows by key, applies an aggregation to each group, and combines the results into a new table indexed by the keys. Switch the aggregation to see the combined output change.", html: String.raw`
<ul class="kp"><li>Aggregations skip NaN by default (mean of [1, NaN, 3] = 2).</li><li>Named aggregation: <code class="k">agg(total=('s', 'sum'), n=('s', 'size'))</code>.</li>
<li>Windows: <code class="k">rolling(k).mean()</code>, <code class="k">cumsum()</code>. Profiling: <code class="k">nunique</code>, <code class="k">value_counts</code>, <code class="k">drop_duplicates</code>.</li><li>Prefer vectorised column arithmetic over <code class="k">apply(axis=1)</code>.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>groupby('g')['v'].sum() for a/b example → [4, 6].</li><li>Inner vs outer merge sizes 2 and 4.</li><li>After sort_values, iloc[0] ≠ loc[first label].</li><li>loc[20:30] includes 30.</li></ul>` }
] };
