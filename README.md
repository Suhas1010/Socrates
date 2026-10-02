# Socrates — Project-First AI Tutor for Learning AI

> **BFWAI / AI Build Challenge 2026** · Track: *PS-03 Personalised AI Tutor for Learning AI*  
> *Tell it your project goal. Socrates reverse-engineers the exact AI concepts you need, right when you need them.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-114%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Pyodide](https://img.shields.io/badge/Runtime-Pyodide%20WASM-orange?logo=webassembly)](https://pyodide.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20%2F%201.5-blueviolet?logo=google)](https://ai.google.dev/)

---

## 🌟 Overview

Traditional AI courses demand 40+ hours of abstract mathematical lectures before students write a single line of working model code. Most learners drop off before completing a project, forgetting concepts before they become relevant.

**Socrates flips the classroom on its head:**
1. **Goal Intake (< 60s):** You state a tangible project goal (e.g., *"A spam classifier"*, *"Real estate price predictor"*, or your own custom idea).
2. **Adaptive Diagnostic & DAG Generation:** Socrates evaluates prior knowledge in 60 seconds, prunes concepts you already grasp, and constructs a validated Directed Acyclic Graph (DAG) of prerequisites.
3. **Human Approval Gate:** You review and approve the project plan and first build step before any teaching begins.
4. **Learning Loop with Curiosity Hooks:** Every concept opens with an intuitive hook or real-world dilemma—never abstract academic definitions.
5. **Typed Error Diagnosis:** When you answer or predict incorrectly, Socrates classifies *why* you slipped (`CONCEPTUAL_GAP`, `TERMINOLOGY_CONFUSION`, `CALCULATION_SLIP`, `OVERCONFIDENT_MISCONCEPTION`) and selects a tailored explanation strategy (Analogy, Contrast, Worked Numeric Example, or Counterexample).
6. **Weak-Prerequisite Trace-Back:** If an error stems from an earlier prerequisite, the graph edge glows red and guides you back to rebuild foundational mastery.
7. **In-Browser Python Execution (Pyodide):** Write and run actual Python code with NumPy directly in your browser via WebAssembly with zero setup or local terminal configuration.
8. **Feynman Verification (Teach-It-Back):** A concept only turns **GREEN (Mastered)** when you explain the intuition in your own words.
9. **Interactive Live Test Panel:** Test your finished machine learning model in real-time with sliders and interactive inputs, observing decision thresholds and feature influences live.

---

## 🚀 Key Features

### 1. 5 Curated Production AI Project Templates + Dynamic Goals
- **Spam Classifier** (NLP / Bag-of-Words & Naive Bayes / Logistic Regression)
- **Real Estate Price Predictor** (Tabular Regression, Feature Engineering & Scaling)
- **Digit Recognizer** (Computer Vision, 2D Arrays & Convolutional Neural Networks)
- **Mini ChatGPT** (Self-Attention, Token Embeddings & Transformers)
- **Sentiment Analysis** (Financial Sentiment & Transformer Fine-Tuning)
- **Dynamic Goal Engine**: Socrates can dynamically plan and scaffold learning roadmaps for *any* custom project goal entered by the user.

### 2. 3-Phase Project Journey
- **Phase 1 (Intuition & Math)**: Visual analogies, plain-English explanations, formula breakdowns, and comprehension checks.
- **Phase 2 (Code & Building)**: Live code editor with starter code, unit tests, step hints, and complete verified reference solutions.
- **Phase 3 (Live Interactive Testing)**: Interactive sandbox where learners test their trained model in real time on realistic sliders, inputs, or sample data.

### 3. Dedicated Python Academy
- 6 standalone foundational modules covering variables, data types, control flow, functions, loops, and vector math.
- In-browser Pyodide (WASM) runner with test assertions, blanks walkthroughs, and reference solutions.
- Freeform Python scratchpad for unrestricted scripting and experimentation.

### 4. Pedagogical AI & Resilience
- **Gemini Multi-Tier Model Cascade**: Automatically switches to lower-tier Gemini models if higher-tier models encounter rate limits (`429`), guaranteeing zero downtime.
- **Jargon Buster**: Plain-English glossary modal for demystifying technical AI terminology on demand.
- **1-Click Project Exporter**: Download your completed model as a standalone Python script (`model.py`), Google Colab Jupyter Notebook (`notebook.ipynb`), and `requirements.txt`.

---

## 📊 Evaluation Plan Benchmark Results (§12)

The core pedagogy and diagnostic engines are validated by automated benchmarks matching the project specification:

| Evaluation Metric | Target (PRD) | Achieved Result | Status |
|---|---|---|---|
| **Diagnosis Agreement on Seeded Misconceptions** | $\ge 80\%$ | **95.0%** (19/20 agreement) | ✅ **Exceeded** |
| **Concept Graph Acyclicity & Validity** | 100% Valid DAG | **100%** (All templates & dynamic graphs) | ✅ **Passed** |
| **Time to First Lesson** | $< 60\text{ s}$ | **~25 s** | ✅ **Passed** |
| **Unit Test Coverage** | 100% Core Suites | **114 / 114 Tests Passing** | ✅ **Passed** |
| **TypeScript & Build Verification** | 0 Errors | **`next build` & `tsc` 0 errors** | ✅ **Passed** |

Run the test suite anytime:
```bash
npm test
```

---

## 🏗️ Architecture & Tech Stack

```
Browser (Next.js 14 App Router / React 18 / TypeScript)
 ├─ UI Layer: Tailwind CSS, Lucide Icons, Canvas Confetti
 ├─ Graph Engine: React Flow (@xyflow/react) for interactive DAG navigation
 ├─ Pyodide Sandbox: Python 3.12 + NumPy execution inside WebAssembly (zero install)
 ├─ State Layer: Zustand with auto-sanitizing localStorage persistence
 └─ API Routes:
        ├─ POST /api/plan         (Scaffolds, validates, and prunes Concept DAG)
        ├─ POST /api/diagnostic   (Adaptive branching questions)
        ├─ POST /api/teach        (Curiosity-gap hooks & strategy-matched teaching)
        ├─ POST /api/evaluate     (4-type error taxonomy & one-line diagnosis)
        └─ POST /api/teachback    (Feynman conceptual gap evaluation)
```

- **Frontend & Fullstack:** Next.js 14, React 18, TypeScript
- **Styling & Design System:** Tailwind CSS with a curated high-contrast dark aesthetic
- **AI Integration:** Google Gemini API (`@google/genai`) with multi-tier priority fallback
- **WASM Python Engine:** Pyodide
- **Testing:** Vitest

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.17+ or v20+
- npm (bundled with Node)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Suhas1010/Socrates.git
   cd Socrates
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Google Gemini API key (or configure it directly inside the app UI via the **AI Settings** modal):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Repository Structure

```
Socrates/
├── docs/                     # Product Requirements & Design Guidelines
│   ├── PRD.md
│   └── RULES.md
├── src/
│   ├── app/                  # Next.js App Router (Pages & API endpoints)
│   │   ├── api/              # AI endpoints (plan, diagnostic, teach, evaluate, teachback)
│   │   ├── layout.tsx        # Root HTML layout & font definitions
│   │   └── page.tsx          # Main application page
│   ├── components/           # React Components
│   │   ├── Navbar.tsx        # Top navigation, project progress, and modal triggers
│   │   ├── LandingView.tsx   # Goal intake and curated project selection
│   │   ├── DiagnosticView.tsx# Adaptive 60-second diagnostic assessment
│   │   ├── PlanReviewView.tsx# Human approval gate & concept graph review
│   │   ├── LessonView.tsx    # 3-phase concept learning view
│   │   ├── PythonAcademyModal.tsx # Dedicated in-browser Python course modal
│   │   ├── LiveTestPanel.tsx # Real-time model testing sandbox
│   │   ├── JargonBusterModal.tsx  # Plain-English technical glossary
│   │   └── ApiKeyModal.tsx   # Gemini API key & model tier settings
│   └── lib/                  # Core Business Logic & Templates
│       ├── __tests__/        # Automated test suites (114 Vitest tests)
│       ├── diagnostics.ts    # Diagnostic question generation & goal scoring
│       ├── pyodideRunner.ts  # WebAssembly Python runtime integration
│       ├── llm.ts            # Gemini API client with fallback cascade
│       ├── mastery.ts        # Concept mastery & prerequisite propagation
│       ├── store.ts          # Zustand state store with auto-sanitization
│       ├── templates/        # Curated project track definitions
│       └── types.ts          # TypeScript domain models
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.
