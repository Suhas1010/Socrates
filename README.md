# Socrates — Project-First AI Tutor for Learning AI

> **BFWAI / AI Build Challenge 2026** · Track: *PS-03 Personalised AI Tutor for Learning AI*  
> *Tell it your project goal. Socrates reverse-engineers the exact AI concepts you need, right when you need them.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-117%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-forestgreen?logo=mongodb)](https://www.mongodb.com/)
[![Resend](https://img.shields.io/badge/Email-Resend%20API-black?logo=resend)](https://resend.com/)
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
10. **Cloud Sync & Account Security:** Secure authentication, multi-provider email verification (Resend / Ethereal), guest access, and real-time MongoDB Atlas progress persistence across sessions.

---

## 🚀 Key Features

### 1. Build ANY AI Project: Dynamic Goal Engine + 5 Flagship Presets
Socrates is **not limited to a fixed set of projects**. It is an open-ended AI project compiler:
- **Unlimited Custom Projects**: Type *any* machine learning or AI project idea into the goal intake (e.g. *"predict hospital readmission"*, *"detect fraudulent credit card transactions"*, *"classify agricultural crop diseases"*, *"forecast retail store sales"*, or *"estimate electric vehicle battery life"*).
- **Dynamic DAG Reverse-Engineering (`/api/plan`)**: Powered by Google Gemini, Socrates analyzes your goal, coding background, and interests to generate a custom 5-to-8 node Directed Acyclic Graph (DAG) with:
  - **Authentic, Domain-Specific Features**: (e.g., for weather: `temperature`, `humidity`, `barometric_pressure`, `wind_speed` instead of generic `feature_1`, `feature_2`).
  - **Full Training Pipelines**: Real `scikit-learn` or neural architectures, synthetic dataset generation, `model.fit()`, and inference functions.
  - **Automated Verification**: Concrete test assertions and verified working reference solutions for every milestone.
- **Built-In Domain Fallbacks (Zero-API Offline Mode)**: Even without an internet connection or Gemini API key, Socrates features deep, rule-based roadmap generators covering:
  - **Clinical Diagnostics & Healthcare** (Diabetes risk, tumor classification, patient vitals)
  - **Computer Vision & Agriculture** (Plant & leaf pathogen recognition)
  - **Cybersecurity & Threat Detection** (Packet inspection, brute-force & intrusion detection)
  - **Time-Series & Demand Forecasting** (Retail sales, inventory demand)
  - **Customer Churn & Retention Analytics**
  - **Audio, Voice & Emotion Classification**
- **5 Curated 1-Click Flagship Launchpads**: Pre-built, fully optimized showcase templates for immediate onboarding without "blank canvas" hesitation:
  1. **Spam Classifier** (NLP / Bag-of-Words & Naive Bayes)
  2. **Real Estate Price Predictor** (Tabular Regression, Feature Engineering & Scaling)
  3. **Digit Recognizer** (Computer Vision, 2D Arrays & Convolutional Neural Networks)
  4. **Mini ChatGPT** (Self-Attention, Token Embeddings & Transformers)
  5. **Sentiment Analysis** (Financial Sentiment & Transformer Fine-Tuning)

### 2. 3-Phase Project Journey
- **Phase 1 (Intuition & Math)**: Visual analogies, plain-English explanations, formula breakdowns, and comprehension checks.
- **Phase 2 (Code & Building)**: Live code editor with starter code, unit tests, step hints, and complete verified reference solutions.
- **Phase 3 (Live Interactive Testing)**: Interactive sandbox where learners test their trained model in real time on realistic sliders, inputs, or sample data tailored to their specific project domain.

### 3. Dedicated Python Academy
- 6 standalone foundational modules covering variables, data types, control flow, functions, loops, and vector math.
- In-browser Pyodide (WASM) runner with test assertions, blanks walkthroughs, and reference solutions.
- Freeform Python scratchpad for unrestricted scripting and experimentation.

### 4. Authentication & Strict Access Gate
- **Protected Application Routes**: Unauthenticated users are redirected cleanly to the login portal with zero content flashes.
- **Dual Access Models**:
  - **Main Account**: Register and log in with email and password (bcrypt hashing with work factor 10, signed HTTP-only JWT session cookies).
  - **Instant Guest Learner**: 1-click "Continue as Guest" allows full instant access without sign-up friction.
- **Seamless Session Switching**: Switch between authenticated accounts or guest access anytime directly from the top navigation.

### 5. Frictionless Zero-2FA Email Verification
- **6-Digit OTP Email Verification**: Secures new registrations with 15-minute expiring verification codes and 60-second resend cooldown timers.
- **Zero Google 2FA or SMS Requirement**: Direct **Resend API** integration delivers emails straight to user inboxes using a modern REST API without personal account phone number verification or Google App Password setup.
- **Automatic Ethereal Webmail Fallback**: In local development without credentials, Socrates creates an ephemeral Ethereal test inbox and surfaces a 1-click preview link in the UI and terminal.
- **Dev Mode Quick Helper**: Includes a convenient 1-click OTP auto-fill button during local testing for immediate verification.

### 6. Multi-Device Cloud Sync (MongoDB Atlas)
- **Automatic Debounced Persistence**: Every change to the active project goal, custom generated roadmaps, prerequisite DAG node mastery, and completed Python Academy modules automatically syncs to MongoDB Atlas.
- **Cross-Device Recovery**: Log in from any browser or device to restore your exact progress, active stage, and completed lessons.
- **Offline / Local Resilience**: Automatically falls back to localStorage if MongoDB is unreachable or when exploring in Guest mode.

### 7. Pedagogical AI & Resilience
- **Gemini Multi-Tier Model Cascade**: Automatically switches to lower-tier Gemini models if higher-tier models encounter rate limits (`429`), guaranteeing zero downtime.
- **Jargon Buster**: Plain-English glossary modal for demystifying technical AI terminology on demand.
- **1-Click Project Exporter**: Download your completed model as a standalone Python script (`model.py`), Google Colab Jupyter Notebook (`notebook.ipynb`), and `requirements.txt`.

### 8. Ergonomic Layout & Visual Polish
- Generous scrolling padding (`pb-28`) across all full-page views ensuring zero clipped buttons or hidden bottom lines.
- Curated high-contrast dark aesthetic with smooth glassmorphism, responsive navigation bars, and reactive status badges.

---

## 📊 Evaluation Plan Benchmark Results (§12)

The core pedagogy and diagnostic engines are validated by automated benchmarks matching the project specification:

| Evaluation Metric | Target (PRD) | Achieved Result | Status |
|---|---|---|---|
| **Diagnosis Agreement on Seeded Misconceptions** | $\ge 80\%$ | **95.0%** (19/20 agreement) | ✅ **Exceeded** |
| **Concept Graph Acyclicity & Validity** | 100% Valid DAG | **100%** (All templates & dynamic graphs) | ✅ **Passed** |
| **Time to First Lesson** | $< 60\text{ s}$ | **~25 s** | ✅ **Passed** |
| **Unit Test Coverage** | 100% Core Suites | **117 / 117 Tests Passing** | ✅ **Passed** |
| **TypeScript & Build Verification** | 0 Errors | **`next build` & `tsc` 0 errors (18/18 routes)** | ✅ **Passed** |

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
 ├─ State Layer: Zustand with auto-sanitizing localStorage + MongoDB Atlas Cloud Sync
 ├─ Auth & Context: JWT Session Cookies + AuthContext + Route Gating
 └─ Next.js Server & API Routes:
        ├─ POST /api/auth/register    (Bcrypt hash, OTP dispatch via Resend/Ethereal)
        ├─ POST /api/auth/login       (Credential verify & JWT HTTP-only cookie)
        ├─ POST /api/auth/verify-email (6-digit OTP verification)
        ├─ POST /api/auth/resend-code  (OTP resend with cooldown rate limit)
        ├─ GET  /api/auth/me          (Active session & learner profile)
        ├─ POST /api/auth/logout      (Clear session cookie)
        ├─ POST /api/auth/sync        (Sync roadmap, mastery DAG, and Python academy)
        ├─ POST /api/plan             (Scaffolds, validates, and prunes Concept DAG)
        ├─ POST /api/diagnostic/next  (Adaptive branching questions)
        ├─ POST /api/teach            (Curiosity-gap hooks & strategy-matched teaching)
        ├─ POST /api/evaluate         (4-type error taxonomy & one-line diagnosis)
        └─ POST /api/teachback        (Feynman conceptual gap evaluation)
```

- **Frontend & Fullstack:** Next.js 14, React 18, TypeScript
- **Database & Persistence:** MongoDB Atlas with Mongoose ORM
- **Authentication:** Bcrypt password hashing, JWT session cookies
- **Email Delivery:** Resend API with automatic Ethereal webmail fallback and SMTP support
- **Styling & Design System:** Tailwind CSS with a curated high-contrast dark aesthetic
- **AI Integration:** Google Gemini API (`@google/genai`) with multi-tier priority fallback
- **WASM Python Engine:** Pyodide
- **Testing:** Vitest (117 tests)

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

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your credentials in `.env.local`:
   ```env
   # Google Gemini API Key (or configure in app via the AI Settings modal)
   GEMINI_API_KEY=your_gemini_api_key_here

   # MongoDB Atlas Connection URI
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/socrates?retryWrites=true&w=majority

   # JWT Secret for Session Authentication
   JWT_SECRET=your_jwt_secret_min_32_chars_long

   # Resend API Key (for Zero-2FA email verification)
   RESEND_API_KEY=re_your_resend_api_key
   RESEND_FROM="Socrates AI <onboarding@resend.dev>"

   # Optional SMTP Fallback (if using custom SMTP instead of Resend)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
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

## 🎯 Interactive Demo Flow

1. **Access the App (Sign In or Guest)**:
   - Create a new account with email verification, sign in with existing credentials, or click **"Continue as Guest"** for instant access.
2. **Option A: Enter ANY Custom AI Project**:
   - Type an idea like `"predict hospital readmissions"`, `"classify crop diseases"`, `"detect credit card fraud"`, or `"forecast retail demand"`.
   - Socrates immediately reverse-engineers a domain-specific 5-to-8 node prerequisite DAG with named real-world features.
3. **Option B: Select a 1-Click Flagship Preset**:
   - Choose one of the 5 curated templates (e.g. *Spam Classifier* or *Real Estate Price Predictor*).
4. **Adaptive 60-Second Diagnostic**:
   - Answer 3 targeted baseline questions. Socrates prunes concepts you already know and marks your starting node.
5. **Human Approval Gate**:
   - Inspect the interactive DAG graph generated via React Flow. Confirm the plan to begin.
6. **The 3-Phase Mastery Loop**:
   - **Phase 1 (Theory)**: Read intuitive visual analogies, review mathematical intuition, and pass a quick comprehension check.
   - **Phase 2 (Building)**: Open the in-browser WebAssembly code editor. Fill in blanks or write model code with guidance from the dual-tab Hints & Solutions drawer. Run code against automated Python assertions.
   - **Phase 3 (Live Testing)**: Slide input controls, toggle parameters, and test your model against real-time simulated inference directly in your browser.
7. **Feynman Teach-Back Check**:
   - Explain the core concept in your own plain English. Socrates evaluates conceptual understanding before granting **Mastered ✓** status.
8. **Cloud Persistence**:
   - Your learning state, mastered nodes, and academy progress are automatically saved to your cloud profile.

---

## 📁 Repository Structure

```
Socrates/
├── docs/                     # Product Requirements & Design Guidelines
│   ├── PRD.md
│   └── RULES.md
├── src/
│   ├── app/                  # Next.js App Router (Pages & API endpoints)
│   │   ├── api/
│   │   │   ├── auth/         # Authentication endpoints (register, login, verify, sync)
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── me/
│   │   │   │   ├── register/
│   │   │   │   ├── resend-code/
│   │   │   │   ├── sync/
│   │   │   │   └── verify-email/
│   │   │   ├── diagnostic/   # Diagnostic assessment endpoints
│   │   │   ├── evaluate/     # 4-type error classifier
│   │   │   ├── plan/         # Dynamic DAG graph scaffolding
│   │   │   ├── teach/        # Strategy-matched lesson generator
│   │   │   └── teachback/    # Feynman verification evaluator
│   │   ├── login/            # Authentication & verification portal
│   │   ├── layout.tsx        # Root HTML layout & font definitions
│   │   └── page.tsx          # Main application page
│   ├── components/           # React Components
│   │   ├── Navbar.tsx        # Top navigation, progress, user session, and modals
│   │   ├── LandingView.tsx   # Goal intake and curated project selection
│   │   ├── DiagnosticView.tsx# Adaptive 60-second diagnostic assessment
│   │   ├── PlanReviewView.tsx# Human approval gate & concept graph review
│   │   ├── LessonView.tsx    # 3-phase concept learning view
│   │   ├── PythonAcademyModal.tsx # Dedicated in-browser Python course modal
│   │   ├── LiveTestPanel.tsx # Real-time model testing sandbox
│   │   ├── JargonBusterModal.tsx  # Plain-English technical glossary
│   │   └── ApiKeyModal.tsx   # Gemini API key & model tier settings
│   ├── models/               # Mongoose Schemas
│   │   └── User.ts           # User account, verification, and progress model
│   └── lib/                  # Core Business Logic, Database & Auth
│       ├── __tests__/        # Automated test suites (117 Vitest tests)
│       ├── auth.ts           # JWT signing, verification & password hashing
│       ├── AuthContext.tsx   # React Auth context and session hook
│       ├── db.ts             # MongoDB Atlas connection manager
│       ├── email.ts          # Resend API & Ethereal email dispatch engine
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
