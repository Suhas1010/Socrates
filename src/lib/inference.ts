import { SPAM_DATASET } from "./templates/spamClassifier";

export interface TokenContribution {
  token: string;
  spamLikelihood: number;
  hamLikelihood: number;
  impact: "spam" | "ham" | "neutral";
  score: number;
}

export interface LivePredictionResult {
  text: string;
  prediction: "spam" | "ham";
  spamConfidence: number;
  hamConfidence: number;
  tokens: string[];
  contributions: TokenContribution[];
  threshold: number;
  isSpamOverThreshold: boolean;
  explanation: string;
}

/**
 * High-performance client-side Bayesian inference engine
 * trained on the bundled dataset for instant live testing
 */
export function classifyLiveMessage(
  text: string,
  threshold: number = 0.65
): LivePredictionResult {
  // 1. Tokenize
  const clean = text.toLowerCase();
  const tokens = clean.match(/\b[a-z0-9]+\b/g) || [];

  // 2. Compute priors from dataset
  const totalMessages = SPAM_DATASET.length;
  const spamCount = SPAM_DATASET.filter((d) => d.label === "spam").length;
  const hamCount = totalMessages - spamCount;
  const pSpam = spamCount / totalMessages;
  const pHam = hamCount / totalMessages;

  // 3. Count frequencies
  const spamFreq: Record<string, number> = {};
  const hamFreq: Record<string, number> = {};
  let totalSpamWords = 0;
  let totalHamWords = 0;
  const vocab = new Set<string>();

  for (const item of SPAM_DATASET) {
    const itemTokens = item.text.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
    for (const t of itemTokens) {
      vocab.add(t);
      if (item.label === "spam") {
        spamFreq[t] = (spamFreq[t] || 0) + 1;
        totalSpamWords++;
      } else {
        hamFreq[t] = (hamFreq[t] || 0) + 1;
        totalHamWords++;
      }
    }
  }

  const vocabSize = Math.max(vocab.size, 1);

  // 4. Calculate log likelihoods with Laplace smoothing
  let logSpam = Math.log(pSpam);
  let logHam = Math.log(pHam);

  const contributions: TokenContribution[] = [];

  for (const t of tokens) {
    const sCount = spamFreq[t] || 0;
    const hCount = hamFreq[t] || 0;

    const pWS = (sCount + 1) / (totalSpamWords + vocabSize);
    const pWH = (hCount + 1) / (totalHamWords + vocabSize);

    logSpam += Math.log(pWS);
    logHam += Math.log(pWH);

    const diff = Math.log(pWS) - Math.log(pWH);
    let impact: "spam" | "ham" | "neutral" = "neutral";
    if (diff > 0.4) impact = "spam";
    else if (diff < -0.4) impact = "ham";

    contributions.push({
      token: t,
      spamLikelihood: pWS,
      hamLikelihood: pWH,
      impact,
      score: Math.round(diff * 100) / 100,
    });
  }

  // Softmax normalization
  const maxLog = Math.max(logSpam, logHam);
  const expSpam = Math.exp(logSpam - maxLog);
  const expHam = Math.exp(logHam - maxLog);
  const spamConfidence = expSpam / (expSpam + expHam);
  const hamConfidence = expHam / (expSpam + expHam);

  const isSpamOverThreshold = spamConfidence >= threshold;
  const prediction = isSpamOverThreshold ? "spam" : "ham";

  const topSpamTokens = contributions
    .filter((c) => c.impact === "spam")
    .map((c) => `"${c.token}" (+${c.score})`)
    .slice(0, 3);

  const topHamTokens = contributions
    .filter((c) => c.impact === "ham")
    .map((c) => `"${c.token}" (${c.score})`)
    .slice(0, 3);

  let explanation = "";
  if (prediction === "spam") {
    explanation = `Flagged as SPAM with ${(spamConfidence * 100).toFixed(1)}% certainty (exceeds ${threshold * 100}% threshold). Strongest triggers: ${topSpamTokens.join(", ") || "suspicious phrase distribution"}.`;
  } else {
    explanation = `Delivered to INBOX as legitimate (HAM). Spam probability is only ${(spamConfidence * 100).toFixed(1)}%. Natural language markers: ${topHamTokens.join(", ") || "standard conversational text"}.`;
  }

  return {
    text,
    prediction,
    spamConfidence,
    hamConfidence,
    tokens,
    contributions,
    threshold,
    isSpamOverThreshold,
    explanation,
  };
}
