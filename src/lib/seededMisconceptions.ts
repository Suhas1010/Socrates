import { ErrorType } from "./types";

export interface SeededMisconception {
  id: string;
  conceptId: string;
  conceptTitle: string;
  questionPrompt: string;
  learnerAnswer: string;
  expectedErrorType: ErrorType;
  expectedRootCauseId?: string;
  notes: string;
}

export const SEEDED_MISCONCEPTIONS: SeededMisconception[] = [
  {
    id: "seed-1",
    conceptId: "evaluating-accuracy",
    conceptTitle: "Confusion Matrix: Precision vs Recall",
    questionPrompt: "Why shouldn't you be satisfied if your spam filter achieves 99.5% accuracy on an imbalanced dataset?",
    learnerAnswer: "A training accuracy of 100% means the model is perfect, so 99.5% must be virtually flawless.",
    expectedErrorType: "OVERCONFIDENT_MISCONCEPTION",
    expectedRootCauseId: "training-vs-testing",
    notes: "Overconfident belief that high raw accuracy guarantees model excellence without checking recall."
  },
  {
    id: "seed-2",
    conceptId: "naive-bayes",
    conceptTitle: "The Naive Bayes Classifier (Log-Space)",
    questionPrompt: "Why is Naive Bayes still used in production even though the independence assumption is mathematically incorrect?",
    learnerAnswer: "Naive Bayes assumes words are independent, so it can't work on real text.",
    expectedErrorType: "OVERCONFIDENT_MISCONCEPTION",
    expectedRootCauseId: "naive-bayes",
    notes: "Dismissive misconception claiming independence violation destroys empirical performance."
  },
  {
    id: "seed-3",
    conceptId: "features-from-text",
    conceptTitle: "Bag-of-Words & Feature Counts",
    questionPrompt: "How does adding more rare vocabulary words affect your classifier?",
    learnerAnswer: "More features always make the model better, so we should keep all 500,000 dictionary words.",
    expectedErrorType: "OVERCONFIDENT_MISCONCEPTION",
    expectedRootCauseId: "features-from-text",
    notes: "Curse of dimensionality / noise overfitting."
  },
  {
    id: "seed-4",
    conceptId: "bayes-rule",
    conceptTitle: "Bayes' Theorem & Likelihood",
    questionPrompt: "If 95% of spam emails contain the word 'free', does seeing 'free' mean the email is 95% likely to be spam?",
    learnerAnswer: "Yes, the probability of spam given the word equals the probability of the word given spam.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "bayes-rule",
    notes: "Classic Prosecutor's Fallacy: confusing P(A|B) with P(B|A)."
  },
  {
    id: "seed-5",
    conceptId: "training-vs-testing",
    conceptTitle: "Generalization & Train/Test Splits",
    questionPrompt: "Can we test our model on the same data it was trained on if our dataset has over 1 million examples?",
    learnerAnswer: "Testing on the training data is fine if the dataset is big enough.",
    expectedErrorType: "OVERCONFIDENT_MISCONCEPTION",
    expectedRootCauseId: "training-vs-testing",
    notes: "Scale does not protect against memorization / overfitting."
  },
  {
    id: "seed-6",
    conceptId: "gradient-descent",
    conceptTitle: "Gradient Descent & Weight Updates",
    questionPrompt: "What role does backpropagation play compared to gradient descent?",
    learnerAnswer: "Backpropagation and gradient descent are the exact same thing; they both just walk downhill.",
    expectedErrorType: "TERMINOLOGY_CONFUSION",
    expectedRootCauseId: "gradient-descent",
    notes: "Swapping the gradient calculation algorithm (backprop) with the optimization step (gradient descent)."
  },
  {
    id: "seed-7",
    conceptId: "probability-basics",
    conceptTitle: "Prior Probabilities & Base Rates",
    questionPrompt: "In an inbox where 1% of emails are spam, a classifier with 90% accuracy flags an email. What's the chance it's spam?",
    learnerAnswer: "Since it's 50/50 whether it's spam or not, the probability is 0.50.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "probability-basics",
    notes: "Base rate neglect: assuming a uniform 50% prior."
  },
  {
    id: "seed-8",
    conceptId: "bayes-rule",
    conceptTitle: "Bayes' Theorem & Likelihood",
    questionPrompt: "What happens if a word has never been seen in the spam training set before?",
    learnerAnswer: "Its probability is 0, so the whole email's spam probability multiplied together collapses to 0.",
    expectedErrorType: "CALCULATION_SLIP",
    expectedRootCauseId: "bayes-rule",
    notes: "Forgetting Laplace smoothing (+1) calculation to prevent zero product."
  },
  {
    id: "seed-9",
    conceptId: "what-is-classification",
    conceptTitle: "Classification & Decision Boundaries",
    questionPrompt: "How do you frame predicting house sale prices in dollars?",
    learnerAnswer: "That is a binary classification problem because the price is either high or low.",
    expectedErrorType: "TERMINOLOGY_CONFUSION",
    expectedRootCauseId: "what-is-classification",
    notes: "Confusing regression on continuous numbers with discrete classification."
  },
  {
    id: "seed-10",
    conceptId: "gradient-descent",
    conceptTitle: "Gradient Descent & Weight Updates",
    questionPrompt: "In the weight update equation w_new = w - lr * grad, which way does the weight move?",
    learnerAnswer: "Gradient descent walks uphill towards the highest loss so the model learns more.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "gradient-descent",
    notes: "Fundamental conceptual error: thinking descent minimizes by climbing."
  },
  {
    id: "seed-11",
    conceptId: "naive-bayes",
    conceptTitle: "The Naive Bayes Classifier (Log-Space)",
    questionPrompt: "Why do we add log probabilities instead of multiplying probabilities?",
    learnerAnswer: "Because log probabilities make negative numbers positive so they look cleaner.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "naive-bayes",
    notes: "Logs of probabilities [0, 1] are actually negative; logs prevent floating point underflow."
  },
  {
    id: "seed-12",
    conceptId: "evaluating-accuracy",
    conceptTitle: "Confusion Matrix: Precision vs Recall",
    questionPrompt: "What is a False Positive in a cancer detection model?",
    learnerAnswer: "A False Positive is when the patient has cancer but the model missed it.",
    expectedErrorType: "TERMINOLOGY_CONFUSION",
    expectedRootCauseId: "evaluating-accuracy",
    notes: "Confusing False Positive (healthy patient flagged) with False Negative (sick patient missed)."
  },
  {
    id: "seed-13",
    conceptId: "improving-the-model",
    conceptTitle: "Threshold Tuning & Production Pipeline",
    questionPrompt: "If we increase the spam threshold from 0.5 to 0.85, what happens to False Positives?",
    learnerAnswer: "False positives will increase because the bar is higher.",
    expectedErrorType: "CALCULATION_SLIP",
    expectedRootCauseId: "improving-the-model",
    notes: "Inverting the threshold logic: higher threshold strictly decreases false positives."
  },
  {
    id: "seed-14",
    conceptId: "pixels-to-vectors",
    conceptTitle: "Pixels to Feature Vectors",
    questionPrompt: "Why do we divide 8-bit image pixels by 255?",
    learnerAnswer: "Because 255 is the number of colors in the universe.",
    expectedErrorType: "TERMINOLOGY_CONFUSION",
    expectedRootCauseId: "pixels-to-vectors",
    notes: "255 is the max uint8 grayscale intensity, used for [0, 1] feature normalization."
  },
  {
    id: "seed-15",
    conceptId: "softmax-probabilities",
    conceptTitle: "Softmax & Multiclass Probabilities",
    questionPrompt: "Can a Softmax output have a negative probability for any class?",
    learnerAnswer: "Yes, if the raw logit is negative like -5.0, the probability is negative.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "softmax-probabilities",
    notes: "Exponential exp(-5) is positive (0.0067); probabilities are strictly >= 0."
  },
  {
    id: "seed-16",
    conceptId: "cross-entropy-loss",
    conceptTitle: "Cross-Entropy Loss",
    questionPrompt: "What happens to cross entropy loss if the model assigns 100% confidence to the correct class?",
    learnerAnswer: "The loss goes to infinity because 100% is the maximum.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "cross-entropy-loss",
    notes: "Loss is -log(1.0) = 0. Perfect prediction gives zero loss."
  },
  {
    id: "seed-17",
    conceptId: "features-from-text",
    conceptTitle: "Bag-of-Words & Feature Counts",
    questionPrompt: "Does Bag-of-Words understand the difference between 'not good' and 'good, not'?",
    learnerAnswer: "Yes, Bag-of-Words parses grammar trees and subject-verb agreements.",
    expectedErrorType: "OVERCONFIDENT_MISCONCEPTION",
    expectedRootCauseId: "features-from-text",
    notes: "Bag-of-Words discards word order and syntax completely."
  },
  {
    id: "seed-18",
    conceptId: "training-vs-testing",
    conceptTitle: "Generalization & Train/Test Splits",
    questionPrompt: "Why shouldn't you tune hyperparameters repeatedly on the test set?",
    learnerAnswer: "It's fine to tune on the test set because test data has real labels.",
    expectedErrorType: "CONCEPTUAL_GAP",
    expectedRootCauseId: "training-vs-testing",
    notes: "Data leakage / test set contamination turns the test set into a second training set."
  },
  {
    id: "seed-19",
    conceptId: "probability-basics",
    conceptTitle: "Prior Probabilities & Base Rates",
    questionPrompt: "If P(Spam) is 0.2, what must P(Ham) be in a binary classification setting?",
    learnerAnswer: "P(Ham) would be 0.4 because ham is less common than spam.",
    expectedErrorType: "CALCULATION_SLIP",
    expectedRootCauseId: "probability-basics",
    notes: "Probabilities over exhaustive mutually exclusive events must sum to 1.0 (P(Ham) = 0.8)."
  },
  {
    id: "seed-20",
    conceptId: "what-is-classification",
    conceptTitle: "Classification & Decision Boundaries",
    questionPrompt: "What is a decision boundary?",
    learnerAnswer: "A decision boundary is a firewall that blocks users from logging in without a password.",
    expectedErrorType: "TERMINOLOGY_CONFUSION",
    expectedRootCauseId: "what-is-classification",
    notes: "Confusing cybersecurity network boundaries with geometrical hypersurfaces separating ML classes."
  }
];
