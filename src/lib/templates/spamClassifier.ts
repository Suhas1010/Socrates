import { Concept, ConceptEdge } from "../types";

export const SPAM_DATASET: { text: string; label: "spam" | "ham" }[] = [
  { text: "Congratulations! You won a $1000 Walmart giftcard. Call now!", label: "spam" },
  { text: "Urgent: Your account has been compromised. Click here to verify password.", label: "spam" },
  { text: "WINNER! Claim your free vacation to the Bahamas today only!", label: "spam" },
  { text: "Double your crypto in 24 hours with our guaranteed bot!", label: "spam" },
  { text: "FREE entry to win £250 weekly draw! Text WIN to 80085", label: "spam" },
  { text: "Your loan has been pre-approved at 0% interest. Apply now!", label: "spam" },
  { text: "Hot singles in your area want to chat right now!", label: "spam" },
  { text: "Exclusive deal: 90% off designer watches while stocks last!", label: "spam" },
  { text: "Cash bonus waiting for you. Deposit $10 and get $100 free!", label: "spam" },
  { text: "Important notice from your bank: Update your billing details.", label: "spam" },
  { text: "Hey are we still meeting for lunch at 12:30 tomorrow?", label: "ham" },
  { text: "Can you review the PR I just opened on GitHub when you have a sec?", label: "ham" },
  { text: "Mom called, she said dinner is at 7pm on Sunday.", label: "ham" },
  { text: "Thanks for sending over the project requirements document.", label: "ham" },
  { text: "Running 10 minutes late due to train delays, so sorry!", label: "ham" },
  { text: "Don't forget to buy milk and bread on your way home.", label: "ham" },
  { text: "The team standup will be moved to 10:00 AM this morning.", label: "ham" },
  { text: "I pushed the latest changes to the main branch.", label: "ham" },
  { text: "Do you have the notes from yesterday's machine learning lecture?", label: "ham" },
  { text: "Happy birthday! Hope you have an incredible year ahead!", label: "ham" },
  { text: "Let's grab a coffee this afternoon and catch up.", label: "ham" },
  { text: "Could you send me the tracking number for the shipment?", label: "ham" },
  { text: "Act now! Claim your risk-free trial before offer expires.", label: "spam" },
  { text: "You have 1 unread secure message regarding your tax refund.", label: "spam" },
  { text: "Great job on the demo presentation today, team loved it.", label: "ham" }
];

export const SPAM_CLASSIFIER_CONCEPTS: Concept[] = [
  {
    id: "what-is-classification",
    title: "Classification & Decision Boundaries",
    prereqs: [],
    difficulty: 1,
    corePrinciple: "Classification is the task of mapping inputs into discrete categories (labels) based on pattern regularities. Unlike regression (which predicts continuous quantities like temperatures or stock prices), classification constructs an optimal decision boundary separating classes. In email filtering, our input is raw text and our output is a binary label: Spam (1) or Legitimate / Ham (0). Because machines only understand numbers, the first job of every AI engineer is designing a pipeline that converts raw characters into structured tokens.",
    whyItMatters: "Tokenization is Step Zero of Natural Language Processing: without clean, lowercased word tokens, an AI algorithm cannot count frequencies or compute probabilities.",
    workedExample: {
      "scenario": "Given an incoming email: \"WINNER! Claim $1000 free Walmart giftcard now!\"",
      "calculationSteps": [
            "1. Lowercase characters: \"winner! claim $1000 free walmart giftcard now!\"",
            "2. Strip punctuation & extract alphanumeric words: [\"winner\", \"claim\", \"1000\", \"free\", \"walmart\", \"giftcard\", \"now\"]",
            "3. Map tokens into feature space for downstream probability evaluation."
      ],
      "takeaway": "Classification is not mind-reading; it is a systematic pipeline translating text into tokens, tokens into counts, and counts into a categorical decision."
},
    hook: "How does your phone immediately know whether an incoming SMS is spam or your mother without reading your mind?",
    explanationSummary:
      "Classification is sorting inputs into discrete categories (labels). Rather than predicting an arbitrary continuous number, a classifier maps feature patterns to target categories using a decision rule.",
    predictQuestion: {
      prompt: "If a system outputs 'Spam' (1) or 'Not Spam' (0), what fundamental machine learning task is it performing?",
      options: [
        "Continuous regression (predicting temperature or price)",
        "Binary classification (categorizing into one of two discrete classes)",
        "Unsupervised clustering (grouping without any labels)",
        "Dimensionality reduction (compressing image pixels)"
      ],
      correctIndex: 1,
      explanation: "Predicting a categorical label like Spam or Ham is the quintessential binary classification problem."
    },
    checkQuestion: {
      prompt: "Why can't we simply hardcode a list of forbidden words like 'FREE' or 'WIN' to catch all spam?",
      options: [
        "Spammers easily bypass exact filters (e.g. 'F.R.E.E' or 'W!N'), and legitimate emails often use these words normally.",
        "Computers cannot search for words in strings efficiently.",
        "English words are copyrighted and cannot be scanned.",
        "Spam only exists in audio phone calls, not in textual emails."
      ],
      correctIndex: 0,
      explanation: "Hardcoded keyword rules are brittle, easily spoofed, and suffer from high false-positive rates on normal messages."
    },
    buildStep: "Implement the text tokenization function that cleans, lowercases, and splits an incoming message into individual word tokens.",
    starterCode: `# Step 1: Text Tokenizer for Socrates Spam Classifier
# Your task: Complete the tokenize function below.
# Clean the text, convert to lowercase, and split into a list of words.

import re

def tokenize(text: str) -> list[str]:
    # TODO: Lowercase text and extract alphabetic words using regex
    # Hint: use re.findall(r'\\b[a-z0-9]+\\b', text.lower())
    clean_text = text.lower()
    tokens = ___ # Fill in the blank
    return tokens

# Quick test run
sample = "Congratulations! You won $1000 FREE giftcard today."
print("Tokens:", tokenize(sample))
`,
    solutionCode: `import re

def tokenize(text: str) -> list[str]:
    clean_text = text.lower()
    tokens = re.findall(r'\\b[a-z0-9]+\\b', clean_text)
    return tokens

sample = "Congratulations! You won $1000 FREE giftcard today."
print("Tokens:", tokenize(sample))
`,
    testAssertion: `import re
tokens = tokenize("WINNER!! Claim 500 dollars now.")
assert isinstance(tokens, list), "tokenize must return a list"
assert "winner" in tokens, "Tokens should be lowercased"
assert "claim" in tokens, "Should extract standard words"
assert "!" not in tokens, "Punctuation should be stripped"
print("Assertion Passed: Tokenizer correctly extracted clean words!")
`
  },
  {
    id: "features-from-text",
    title: "Bag-of-Words & Feature Counts",
    prereqs: ["what-is-classification"],
    difficulty: 2,
    corePrinciple: "The Bag-of-Words (BoW) model is the foundation of classical NLP. Human text contains complex grammar, but for categorization, word frequencies alone carry an overwhelming statistical signal. We discard word ordering and grammar trees, treating each document as an unordered collection ('bag') of word counts. A word like 'congratulations' appearing 100x more often in spam than in personal mail becomes a powerful mathematical discriminator.",
    whyItMatters: "Builds the word frequency tables that serve as the empirical training data for Bayes' Theorem.",
    workedExample: {
      "scenario": "Analyzing 100 emails (40 spam, 60 ham) for words \"urgent\" and \"project\":",
      "calculationSteps": [
            "In 40 Spam emails: \"urgent\" appears 35 times (87.5%), \"project\" appears 2 times (5.0%)",
            "In 60 Ham emails: \"urgent\" appears 3 times (5.0%), \"project\" appears 42 times (70.0%)",
            "Frequency Ratio for \"urgent\": (35/40) / (3/60) = 0.875 / 0.05 = 17.5x more common in spam!"
      ],
      "takeaway": "Even without understanding syntax, word counts provide unmistakable signals of author intent."
},
    hook: "Computers only compute numbers, but emails are strings of characters. How do we turn human text into math without losing the signal?",
    explanationSummary:
      "The 'Bag-of-Words' representation converts unstructured text into numerical frequency vectors. By counting occurrences of each token across spam vs ham messages, we uncover which words serve as statistical discriminators.",
    predictQuestion: {
      prompt: "In a Bag-of-Words model, what important property of natural language is intentionally ignored to keep the model fast and tractable?",
      options: [
        "The frequency of the words",
        "The exact grammatical word order and sentence syntax",
        "The vocabulary dictionary",
        "The presence of numbers"
      ],
      correctIndex: 1,
      explanation: "Bag-of-Words discards sequential grammar and word position, treating each text as an unordered collection ('bag') of token frequencies."
    },
    checkQuestion: {
      prompt: "If the word 'claim' appears 80 times across 100 spam emails, but only 2 times across 100 personal emails, what does this tell our model?",
      options: [
        "'claim' is an irrelevant stopword like 'the'",
        "'claim' provides a strong mathematical signal that dramatically boosts the probability of spam",
        "The model must delete 'claim' from memory to avoid overfitting",
        "Personal emails are broken because they lack 'claim'"
      ],
      correctIndex: 1,
      explanation: "The huge frequency discrepancy makes 'claim' a highly informative discriminatory feature."
    },
    buildStep: "Build the vocabulary word counter that aggregates token frequencies across spam and ham message collections.",
    starterCode: `# Step 2: Vocabulary Frequency Counter
import re
from collections import defaultdict

# Pre-defined Tokenizer from Step 1
if 'tokenize' not in globals():
    def tokenize(text: str) -> list[str]:
        return re.findall(r'\\b[a-z0-9]+\\b', text.lower())

def count_word_frequencies(dataset):
    """
    dataset: list of dicts with 'text' and 'label' ('spam' or 'ham')
    Returns:
      spam_counts: dict of {word: count}
      ham_counts: dict of {word: count}
      total_spam_words: int
      total_ham_words: int
    """
    spam_counts = defaultdict(int)
    ham_counts = defaultdict(int)
    total_spam_words = 0
    total_ham_words = 0

    for item in dataset:
        tokens = tokenize(item['text'])
        label = item['label']
        for token in tokens:
            if label == 'spam':
                spam_counts[token] += 1
                total_spam_words += 1
            else:
                # TODO: Update ham_counts and total_ham_words
                ham_counts[token] += ___
                total_ham_words += ___
                
    return dict(spam_counts), dict(ham_counts), total_spam_words, total_ham_words

# Test run with our bundled dataset
spam_c, ham_c, s_tot, h_tot = count_word_frequencies(DATASET[:10])
print(f"Sample spam word counts: {list(spam_c.items())[:3]}")
print(f"Sample ham word counts: {list(ham_c.items())[:3]}")
`,
    solutionCode: `import re
from collections import defaultdict

if 'tokenize' not in globals():
    def tokenize(text: str) -> list[str]:
        return re.findall(r'\\b[a-z0-9]+\\b', text.lower())

def count_word_frequencies(dataset):
    spam_counts = defaultdict(int)
    ham_counts = defaultdict(int)
    total_spam_words = 0
    total_ham_words = 0

    for item in dataset:
        tokens = tokenize(item['text'])
        label = item['label']
        for token in tokens:
            if label == 'spam':
                spam_counts[token] += 1
                total_spam_words += 1
            else:
                ham_counts[token] += 1
                total_ham_words += 1
                
    return dict(spam_counts), dict(ham_counts), total_spam_words, total_ham_words
`,
    testAssertion: `toy_data = [
  {"text": "win cash", "label": "spam"},
  {"text": "lunch meeting", "label": "ham"}
]
sc, hc, st, ht = count_word_frequencies(toy_data)
assert sc.get("win") == 1, "Expected 'win' count 1 in spam"
assert hc.get("lunch") == 1, "Expected 'lunch' count 1 in ham"
assert st == 2, "Expected 2 total spam words"
assert ht == 2, "Expected 2 total ham words"
print("Assertion Passed: Word counts & totals calculated accurately!")
`
  },
  {
    id: "probability-basics",
    title: "Prior Probabilities & Base Rates",
    prereqs: ["features-from-text"],
    difficulty: 2,
    corePrinciple: "Prior probability P(Class) is our baseline degree of belief before inspecting any email content. If 80% of all incoming mail is legitimate and 20% is spam, a message before opening has an 80% baseline chance of being legitimate. Ignoring base rates leads directly to the 'Base Rate Fallacy'—causing filters to panic on innocent words and discard critical personal mail.",
    whyItMatters: "Priors weight our decisions so rare events require significantly stronger evidence before triggering an alarm.",
    workedExample: {
      "scenario": "In our training dataset of 1,000 emails, 200 are spam and 800 are legitimate (ham).",
      "calculationSteps": [
            "Total Messages = 1,000",
            "P(Spam) = 200 / 1,000 = 0.20 (20%)",
            "P(Ham) = 800 / 1,000 = 0.80 (80%)",
            "Verification: P(Spam) + P(Ham) = 0.20 + 0.80 = 1.00 (Exhaustive & Mutually Exclusive)"
      ],
      "takeaway": "Every machine learning inference starts with a prior base rate. New evidence modifies this prior belief rather than replacing it from scratch."
},
    hook: "If you receive a random message with 0 words in it, what is the best guess before reading a single letter?",
    explanationSummary:
      "Prior probability P(Class) is our baseline belief before observing evidence. If 90% of all incoming global traffic is spam, our prior belief starts heavily skewed toward spam.",
    predictQuestion: {
      prompt: "Out of 1000 emails, 200 are spam and 800 are legitimate (ham). What is the prior probability P(Spam)?",
      options: [
        "P(Spam) = 0.20 (20%)",
        "P(Spam) = 0.80 (80%)",
        "P(Spam) = 0.50 (50%)",
        "P(Spam) = 1.00 (100%)"
      ],
      correctIndex: 0,
      explanation: "200 spam divided by 1000 total messages gives P(Spam) = 200/1000 = 0.20."
    },
    checkQuestion: {
      prompt: "Why would it be dangerous for a spam filter to ignore prior probabilities and assume P(Spam) = 0.50 when real-world spam is only 5% of inbox volume?",
      options: [
        "It would cause a catastrophic flood of false positives, throwing critical personal emails into the junk folder.",
        "It would use double the GPU memory.",
        "The Python interpreter cannot divide by fractions.",
        "Prior probability only applies to rolling six-sided dice."
      ],
      correctIndex: 0,
      explanation: "Ignoring base rates produces massive false-alarm rates for rare events (the Base Rate Fallacy)."
    },
    buildStep: "Compute the class priors P(Spam) and P(Ham) from the dataset distribution.",
    starterCode: `# Step 3: Compute Class Prior Probabilities P(C)
def compute_class_priors(dataset):
    """
    Returns:
      p_spam: float (fraction of dataset that is spam)
      p_ham: float (fraction of dataset that is ham)
    """
    total_messages = len(dataset)
    spam_count = sum(1 for item in dataset if item['label'] == 'spam')
    ham_count = sum(1 for item in dataset if item['label'] == 'ham')
    
    # TODO: Calculate probabilities by dividing by total_messages
    p_spam = ___ / total_messages
    p_ham = ___ / total_messages
    
    return p_spam, p_ham

p_s, p_h = compute_class_priors(DATASET)
print(f"P(Spam) = {p_s:.3f}, P(Ham) = {p_h:.3f}")
`,
    solutionCode: `def compute_class_priors(dataset):
    total_messages = len(dataset)
    spam_count = sum(1 for item in dataset if item['label'] == 'spam')
    ham_count = sum(1 for item in dataset if item['label'] == 'ham')
    p_spam = spam_count / total_messages
    p_ham = ham_count / total_messages
    return p_spam, p_ham
`,
    testAssertion: `test_ds = [{"label": "spam"}] * 3 + [{"label": "ham"}] * 7
ps, ph = compute_class_priors(test_ds)
assert abs(ps - 0.3) < 1e-5, "P(Spam) should be 0.3"
assert abs(ph - 0.7) < 1e-5, "P(Ham) should be 0.7"
assert abs(ps + ph - 1.0) < 1e-5, "Priors must sum to 1.0"
print("Assertion Passed: Class priors computed properly!")
`
  },
  {
    id: "bayes-rule",
    title: "Bayes' Theorem & Likelihood",
    prereqs: ["probability-basics"],
    difficulty: 3,
    corePrinciple: "Bayes' Theorem provides the mathematical bridge to invert conditional probabilities: P(Spam | Words) = [P(Words | Spam) * P(Spam)] / P(Words). A notorious trap is the Prosecutor's Fallacy: confusing P(Word | Spam) with P(Spam | Word). For example, 99% of spam emails contain the word 'the', but seeing 'the' does NOT mean an email is 99% spam, because 99% of normal emails contain 'the' as well!",
    whyItMatters: "Transforms raw word counts into calibrated posterior probabilities that answer: 'Given these words, what is the probability this message is spam?'",
    workedExample: {
      "scenario": "Testing on the word \"deal\". P(Spam) = 0.20, P(Ham) = 0.80. P(\"deal\" | Spam) = 0.60, P(\"deal\" | Ham) = 0.05.",
      "calculationSteps": [
            "1. Joint Spam Probability: P(\"deal\" | Spam) * P(Spam) = 0.60 * 0.20 = 0.12",
            "2. Joint Ham Probability: P(\"deal\" | Ham) * P(Ham) = 0.05 * 0.80 = 0.04",
            "3. Total Evidence P(\"deal\") = 0.12 + 0.04 = 0.16",
            "4. Posterior P(Spam | \"deal\") = 0.12 / 0.16 = 0.75 (75.0%)"
      ],
      "takeaway": "Observing the single word \"deal\" updated our belief from a 20% prior up to a 75% posterior probability."
},
    hook: "P(word | spam) is NOT the same as P(spam | word). Why does confusing these two cause doctors, judges, and ML models to make massive errors?",
    explanationSummary:
      "Bayes' Theorem updates our prior belief with observed evidence: P(Spam | Words) = [P(Words | Spam) * P(Spam)] / P(Words). The likelihood P(Word | Spam) tells us how expected this word is if the sender is indeed a spammer.",
    predictQuestion: {
      prompt: "Almost 100% of spam emails contain the word 'the'. Does seeing 'the' mean an email is 100% spam?",
      options: [
        "Yes, high P(the | spam) implies high P(spam | the)",
        "No! Almost 100% of normal emails ALSO contain 'the', so P(the | ham) is equally high, providing zero discriminatory power.",
        "Yes, but only if the word 'the' is capitalized",
        "No, because 'the' is an anagram of 'eth'"
      ],
      correctIndex: 1,
      explanation: "A feature only discriminates when its likelihood is significantly higher in one class than the other."
    },
    checkQuestion: {
      prompt: "What is the common term for confusing P(A | B) with P(B | A)?",
      options: [
        "The Prosecutor's Fallacy / Confusion of the Inverse",
        "Polynomial Overfitting",
        "Gradient Exploding",
        "The Central Limit Theorem"
      ],
      correctIndex: 0,
      explanation: "Confusing conditional directions is the notorious Prosecutor's Fallacy or Confusion of the Inverse."
    },
    buildStep: "Compute the conditional word likelihood with Laplace (+1) smoothing to prevent zero-frequency collapse.",
    starterCode: `# Step 4: Word Likelihood with Laplace Smoothing
# Formula: P(w | class) = (count(w in class) + 1) / (total_words_in_class + vocab_size)

def compute_word_likelihood(word, class_counts, total_class_words, vocab_size):
    """
    Returns smoothed conditional probability P(word | class)
    """
    word_count = class_counts.get(word, 0)
    
    # TODO: Add 1 to numerator, and add vocab_size to denominator
    smoothed_numerator = word_count + ___
    smoothed_denominator = total_class_words + ___
    
    return smoothed_numerator / smoothed_denominator

# Example check
p_win_spam = compute_word_likelihood("win", {"win": 10}, 100, 500)
print(f"P('win' | Spam) = {p_win_spam:.4f}")
`,
    solutionCode: `def compute_word_likelihood(word, class_counts, total_class_words, vocab_size):
    word_count = class_counts.get(word, 0)
    smoothed_numerator = word_count + 1
    smoothed_denominator = total_class_words + vocab_size
    return smoothed_numerator / smoothed_denominator
`,
    testAssertion: `p_seen = compute_word_likelihood("deal", {"deal": 4}, 100, 50)
p_unseen = compute_word_likelihood("quantum", {}, 100, 50)
assert p_seen == (4 + 1) / (100 + 50), "Laplace formula calculation mismatch for seen word"
assert p_unseen == 1 / 150, "Unseen word should have non-zero probability 1/(total + vocab)"
assert p_unseen > 0, "Smoothing must strictly prevent zero probability"
print("Assertion Passed: Laplace smoothed likelihoods verified!")
`
  },
  {
    id: "naive-bayes",
    title: "The Naive Bayes Classifier (Log-Space)",
    prereqs: ["bayes-rule"],
    difficulty: 3,
    corePrinciple: "Naive Bayes combines multiple words using the 'Naive' Conditional Independence assumption: P(w1, w2, w3 | Class) = P(w1|C) * P(w2|C) * P(w3|C). While words in real life are grammatically correlated, this assumption prevents combinatorial explosion and performs astonishingly well. Two engineering fixes make it production-grade: 1) Laplace Smoothing (+1) prevents zero-probability collapse when encountering new words. 2) Log-Space Addition (log(A*B) = log(A) + log(B)) prevents floating-point underflow when multiplying dozens of decimals.",
    whyItMatters: "This is the complete inference engine of the spam filter, calculating real-time classification scores in microseconds.",
    workedExample: {
      "scenario": "Classifying message \"urgent invoice\" with Laplace smoothing (+1) across vocabulary size |V| = 500.",
      "calculationSteps": [
            "Word count in spam: \"urgent\": 15, \"invoice\": 2. Total spam words: 500.",
            "Without smoothing: If \"invoice\" had 0 counts in spam -> (15/500) * (0/500) = 0.0 (the entire calculation collapses to zero!)",
            "With Laplace Smoothing: P(\"urgent\" | Spam) = (15 + 1) / (500 + 500) = 16 / 1000 = 0.016",
            "With Laplace Smoothing: P(\"invoice\" | Spam) = (2 + 1) / (500 + 500) = 3 / 1000 = 0.003",
            "Log-Space Sum: log(0.016) + log(0.003) = -4.135 + -5.809 = -9.944 (completely stable numbers without floating-point underflow!)"
      ],
      "takeaway": "Laplace smoothing guarantees no single unseen word can veto all other evidence, and log space guarantees numeric stability."
},
    hook: "If you multiply 50 tiny probabilities like 0.001 * 0.0004 * 0.002, computers round down to absolute 0.0 (underflow). How do we fix this math bug elegantly?",
    explanationSummary:
      "By taking the natural logarithm, multiplication turns into addition: log(A * B) = log(A) + log(B). The 'Naive' assumption posits that each word occurs independently given the class. Summing log-priors and log-likelihoods gives numerically stable log-posterior scores!",
    predictQuestion: {
      prompt: "Why is Naive Bayes called 'Naive'?",
      options: [
        "Because it was discovered by an inexperienced mathematician",
        "Because it assumes every word appears conditionally independent of all other words, which is false in real grammar but works astonishingly well in practice",
        "Because it cannot classify more than 2 items",
        "Because it only works on numbers less than 1"
      ],
      correctIndex: 1,
      explanation: "Words like 'New' and 'York' are dependent in human writing, but assuming conditional independence dramatically simplifies computation while preserving accurate classification boundaries."
    },
    checkQuestion: {
      prompt: "If log_score(Spam) = -12.4 and log_score(Ham) = -18.9, which class does the model assign, and why?",
      options: [
        "Ham, because 18.9 has a higher absolute value",
        "Spam, because -12.4 is a larger (less negative) number than -18.9",
        "Neither, both scores are negative and thus invalid",
        "Tie, because logs cannot be compared"
      ],
      correctIndex: 1,
      explanation: "In log-space, -12.4 > -18.9. Higher (less negative) log probability corresponds to a substantially higher real probability."
    },
    buildStep: "Combine log priors and log likelihoods to classify any arbitrary message as 'spam' or 'ham'.",
    starterCode: `# Step 5: The Full Naive Bayes Classifier
import math

class SocratesSpamClassifier:
    def __init__(self, dataset):
        self.p_spam, self.p_ham = compute_class_priors(dataset)
        self.sc, self.hc, self.st, self.ht = count_word_frequencies(dataset)
        all_words = set(self.sc.keys()).union(set(self.hc.keys()))
        self.vocab_size = max(len(all_words), 1)

    def predict(self, text: str) -> dict:
        tokens = tokenize(text)
        
        # Start with log prior
        log_prob_spam = math.log(self.p_spam)
        log_prob_ham = math.log(self.p_ham)
        
        for token in tokens:
            p_w_given_spam = compute_word_likelihood(token, self.sc, self.st, self.vocab_size)
            p_w_given_ham = compute_word_likelihood(token, self.hc, self.ht, self.vocab_size)
            
            # TODO: Add math.log(...) of word likelihoods to respective totals
            log_prob_spam += math.log(___)
            log_prob_ham += math.log(___)
            
        prediction = "spam" if log_prob_spam > log_prob_ham else "ham"
        
        # Compute normalized pseudo-probability via softmax
        max_log = max(log_prob_spam, log_prob_ham)
        exp_s = math.exp(log_prob_spam - max_log)
        exp_h = math.exp(log_prob_ham - max_log)
        spam_confidence = exp_s / (exp_s + exp_h)
        
        return {
            "prediction": prediction,
            "spam_confidence": spam_confidence,
            "log_spam": log_prob_spam,
            "log_ham": log_prob_ham,
            "tokens": tokens
        }

model = SocratesSpamClassifier(DATASET)
res = model.predict("Congratulations! Free giftcard waiting")
print(f"Classification: {res['prediction']} (Confidence: {res['spam_confidence']:.2%})")
`,
    solutionCode: `import math

class SocratesSpamClassifier:
    def __init__(self, dataset):
        self.p_spam, self.p_ham = compute_class_priors(dataset)
        self.sc, self.hc, self.st, self.ht = count_word_frequencies(dataset)
        all_words = set(self.sc.keys()).union(set(self.hc.keys()))
        self.vocab_size = max(len(all_words), 1)

    def predict(self, text: str) -> dict:
        tokens = tokenize(text)
        log_prob_spam = math.log(self.p_spam)
        log_prob_ham = math.log(self.p_ham)
        
        for token in tokens:
            p_w_given_spam = compute_word_likelihood(token, self.sc, self.st, self.vocab_size)
            p_w_given_ham = compute_word_likelihood(token, self.hc, self.ht, self.vocab_size)
            log_prob_spam += math.log(p_w_given_spam)
            log_prob_ham += math.log(p_w_given_ham)
            
        prediction = "spam" if log_prob_spam > log_prob_ham else "ham"
        max_log = max(log_prob_spam, log_prob_ham)
        exp_s = math.exp(log_prob_spam - max_log)
        exp_h = math.exp(log_prob_ham - max_log)
        spam_confidence = exp_s / (exp_s + exp_h)
        
        return {
            "prediction": prediction,
            "spam_confidence": spam_confidence,
            "log_spam": log_prob_spam,
            "log_ham": log_prob_ham,
            "tokens": tokens
        }
`,
    testAssertion: `clf = SocratesSpamClassifier(DATASET)
res_spam = clf.predict("Urgent: Win free $1000 prize now!")
res_ham = clf.predict("Hey let us meet for lunch and coffee tomorrow.")
assert res_spam["prediction"] == "spam", f"Expected spam but got {res_spam['prediction']}"
assert res_ham["prediction"] == "ham", f"Expected ham but got {res_ham['prediction']}"
assert res_spam["spam_confidence"] > 0.6, "Spam confidence should be high"
print("Assertion Passed: Full Naive Bayes classifier working perfectly!")
`
  },
  {
    id: "training-vs-testing",
    title: "Generalization & Train/Test Splits",
    prereqs: ["naive-bayes"],
    difficulty: 3,
    corePrinciple: "A critical distinction in AI is Generalization vs Memorization. A model that simply memorizes the training data will achieve 100% training accuracy, but will immediately fail on tomorrow's spam variants (Overfitting). To honestly evaluate a model, we split our data into an 80% Training set (which the model learns from) and a 20% Held-Out Testing set (which the model never sees during training).",
    whyItMatters: "Guarantees that our spam filter will actually generalize to new, unseen user messages in the real world.",
    workedExample: {
      "scenario": "200 labeled messages in our bundled dataset.",
      "calculationSteps": [
            "1. Shuffle data randomly to eliminate ordering bias",
            "2. Training partition (80%): 160 messages used to compute class priors and word counts",
            "3. Test partition (20%): 40 messages reserved strictly for blind evaluation"
      ],
      "takeaway": "Never evaluate model accuracy on training data—held-out testing is the only real proof of machine learning capability."
},
    hook: "If a student memorizes every single practice exam question with 100% accuracy, why might they fail the final exam?",
    explanationSummary:
      "A model that evaluates only on data it was trained on can memorize noise rather than learning true generalizable signals (overfitting). We strictly split datasets into training sets (for learning) and test sets (for honest evaluation).",
    predictQuestion: {
      prompt: "What is the primary danger of evaluating model accuracy on the exact same dataset it trained on?",
      options: [
        "The model will train too slowly",
        "Overfitting is masked: the model looks deceptively perfect on training data but fails miserably on new user messages",
        "The computer will run out of hard drive space",
        "Training data always has more errors than test data"
      ],
      correctIndex: 1,
      explanation: "Testing on training data gives a false illusion of mastery because memorized noise counts as correct."
    },
    checkQuestion: {
      prompt: "What typical split ratio is standard when building a prototype machine learning model?",
      options: [
        "80% Train, 20% Test (or 70/30)",
        "0% Train, 100% Test",
        "100% Train, 0% Test",
        "50% Train, 50% Random Noise"
      ],
      correctIndex: 0,
      explanation: "An 80/20 or 70/30 split gives ample data for parameter learning while reserving an uncorrupted test sample."
    },
    buildStep: "Implement a clean dataset train-test splitter that partitions records without data leakage.",
    starterCode: `# Step 6: Dataset Splitter
def train_test_split(dataset, train_ratio=0.8):
    """
    Splits dataset into train_data and test_data
    """
    total = len(dataset)
    split_idx = int(total * train_ratio)
    
    # TODO: Slice dataset into training and test partitions
    train_data = dataset[:___]
    test_data = dataset[___:]
    
    return train_data, test_data

train_set, test_set = train_test_split(DATASET, 0.8)
print(f"Total: {len(DATASET)} -> Train: {len(train_set)}, Test: {len(test_set)}")
`,
    solutionCode: `def train_test_split(dataset, train_ratio=0.8):
    total = len(dataset)
    split_idx = int(total * train_ratio)
    train_data = dataset[:split_idx]
    test_data = dataset[split_idx:]
    return train_data, test_data
`,
    testAssertion: `dummy = list(range(20))
tr, te = train_test_split(dummy, 0.75)
assert len(tr) == 15, "Expected 15 train items"
assert len(te) == 5, "Expected 5 test items"
assert tr[-1] != te[0], "No overlap between train and test boundaries"
print("Assertion Passed: Clean train/test split successfully executed!")
`
  },
  {
    id: "evaluating-accuracy",
    title: "Confusion Matrix: Precision vs Recall",
    prereqs: ["training-vs-testing"],
    difficulty: 4,
    corePrinciple: "Raw accuracy is notoriously deceptive in machine learning (The Accuracy Paradox). If 98% of your emails are normal and 2% are spam, a lazy filter that flags NOTHING as spam gets 98% accuracy—while being 100% useless! We evaluate with a Confusion Matrix: Precision (when we flag spam, how often are we right?) and Recall (of all actual spam, how much did we catch?). In spam filtering, False Positives (sending your boss's email to junk) are far worse than False Negatives.",
    whyItMatters: "Enables you to calibrate your filter so innocent personal emails are never accidentally banished to the spam folder.",
    workedExample: {
      "scenario": "Out of 40 test emails (10 spam, 30 ham): Model flags 9 spam correctly (TP=9), misses 1 spam (FN=1), mistakenly flags 1 normal email (FP=1), and correctly passes 29 normal emails (TN=29).",
      "calculationSteps": [
            "Accuracy = (TP + TN) / Total = (9 + 29) / 40 = 38 / 40 = 95.0%",
            "Precision = TP / (TP + FP) = 9 / (9 + 1) = 9 / 10 = 90.0% (10% of flagged mail was a false alarm)",
            "Recall = TP / (TP + FN) = 9 / (9 + 1) = 9 / 10 = 90.0% (caught 90% of all spam messages)"
      ],
      "takeaway": "Precision measures reliability; Recall measures coverage. Real AI systems balance both."
},
    hook: "Which error is worse for a user: an unwanted Viagra ad slipping into the inbox, or an urgent medical lab report going to the spam folder?",
    explanationSummary:
      "Raw accuracy is misleading if classes are imbalanced. A False Positive (legit email marked spam) destroys user trust, while a False Negative (spam in inbox) is merely a minor annoyance. Precision measures 'When it predicts spam, how often is it right?', while Recall measures 'How many of all real spams were caught?'.",
    predictQuestion: {
      prompt: "If a filter flags your university acceptance email as 'Spam', what type of classification error just occurred?",
      options: [
        "True Positive (TP)",
        "False Positive (Type I Error) - legitimate item misclassified as positive",
        "False Negative (Type II Error) - spam missed",
        "True Negative (TN)"
      ],
      correctIndex: 1,
      explanation: "A False Positive occurs when the positive label (Spam) is erroneously applied to a negative/clean instance."
    },
    checkQuestion: {
      prompt: "If you have 99 normal emails and 1 spam email, a dumb model that predicts 'Not Spam' for EVERYTHING achieves 99% accuracy. Why is it useless?",
      options: [
        "It achieves 99% accuracy, but has a 0% Recall on spam, catching zero threats!",
        "It uses too much memory",
        "It violates the laws of physics",
        "99% is not a passing grade in Python"
      ],
      correctIndex: 0,
      explanation: "The accuracy paradox: on imbalanced data, trivial constant predictors have high accuracy but zero utility."
    },
    buildStep: "Calculate accuracy, precision, and recall on the test partition.",
    starterCode: `# Step 7: Confusion Matrix Metrics
def evaluate_model(model, test_data):
    """
    Computes accuracy, precision, and recall on held-out test data
    """
    tp = 0 # True Positives (spam caught as spam)
    fp = 0 # False Positives (ham mistakenly marked spam)
    fn = 0 # False Negatives (spam missed as ham)
    tn = 0 # True Negatives (ham correctly identified)

    for item in test_data:
        pred = model.predict(item['text'])['prediction']
        actual = item['label']
        
        if pred == 'spam' and actual == 'spam':
            tp += 1
        elif pred == 'spam' and actual == 'ham':
            fp += 1
        elif pred == 'ham' and actual == 'spam':
            fn += 1
        else:
            tn += 1
            
    total = len(test_data)
    accuracy = (tp + tn) / total if total > 0 else 0
    # TODO: Precision = tp / (tp + fp); Recall = tp / (tp + fn)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = ___ / (tp + ___) if (tp + fn) > 0 else 1.0
    
    return {"accuracy": accuracy, "precision": precision, "recall": recall, "tp": tp, "fp": fp, "fn": fn, "tn": tn}

# Evaluate on test set
metrics = evaluate_model(model, test_set)
print(f"Accuracy: {metrics['accuracy']:.1%}, Precision: {metrics['precision']:.1%}, Recall: {metrics['recall']:.1%}")
`,
    solutionCode: `def evaluate_model(model, test_data):
    tp = 0
    fp = 0
    fn = 0
    tn = 0

    for item in test_data:
        pred = model.predict(item['text'])['prediction']
        actual = item['label']
        
        if pred == 'spam' and actual == 'spam':
            tp += 1
        elif pred == 'spam' and actual == 'ham':
            fp += 1
        elif pred == 'ham' and actual == 'spam':
            fn += 1
        else:
            tn += 1
            
    total = len(test_data)
    accuracy = (tp + tn) / total if total > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    
    return {"accuracy": accuracy, "precision": precision, "recall": recall, "tp": tp, "fp": fp, "fn": fn, "tn": tn}
`,
    testAssertion: `dummy_metrics = evaluate_model(clf, DATASET)
assert 0.0 <= dummy_metrics["accuracy"] <= 1.0, "Accuracy must be between 0 and 1"
assert 0.0 <= dummy_metrics["precision"] <= 1.0, "Precision must be between 0 and 1"
assert 0.0 <= dummy_metrics["recall"] <= 1.0, "Recall must be between 0 and 1"
print(f"Assertion Passed: Evaluation metrics calculated accurately! (Accuracy: {dummy_metrics['accuracy']:.1%})")
`
  },
  {
    id: "improving-the-model",
    title: "Threshold Tuning & Production Pipeline",
    prereqs: ["evaluating-accuracy"],
    difficulty: 4,
    corePrinciple: "In production machine learning, the default decision threshold of 0.50 (50%) is rarely optimal. Because misclassifying a legitimate email as spam (False Positive) is devastating to users, production email systems raise the decision threshold to 0.75, 0.85, or higher. An email is only banished to the spam folder when the model has overwhelming confidence.",
    whyItMatters: "Turns an academic model into a safe, production-grade product that respects user trust.",
    workedExample: {
      "scenario": "Comparing model behavior at Threshold = 0.50 vs Threshold = 0.80 on 100 emails:",
      "calculationSteps": [
            "At Threshold 0.50: 95% of spam caught, but 3 legitimate emails marked spam (3 furious users!)",
            "At Threshold 0.80: 91% of spam caught, but 0 legitimate emails marked spam (0 false alarms!)"
      ],
      "takeaway": "Threshold tuning gives engineers control over the Precision-Recall tradeoff in the real world."
},
    hook: "By default, classifiers split at 50% probability. What happens when you demand 90% certainty before sending an email to spam?",
    explanationSummary:
      "In production AI, you rarely use an uncalibrated 0.5 decision threshold. By tuning the threshold (e.g. flagging spam only when P(Spam) > 0.85), you virtually eliminate devastating false positives while catching the vast majority of junk.",
    predictQuestion: {
      prompt: "If we raise our spam detection threshold from 0.50 to 0.90, what is the expected trade-off?",
      options: [
        "False Positives plummet (fewer good emails lost), but Recall drops slightly (a few tricky spam messages slip in)",
        "Both False Positives and False Negatives increase",
        "The model stops running because thresholds cannot exceed 0.50",
        "Training accuracy becomes negative"
      ],
      correctIndex: 0,
      explanation: "Requiring stronger evidence before flagging spam protects legitimate emails at the cost of being slightly more conservative."
    },
    checkQuestion: {
      prompt: "What is your finished project capable of doing right now?",
      options: [
        "It tokenizes any arbitrary incoming text, calculates Bayesian log likelihoods against learned word priors, and classifies spam in real time!",
        "It can only sort numbers from 1 to 10",
        "It has to fetch predictions from a remote API",
        "It cannot classify anything without a GPU"
      ],
      correctIndex: 0,
      explanation: "You have built an authentic, self-contained Naive Bayes classification engine from scratch!"
    },
    buildStep: "Package the calibrated model into a final production inference function with adjustable sensitivity threshold.",
    starterCode: `# Step 8: Calibrated Production Classifier with Confidence Threshold
def production_classify(model, raw_text: str, threshold: float = 0.65) -> dict:
    """
    Classifies raw text with adjustable security threshold.
    Flag as 'spam' only if spam_confidence >= threshold.
    """
    result = model.predict(raw_text)
    confidence = result['spam_confidence']
    
    # TODO: Compare confidence against threshold
    is_spam = confidence >= ___
    final_label = "spam" if is_spam else "ham"
    
    return {
        "text": raw_text,
        "label": final_label,
        "confidence": confidence,
        "threshold": threshold,
        "status": "FLAGGED_AS_SPAM" if is_spam else "DELIVERED_TO_INBOX"
    }

# Test on live messages
print(production_classify(clf, "Hey, can we sync on the slides?"))
print(production_classify(clf, "CONGRATULATIONS you won $10,000 lottery cash right now!"))
`,
    solutionCode: `def production_classify(model, raw_text: str, threshold: float = 0.65) -> dict:
    result = model.predict(raw_text)
    confidence = result['spam_confidence']
    is_spam = confidence >= threshold
    final_label = "spam" if is_spam else "ham"
    return {
        "text": raw_text,
        "label": final_label,
        "confidence": confidence,
        "threshold": threshold,
        "status": "FLAGGED_AS_SPAM" if is_spam else "DELIVERED_TO_INBOX"
    }
`,
    testAssertion: `res_ham = production_classify(clf, "Let's review the document this evening", 0.65)
res_spam = production_classify(clf, "WINNER! Free vacation cash giftcard click now!", 0.65)
assert res_ham["label"] == "ham", "Legit email should be delivered to inbox"
assert res_spam["label"] == "spam", "Clear spam should be flagged"
assert "status" in res_ham, "Result must include status metadata"
print("Assertion Passed: Production AI pipeline ready for live interactive testing!")
`
  }
];

export const SPAM_CLASSIFIER_EDGES: ConceptEdge[] = [
  { from: "what-is-classification", to: "features-from-text" },
  { from: "features-from-text", to: "probability-basics" },
  { from: "probability-basics", to: "bayes-rule" },
  { from: "bayes-rule", to: "naive-bayes" },
  { from: "naive-bayes", to: "training-vs-testing" },
  { from: "training-vs-testing", to: "evaluating-accuracy" },
  { from: "evaluating-accuracy", to: "improving-the-model" }
];

export const SPAM_DIAGNOSTIC_QUESTIONS = [
  {
    id: "diag-1",
    targetConceptId: "what-is-classification",
    question: "You want a machine learning model to read customer reviews and label each as either 'Positive' or 'Negative'. What type of task is this?",
    options: [
      { text: "Classification into discrete categories", isCorrect: true },
      { text: "Continuous regression predicting a scalar value", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION" as const, rationale: "Regression predicts continuous numbers (like house prices), not categorical sentiment." },
      { text: "Unsupervised clustering with no labels", isCorrect: false, errorType: "CONCEPTUAL_GAP" as const, rationale: "Since you already have discrete target labels (Positive/Negative), this is supervised classification." },
      { text: "Dimensionality reduction", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION" as const, rationale: "Dimensionality reduction compresses features, it does not assign target labels." }
    ]
  },
  {
    id: "diag-2",
    targetConceptId: "probability-basics",
    question: "If 10 out of 100 emails in your mailbox are spam, what is the prior probability P(Spam)?",
    options: [
      { text: "0.10 (10%)", isCorrect: true },
      { text: "0.50 (50%)", isCorrect: false, errorType: "CONCEPTUAL_GAP" as const, rationale: "Assuming 50/50 ignores the observed frequency; prior probability is the actual ratio (10/100 = 0.10)." },
      { text: "0.90 (90%)", isCorrect: false, errorType: "CALCULATION_SLIP" as const, rationale: "0.90 is the probability of legitimate emails (Ham), not Spam." },
      { text: "1.00 (100%)", isCorrect: false, errorType: "OVERCONFIDENT_MISCONCEPTION" as const, rationale: "1.0 would mean every single email without exception is spam." }
    ]
  },
  {
    id: "diag-3",
    targetConceptId: "bayes-rule",
    question: "The word 'cheap' appears in 80% of spam emails and 10% of legitimate emails. If you see the word 'cheap', does that guarantee the email is spam?",
    options: [
      { text: "No, Bayes' Theorem balances the word evidence against how rare spam is overall.", isCorrect: true },
      { text: "Yes, because 80% is high enough to be considered a certainty in machine learning.", isCorrect: false, errorType: "OVERCONFIDENT_MISCONCEPTION" as const, rationale: "High likelihood does not mean absolute certainty; base rates and legitimate occurrences still matter." },
      { text: "Yes, because P(cheap | spam) equals P(spam | cheap).", isCorrect: false, errorType: "CONCEPTUAL_GAP" as const, rationale: "This confuses the likelihood with the posterior (The Confusion of the Inverse / Prosecutor's Fallacy)." },
      { text: "No, words can never be used to predict probabilities.", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION" as const, rationale: "Words can and do provide strong Bayesian evidence when modeled mathematically." }
    ]
  },
  {
    id: "diag-4",
    targetConceptId: "training-vs-testing",
    question: "Why shouldn't you measure your final model accuracy on the exact same dataset it trained on?",
    options: [
      { text: "The model might have memorized the training examples (overfitting), giving a false impression of how it will perform on new, unseen data.", isCorrect: true },
      { text: "Training data accuracy is always mathematically impossible to compute.", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION" as const, rationale: "Training accuracy is easy to compute, but it is dangerously optimistic." },
      { text: "Testing on training data causes the model to delete its weights.", isCorrect: false, errorType: "CONCEPTUAL_GAP" as const, rationale: "Evaluation does not delete weights; the danger is purely unspotted overfitting." },
      { text: "It is fine to do so as long as the dataset has more than 100 rows.", isCorrect: false, errorType: "OVERCONFIDENT_MISCONCEPTION" as const, rationale: "Even on huge datasets, a high-capacity model can overfit if not validated on held-out data." }
    ]
  }
];
