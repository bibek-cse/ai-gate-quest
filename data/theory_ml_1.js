/* Theory for Machine Learning chapters 1-5.
   Each section: { h: heading, html: body (KaTeX: $inline$, $$display$$), anim?: animation id, cap?: caption }.
   String.raw keeps TeX backslashes intact. */
window.THEORY = window.THEORY || {};
THEORY.ml1 = { mins: 9, sections: [
{ h: "What machine learning is", html: String.raw`
<p class="lead">A program <b>learns</b> from experience E on a task T, measured by performance P, if its performance on T improves with E (Tom Mitchell, 1997). Instead of writing rules by hand, we show the computer examples and let it fit the rules.</p>
<table class="tbl"><tr><th>Paradigm</th><th>Data</th><th>Goal</th><th>Examples</th></tr>
<tr><td><b>Supervised</b></td><td>pairs $(x, y)$</td><td>learn $x \mapsto y$</td><td>classification (spam?), regression (price)</td></tr>
<tr><td><b>Unsupervised</b></td><td>only $x$</td><td>find structure</td><td>clustering, PCA, density estimation</td></tr>
<tr><td><b>Reinforcement</b></td><td>states, actions, rewards</td><td>maximise long-term reward</td><td>games, robotics</td></tr></table>
<p>The kind of target decides the task, not the data. A <b>categorical</b> $y$ makes it <b>classification</b>, and a <b>real-valued</b> $y$ makes it <b>regression</b>.</p>` },
{ h: "The learning set-up", html: String.raw`
<p>We assume the examples $(x_i, y_i)$ are drawn <b>i.i.d.</b> from an unknown distribution $\mathcal D$. We pick a hypothesis $h$ from a class $\mathcal H$ (all lines, all trees of depth 3, …) and score it with a loss $\ell$.</p>
<div class="formula">$$\underbrace{\hat R(h)=\frac1n\sum_{i=1}^{n}\ell\big(h(x_i),y_i\big)}_{\text{training (empirical) risk}} \qquad \underbrace{R(h)=\mathbb E_{(x,y)\sim\mathcal D}\,\ell\big(h(x),y\big)}_{\text{true risk}}$$</div>
<p>Training minimises $\hat R$, but we care about $R$. The difference $R(h)-\hat R(h)$ is the <b>generalisation gap</b>. Almost everything in ML is about keeping that gap small.</p>
<ul class="kp"><li><b>Parameters</b> are learned by training (weights, biases, split thresholds).</li>
<li><b>Hyperparameters</b> are chosen by us, usually by validation ($k$ in k-NN, tree depth, $\lambda$, learning rate).</li>
<li><b>Train / validation / test</b>: fit on train, choose on validation, report test <i>once</i>. Touching the test set while tuning is <b>data leakage</b>.</li></ul>` },
{ h: "Underfitting and overfitting", anim: "biasvar", cap: "Change the polynomial degree. Each new dataset (dots) gets its own fit; faded curves are earlier fits. Low degree: all fits agree but miss the curve (bias). High degree: fits chase the noise and disagree (variance).", html: String.raw`
<p><b>Underfitting</b>: the model is too simple, so the error is high on both training and test data. <b>Overfitting</b>: the model is so flexible that it memorises noise, so training error is tiny but test error is large.</p>
<p>In the demo the true function is $\sin(2\pi x)$ and each dataset adds random noise. Watch how the <i>spread</i> of the fitted curves changes with the degree. That spread is variance.</p>` },
{ h: "The bias–variance decomposition", html: String.raw`
<p>Fix an input $x$. Train the same algorithm on many random training sets, and let $\bar h(x)=\mathbb E[\hat h(x)]$ be its average prediction. If $y=f(x)+\varepsilon$ with noise variance $\sigma^2$, then for squared loss:</p>
<div class="formula">$$\mathbb E\big[(y-\hat h(x))^2\big]=\underbrace{\big(\bar h(x)-f(x)\big)^2}_{\text{bias}^2}+\underbrace{\mathbb E\big[(\hat h(x)-\bar h(x))^2\big]}_{\text{variance}}+\underbrace{\sigma^2}_{\text{irreducible}}$$</div>
<ul class="kp"><li><b>Bias</b> comes from wrong assumptions (a line fitted to a curve). It falls as complexity grows.</li>
<li><b>Variance</b> is sensitivity to the particular sample. It grows with complexity and shrinks with more data.</li>
<li><b>Noise</b> $\sigma^2$ is a floor that no model can beat.</li></ul>
<p>So test error versus complexity is <b>U-shaped</b>, and the best model sits at the bottom of the U.</p>
<div class="callout"><b>Learning curves.</b> Plot train and validation error against the training-set size. If both are high and flat, you have high bias, so add features or capacity. If there is a large gap that is still closing, you have high variance, so add data or regularise.</div>` },
{ h: "Controlling complexity", html: String.raw`
<ul class="kp"><li><b>Regularisation</b>: minimise $\hat R(w)+\lambda\,\Omega(w)$. $\Omega=\|w\|_2^2$ (ridge) shrinks weights smoothly. $\Omega=\|w\|_1$ (lasso) sets some exactly to 0.</li>
<li><b>Early stopping</b>: stop gradient descent when the validation error starts rising.</li>
<li><b>More data / augmentation</b> lowers variance.</li>
<li><b>Simpler model class</b>: lower degree, shallower tree, larger $k$ in k-NN.</li></ul>
<p><b>No-Free-Lunch theorem:</b> averaged over <i>all</i> possible problems, no learner beats any other. Good performance always comes from an inductive bias that matches the data.</p>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>A categorical target means classification. A real-valued target means regression. With no labels, the task is unsupervised.</li>
<li>Train ≫ test accuracy means overfitting (variance). Both poor means underfitting (bias).</li>
<li>Expected error = bias² + variance + σ². Remember that bias is <b>squared</b>.</li>
<li>A constant predictor has zero variance. 1-NN has zero training error.</li>
<li>More data fixes variance, not bias. Regularisation trades a little bias for less variance.</li>
<li>Hyperparameters are chosen on validation data or by CV, never on the test set.</li></ul>` }
]};

THEORY.ml2 = { mins: 11, sections: [
{ h: "The model", html: String.raw`
<p class="lead">Linear regression predicts a number as a weighted sum of the inputs. It is the workhorse baseline of ML, and many advanced models (GLMs, neural-network output layers) reuse its ideas.</p>
<div class="formula">$$\text{simple: } y=\beta_0+\beta_1x+\varepsilon \qquad\qquad \text{multiple: } \mathbf y=X\boldsymbol\beta+\boldsymbol\varepsilon,\; X\in\mathbb R^{n\times(d+1)}$$</div>
<p>$X$ gets a first column of 1s so that $\beta_0$ (the intercept) is just another weight. Each $\beta_j$ is the change in prediction per unit change in $x_j$ with the others held fixed.</p>
<ul class="kp"><li>Classical assumptions: a linear relationship, independent errors, constant error variance (homoscedasticity), and normal errors (needed only for confidence intervals and tests).</li></ul>` },
{ h: "Least squares and the closed form", html: String.raw`
<p>Ordinary least squares (OLS) chooses $\beta$ to minimise the sum of squared residuals $e_i = y_i-\hat y_i$:</p>
<div class="formula">$$J(\beta)=\sum_{i=1}^n (y_i-\beta_0-\beta_1x_i)^2 \;\Rightarrow\; \beta_1=\frac{\sum (x_i-\bar x)(y_i-\bar y)}{\sum (x_i-\bar x)^2}=\frac{S_{xy}}{S_{xx}},\qquad \beta_0=\bar y-\beta_1\bar x$$</div>
<p>In matrix form, setting $\nabla J=2X^\top(X\beta-y)=0$ gives the <b>normal equations</b>:</p>
<div class="formula">$$X^\top X\,\beta = X^\top y \qquad\Rightarrow\qquad \hat\beta=(X^\top X)^{-1}X^\top y$$</div>
<p><b>Geometry:</b> $\hat y=X\hat\beta$ is the orthogonal projection of $y$ onto the column space of $X$, so the residual vector is perpendicular to every column. Consequences:</p>
<ul class="kp"><li>With an intercept, $\sum e_i=0$, and the line passes through $(\bar x,\bar y)$.</li>
<li>$X^\top X$ is singular when the features are linearly dependent or $d+1>n$. Then the solution is not unique.</li>
<li>Cost is about $O(nd^2+d^3)$. For huge $d$ we use gradient descent instead.</li></ul>` },
{ h: "How gradient descent fits the line", anim: "linreg", cap: "Each step moves (β₀, β₁) against the gradient of the MSE. Red segments are residuals; the dashed line is the closed-form OLS answer that gradient descent converges to.", html: String.raw`
<div class="formula">$$\beta \leftarrow \beta-\eta\,\nabla J(\beta),\qquad \nabla J=\frac{2}{n}X^\top(X\beta-y)$$</div>
<ol class="steps"><li>Start with any $\beta$ (e.g. zeros).</li><li>Compute predictions and residuals.</li><li>The gradient is the average of <i>residual × feature</i>.</li><li>Step against it with learning rate $\eta$. Repeat until the loss stops falling.</li></ol>
<p>MSE is a convex bowl in $\beta$, so with a small enough $\eta$ gradient descent always reaches the OLS solution.</p>` },
{ h: "Measuring the fit", html: String.raw`
<div class="formula">$$R^2 = 1-\frac{SS_{res}}{SS_{tot}} = 1-\frac{\sum (y_i-\hat y_i)^2}{\sum (y_i-\bar y)^2},\qquad R^2_{adj}=1-(1-R^2)\frac{n-1}{n-d-1}$$</div>
<ul class="kp"><li>$R^2$ is the fraction of the variance of $y$ explained, compared with always predicting $\bar y$.</li>
<li>Adding <i>any</i> feature never lowers the training $R^2$. Adjusted $R^2$ penalises useless features.</li>
<li>Residual plots: a random cloud is good. A curve means missing non-linearity. A funnel means non-constant variance.</li></ul>` },
{ h: "Ridge and lasso", html: String.raw`
<div class="formula">$$\text{Ridge: }\min_\beta \|y-X\beta\|^2+\lambda\|\beta\|_2^2\;\Rightarrow\;\hat\beta=(X^\top X+\lambda I)^{-1}X^\top y \qquad \text{Lasso: }\min_\beta \|y-X\beta\|^2+\lambda\|\beta\|_1$$</div>
<ul class="kp"><li>Ridge adds $\lambda$ to every eigenvalue of $X^\top X$, so the matrix is always invertible and the coefficients shrink smoothly towards 0.</li>
<li>Lasso's $L_1$ ball has corners on the axes, so the optimum often lands on a corner and some $\beta_j=0$ exactly. That makes lasso a <b>feature selector</b>.</li>
<li>Bayesian view: ridge is MAP with a Gaussian prior, and lasso is MAP with a Laplace prior.</li>
<li>Standardise the features first, and don't penalise the intercept. $\lambda\to\infty$ drives the slopes to 0, giving $\hat y=\bar y$.</li></ul>` },
{ h: "Worked example + GATE checklist", html: String.raw`
<p><b>Points</b> $(1,2),(2,4),(3,5)$: $\bar x=2$, $\bar y=11/3$, $S_{xy}=(-1)(-\tfrac53)+0+(1)(\tfrac43)=3$, $S_{xx}=2$, so $\beta_1=1.5$ and $\beta_0=\tfrac{11}{3}-3=\tfrac23$.</p>
<div class="callout"><b>Speed trick:</b> for $x=1,2,3$ the slope is simply $(y_3-y_1)/2$.</div>
<ul class="check"><li>$\beta_1=S_{xy}/S_{xx}$ and $\beta_0=\bar y-\beta_1\bar x$. The line passes through $(\bar x,\bar y)$.</li>
<li>Normal equation: $(X^\top X)^{-1}X^\top y$. Ridge adds $+\lambda I$.</li>
<li>The gradient of $\frac1n\|Xw-y\|^2$ is $\frac2nX^\top(Xw-y)$.</li>
<li>Lasso gives sparse coefficients. Ridge only shrinks them.</li>
<li>Residuals sum to 0 (with an intercept). Training $R^2$ never drops when a feature is added.</li></ul>` }
]};

THEORY.ml3 = { mins: 10, sections: [
{ h: "From regression to probability", html: String.raw`
<p class="lead">For a yes/no target we want a <b>probability</b>, but a straight line $w^\top x+b$ can go below 0 or above 1. Logistic regression passes the linear score through the sigmoid.</p>
<div class="formula">$$p=P(y=1\mid x)=\sigma(z)=\frac{1}{1+e^{-z}},\qquad z=w^\top x+b$$</div>
<ul class="kp"><li>$\sigma(0)=0.5$, $\sigma(z)\to1$ as $z\to\infty$, and $\sigma(-z)=1-\sigma(z)$.</li>
<li>Inverting gives the <b>log-odds (logit)</b>: $\log\frac{p}{1-p}=w^\top x+b$. Logistic regression is a <i>linear model of the log-odds</i>.</li>
<li>Useful values: $\sigma(1)\approx0.731$, $\sigma(2)\approx0.881$, $\sigma(3)\approx0.953$.</li></ul>` },
{ h: "Decision boundary", html: String.raw`
<p>Predict class 1 when $p\ge t$. With $t=0.5$, this is the same as $z\ge0$, so the boundary $w^\top x+b=0$ is a <b>hyperplane</b>. The sigmoid only squashes; it does not bend the boundary.</p>
<ul class="kp"><li>Curved boundaries need engineered features ($x_1^2$, $x_1x_2$), kernels, or a neural network.</li>
<li>Moving the threshold $t$ trades precision against recall without retraining.</li></ul>` },
{ h: "How training works", anim: "logreg", cap: "Gradient descent on cross-entropy. The background shading is P(y=1|x); the solid line is the 0.5 boundary. Watch the loss fall and the boundary rotate into place.", html: String.raw`
<p>We maximise the likelihood $\prod_i p_i^{y_i}(1-p_i)^{1-y_i}$, which is the same as minimising the <b>binary cross-entropy</b>:</p>
<div class="formula">$$L(w)=-\frac1n\sum_i\Big[y_i\log p_i+(1-y_i)\log(1-p_i)\Big],\qquad \nabla_w L=\frac1n\sum_i (p_i-y_i)\,x_i$$</div>
<ul class="kp"><li>The gradient has the same <i>error × input</i> form as linear regression, because $\sigma'(z)=\sigma(z)(1-\sigma(z))$ cancels the log.</li>
<li>$L$ is <b>convex</b> in $w$ (its Hessian $\sum p_i(1-p_i)x_ix_i^\top\succeq0$), so it has no bad local minima. There is no closed form, so we use gradient descent or Newton's method (IRLS).</li>
<li>MSE with a sigmoid would be non-convex. That is why we use cross-entropy.</li></ul>` },
{ h: "Reading the coefficients", html: String.raw`
<p>A one-unit increase in $x_j$ adds $w_j$ to the log-odds, so it <b>multiplies the odds</b> by $e^{w_j}$.</p>
<div class="formula">$$\frac{\text{odds}(x_j+1)}{\text{odds}(x_j)}=e^{w_j}\qquad\text{e.g. } w_j=0.7\Rightarrow \times 2.01$$</div>
<p>The change in <i>probability</i> depends on where you start, so never read $w_j$ as "+0.7 probability".</p>` },
{ h: "Multiclass, regularisation and separability", html: String.raw`
<div class="formula">$$\text{softmax: } P(y=k\mid x)=\frac{e^{w_k^\top x}}{\sum_j e^{w_j^\top x}},\qquad L=-\log P(y=\text{true}\mid x)$$</div>
<ul class="kp"><li>With $K=2$, softmax reduces exactly to the sigmoid.</li>
<li>On <b>perfectly separable</b> data, unregularised weights grow without bound (the MLE does not exist). An L2 penalty or early stopping fixes this.</li>
<li>Logistic regression is <b>discriminative</b>: it models $P(y\mid x)$ directly. Naive Bayes is generative: it models $P(x\mid y)P(y)$.</li></ul>` },
{ h: "Worked example + GATE checklist", html: String.raw`
<p>$w=[2,-1]$, $b=-1$, $x=[1,1]$: $z=2-1-1=0$, so $p=\sigma(0)=0.5$. For $y=1$ and $p=0.25$ the log-loss is $-\ln0.25\approx1.386$.</p>
<ul class="check"><li>The output is $P(y=1\mid x)$. The boundary is linear, at $z=0$.</li>
<li>$\sigma'(z)=\sigma(1-\sigma)\le0.25$, and $\sigma(-z)=1-\sigma(z)$.</li>
<li>The loss is cross-entropy (convex). Per example, $\nabla=(p-y)x$.</li>
<li>Odds ratio $=e^{w_j}$.</li>
<li>Raising the threshold raises precision and lowers recall.</li>
<li>Separable data with no regularisation sends $\|w\|\to\infty$.</li></ul>` }
]};

THEORY.ml4 = { mins: 10, sections: [
{ h: "The confusion matrix", html: String.raw`
<table class="tbl cm"><tr><th></th><th>Predicted +</th><th>Predicted −</th></tr>
<tr><th>Actual +</th><td class="g">TP</td><td class="r">FN</td></tr>
<tr><th>Actual −</th><td class="r">FP</td><td class="g">TN</td></tr></table>
<div class="formula">$$\text{Precision}=\frac{TP}{TP+FP}\quad \text{Recall (TPR)}=\frac{TP}{TP+FN}\quad \text{Specificity}=\frac{TN}{TN+FP}\quad F_1=\frac{2PR}{P+R}=\frac{2TP}{2TP+FP+FN}$$</div>
<ul class="kp"><li><b>Precision</b> asks: when the model says "positive", how often is it right? This matters when false alarms are costly (spam).</li>
<li><b>Recall</b> asks: of the real positives, how many did we catch? This matters when misses are costly (cancer, fraud).</li>
<li><b>Accuracy</b> $=(TP+TN)/N$ is misleading on imbalanced data. "Always negative" scores 95 % if 95 % of cases are negative.</li></ul>` },
{ h: "Thresholds create the trade-off", anim: "threshold", cap: "Drag the threshold. Everything right of it is predicted positive. The confusion matrix, metrics and the point on the ROC curve update live.", html: String.raw`
<p>A classifier usually outputs a <b>score</b>. The threshold turns scores into labels. Moving it right means fewer positive predictions: precision rises and recall falls. Moving it left does the opposite.</p>` },
{ h: "ROC, AUC and PR curves", html: String.raw`
<ul class="kp"><li><b>ROC curve</b>: TPR against FPR $=1-$specificity, over all thresholds. The diagonal is random guessing.</li>
<li><b>AUC</b> $=P(\text{score of a random positive} > \text{score of a random negative})$. 0.5 is random, 1 is a perfect ranking. It is independent of the threshold.</li>
<li><b>Precision–recall curve</b>: more informative when positives are rare, because ROC can look rosy under heavy imbalance.</li></ul>` },
{ h: "Validation strategies", html: String.raw`
<table class="tbl"><tr><th>Method</th><th>How</th><th>Notes</th></tr>
<tr><td>Hold-out</td><td>one train / validation split</td><td>fast, but a noisy estimate</td></tr>
<tr><td>k-fold CV</td><td>k folds, each tested once, average the k scores</td><td>k = 5 or 10 is standard</td></tr>
<tr><td>Stratified k-fold</td><td>keeps the class ratio in every fold</td><td>default for classification</td></tr>
<tr><td>LOOCV</td><td>k = n</td><td>n trainings; low bias, <b>high variance</b> estimate</td></tr>
<tr><td>Nested CV</td><td>inner loop tunes, outer loop evaluates</td><td>an honest estimate after tuning</td></tr></table>
<div class="callout">Fit every preprocessing step (scaling, PCA, feature selection) <b>inside</b> each training fold. Fitting it on all the data leaks information.</div>` },
{ h: "Multi-class averaging", html: String.raw`
<ul class="kp"><li><b>Macro</b>: compute the metric per class, then take a plain mean. Every class counts equally, which exposes weak minority classes.</li>
<li><b>Micro</b>: pool TP/FP/FN over classes first. For single-label problems, micro-F1 equals accuracy.</li>
<li><b>Weighted</b>: average per class, weighted by class frequency (support).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Precision divides by <i>predicted</i> positives. Recall divides by <i>actual</i> positives.</li>
<li>F1 $=2TP/(2TP+FP+FN)$, the harmonic mean. Example: TP=40, FP=10, FN=20 gives 80/110 = 0.727.</li>
<li>AUC = 0.5 is random, and a perfect ranking gives AUC = 1.</li>
<li>LOOCV trains n models: low bias, high variance.</li>
<li>Tuning on the test set gives an optimistic (biased) estimate.</li>
<li>A higher threshold means precision ↑ and recall ↓.</li></ul>` }
]};

THEORY.ml5 = { mins: 11, sections: [
{ h: "k-nearest neighbours: the algorithm", anim: "knn", cap: "The query (white ring) moves around; lines join it to its k nearest neighbours and the vote decides its colour. The background shows the decision regions. Change k and watch the boundary smooth out.", html: String.raw`
<ol class="steps"><li><b>Store</b> the training set. There is no training phase, which is why k-NN is called a <i>lazy</i> learner.</li>
<li>For a query $x$, compute its distance to every training point.</li>
<li>Take the $k$ closest.</li>
<li><b>Classification</b>: majority vote. <b>Regression</b>: average of their $y$.</li></ol>
<div class="formula">$$d_2(x,z)=\sqrt{\textstyle\sum_j (x_j-z_j)^2}\qquad d_1(x,z)=\textstyle\sum_j |x_j-z_j|\qquad d_p=\big(\textstyle\sum_j|x_j-z_j|^p\big)^{1/p}$$</div>` },
{ h: "Choosing k and preparing the data", html: String.raw`
<ul class="kp"><li><b>Small k</b> (k = 1): a jagged boundary with low bias and high variance. Training error is 0.</li>
<li><b>Large k</b>: a smooth boundary. At $k=n$ it always predicts the majority class (high bias).</li>
<li>Use an <b>odd k</b> for binary problems to avoid ties, and choose k by cross-validation.</li>
<li><b>Scale the features</b>: otherwise a feature in lakhs of rupees swamps one in years.</li>
<li><b>Curse of dimensionality</b>: in high dimensions all distances look alike, so "nearest" loses meaning.</li>
<li>Cost: $O(1)$ to train, $O(nd)$ per query. KD-trees or approximate search speed this up.</li></ul>` },
{ h: "Bayes' theorem for classification", html: String.raw`
<div class="formula">$$P(c\mid x)=\frac{P(x\mid c)\,P(c)}{P(x)},\qquad \hat c=\arg\max_c P(x\mid c)P(c)$$</div>
<p>Prior × likelihood, normalised. $P(x)$ is the same for every class, so the argmax ignores it. Classifiers that model $P(x\mid c)$ are <b>generative</b>, and those that model $P(c\mid x)$ directly are <b>discriminative</b>.</p>` },
{ h: "Naive Bayes", html: String.raw`
<p>The <b>naive</b> assumption is that features are <i>conditionally independent given the class</i>:</p>
<div class="formula">$$P(x_1,\dots,x_d\mid c)=\prod_{j=1}^d P(x_j\mid c)\quad\Rightarrow\quad \hat c=\arg\max_c\Big[\log P(c)+\sum_j\log P(x_j\mid c)\Big]$$</div>
<ul class="kp"><li><b>Gaussian NB</b> uses a mean and variance per feature and class. <b>Multinomial NB</b> uses word counts. <b>Bernoulli NB</b> uses binary features.</li>
<li><b>Laplace smoothing</b> stops one unseen word from zeroing the whole product: $P(w\mid c)=\dfrac{\text{count}(w,c)+1}{N_c+|V|}$.</li>
<li>Work in log space to avoid numeric underflow.</li>
<li>The probabilities are often over-confident, but the <i>ranking</i> (the argmax) is frequently right, so NB is a strong, fast baseline for text.</li></ul>` },
{ h: "Worked example + GATE checklist", html: String.raw`
<p>Take $P(\text{spam})=0.4$, $P(w\mid\text{spam})=0.5$ and $P(w\mid\text{ham})=0.1$. Then $P(\text{spam}\mid w)=\dfrac{0.5\cdot0.4}{0.5\cdot0.4+0.1\cdot0.6}=\dfrac{0.20}{0.26}\approx0.769$.</p>
<ul class="check"><li>Euclidean distance from (1,2) to (4,6) is 5. Manhattan distance is 7.</li>
<li>1-NN has zero training error. Small k means high variance.</li>
<li>Scale features before k-NN.</li>
<li>NB assumes independence <i>given the class</i>. Use Laplace smoothing: $(c+1)/(N+|V|)$.</li>
<li>Don't forget the prior. Ignoring it is the base-rate fallacy.</li></ul>` }
]};
