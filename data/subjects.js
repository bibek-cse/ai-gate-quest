/* Catalogue of all subjects. `bank` names the QBANK key once a subject's questions exist;
   subjects without a bank show their planned chapter map as "coming soon". */
window.SUBJECTS = [
  { id: "ml", name: "Machine Learning", glyph: "ŷ", color: "#b3261e", bank: "ml",
    note: "GATE DA syllabus: regression, classification, model selection, neural nets, clustering, PCA." },
  { id: "math", name: "Maths for AI", glyph: "∑", color: "#2d6a35",
    note: "Applied foundations, side by side with every other subject.",
    plan: ["Vectors & matrices for data", "Eigenvalues, SVD & PCA maths", "Derivatives, gradients & the chain rule", "Optimisation: convexity, Lagrange, GD", "Probability & Bayes", "Distributions you meet in ML", "Statistics: estimation, MLE, MAP", "Hypothesis tests & confidence", "Information theory: entropy, KL, cross-entropy", "Discrete maths & counting"] },
  { id: "dl", name: "Deep Learning", glyph: "∂", color: "#1c2a52",
    plan: ["Training deep nets: optimisers, init", "Regularisation & normalisation", "CNNs: convolution, pooling, receptive field", "Modern CNNs: ResNet, EfficientNet", "RNNs, LSTM & GRU", "Attention & the Transformer", "Autoencoders & VAEs", "GANs", "Diffusion models", "Self-supervised & contrastive learning"] },
  { id: "meta", name: "Meta Learning", glyph: "μ", color: "#6b4c9a",
    plan: ["The few-shot problem & episodes", "Metric learning: Siamese, Matching, ProtoNets", "Optimisation-based: MAML, FOMAML, Reptile", "Model-based & memory-augmented nets", "Benchmarks: Omniglot, mini-ImageNet", "Meta-overfitting & task augmentation", "Meta-RL basics", "In-context learning as meta-learning"] },
  { id: "llm", name: "Large Language Models", glyph: "⟨T⟩", color: "#8a5a00",
    plan: ["Tokenisation: BPE, WordPiece", "Embeddings & positional encoding", "Decoder-only Transformers", "Pre-training objectives & scaling laws", "Fine-tuning & PEFT (LoRA, adapters)", "Alignment: RLHF, DPO", "Decoding: greedy, beam, top-k, top-p, temperature", "Retrieval-augmented generation", "Efficient inference: KV cache, quantisation", "Evaluation & hallucination"] },
  { id: "vlm", name: "Vision-Language Models", glyph: "◉", color: "#0f6e7a",
    plan: ["Image encoders: CNN → ViT", "Contrastive pre-training: CLIP, SigLIP", "Captioning & VQA", "Fusion: cross-attention (Flamingo)", "Projection-style VLMs (LLaVA)", "Grounding, OCR & detection with VLMs", "Evaluation & VLM hallucination"] },
  { id: "mvlm", name: "Multimodal (MVLM)", glyph: "⊕", color: "#a0306a",
    note: "Multimodal & video-language models beyond image + text.",
    plan: ["Tokenising any modality", "Video-language models & temporal modelling", "Audio & speech LMs", "Any-to-any generation", "Unified encoders & mixture-of-experts", "Multimodal benchmarks & safety"] },
  { id: "dsa", name: "Data Structures", glyph: "[ ]", color: "#4a5a1c",
    plan: ["Arrays, strings & two pointers", "Linked lists", "Stacks & queues", "Hashing", "Trees & binary search trees", "Heaps & priority queues", "Graphs: representations", "Tries", "Union-find", "Segment & Fenwick trees"] },
  { id: "algo", name: "Algorithms", glyph: "O(n)", color: "#5b3a1e",
    plan: ["Asymptotics & recurrences (Master theorem)", "Sorting & lower bounds", "Searching & binary search", "Divide & conquer", "Greedy algorithms", "Dynamic programming", "Graph search: BFS, DFS, topological sort", "Shortest paths", "Minimum spanning trees", "P, NP & NP-completeness"] },
  { id: "py", name: "Python", glyph: ">>>", color: "#2f5f9e",
    plan: ["Types, operators & output tracing", "Control flow", "Functions, scope & closures", "Lists, tuples, dicts, sets", "Comprehensions & generators", "OOP in Python", "Exceptions & files", "Recursion in Python", "NumPy essentials", "Pandas essentials"] }
];
