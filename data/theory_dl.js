/* Theory for Deep Learning (chapters dl1-dl10). */
window.THEORY = window.THEORY || {};
THEORY.dl1 = { mins: 11, sections: [
{ h: "The training loop", html: String.raw`
<ol class="steps"><li>Sample a mini-batch $\{(x_i,y_i)\}_{i=1}^B$.</li><li>Forward pass: compute the predictions and the loss $L$.</li><li>Backward pass: compute $\nabla_\theta L$ by backpropagation.</li><li>Update $\theta$ with an optimiser. Repeat for many epochs.</li></ol>
<ul class="kp"><li><b>Iteration</b> = one batch update. <b>Epoch</b> = one pass over the data, i.e. $\lceil N/B\rceil$ iterations.</li>
<li>The learning rate $\eta$ matters more than any other hyperparameter. Tune it on a log scale.</li></ul>` },
{ h: "Optimisers compared", anim: "optrace", cap: "Three optimisers race down the same elongated valley. Plain SGD zig-zags across the steep direction, momentum builds speed along the floor, and Adam rescales each coordinate so it heads almost straight to the minimum.", html: String.raw`
<div class="formula">$$\text{SGD: } \theta\leftarrow\theta-\eta g\qquad \text{Momentum: } v\leftarrow\beta v+g,\ \theta\leftarrow\theta-\eta v$$</div>
<div class="formula">$$\text{Adam: } m\leftarrow\beta_1m+(1-\beta_1)g,\ s\leftarrow\beta_2s+(1-\beta_2)g^2,\ \hat m=\frac{m}{1-\beta_1^t},\ \hat s=\frac{s}{1-\beta_2^t},\ \theta\leftarrow\theta-\eta\frac{\hat m}{\sqrt{\hat s}+\epsilon}$$</div>
<ul class="kp"><li>Momentum averages about $1/(1-\beta)$ recent gradients (10 for β = 0.9).</li>
<li>Adam's first step has size η per parameter (the sign of the gradient). Bias correction fixes the zero initialisation of $m$ and $s$.</li>
<li><b>AdamW</b> decouples weight decay from the adaptive scaling and is the default for Transformers.</li></ul>` },
{ h: "Learning-rate schedules", html: String.raw`
<ul class="kp"><li><b>Warm-up</b>: ramp η up over the first steps, because early gradients and Adam statistics are unreliable.</li>
<li><b>Decay</b>: step, exponential, or cosine $\eta_t=\eta_{min}+\tfrac12(\eta_{max}-\eta_{min})(1+\cos\frac{\pi t}{T})$.</li>
<li><b>Restarts</b> (SGDR) periodically jump η up to escape sharp minima.</li>
<li><b>Linear scaling rule</b>: double the batch size, double η (with warm-up), up to a point.</li></ul>` },
{ h: "Initialisation", html: String.raw`
<p>Keep the variance of activations (forward) and of gradients (backward) roughly constant from layer to layer:</p>
<div class="formula">$$\text{Xavier/Glorot (tanh): } \operatorname{Var}(W)=\frac{2}{n_{in}+n_{out}}\qquad \text{He/Kaiming (ReLU): } \operatorname{Var}(W)=\frac{2}{n_{in}}$$</div>
<ul class="kp"><li>All-zero weights leave every unit identical (symmetry), so the network never learns distinct features.</li>
<li>Too large a scale explodes the signal. Too small makes it vanish.</li>
<li>Gradient clipping ($g\leftarrow g\cdot\min(1,c/\|g\|)$) protects against occasional explosions.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Momentum with v₀ = 0, β = 0.9 and g = 1, 1 gives v = 1, then 1.9.</li><li>Adam at t = 1 moves each weight by −η·sign(g).</li><li>He std for n_in = 512 is √(2/512) = 0.0625.</li><li>With weight decay, w ← (1 − ηλ)w − ηg.</li><li>Clipping g = (3, 4) to norm 1 gives (0.6, 0.8).</li></ul>` }
]};

THEORY.dl2 = { mins: 10, sections: [
{ h: "Why deep nets overfit and how to stop them", html: String.raw`
<p class="lead">Networks with millions of parameters can memorise their training set. Regularisation restricts what the network can fit, so that it fits patterns rather than noise.</p>
<table class="tbl"><tr><th>Technique</th><th>How</th><th>Effect</th></tr>
<tr><td>Weight decay (L2)</td><td>$+\lambda\|w\|^2$, so $w\leftarrow(1-\eta\lambda)w-\eta g$</td><td>smaller weights, smoother functions</td></tr>
<tr><td>Dropout</td><td>zero units with prob. $p$, scale the rest by $\frac1{1-p}$</td><td>no co-adaptation, implicit ensemble</td></tr>
<tr><td>Data augmentation</td><td>label-preserving transforms</td><td>more data, built-in invariances</td></tr>
<tr><td>Early stopping</td><td>stop at the best validation loss</td><td>limits how far the weights move</td></tr>
<tr><td>Label smoothing / mixup</td><td>soft targets / mixed examples</td><td>calibrated, smoother boundaries</td></tr></table>` },
{ h: "Batch normalisation", anim: "batchnorm", cap: "Raw activations in a mini-batch (top) drift and spread as training changes earlier layers. BN subtracts the batch mean and divides by the batch std (middle), then the learned γ, β rescale and shift (bottom). Watch the statistics update batch by batch.", html: String.raw`
<div class="formula">$$\mu_B=\frac1B\sum_ix_i,\quad \sigma_B^2=\frac1B\sum_i(x_i-\mu_B)^2,\quad \hat x_i=\frac{x_i-\mu_B}{\sqrt{\sigma_B^2+\epsilon}},\quad y_i=\gamma\hat x_i+\beta$$</div>
<ul class="kp"><li>It allows higher learning rates and faster convergence, and adds a little regularisation from the batch noise.</li>
<li>At <b>inference</b> it uses running averages of μ and σ² (call model.eval()).</li>
<li>Learnable parameters: γ and β per channel, so $2C$. A conv before BN doesn't need a bias.</li>
<li>Small batches make the statistics noisy. Use GroupNorm or LayerNorm instead.</li></ul>` },
{ h: "Layer, group and RMS normalisation", html: String.raw`
<ul class="kp"><li><b>LayerNorm</b>: per sample, across the features, independent of batch size. It is standard in Transformers and RNNs.</li>
<li><b>GroupNorm</b>: per sample, over groups of channels. Good for detection and segmentation with tiny batches.</li>
<li><b>RMSNorm</b>: $x/\sqrt{\text{mean}(x^2)}\cdot\gamma$, with no mean subtraction. Used in LLaMA-style LLMs.</li></ul>` },
{ h: "Dropout in detail", html: String.raw`
<ul class="kp"><li><b>Inverted dropout</b> scales the kept units by $1/(1-p)$ during training, so inference needs no change.</li>
<li>It can be viewed as training an ensemble of $2^n$ thinned networks that share weights.</li>
<li><b>MC dropout</b>: keep dropout on at test time and average T passes. The spread estimates predictive uncertainty.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>p = 0.2 means scaling by 1.25. BN of (2, 4, 6) maps 6 to ≈ 1.225.</li><li>BN has 2C learnable parameters plus 2C running buffers.</li><li>L1 gives sparsity, L2 shrinks smoothly.</li><li>LayerNorm normalises per sample, BatchNorm per feature across the batch.</li><li>η = 0.1 and λ = 0.01 shrink the weights by 0.999 per step.</li></ul>` }
]};

THEORY.dl3 = { mins: 12, sections: [
{ h: "Why convolutions", html: String.raw`
<p class="lead">Images have local structure, and the same pattern can appear anywhere. A convolution slides one small learned kernel over the whole image. That gives <b>local connectivity</b>, <b>weight sharing</b> and <b>translation equivariance</b>.</p>
<div class="formula">$$y[i,j,c_{out}]=b_{c_{out}}+\sum_{c_{in}}\sum_{u,v}W[u,v,c_{in},c_{out}]\;x[i\cdot S+u,\ j\cdot S+v,\ c_{in}]$$</div>` },
{ h: "Convolution, step by step", anim: "conv", cap: "A 3×3 vertical-edge kernel slides over a 7×7 image (no padding, stride 1). At each position the 9 products are summed into one output cell. The output is 5×5 and lights up exactly where the image has a dark-to-bright vertical edge.", html: String.raw`
<div class="formula">$$\text{out}=\Big\lfloor\frac{W-K+2P}{S}\Big\rfloor+1,\qquad \#\text{params}=K^2C_{in}C_{out}+C_{out},\qquad \text{MACs}=H_{out}W_{out}C_{out}K^2C_{in}$$</div>
<ul class="kp"><li>"Same" padding $P=(K-1)/2$ keeps the size for stride 1. Stride 2 roughly halves it.</li>
<li>The output channel count equals the number of filters. Each filter spans all input channels.</li></ul>` },
{ h: "Pooling and receptive field", html: String.raw`
<ul class="kp"><li><b>Max/avg pooling</b> (2×2, stride 2) halves the resolution, adds small shift invariance, and has no parameters.</li>
<li><b>Receptive field</b> with stride 1 grows by $K-1$ per layer: two 3×3 convs see 5×5, three see 7×7. Downsampling multiplies the later growth.</li>
<li><b>Global average pooling</b> turns C maps into a C-vector for the classifier.</li></ul>` },
{ h: "Efficient convolutions", html: String.raw`
<table class="tbl"><tr><th>Variant</th><th>Idea</th><th>Cost</th></tr>
<tr><td>1×1 conv</td><td>mix channels per pixel</td><td>$C_{in}C_{out}$</td></tr>
<tr><td>Depthwise-separable</td><td>per-channel K×K, then 1×1</td><td>$K^2C_{in}+C_{in}C_{out}$, about $\frac1{C_{out}}+\frac1{K^2}$ of a standard conv</td></tr>
<tr><td>Dilated</td><td>spaced taps</td><td>effective size $K+(K-1)(d-1)$, same parameters</td></tr>
<tr><td>Stacked 3×3</td><td>replace a big kernel</td><td>three 3×3 = $27C^2$ vs one 7×7 = $49C^2$</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>224, K = 7, S = 2, P = 3 gives 112. A 2×2 pool turns 32 into 16.</li><li>3×3 conv, 3 → 64 with bias: 1,792 parameters. 1×1 conv, 256 → 64: 16,448.</li><li>Receptive field = 1 + L(K − 1) for stride 1.</li><li>Parameters don't depend on the image size. FLOPs do.</li></ul>` }
]};

THEORY.dl4 = { mins: 11, sections: [
{ h: "A short history of CNN architectures", html: String.raw`
<table class="tbl"><tr><th>Model</th><th>Year</th><th>Key idea</th></tr>
<tr><td>LeNet-5</td><td>1998</td><td>conv + pool + FC for digits</td></tr>
<tr><td>AlexNet</td><td>2012</td><td>ReLU, dropout, GPUs; won ImageNet</td></tr>
<tr><td>VGG</td><td>2014</td><td>uniform stacks of 3×3 convs</td></tr>
<tr><td>GoogLeNet / Inception</td><td>2014</td><td>parallel multi-scale branches, 1×1 bottlenecks</td></tr>
<tr><td>ResNet</td><td>2015</td><td>residual (skip) connections, 100+ layers</td></tr>
<tr><td>DenseNet</td><td>2017</td><td>concatenate all earlier features</td></tr>
<tr><td>MobileNet / EfficientNet</td><td>2017–19</td><td>depthwise-separable convs, compound scaling</td></tr></table>` },
{ h: "Residual learning and gradient flow", anim: "resflow", cap: "Gradients flow backward through 20 layers. In the plain net each layer multiplies the gradient by about 0.6, so it shrinks to almost nothing by layer 1. With residual connections each block contributes 1 + (a small term), so the gradient reaching early layers stays healthy.", html: String.raw`
<div class="formula">$$y=x+F(x)\quad\Rightarrow\quad\frac{\partial y}{\partial x}=I+\frac{\partial F}{\partial x}$$</div>
<ul class="kp"><li>The <b>degradation problem</b>: deeper plain nets had <i>higher training</i> error. That is an optimisation failure, not overfitting.</li>
<li>Residual blocks only have to learn a correction F. Identity is the easy default (F = 0).</li>
<li>A <b>bottleneck</b> block (1×1 reduce, 3×3, 1×1 expand ×4) makes ResNet-50/101/152 affordable.</li>
<li>Shape mismatch: use a 1×1 projection shortcut with stride 2.</li></ul>` },
{ h: "Transfer learning", html: String.raw`
<ul class="kp"><li>Pre-train on a large dataset (ImageNet or self-supervised), then reuse the backbone.</li>
<li>Small data similar to the pre-training data: freeze the backbone and train the head. Large or different data: fine-tune everything with a small learning rate (often with discriminative, layer-wise rates).</li>
<li>Early layers are generic (edges, textures). Late layers are task-specific.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>A basic block (two 3×3 convs, 64 → 64, no bias) has 73,728 parameters.</li><li>0.5²⁰ ≈ 1e−6 of the gradient survives a 20-layer plain net.</li><li>The ResNet stage-1 bottleneck output is 56×56×256.</li><li>DenseNet concatenates. ResNet adds.</li><li>Stochastic depth drops whole blocks during training.</li></ul>` }
]};

THEORY.dl5 = { mins: 11, sections: [
{ h: "Recurrence", html: String.raw`
<div class="formula">$$h_t=\tanh(W_{hh}h_{t-1}+W_{xh}x_t+b),\qquad y_t=W_{hy}h_t$$</div>
<p>The same weights are applied at every time step. The hidden state $h_t$ summarises the past, so sequences of any length can be handled.</p>
<ul class="kp"><li>Parameters: $h(h+x)+h$ for a vanilla RNN. GRU has 3×, LSTM 4×.</li>
<li><b>BPTT</b> is backprop through the network unrolled in time. Truncated BPTT backprops only the last k steps.</li></ul>` },
{ h: "Vanishing gradients vs gated memory", anim: "rnnflow", cap: "A signal enters at t = 1 and must influence the loss at t = 30. Bars show how much gradient reaches each earlier step. In a vanilla RNN it decays geometrically; in an LSTM the cell state's additive path (forget gate ≈ 1) keeps it alive.", html: String.raw`
<div class="formula">$$\frac{\partial h_T}{\partial h_1}=\prod_{t=2}^T\frac{\partial h_t}{\partial h_{t-1}}\quad\Rightarrow\quad\|\cdot\|\approx\rho^{T-1}$$</div>
<p>With ρ = 0.9 and 50 steps, $0.9^{50}\approx0.005$, so long-range dependencies are nearly invisible to a vanilla RNN.</p>` },
{ h: "LSTM and GRU", html: String.raw`
<div class="formula">$$f_t,i_t,o_t=\sigma(\cdot),\quad \tilde c_t=\tanh(\cdot),\quad c_t=f_t\odot c_{t-1}+i_t\odot\tilde c_t,\quad h_t=o_t\odot\tanh(c_t)$$</div>
<div class="formula">$$\text{GRU: } z_t,r_t=\sigma(\cdot),\quad \tilde h_t=\tanh(W[r_t\odot h_{t-1},x_t]),\quad h_t=(1-z_t)h_{t-1}+z_t\tilde h_t$$</div>
<ul class="kp"><li>The cell update is <b>additive</b>, so $\partial c_t/\partial c_{t-1}=f_t$ can stay near 1. This is the "constant error carousel".</li>
<li>Initialising the forget-gate bias to about 1 helps the network learn long memories.</li>
<li>Exploding gradients are still possible, so clip by norm.</li></ul>` },
{ h: "Sequence models in practice", html: String.raw`
<ul class="kp"><li><b>Bidirectional</b> RNNs see the past and future (for tagging and encoding, not generation).</li>
<li><b>Seq2seq</b>: an encoder RNN feeds a decoder RNN. <b>Teacher forcing</b> feeds the ground-truth previous token during training.</li>
<li>Perplexity $=e^{\text{CE}}$ (nats). With CE = 2 it is ≈ 7.39.</li>
<li>RNNs are sequential, so they are slow to train, but they have O(1) memory per step at inference (an idea revived by state-space models).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>RNN with x = 10, h = 20: 620 parameters. LSTM: 2,480. GRU: 1,860.</li><li>0.9⁵⁰ ≈ 0.005.</li><li>Gates use sigmoid. Candidates use tanh.</li><li>GRU with z = 0 copies the state.</li><li>Clipping preserves the gradient's direction.</li></ul>` }
]};

THEORY.dl6 = { mins: 13, sections: [
{ h: "Attention: soft lookup", html: String.raw`
<p class="lead">Each token asks a question (query), every token offers a description (key) and some content (value). The token takes a weighted average of the values, weighted by how well its query matches each key.</p>
<div class="formula">$$\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}\Big)V,\qquad Q=XW_Q,\ K=XW_K,\ V=XW_V$$</div>
<ul class="kp"><li>Dividing by $\sqrt{d_k}$ keeps the score variance near 1. Otherwise softmax saturates and its gradients vanish.</li>
<li>Cost: $O(n^2d)$ time and $O(n^2)$ memory for the score matrix. Doubling the context quadruples the attention cost.</li></ul>` },
{ h: "Watching attention", anim: "attention", cap: "Each word in turn becomes the query (highlighted). Line thickness shows its attention weights over all words, and the matrix on the right is the full softmax(QKᵀ/√d) map. Toggle the causal mask to see a decoder's lower-triangular attention.", html: String.raw`
<p><b>Multi-head attention</b> runs $h$ attention operations on $d/h$-dimensional projections in parallel, then concatenates them and applies $W_O$. Different heads learn different relations. The total parameters are $4d^2+4d$, whatever the number of heads.</p>` },
{ h: "The Transformer block", html: String.raw`
<div class="formula">$$x\leftarrow x+\operatorname{MHA}(\operatorname{LN}(x)),\qquad x\leftarrow x+\operatorname{FFN}(\operatorname{LN}(x)),\qquad \operatorname{FFN}(x)=W_2\,\sigma(W_1x+b_1)+b_2$$</div>
<ul class="kp"><li>The FFN expands to $4d$ and back, holding about ⅔ of the layer's parameters ($8d^2+5d$).</li>
<li><b>Positional information</b> is needed because attention is permutation-equivariant. Options: sinusoidal, learned, RoPE, ALiBi.</li>
<li><b>Masks</b>: a causal (look-ahead) mask for decoders, padding masks for batching.</li></ul>
<table class="tbl"><tr><th>Family</th><th>Attention</th><th>Objective</th><th>Examples</th></tr>
<tr><td>Encoder-only</td><td>bidirectional</td><td>masked LM</td><td>BERT, ViT</td></tr>
<tr><td>Decoder-only</td><td>causal</td><td>next token</td><td>GPT, LLaMA</td></tr>
<tr><td>Encoder–decoder</td><td>self + cross</td><td>seq2seq</td><td>T5, original Transformer</td></tr></table>` },
{ h: "Inference: the KV cache", html: String.raw`
<p>In causal generation, past keys and values never change. Cache them, and each new token computes only its own $q,k,v$ and attends to the cache. The cache needs $2\cdot L\cdot n\cdot d$ numbers per sequence, which makes memory the bottleneck of long-context serving.</p>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>softmax([2, 1, 0]) ≈ [0.665, 0.245, 0.090].</li><li>MHA with d = 512 has 1,050,624 parameters. The FFN (512, 2048) has 2,099,712.</li><li>For d_k = 64 the unscaled score std is 8.</li><li>Attention is O(n²): 2× context means 4× score memory.</li><li>BERT is a bidirectional MLM. GPT is a causal LM.</li></ul>` }
]};

THEORY.dl7 = { mins: 11, sections: [
{ h: "Autoencoders", html: String.raw`
<div class="formula">$$z=f_\phi(x),\quad \hat x=g_\theta(z),\quad \min\ \|x-\hat x\|^2$$</div>
<ul class="kp"><li>The bottleneck ($\dim z\ll\dim x$) forces the network to compress. A linear autoencoder with MSE learns the PCA subspace.</li>
<li>Variants: <b>denoising</b> (corrupt the input, reconstruct the clean version), <b>sparse</b>, <b>contractive</b>, and <b>masked</b> (MAE).</li>
<li>Uses: compression, denoising, and anomaly detection (high reconstruction error flags anomalies).</li></ul>` },
{ h: "Variational autoencoders", anim: "reparam", cap: "The encoder outputs μ and σ for each input (ellipses). We sample z = μ + σ·ε with ε ~ N(0,1) (dots), which is differentiable in μ and σ. The KL term pulls every ellipse toward the standard-normal prior (dashed circle), filling the latent space so random samples decode well.", html: String.raw`
<div class="formula">$$\log p(x)\ \ge\ \underbrace{\mathbb E_{q_\phi(z|x)}[\log p_\theta(x\mid z)]}_{\text{reconstruction}}-\underbrace{D_{KL}\big(q_\phi(z|x)\,\|\,p(z)\big)}_{\text{regulariser}}=\text{ELBO}$$</div>
<div class="formula">$$z=\mu+\sigma\odot\epsilon,\ \epsilon\sim\mathcal N(0,I)\qquad D_{KL}\big(\mathcal N(\mu,\sigma^2)\|\mathcal N(0,1)\big)=\tfrac12\big(\mu^2+\sigma^2-1-\ln\sigma^2\big)$$</div>
<ul class="kp"><li>The <b>reparameterisation trick</b> moves the randomness into ε, so gradients reach μ and σ.</li>
<li>The ELBO gap equals $D_{KL}(q(z|x)\|p(z|x))\ge0$.</li>
<li>To generate: sample $z\sim\mathcal N(0,I)$ and decode.</li></ul>` },
{ h: "Variants and failure modes", html: String.raw`
<ul class="kp"><li><b>Blurry samples</b>: the Gaussian likelihood (MSE) averages over plausible outputs.</li>
<li><b>β-VAE</b> (β > 1 on the KL) gives more disentangled factors at the cost of reconstruction quality.</li>
<li><b>Posterior collapse</b>: a strong decoder ignores z and q equals the prior. Fixes: KL annealing, free bits.</li>
<li><b>VQ-VAE</b> uses discrete codebook latents, which become tokens for Transformers and audio codecs. The VAE of Stable Diffusion compresses images 8× per side.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>KL(N(1, 1)‖N(0, 1)) = 0.5. KL(N(0.5, 0.8²)‖N(0, 1)) ≈ 0.168.</li><li>z = μ + σε: μ = 2, log σ² = 0, ε = −0.5 gives 1.5.</li><li>ELBO ≤ log p(x).</li><li>MSE corresponds to a Gaussian likelihood, BCE to a Bernoulli one.</li></ul>` }
]};

THEORY.dl8 = { mins: 11, sections: [
{ h: "The adversarial game", html: String.raw`
<div class="formula">$$\min_G\max_D\ V(D,G)=\mathbb E_{x\sim p_{data}}[\log D(x)]+\mathbb E_{z\sim p_z}[\log(1-D(G(z)))]$$</div>
<ul class="kp"><li>The discriminator D classifies real vs fake. The generator G tries to fool it.</li>
<li>Optimal D for a fixed G: $D^*(x)=\dfrac{p_{data}(x)}{p_{data}(x)+p_g(x)}$.</li>
<li>Plugging D* in gives $V=-\log4+2\,\text{JSD}(p_{data}\|p_g)$, minimised when $p_g=p_{data}$ (then $D^*=\tfrac12$).</li>
<li>In practice G maximises $\log D(G(z))$ (the <b>non-saturating</b> loss) for stronger early gradients.</li></ul>` },
{ h: "A GAN learning a 1-D distribution", anim: "gan1d", cap: "Real data (blue) sit around x = 2. The generator's distribution (orange) starts elsewhere. The discriminator's output D(x) (black curve) is high where real data dominate; its gradient pushes the generator toward the real data until D ≈ 0.5 everywhere.", html: String.raw`
<p>The discriminator's gradient tells the generator which direction makes its samples look more real. Training alternates k steps of D, then one step of G.</p>` },
{ h: "Stabilising GANs", html: String.raw`
<ul class="kp"><li><b>Mode collapse</b>: G covers only a few modes.</li>
<li><b>WGAN</b>: the critic estimates the Earth-Mover distance, which gives useful gradients even when the supports don't overlap. It must be 1-Lipschitz (weight clipping or a gradient penalty $\lambda(\|\nabla\hat D\|-1)^2$).</li>
<li><b>Spectral normalisation</b>: $W/\sigma_{max}(W)$ per layer.</li>
<li>Other tools: TTUR (different learning rates), hinge loss, EMA of the generator weights.</li></ul>` },
{ h: "Famous GANs and evaluation", html: String.raw`
<ul class="kp"><li><b>DCGAN</b> (conv architecture guidelines), <b>cGAN/pix2pix</b> (conditional, paired), <b>CycleGAN</b> (unpaired, cycle-consistency), <b>StyleGAN</b> (style modulation, photorealistic faces), <b>BigGAN</b>.</li>
<li><b>FID</b> compares Inception-feature Gaussians: $\|\mu_r-\mu_g\|^2+\operatorname{Tr}(\Sigma_r+\Sigma_g-2(\Sigma_r\Sigma_g)^{1/2})$. Lower is better.</li>
<li>Deepfake detectors look for GAN artefacts: spectral peaks from up-sampling, colour statistics.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>p_d = 0.3 and p_g = 0.1 give D* = 0.75. At equilibrium D* = 0.5 and V = −log 4.</li><li>D(x) = 0.9 and D(G(z)) = 0.2 give a D loss of 0.105 + 0.223 = 0.329.</li><li>The WGAN critic has no sigmoid and must be Lipschitz.</li><li>CycleGAN works on unpaired data. pix2pix needs pairs.</li></ul>` }
]};

THEORY.dl9 = { mins: 12, sections: [
{ h: "The forward process: adding noise", anim: "diffusion", cap: "A 2-D 'data distribution' (a spiral) is noised step by step until it becomes a Gaussian blob (forward process). The learned reverse process runs the film backwards: from noise, repeated small denoising steps recover the spiral.", html: String.raw`
<div class="formula">$$q(x_t\mid x_{t-1})=\mathcal N\big(\sqrt{1-\beta_t}\,x_{t-1},\ \beta_tI\big),\qquad q(x_t\mid x_0)=\mathcal N\big(\sqrt{\bar\alpha_t}\,x_0,\ (1-\bar\alpha_t)I\big),\quad \bar\alpha_t=\prod_{s\le t}(1-\beta_s)$$</div>
<ul class="kp"><li>The forward process is fixed (not learned). After enough steps $\bar\alpha_T\approx0$, so $x_T\approx\mathcal N(0,I)$.</li>
<li>Closed form: $x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon$. Training can jump straight to any t.</li>
<li>$\text{SNR}(t)=\bar\alpha_t/(1-\bar\alpha_t)$ decreases with t.</li></ul>` },
{ h: "Learning to denoise", html: String.raw`
<div class="formula">$$\mathcal L=\mathbb E_{x_0,t,\epsilon}\big\|\epsilon-\epsilon_\theta(\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\ t)\big\|^2$$</div>
<ul class="kp"><li>A network (U-Net or DiT) predicts the added noise. Equivalently it estimates the score: $\nabla\log p(x_t)\approx-\epsilon_\theta/\sqrt{1-\bar\alpha_t}$.</li>
<li>It is a simple regression loss with no adversary, so training is stable and covers all modes.</li>
<li>Time t enters through sinusoidal embeddings in every block.</li></ul>` },
{ h: "Sampling, guidance and speed", html: String.raw`
<ul class="kp"><li><b>DDPM</b> sampling: start from $x_T\sim\mathcal N(0,I)$ and denoise T (e.g. 1000) times.</li>
<li><b>DDIM</b>: a deterministic sampler that reuses the same model in about 20–50 steps and allows inversion.</li>
<li><b>Classifier-free guidance</b>: $\tilde\epsilon=\epsilon_u+w(\epsilon_c-\epsilon_u)$. Higher w means stronger prompt adherence and less diversity.</li>
<li><b>Distillation / consistency models</b>: generation in 1–4 steps.</li>
<li><b>Latent diffusion</b> (Stable Diffusion) runs in VAE latent space, with text entering through cross-attention.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>β = 0.1, 0.2, 0.3 give ᾱ₃ = 0.9·0.8·0.7 = 0.504.</li><li>ᾱ = 0.64, x₀ = 1, ε = 0.5 give x_t = 0.8 + 0.3 = 1.1.</li><li>SNR at ᾱ = 0.8 is 4.</li><li>CFG with w = 7.5, ε_u = 0.2, ε_c = 0.4 gives 1.7.</li><li>The model predicts ε, the noise.</li></ul>` }
]};

THEORY.dl10 = { mins: 11, sections: [
{ h: "Learning without labels", html: String.raw`
<p class="lead">Labels are expensive and data is cheap. Self-supervised learning invents a task from the data itself, pre-trains a big encoder on it, then fine-tunes or linear-probes it on a small labelled task.</p>
<table class="tbl"><tr><th>Family</th><th>Pretext</th><th>Examples</th></tr>
<tr><td>Contrastive</td><td>pull together views of the same item, push apart others</td><td>SimCLR, MoCo, CLIP</td></tr>
<tr><td>Non-contrastive</td><td>agree across views with no negatives</td><td>BYOL, SimSiam, Barlow Twins, DINO</td></tr>
<tr><td>Masked modelling</td><td>reconstruct hidden parts</td><td>BERT, MAE, BEiT</td></tr>
<tr><td>Autoregressive</td><td>predict the next token</td><td>GPT</td></tr></table>` },
{ h: "Contrastive learning and InfoNCE", anim: "contrastive", cap: "Embeddings live on the unit circle. Each colour is one image and its augmented view (a positive pair). The InfoNCE gradient pulls each pair together and pushes different images apart, so clusters form and spread out uniformly.", html: String.raw`
<div class="formula">$$\mathcal L_i=-\log\frac{\exp(\operatorname{sim}(z_i,z_i^+)/\tau)}{\exp(\operatorname{sim}(z_i,z_i^+)/\tau)+\sum_{k}\exp(\operatorname{sim}(z_i,z_k^-)/\tau)}$$</div>
<ul class="kp"><li>This is a softmax classification of the positive among K candidates. At chance the loss is $\log K$. It lower-bounds mutual information.</li>
<li>The temperature τ controls the focus on hard negatives (CLIP learns it, starting at 0.07).</li>
<li><b>SimCLR</b>: strong augmentations, a projection head, large batches. <b>MoCo</b>: a queue of negatives from a momentum encoder.</li></ul>` },
{ h: "Avoiding collapse without negatives", html: String.raw`
<ul class="kp"><li><b>BYOL / SimSiam</b>: a predictor on one branch plus stop-gradient (and an EMA target in BYOL).</li>
<li><b>Barlow Twins</b>: push the cross-correlation matrix toward I. <b>VICReg</b>: variance, invariance and covariance terms.</li>
<li><b>DINO</b>: self-distillation with centring and sharpening, which produces striking attention maps in ViTs.</li></ul>` },
{ h: "Masked modelling and CLIP", html: String.raw`
<ul class="kp"><li><b>MAE</b>: mask 75 % of patches. The encoder sees only the 25 % visible (49 of 196), and a light decoder reconstructs the pixels.</li>
<li><b>CLIP</b>: image and text encoders trained contrastively on 400 M pairs. A batch of N gives N − 1 negatives per item.</li>
<li><b>Zero-shot</b> classification: embed "a photo of a {class}" and pick the most similar class.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>InfoNCE with s⁺ = 0.9, negatives 0.3 and 0.1, τ = 0.1 gives ≈ 0.0028.</li><li>The chance-level loss is log K.</li><li>MAE at 75 % on 196 patches: the encoder sees 49.</li><li>BYOL uses stop-gradient and a predictor, with no negatives.</li><li>Linear probe = frozen features + linear classifier.</li></ul>` }
]};
