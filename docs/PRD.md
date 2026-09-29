# Socrates — Product Requirements Document

**Product:** Socrates, a project-first AI tutor for learning AI
**Hackathon:** BFWAI / AI Build Challenge 2026 · PS-03 Personalised AI Tutor for Learning AI
**Owner:** Solo builder (full-stack) · **Build tool:** Google Antigravity
**Target ship date:** 1 Oct 2026 · **Doc status:** v1.0, ready for build

---

## 1. Summary

Socrates skips the curriculum. The learner names a project they want to build ("a spam classifier"). Socrates reverse-engineers the AI concepts that project needs, teaches each one just-in-time, has the learner use it immediately inside their own project, and diagnoses *why* they are wrong when they slip. The learner leaves with a working project and a concept map proving what they can apply.

**One-liner:** Tell it your project goal. It teaches exactly the AI you need, right when you need it.

### What makes it different
| Typical adaptive tutor | Socrates |
|---|---|
| Fixed modules, adaptive difficulty slider | No modules. Path is derived live from the learner's goal |
| Right/wrong scoring | Error-type diagnosis (why they're wrong) |
| Progress bar or badge as output | A working project the learner can test on any input |
| Concepts taught "just in case" | Concepts taught "just in time" |

---

## 2. Problem and users

**Problem.** AI courses teach concepts in a fixed order before the learner builds anything real. Learners forget most of it before it's useful, and drop off before making anything.

**Primary user.** A self-taught developer or student who wants to build something specific and does not want 40 hours of theory first. Ranges from no-math beginner to experienced coder skipping ahead.

**Cost today.** Weeks on modules that don't map to the goal, no working project, concepts forgotten before they are needed.

---

## 3. Goals, non-goals, success metrics

### Goals
1. Learner names a goal and starts learning within 60 seconds, with no menu.
2. Every concept is taught at the moment the project needs it.
3. Every session ends with a running project.
4. Wrong answers get a typed diagnosis and a matched explanation.
5. Progress is visible as a concept map that builds itself.

### Non-goals (v1)
- User accounts, auth, payments, teacher dashboards
- Video content of any kind
- Voice mode, mobile app
- Arbitrary free-form projects with full code generation (v1 supports two project templates deeply, other goals get a concept path plus worked examples)
- Certification or credentialing

### Success metrics (from the deck's evaluation plan)
| Metric | Target | How measured |
|---|---|---|
| Learners who ship a working project | 100% of ~10 test learners on the flagship template | Manual session review |
| Diagnosis accuracy | ≥ 80% agreement with hand labels | Eval script on ~20 seeded misconceptions across ~10 concepts |
| Concept-application accuracy | ≥ 70% on a short post-test | 5-question post-test after session |
| Time to first lesson | < 60 s from landing | Timer in test sessions |
| Median LLM response latency | < 4 s (first token < 1.5 s on streamed teach) | Server logs |

---

## 4. Core user flow

```
Landing → 1. State goal (+ optional interests)
        → 2. Adaptive diagnostic (3–5 questions, < 1 min)
        → 3. Plan generated: concept graph pruned to what the learner still needs
        → 4. HUMAN APPROVAL: learner confirms goal and first concept
        → 5. LEARNING LOOP (repeats per concept)
              a. Hook question (curiosity gap, not a definition)
              b. Learner attempts / predicts
              c. If wrong → typed diagnosis → matched explanation (analogy / contrast / worked example / counterexample)
              d. Build step: learner writes or completes a code cell that adds to their project
              e. Teach-it-back: learner explains in own words; tutor checks
              f. Mastery updates; node turns green; next concept unlocks
        → 6. Project complete → live test panel ("try it on your own input") + final concept map
```

Loop exit: all concepts on the path are mastered, or the learner ends the session (progress saved locally).

---

## 5. Functional requirements

Priority: **P0** must ship for demo · **P1** should ship · **P2** stretch.

### 5.1 Onboarding and goal intake
| ID | Requirement | Pri |
|---|---|---|
| F-1 | Single text input: "What do you want to build?" with 3 example chips (spam classifier, handwriting recognizer, how ChatGPT works) | P0 |
| F-2 | Optional "What are you into?" field (gaming, music, sports, cooking...) used to personalise analogies | P1 |
| F-3 | Goal is matched to a project template if one fits; otherwise a generic concept path is generated | P0 |

### 5.2 Adaptive diagnostic
| ID | Requirement | Pri |
|---|---|---|
| F-4 | 3–5 branching questions; each next question depends on the last answer | P0 |
| F-5 | Correct answer skips ahead to a harder concept; wrong answer probes the prerequisite | P0 |
| F-6 | Output is an initial mastery vector over the goal's concept nodes | P0 |
| F-7 | "I already know this" skip control per question | P2 |

### 5.3 Path planning and concept map
| ID | Requirement | Pri |
|---|---|---|
| F-8 | Generate a concept DAG (6–10 nodes) from the goal via LLM, validated against schema (acyclic, all prereqs exist) | P0 |
| F-9 | Prune nodes the diagnostic shows are already mastered | P0 |
| F-10 | Render as an interactive graph (React Flow); node colours: gray unseen, amber learning, red shaky, green mastered | P0 |
| F-11 | Human approval gate: learner confirms goal and first concept before teaching starts | P0 |
| F-12 | Weak-prerequisite trace-back: when a diagnosis points to a prerequisite, highlight the edge and route the learner to that node | P0 |
| F-13 | Cached fallback graphs for the two flagship templates if generation fails or is invalid | P0 |

### 5.4 Teaching engine
| ID | Requirement | Pri |
|---|---|---|
| F-14 | Each lesson opens with a hook question, never a definition | P0 |
| F-15 | Explanation strategy is chosen from the diagnosed error type (see §6.3) | P0 |
| F-16 | Examples use the project's own data and numbers | P0 |
| F-17 | Analogies drawn from the learner's stated interests when provided | P1 |
| F-18 | Tutor recalls earlier misconceptions and references them ("remember when you thought...") | P1 |
| F-19 | Predict-then-reveal before running code | P1 |
| F-20 | Streamed responses so text appears immediately | P0 |

### 5.5 Build step and sandbox
| ID | Requirement | Pri |
|---|---|---|
| F-21 | In-browser Python cell (Pyodide, numpy only) with fill-in-the-blank starter code per concept | P0 |
| F-22 | Cell run returns stdout/errors; pass/fail via assertions defined per step | P0 |
| F-23 | Each passed step adds a function/component to the growing project | P0 |
| F-24 | Fallback: if Pyodide fails to load, the step becomes a worked example plus a multiple-choice check | P0 |
| F-25 | Live test panel: learner types any input (e.g. an email) and the built model classifies it | P0 |
| F-26 | Second project template (handwriting/digit recognizer) | P2 |

### 5.6 Diagnosis and mastery
| ID | Requirement | Pri |
|---|---|---|
| F-27 | Every wrong answer or code failure is classified into an error type (§6.2) with a one-line human-readable diagnosis shown to the learner | P0 |
| F-28 | Per-concept mastery score updated after each attempt (§6.4) | P0 |
| F-29 | A concept reaches "mastered" only after a passing teach-it-back, not just a correct answer | P0 |
| F-30 | Teach-it-back: learner writes an explanation; tutor returns gaps and pass/fail | P0 |

### 5.7 Session and persistence
| ID | Requirement | Pri |
|---|---|---|
| F-31 | Session state saved in browser storage; reload resumes where the learner left | P1 |
| F-32 | End-of-session summary: project built, concepts mastered, misconceptions caught | P1 |
| F-33 | Cliffhanger teaser for the next concept at the end of each lesson | P2 |

---

## 6. Learning engine specification

### 6.1 Concept graph
Node schema:
```json
{
  "id": "gradient-descent",
  "title": "Gradient descent",
  "prereqs": ["loss-function"],
  "hook": "Why can training longer make a model worse?",
  "buildStep": "Implement one weight-update step",
  "difficulty": 1-5
}
```
Validation rules: 6–10 nodes, acyclic, every prereq id exists, at least one leaf that maps to the project's final capability. On failure, retry once, then use cached fallback graph.

### 6.2 Error taxonomy
| Type | Meaning | Example |
|---|---|---|
| `CONCEPTUAL_GAP` | Missing or wrong mental model | Thinks gradient descent walks uphill |
| `TERMINOLOGY_CONFUSION` | Right idea, wrong or swapped terms | Mixes up backprop and gradient descent |
| `CALCULATION_SLIP` | Understands, executes wrong | Sign error in a weight update |
| `OVERCONFIDENT_MISCONCEPTION` | Confident, wrong, resistant | "More epochs always improves the model" |
| `NONE` | Correct | — |

Each diagnosis also returns `rootCauseConceptId` (the concept the error really stems from, which may be a prerequisite of the current one).

### 6.3 Error type → explanation strategy
| Error type | Strategy |
|---|---|
| Conceptual gap | Analogy-first (from learner's interests if available), then a tiny worked example |
| Terminology confusion | Precise definitions plus a side-by-side contrast of the two terms |
| Calculation slip | Step-by-step worked numeric example using the project's numbers |
| Overconfident misconception | Counterexample that breaks the learner's current model, then re-explain |

### 6.4 Mastery model
- Per concept `m ∈ [0,1]`, initialised from the diagnostic (correct = 0.6, wrong = 0.2, unseen = 0.0).
- After each attempt: `m ← m + 0.3 × (outcome − m)` where outcome = 1 for correct, 0 for wrong; a hinted or second-try success counts 0.6.
- States: `< 0.4` shaky (red) · `0.4–0.75` learning (amber) · `≥ 0.75` candidate.
- **Mastered** requires `m ≥ 0.75` and a passed teach-it-back.
- Propagation: a diagnosis with `rootCauseConceptId ≠ current` reduces that prerequisite's `m` by 0.2 and queues it before the current concept.

### 6.5 Next-concept selection
1. If a queued prerequisite exists, take it.
2. Otherwise the unmastered concept whose prerequisites are all mastered, ordered by the project's build sequence.
3. If several tie, prefer the one the learner's last error pointed toward.

---

## 7. LLM contracts

Model provider is abstracted behind one `llm.generate()` function (Gemini primary, Claude swappable). All responses are JSON validated with Zod; on parse failure retry once with the error appended, then fall back. Prompts live in `/prompts` as versioned files. Every call receives the compact learner profile (goal, interests, mastery vector, last 3 misconceptions).

| Endpoint | Input | Output |
|---|---|---|
| `POST /api/plan` | goal, interests?, background? | `{ concepts[], edges[], templateId?, rationale }` |
| `POST /api/diagnostic/next` | goal, concepts, history[] | `{ question, options[], targetConceptId }` or `{ done: true, mastery{} }` |
| `POST /api/teach` (stream) | concept, profile, lastDiagnosis? | `{ hook, explanation, strategy, example, checkQuestion, buildTask }` |
| `POST /api/evaluate` | concept, question, answer or code+runResult | `{ correct, errorType, rootCauseConceptId, diagnosis, feedback }` |
| `POST /api/teachback` | concept, explanation | `{ passed, gaps[], followUp }` |

Rules for all prompts: never open with a definition in `hook`; ground `example` in the project's own data; keep `diagnosis` to one sentence; never reveal the answer before the learner attempts.

---

## 8. Architecture

```
Browser (Next.js / React)
 ├─ UI: onboarding, concept map (React Flow), lesson view, code cell, live test panel
 ├─ Pyodide worker (Python + numpy, lazy-loaded)
 ├─ State: Zustand + localStorage persistence
 └─ fetch /api/*  (streaming for /teach)
        │
Next.js API routes (serverless, Vercel)
 ├─ llm.ts  (provider abstraction, retries, Zod validation)
 ├─ mastery.ts (pure functions, unit-tested)
 ├─ graph.ts (DAG validation, next-concept selection)
 └─ templates/ (cached graphs + build steps for spam-classifier, digit-recognizer)
        │
LLM provider API (key held server-side only)
```

### Tech stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | UI and API in one deploy |
| Styling | Tailwind CSS | Speed |
| Graph | React Flow | No hand-rolled layout |
| State | Zustand | Minimal boilerplate |
| Validation | Zod | Contract enforcement for LLM JSON |
| Sandbox | Pyodide in a Web Worker | No backend execution, safe |
| Hosting | Vercel | One-click deploy |
| Tests | Vitest | Mastery/graph logic and eval script |

### Data model (client state)
```ts
Session { id, goal, interests?, templateId?, concepts: Concept[], edges: Edge[],
          mastery: Record<conceptId, number>, status: Record<conceptId, State>,
          misconceptions: {conceptId, errorType, note, ts}[],
          projectParts: {conceptId, code}[], queue: conceptId[] }
```
No server database in v1. Nothing is stored server-side.

---

## 9. UI screens

1. **Landing / goal input.** Big single field, example chips, optional interests.
2. **Diagnostic.** One question at a time, progress dots, no timer.
3. **Plan review.** Concept map preview with the recommended first node, "Start" button (the approval gate).
4. **Learning view.** Left: concept map (collapsible). Centre: hook → explanation → check. Right or below: code cell with Run and Submit. Diagnosis appears as a labelled callout ("Diagnosis: terminology mix-up").
5. **Teach-it-back.** Text box, "Explain it in your own words", inline gap highlights.
6. **Project complete.** Live test panel plus final concept map and summary.

Design direction: dark background, gold accent (matches the deck), readable code font, node colour changes animated (300 ms).

---

## 10. Non-functional requirements

- **Latency:** first token of streamed teach < 1.5 s; non-stream calls < 4 s median.
- **Reliability:** every LLM call has a retry and a cached or templated fallback so the demo never dead-ends.
- **Safety:** no arbitrary code leaves the browser; sandbox is Pyodide only; no user PII collected.
- **Security:** API key only in server env; rate-limit `/api/*` per IP.
- **Accessibility:** keyboard-navigable, colour is never the only state signal (icons plus labels on nodes).
- **Cost:** cap tokens per call; cache the plan for identical goals.

---

## 11. Build plan (Antigravity missions)

Timeline: 28 Sep → 1 Oct. Run independent missions in parallel in the Manager view and require a verification artifact for each.

| # | Mission | Acceptance (verified by artifact) |
|---|---|---|
| M1 | Scaffold Next.js + Tailwind + Zustand; landing and goal input | Screenshot of running app |
| M2 | Concept map component with hardcoded spam-classifier graph and node states | Screenshot of all four node colours |
| M3 | `llm.ts`, Zod schemas, `/api/plan` and `/api/diagnostic/next` with cached fallback | Sample request/response log; failure-injection test passes |
| M4 | `mastery.ts` and `graph.ts` (update, propagation, next-concept) with Vitest | Test report, all green |
| M5 | `/api/teach` (streaming) and `/api/evaluate` with the four explanation strategies | Transcript for one case per error type |
| M6 | Pyodide worker, code cell, per-step assertions, live test panel, fallback mode | Screen recording: fill blank → run → pass → live classify |
| M7 | `/api/teachback` and mastery gating; approval gate; trace-back highlight | Recording of a wrong answer tracing to a prerequisite |
| M8 | Session persistence, summary screen, polish, eval script, deploy to Vercel | Live URL, eval report, final demo run |

Suggested order: Day 1 → M1–M4 (M2 and M3/M4 in parallel). Day 2 → M5–M7. Day 3 → M8, then rehearsal.

**Cut order if time runs short:** F-33, F-26, F-18/F-19, F-17, F-31. **Never cut:** diagnostic, concept map, typed diagnosis, teach-it-back, live test panel.

---

## 12. Evaluation plan

1. **Diagnosis accuracy.** Write ~20 seeded wrong answers across ~10 concepts (e.g. "gradient descent and backprop are the same thing"), each hand-labelled with an error type. Run `/api/evaluate` on all; report agreement %.
2. **Learner sessions.** ~10 test learners run the spam-classifier goal end to end. Record: shipped project (yes/no), time to first lesson, concepts mastered.
3. **Post-test.** 5 short application questions after the session; report % correct.
4. **Failure catching.** Log every case where the tutor advanced despite a diagnosed gap; review manually.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| LLM returns invalid JSON or a broken graph | Demo dead-ends | Zod validation, one retry, cached fallback graphs |
| Pyodide slow or fails to load | Build step unusable | Preload after onboarding; worked-example fallback (F-24) |
| Latency on stage | Feels sluggish | Stream `/teach`; keep one LLM call per step |
| Diagnosis mislabels errors | Weakens core pitch | Eval set, tighter prompt with few-shot examples per type |
| Free-form goals are too open | Poor path quality | Match to templates first; otherwise concept path plus worked examples, and say so in the UI |
| Scope creep | Misses 1 Oct | Priority tags above and the cut order in §11 |

---

## 14. Demo script (2 minutes)

1. Type "a spam classifier". Show the diagnostic adapting to two answers.
2. Plan appears as a concept map; confirm the first concept (approval gate).
3. Answer one question wrong on purpose. Show the typed diagnosis and the matched explanation.
4. Show the trace-back to the weak prerequisite node.
5. Fill and run a code cell; a node turns green after a passing teach-it-back.
6. Open the live test panel and let a judge type their own message for the built classifier to classify.
7. Close: "It didn't teach me a course. It taught me exactly what my project needed, and I have a working project."

---

## 15. Out of scope and roadmap

Post-hackathon: accounts and saved history, more project templates, voice tutor, spaced-repetition review of mastered concepts, cliffhanger session hooks, educator view, mobile.

---

## Appendix A — Flagship template: spam classifier

Suggested concept graph (8 nodes):
`what-is-classification` → `features-from-text` → `probability-basics` → `bayes-rule` → `naive-bayes` → `training-vs-testing` → `evaluating-accuracy` → `improving-the-model`

Build steps (each adds one function to the project): tokenise text → count word frequencies per class → compute class priors → compute word likelihoods with smoothing → classify a message → evaluate on held-out messages → live test panel.

Data: a small bundled labelled dataset (~200 short messages, generated or hand-written) so nothing is fetched at runtime.

## Appendix B — Example seeded misconceptions for the eval set

- "Training accuracy of 100% means the model is perfect."
- "Naive Bayes assumes words are independent, so it can't work on real text."
- "More features always make the model better."
- "Probability of spam given the word equals probability of the word given spam."
- "Testing on the training data is fine if the dataset is big."