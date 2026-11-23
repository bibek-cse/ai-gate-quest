/* Theory for Maths for AI (chapters mt1-mt10). Same format as theory_ml_1.js. */
window.THEORY = window.THEORY || {};
THEORY.mt1 = { mins: 9, sections: [
{ h: "Vectors are data", html: String.raw`
<p class="lead">A vector is an ordered list of numbers. In ML a sample with $d$ features is a point $x\in\mathbb R^d$, an embedding is a vector, and so is a row of weights. Geometry on vectors therefore becomes reasoning about data.</p>
<ul class="kp"><li>Addition and scaling are done component-wise: $(a+b)_i=a_i+b_i$, $(c\,a)_i=c\,a_i$.</li>
<li>A <b>linear combination</b> is $c_1v_1+\dots+c_kv_k$. Its <b>span</b> is the set of all such combinations.</li></ul>` },
{ h: "Norms: how big is a vector?", html: String.raw`
<div class="formula">$$\|x\|_2=\sqrt{\textstyle\sum_i x_i^2}\qquad \|x\|_1=\textstyle\sum_i|x_i|\qquad \|x\|_\infty=\max_i|x_i|\qquad \|x\|_p=\big(\textstyle\sum_i|x_i|^p\big)^{1/p}$$</div>
<ul class="kp"><li>$L_2$ is Euclidean length, used in distances, weight decay and normalisation. $L_1$ (Manhattan) gives sparsity in the lasso. $L_\infty$ is the worst-case coordinate, used in adversarial budgets.</li>
<li>Every norm satisfies: $\|x\|\ge0$ (zero only for $x=0$), $\|cx\|=|c|\|x\|$, and the triangle inequality $\|a+b\|\le\|a\|+\|b\|$.</li>
<li>A <b>unit vector</b> is $\hat x=x/\|x\|$, which keeps only the direction.</li></ul>` },
{ h: "Dot product, angle and projection", anim: "vectors", cap: "Vector b rotates around a. Watch the dot product change sign at 90°, the cosine track the angle, and the projection of b onto a (the green shadow) grow and shrink. Drag in the plot to move b yourself.", html: String.raw`
<div class="formula">$$a\cdot b=\sum_i a_ib_i=\|a\|\|b\|\cos\theta,\qquad \cos\theta=\frac{a\cdot b}{\|a\|\|b\|},\qquad \operatorname{proj}_a b=\frac{a\cdot b}{\|a\|^2}\,a$$</div>
<ul class="kp"><li>$a\cdot b>0$: angle below 90°. $=0$: orthogonal. $<0$: angle above 90°.</li>
<li><b>Cosine similarity</b> ignores length, so it is the standard similarity for text vectors and embeddings, including retrieval in RAG.</li>
<li><b>Cauchy–Schwarz</b>: $|a\cdot b|\le\|a\|\|b\|$, which is why $\cos\theta\in[-1,1]$.</li>
<li>Expanding a distance: $\|a-b\|^2=\|a\|^2+\|b\|^2-2\,a\cdot b$. Distances come from dot products, which is the idea behind kernels.</li></ul>` },
{ h: "Linear independence, basis and dimension", html: String.raw`
<p>Vectors are <b>linearly independent</b> if $\sum c_iv_i=0$ forces every $c_i=0$, so none of them is a combination of the others. A <b>basis</b> of $\mathbb R^d$ is $d$ independent vectors, and every vector has unique coordinates in it.</p>
<ul class="kp"><li>Any $d+1$ vectors in $\mathbb R^d$ are dependent. A set containing $0$ is dependent.</li>
<li>Dependent (collinear) features make $X^\top X$ singular, so OLS has no unique solution.</li>
<li>An <b>orthonormal</b> basis (mutually orthogonal unit vectors) makes coordinates easy: coordinate $i$ is just $q_i\cdot x$. PCA gives exactly such a basis.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>$\|(3,4)\|_2=5$ and $\|(3,4)\|_1=7$. The $L_\infty$ norm is the largest absolute entry.</li>
<li>$\cos((1,0),(1,1))=1/\sqrt2\approx0.707$.</li>
<li>The projection divides by $\|a\|^2$ unless $a$ is a unit vector.</li>
<li>To make two vectors orthogonal, set their dot product to 0 and solve.</li>
<li>$\|a-b\|^2=\|a\|^2+\|b\|^2-2a\cdot b$.</li></ul>` }
]};

THEORY.mt2 = { mins: 10, sections: [
{ h: "Matrices as data and as maps", html: String.raw`
<p class="lead">A matrix is two things at once: a table of data ($X\in\mathbb R^{n\times d}$, one sample per row) and a <b>linear map</b> $x\mapsto Ax$ that rotates, stretches, shears or squashes space. Every neural-network layer is a matrix map followed by a non-linearity.</p>
<div class="formula">$$(AB)_{ij}=\sum_k A_{ik}B_{kj},\qquad (m\times n)(n\times p)\to(m\times p),\qquad (AB)^\top=B^\top A^\top$$</div>
<ul class="kp"><li>Multiplication is associative but <b>not commutative</b>: $AB\ne BA$ in general.</li>
<li>Naive multiplication of $n\times n$ matrices costs $O(n^3)$.</li>
<li>$\operatorname{tr}(AB)=\operatorname{tr}(BA)$, and the trace is the sum of the diagonal.</li></ul>` },
{ h: "Watching a matrix transform space", anim: "lintrans", cap: "The grid and the unit square are morphed by a sequence of 2×2 matrices: scaling, shear, rotation, reflection, and a singular matrix that collapses the plane onto a line. The shaded area equals |det A|.", html: String.raw`
<p>The columns of $A$ are where the basis vectors $e_1, e_2$ land. Everything else follows by linearity.</p>
<div class="formula">$$\det\begin{bmatrix}a&b\\c&d\end{bmatrix}=ad-bc=\text{(signed) area of the image of the unit square}$$</div>` },
{ h: "Determinant, inverse and rank", html: String.raw`
<div class="formula">$$A^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix},\qquad \det(AB)=\det A\det B,\qquad \det(cA)=c^n\det A,\qquad \det(A^{-1})=\frac1{\det A}$$</div>
<ul class="kp"><li><b>Invertible</b> ⇔ $\det A\ne0$ ⇔ full rank ⇔ no zero eigenvalue ⇔ the columns are independent.</li>
<li><b>Rank</b> = number of independent columns (= rows) = dimension of the image. Row-reduce and count the pivots.</li>
<li>$Ax=b$ has <b>no</b> solution if $b$ is outside the column space, a <b>unique</b> one if $A$ is invertible, and <b>infinitely many</b> if $A$ is rank-deficient and $b$ is reachable.</li></ul>` },
{ h: "Special matrices you meet in ML", html: String.raw`
<table class="tbl"><tr><th>Type</th><th>Definition</th><th>Where it appears</th></tr>
<tr><td>Symmetric</td><td>$A=A^\top$</td><td>covariance, Hessian, kernel / Gram matrix</td></tr>
<tr><td>Orthogonal</td><td>$Q^\top Q=I$</td><td>rotations, PCA bases, $\det=\pm1$, length-preserving</td></tr>
<tr><td>Diagonal</td><td>off-diagonal entries 0</td><td>per-feature scaling, eigenvalue matrix $\Lambda$</td></tr>
<tr><td>PSD</td><td>$x^\top Ax\ge0$</td><td>covariance, $X^\top X$, convex Hessians</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Check shapes before multiplying: inner dimensions must match.</li>
<li>2×2: $\det=ad-bc$. Inverse: swap $a,d$, negate $b,c$, divide by det.</li>
<li>$\det(2A)=2^3\det A$ for 3×3. $\det(A^{-1})=1/\det A$.</li>
<li>A row that is a multiple of another lowers the rank.</li>
<li>A rank-deficient system with a consistent right-hand side has infinitely many solutions.</li></ul>` }
]};

THEORY.mt3 = { mins: 10, sections: [
{ h: "Eigenvectors: directions a matrix doesn't turn", html: String.raw`
<div class="formula">$$Av=\lambda v,\ v\ne0\qquad\Longleftrightarrow\qquad \det(A-\lambda I)=0$$</div>
<p>Most vectors get rotated by $A$. Eigenvectors only get stretched, by the factor $\lambda$. They are the natural axes of the transformation.</p>
<ul class="kp"><li>$\sum\lambda_i=\operatorname{tr}A$ and $\prod\lambda_i=\det A$. For 2×2: $\lambda^2-(\operatorname{tr}A)\lambda+\det A=0$.</li>
<li>Diagonal and triangular matrices: the eigenvalues are the diagonal entries.</li>
<li>$p(A)$ has eigenvalues $p(\lambda)$: $A^2\to\lambda^2$, $A^{-1}\to1/\lambda$, $A+cI\to\lambda+c$, with the same eigenvectors.</li></ul>` },
{ h: "Seeing eigenvectors", anim: "eigen", cap: "A unit vector v sweeps around the circle (blue) and its image Av is drawn in orange. The unit circle maps to an ellipse. When v and Av line up, v is an eigenvector, and the ratio of lengths is λ.", html: String.raw`
<p>For a <b>symmetric</b> matrix the eigenvectors are orthogonal and are exactly the ellipse's axes. The eigenvalues are the semi-axis lengths.</p>` },
{ h: "The spectral theorem", html: String.raw`
<div class="formula">$$A=A^\top\ \Rightarrow\ A=Q\Lambda Q^\top,\quad Q^\top Q=I,\quad \Lambda=\operatorname{diag}(\lambda_1,\dots,\lambda_n)\in\mathbb R$$</div>
<ul class="kp"><li>Symmetric real matrices have real eigenvalues and an orthonormal eigenbasis.</li>
<li><b>Positive definite</b> ⇔ every $\lambda_i>0$ ⇔ $x^\top Ax>0$ for all $x\ne0$. A PD Hessian means a strict minimum.</li>
<li>A rotation like $\begin{bmatrix}0&1\\-1&0\end{bmatrix}$ is not symmetric, and its eigenvalues are complex ($\pm i$).</li>
<li><b>Power iteration</b> $x\leftarrow Ax/\|Ax\|$ converges to the eigenvector of the largest $|\lambda|$. That is how PageRank works.</li></ul>` },
{ h: "Singular value decomposition", html: String.raw`
<div class="formula">$$A=U\Sigma V^\top\quad(\text{any } m\times n),\qquad \sigma_i=\sqrt{\lambda_i(A^\top A)}\ge0,\qquad \operatorname{rank}A=\#\{\sigma_i>0\}$$</div>
<ul class="kp"><li>Every matrix factors as: rotate ($V^\top$), stretch along axes ($\Sigma$), rotate ($U$).</li>
<li><b>Eckart–Young</b>: the best rank-$k$ approximation keeps the top $k$ singular values. Its error is $\sqrt{\sum_{i>k}\sigma_i^2}$ (Frobenius norm).</li>
<li>Applications: PCA, compression, recommender systems, pseudo-inverses, LoRA's low-rank updates.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>$[[a,b],[b,a]]$ has eigenvalues $a\pm b$.</li>
<li>trace = sum of eigenvalues, det = product.</li>
<li>Eigenvalues 1, 2, 3 make $\det(A-I)=0$.</li>
<li>Singular values (5, 2, 0, 0) give rank 2. The rank-1 error for (5, 2, 1) is $\sqrt5$.</li>
<li>Symmetric matrices have real eigenvalues and orthogonal eigenvectors.</li></ul>` }
]};

THEORY.mt4 = { mins: 10, sections: [
{ h: "The derivative is a slope", anim: "tangent", cap: "The tangent line slides along the curve. Its slope is f′(x), plotted in the lower panel. Where the tangent is flat (f′ = 0) the curve has a peak or a valley.", html: String.raw`
<div class="formula">$$f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$$</div>
<p>The derivative tells how much the output changes for a tiny nudge of the input. Training is nothing more than nudging weights in the direction that lowers the loss.</p>` },
{ h: "Rules you use every day", html: String.raw`
<table class="tbl"><tr><th>Function</th><th>Derivative</th><th>Function</th><th>Derivative</th></tr>
<tr><td>$x^n$</td><td>$nx^{n-1}$</td><td>$e^x$</td><td>$e^x$</td></tr>
<tr><td>$\ln x$</td><td>$1/x$</td><td>$\sigma(x)$</td><td>$\sigma(1-\sigma)$</td></tr>
<tr><td>$\tanh x$</td><td>$1-\tanh^2x$</td><td>$\max(0,x)$</td><td>$1$ if $x>0$ else $0$</td></tr></table>
<div class="formula">$$(fg)'=f'g+fg',\qquad \Big(\frac fg\Big)'=\frac{f'g-fg'}{g^2},\qquad \frac{d}{dx}f(g(x))=f'(g(x))\,g'(x)$$</div>
<p>The <b>chain rule</b> is the heart of backpropagation: a network is a long composition of functions, and its gradient is a product of local derivatives.</p>` },
{ h: "Many inputs: partials and the gradient", html: String.raw`
<div class="formula">$$\nabla f(x)=\Big(\frac{\partial f}{\partial x_1},\dots,\frac{\partial f}{\partial x_n}\Big),\qquad D_uf=\nabla f\cdot u\ \ (\|u\|=1)$$</div>
<ul class="kp"><li>A partial derivative varies one input and freezes the rest.</li>
<li>$\nabla f$ points in the direction of <b>steepest ascent</b>, its length is the steepest rate, and it is perpendicular to the level sets.</li>
<li>Matrix-calculus identities: $\nabla(a^\top w)=a$, $\nabla\|w\|^2=2w$, $\nabla(w^\top Aw)=(A+A^\top)w$ (= $2Aw$ if $A$ is symmetric), and $\nabla\tfrac12\|Xw-y\|^2=X^\top(Xw-y)$.</li></ul>` },
{ h: "Second order: Hessian and Jacobian", html: String.raw`
<div class="formula">$$H_{ij}=\frac{\partial^2f}{\partial x_i\partial x_j}\quad(\text{symmetric}),\qquad J_{ij}=\frac{\partial F_i}{\partial x_j}\ \text{ for } F:\mathbb R^n\to\mathbb R^m$$</div>
<ul class="kp"><li>Second-derivative test: at $\nabla f=0$, a PD Hessian means a minimum, an ND Hessian a maximum, and mixed signs a <b>saddle</b>.</li>
<li>The Jacobian is the derivative of a vector-valued map. Backprop multiplies Jacobians along the chain.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Chain rule: $\frac{d}{dx}\sin(x^2)=2x\cos(x^2)$.</li>
<li>A cross term $bxy$ appears in both partials.</li>
<li>Directional derivative = $\nabla f\cdot u$ with a <b>unit</b> $u$.</li>
<li>$x^3-3x$: max at $-1$, min at $+1$, from the sign of $f''$.</li>
<li>Hessian of $x^2+xy+y^2$ is $[[2,1],[1,2]]$, which is PD, so the function is convex.</li></ul>` }
]};

THEORY.mt5 = { mins: 11, sections: [
{ h: "Optimisation problems", html: String.raw`
<div class="formula">$$\min_{x}\ f(x)\quad\text{s.t.}\quad g_i(x)\le0,\ h_j(x)=0$$</div>
<p class="lead">Training a model means minimising a loss over its parameters. Whether that is easy depends almost entirely on <b>convexity</b>.</p>
<div class="formula">$$\text{convex: } f(\theta x+(1-\theta)y)\le\theta f(x)+(1-\theta)f(y)\iff \nabla^2f\succeq0$$</div>
<ul class="kp"><li>For a convex function, every local minimum is global, and $\nabla f=0$ is enough for optimality.</li>
<li>Convexity is preserved by non-negative sums, by maxima, and by composing with affine maps.</li>
<li>Convex losses include MSE, logistic and hinge. Neural-network losses are non-convex.</li></ul>` },
{ h: "Gradient descent and the learning rate", anim: "gd2d", cap: "Gradient descent on f = x² + κy². Increase κ (the condition number) to see zig-zagging; push η past 2/(2κ) to watch it diverge. Steps follow −∇f, perpendicular to the contours.", html: String.raw`
<div class="formula">$$x_{k+1}=x_k-\eta\nabla f(x_k),\qquad \text{quadratic with curvature } a:\ \text{converges}\iff 0<\eta<\frac2a$$</div>
<ul class="kp"><li>The step must respect the <b>largest</b> curvature, while progress is slowest along the <b>smallest</b>. The ratio is the condition number $\kappa$.</li>
<li>Remedies for zig-zagging: feature scaling, momentum, Adam, or second-order methods.</li>
<li><b>SGD</b> uses a mini-batch gradient: unbiased, noisy and cheap.</li></ul>` },
{ h: "Newton's method", html: String.raw`
<div class="formula">$$x_{k+1}=x_k-\frac{f'(x_k)}{f''(x_k)}\qquad\Big(\text{n-D: } x_{k+1}=x_k-H^{-1}\nabla f\Big)$$</div>
<p>Newton's method rescales the step by the curvature, so it solves any quadratic in <b>one</b> step and converges quadratically near the optimum. The price is forming and inverting the Hessian, which costs $O(n^3)$ and is far too much for millions of weights.</p>` },
{ h: "Constraints: Lagrange multipliers and KKT", html: String.raw`
<div class="formula">$$\mathcal L(x,\lambda)=f(x)+\lambda\,h(x),\qquad \nabla f(x^*)+\lambda\nabla h(x^*)=0,\ \ h(x^*)=0$$</div>
<p>At a constrained optimum the gradient of $f$ is parallel to the constraint's gradient: you can't slide along the constraint and still go downhill.</p>
<p><b>Example:</b> minimise $x^2+y^2$ s.t. $x+y=2$. Then $2x=\lambda$ and $2y=\lambda$, so $x=y=1$ and the minimum is $2$.</p>
<ul class="kp"><li><b>KKT</b> for $g_i\le0$: stationarity, feasibility, $\lambda_i\ge0$, and complementary slackness $\lambda_ig_i(x^*)=0$.</li>
<li>In the SVM, only active constraints (the support vectors) get non-zero multipliers.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>$e^x$ is convex. $-x^2$ is concave. $\sin x$ and $x^3$ are neither.</li>
<li>For $\frac a2x^2$, gradient descent converges iff $0<\eta<2/a$.</li>
<li>One GD step on $x^2+2y^2$ from (2, 1) with $\eta=0.25$ gives (1, 0).</li>
<li>Newton on a quadratic lands exactly on the minimum.</li>
<li>$\min x^2+y^2$ s.t. $px+qy=c$ has minimum value $c^2/(p^2+q^2)$.</li></ul>` }
]};

THEORY.mt6 = { mins: 11, sections: [
{ h: "Counting and the axioms", html: String.raw`
<div class="formula">$$P(A)\ge0,\quad P(\Omega)=1,\quad P(A\cup B)=P(A)+P(B)-P(A\cap B),\quad P(A^c)=1-P(A)$$</div>
<p>When outcomes are equally likely, a probability is just favourable outcomes divided by total outcomes, so counting matters:</p>
<div class="formula">$$\text{ordered: } P(n,k)=\frac{n!}{(n-k)!}\qquad \text{unordered: } \binom nk=\frac{n!}{k!(n-k)!}\qquad \text{multiset perms: } \frac{n!}{n_1!n_2!\cdots}\qquad \text{stars \& bars: } \binom{n+k-1}{k-1}$$</div>` },
{ h: "Conditioning and independence", html: String.raw`
<div class="formula">$$P(A\mid B)=\frac{P(A\cap B)}{P(B)},\qquad P(B)=\sum_iP(B\mid A_i)P(A_i)$$</div>
<ul class="kp"><li><b>Independent</b>: $P(A\cap B)=P(A)P(B)$, i.e. $P(A\mid B)=P(A)$.</li>
<li><b>Mutually exclusive</b> events with non-zero probability are <i>dependent</i>: if one happens, the other can't.</li>
<li><b>Conditionally independent</b> given $C$: $P(A\cap B\mid C)=P(A\mid C)P(B\mid C)$. This is the naive Bayes assumption.</li>
<li>"At least one" is easiest as $1-P(\text{none})$.</li></ul>` },
{ h: "Bayes' theorem, visually", anim: "bayesbox", cap: "The square is the whole population. The left strip has the condition (prevalence). Blue = true positives, orange = false positives. The posterior P(D | +) is blue ÷ (blue + orange). Lower the prevalence and watch false positives take over.", html: String.raw`
<div class="formula">$$P(D\mid +)=\frac{P(+\mid D)P(D)}{P(+\mid D)P(D)+P(+\mid\neg D)P(\neg D)}$$</div>
<p>Posterior ∝ likelihood × prior. Ignoring the prior is the <b>base-rate fallacy</b>. A 99 %-sensitive test for a 1 % condition with a 5 % false-positive rate gives only about 17 % posterior.</p>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>P(sum = 7 with two dice) = 6/36. P(at least one 6 in 3 rolls) = 1 − (5/6)³.</li>
<li>Two aces without replacement: (4/52)(3/51) = 1/221.</li>
<li>Test independence by comparing $P(A\cap B)$ with $P(A)P(B)$.</li>
<li>Monty Hall: switching wins with probability 2/3.</li>
<li>ARRAY has 5!/(2!2!) = 30 arrangements. $x+y+z=5$ has $\binom72=21$ non-negative solutions.</li></ul>` }
]};

THEORY.mt7 = { mins: 11, sections: [
{ h: "Random variables, expectation and variance", html: String.raw`
<div class="formula">$$\mathbb E[X]=\sum_x x\,p(x)\ \big(\textstyle\int x f(x)dx\big),\qquad \operatorname{Var}(X)=\mathbb E[X^2]-\mathbb E[X]^2$$</div>
<ul class="kp"><li>Linearity: $\mathbb E[aX+b]=a\mathbb E[X]+b$ and $\mathbb E[X+Y]=\mathbb E[X]+\mathbb E[Y]$, always.</li>
<li>$\operatorname{Var}(aX+b)=a^2\operatorname{Var}X$, and $\operatorname{Var}(X+Y)=\operatorname{Var}X+\operatorname{Var}Y+2\operatorname{Cov}(X,Y)$.</li>
<li>Covariance $0$ means uncorrelated, not independent. Example: $Y=X^2$ with $X\sim N(0,1)$.</li>
<li>A density can exceed 1. Only areas are probabilities.</li></ul>` },
{ h: "The distributions you must know", html: String.raw`
<table class="tbl"><tr><th>Distribution</th><th>Models</th><th>Mean</th><th>Variance</th></tr>
<tr><td>Bernoulli(p)</td><td>one yes/no</td><td>$p$</td><td>$p(1-p)$</td></tr>
<tr><td>Binomial(n, p)</td><td>successes in n trials</td><td>$np$</td><td>$np(1-p)$</td></tr>
<tr><td>Poisson(λ)</td><td>counts of rare events</td><td>$\lambda$</td><td>$\lambda$</td></tr>
<tr><td>Uniform(a, b)</td><td>flat on an interval</td><td>$\frac{a+b}2$</td><td>$\frac{(b-a)^2}{12}$</td></tr>
<tr><td>Exponential(λ)</td><td>waiting times (memoryless)</td><td>$1/\lambda$</td><td>$1/\lambda^2$</td></tr>
<tr><td>Normal(μ, σ²)</td><td>sums of many effects, noise</td><td>$\mu$</td><td>$\sigma^2$</td></tr></table>
<p>For the normal: 68 % / 95 % / 99.7 % of the mass lies within 1 / 2 / 3 σ, and $P(|Z|<1.96)=0.95$.</p>` },
{ h: "The Central Limit Theorem", anim: "clt", cap: "Samples come from a very skewed distribution (top). We repeatedly average n of them and histogram the averages (bottom). As n grows, the histogram becomes a bell curve with spread σ/√n, whatever the original shape.", html: String.raw`
<div class="formula">$$\bar X_n=\frac1n\sum_{i=1}^nX_i\ \ \approx\ \ \mathcal N\Big(\mu,\frac{\sigma^2}{n}\Big)\quad\text{for large } n$$</div>
<p>The CLT is why we use normal-based confidence intervals and tests, and why averaging reduces noise: the standard error falls like $1/\sqrt n$.</p>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>A fair die has $\mathbb E=3.5$. Uniform on {1, 2, 3, 4} has Var = 1.25.</li>
<li>Bin(10, 0.3) has Var = 2.1. Poisson has mean = variance.</li>
<li>Exp(λ = 2) has mean 0.5.</li>
<li>$\operatorname{Var}(\bar X)=\sigma^2/n$: σ² = 16 and n = 64 give 0.25.</li>
<li>Uncorrelated does not imply independent.</li></ul>` }
]};

THEORY.mt8 = { mins: 10, sections: [
{ h: "Estimators and their errors", html: String.raw`
<p>An <b>estimator</b> $\hat\theta$ is a recipe that turns data into a guess of a parameter $\theta$.</p>
<div class="formula">$$\text{bias}=\mathbb E[\hat\theta]-\theta,\qquad \text{MSE}=\mathbb E[(\hat\theta-\theta)^2]=\text{bias}^2+\operatorname{Var}(\hat\theta)$$</div>
<ul class="kp"><li><b>Unbiased</b>: bias = 0, e.g. the sample mean, or the sample variance with $n-1$.</li>
<li><b>Consistent</b>: $\hat\theta_n\to\theta$ as $n\to\infty$.</li>
<li>A slightly biased estimator can have lower MSE. That is the logic of shrinkage and ridge.</li></ul>` },
{ h: "Maximum likelihood", anim: "likelihood", cap: "Coin flips arrive one by one. The blue curve is the likelihood of p (scaled to its peak); its maximum, the MLE, is k/n. Switch on the Beta(3,3) prior to see the posterior (orange) and its MAP pulled toward 0.5. With more data the prior matters less.", html: String.raw`
<div class="formula">$$\hat\theta_{MLE}=\arg\max_\theta\prod_i p(x_i\mid\theta)=\arg\max_\theta\sum_i\log p(x_i\mid\theta)$$</div>
<ul class="kp"><li>Bernoulli: $\hat p=k/n$. Poisson: $\hat\lambda=\bar x$. Gaussian: $\hat\mu=\bar x$, $\hat\sigma^2=\frac1n\sum(x_i-\bar x)^2$ (biased).</li>
<li>Recipe: write the log-likelihood, differentiate, set to zero, and check it's a maximum.</li>
<li>MSE loss = Gaussian-noise MLE. Cross-entropy loss = categorical MLE.</li></ul>` },
{ h: "MAP and Bayesian updating", html: String.raw`
<div class="formula">$$\hat\theta_{MAP}=\arg\max_\theta\ \log p(\mathcal D\mid\theta)+\log p(\theta)$$</div>
<ul class="kp"><li><b>Beta–Bernoulli conjugacy</b>: a Beta(a, b) prior with $k$ heads in $n$ gives a Beta(a + k, b + n − k) posterior.</li>
<li>Posterior mode (MAP) $=\frac{\alpha-1}{\alpha+\beta-2}$. Posterior mean $=\frac{\alpha}{\alpha+\beta}$.</li>
<li>A flat prior gives MAP = MLE. A Gaussian prior on weights gives L2; a Laplace prior gives L1.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>7 heads in 10 gives MLE 0.7. Beta(2, 2) prior → Beta(9, 5): MAP 8/12 = 0.667, mean 9/14 = 0.643.</li>
<li>Poisson counts 2, 3, 1, 4 give $\hat\lambda=2.5$.</li>
<li>Data 1…5: MLE variance 2, unbiased 2.5.</li>
<li>MSE = bias² + variance.</li></ul>` }
]};

THEORY.mt9 = { mins: 10, sections: [
{ h: "The logic of a test", html: String.raw`
<ol class="steps"><li>State $H_0$ (no effect) and $H_1$.</li><li>Choose α (e.g. 0.05) <i>before</i> looking at the data.</li><li>Compute a test statistic, e.g. $z=\dfrac{\bar x-\mu_0}{\sigma/\sqrt n}$.</li><li>p-value = P(a result at least this extreme | $H_0$). Reject $H_0$ if $p<\alpha$.</li></ol>
<table class="tbl"><tr><th></th><th>H₀ true</th><th>H₀ false</th></tr><tr><th>Reject</th><td>Type I error (α)</td><td>✓ power = 1 − β</td></tr><tr><th>Don't reject</th><td>✓</td><td>Type II error (β)</td></tr></table>
<ul class="kp"><li>The p-value is not P(H₀ | data).</li>
<li>Critical values: 1.96 (two-sided 5 %), 1.645 (one-sided 5 %), 2.576 (two-sided 1 %).</li>
<li>Use a <b>t-test</b> when σ is estimated from a small sample (df = n − 1). Use a <b>χ²</b> test for categorical association.</li></ul>` },
{ h: "Confidence intervals", anim: "cicover", cap: "Each line is a 95% confidence interval from a fresh sample of n = 25. About 95% of them contain the true mean (dashed line); the red ones miss it. The 95% describes the procedure, not any single interval.", html: String.raw`
<div class="formula">$$\bar x\ \pm\ z_{\alpha/2}\,\frac{\sigma}{\sqrt n}\qquad(95\%: z=1.96)$$</div>
<ul class="kp"><li>The width scales as $1/\sqrt n$, so halving the width takes 4× the data.</li>
<li>A test at level α rejects $H_0:\mu=\mu_0$ exactly when $\mu_0$ falls outside the $(1-\alpha)$ CI.</li></ul>` },
{ h: "Pitfalls", html: String.raw`
<ul class="kp"><li><b>Multiple comparisons</b>: 20 tests at α = 0.05 give about 1 false positive in expectation. Use Bonferroni (α/m) or FDR control.</li>
<li>At fixed n, lowering α raises β. Only more data lowers both.</li>
<li>Statistical significance is not practical importance: with huge n, tiny effects become "significant".</li>
<li>In ML, the same logic applies when comparing models (paired tests across CV folds, McNemar's test).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>x̄ = 52, σ = 10, n = 100, μ₀ = 50 gives z = 2, so reject at 5 %.</li>
<li>x̄ = 20, σ = 5, n = 25 gives a 95 % CI of (18.04, 21.96).</li>
<li>Power = 1 − β. A type I error is a false positive.</li>
<li>20 tests give 1 expected false positive.</li></ul>` }
]};

THEORY.mt10 = { mins: 10, sections: [
{ h: "Information and entropy", html: String.raw`
<p class="lead">Rare events are surprising and carry a lot of information. An outcome with probability $p$ carries $-\log_2p$ bits. Entropy is the <i>average</i> surprise.</p>
<div class="formula">$$H(X)=-\sum_xp(x)\log_2p(x)\qquad 0\le H\le\log_2N$$</div>
<ul class="kp"><li>H = 0 for a certain outcome. It is maximal (log N) for a uniform distribution: a fair coin has 1 bit, a fair die 2.585 bits.</li>
<li>Decision trees split to reduce entropy, and information gain equals mutual information.</li>
<li>Source coding theorem: an optimal code's average length satisfies $H\le L<H+1$.</li></ul>` },
{ h: "Entropy, cross-entropy and KL", anim: "entropy", cap: "Top: entropy of a coin as p varies, maximal at 0.5. Bottom: a true distribution P (blue) and a model Q (orange). Cross-entropy H(P,Q) = H(P) + KL(P‖Q): the KL bar is the extra cost of using the wrong model.", html: String.raw`
<div class="formula">$$H(P,Q)=-\sum_xP(x)\log Q(x)=H(P)+D_{KL}(P\|Q),\qquad D_{KL}(P\|Q)=\sum_xP(x)\log\frac{P(x)}{Q(x)}\ge0$$</div>
<ul class="kp"><li>The classification loss $-\log q(y_{true})$ is the cross-entropy with a one-hot $P$.</li>
<li>Since $H(P)$ is fixed, minimising cross-entropy minimises KL, which is the same as maximum likelihood.</li>
<li>KL is <b>not symmetric</b>. Forward KL ($P\|Q$) is mass-covering. Reverse KL ($Q\|P$) is mode-seeking and is used in variational inference (VAEs).</li></ul>` },
{ h: "Joint, conditional and mutual information", html: String.raw`
<div class="formula">$$H(X,Y)=H(X)+H(Y\mid X),\qquad I(X;Y)=H(X)-H(X\mid Y)=D_{KL}\big(p(x,y)\,\|\,p(x)p(y)\big)$$</div>
<ul class="kp"><li>$I(X;Y)\ge0$, and it is 0 iff X and Y are independent.</li>
<li>Uses: feature selection, contrastive learning (InfoNCE lower-bounds MI), and the information bottleneck.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>(1/2, 1/4, 1/4) has entropy 1.5 bits. A uniform 8-way distribution has 3 bits.</li>
<li>KL((½, ½)‖(¼, ¾)) ≈ 0.208 bits.</li>
<li>Cross-entropy with p(true) = 0.5 is ln 2 ≈ 0.693 nats.</li>
<li>H(P, Q) = H(P) + KL. KL ≥ 0 and is asymmetric.</li>
<li>Chain rule: H(X, Y) = H(X) + H(Y | X).</li></ul>` }
]};
