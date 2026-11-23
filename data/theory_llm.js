/* Theory for Large Language Models (chapters ll1-ll10). */
window.THEORY = window.THEORY || {};

THEORY.ll1 = { mins: 10, sections: [
{ h: "From text to token IDs", html: String.raw`
<p class="lead">An LLM never sees letters or words. A <b>tokenizer</b> turns text into a sequence of integer IDs from a fixed vocabulary, and the model predicts the next ID.</p>
<table class="tbl cm"><tr><th>Unit</th><th>Vocabulary</th><th>Sequence length</th><th>Problem</th></tr>
<tr><td>Characters / bytes</td><td>Tiny (256)</td><td>Very long</td><td>Expensive attention, slow</td></tr>
<tr><td>Words</td><td>Huge (millions)</td><td>Short</td><td>Unknown words (OOV)</td></tr>
<tr><td><b>Subwords</b></td><td>30k–200k</td><td>Moderate</td><td>Best of both</td></tr></table>
<ul class="kp"><li>Rule of thumb (English): 1 token ≈ 4 characters ≈ 0.75 words.</li></ul>` },
{ h: "Byte-Pair Encoding step by step", anim: "bpe", cap: "BPE on a tiny corpus. Each step counts every adjacent symbol pair (weighted by word frequency), merges the most frequent pair into a new token, and repeats. Frequent fragments such as 'est' and 'low' quickly become single tokens.", html: String.raw`
<ol class="steps"><li>Start from characters (or the 256 bytes).</li><li>Count all adjacent pairs across the corpus.</li><li>Merge the most frequent pair into a new symbol; record the merge.</li><li>Repeat until the vocabulary reaches the target size: $|V| = 256 + M$ (+ specials).</li></ol>
<p>To tokenise new text, apply the learned merges <b>in the same order</b>.</p>` },
{ h: "WordPiece, Unigram and SentencePiece", html: String.raw`
<table class="tbl cm"><tr><th>Method</th><th>Direction</th><th>Merge / prune rule</th><th>Used by</th></tr>
<tr><td>BPE</td><td>Bottom-up</td><td>Most frequent pair</td><td>GPT-2/3/4, LLaMA</td></tr>
<tr><td>WordPiece</td><td>Bottom-up</td><td>Max likelihood gain $\frac{f(ab)}{f(a)f(b)}$, '##' marks continuations</td><td>BERT</td></tr>
<tr><td>Unigram</td><td>Top-down</td><td>Prune tokens that least reduce corpus likelihood</td><td>T5, ALBERT</td></tr></table>
<div class="callout"><b>SentencePiece</b> treats the raw stream (spaces as '▁') so it works for languages without spaces, and is fully reversible.</div>` },
{ h: "Why tokenisation matters", html: String.raw`
<ul class="kp"><li><b>Size</b>: embedding parameters $=V\times d$ (e.g. 32,000 × 4,096 ≈ 131 M).</li>
<li><b>Spelling / counting</b>: letters are hidden inside tokens ('strawberry').</li>
<li><b>Arithmetic</b>: inconsistent digit grouping hides place value; many models split digits.</li>
<li><b>Fairness</b>: low-resource languages need more tokens per word → shorter effective context, higher cost.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Byte-level BPE: vocabulary = 256 + merges + specials (GPT-2: 50,257).</li><li>Embedding params = V × d; tied weights count once.</li><li>Bigger V → shorter sequences, bigger embedding/softmax.</li><li>BPE merges by frequency; WordPiece by likelihood; Unigram prunes.</li></ul>` }
] };

THEORY.ll2 = { mins: 11, sections: [
{ h: "Embeddings carry meaning", html: String.raw`
<p class="lead">Each token ID indexes a row of an embedding matrix $E\in\mathbb R^{V\times d}$. Training pulls tokens used in similar contexts toward similar vectors.</p>
<div class="formula">$$x_t = E[\text{id}_t],\qquad \cos(u,v)=\frac{u\cdot v}{\lVert u\rVert\,\lVert v\rVert}$$</div>` },
{ h: "Why positions are needed", html: String.raw`
<p>Self-attention is a weighted <b>sum</b> over tokens, so it is permutation-invariant: "dog bites man" and "man bites dog" would look identical. Positional information must be injected.</p>
<table class="tbl cm"><tr><th>Scheme</th><th>Where</th><th>Extrapolates?</th><th>Used by</th></tr>
<tr><td>Sinusoidal</td><td>Added to input</td><td>Somewhat</td><td>Original Transformer</td></tr>
<tr><td>Learned absolute</td><td>Added to input</td><td>No (fixed max length)</td><td>BERT, GPT-2</td></tr>
<tr><td>RoPE</td><td>Rotates q, k in attention</td><td>With scaling tricks</td><td>LLaMA, Mistral, Qwen</td></tr>
<tr><td>ALiBi</td><td>Bias on attention scores</td><td>Yes</td><td>BLOOM, MPT</td></tr></table>
<div class="formula">$$PE_{(pos,2i)}=\sin\!\Big(\frac{pos}{10000^{2i/d}}\Big),\quad PE_{(pos,2i+1)}=\cos\!\Big(\frac{pos}{10000^{2i/d}}\Big)$$</div>` },
{ h: "Rotary position embedding (RoPE)", anim: "rope", cap: "RoPE rotates each 2-D slice of the query and key by an angle proportional to its position. Slide the two positions: the absolute angles change, but the angle between q and k (and so their dot product) depends only on the offset m − n.", html: String.raw`
<div class="formula">$$q_m = R(m\theta)\,q,\quad k_n = R(n\theta)\,k\ \Rightarrow\ q_m^\top k_n = q^\top R\big((n-m)\theta\big)k$$</div>
<ul class="kp"><li>Different pairs use different frequencies $\theta_i=\text{base}^{-2i/d}$, like clock hands.</li>
<li><b>Position interpolation</b>: divide positions by the extension factor to stay in the trained range.</li>
<li><b>Base scaling</b> (e.g. 10,000 → 500,000) lengthens wavelengths for long context.</li></ul>` },
{ h: "ALiBi", html: String.raw`
<div class="formula">$$\text{score}_{ij}=q_i^\top k_j-m_h\,|i-j|$$</div>
<ul class="kp"><li>Fixed slope $m_h$ per head (geometric series), nothing added to inputs.</li><li>Distant tokens are penalised linearly; trains short, tests long.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Attention without positions is order-blind.</li><li>RoPE: relative angle = (m − n)θ.</li><li>Sinusoid pair i = 0 has wavelength 2π (fastest).</li><li>ALiBi bias = −m·|i − j|.</li><li>Learned absolute embeddings cannot exceed the trained length.</li></ul>` }
] };

THEORY.ll3 = { mins: 13, sections: [
{ h: "Next-token prediction", html: String.raw`
<div class="formula">$$p(x_1,\dots,x_T)=\prod_{t=1}^T p(x_t\mid x_{<t}),\qquad \mathcal L=-\frac1T\sum_t\log p_\theta(x_t\mid x_{<t})$$</div>
<p class="lead">A decoder-only Transformer (GPT, LLaMA) reads tokens left to right. With a causal mask, one forward pass trains every position at once (<b>teacher forcing</b>).</p>` },
{ h: "Causal self-attention", anim: "causal", cap: "Each row is a query token, each column a key. The causal mask blanks the upper triangle (future tokens), so token t mixes information only from tokens 1…t. Step through the rows to see each token's attention weights; every row still sums to 1.", html: String.raw`
<div class="formula">$$\text{Attn}(Q,K,V)=\text{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}+M\Big)V,\qquad M_{ij}=\begin{cases}0 & j\le i\\-\infty & j>i\end{cases}$$</div>
<ul class="kp"><li>Mask <b>before</b> softmax so each row still sums to 1.</li><li>Multi-head: $h$ heads of size $d/h$, concatenated and projected by $W_O$.</li>
<li>GQA / MQA share K/V heads across query heads to shrink the KV cache.</li></ul>` },
{ h: "The block", html: String.raw`
<div class="formula">$$x \leftarrow x+\text{Attn}(\text{Norm}(x)),\qquad x\leftarrow x+\text{MLP}(\text{Norm}(x))$$</div>
<ul class="kp"><li><b>Pre-norm</b> keeps a clean residual stream → stable deep training. RMSNorm: $x/\text{RMS}(x)\cdot g$.</li>
<li>MLP: $d\to4d\to d$ (GELU), or SwiGLU $(\text{Swish}(xW_1)\odot xW_3)W_2$ with hidden ≈ $\tfrac83d$.</li>
<li>Final norm → unembedding $W_{out}$ → logits over $V$.</li></ul>` },
{ h: "Counting parameters and FLOPs", html: String.raw`
<table class="tbl"><tr><th>Part</th><th>Parameters</th></tr><tr><td>Attention (Q, K, V, O)</td><td>$4d^2$</td></tr><tr><td>MLP ($d\to4d\to d$)</td><td>$8d^2$</td></tr><tr><td>Per block</td><td>$\approx12d^2$</td></tr><tr><td>Embeddings</td><td>$Vd$ (+ positions)</td></tr></table>
<div class="callout"><b>GPT-2 small:</b> $12\cdot12\cdot768^2=84.9$M + $50{,}257\cdot768=38.6$M + $1{,}024\cdot768=0.8$M ≈ <b>124M</b>. Training compute ≈ $6ND$ FLOPs; inference ≈ $2N$ per token.</div>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Causal mask: −∞ above the diagonal, before softmax.</li><li>d_head = d/h (4,096/32 = 128).</li><li>12d² per block; MLP holds two-thirds.</li><li>Score matrix memory ∝ T² per head.</li></ul>` }
] };

THEORY.ll4 = { mins: 11, sections: [
{ h: "Objectives", html: String.raw`
<table class="tbl cm"><tr><th>Objective</th><th>Model type</th><th>Predicts</th></tr>
<tr><td>Causal LM</td><td>Decoder (GPT)</td><td>Next token from the left context</td></tr>
<tr><td>Masked LM</td><td>Encoder (BERT)</td><td>15 % masked tokens from both sides</td></tr>
<tr><td>Span corruption</td><td>Encoder–decoder (T5)</td><td>Missing spans behind sentinels</td></tr></table>
<div class="formula">$$\text{PPL}=\exp\Big(-\frac1T\sum_t\log p(x_t\mid x_{<t})\Big),\qquad \text{uniform guess: } \text{PPL}=V,\ \mathcal L=\ln V$$</div>` },
{ h: "Scaling laws", anim: "scaling", cap: "Loss versus compute on log–log axes for several model sizes (grey curves). Each size eventually flattens; the envelope of best runs is a straight power law. The Chinchilla point for a chosen budget balances parameters and tokens at about 20 tokens per parameter. Drag the budget slider.", html: String.raw`
<div class="formula">$$L(N,D)=E+\frac{A}{N^{\alpha}}+\frac{B}{D^{\beta}},\qquad C\approx6ND$$</div>
<ul class="kp"><li>Kaplan (2020): loss falls as a power law in $N$, $D$, $C$.</li>
<li>Chinchilla (2022): compute-optimal $D\approx20N$; Chinchilla 70B/1.4T beat Gopher 280B/300B.</li>
<li>Plug $D=20N$ into $C=6ND$: $N=\sqrt{C/120}$.</li>
<li>Serving costs favour over-training smaller models (e.g. 8B on 15T tokens).</li></ul>` },
{ h: "Data is the other half", html: String.raw`
<ul class="kp"><li>Filtering (heuristics + quality classifiers), deduplication (exact and MinHash), toxicity/PII removal.</li>
<li>Mixtures up-weight code, maths, books; tuned on small proxy models.</li>
<li>Bits-per-byte compares models with different tokenizers.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>PPL = e^{loss}; loss 2.0 → 7.39.</li><li>PPL of probabilities (0.5, 0.25, 0.125) = 4 (geometric mean).</li><li>Chinchilla: 7B → 140B tokens.</li><li>10× params with α = 0.076 → loss × 0.84.</li></ul>` }
] };

THEORY.ll5 = { mins: 11, sections: [
{ h: "From base model to assistant", html: String.raw`
<p class="lead">A base model continues text. <b>Supervised fine-tuning</b> (SFT) on (instruction, response) pairs teaches it to answer. The loss is masked on prompt tokens so only responses are learned.</p>
<ul class="kp"><li>Full fine-tuning with Adam in mixed precision ≈ 16 bytes/param (7B → ~112 GB before activations).</li>
<li>Risk: <b>catastrophic forgetting</b> of general skills. Use low LR, few epochs, replay data or PEFT.</li></ul>` },
{ h: "LoRA", anim: "lora", cap: "LoRA keeps the large frozen matrix W (grey) and trains two thin matrices B (d×r) and A (r×k). Their product BA is a full-size but rank-r update. Change r to see how few parameters are trainable compared with W.", html: String.raw`
<div class="formula">$$W'=W+\frac{\alpha}{r}BA,\qquad B\in\mathbb R^{d\times r},\ A\in\mathbb R^{r\times k},\ r\ll\min(d,k)$$</div>
<ul class="kp"><li>Trainable: $r(d+k)$ vs $dk$. For 4,096², r = 8: 65,536 vs 16.8 M (0.39 %).</li>
<li>$B=0$ at init → training starts exactly from the pre-trained model.</li><li>Merge $BA$ into $W$ after training → no extra latency.</li>
<li>Motivation: fine-tuning updates have low <b>intrinsic rank</b>.</li></ul>` },
{ h: "The PEFT family", html: String.raw`
<table class="tbl cm"><tr><th>Method</th><th>What is trained</th><th>Extra latency?</th></tr>
<tr><td>LoRA</td><td>Low-rank $\Delta W$</td><td>No (after merge)</td></tr>
<tr><td>QLoRA</td><td>LoRA on a 4-bit NF4 frozen base</td><td>Dequantisation</td></tr>
<tr><td>Adapters</td><td>Bottleneck MLPs inside blocks</td><td>Yes</td></tr>
<tr><td>Prefix tuning</td><td>K/V prefixes in every layer</td><td>Slightly longer context</td></tr>
<tr><td>Prompt tuning</td><td>Soft input embeddings only</td><td>Slightly longer context</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>LoRA params = r(d + k) per matrix × matrices × layers.</li><li>Scale = α/r.</li><li>4-bit = 0.5 B/param (7B → 3.5 GB).</li><li>Mask prompt tokens in the SFT loss.</li></ul>` }
] };

THEORY.ll6 = { mins: 12, sections: [
{ h: "Why align?", html: String.raw`
<p class="lead">Next-token prediction imitates the internet, not a helpful, honest and harmless assistant. Alignment uses <b>human (or AI) preferences</b> to steer behaviour.</p>
<ol class="steps"><li><b>SFT</b> on demonstrations.</li><li><b>Reward model</b> from pairwise comparisons.</li><li><b>RL</b> (PPO) to maximise reward with a KL leash to the SFT model.</li></ol>` },
{ h: "Reward models and preferences", anim: "pref", cap: "Bradley–Terry preference model. The probability that the chosen response wins is the sigmoid of the reward gap; the reward-model loss is −log of that probability. Drag the gap: correct, confident orderings have small loss, wrong orderings large loss.", html: String.raw`
<div class="formula">$$P(y_w\succ y_l)=\sigma\big(r(x,y_w)-r(x,y_l)\big),\qquad \mathcal L_{RM}=-\log\sigma(r_w-r_l)$$</div>
<div class="formula">$$\max_\pi\ \mathbb E_{y\sim\pi}[r(x,y)]-\beta\,\mathrm{KL}\big(\pi(\cdot|x)\,\Vert\,\pi_{ref}(\cdot|x)\big)$$</div>
<ul class="kp"><li>The KL term limits <b>reward hacking</b> (length, flattery, confident errors).</li></ul>` },
{ h: "DPO: skip the reward model", html: String.raw`
<p>The KL-regularised optimum is $\pi^*\propto\pi_{ref}\exp(r/\beta)$, so $r=\beta\log\frac{\pi}{\pi_{ref}}+\text{const}$. Substituting into Bradley–Terry gives a simple classification loss:</p>
<div class="formula">$$\mathcal L_{DPO}=-\log\sigma\Big(\beta\Big[\log\frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)}-\log\frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\Big]\Big)$$</div>
<table class="tbl cm"><tr><th></th><th>PPO-RLHF</th><th>DPO</th></tr><tr><td>Models in memory</td><td>Policy, reference, reward, value</td><td>Policy, reference</td></tr><tr><td>Sampling during training</td><td>Yes (on-policy)</td><td>No (offline pairs)</td></tr><tr><td>Stability</td><td>Fragile</td><td>Simple, stable</td></tr></table>` },
{ h: "Beyond: RLAIF and failure modes", html: String.raw`
<ul class="kp"><li><b>Constitutional AI / RLAIF</b>: AI feedback guided by written principles.</li><li><b>Best-of-n</b>: KL ≈ $\ln n-(n-1)/n$.</li>
<li>Failure modes: sycophancy, verbosity, over-refusal, alignment tax.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>σ(2.0 − 0.5) = 0.818; loss = 0.201.</li><li>DPO loss at zero margin = ln 2.</li><li>β small → policy can drift further.</li><li>Steadily longer outputs → length reward hacking.</li></ul>` }
] };

THEORY.ll7 = { mins: 11, sections: [
{ h: "Turning probabilities into text", html: String.raw`
<p class="lead">The model outputs a distribution over the vocabulary; a <b>decoding strategy</b> picks the next token. The same model can be boring, creative or nonsensical depending on this choice.</p>
<table class="tbl cm"><tr><th>Strategy</th><th>Rule</th><th>Good for</th></tr>
<tr><td>Greedy</td><td>argmax</td><td>Short factual answers</td></tr><tr><td>Beam search</td><td>Keep top B partial sequences</td><td>Translation, summarisation</td></tr>
<tr><td>Temperature</td><td>softmax(z/T)</td><td>Controlling randomness</td></tr><tr><td>Top-k</td><td>Sample among k best</td><td>Cutting the tail</td></tr>
<tr><td>Top-p</td><td>Smallest set with mass ≥ p</td><td>Adaptive creativity</td></tr><tr><td>Min-p</td><td>Keep p ≥ min_p·p_max</td><td>Adaptive, simple</td></tr></table>` },
{ h: "Temperature and nucleus", anim: "sampling", cap: "Next-token distribution for 'The cat sat on the …'. Lowering T sharpens the bars toward the top choice; raising T flattens them. The shaded bars are the top-p nucleus actually sampled from; drag p to see the set grow or shrink.", html: String.raw`
<div class="formula">$$p_i(T)=\frac{e^{z_i/T}}{\sum_j e^{z_j/T}},\qquad \text{nucleus}=\min\Big\{S:\sum_{i\in S}p_i\ge p\Big\}$$</div>
<ul class="kp"><li>T → 0: greedy. T = 1: the model's own distribution. T &gt; 1: flatter, riskier.</li></ul>` },
{ h: "Beam search and speculative decoding", html: String.raw`
<ul class="kp"><li>Beam: B × V candidates per step; normalise scores by length$^\alpha$ to avoid short outputs.</li>
<li><b>Speculative decoding</b>: a small draft proposes k tokens; the big model verifies them in one pass with rejection sampling, so the output distribution is unchanged.</li></ul>
<div class="formula">$$\mathbb E[\text{tokens per pass}]=\frac{1-\alpha^{k+1}}{1-\alpha}$$</div>
<ul class="kp"><li>Constrained decoding masks tokens that would break a grammar (e.g. JSON).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>softmax(2,1,0) top = 0.665; at T = 0.5 → 0.867.</li><li>Top-p 0.8 on (0.5, 0.2, 0.15, …) keeps 3.</li><li>Renormalise the kept set.</li><li>Speculative decoding keeps quality identical.</li></ul>` }
] };

THEORY.ll8 = { mins: 11, sections: [
{ h: "Open-book answering", html: String.raw`
<p class="lead">An LLM's knowledge is frozen at training time and blurry on details. <b>Retrieval-augmented generation</b> fetches relevant passages at query time and puts them in the prompt.</p>
<ol class="steps"><li><b>Index</b>: split documents into chunks, embed each, store in a vector index.</li><li><b>Retrieve</b>: embed the query, find nearest chunks (plus BM25 for keywords).</li><li><b>Re-rank</b> top candidates with a cross-encoder.</li><li><b>Generate</b> with the chunks in context; cite sources.</li></ol>` },
{ h: "Retrieval in embedding space", anim: "rag", cap: "Document chunks embedded in 2-D. The query (star) retrieves its k nearest chunks by cosine similarity (highlighted); those are the passages pasted into the prompt. Change k to trade recall against prompt length and noise.", html: String.raw`
<div class="formula">$$\text{score}(q,d)=\frac{q\cdot d}{\lVert q\rVert\lVert d\rVert},\qquad \text{RRF}(d)=\sum_{\text{rankers}}\frac{1}{k+\text{rank}(d)}$$</div>
<table class="tbl cm"><tr><th></th><th>Bi-encoder</th><th>Cross-encoder</th></tr><tr><td>Input</td><td>Query and doc separately</td><td>Query + doc together</td></tr><tr><td>Precompute docs?</td><td>Yes</td><td>No</td></tr><tr><td>Role</td><td>First-stage retrieval</td><td>Re-ranking top-k</td></tr></table>` },
{ h: "Engineering details", html: String.raw`
<ul class="kp"><li><b>Chunking</b>: ~200–1,000 tokens with overlap; chunks ≈ ⌈(L − overlap)/stride⌉.</li>
<li><b>ANN indexes</b> (HNSW, IVF-PQ) trade exactness for speed; raw storage = N·d·bytes.</li>
<li><b>Lost in the middle</b>: put the best evidence first or last.</li><li><b>HyDE</b>: embed a hypothetical answer to search.</li>
<li>End-to-end accuracy ≈ recall·acc(hit) + (1 − recall)·acc(miss).</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Rank by cosine, not raw dot product, when norms differ.</li><li>RRF with k = 60: 1/61 + 1/63 ≈ 0.0323.</li><li>10⁶ × 768 float32 ≈ 3.07 GB.</li><li>RAG can't fix wrong sources.</li></ul>` }
] };

THEORY.ll9 = { mins: 12, sections: [
{ h: "Prefill and decode", html: String.raw`
<p class="lead">Generation has two phases. <b>Prefill</b> processes the prompt in parallel (compute-bound). <b>Decode</b> produces one token per step (memory-bandwidth-bound): every step reads all the weights.</p>
<div class="formula">$$\text{tokens/s (batch 1)}\lesssim\frac{\text{memory bandwidth}}{\text{model bytes}}$$</div>
<div class="callout">7B in fp16 = 14 GB. At 1 TB/s: ≈ 71 tokens/s. In 4-bit (3.5 GB): ≈ 286 tokens/s.</div>` },
{ h: "The KV cache", anim: "kvcache", cap: "Without a cache (top), every new token recomputes keys and values for the whole prefix. With a cache (bottom), only the new token's K and V are computed and appended. The counters show the total work; the cached version grows linearly per step instead of quadratically.", html: String.raw`
<div class="formula">$$\text{KV bytes}=2\times L\times h_{kv}\times d_{head}\times\text{bytes}\times T\times B$$</div>
<ul class="kp"><li>32 layers, 32 heads, 128 dims, fp16 → 0.5 MiB per token; 4k context × batch 8 = 16 GiB.</li>
<li><b>GQA/MQA</b> cut $h_{kv}$; <b>PagedAttention</b> removes fragmentation; continuous batching keeps GPUs busy.</li></ul>` },
{ h: "Quantisation, FlashAttention, MoE", html: String.raw`
<table class="tbl cm"><tr><th>Technique</th><th>Idea</th></tr>
<tr><td>Quantisation (int8/int4, GPTQ, AWQ)</td><td>Fewer bits per weight; scale = max|w|/127 for symmetric int8</td></tr>
<tr><td>Outlier handling (LLM.int8, SmoothQuant)</td><td>Protect or rebalance a few huge activation channels</td></tr>
<tr><td>FlashAttention</td><td>Exact attention in on-chip tiles; never stores T × T</td></tr>
<tr><td>Speculative decoding</td><td>Draft + verify several tokens per big pass</td></tr>
<tr><td>Mixture of Experts</td><td>Top-2 of 8 experts per token: 47B total, ~13B active (Mixtral)</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Decode is memory-bound; bandwidth ÷ bytes = token ceiling.</li><li>KV cache ∝ layers × KV heads × head_dim × tokens × batch.</li><li>32 → 8 KV heads = 1/4 cache.</li><li>int8: 2.54/127 = 0.02, w = 1.0 → 50.</li></ul>` }
] };

THEORY.ll10 = { mins: 10, sections: [
{ h: "Measuring an LLM", html: String.raw`
<table class="tbl cm"><tr><th>Kind</th><th>Examples</th><th>Watch out for</th></tr>
<tr><td>Knowledge MCQ</td><td>MMLU (57 subjects)</td><td>Contamination, chance = 25 %</td></tr>
<tr><td>Code</td><td>HumanEval, MBPP (pass@k)</td><td>Weak tests</td></tr>
<tr><td>Maths / reasoning</td><td>GSM8K, MATH</td><td>Answer-format parsing</td></tr>
<tr><td>Open-ended</td><td>LLM-as-judge, Chatbot Arena</td><td>Length and position bias</td></tr></table>
<div class="formula">$$\text{pass@}k=1-\frac{\binom{n-c}{k}}{\binom nk}$$</div>` },
{ h: "Calibration", anim: "calib", cap: "Reliability diagram. Each bar is the accuracy of answers given at that confidence; the diagonal is perfect calibration. Bars below the diagonal mean overconfidence. Slide the overconfidence knob to see ECE rise.", html: String.raw`
<div class="formula">$$\text{ECE}=\sum_b\frac{n_b}{N}\,\big|\text{acc}_b-\text{conf}_b\big|$$</div>
<ul class="kp"><li>Calibrated confidence lets systems abstain or ask for help when unsure.</li><li>RLHF often makes stated confidence less calibrated.</li></ul>` },
{ h: "Hallucination", html: String.raw`
<ul class="kp"><li><b>Intrinsic</b>: contradicts the source. <b>Extrinsic</b>: adds unverifiable content.</li>
<li>Causes: next-token objective rewards fluency, gaps in knowledge, high temperature, pressure to always answer.</li>
<li>Mitigations: RAG with citations, abstention ("I don't know"), self-consistency checks (SelfCheckGPT), verification tools, low temperature for facts.</li></ul>
<div class="callout"><b>Contamination check.</b> 92 % on a public benchmark but 68 % on a freshly written equivalent → memorisation, not ability.</div>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>pass@1 = c/n; pass@2 (n = 10, c = 3) = 0.533.</li><li>ECE weights bins by size.</li><li>Rating gap = ln(p/(1 − p)); 60 % → 0.405.</li><li>Judge biases: position, length, self-preference.</li></ul>` }
] };
