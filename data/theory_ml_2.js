/* Theory for Machine Learning chapters 6-10. Same format as theory_ml_1.js. */
window.THEORY = window.THEORY || {};
THEORY.ml6 = { mins: 12, sections: [
{ h: "The maximum-margin idea", html: String.raw`
<p class="lead">If two classes can be separated by a line, infinitely many lines do it. A support vector machine (SVM) picks the one with the widest empty <b>street</b> between the classes, because a wide margin leaves room for new points to fall on the correct side.</p>
<div class="formula">$$\text{distance of } x \text{ to } w^\top x+b=0:\quad \frac{|w^\top x+b|}{\|w\|}$$</div>
<p>Scale $w,b$ so that the closest points satisfy $y_i(w^\top x_i+b)=1$. The margin width is then $2/\|w\|$, and maximising it is the same as:</p>
<div class="formula">$$\min_{w,b}\ \tfrac12\|w\|^2\quad\text{s.t.}\quad y_i(w^\top x_i+b)\ge 1\ \ \forall i$$</div>
<p>This is a convex quadratic program with a unique solution.</p>` },
{ h: "Finding the widest street", anim: "svm", cap: "The demo rotates the street's direction. For each angle it places the street midway between the classes and measures its width. The widest one is kept; circled points are the support vectors that touch its edges.", html: String.raw`
<ul class="kp"><li>Only the points on the margin, the <b>support vectors</b>, define the solution. Delete any other point and the boundary does not move.</li>
<li>That is why SVMs are robust to points far from the boundary, and why prediction depends only on the support vectors.</li></ul>` },
{ h: "Soft margin and the hinge loss", html: String.raw`
<p>Real data overlap, so we allow violations through slack variables $\xi_i\ge0$:</p>
<div class="formula">$$\min\ \tfrac12\|w\|^2+C\sum_i\xi_i\ \ \text{s.t.}\ y_i(w^\top x_i+b)\ge1-\xi_i \iff \min\ \lambda\|w\|^2+\sum_i\max\big(0,\,1-y_if(x_i)\big)$$</div>
<ul class="kp"><li>Large $C$: violations are expensive, giving a narrow margin and a risk of overfitting. Small $C$: a wider margin and more bias.</li>
<li><b>Hinge loss</b> $\max(0,1-yf)$ is zero only when a point is correct <i>and</i> at least 1 unit from the boundary. For $y=+1, f=0.3$ the loss is 0.7.</li></ul>` },
{ h: "The dual and the kernel trick", html: String.raw`
<div class="formula">$$\max_\alpha \sum_i\alpha_i-\tfrac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\,K(x_i,x_j)\quad \text{s.t. } 0\le\alpha_i\le C,\ \sum_i\alpha_iy_i=0,\qquad f(x)=\sum_i\alpha_iy_iK(x_i,x)+b$$</div>
<ul class="kp"><li>The data appear only through inner products $K(x_i,x_j)=\phi(x_i)^\top\phi(x_j)$. Swap in a kernel and you get a non-linear SVM <i>without ever computing</i> $\phi$.</li>
<li>KKT conditions: $\alpha_i>0$ only for support vectors. $\alpha_i=C$ marks margin violators.</li>
<li>Kernels: linear $x^\top z$; polynomial $(x^\top z+1)^p$ (2-D input with $p=2$ gives 6 features); RBF $e^{-\gamma\|x-z\|^2}$, where large $\gamma$ means very local bumps and overfitting.</li>
<li><b>Mercer</b>: $K$ is valid iff every Gram matrix is symmetric positive semidefinite.</li></ul>` },
{ h: "Linear discriminant analysis (Fisher LDA)", html: String.raw`
<p>LDA looks for a projection where the class means are far apart <i>and</i> each class is tight:</p>
<div class="formula">$$J(w)=\frac{w^\top S_B\,w}{w^\top S_W\,w},\qquad \text{two classes: } w\propto S_W^{-1}(\mu_1-\mu_2)$$</div>
<ul class="kp"><li>As a classifier it assumes Gaussian classes with a <b>shared covariance</b>, which gives a linear boundary. Different covariances give QDA (quadratic).</li>
<li>It yields at most $K-1$ discriminant directions, because $\operatorname{rank}(S_B)\le K-1$.</li>
<li>LDA is <b>supervised</b> (it uses labels). PCA is unsupervised (it maximises total variance).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Margin $=2/\|w\|$. With $w=(3,4)$ the margin is 0.4.</li>
<li>Support vectors lie on the margin. Removing a non-SV changes nothing.</li>
<li>Large C means a narrow margin and overfitting. Large γ (RBF) means overfitting.</li>
<li>Hinge loss $=\max(0,1-yf)$.</li>
<li>Kernels must give PSD Gram matrices. The polynomial feature count is $\binom{d+p}{p}$.</li>
<li>LDA: $S_W^{-1}(\mu_1-\mu_2)$, shared covariance, at most K−1 directions.</li></ul>` }
]};

THEORY.ml7 = { mins: 12, sections: [
{ h: "How a decision tree predicts", html: String.raw`
<p class="lead">A tree asks a chain of simple questions such as "is $x_2 < 3.5$?" and each answer sends the point down one branch. Every leaf is a box in feature space with one prediction: the majority class (classification) or the mean $y$ (regression).</p>
<ul class="kp"><li>The splits are axis-aligned, so the boundaries are made of rectangles.</li>
<li>Trees need no feature scaling, handle mixed data types, and are easy to explain.</li></ul>` },
{ h: "Impurity and information gain", html: String.raw`
<div class="formula">$$H=-\sum_k p_k\log_2p_k\qquad \text{Gini}=1-\sum_k p_k^2\qquad IG=H(\text{parent})-\sum_{c}\frac{n_c}{n}H(c)$$</div>
<table class="tbl"><tr><th>Node</th><th>Entropy</th><th>Gini</th></tr>
<tr><td>pure (4, 0)</td><td>0</td><td>0</td></tr><tr><td>(3, 1)</td><td>0.811</td><td>0.375</td></tr><tr><td>(2, 2)</td><td>1</td><td>0.5</td></tr></table>
<ul class="kp"><li>Choose the split with the largest drop in impurity. ID3/C4.5 use entropy, CART uses Gini, and regression trees use variance reduction.</li>
<li>Information gain favours attributes with many values (an ID column gets a perfect score), so C4.5 uses the <b>gain ratio</b> $IG/\text{SplitInfo}$.</li></ul>` },
{ h: "Growing a tree, step by step", anim: "tree", cap: "For each node the scan line tries every threshold on each feature and records the weighted Gini. The best split is kept, and the process repeats on each child until depth 3 or a pure node.", html: String.raw`
<ol class="steps"><li>Start with all the data at the root.</li><li>For every feature and every candidate threshold, compute the weighted child impurity.</li><li>Pick the best split and divide the data.</li><li>Recurse on each child until it is pure, too small, or at the maximum depth.</li></ol>
<p>The choice is <b>greedy</b>: each split is locally best. Finding the globally optimal tree is NP-hard.</p>` },
{ h: "Overfitting and pruning", html: String.raw`
<ul class="kp"><li>An unlimited tree reaches zero training error (unless identical points have conflicting labels), which means very high variance.</li>
<li><b>Pre-pruning</b>: maximum depth, minimum samples per leaf, minimum impurity decrease.</li>
<li><b>Post-pruning</b> (cost-complexity): minimise error $+\ \alpha\cdot|\text{leaves}|$, choosing $\alpha$ by CV.</li></ul>` },
{ h: "Ensembles: bagging, random forests, boosting", html: String.raw`
<div class="formula">$$\operatorname{Var}\Big(\frac1B\sum_{b=1}^B \hat f_b\Big)=\rho\sigma^2+\frac{1-\rho}{B}\sigma^2$$</div>
<ul class="kp"><li><b>Bagging</b>: train B trees on bootstrap samples and average or vote. This mainly cuts <b>variance</b>. Each bootstrap leaves out about $e^{-1}\approx36.8\%$ of the points, the <b>out-of-bag</b> set, which acts as a free validation set.</li>
<li><b>Random forest</b> = bagging + a random subset of features at each split (about $\sqrt d$). This lowers the correlation $\rho$ between trees.</li>
<li><b>Boosting</b>: trains learners <i>sequentially</i>, each fixing the previous ones' errors, so it reduces <b>bias</b>. AdaBoost weights a learner by $\alpha=\tfrac12\ln\frac{1-\varepsilon}{\varepsilon}$ (so $\varepsilon=0.5$ gives $\alpha=0$). Gradient boosting fits each new tree to the residuals.</li></ul>` },
{ h: "Worked example + GATE checklist", html: String.raw`
<p>The parent is (8+, 8−), so $H=1$. The children are (6+, 2−) and (2+, 6−), each with $H(0.75)=0.811$. Then $IG=1-0.811=0.189$ bits.</p>
<ul class="check"><li>A pure node has entropy 0 and Gini 0. A 50/50 node has entropy 1 bit and Gini 0.5.</li>
<li>IG is parent minus the <b>weighted</b> child impurity.</li>
<li>Bagging reduces variance. Boosting reduces bias. A random forest adds feature subsampling.</li>
<li>OOB ≈ 36.8 %. AdaBoost: ε = 0.5 gives α = 0.</li>
<li>A deep tree has zero training error and overfits, so prune it.</li></ul>` }
]};

THEORY.ml8 = { mins: 13, sections: [
{ h: "From the perceptron to networks", html: String.raw`
<div class="formula">$$\hat y=\operatorname{sign}(w^\top x+b),\qquad \text{on a mistake: } w\leftarrow w+\eta\,y\,x$$</div>
<ul class="kp"><li>The perceptron draws one hyperplane. It converges if the data are linearly separable (Novikoff's theorem).</li>
<li>It <b>cannot learn XOR</b> (Minsky & Papert, 1969). One hidden layer of 2 units can.</li></ul>` },
{ h: "Multi-layer perceptrons", html: String.raw`
<div class="formula">$$h^{(1)}=g\big(W^{(1)}x+b^{(1)}\big),\quad \hat y=f\big(W^{(2)}h^{(1)}+b^{(2)}\big)$$</div>
<table class="tbl"><tr><th>Activation</th><th>Formula</th><th>Derivative</th><th>Note</th></tr>
<tr><td>sigmoid</td><td>$1/(1+e^{-z})$</td><td>$\sigma(1-\sigma)\le0.25$</td><td>saturates</td></tr>
<tr><td>tanh</td><td>$\tanh z$</td><td>$1-\tanh^2z$</td><td>zero-centred</td></tr>
<tr><td>ReLU</td><td>$\max(0,z)$</td><td>1 if z &gt; 0, else 0</td><td>default; can "die"</td></tr></table>
<ul class="kp"><li>Without non-linear activations, the layers collapse into one linear map: $W_2W_1x$.</li>
<li><b>Universal approximation</b>: one hidden layer with enough units can approximate any continuous function on a compact set. It says nothing about how to learn it.</li>
<li>A dense layer $d_{in}\to d_{out}$ has $d_{in}d_{out}+d_{out}$ parameters. For 10→20→5 that is 220 + 105 = 325.</li></ul>` },
{ h: "Forward pass and backpropagation", anim: "mlp", cap: "Step through one training step of a 2-3-1 network: inputs flow forward (blue), the loss is computed, then gradients flow backward (red) and weights update.", html: String.raw`
<p><b>Backpropagation</b> is the chain rule applied layer by layer, from the output back to the input:</p>
<div class="formula">$$\delta^{(L)}=\frac{\partial L}{\partial z^{(L)}},\qquad \delta^{(l)}=\big(W^{(l+1)\top}\delta^{(l+1)}\big)\odot g'(z^{(l)}),\qquad \frac{\partial L}{\partial W^{(l)}}=\delta^{(l)}\,a^{(l-1)\top}$$</div>
<ul class="kp"><li>Sigmoid output + cross-entropy gives $\partial L/\partial z=\hat y-y$. Softmax + CE gives the same form.</li>
<li>One backward pass gives <i>all</i> gradients at about the cost of one forward pass.</li></ul>` },
{ h: "Training well", html: String.raw`
<ul class="kp"><li><b>Vanishing gradients</b>: a product of many $\sigma'\le0.25$ factors goes to zero. Fixes: ReLU, He/Xavier initialisation, batch norm, residual connections.</li>
<li><b>Zero initialisation</b> leaves every hidden unit identical (symmetry), so use small random weights.</li>
<li><b>Regularisation</b>: weight decay, dropout (randomly zero units while training), early stopping, data augmentation.</li>
<li>Optimisers: SGD with momentum, Adam. One <b>epoch</b> is one full pass over the data.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>The perceptron update on a mistake is $w\leftarrow w+\eta yx$. It can't do XOR, but a 2-2-1 MLP can.</li>
<li>Parameter count = Σ(d_in·d_out + d_out).</li>
<li>ReLU(−0.5) = 0. softmax([0, ln 3]) = [0.25, 0.75].</li>
<li>Sigmoid + BCE gives ∂L/∂z = ŷ − y.</li>
<li>Non-linearity is essential: stacked linear layers are still linear.</li></ul>` }
]};

THEORY.ml9 = { mins: 11, sections: [
{ h: "What clustering does", html: String.raw`
<p class="lead">Clustering groups unlabeled points so that points in the same group are similar. There are no right answers to learn from, so the <b>distance measure</b> and the algorithm's assumptions define what "similar" means.</p>
<ul class="kp"><li><b>Partitional</b> methods (k-means, k-medoids) give one flat split into k groups.</li><li><b>Hierarchical</b> methods give a tree of nested merges (a dendrogram).</li><li><b>Density-based</b> methods (DBSCAN) find arbitrary shapes and flag noise.</li></ul>` },
{ h: "k-means, step by step", anim: "kmeans", cap: "Assign: every point joins its nearest centroid. Update: every centroid moves to the mean of its points. The within-cluster sum of squares (WCSS) never increases.", html: String.raw`
<div class="formula">$$J=\sum_{k=1}^K\sum_{x\in C_k}\|x-\mu_k\|^2,\qquad \mu_k=\frac{1}{|C_k|}\sum_{x\in C_k}x$$</div>
<ol class="steps"><li>Choose k initial centroids.</li><li><b>Assign</b> each point to its nearest centroid.</li><li><b>Update</b> each centroid to the mean of its assigned points.</li><li>Repeat until the assignments stop changing.</li></ol>
<p>Both steps can only lower $J$, and there are finitely many partitions, so k-means always converges, but only to a <b>local</b> minimum. Each iteration costs $O(nkd)$.</p>` },
{ h: "Initialisation, choosing k, limitations", html: String.raw`
<ul class="kp"><li><b>k-means++</b>: choose each new seed with probability $\propto D(x)^2$, the squared distance to the nearest seed already chosen. Also run several restarts.</li>
<li>Choose k with the <b>elbow</b> of WCSS against k, or the <b>silhouette</b> $s=\frac{b-a}{\max(a,b)}\in[-1,1]$.</li>
<li>k-means assumes roughly spherical clusters of similar size, and it is sensitive to outliers and to feature scale.</li>
<li><b>k-medoids</b> (PAM) uses actual data points as centres. It is robust to outliers and works with any distance.</li></ul>` },
{ h: "Hierarchical clustering", html: String.raw`
<p><b>Agglomerative</b> (bottom-up): start with $n$ singletons and repeatedly merge the closest pair. That takes $n-1$ merges. <b>Divisive</b> clustering is top-down splitting.</p>
<table class="tbl"><tr><th>Linkage</th><th>Cluster distance</th><th>Behaviour</th></tr>
<tr><td>Single</td><td>$\min_{a\in A,b\in B}d(a,b)$</td><td>chaining, finds long shapes</td></tr>
<tr><td>Complete</td><td>$\max_{a,b}d(a,b)$</td><td>compact clusters, sensitive to outliers</td></tr>
<tr><td>Average</td><td>mean of all pairwise distances</td><td>a compromise</td></tr></table>
<p>Cut the dendrogram at a chosen height to get a flat clustering.</p>` },
{ h: "Worked examples + GATE checklist", html: String.raw`
<p><b>k-means:</b> points {1, 2, 3, 10, 11, 12}, seeds 1 and 12. Assignment gives {1, 2, 3} and {10, 11, 12}, so the means are 2 and 11. The next pass changes nothing, so it has converged.</p>
<p><b>Single linkage:</b> A=0, B=1, C=4, D=5. Merge AB at 1 and CD at 1, then {AB, CD} at min distance 3. (Complete linkage would join them at 5.)</p>
<ul class="check"><li>k-means minimises WCSS and the centroid is the mean. It converges to a local optimum.</li>
<li>k-means++ seeds with probability $\propto D^2$. Choose k by the elbow or silhouette.</li>
<li>Single = min, complete = max, average = mean. n points take n − 1 merges.</li>
<li>Silhouette lies in [−1, 1].</li></ul>` }
]};

THEORY.ml10 = { mins: 11, sections: [
{ h: "Why reduce dimensions", html: String.raw`
<p class="lead">Real data often have many correlated features. PCA finds a few new axes, the <b>principal components</b>, that capture most of the variation, so we can compress, denoise, visualise, and speed up later models.</p>` },
{ h: "Maximising projected variance", anim: "pca", cap: "A direction u rotates; every point is projected onto it (small ticks). The variance of the projections is plotted below. Its maximum is the first principal component; the second is perpendicular.", html: String.raw`
<p>For centred data with covariance $S=\frac{1}{n-1}X_c^\top X_c$, the variance of the projection on a unit vector $u$ is $u^\top Su$. Maximise it subject to $\|u\|=1$ (using a Lagrange multiplier):</p>
<div class="formula">$$\max_{\|u\|=1}u^\top Su\;\Rightarrow\; Su=\lambda u,\qquad \text{variance along }u=\lambda$$</div>
<p>So PC1 is the eigenvector with the <b>largest eigenvalue</b>. PC2 is the best direction orthogonal to PC1, and so on. $S$ is symmetric PSD, so the eigenvalues are real and $\ge0$ and the eigenvectors are orthogonal.</p>` },
{ h: "The algorithm", html: String.raw`
<ol class="steps"><li><b>Centre</b> each feature (subtract its mean). <b>Standardise</b> too if the units differ.</li>
<li>Compute the covariance $S$ ($d\times d$).</li>
<li>Eigen-decompose and sort by $\lambda_1\ge\lambda_2\ge\dots$.</li>
<li>Keep the top $k$ eigenvectors $V_k$, and project: $Z=X_cV_k$.</li></ol>
<p><b>SVD route:</b> $X_c=U\Sigma V^\top$. The columns of $V$ are the PCs, $\lambda_i=\sigma_i^2/(n-1)$, and the scores are $U\Sigma$. This is more stable numerically.</p>` },
{ h: "How many components?", html: String.raw`
<div class="formula">$$\text{explained ratio}(k)=\frac{\lambda_1+\dots+\lambda_k}{\sum_i\lambda_i},\qquad \text{reconstruction error}=\sum_{i>k}\lambda_i$$</div>
<ul class="kp"><li>Keep enough components for about 90–95 % of the variance, or look for the elbow in the scree plot.</li>
<li>$n$ centred points span at most $n-1$ dimensions, so at most $\min(n-1,d)$ eigenvalues are non-zero.</li>
<li><b>Whitening</b> divides each score by $\sqrt{\lambda_i}$, giving identity covariance.</li></ul>` },
{ h: "PCA vs LDA, and limitations", html: String.raw`
<ul class="kp"><li>PCA is <b>unsupervised</b> (maximum variance). LDA is <b>supervised</b> (maximum class separation). The highest-variance direction can be useless for classification.</li>
<li>PCA is linear. For curved structure, use kernel PCA, t-SNE, UMAP or autoencoders.</li>
<li>It is sensitive to scale: unstandardised features in mm dominate those in m.</li>
<li>Components are orthogonal and the scores uncorrelated, but not necessarily <i>independent</i> (that would be ICA).</li></ul>` },
{ h: "Worked example + GATE checklist", html: String.raw`
<p>$S=\begin{bmatrix}2&1\\1&2\end{bmatrix}$ has eigenvalues $3$ along $(1,1)/\sqrt2$ and $1$ along $(1,-1)/\sqrt2$. Check: the trace is $4=3+1$ and the determinant is $3=3\cdot1$. PC1 explains $3/4=75\%$.</p>
<ul class="check"><li>PC1 = the eigenvector of the largest eigenvalue. The PCs are orthogonal.</li>
<li>Explained ratio = λ-sum of the kept components / total. Eigenvalues 5, 3, 1, 1 give 80 % for the top 2.</li>
<li>For $[[a,b],[b,a]]$ the eigenvalues are $a\pm b$, with eigenvectors $(1,\pm1)$.</li>
<li>Centre first. Standardise when the units differ.</li>
<li>Score = $u^\top x$. With u = (0.6, 0.8) and x = (3, 4) the score is 5.</li></ul>` }
]};
