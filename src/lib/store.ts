import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Concept,
  ConceptEdge,
  ConceptStatus,
  ScreenType,
  CodingBackground,
  DiagnosticQuestion,
  ErrorType,
  ExplanationStrategy,
  MisconceptionRecord,
  ProjectPart,
  LearningPhase,
} from "./types";
import {
  SPAM_CLASSIFIER_CONCEPTS,
  SPAM_CLASSIFIER_EDGES,
  SPAM_DIAGNOSTIC_QUESTIONS,
} from "./templates/spamClassifier";
import {
  DIGIT_RECOGNIZER_CONCEPTS,
  DIGIT_RECOGNIZER_EDGES,
} from "./templates/digitRecognizer";
import {
  CHATGPT_CONCEPTS,
  CHATGPT_EDGES,
  CHATGPT_DIAGNOSTIC_QUESTIONS,
} from "./templates/chatGpt";
import {
  SENTIMENT_ANALYSIS_CONCEPTS,
  SENTIMENT_ANALYSIS_EDGES,
  SENTIMENT_DIAGNOSTIC_QUESTIONS,
} from "./templates/sentimentAnalysis";
import {
  REAL_ESTATE_CONCEPTS,
  REAL_ESTATE_EDGES,
  REAL_ESTATE_DIAGNOSTIC_QUESTIONS,
} from "./templates/realEstate";
import {
  PYTHON_TRACK_CONCEPTS,
  PYTHON_TRACK_EDGES,
} from "./templates/pythonTrack";
import {
  generateDiagnosticQuestionsForGoal,
  generateFallbackConceptsForGoal,
  generateFallbackEdgesForGoal,
} from "./diagnostics";
import {
  getConceptStatus,
  updateMasteryScore,
  propagatePrerequisiteError,
  initializeMasteryFromDiagnostic,
} from "./mastery";
import { getNextConcept } from "./graph";

export interface SessionStoreState {
  id: string;
  goal: string;
  interests: string;
  background: CodingBackground;
  templateId: string;
  screen: ScreenType;
  activeStage: "landing" | "diagnostic" | "plan_review" | "learning" | "completed";
  
  // API Key & Model
  apiKey: string;
  isLoadingPlan: boolean;

  // Concept Graph
  concepts: Concept[];
  edges: ConceptEdge[];
  mastery: Record<string, number>;
  status: Record<string, ConceptStatus>;
  teachBackPassed: Record<string, boolean>;
  currentConceptId: string | null;
  queue: string[];
  highlightedEdge: { from: string; to: string } | null;

  // Diagnostic state
  diagnosticIndex: number;
  diagnosticQuestions: DiagnosticQuestion[];
  diagnosticHistory: {
    questionId: string;
    conceptId: string;
    isCorrect: boolean;
    errorType?: ErrorType;
  }[];

  // Learning and building
  misconceptions: MisconceptionRecord[];
  projectParts: ProjectPart[];
  lastDiagnosisCallout: {
    conceptId: string;
    errorType: ErrorType;
    diagnosis: string;
    strategy: ExplanationStrategy;
    matchedExplanation: string;
    rootCauseConceptId?: string;
  } | null;

  // Pyodide / Sandbox status
  isPyodideReady: boolean;
  pyodideError: string | null;

  // Learning Phase & Track
  learningPhase: LearningPhase;
  learningTrack: "project" | "python_foundation";
  savedProjectConcepts?: Concept[];
  savedProjectEdges?: ConceptEdge[];
  savedCurrentConceptId?: string | null;

  // Actions
  setApiKey: (apiKey: string) => void;
  setLearningPhase: (phase: LearningPhase) => void;
  setLearningTrack: (track: "project" | "python_foundation") => void;
  setGoalAndInterests: (goal: string, interests: string, background?: CodingBackground) => void;
  generatePlanForGoal: (goal: string, interests: string, background?: CodingBackground) => Promise<void>;
  setBackground: (background: CodingBackground) => void;
  startDiagnostic: () => void;
  answerDiagnostic: (optionIndex: number) => void;
  skipDiagnostic: () => void;
  confirmPlan: () => void;
  selectConcept: (conceptId: string) => void;
  submitLessonAnswer: (params: {
    conceptId: string;
    isCorrect: boolean;
    errorType: ErrorType;
    diagnosis: string;
    strategy: ExplanationStrategy;
    matchedExplanation: string;
    rootCauseConceptId?: string;
  }) => void;
  completeBuildStep: (conceptId: string, code: string) => void;
  submitTeachBack: (conceptId: string, passed: boolean) => void;
  advanceToNextConcept: () => void;
  clearDiagnosisCallout: () => void;
  setHighlightedEdge: (edge: { from: string; to: string } | null) => void;
  setPyodideStatus: (ready: boolean, error?: string | null) => void;
  setScreen: (screen: ScreenType) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      id: "session-" + Date.now(),
      goal: "",
      interests: "",
      background: "beginner" as CodingBackground,
      templateId: "spam-classifier",
      screen: "landing",
      activeStage: "landing",

      apiKey: "",
      isLoadingPlan: false,

      concepts: SPAM_CLASSIFIER_CONCEPTS,
      edges: SPAM_CLASSIFIER_EDGES,
      mastery: Object.fromEntries(SPAM_CLASSIFIER_CONCEPTS.map((c) => [c.id, 0.0])),
      status: Object.fromEntries(
        SPAM_CLASSIFIER_CONCEPTS.map((c) => [c.id, "unseen" as ConceptStatus])
      ),
      teachBackPassed: {},
      currentConceptId: null,
      queue: [],
      highlightedEdge: null,

      diagnosticIndex: 0,
      diagnosticQuestions: SPAM_DIAGNOSTIC_QUESTIONS,
      diagnosticHistory: [],

      misconceptions: [],
      projectParts: [],
      lastDiagnosisCallout: null,

      isPyodideReady: false,
      pyodideError: null,

      learningPhase: "theory",
      learningTrack: "project",
      savedProjectConcepts: undefined,
      savedProjectEdges: undefined,
      savedCurrentConceptId: undefined,

      setApiKey: (apiKey: string) => {
        set({ apiKey });
      },

      setLearningPhase: (phase: LearningPhase) => {
        set({ learningPhase: phase });
      },

      setLearningTrack: (track: "project" | "python_foundation") => {
        const state = get();
        if (track === "python_foundation" && state.learningTrack !== "python_foundation") {
          set({
            learningTrack: "python_foundation",
            savedProjectConcepts: state.concepts,
            savedProjectEdges: state.edges,
            savedCurrentConceptId: state.currentConceptId,
            concepts: PYTHON_TRACK_CONCEPTS,
            edges: PYTHON_TRACK_EDGES,
            currentConceptId: "python-vars",
            learningPhase: "theory",
          });
        } else if (track === "project" && state.learningTrack === "python_foundation") {
          const restoredConcepts = state.savedProjectConcepts || SPAM_CLASSIFIER_CONCEPTS;
          const restoredEdges = state.savedProjectEdges || SPAM_CLASSIFIER_EDGES;
          set({
            learningTrack: "project",
            concepts: restoredConcepts,
            edges: restoredEdges,
            currentConceptId: state.savedCurrentConceptId || restoredConcepts[0]?.id || null,
          });
        }
      },

      setGoalAndInterests: (goal, interests, background = "beginner") => {
        const lower = (goal || "").toLowerCase();
        let chosenTemplate = "custom";
        let concepts: Concept[] = generateFallbackConceptsForGoal(goal);
        let edges: ConceptEdge[] = generateFallbackEdgesForGoal(concepts);
        let questions: DiagnosticQuestion[] = generateDiagnosticQuestionsForGoal(goal);

        const isPlantOrAgri =
          lower.includes("plant") ||
          lower.includes("crop") ||
          lower.includes("leaf") ||
          lower.includes("leaves") ||
          lower.includes("botan") ||
          lower.includes("agri") ||
          lower.includes("tree");

        if (isPlantOrAgri) {
          chosenTemplate = "plant-disease";
          concepts = generateFallbackConceptsForGoal(goal);
          edges = generateFallbackEdgesForGoal(concepts);
          questions = generateDiagnosticQuestionsForGoal(goal);
        } else if (
          lower.includes("spam") ||
          lower.includes("email") ||
          lower.includes("bayes")
        ) {
          chosenTemplate = "spam-classifier";
          concepts = SPAM_CLASSIFIER_CONCEPTS;
          edges = SPAM_CLASSIFIER_EDGES;
          questions = SPAM_DIAGNOSTIC_QUESTIONS;
        } else if (
          lower.includes("chatgpt") ||
          lower.includes("gpt") ||
          lower.includes("llm") ||
          lower.includes("transformer") ||
          lower.includes("language model")
        ) {
          chosenTemplate = "chatgpt";
          concepts = CHATGPT_CONCEPTS;
          edges = CHATGPT_EDGES;
          questions = CHATGPT_DIAGNOSTIC_QUESTIONS;
        } else if (
          lower.includes("sentiment") ||
          lower.includes("movie") ||
          lower.includes("review") ||
          lower.includes("polarity")
        ) {
          chosenTemplate = "sentiment-analysis";
          concepts = SENTIMENT_ANALYSIS_CONCEPTS;
          edges = SENTIMENT_ANALYSIS_EDGES;
          questions = SENTIMENT_DIAGNOSTIC_QUESTIONS;
        } else if (
          lower.includes("real estate") ||
          lower.includes("house") ||
          lower.includes("housing") ||
          lower.includes("property") ||
          lower.includes("price prediction")
        ) {
          chosenTemplate = "real-estate";
          concepts = REAL_ESTATE_CONCEPTS;
          edges = REAL_ESTATE_EDGES;
          questions = REAL_ESTATE_DIAGNOSTIC_QUESTIONS;
        } else if (
          !isPlantOrAgri &&
          (lower.includes("handwriting") ||
            lower.includes("digit") ||
            lower.includes("mnist"))
        ) {
          chosenTemplate = "digit-recognizer";
          concepts = DIGIT_RECOGNIZER_CONCEPTS;
          edges = DIGIT_RECOGNIZER_EDGES;
          questions = [
            {
              id: "diag-digit-1",
              targetConceptId: "pixels-to-vectors",
              question: "How does a neural network process an image of a handwritten digit?",
              options: [
                { text: "It flattens pixel brightness numbers into a numerical vector.", isCorrect: true, errorType: "NONE" },
                { text: "It prints out the image on paper and scans it with a laser.", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION" },
                { text: "It ignores pixel brightness and counts the colors.", isCorrect: false, errorType: "CONCEPTUAL_GAP" },
                { text: "It requires human handwriting experts to grade each pixel live.", isCorrect: false, errorType: "OVERCONFIDENT_MISCONCEPTION" },
              ],
            },
          ];
        }

        const initMastery = Object.fromEntries(concepts.map((c) => [c.id, 0.0]));
        const initStatus = Object.fromEntries(
          concepts.map((c) => [c.id, "unseen" as ConceptStatus])
        );

        set({
          goal,
          interests,
          background,
          templateId: chosenTemplate,
          concepts,
          edges,
          mastery: initMastery,
          status: initStatus,
          diagnosticQuestions: questions,
          diagnosticIndex: 0,
          diagnosticHistory: [],
          currentConceptId: concepts[0].id,
          screen: "diagnostic",
          activeStage: "diagnostic",
        });
      },

      generatePlanForGoal: async (goal, interests, background = "beginner") => {
        set({ isLoadingPlan: true });
        const lower = goal.toLowerCase();

        // 1. Initial fast local resolution
        get().setGoalAndInterests(goal, interests, background);

        // 2. Fetch /api/plan with LLM or dynamic backend generator
        try {
          const storedKey =
            get().apiKey ||
            (typeof window !== "undefined"
              ? localStorage.getItem("socrates_gemini_api_key") || ""
              : "");

          const res = await fetch("/api/plan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(storedKey ? { "x-gemini-api-key": storedKey } : {}),
            },
            body: JSON.stringify({
              goal,
              interests,
              background,
              apiKey: storedKey,
            }),
          });

          if (res.ok) {
            const plan = await res.json();
            if (plan.concepts && plan.concepts.length > 0) {
              const concepts: Concept[] = plan.concepts;
              const edges: ConceptEdge[] = plan.edges || [];
              const initMastery = Object.fromEntries(concepts.map((c) => [c.id, 0.0]));
              const initStatus = Object.fromEntries(
                concepts.map((c) => [c.id, "unseen" as ConceptStatus])
              );

              // Also fetch dynamic diagnostic questions for this plan
              let questions = get().diagnosticQuestions;
              try {
                const diagRes = await fetch("/api/diagnostic/next", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(storedKey ? { "x-gemini-api-key": storedKey } : {}),
                  },
                  body: JSON.stringify({
                    goal,
                    templateId: plan.templateId,
                    concepts,
                    history: [],
                    apiKey: storedKey,
                  }),
                });
                if (diagRes.ok) {
                  const diagData = await diagRes.json();
                  if (diagData.questions && Array.isArray(diagData.questions) && diagData.questions.length > 0) {
                    questions = diagData.questions;
                  } else if (diagData.question && (!questions || questions.length === 0)) {
                    questions = [diagData.question];
                  }
                }
              } catch (e) {
                console.warn("Could not fetch remote diagnostic questions:", e);
              }

              set({
                templateId: plan.templateId || "custom",
                concepts,
                edges,
                mastery: initMastery,
                status: initStatus,
                currentConceptId: plan.startingConceptId || concepts[0].id,
                diagnosticQuestions: questions,
                diagnosticIndex: 0,
                diagnosticHistory: [],
              });
            }
          }
        } catch (err) {
          console.warn("Error calling /api/plan, using local roadmap:", err);
        } finally {
          set({
            isLoadingPlan: false,
            screen: "diagnostic",
            activeStage: "diagnostic",
          });
        }
      },

      setBackground: (background: CodingBackground) => {
        set({ background });
      },

      startDiagnostic: () => {
        set({
          screen: "diagnostic",
          activeStage: "diagnostic",
          diagnosticIndex: 0,
          diagnosticHistory: [],
        });
      },

      answerDiagnostic: (optionIndex) => {
        const state = get();
        const questionsList =
          state.diagnosticQuestions && state.diagnosticQuestions.length > 0
            ? state.diagnosticQuestions
            : generateDiagnosticQuestionsForGoal(state.goal);

        const currentQ = questionsList[state.diagnosticIndex];
        if (!currentQ) {
          state.confirmPlan();
          return;
        }

        const chosenOption = currentQ.options[optionIndex];
        const isCorrect = chosenOption ? chosenOption.isCorrect : true;
        const newHistory = [
          ...state.diagnosticHistory,
          {
            questionId: currentQ.id,
            conceptId: currentQ.targetConceptId,
            isCorrect,
            errorType: chosenOption?.errorType,
          },
        ];

        const nextIdx = state.diagnosticIndex + 1;
        if (nextIdx >= questionsList.length) {
          const initialMastery = initializeMasteryFromDiagnostic(
            state.concepts.map((c) => c.id),
            newHistory.map((h) => ({ conceptId: h.conceptId, isCorrect: h.isCorrect }))
          );

          // For learners starting from scratch, always begin at Step 1 of the project
          const startingConceptId = state.concepts[0]?.id || "problem-framing";

          const newStatus = Object.fromEntries(
            state.concepts.map((c) => [
              c.id,
              getConceptStatus(initialMastery[c.id] ?? 0, false),
            ])
          );

          set({
            diagnosticHistory: newHistory,
            diagnosticIndex: nextIdx,
            mastery: initialMastery,
            status: newStatus,
            currentConceptId: startingConceptId,
            screen: "plan",
            activeStage: "plan_review",
          });
        } else {
          set({
            diagnosticHistory: newHistory,
            diagnosticIndex: nextIdx,
          });
        }
      },

      skipDiagnostic: () => {
        const state = get();
        const firstConceptId = state.concepts[0]?.id || "what-is-classification";
        set({
          screen: "plan",
          activeStage: "plan_review",
          currentConceptId: firstConceptId,
        });
      },

      confirmPlan: () => {
        const state = get();
        const first = state.currentConceptId || state.concepts[0]?.id;
        const updatedStatus = { ...state.status };
        if (first) {
          updatedStatus[first] = "learning";
        }
        set({
          screen: "learn",
          activeStage: "learning",
          status: updatedStatus,
        });
      },

      selectConcept: (conceptId: string) => {
        const state = get();
        const found = state.concepts.find((c) => c.id === conceptId);
        if (!found) return;

        const updatedStatus = { ...state.status };
        if (updatedStatus[conceptId] === "unseen") {
          updatedStatus[conceptId] = "learning";
        }

        set({
          currentConceptId: conceptId,
          screen: "learn",
          activeStage: "learning",
          status: updatedStatus,
        });
      },

      submitLessonAnswer: ({
        conceptId,
        isCorrect,
        errorType,
        diagnosis,
        strategy,
        matchedExplanation,
        rootCauseConceptId,
      }) => {
        const state = get();
        const currentScore = state.mastery[conceptId] || 0;
        const newScore = updateMasteryScore({
          currentMastery: currentScore,
          outcome: isCorrect ? 1 : 0,
        });
        const isMastered = state.status[conceptId] === "mastered";

        const newStatus = {
          ...state.status,
          [conceptId]: getConceptStatus(newScore, isMastered),
        };

        const updatedMastery = {
          ...state.mastery,
          [conceptId]: newScore,
        };

        let newHighlightedEdge = null;
        if (!isCorrect && rootCauseConceptId && rootCauseConceptId !== conceptId) {
          const prereqUpdates = propagatePrerequisiteError(
            updatedMastery,
            rootCauseConceptId
          );
          Object.assign(updatedMastery, prereqUpdates.updatedMastery);
          newStatus[rootCauseConceptId] = getConceptStatus(
            updatedMastery[rootCauseConceptId] ?? 0,
            state.status[rootCauseConceptId] === "mastered"
          );
          newHighlightedEdge = { from: rootCauseConceptId, to: conceptId };
        }

        const newMisconception: MisconceptionRecord = {
          conceptId,
          errorType,
          note: diagnosis,
          diagnosis,
          timestamp: Date.now(),
        };

        set({
          mastery: updatedMastery,
          status: newStatus,
          highlightedEdge: newHighlightedEdge,
          misconceptions: [...state.misconceptions, newMisconception],
          lastDiagnosisCallout: isCorrect
            ? null
            : {
                conceptId,
                errorType,
                diagnosis,
                strategy,
                matchedExplanation,
                rootCauseConceptId,
              },
        });
      },

      completeBuildStep: (conceptId: string, code: string) => {
        const state = get();
        const existingPartIndex = state.projectParts.findIndex(
          (p) => p.conceptId === conceptId
        );
        const newPart: ProjectPart = {
          conceptId,
          code,
          timestamp: Date.now(),
          passedAssertions: true,
        };

        let updatedParts = [...state.projectParts];
        if (existingPartIndex >= 0) {
          updatedParts[existingPartIndex] = newPart;
        } else {
          updatedParts.push(newPart);
        }

        const currentScore = state.mastery[conceptId] || 0;
        const newScore = Math.max(currentScore, 0.7);
        const isTeachBackDone = !!state.teachBackPassed[conceptId];

        set({
          projectParts: updatedParts,
          mastery: { ...state.mastery, [conceptId]: newScore },
          status: {
            ...state.status,
            [conceptId]: getConceptStatus(newScore, isTeachBackDone),
          },
        });
      },

      submitTeachBack: (conceptId: string, passed: boolean) => {
        const state = get();
        const updatedTeachBack = {
          ...state.teachBackPassed,
          [conceptId]: passed,
        };

        const currentScore = state.mastery[conceptId] || 0.7;
        const newScore = passed ? Math.max(currentScore, 0.9) : currentScore;

        const newStatus = {
          ...state.status,
          [conceptId]: getConceptStatus(newScore, passed),
        };

        set({
          teachBackPassed: updatedTeachBack,
          mastery: { ...state.mastery, [conceptId]: newScore },
          status: newStatus,
        });
      },

      advanceToNextConcept: () => {
        const state = get();
        const { nextConceptId, updatedQueue } = getNextConcept({
          concepts: state.concepts,
          edges: state.edges,
          status: state.status,
          queue: state.queue || [],
          lastErrorConceptId: state.lastDiagnosisCallout?.rootCauseConceptId,
        });

        if (!nextConceptId) {
          set({
            screen: "complete",
            activeStage: "completed",
          });
          return;
        }

        const updatedStatus = { ...state.status };
        if (updatedStatus[nextConceptId] === "unseen") {
          updatedStatus[nextConceptId] = "learning";
        }

        set({
          currentConceptId: nextConceptId,
          queue: updatedQueue,
          status: updatedStatus,
          lastDiagnosisCallout: null,
          highlightedEdge: null,
        });
      },

      clearDiagnosisCallout: () => {
        set({ lastDiagnosisCallout: null, highlightedEdge: null });
      },

      setHighlightedEdge: (edge) => {
        set({ highlightedEdge: edge });
      },

      setPyodideStatus: (ready, error = null) => {
        set({ isPyodideReady: ready, pyodideError: error });
      },

      setScreen: (screen) => {
        set({ screen });
      },

      resetSession: () => {
        set({
          id: "session-" + Date.now(),
          goal: "",
          interests: "",
          templateId: "spam-classifier",
          screen: "landing",
          activeStage: "landing",
          concepts: SPAM_CLASSIFIER_CONCEPTS,
          edges: SPAM_CLASSIFIER_EDGES,
          diagnosticQuestions: SPAM_DIAGNOSTIC_QUESTIONS,
          mastery: Object.fromEntries(SPAM_CLASSIFIER_CONCEPTS.map((c) => [c.id, 0.0])),
          status: Object.fromEntries(
            SPAM_CLASSIFIER_CONCEPTS.map((c) => [c.id, "unseen" as ConceptStatus])
          ),
          teachBackPassed: {},
          currentConceptId: null,
          queue: [],
          highlightedEdge: null,
          diagnosticIndex: 0,
          diagnosticHistory: [],
          misconceptions: [],
          projectParts: [],
          lastDiagnosisCallout: null,
        });
      },
    }),
    {
      name: "socrates-tutor-session",
      partialize: (state) => ({
        id: state.id,
        goal: state.goal,
        interests: state.interests,
        background: state.background,
        templateId: state.templateId,
        screen: state.screen,
        activeStage: state.activeStage,
        apiKey: state.apiKey,
        concepts: state.concepts,
        edges: state.edges,
        mastery: state.mastery,
        status: state.status,
        teachBackPassed: state.teachBackPassed,
        currentConceptId: state.currentConceptId,
        queue: state.queue,
        diagnosticIndex: state.diagnosticIndex,
        diagnosticQuestions: state.diagnosticQuestions,
        diagnosticHistory: state.diagnosticHistory,
        misconceptions: state.misconceptions,
        projectParts: state.projectParts,
      }),
    }
  )
);
