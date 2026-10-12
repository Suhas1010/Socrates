# Socrates — Project-First AI Tutor for Learning AI

> **BFWAI / AI Build Challenge 2026** · Track: *PS-03 Personalised AI Tutor for Learning AI*  
> *Tell it your project goal. Socrates reverse-engineers the exact AI concepts you need, right when you need them.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-172%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-forestgreen?logo=mongodb)](https://www.mongodb.com/)
[![Pyodide](https://img.shields.io/badge/Runtime-Pyodide%20WASM-orange?logo=webassembly)](https://pyodide.org/)
[![AI Models](https://img.shields.io/badge/AI-Gemini%20%2B%20xAI%20Grok-blueviolet?logo=google)](https://ai.google.dev/)

---

## 🌟 Overview

Traditional AI education requires 40+ hours of abstract mathematical lectures before students write a single line of working model code. Most learners drop out or forget foundational concepts before they become relevant to real-world tasks.

**Socrates flips the classroom on its head:**
1. **Mandatory Auth Gate:** Secure login or sign-up is required before accessing the platform; no unauthorized access to the main workspace.
2. **Goal Intake (< 60s):** State a tangible machine learning goal (e.g., *"Clinical diabetes risk predictor"*, *"Real estate price estimator"*, *"Plant pathogen detector"*, or your own custom idea).
3. **Multi-Agent Prerequisite Scaffolding:** A team of specialized autonomous agents reverse-engineers a domain-specific Directed Acyclic Graph (DAG) with authentic real-world features.
4. **Adaptive Diagnostic:** Socrates assesses prior knowledge in under a minute, prunes concepts you already grasp, and highlights your starting node.
5. **Human Approval Gate:** You review and approve the project plan before teaching begins.
6. **3-Phase Mastery Loop:**
   - **Phase 1 (Intuition & Math):** Curiosity hooks, visual analogies, plain-English explanations, and comprehension checks.
   - **Phase 2 (Build & Code):** In-browser Python editor with automated tests, step hints, and complete verified reference solutions.
   - **Phase 3 (Live Verification & Test Panel):** Test models live with interactive sliders, differential testing, adversarial red-teaming, AI architectural reviews, and exportable production code.
7. **Feynman Verification (Teach-It-Back):** A concept only reaches **Mastered ✓** status when you explain the intuition in your own words.
8. **Cloud Persistence:** Continuous, debounced synchronization saves your project roadmap, code, and Python Academy progress to MongoDB Atlas.

---

## 🤖 Multi-Agent Pipeline Architecture

Socrates operates on a specialized multi-agent architecture where distinct agents coordinate to guide the student from initial goal to production deployment:

```
                               ┌────────────────────────┐
                               │   Student Goal Intake  │
                               └───────────┬────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │    Curriculum Architect Agent       │
                        │ • DAG prerequisite decomposition   │
                        │ • Named domain feature synthesis    │
                        └──────────────────┬──────────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│  Socratic Dialogue Agent│   │   Pedagogy Guide Agent  │   │  Code Evaluator Agent   │
│ • Adaptive diagnostics  │   │ • Visual analogies      │   │ • Anti-cheating AST     │
│ • Misconception tracing │   │ • Mathematical hooks    │   │ • Test assertion checks │
│ • Feynman teach-backs   │   │ • Plain-English models  │   │ • WASM runtime safety   │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
┌─────────────────────────┐                                 ┌─────────────────────────┐
│ Red-Team Security Agent │                                 │ Production Review Agent │
│ • Adversarial vectors   │                                 │ • Architecture scoring  │
│ • Out-of-bounds noise   │                                 │ • Numerical stability   │
│ • Negative input stress │                                 │ • Microservice exporter │
└─────────────────────────┘                                 └─────────────────────────┘
```

1. **Curriculum Architect Agent (`src/lib/agents/architect.ts`)**: Reverse-engineers custom machine learning goals into verified, acyclic 5-to-8 node prerequisite graphs with authentic features and test assertions.
2. **Pedagogy Guide Agent (`src/lib/agents/pedagogy.ts`)**: Generates intuitive visual hooks, worked numeric examples, and counterexamples tailored to student misconceptions.
3. **Code Evaluator Agent (`src/lib/agents/evaluator.ts`)**: Audits student code syntax, prevents bypasses or stubs, and verifies execution against automated test suites.
4. **Socratic Dialogue Agent (`src/lib/agents/dialogue.ts`)**: Administers adaptive diagnostic questions, classifies learner slips into a 4-part error taxonomy, and conducts Feynman teach-back evaluations.
5. **Red-Team Security Agent (`src/lib/redteam.ts`)**: Stresses trained models with zero vectors, massive numeric outliers, negative values, and distribution shifts.
6. **Production Review Agent (`src/app/api/review-model/route.ts`)**: Evaluates architecture strengths, production vulnerabilities, gradient stability, and generates exportable microservice code.

---

## 🚀 Key Features

### 1. Build ANY AI Project: Dynamic Goal Engine + 5 Curated Presets
- **Open-Ended Goals**: Enter *any* machine learning or deep learning project (e.g., *"predict hospital readmissions"*, *"detect fraudulent transactions"*, *"classify agricultural crop diseases"*, *"forecast retail store sales"*, or *"estimate EV battery life"*).
- **Curated 1-Click Launchpads**:
  1. **Clinical Diagnostics & Health Risk** (Tabular Classification & Logistic Regression)
  2. **Real Estate Price Predictor** (Tabular Regression, Feature Engineering & Scaling)
  3. **Digit Recognizer** (Computer Vision, 2D Arrays & Neural Networks)
  4. **Mini ChatGPT** (Self-Attention, Token Embeddings & Transformers)
  5. **Spam & Sentiment Analysis** (NLP, Bag-of-Words & Naive Bayes)
- **Offline Fallback Engine**: Rule-based roadmap synthesizers ensure complete operation even during network interruptions.

### 2. Stage 3: Live Verification & Testing Suite
- **Live Model Runner**: Interactive sliders and real-world presets execute your model in real time. Choose between your **Built Model** or the **Verified Reference Implementation** with honest status badges.
- **Differential Consistency Analysis**: Runs the exact same input through both learner code and reference implementation side-by-side to highlight any prediction variance.
- **Adversarial Red-Team Stress Suite**: Automated edge-case attacks evaluate model resilience against out-of-distribution inputs.
- **AI Architecture & Code Review**: Detailed automated inspection providing overall readiness scores, architectural strengths, production vulnerabilities, gradient dynamics, and next steps.
- **Full Production Deployment Roadmap**: 5-phase guide providing export-ready code artifacts:
  - `app.py`: Production-grade FastAPI microservice with input clamping and CORS.
  - `client.tsx`: Production React hook for model invocation.
  - `weights.json`: Serialized learned parameters and intercept bias.

### 3. In-Browser Python Execution (Pyodide WebAssembly)
- **Zero Local Configuration**: Runs actual Python 3.12 with NumPy inside browser WebAssembly.
- **Resilient Serialization**: Custom `_make_json_safe` unwraps NumPy arrays, tensors, and scalar types (`np.int64`, `np.float64`, `np.ndarray`) to guarantee trace-free execution.
- **Anti-Cheat & Blank Detection**: Disallows trivial bypasses (`pass`, `___`, or hardcoded prints).

### 4. Dedicated Python Academy
- 6 foundational modules covering Python variables, conditionals, functions, loops, lists, and vector operations.
- Interactive code sandboxes with test assertions and an unrestricted scratchpad.

### 5. Authentication & Cloud Sync
- **Strict Server-Side Auth Gate**: Edge middleware (`src/middleware.ts`) protects all routes, redirecting unauthenticated requests directly to `/login`.
- **Frictionless Auth**: Instant **Sign In** and **Create Account** forms with zero email verification/OTP friction.
- **Cloud Persistence**: Automatic debounced syncing saves roadmaps, code, and Python Academy progress to MongoDB Atlas.
- **Existing User Preservation**: Fully backward-compatible with all pre-existing registered user profiles.

### 6. Dual-Provider AI Resilience (Gemini + xAI Grok)
- **Multi-Tier Cascade**: Automatically cascades down Google Gemini model tiers upon rate limits (`429`).
- **xAI Grok Failover**: Seamless failover to Grok when configured, or route directly using xAI API keys.
- **BYOK (Bring Your Own Key)**: Configure custom keys directly in the AI Settings modal.

---

## 📊 Automated Test Verification

All modules, APIs, and execution harnesses are covered by Vitest suites:

```
Test Files  11 passed (11)
Tests       172 passed (172)
```

| Test Suite | Tests | Purpose |
|---|---|---|
| `python_execution.test.ts` | 47 passed | Pyodide runner, NumPy serialization, anti-cheat, scope isolation |
| `solutions.test.ts` | 56 passed | Reference solution correctness across all tracks |
| `diagnostics.test.ts` | 24 passed | Adaptive diagnostics, store state, roadmap transitions |
| `agents.test.ts` | 14 passed | Multi-agent orchestrator, curriculum synthesis, code evaluation |
| `roadmap_and_review.test.ts` | 8 passed | Red-team suites, architectural reviews, microservice artifacts |
| `llm.test.ts` | 5 passed | Gemini cascade, xAI Grok routing, dual-provider failover |
| `mastery.test.ts` | 5 passed | Prerequisite DAG traversal and mastery propagation |
| `socrates_v2.test.ts` | 5 passed | Core Socrates v2 pipeline benchmarks |
| `graph.test.ts` | 4 passed | DAG acyclicity and prerequisite dependency checks |
| `email_verification.test.ts` | 3 passed | Schema compatibility and auth service fallbacks |
| `eval.test.ts` | 1 passed | Seeded misconception agreement benchmark (95.0% agreement) |

Run the full test suite:
```bash
npm test
```

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS (ChaiUI-inspired dark warm aesthetic)
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: Bcrypt password hashing & JWT HTTP-only session cookies
- **WASM Runtime**: Pyodide (Python 3.12 + NumPy in WebAssembly)
- **Graph Visualization**: React Flow (`@xyflow/react`)
- **State Management**: Zustand with persistent storage
- **AI Providers**: Google Gemini API (`@google/genai`) & xAI Grok API
- **Testing**: Vitest 2.1

---

## 💻 Getting Started

### Prerequisites
- Node.js v18.17+ or v20+
- npm (bundled with Node.js)

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

3. **Configure Environment Variables:**
   Create `.env.local` in the project root:
   ```env
   # AI Providers
   GEMINI_API_KEY=your_gemini_api_key_here
   LLM_PROVIDER=gemini
   LLM_MODEL=gemini-3.5-flash
   GEMINI_MODELS=gemini-3.5-flash,gemini-flash-lite-latest,gemini-3.5-flash-lite,gemini-flash-latest

   # Optional: xAI Grok (Failover / BYOK)
   GROK_API_KEY=xai-your_key_here
   GROK_MODEL=grok-2-latest

   # Database & Authentication
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/socrates?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_min_32_chars_long
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
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask/               # Socratic AI tutor dialogue endpoint
│   │   │   ├── auth/              # Login, register, me, logout, sync
│   │   │   ├── diagnostic/        # Adaptive branching diagnostics
│   │   │   ├── evaluate/          # 4-type error classifier
│   │   │   ├── plan/              # Dynamic DAG generation
│   │   │   ├── review-model/      # AI Architecture & Code Review endpoint
│   │   │   ├── teach/             # Curiosity-gap hooks & pedagogy strategies
│   │   │   └── teachback/         # Feynman verification evaluator
│   │   ├── login/                 # Dedicated Sign In & Sign Up portal
│   │   ├── layout.tsx             # Root layout & ChaiUI ambient theme
│   │   └── page.tsx               # Main authenticated learning application
│   ├── components/
│   │   ├── AgentPipelineModal.tsx # Multi-agent visualization modal
│   │   ├── ApiKeyModal.tsx        # BYOK AI settings (Gemini / Grok)
│   │   ├── CodeSandbox.tsx        # In-browser Pyodide Python code editor
│   │   ├── ConceptMap.tsx         # Interactive React Flow DAG graph
│   │   ├── DiagnosticView.tsx     # 60-second baseline assessment
│   │   ├── LandingView.tsx        # Goal intake and flagship presets
│   │   ├── LessonView.tsx         # 3-phase concept learning view
│   │   ├── LiveTestPanel.tsx      # Live runner, differential, red-team, reviews
│   │   ├── Navbar.tsx             # Navigation, user profile, and modals
│   │   ├── Phase1TheoryView.tsx   # Theory, analogies, and comprehension check
│   │   ├── Phase2BuildView.tsx    # Live building step with hints & solutions
│   │   ├── PythonAcademyModal.tsx # In-browser Python fundamentals course
│   │   └── TeachBackModal.tsx     # Feynman teach-back evaluation modal
│   ├── lib/
│   │   ├── agents/                # Multi-agent orchestrator & specialized agents
│   │   ├── catalog/               # Deep domain fallback roadmaps
│   │   ├── templates/             # Flagship project templates
│   │   ├── __tests__/             # 11 Vitest test suites (172 passing tests)
│   │   ├── auth.ts                # JWT authentication & password hashing
│   │   ├── AuthContext.tsx        # Authentication provider & user session
│   │   ├── clientLLM.ts           # Client-side LLM configuration & BYOK
│   │   ├── diagnostics.ts         # Diagnostic scoring & question generation
│   │   ├── inference.ts           # Interactive inference contracts & presets
│   │   ├── llm.ts                 # Dual-provider LLM cascade (Gemini + Grok)
│   │   ├── pyodideRunner.ts       # WebAssembly Python runtime integration
│   │   ├── redteam.ts             # Adversarial edge-case generator
│   │   ├── roadmapGenerator.ts    # Production microservice artifact generator
│   │   └── store.ts               # Zustand store with cloud & local sync
│   ├── models/
│   │   └── User.ts                # MongoDB Mongoose user schema
│   └── middleware.ts              # Server-side auth gate protecting all routes
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.
