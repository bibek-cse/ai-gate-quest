/* Catalogue of all subjects. `bank` names the QBANK key once a subject's questions exist;
   subjects without a bank show their planned chapter map as "coming soon". */
window.SUBJECTS = [
  { id: "ml", name: "Machine Learning", glyph: "ŷ", color: "#b3261e", bank: "ml",
    note: "GATE DA syllabus: regression, classification, model selection, neural nets, clustering, PCA." },
  { id: "math", name: "Maths for AI", glyph: "∑", color: "#2d6a35", bank: "math",
    note: "Applied foundations: the linear algebra, calculus, probability, statistics and information theory that ML is built on." },
  { id: "dl", name: "Deep Learning", glyph: "∂", color: "#1c2a52", bank: "dl",
    note: "Optimisers, normalisation, CNNs, ResNets, RNN/LSTM, Transformers, VAEs, GANs, diffusion and contrastive learning." },
  { id: "meta", name: "Meta Learning", glyph: "μ", color: "#6b4c9a", bank: "meta",
    note: "Few-shot episodes, ProtoNets, MAML and Reptile, memory-augmented nets, benchmarks, meta-overfitting, meta-RL and in-context learning." },
  { id: "llm", name: "Large Language Models", glyph: "⟨T⟩", color: "#8a5a00", bank: "llm",
    note: "Tokenisation, positions, decoder Transformers, scaling laws, LoRA, RLHF/DPO, decoding, RAG, efficient inference and evaluation." },
  { id: "vlm", name: "Vision-Language Models", glyph: "◉", color: "#0f6e7a", bank: "vlm",
    note: "Image encoders, CLIP and SigLIP, captioning and VQA, Flamingo-style fusion, LLaVA-style projection, grounding and OCR, evaluation and hallucination." },
  { id: "mvlm", name: "Multimodal (MVLM)", glyph: "⊕", color: "#a0306a", bank: "mvlm",
    note: "Tokenising any modality, video-language models, audio and speech LMs, any-to-any generation, unified encoders and MoE, multimodal safety." },
  { id: "dsa", name: "Data Structures", glyph: "[ ]", color: "#4a5a1c", bank: "dsa",
    note: "Arrays and two pointers, linked lists, stacks and queues, hashing, BSTs and AVL, heaps, graph representations, tries, union-find, segment and Fenwick trees." },
  { id: "algo", name: "Algorithms", glyph: "O(n)", color: "#5b3a1e", bank: "algo",
    note: "Asymptotics and the Master theorem, sorting, binary search, divide and conquer, greedy, dynamic programming, BFS/DFS, shortest paths, MSTs, P vs NP." },
  { id: "py", name: "Python", glyph: ">>>", color: "#2f5f9e", bank: "py",
    note: "Output tracing, control flow, scope and closures, collections, comprehensions and generators, OOP, exceptions and files, recursion, NumPy and pandas." }
];
