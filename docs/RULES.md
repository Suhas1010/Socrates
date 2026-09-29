# Socrates — Project Rules

Follow these rules for every task in this project:

1. **Stack**: Next.js (App Router) + TypeScript + Tailwind CSS + Zustand + Zod + React Flow + Vitest. Deploy target: Vercel. No database; state lives in the browser (localStorage).
2. **Secrets**: The LLM API key is read only from `process.env` on the server (`GEMINI_API_KEY`, model name from `LLM_MODEL`). Never expose it to the client or log it.
3. **Resilience**: Every LLM response must be JSON validated with Zod. On parse failure retry once with the error message appended, then use a cached fallback. The app must never dead-end.
4. **Code Organization**: Keep files small and typed. Put prompts in `/prompts` as `.txt` files. Put pure logic (mastery, graph) in `/lib` with unit tests.
5. **Design**: Dark background (`#0b0a08`), gold accent (`#FFD27A`), cream text (`#F4EFE6`), muted text (`#9E988E`), monospace for code. Rounded cards with subtle borders.
6. **Verification**: After finishing each task: run the app or tests, and produce a verification artifact (screenshot, recording, or test report) showing it works.
7. **Scope Discipline**: Do not add features outside the current task. Do not add auth, a database, or video.
