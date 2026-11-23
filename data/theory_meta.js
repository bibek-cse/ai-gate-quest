/* Theory for Meta Learning (chapters me1-me8). */
window.THEORY = window.THEORY || {};

THEORY.me1 = { mins: 10, sections: [
{ h: "Why learn to learn?", html: String.raw`
<p class="lead">A child sees one picture of a zebra and recognises zebras forever. A standard CNN needs thousands of labelled images per class. Meta-learning closes this gap by training on <b>many tasks</b> so that a <b>new task</b> can be learned from a handful of examples.</p>
<ul class="kp"><li><b>Base learning</b>: fit one task (one dataset) well.</li>
<li><b>Meta-learning</b>: improve the <i>learning procedure itself</i> using experience from a distribution of tasks $p(\mathcal T)$.</li>
<li>The payoff is <b>sample efficiency</b> on tasks that were never seen during training.</li></ul>
<div class="callout"><b>Analogy.</b> Studying 50 past GATE papers does not teach you next year's questions; it teaches you how to approach any new question quickly. That skill is the "meta" part.</div>` },
{ h: "Episodes: N-way K-shot", anim: "episode", cap: "Each episode samples N classes from the base pool, then K labelled support images and Q query images per class. Class labels are shuffled every episode, so the model must read the support set to know which label is which.", html: String.raw`
<p>Few-shot tasks are packaged as <b>episodes</b>:</p>
<ol class="steps"><li>Sample $N$ classes from the meta-training classes.</li><li>For each class take $K$ labelled <b>support</b> examples: $S=\{(x_i,y_i)\}_{i=1}^{NK}$.</li><li>Take $Q$ more examples per class as the <b>query</b> set.</li><li>Adapt on $S$, predict on the queries, compute the loss on the queries.</li></ol>
<table class="tbl"><tr><th>Quantity</th><th>Formula</th><th>5-way 1-shot, Q = 15</th></tr>
<tr><td>Support size</td><td>$N\cdot K$</td><td>5</td></tr><tr><td>Query size</td><td>$N\cdot Q$</td><td>75</td></tr><tr><td>Chance accuracy</td><td>$1/N$</td><td>20 %</td></tr></table>` },
{ h: "The meta-objective", html: String.raw`
<div class="formula">$$\min_\theta\ \mathbb E_{\mathcal T\sim p(\mathcal T)}\Big[\mathcal L^{\text{query}}_{\mathcal T}\big(\underbrace{A(\theta, S_{\mathcal T})}_{\text{adapted model}}\big)\Big]$$</div>
<ul class="kp"><li>$A$ is the adaptation algorithm: a distance rule, a few gradient steps, or a forward pass.</li>
<li>The loss is taken on <b>queries</b>, so the objective rewards generalisation after adapting, not memorising the support.</li>
<li><b>Train as you test</b>: meta-training episodes mimic the test format.</li></ul>
<table class="tbl cm"><tr><th>Family</th><th>Where fast learning happens</th><th>Example</th></tr>
<tr><td>Metric-based</td><td>A distance in a learned embedding</td><td>ProtoNets, Matching Nets</td></tr>
<tr><td>Optimisation-based</td><td>A few gradient steps from a learned init</td><td>MAML, Reptile</td></tr>
<tr><td>Model-based</td><td>Activations / memory of a network</td><td>MANN, SNAIL, in-context learning</td></tr></table>` },
{ h: "Splits and pitfalls", html: String.raw`
<ul class="kp"><li><b>Disjoint classes</b>: meta-train, meta-val and meta-test classes never overlap (mini-ImageNet 64/16/20).</li>
<li><b>Label shuffling</b>: labels $0\ldots N-1$ are reassigned at random each episode; otherwise the model memorises "class X = output 3".</li>
<li><b>Strong baselines</b>: pre-train a classifier on all base classes, then fine-tune a linear or cosine head on the support set. This is often competitive.</li>
<li><b>Transductive vs inductive</b>: using the whole query batch (e.g. its BN statistics) is a different, easier setting.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Support = N·K, query = N·Q, chance = 1/N (independent of K).</li><li>More shots → higher accuracy; more ways → lower accuracy.</li><li>Number of N-way class sets from P classes = C(P, N).</li><li>95 % CI half-width = 1.96·σ/√n over test episodes.</li><li>Loss is computed on queries, never on the support set.</li></ul>` }
] };

THEORY.me2 = { mins: 11, sections: [
{ h: "Classify by distance", html: String.raw`
<p class="lead">If an embedding $f_\theta$ places images of the same class close together, a new class can be recognised by comparing distances, with no retraining at all.</p>
<ul class="kp"><li>Training shapes the embedding using many episodes.</li><li>At test time, adaptation = embedding the support set.</li><li>The number of classes can change freely because there is no fixed output layer.</li></ul>` },
{ h: "Prototypical Networks", anim: "protonet", cap: "Support embeddings (small dots) are averaged into class prototypes (large rings). Each query (square) is assigned to its nearest prototype; the background colours show the resulting decision regions, which are linear (a Voronoi diagram). Drag the K slider to see prototypes stabilise.", html: String.raw`
<div class="formula">$$c_k=\frac1K\sum_{(x_i,y_i)\in S_k} f_\theta(x_i),\qquad p(y=k\mid x)=\frac{\exp(-d(f_\theta(x),c_k))}{\sum_j\exp(-d(f_\theta(x),c_j))}$$</div>
<ul class="kp"><li>With squared Euclidean distance, the mean is the optimal cluster representative (a Bregman divergence property).</li>
<li>Expanding $-\lVert f-c_k\rVert^2 = 2c_k^\top f-\lVert c_k\rVert^2-\lVert f\rVert^2$ shows ProtoNets are a <b>linear classifier</b> with $w_k=2c_k$, $b_k=-\lVert c_k\rVert^2$.</li>
<li>Loss: cross-entropy on query predictions, backpropagated into $f_\theta$.</li></ul>` },
{ h: "Siamese, Matching and Relation networks", html: String.raw`
<table class="tbl cm"><tr><th>Model</th><th>Comparison</th><th>Training signal</th></tr>
<tr><td>Siamese</td><td>Shared-weight twins, similarity of a pair</td><td>Same / different pairs</td></tr>
<tr><td>Matching Nets</td><td>$\hat y=\sum_i a(\hat x,x_i)y_i$, $a$ = softmax of cosines</td><td>Episodic cross-entropy</td></tr>
<tr><td>ProtoNets</td><td>Distance to class mean</td><td>Episodic cross-entropy</td></tr>
<tr><td>Relation Nets</td><td>Learned network $g([f(x),c_k])$</td><td>MSE to 0/1 match</td></tr></table>
<div class="callout">In 1-shot, ProtoNets and Matching Nets nearly coincide: one example per class means the prototype is that example.</div>` },
{ h: "Pair and triplet losses", html: String.raw`
<div class="formula">$$\mathcal L_{\text{pair}}=y\,d^2+(1-y)\max(0,m-d)^2\qquad \mathcal L_{\text{triplet}}=\max\big(0,\ d(a,p)-d(a,n)+m\big)$$</div>
<ul class="kp"><li>The margin $m$ stops negatives being pushed apart forever.</li><li>Easy triplets give zero loss → mine <b>hard</b> or <b>semi-hard</b> negatives ($d_{ap}<d_{an}<d_{ap}+m$).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Prototype = mean of support embeddings; with K = 1 it is the single example.</li><li>Probabilities = softmax of −distance.</li><li>Triplet: 0.8 − 1.1 + 0.5 = 0.2 (not zero).</li><li>Temperature changes confidence, not the argmax.</li><li>No per-task gradient steps in metric methods.</li></ul>` }
] };

THEORY.me3 = { mins: 13, sections: [
{ h: "Learn the starting point", html: String.raw`
<p class="lead">MAML (Model-Agnostic Meta-Learning) asks: which initialisation $\theta$ lets a few gradient steps solve <i>any</i> task from the distribution?</p>
<ol class="steps"><li><b>Inner loop</b> (per task $i$): $\theta_i'=\theta-\alpha\nabla_\theta\mathcal L_{S_i}(\theta)$, 1–5 steps.</li>
<li><b>Outer loop</b>: $\theta\leftarrow\theta-\beta\nabla_\theta\sum_i\mathcal L_{Q_i}(\theta_i')$.</li></ol>
<ul class="kp"><li>Model-agnostic: works for any model trained by gradient descent (classification, regression, RL).</li></ul>` },
{ h: "Watching MAML adapt", anim: "maml", cap: "Grey curves are task losses with different optima. The meta-initialisation θ (black) is trained so that one inner gradient step (coloured arrows) lands near each task's minimum. Watch (or press Reset to replay): θ moves to the point that is best after adaptation, not to any single task's optimum.", html: String.raw`
<p>The init is not the average of task solutions in general; it is the point from which <b>adaptation</b> works best. For identical quadratic tasks it does coincide with the midpoint.</p>` },
{ h: "The second-order term", html: String.raw`
<div class="formula">$$\nabla_\theta\mathcal L_Q(\theta')=\big(I-\alpha\nabla^2_\theta\mathcal L_S(\theta)\big)\,\nabla_{\theta'}\mathcal L_Q(\theta')$$</div>
<ul class="kp"><li>The Hessian appears because $\theta'$ depends on $\theta$ through a gradient.</li>
<li>Cost: memory grows with the number of unrolled inner steps.</li>
<li><b>FOMAML</b> drops the Hessian: outer gradient $\approx\nabla_{\theta'}\mathcal L_Q(\theta')$.</li>
<li><b>iMAML</b> uses the implicit function theorem on a proximal inner problem; memory is independent of steps.</li></ul>
<div class="callout"><b>Worked example.</b> $\mathcal L=(\theta-4)^2$, $\theta=1$, $\alpha=0.25$: $\theta'=1-0.25(-6)=2.5$. Meta-gradient $=\mathcal L'(2.5)(1-0.25\cdot2)=-3\times0.5=-1.5$. FOMAML gives $-3$.</div>` },
{ h: "Reptile and friends", html: String.raw`
<div class="formula">$$\text{Reptile: } \tilde\theta=\text{SGD}^k(\theta,\mathcal T),\qquad \theta\leftarrow\theta+\epsilon(\tilde\theta-\theta)$$</div>
<table class="tbl cm"><tr><th>Variant</th><th>Idea</th></tr>
<tr><td>FOMAML</td><td>Drop second-order terms</td></tr><tr><td>Reptile</td><td>Step toward adapted weights; no query split needed; k = 1 equals joint training</td></tr>
<tr><td>Meta-SGD</td><td>Learn a per-parameter inner learning rate $\alpha$</td></tr><tr><td>ANIL</td><td>Adapt only the head in the inner loop (feature reuse)</td></tr>
<tr><td>MAML++</td><td>Per-step BN, multi-step loss, learned per-layer LRs for stability</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Inner: θ' = θ − α∇L_S(θ). Outer loss on queries.</li><li>Exact gradient carries the factor (I − αH).</li><li>FOMAML / Reptile are first-order and cheaper.</li><li>Reptile with k = 1 = ordinary joint training.</li><li>ANIL: most of MAML's gain is feature reuse.</li></ul>` }
] };

THEORY.me4 = { mins: 10, sections: [
{ h: "Adaptation in a forward pass", html: String.raw`
<p class="lead">Model-based (black-box) meta-learners treat the whole support set as input. A network reads it and produces a task-specific predictor, $\phi=f_\theta(S)$, with no gradient steps at test time.</p>
<ul class="kp"><li>Fast: one forward pass per task.</li><li>Expressive: the network can learn any adaptation rule.</li><li>Risk: weaker generalisation to tasks far from training, unlike gradient descent which always "keeps learning".</li></ul>` },
{ h: "Memory-augmented networks", anim: "memread", cap: "A controller emits a key. Content addressing scores every memory row by cosine similarity, multiplies by the key strength β and applies a softmax; the read vector is the weighted sum of rows. Raise β to sharpen the focus.", html: String.raw`
<div class="formula">$$w_i=\frac{\exp(\beta\cos(k,M_i))}{\sum_j\exp(\beta\cos(k,M_j))},\qquad r=\sum_i w_iM_i$$</div>
<ul class="kp"><li><b>MANN</b> (Santoro et al.) receives $(x_t,y_{t-1})$: the label arrives one step late, so it must <b>store and bind</b>.</li>
<li>Accuracy jumps on the 2nd presentation of a class, the signature of memory-based learning.</li>
<li>LRUA writes to the least-used or most recently read slot.</li></ul>` },
{ h: "SNAIL, HyperNetworks and Neural Processes", html: String.raw`
<table class="tbl cm"><tr><th>Model</th><th>How it ingests the task</th></tr>
<tr><td>SNAIL</td><td>Temporal convolutions + causal attention over the sequence of (x, y)</td></tr>
<tr><td>HyperNetwork</td><td>Outputs the weights of the task model (e.g. 64·5 + 5 = 325 numbers for a head)</td></tr>
<tr><td>CNP</td><td>$r=\frac1n\sum h(x_i,y_i)$, then $(\mu,\sigma)=g(x^*,r)$</td></tr>
<tr><td>Attentive NP</td><td>Cross-attention from target to context (fixes CNP underfitting)</td></tr></table>
<div class="callout">Context sets are unordered, so aggregation must be <b>permutation-invariant</b> (mean, sum, attention).</div>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Read weight = softmax(β·cos); β = 2, scores (1, 0) → 0.881.</li><li>Read vector is a convex combination of rows.</li><li>CNP uses mean pooling; sum also works but scales with n.</li><li>Model-based = no test-time gradient steps.</li></ul>` }
] };

THEORY.me5 = { mins: 9, sections: [
{ h: "The standard benchmarks", html: String.raw`
<table class="tbl"><tr><th>Benchmark</th><th>Content</th><th>Split</th></tr>
<tr><td>Omniglot</td><td>1,623 characters × 20 drawers, 50 alphabets</td><td>1,200 / 423 chars (+ 90° rotations as new classes)</td></tr>
<tr><td>mini-ImageNet</td><td>100 classes × 600 images, 84×84</td><td>64 / 16 / 20</td></tr>
<tr><td>tiered-ImageNet</td><td>608 classes in 34 super-categories</td><td>Split by super-category</td></tr>
<tr><td>Meta-Dataset</td><td>10 datasets (ImageNet, Birds, Fungi, …)</td><td>Variable way/shot, held-out domains</td></tr></table>` },
{ h: "Mean ± confidence interval", anim: "cinarrow", cap: "Each dot is the accuracy of one test episode (very noisy). The running mean (line) and its 95 % interval (band) stabilise as episodes accumulate; the band shrinks like 1/√n.", html: String.raw`
<div class="formula">$$\bar a\pm1.96\,\frac{\sigma}{\sqrt n},\qquad n_{\text{needed}}=\Big(\frac{1.96\,\sigma}{h}\Big)^2$$</div>
<ul class="kp"><li>Report the mean over ≥ 600 (better 2,000+) test episodes.</li><li>10× more episodes → √10 ≈ 3.2× narrower; 100× → 10× narrower.</li></ul>` },
{ h: "Fair comparisons", html: String.raw`
<ul class="kp"><li>Same <b>backbone</b> (Conv-4 vs ResNet-12 alone can move 1-shot accuracy by 10+ points).</li>
<li>Same <b>setting</b>: inductive vs transductive, same N/K/Q.</li><li>Tune on <b>validation classes</b>, never test classes.</li>
<li>Report query accuracy; support accuracy measures fitting only.</li><li>Cross-domain tests (mini-ImageNet → CUB) reveal how features transfer.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>h = 1.96σ/√n; σ = h√n/1.96.</li><li>Episode images = N·K + N·Q.</li><li>Overlapping intervals → gap likely not significant.</li><li>Gain over chance = accuracy − 100/N.</li></ul>` }
] };

THEORY.me6 = { mins: 9, sections: [
{ h: "Overfitting at the level of tasks", anim: "metaoverfit", cap: "Meta-train accuracy (blue) and meta-test accuracy (orange) over training. With few base classes the gap opens up: the learner memorises training tasks. Increase the number of base classes or turn on task augmentation to shrink the gap.", html: String.raw`
<p class="lead">A meta-learner can overfit to its <b>training tasks</b> just as an ordinary model overfits to training examples.</p>
<ul class="kp"><li>Symptom: meta-train accuracy rises while meta-validation accuracy falls.</li><li>Cause: too few or too similar tasks.</li></ul>` },
{ h: "The memorisation problem", html: String.raw`
<p>If every task can be solved from the query input alone, the model learns a single zero-shot function and <b>ignores the support set</b>.</p>
<ul class="kp"><li>Fixed global labels make classification tasks <b>non-mutually-exclusive</b>.</li>
<li>Fix: shuffle labels per episode → $N!$ assignments for the same classes (120 for 5-way).</li>
<li>For regression (no labels to permute) use <b>meta-regularisation</b>: an information bottleneck on $\theta$.</li></ul>
<div class="callout"><b>Diagnostic.</b> Shuffle the support labels at test time. If query accuracy does not drop to chance, the model is not using the support set.</div>` },
{ h: "Task augmentation", html: String.raw`
<table class="tbl cm"><tr><th>Technique</th><th>Effect</th></tr>
<tr><td>More base classes / rotations</td><td>More distinct tasks: C(64, 5) = 7,624,512</td></tr>
<tr><td>MetaMix / MixUp</td><td>$\tilde x=\lambda x_i+(1-\lambda)x_j$, $\tilde y=\lambda y_i+(1-\lambda)y_j$</td></tr>
<tr><td>Episode-level image augmentation</td><td>More example variety</td></tr>
<tr><td>Fewer inner steps / head-only adaptation</td><td>Less overfitting to the support set</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Judge by meta-test accuracy and the gap, not train accuracy.</li><li>Shuffled labels → mutually exclusive tasks.</li><li>MixUp mixes labels with the same λ.</li><li>Number of label permutations = N!.</li></ul>` }
] };

THEORY.me7 = { mins: 11, sections: [
{ h: "Tasks are MDPs", html: String.raw`
<p class="lead">In meta-RL each task is an environment (a new goal, new dynamics, a new bandit). The agent should solve a new task in a few episodes, which means it must <b>explore efficiently</b> and then <b>exploit</b>.</p>
<div class="formula">$$G_0=\sum_{t}\gamma^t r_t,\qquad \text{Regret}(T)=T\mu^*-\sum_{t=1}^T\mathbb E[r_t]=\sum_a n_a(\mu^*-\mu_a)$$</div>` },
{ h: "Learning to explore a bandit", anim: "bandit", cap: "A new 4-armed bandit is sampled. Thompson sampling draws a value from each arm's Beta posterior (curves) and pulls the arm with the highest draw. Early pulls explore; as evidence accumulates, pulls concentrate on the best arm and cumulative regret flattens.", html: String.raw`
<ul class="kp"><li>Beta posterior after $s$ successes, $f$ failures (uniform prior): $\text{Beta}(s+1,f+1)$, mean $\frac{s+1}{s+f+2}$.</li>
<li>A meta-learned agent can do better than generic algorithms by exploiting the <b>prior</b> over tasks it learned during meta-training.</li></ul>` },
{ h: "Three approaches", html: String.raw`
<table class="tbl cm"><tr><th>Method</th><th>Mechanism</th><th>Trade-off</th></tr>
<tr><td>RL²</td><td>RNN policy; hidden state kept across episodes of one task</td><td>Fast; may fail out of distribution</td></tr>
<tr><td>MAML-RL</td><td>Policy-gradient inner steps from a learned init</td><td>Robust; noisy and slower</td></tr>
<tr><td>PEARL</td><td>Infer latent task $z$ via a product-of-Gaussians encoder; condition policy on $z$</td><td>Off-policy, sample-efficient</td></tr></table>
<div class="callout">Product of Gaussians: precisions add. $\mathcal N(0,1)\cdot\mathcal N(2,1)\propto\mathcal N(1,0.5)$.</div>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Regret counts only suboptimal pulls, weighted by the gap.</li><li>Pure exploration → linear regret.</li><li>RL² resets memory between tasks, not between episodes.</li><li>Meta-RL objective sums reward over all episodes of a trial.</li></ul>` }
] };

THEORY.me8 = { mins: 11, sections: [
{ h: "Prompting is adaptation", html: String.raw`
<p class="lead">A large language model given "great → positive, awful → negative, okay → ?" solves a task it was never fine-tuned on. The weights are frozen; the <b>context</b> does the adapting. This is model-based meta-learning at scale.</p>
<ul class="kp"><li>Pre-training on billions of documents ≈ training on a huge distribution of tiny tasks.</li><li>Zero-shot: instruction only. Few-shot: instruction + demonstrations.</li><li>ICL ability strengthens with model scale.</li></ul>` },
{ h: "Transformers learn algorithms in context", anim: "iclreg", cap: "In-context linear regression. Each new demonstration (dot) is added to the prompt; the line is the prediction a trained transformer would make, which tracks least squares. One-step gradient descent (dashed) is a cruder estimate that linear attention can implement exactly.", html: String.raw`
<div class="formula">$$\hat w_{\text{LS}}=\frac{\sum_i x_iy_i}{\sum_i x_i^2},\qquad w_1=w_0+\eta\sum_i (y_i-w_0x_i)x_i$$</div>
<ul class="kp"><li>Garg et al.: transformers trained on random linear functions match least squares on new functions.</li>
<li>von Oswald et al.: a linear self-attention layer can implement one gradient-descent step; stacked layers ≈ several steps.</li></ul>` },
{ h: "Mechanisms and quirks", html: String.raw`
<ul class="kp"><li><b>Induction heads</b>: "[A][B] … [A] → [B]" via a previous-token head plus a copying head.</li>
<li>Random demonstration labels often hurt less than expected: format, label space and input distribution carry much of the benefit.</li>
<li>Sensitive to <b>order</b> and label frequency (recency and majority bias); contextual calibration helps.</li>
<li>Limited by context length; attention cost grows as $n^2$.</li></ul>
<table class="tbl cm"><tr><th></th><th>ICL</th><th>Fine-tuning</th></tr>
<tr><td>Training cost</td><td>None</td><td>Gradient updates</td></tr><tr><td>Data it can use</td><td>What fits in context</td><td>Unlimited</td></tr><tr><td>Task switching</td><td>Instant</td><td>Retrain / adapters</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>ICL changes activations, not weights.</li><li>Least squares through origin: ŵ = Σxy/Σx².</li><li>Doubling context → 4× attention cost.</li><li>Free context ÷ tokens per demo, rounded down.</li></ul>` }
] };
