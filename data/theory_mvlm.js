/* Theory for Multimodal (MVLM) (chapters mv1-mv6). */
window.THEORY = window.THEORY || {};

THEORY.mv1 = { mins: 10, sections: [
{ h: "Everything becomes a sequence", html: String.raw`
<p class="lead">Transformers read sequences. To handle images, audio or video, each modality needs a <b>tokenizer</b>: continuous embeddings (good for understanding) or discrete codes (good for generation with a language-model head).</p>
<table class="tbl cm"><tr><th>Modality</th><th>Continuous tokens</th><th>Discrete tokens</th></tr>
<tr><td>Image</td><td>ViT patch embeddings</td><td>VQ-VAE / VQGAN codes (e.g. 32×32)</td></tr>
<tr><td>Audio</td><td>Mel-spectrogram frames (Whisper)</td><td>Codec RVQ codes (EnCodec), HuBERT units</td></tr>
<tr><td>Video</td><td>Space-time patches</td><td>3-D VQ codes</td></tr></table>` },
{ h: "Vector quantisation", anim: "vqcode", cap: "Encoder outputs (small dots) are snapped to the nearest codebook vector (large markers); the code index becomes the token. The codebook moves toward the points assigned to it. Watch for 'dead' codes that receive no points: that is codebook collapse.", html: String.raw`
<div class="formula">$$k=\arg\min_j\lVert z_e-e_j\rVert,\quad z_q=e_k,\quad \mathcal L=\lVert x-\hat x\rVert^2+\lVert sg[z_e]-e_k\rVert^2+\beta\lVert z_e-sg[e_k]\rVert^2$$</div>
<ul class="kp"><li>Straight-through gradient: $z_q=z_e+sg[z_q-z_e]$.</li><li>Bits per token = $\log_2K$ (8,192 → 13 bits).</li>
<li><b>RVQ</b>: quantise the residual again; N stages of K give $K^N$ combinations.</li></ul>` },
{ h: "Audio codecs and token budgets", html: String.raw`
<div class="formula">$$\text{tokens}=\text{frames/s}\times\text{codebooks}\times\text{seconds},\qquad \text{bitrate}=\text{frames/s}\times\text{codebooks}\times\log_2K$$</div>
<ul class="kp"><li>75 Hz × 8 codebooks × 10 bits = 6 kbps; 10 s → 6,000 tokens.</li><li>Image: 256 px with factor 16 → 256 tokens; factor 8 → 1,024.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>Nearest-codebook assignment.</li><li>log₂ K bits per token.</li><li>RVQ is coarse-to-fine; combinations multiply.</li><li>Whisper: 3,000 Mel frames → 1,500 after stride-2 conv.</li></ul>` }
] };

THEORY.mv2 = { mins: 10, sections: [
{ h: "Why video is hard", html: String.raw`
<p class="lead">A minute of video at 30 fps is 1,800 images. Video-language models must decide <b>which frames</b> to keep, <b>how many tokens</b> per frame, and <b>how to model time</b>.</p>
<div class="formula">$$\text{visual tokens}=\underbrace{\text{duration}\times\text{sampled fps}}_{\text{frames}}\times\text{tokens per frame}$$</div>` },
{ h: "Sampling and token budgets", anim: "frames", cap: "A timeline of a long video. Uniform sampling picks evenly spaced frames (blue ticks); the short event (orange) can fall between samples. Raise the frame count to catch it, and watch the token total grow against the context budget.", html: String.raw`
<ul class="kp"><li><b>Uniform sampling</b>: one frame every duration/F seconds.</li><li><b>Pooling/merging</b>: 576 → 64–144 tokens per frame.</li>
<li><b>Tubelets</b> (ViViT): $t\times P\times P$ space-time patches → $(T/t)(H/P)(W/P)$ tokens.</li><li><b>Long video</b>: memory, segment captions + retrieval, timestamps in text.</li></ul>` },
{ h: "Modelling time", html: String.raw`
<table class="tbl cm"><tr><th>Approach</th><th>Idea</th><th>Cost</th></tr>
<tr><td>3-D CNN (I3D)</td><td>Kernels span time</td><td>Local in time</td></tr><tr><td>Two-stream</td><td>RGB + optical flow</td><td>Flow is expensive</td></tr>
<tr><td>Joint space-time attention</td><td>All TN tokens attend</td><td>$(TN)^2$</td></tr><tr><td>Divided attention (TimeSformer)</td><td>Time then space</td><td>$T^2N+N^2T$</td></tr></table>
<div class="callout"><b>Static bias</b>: if a single frame scores almost as well as the full clip, the benchmark isn't testing time.</div>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>2 min × 1 fps × 64 = 7,680 tokens.</li><li>16 frames, tubelet 2×16×16 at 224 px → 1,568.</li><li>Frames that fit = ⌊(C − text)/per-frame⌋.</li><li>(8 × 196)² ≈ 2.46M scores per head.</li></ul>` }
] };

THEORY.mv3 = { mins: 11, sections: [
{ h: "From waveform to features", anim: "melspec", cap: "A synthetic utterance: the waveform (top) is cut into overlapping windows; each window's frequency content becomes one column of the Mel spectrogram (bottom). Horizontal bands are formants and harmonics; the hop sets how many columns per second.", html: String.raw`
<div class="formula">$$\text{frames}\approx\frac{\text{duration}}{\text{hop}},\qquad \text{mel}(f)=2595\log_{10}\!\Big(1+\frac f{700}\Big)$$</div>
<ul class="kp"><li>16 kHz, 25 ms window, 10 ms hop → 100 frames/s; Whisper uses 80 Mel bins on 30 s chunks.</li></ul>` },
{ h: "Recognising speech", html: String.raw`
<table class="tbl cm"><tr><th>Model</th><th>Training</th><th>Key idea</th></tr>
<tr><td>CTC (DeepSpeech)</td><td>Supervised</td><td>Sum over alignments with a blank; collapse repeats then drop blanks</td></tr>
<tr><td>wav2vec 2.0 / HuBERT</td><td>Self-supervised</td><td>Mask latent frames; contrastive or cluster targets</td></tr>
<tr><td>Whisper</td><td>Weakly supervised, 680k h</td><td>Encoder–decoder with task/language tokens</td></tr></table>
<div class="formula">$$\text{WER}=\frac{S+D+I}{N_{ref}}$$</div>` },
{ h: "Generating speech", html: String.raw`
<ul class="kp"><li><b>Codec LMs</b> (VALL-E, AudioLM): predict codec tokens from text + 3-s voice prompt; semantic tokens first, acoustic tokens after.</li>
<li><b>Speech LLMs</b>: audio encoder → projector → LLM (the LLaVA recipe for sound).</li><li><b>Full-duplex</b> models (Moshi) listen and speak at once, keeping tone and timing.</li>
<li>Risks: voice cloning, deepfake audio; Whisper can hallucinate text in silence.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>'the cat sat on the mat' → 'the cat sit on mat': WER 2/6.</li><li>5 s at 10 ms hop ≈ 500 frames.</li><li>1,000 Hz ≈ 1,000 mel.</li><li>CTC 'c c − a − a t t' → 'caat'.</li></ul>` }
] };

THEORY.mv4 = { mins: 11, sections: [
{ h: "One model, many outputs", html: String.raw`
<p class="lead">Any-to-any systems accept and produce mixed modalities. Two generation routes dominate: <b>autoregressive tokens</b> (images as VQ codes predicted like words) and <b>diffusion decoders</b> conditioned on the model's hidden states.</p>
<table class="tbl cm"><tr><th></th><th>AR tokens</th><th>Diffusion</th></tr><tr><td>Steps</td><td>One per token (1,024 for 32×32)</td><td>20–50 denoising steps (1–4 if distilled)</td></tr>
<tr><td>Strength</td><td>Unified with text LM, interleaved output</td><td>High image quality</td></tr><tr><td>Speed-up</td><td>MaskGIT parallel decoding</td><td>Latent space, distillation</td></tr></table>` },
{ h: "Classifier-free guidance", anim: "cfg", cap: "Samples from a 2-D toy diffusion model. The unconditional model covers all clusters; the conditional prediction leans toward the prompted cluster. Raising the guidance scale w pushes samples further in that direction: tighter, more prompt-faithful, but less diverse and eventually off the data.", html: String.raw`
<div class="formula">$$\hat\epsilon=\epsilon_\theta(x_t,\varnothing)+w\big(\epsilon_\theta(x_t,c)-\epsilon_\theta(x_t,\varnothing)\big)$$</div>
<ul class="kp"><li>w = 0 unconditional, w = 1 plain conditional, w ≈ 5–8 typical.</li><li>Train with ~10 % condition dropout; two passes per step at inference.</li></ul>` },
{ h: "Latent diffusion and editing", html: String.raw`
<ul class="kp"><li>VAE: 512×512×3 → 64×64×4 (48× fewer values); factor 8 per side.</li>
<li>InstructPix2Pix: condition on image + instruction, two guidance scales (image, text).</li>
<li>MaskGIT cosine schedule: masked fraction $\cos(\tfrac\pi2\cdot t/T)$.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>0.2 + 7.5·0.3 = 2.45.</li><li>30 steps with CFG = 60 passes.</li><li>128×128 latent × 8 = 1,024 px.</li><li>1,024 tokens at 50 tok/s ≈ 20.5 s.</li></ul>` }
] };

THEORY.mv5 = { mins: 10, sections: [
{ h: "Sharing a backbone", html: String.raw`
<ul class="kp"><li><b>Unified Transformers</b> (Chameleon): one sequence of text + image tokens, one set of weights; QK-norm for stability.</li>
<li><b>Modality experts</b> (VLMo, BEiT-3): shared attention, separate FFNs per modality.</li>
<li><b>ImageBind</b>: align audio, depth, thermal, IMU and text to images → emergent cross-modal links.</li></ul>` },
{ h: "Routing tokens to experts", anim: "moe", cap: "Tokens from two modalities (blue text, orange image) arrive at a router, which sends each to its top-2 experts. Bars show expert load; turn the balancing loss off to watch routing collapse onto a few experts and overflow their capacity.", html: String.raw`
<div class="formula">$$y=\sum_{i\in\text{top-}k}g_i\,E_i(x),\quad g=\text{softmax}_{\text{top-}k}(xW_r),\qquad \mathcal L_{bal}=N\sum_i f_iP_i$$</div>
<ul class="kp"><li>Active params = shared + k × expert (Mixtral ≈ 13B of 47B).</li><li>Capacity = factor × tokens / experts; overflow tokens are dropped.</li>
<li>Expert-choice routing guarantees balance.</li></ul>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>1.3B + 2 × 0.117B = 1.534B active.</li><li>Top-2 weights: softmax over selected logits.</li><li>Balanced loss = 1; collapse raises it.</li><li>Capacity 1.0 × 800/8 = 100.</li></ul>` }
] };

THEORY.mv6 = { mins: 9, sections: [
{ h: "Measuring broadly", html: String.raw`
<p class="lead">Multimodal models are tested on many skills at once (MME, SEED-Bench, MMBench, MMMU), and on <b>safety</b>: attacks through images and audio, misuse for deepfakes, and provenance of generated media.</p>
<ul class="kp"><li>Pooled score = total points / total maximum (not the mean of percentages).</li><li>Check contamination with perceptual hashes and embedding similarity.</li></ul>` },
{ h: "Typographic attacks", anim: "typo", cap: "A dog photo with a handwritten 'CAT' note. As the note becomes more visible, a CLIP-like model's probability shifts from 'dog' to 'cat': it reads the text instead of looking at the animal.", html: String.raw`
<ul class="kp"><li><b>Typographic attacks</b>: text in the image overrides visual evidence.</li><li><b>Visual prompt injection</b>: instructions hidden in images; agents must treat seen text as data.</li>
<li><b>Multimodal jailbreaks</b>: harmful requests encoded in images/audio bypass text-only safety.</li><li><b>Adversarial perturbations</b>: L∞ ≤ 8/255 can flip answers.</li></ul>` },
{ h: "Provenance and metrics", html: String.raw`
<table class="tbl cm"><tr><th>Tool / metric</th><th>Meaning</th></tr><tr><td>Watermark</td><td>Signal embedded in pixels/audio; robust to edits</td></tr>
<tr><td>C2PA credentials</td><td>Signed provenance metadata</td></tr><tr><td>ASR</td><td>Successful attacks / attempts (lower = safer)</td></tr>
<tr><td>Over-refusal</td><td>Benign prompts refused / benign prompts</td></tr><tr><td>TPR, FPR, precision</td><td>Detector quality; low FPR protects real content</td></tr></table>` },
{ h: "GATE checklist", html: String.raw`
<ul class="check"><li>18/200 → ASR 9 %.</li><li>40/500 refusals → over-refusal 8 %.</li><li>(1,450 + 330)/2,800 ≈ 63.6 %.</li><li>Relative reduction (70 − 12)/70 ≈ 83 %.</li></ul>` }
] };
