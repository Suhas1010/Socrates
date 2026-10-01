# Socrates — Project-First AI Tutor for Learning AI

> **BFWAI / AI Build Challenge 2026** · Track: *PS-03 Personalised AI Tutor for Learning AI*  
> *Tell it your project goal. Socrates reverse-engineers the exact AI concepts you need, right when you need them.*

---

## 🌟 Overview

Traditional AI courses present 40+ hours of abstract theory before students write a single line of real model code. Most learners drop off before completing a project, and forget the concepts before they ever become relevant.

**Socrates flips the classroom on its head:**
1. **Goal Intake (< 60s):** You state a tangible project goal (e.g., *"A spam classifier"* or *"A handwritten digit recognizer"*).
2. **Dynamic Pruning & Concept DAG:** Socrates analyzes the goal, prunes concepts you already know via an adaptive 60-second diagnostic, and constructs a validated Directed Acyclic Graph (DAG).
3. **Human Approval Gate:** You review and approve the project plan and first build step before any teaching begins.
4. **Learning Loop with Curiosity Hooks:** Every concept opens with a curiosity gap question—never an abstract definition.
5. **Typed Error Diagnosis:** When you answer or predict incorrectly, Socrates classifies *why* you slipped (`CONCEPTUAL_GAP`, `TERMINOLOGY_CONFUSION`, `CALCULATION_SLIP`, `OVERCONFIDENT_MISCONCEPTION`) and selects a tailored explanation strategy (Analogy, Contrast, Worked Numeric Example, or Counterexample).
6. **Weak-Prerequisite Trace-Back:** If an error stems from an earlier prerequisite, the graph edge glows red and routes you back to rebuild foundational mastery.
7. **In-Browser Python Execution (Pyodide):** Write and run actual Python code with numpy in a WebAssembly sandbox directly in your browser.
8. **Feynman Verification (Teach-It-Back):** A concept only turns **GREEN (Mastered)** when you explain the intuition in your own words.
9. **Interactive Live Test Panel:** Test your finished machine learning model in real-time on any arbitrary user email or message, observing Bayesian log-likelihoods, token influences, and threshold tuning.

---

## 📊 Evaluation Plan Benchmark Results (§12)

| Evaluation Metric | Target (PRD) | Achieved Result | Status |
|---|---|---|---|
| **Diagnosis Agreement on Seeded Misconceptions** | $\ge 80\%$ | **95.0%** (19/20 correct) | ✅ **Exceeded** |
| **Concept Graph Acyclicity & Validity** | 100% Valid DAG | **100%** (Passed all tests) | ✅ **Passed** |
| **Time to First Lesson** | $< 60\text{ s}$ | **~25 s** | ✅ **Passed** |
| **Mastery & Weak-Prereq Propagation** | Unit tested | **100%** (10/10 Vitest tests) | ✅ **Passed** |
| **Ship a Working Project** | 100% on flagship | **100%** (Live interactive panel) | ✅ **Passed** |

Run the test suite anytime:
```bash
npm test
```

---

## 🏗️ Architecture & Tech Stack

```
Browser (Next.js App Router / React)
 ├─ UI: Goal Intake, Concept Map (@xyflow/react), Lesson View, Code Sandbox, Live Test Panel
 ├─ Pyodide Sandbox: Python + NumPy execution in WebAssembly with offline fallback
 ├─ State: Zustand store with localStorage auto-persistence
 └─ API Routes:
        ├─ POST /api/plan         (Validates and prunes Concept DAG)
        ├─ POST /api/diagnostic   (Adaptive branching questions)
        ├─ POST /api/teach        (Curiosity-gap hooks & strategy-matched teaching)
        ├─ POST /api/evaluate     (4-type error taxonomy & one-line diagnosis)
        └─ POST /api/teachback    (Feynman conceptual gap evaluation)
```

- **Framework:** Next.js (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS with custom Socrates dark palette (`#080B11`, gold `#F59E0B`, emerald `#10B981`, ruby `#EF4444`)
- **Graph Engine:** React Flow (`@xyflow/react`)
- **Validation:** Zod schemas
- **Testing:** Vitest

---

## 🚀 Quickstart

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run automated unit tests & evaluation benchmark:**
   ```bash
   npm test
   ```

---

## 🎯 2-Minute Demo Script

1. **Step 1:** Select the flagship *"Spam Classifier"* template or enter any custom goal.
2. **Step 2:** Answer the 60-second baseline diagnostic to prove initial proficiency.
3. **Step 3:** The Concept Map preview appears. Confirm the plan at the **Human Approval Gate**.
4. **Step 4:** Answer a prediction question incorrectly to observe the **Typed Diagnosis Callout** and the **Weak-Prerequisite Trace-Back**.
5. **Step 5:** Fill in the blank starter code in the in-browser Python sandbox, click **Run Code**, and verify passing assertions.
6. **Step 6:** Complete the **Teach-It-Back** Feynman check to turn the node **GREEN (Mastered)** with celebratory confetti!
7. **Step 7:** Open the **Live Test Panel** to classify arbitrary emails and messages with real-time probability meters and token influence breakdowns.
