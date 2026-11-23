/* Theory for Vision-Language Models (chapters vl1-vl7). */
window.THEORY = window.THEORY || {};

THEORY.vl1 = { mins: 10, sections: [
{ h: "Two ways to see", html: String.raw`
<p class="lead">Every VLM begins with an <b>image encoder</b> that turns pixels into feature vectors. CNNs build features from local filters; Vision Transformers cut the image into patches and let attention relate them globally.</p>
<table class="tbl cm"><tr><th></th><th>CNN (ResNet)</th><th>ViT</th></tr>
<tr><td>Basic unit</td><td>Local convolution</td><td>Patch token + global attention</td></tr>
<tr><td>Inductive bias</td><td>Locality, translation equivariance</td><td>Very little (learned)</td></tr>
<tr><td>Receptive field</td><td>Grows with depth: $1+L(k-1)$</td><td>Global from layer 1</td></tr>
<tr><td>Data needs</td><td>Moderate</td><td>Large (or strong augmentation / distillation)</td></tr></table>` },
{ h: "Patchify, embed, attend", anim: "patchify", cap: "The image is cut into a grid of P×P patches. Each patch is flattened and linearly projected into a token; a learnable [CLS] token and position embeddings are added, and the sequence enters a standard Transformer. Change the patch size to see the token count change quadratically.", html: String.raw`
<div class="formula">$$N=\frac{H}{P}\cdot\frac{W}{P},\qquad z_0=[x_{cls};\,x_1E;\dots;x_NE]+E_{pos},\quad E\in\mathbb R^{(P^2C)\times d}$$</div>
<ul class="kp"><li>ViT-B/16 at 224 px: 196 patches + [CLS] = 197 tokens; patch embedding $768\times768$ weights.</li>
<li>ViT-L/14 at 336 px: 576 patches, the visual tokens of LLaVA-1.5.</li><li>Higher resolution: interpolate position embeddings; tokens grow as (side)², attention as (side)⁴.</li></ul>` },
{ h: "Choosing an encoder for a VLM", html: String.raw`
<ul class="kp"><li><b>CLIP / SigLIP</b>: language-aligned features, the default for VLMs.</li><li><b>DINOv2</b>: self-supervised, strong spatial detail; sometimes combined with CLIP.</li>
<li>Use <b>penultimate-layer patch tokens</b> rather than the final pooled vector.</li><li>Swin / hierarchical ViTs and token merging reduce cost at high resolution.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Tokens = (H/P)(W/P) (+1 for [CLS]).</li><li>Patch-embedding weights = P²·3·d.</li><li>4 conv layers of 3×3 → 9×9 receptive field.</li><li>196 → 576 tokens ≈ 8.6× attention cost.</li></ul>` }
] };

THEORY.vl2 = { mins: 11, sections: [
{ h: "Learning from captions", html: String.raw`
<p class="lead">CLIP trains an image encoder and a text encoder together on hundreds of millions of image–caption pairs. Matching pairs are pulled together, mismatched pairs pushed apart, in one shared embedding space.</p>
<ul class="kp"><li>Natural-language supervision covers far more concepts than fixed labels.</li><li>Result: a classifier for any category you can name.</li></ul>` },
{ h: "The similarity matrix", anim: "clipmatrix", cap: "A batch of N images (rows) and N captions (columns). Training raises the diagonal (true pairs) and lowers everything else. Each row is a softmax over captions and each column a softmax over images; the loss averages both directions.", html: String.raw`
<div class="formula">$$S_{ij}=\tau^{-1}\,\hat v_i^\top\hat t_j,\qquad \mathcal L=\tfrac12\Big[\text{CE}_{\text{rows}}(S,I)+\text{CE}_{\text{cols}}(S,I)\Big]$$</div>
<ul class="kp"><li>Each image has $N-1$ in-batch negatives; CLIP used $N=32{,}768$ (≈ 1.07 B similarities).</li>
<li>Logit scale $1/\tau$ starts at $1/0.07\approx14.3$, clipped at 100.</li></ul>` },
{ h: "Zero-shot classification and SigLIP", html: String.raw`
<ol class="steps"><li>Write prompts: "a photo of a {class}." (ensemble many templates).</li><li>Embed prompts → text classifier weights.</li><li>Embed the image; softmax over scaled cosines.</li></ol>
<div class="formula">$$\text{SigLIP: } \mathcal L=-\frac1N\sum_{i,j}\log\sigma\big(z_{ij}\,(t\,\hat v_i^\top\hat t_j+b)\big),\quad z_{ij}=\pm1$$</div>
<ul class="kp"><li>Pairwise sigmoid: no batch-wide softmax, easy to scale, strong at small batches.</li>
<li>Weaknesses of contrastive models: counting, spatial relations, negation ("bag of concepts").</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>softmax(100·(0.30, 0.25, 0.20)) → 0.993.</li><li>Batch N → N − 1 negatives per image.</li><li>SigLIP positive: −log σ(z); negative: −log σ(−z).</li><li>Prompt wording matters ('a photo of a …').</li></ul>` }
] };

THEORY.vl3 = { mins: 10, sections: [
{ h: "Describing and answering", html: String.raw`
<p class="lead">Captioning generates a description; VQA answers a question. Both are <b>conditional language modelling</b>: $p(\text{text}\mid\text{image})=\prod_t p(w_t\mid w_{<t},\text{image})$.</p>` },
{ h: "Attention while captioning", anim: "captioning", cap: "As each word is generated, the decoder's cross-attention focuses on different image regions (highlighted cells). 'dog' looks at the dog, 'frisbee' at the frisbee, function words spread their attention out.", html: String.raw`
<ul class="kp"><li><b>Show, Attend and Tell</b>: soft attention over CNN grid features.</li><li><b>BLIP</b>: unified encoder/decoder + CapFilt bootstrapping to clean web captions.</li>
<li><b>BLIP-2</b>: 32 learnable queries (Q-Former) bridge a frozen ViT and a frozen LLM.</li><li><b>SCST</b>: RL fine-tuning on CIDEr with a greedy baseline.</li></ul>` },
{ h: "Metrics", html: String.raw`
<table class="tbl cm"><tr><th>Metric</th><th>Idea</th></tr>
<tr><td>VQA accuracy</td><td>$\min(\#\text{humans agreeing}/3,\,1)$</td></tr>
<tr><td>BLEU-4</td><td>n-gram precision × brevity penalty $e^{1-r/c}$ (if $c&lt;r$)</td></tr>
<tr><td>CIDEr</td><td>TF-IDF-weighted n-gram cosine; rewards informative words</td></tr>
<tr><td>SPICE</td><td>Overlap of scene-graph tuples</td></tr></table>
<div class="callout">VQA v2 pairs similar images with different answers to break language priors such as "Is there…? → yes".</div>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>2 of 10 annotators → 0.667; 3+ → 1.</li><li>Unigram precision divides by candidate length.</li><li>BP for 7 vs 10 words = e^{−0.43} ≈ 0.651.</li><li>Overall VQA = share-weighted average.</li></ul>` }
] };

THEORY.vl4 = { mins: 10, sections: [
{ h: "Where do vision and language meet?", html: String.raw`
<table class="tbl cm"><tr><th>Fusion</th><th>How</th><th>Example</th></tr>
<tr><td>Late (dual encoder)</td><td>Separate encoders, compare embeddings</td><td>CLIP, SigLIP</td></tr>
<tr><td>Early (single stream)</td><td>Concatenate image + text tokens in one Transformer</td><td>VisualBERT</td></tr>
<tr><td>Cross-attention</td><td>Text queries attend to image keys/values</td><td>Flamingo</td></tr>
<tr><td>Projection</td><td>Project image tokens into the LLM input</td><td>LLaVA</td></tr></table>` },
{ h: "Gated cross-attention", anim: "xattn", cap: "Text tokens (bottom) send queries to a small set of visual latents (top). The tanh gate starts at 0, so the frozen language model is untouched at first; as training raises α, more visual information flows into the text stream.", html: String.raw`
<div class="formula">$$y=x+\tanh(\alpha)\cdot\text{XAttn}(Q{=}xW_Q,\ K{=}vW_K,\ V{=}vW_V),\qquad \alpha_0=0$$</div>
<ul class="kp"><li>Frozen vision encoder + frozen LLM; train only xattn blocks and the <b>Perceiver resampler</b> (64 latents).</li>
<li>Cross-attention matrix is $T\times M$; visual tokens don't use LLM context.</li>
<li>Trained on <b>interleaved</b> web documents → multimodal in-context few-shot learning.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>tanh(0) = 0 → LM unchanged at init.</li><li>xattn params = 4d².</li><li>Resampler: latents × inputs per head.</li><li>Single-stream cost ∝ (T + M)².</li></ul>` }
] };

THEORY.vl5 = { mins: 11, sections: [
{ h: "The simplest strong recipe", html: String.raw`
<p class="lead">LLaVA showed that a frozen CLIP encoder, a small <b>projector</b> and an LLM, trained on GPT-generated visual instructions, give a capable assistant.</p>
<ol class="steps"><li><b>Stage 1 – alignment</b>: train only the projector on ~558k caption pairs.</li><li><b>Stage 2 – instruction tuning</b>: train projector + LLM on conversations, descriptions and reasoning.</li></ol>` },
{ h: "From patches to tokens in the prompt", anim: "projector", cap: "Patch features from the vision encoder pass through a 2-layer MLP projector and are inserted into the LLM's input sequence before the question. Toggle compression to merge 2×2 patches (pixel-shuffle) and cut the visual-token count by 4.", html: String.raw`
<div class="formula">$$H_v=\text{MLP}\big(\text{ViT}_{-2}(x)\big)\in\mathbb R^{576\times d_{LLM}},\qquad \text{input}=[H_v;\ \text{text tokens}]$$</div>
<ul class="kp"><li>Image tokens come <b>before</b> the question so causal attention lets text see them.</li><li>Loss only on assistant tokens.</li>
<li><b>AnyRes</b> tiling: (tiles + 1 global) × 576 tokens. Pixel-shuffle: (g/f)² tokens of width $f^2d$.</li></ul>` },
{ h: "Trade-offs", html: String.raw`
<table class="tbl cm"><tr><th>More visual tokens</th><th>Fewer visual tokens</th></tr><tr><td>Better OCR, counting, small objects</td><td>Longer chats, more images, faster</td></tr><tr><td>Expensive prefill</td><td>Loss of fine detail</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>2×2 tiles + global = 2,880 tokens.</li><li>Images that fit = ⌊(context − text)/576⌋.</li><li>MLP projector 1,024 → 4,096 → 4,096 ≈ 21M.</li><li>Stage 1 trains only the projector.</li></ul>` }
] };

THEORY.vl6 = { mins: 10, sections: [
{ h: "Beyond describing: pointing", html: String.raw`
<p class="lead">Grounding links words to pixels. Modern VLMs output boxes as <b>text coordinates</b>, masks via special tokens, and read documents at high resolution.</p>
<ul class="kp"><li>Coordinates normalised to [0, 1,000] are resolution-independent: $x_{px}=x/1000\cdot W$.</li>
<li>Open-vocabulary detectors score regions against arbitrary text.</li><li>Set-of-Mark: number regions, let the model refer to marks.</li></ul>` },
{ h: "IoU", anim: "iou", cap: "A predicted box (orange) slides over the ground-truth box (blue). The green area is the intersection; IoU = intersection / union. A detection usually counts as correct at IoU ≥ 0.5; notice how quickly IoU drops with a small shift.", html: String.raw`
<div class="formula">$$\text{IoU}=\frac{|A\cap B|}{|A|+|B|-|A\cap B|},\qquad F_1=\frac{2PR}{P+R}$$</div>
<ul class="kp"><li>mAP averages precision over recall levels, classes and (COCO) IoU 0.50–0.95.</li></ul>` },
{ h: "Documents and OCR", html: String.raw`
<ul class="kp"><li>Small text needs megapixel inputs or tiles: ⌈W/336⌉ × ⌈H/336⌉ crops.</li><li>OCR-free models (Donut, Pix2Struct) read pixels end-to-end.</li>
<li>Recognition ("what") and localisation ("where") are different skills; both need targeted data.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>(0,0,4,4) vs (2,2,6,6): IoU = 4/28.</li><li>Scale x by W and y by H separately.</li><li>TP if IoU ≥ threshold.</li><li>F1 = harmonic mean.</li></ul>` }
] };

THEORY.vl7 = { mins: 9, sections: [
{ h: "How VLMs are tested", html: String.raw`
<table class="tbl cm"><tr><th>Benchmark</th><th>Tests</th></tr><tr><td>VQAv2, GQA</td><td>General visual QA</td></tr><tr><td>TextVQA, DocVQA, ChartQA</td><td>Reading text, documents, charts</td></tr>
<tr><td>MMBench (CircularEval)</td><td>Many skills, robust to option order</td></tr><tr><td>MMMU</td><td>College-level multi-discipline reasoning</td></tr><tr><td>POPE, CHAIR</td><td>Object hallucination</td></tr></table>` },
{ h: "Probing hallucination with POPE", anim: "pope", cap: "POPE asks 'Is there a ⟨object⟩?' for present and absent objects. The confusion matrix fills as answers arrive. A yes-biased model (slider) keeps high recall but its precision and accuracy fall, and the yes-ratio rises above 0.5.", html: String.raw`
<div class="formula">$$P=\frac{TP}{TP+FP},\quad R=\frac{TP}{TP+FN},\quad \text{yes-ratio}=\frac{TP+FP}{N},\quad \text{CHAIR}_i=\frac{\#\text{hallucinated objects}}{\#\text{mentioned objects}}$$</div>
<ul class="kp"><li>Random → popular → adversarial negatives get harder (co-occurrence priors).</li></ul>` },
{ h: "Why VLMs hallucinate and what helps", html: String.raw`
<ul class="kp"><li>Strong LLM priors vs weak visual evidence; low resolution; noisy captions in training data.</li>
<li>Fixes: higher resolution, grounding data, RLHF with factual rewards, <b>visual contrastive decoding</b> $(1+\alpha)\,l_{real}-\alpha\,l_{noisy}$.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>450 TP, 150 FP → precision 0.75, accuracy 0.80, yes-ratio 0.60.</li><li>CHAIR_i = 6/40 = 0.15.</li><li>VCD boosts visually supported tokens.</li><li>Adversarial POPE drop = prior reliance.</li></ul>` }
] };
