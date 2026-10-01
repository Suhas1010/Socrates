import { Concept } from "./types";

/**
 * Generates a clean, pinned requirements.txt tailored to the project domain
 */
export function generateRequirementsTxt(goal: string): string {
  const safeGoal = goal?.toLowerCase() || "";
  let baseReqs = `# ==============================================================================
# Socrates AI Generated Requirements for: ${goal || "AI Project"}
# ==============================================================================
numpy>=1.24.0
scikit-learn>=1.3.0
pandas>=2.0.0
`;

  if (safeGoal.includes("vision") || safeGoal.includes("face") || safeGoal.includes("image") || safeGoal.includes("object")) {
    baseReqs += "pillow>=10.0.0\nopencv-python-headless>=4.8.0\n";
  }

  if (safeGoal.includes("audio") || safeGoal.includes("speech") || safeGoal.includes("voice")) {
    baseReqs += "scipy>=1.11.0\n";
  }

  baseReqs += `matplotlib>=3.7.0
seaborn>=0.12.0
`;
  return baseReqs;
}

/**
 * Builds a valid Jupyter Notebook (v4 format) compatible with Google Colab and JupyterLab
 */
export function generateJupyterNotebook(
  goal: string,
  concepts: Concept[],
  fullAssembledCode: string
): string {
  const safeGoal = goal?.trim() || "Machine Learning Project";

  // Build notebook cells
  const cells: any[] = [];

  // Cell 1: Title & Overview (Markdown)
  cells.push({
    cell_type: "markdown",
    metadata: {},
    source: [
      `# 🏛️ Socrates AI: ${safeGoal}\n`,
      `*A ground-up, end-to-end Machine Learning model built and verified with Socrates AI.*\n\n`,
      `---\n\n`,
      `### 📌 Project Outline\n`,
      `This notebook contains the complete mathematical and code pipeline developed during your tutoring sessions.\n`,
      `Run each cell sequentially (\`Shift + Enter\`) to reproduce the data generation, feature engineering, model training, and live inference.\n`,
    ],
  });

  // Cell 2: Dependencies setup (Code)
  cells.push({
    cell_type: "code",
    execution_count: null,
    metadata: {},
    outputs: [],
    source: [
      `# 1. Install & import necessary machine learning dependencies\n`,
      `!pip install -q scikit-learn numpy pandas matplotlib\n\n`,
      `import math\n`,
      `import sys\n`,
      `from collections import defaultdict\n`,
      `import numpy as np\n`,
      `import pandas as pd\n\n`,
      `print("✅ Environment initialized successfully!")\n`,
    ],
  });

  // Individual Concept Cells
  concepts.forEach((concept, idx) => {
    // Markdown description cell
    cells.push({
      cell_type: "markdown",
      metadata: {},
      source: [
        `### Step ${idx + 1}: ${concept.title}\n`,
        `> **Coding Objective:** ${concept.buildStep || "Implement step logic"}\n\n`,
        concept.corePrinciple
          ? `**Mathematical Principle:**\n\`${concept.corePrinciple}\`\n`
          : "",
      ],
    });

    // Code cell for concept
    const sourceCode = (concept.solutionCode || concept.starterCode || "")
      .replace(/___/g, "None")
      .trim();

    cells.push({
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [sourceCode + "\n"],
    });
  });

  // Final Integration Cell
  cells.push({
    cell_type: "markdown",
    metadata: {},
    source: [
      `## 🚀 Full End-to-End Pipeline Evaluation\n`,
      `Execute the complete assembled pipeline below to test the trained model on test instances:\n`,
    ],
  });

  cells.push({
    cell_type: "code",
    execution_count: null,
    metadata: {},
    outputs: [],
    source: [fullAssembledCode + "\n"],
  });

  const notebookObj = {
    nbformat: 4,
    nbformat_minor: 2,
    metadata: {
      colab: {
        provenance: [],
        name: `${safeGoal.replace(/[^a-zA-Z0-9_-]/g, "_")}.ipynb`,
      },
      language_info: {
        name: "python",
        version: "3.10.12",
      },
      kernelspec: {
        name: "python3",
        display_name: "Python 3",
      },
    },
    cells,
  };

  return JSON.stringify(notebookObj, null, 2);
}

/**
 * Browser download helper
 */
export function triggerBrowserDownload(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1-Click download functions
 */
export function downloadPythonScript(goal: string, code: string) {
  const safeFilename = `${(goal || "model").toLowerCase().replace(/[^a-z0-9]/g, "_")}_pipeline.py`;
  triggerBrowserDownload(code, safeFilename, "text/x-python");
}

export function downloadRequirements(goal: string) {
  const content = generateRequirementsTxt(goal);
  triggerBrowserDownload(content, "requirements.txt", "text/plain");
}

export function downloadNotebook(goal: string, concepts: Concept[], code: string) {
  const content = generateJupyterNotebook(goal, concepts, code);
  const safeFilename = `${(goal || "project").toLowerCase().replace(/[^a-z0-9]/g, "_")}.ipynb`;
  triggerBrowserDownload(content, safeFilename, "application/json");
}
