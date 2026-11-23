# AI GATE Quest

Learn AI and GATE DA chapter by chapter. Each chapter opens with a **theory lesson**: key ideas, the maths (KaTeX), an **animated demo** of how the algorithm works, a worked example and a GATE checklist. Then come the quizzes. For each question you answer, get ✓ or ✗, then read a
**What / Why / How / Trap** concept card before moving on. Every chapter runs **Basic → Intermediate → GATE**,
and you need at least 1★ in one level to unlock the next. Each chapter also has an **endless drill** of
freshly generated numerical questions with worked solutions.

<img width="400" height="400" alt="ai-gate-quest-qr-only" src="https://github.com/user-attachments/assets/108520e5-d99e-429f-a2f4-74390c53e4bc" />

Live at: https://bibek-cse.github.io/ai-gate-quest/

## What's inside

| Subject | Status |
|---|---|
| Machine Learning (GATE DA syllabus) | 10 chapters · 10 animated theory lessons · 180 hand-written questions · 20 question generators |
| Maths for AI, Deep Learning, Meta Learning, LLMs, VLMs, Multimodal, Data Structures, Algorithms, Python | chapter maps shown, questions coming |

Machine Learning chapters: Foundations · Linear Regression · Logistic Regression · Evaluation & CV ·
k-NN & Naive Bayes · SVM & LDA · Decision Trees & Ensembles · Neural Networks · Clustering · PCA.

## How a round works

- 8 questions: the 6 hand-written questions of that level in random order, plus 2 generated ones (new numbers every time).
- Stars: 1★ at 50 %, 2★ at 70 %, 3★ at 90 %. XP: +10 per correct answer, +5 on a streak of 3 or more, ×1.5 at GATE level.
- Progress is stored in the browser (localStorage). There are no accounts, no tracking, and nothing is sent anywhere.

## Adding theory

Theory lives in `data/theory_ml_*.js` as `THEORY.<chapterId> = { mins, sections: [{ h, html, anim?, cap? }] }`.
Maths uses `$…$` / `$$…$$` (KaTeX). Animations are in `js/anims.js` (`ANIM.<name>(element)`).

## Adding questions

Hand-written questions live in `data/*.js`. Each one is a single array:

```js
[level, "question", ["correct option", "wrong", "wrong", "wrong"], 0,
 "WHAT it is", "WHY it works / matters", "HOW to compute or apply it", "TRAP students fall into"]
```

Put the correct option first with index `0`. Options are shuffled at play time.
Generators live in `js/gen_ml.js` and return `{q, opts?, ans, tol?, what, why, how, trap}`.

A new subject needs a `data/<subject>.js` file that fills `QBANK.<id>`. Then set `bank: "<id>"` for that
subject in `data/subjects.js` and add the script tag to `index.html`.

## Deploy (GitHub Pages)

Upload this folder's contents to the root of the repo `ai-gate-quest`, then go to **Settings → Pages → Deploy from
a branch → main / (root)**.
