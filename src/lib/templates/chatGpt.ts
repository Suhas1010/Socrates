import { Concept, ConceptEdge, DiagnosticQuestion } from "../types";

export const CHATGPT_CONCEPTS: Concept[] = [
  {
    id: "tokenization-bpe",
    title: "Byte-Pair Tokenization",
    prereqs: [],
    difficulty: 1,
    hook: "When you ask ChatGPT a question, why doesn't it read letters or whole words, but strange fragments like ' token' and 'ization'?",
    explanationSummary:
      "Language models cannot read strings directly. Byte-Pair Encoding (BPE) breaks raw text into subword token IDs from a fixed vocabulary (~50,000 to 100,000 tokens), handling common words, rare words, code, and typos with equal mathematical efficiency.",
    buildStep: "Implement a subword tokenizer that encodes a text sentence into an array of integer token IDs.",
    starterCode: `# Step 1: Subword Tokenizer
VOCAB = {"<pad>": 0, "chat": 1, "gpt": 2, "is": 3, "an": 4, "ai": 5, "robot": 6, "helpful": 7}

def tokenize_prompt(text, vocab):
    """
    Cleans lowercase words and maps them to vocabulary IDs.
    Returns list of integer IDs.
    """
    words = text.lower().split()
    tokens = []
    for w in words:
        # TODO: Look up token id in vocab, fallback to 0 if unknown
        token_id = vocab.get(w, ___)
        tokens.append(token_id)
    return tokens

# Test tokenization
prompt = "ChatGPT is an AI"
print("Tokens:", tokenize_prompt(prompt, VOCAB))
`,
    solutionCode: `VOCAB = {"<pad>": 0, "chat": 1, "gpt": 2, "is": 3, "an": 4, "ai": 5, "robot": 6, "helpful": 7}

def tokenize_prompt(text, vocab):
    words = text.lower().split()
    tokens = []
    for w in words:
        token_id = vocab.get(w, 0)
        tokens.append(token_id)
    return tokens
`,
    testAssertion: `vocab = {"hello": 1, "world": 2}
tokens = tokenize_prompt("hello world unknown", vocab)
assert tokens == [1, 2, 0], f"Expected [1, 2, 0], got {tokens}"
print("Assertion Passed: Tokenizer successfully encoded prompt into subword IDs!")
`
  },
  {
    id: "word-embeddings",
    title: "Token Embeddings & Vector Space",
    prereqs: ["tokenization-bpe"],
    difficulty: 2,
    hook: "How can numbers capture meaning such that adding 'royalty' to 'woman' lands right on the vector for 'queen'?",
    explanationSummary:
      "Token IDs (integers like 42) have no inherent meaning. An embedding matrix maps each token ID to a dense vector of floating-point numbers (e.g., 768 or 4096 dimensions). Words with similar semantic meanings cluster close together in this high-dimensional space.",
    buildStep: "Look up high-dimensional dense embedding vectors for input tokens and compute cosine similarity.",
    starterCode: `# Step 2: Embedding Lookup & Vector Dot Product
import math

def cosine_similarity(vec_a, vec_b):
    """
    Computes cosine similarity between two vectors: (A . B) / (||A|| * ||B||)
    """
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    # TODO: Return dot / (norm_a * norm_b)
    return dot / (___ * ___)

# Example word vectors
king = [0.8, 0.6, 0.1]
queen = [0.75, 0.65, 0.15]
apple = [0.05, 0.1, 0.95]
print("King vs Queen similarity:", round(cosine_similarity(king, queen), 3))
print("King vs Apple similarity:", round(cosine_similarity(king, apple), 3))
`,
    solutionCode: `import math

def cosine_similarity(vec_a, vec_b):
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
`,
    testAssertion: `a = [1.0, 0.0]
b = [1.0, 0.0]
c = [0.0, 1.0]
assert abs(cosine_similarity(a, b) - 1.0) < 1e-4, "Identical vectors should have similarity 1.0"
assert abs(cosine_similarity(a, c) - 0.0) < 1e-4, "Orthogonal vectors should have similarity 0.0"
print("Assertion Passed: Embedding vector similarity engine verified!")
`
  },
  {
    id: "self-attention",
    title: "The Self-Attention Mechanism",
    prereqs: ["word-embeddings"],
    difficulty: 3,
    hook: "In the sentence 'The animal didn't cross the street because it was too tired', how does the Transformer know 'it' refers to the animal and not the street?",
    explanationSummary:
      "Self-attention allows every token to look at ('attend to') every other token in the sequence. By computing Query, Key, and Value dot products, tokens dynamically absorb contextual information from relevant surrounding words.",
    buildStep: "Compute attention weights between tokens using scaled dot-product attention: softmax(Q · K^T / sqrt(d_k)).",
    starterCode: `# Step 3: Scaled Dot-Product Attention Weights
import math

def compute_attention_scores(query, keys):
    """
    query: 1D vector (dim d)
    keys: list of 1D vectors (tokens in context)
    Returns normalized attention weights across keys.
    """
    d = len(query)
    scores = []
    scale = math.sqrt(d)
    
    for k in keys:
        dot = sum(q * ki for q, ki in zip(query, k))
        # TODO: Scale dot product by dividing by scale (sqrt(d))
        scores.append(dot / ___)
        
    # Softmax normalization
    max_s = max(scores)
    exp_scores = [math.exp(s - max_s) for s in scores]
    total = sum(exp_scores)
    weights = [e / total for e in exp_scores]
    return weights

q = [1.0, 0.0, 1.0]
k_animal = [0.9, 0.1, 0.8]
k_street = [0.1, 0.9, 0.1]
weights = compute_attention_scores(q, [k_animal, k_street])
print("Attention on Animal:", round(weights[0], 3), "Attention on Street:", round(weights[1], 3))
`,
    solutionCode: `import math

def compute_attention_scores(query, keys):
    d = len(query)
    scores = []
    scale = math.sqrt(d)
    for k in keys:
        dot = sum(q * ki for q, ki in zip(query, k))
        scores.append(dot / scale)
    max_s = max(scores)
    exp_scores = [math.exp(s - max_s) for s in scores]
    total = sum(exp_scores)
    return [e / total for e in exp_scores]
`,
    testAssertion: `q = [1.0, 0.0]
k1 = [1.0, 0.0]
k2 = [-1.0, 0.0]
weights = compute_attention_scores(q, [k1, k2])
assert weights[0] > weights[1], "Attention on aligned key must be higher"
assert abs(sum(weights) - 1.0) < 1e-4, "Attention weights must sum to 1.0"
print("Assertion Passed: Self-Attention weights verified!")
`
  },
  {
    id: "softmax-temperature",
    title: "Next-Token Probabilities & Temperature",
    prereqs: ["self-attention"],
    difficulty: 3,
    hook: "Why does setting temperature to 0.0 make ChatGPT answer predictably like a calculator, while 1.2 makes it hallucinatory and creative?",
    explanationSummary:
      "The final layer of a language model outputs raw logits across the entire vocabulary. Dividing logits by temperature before softmax flattens or sharpens the distribution, giving the user control over randomness and creativity.",
    buildStep: "Apply temperature scaling to raw token logits and calculate next-token probability distribution.",
    starterCode: `# Step 4: Temperature-Scaled Softmax
import math

def sample_with_temperature(logits, temperature=1.0):
    """
    Divides logits by temperature and normalizes via softmax.
    temperature > 1.0 = more diverse / creative
    temperature < 1.0 = more confident / deterministic
    """
    temp = max(temperature, 0.01)
    # TODO: Scale each logit by temperature (logit / temp)
    scaled_logits = [l / ___ for l in logits]
    
    max_l = max(scaled_logits)
    exp_l = [math.exp(l - max_l) for l in scaled_logits]
    total = sum(exp_l)
    probs = [e / total for e in exp_l]
    return probs

raw_logits = [2.0, 1.0, 0.1]
print("Temp 0.2 (Focused):", [round(p, 3) for p in sample_with_temperature(raw_logits, 0.2)])
print("Temp 1.5 (Creative):", [round(p, 3) for p in sample_with_temperature(raw_logits, 1.5)])
`,
    solutionCode: `import math

def sample_with_temperature(logits, temperature=1.0):
    temp = max(temperature, 0.01)
    scaled_logits = [l / temp for l in logits]
    max_l = max(scaled_logits)
    exp_l = [math.exp(l - max_l) for l in scaled_logits]
    total = sum(exp_l)
    return [e / total for e in exp_l]
`,
    testAssertion: `logits = [4.0, 2.0]
focused = sample_with_temperature(logits, 0.1)
creative = sample_with_temperature(logits, 2.0)
assert focused[0] > creative[0], "Low temperature should place higher probability mass on top logit"
print("Assertion Passed: Temperature sampling mechanics verified!")
`
  },
  {
    id: "autoregressive-loop",
    title: "The Autoregressive Generation Loop",
    prereqs: ["softmax-temperature"],
    difficulty: 4,
    hook: "How does ChatGPT write a 1,000-word response when its core model only knows how to predict one single word?",
    explanationSummary:
      "Language models generate text autoregressively: they predict token N, append token N to the prompt, and feed the entire extended text back into the model to predict token N+1, repeating until an End-of-Sequence (<EOS>) token is generated.",
    buildStep: "Build the autoregressive generation loop that iteratively predicts and appends tokens until completion.",
    starterCode: `# Step 5: Autoregressive Text Generation Loop
def generate_tokens(mock_model_predict_fn, prompt_tokens, max_new_tokens=4, eos_token=99):
    """
    Iteratively predicts next token and appends to context until max_new_tokens or eos_token.
    """
    context = list(prompt_tokens)
    for _ in range(max_new_tokens):
        next_tok = mock_model_predict_fn(context)
        # TODO: If next_tok is eos_token, stop loop early
        if next_tok == ___:
            break
        # TODO: Append next_tok to context
        context.append(___)
    return context

# Mock model predicting sequential tokens then EOS
def mock_predict(ctx):
    token_sequence = [10, 20, 30, 99]
    idx = len(ctx) - 1
    return token_sequence[min(idx, len(token_sequence)-1)]

print("Generated Sequence:", generate_tokens(mock_predict, [0]))
`,
    solutionCode: `def generate_tokens(mock_model_predict_fn, prompt_tokens, max_new_tokens=4, eos_token=99):
    context = list(prompt_tokens)
    for _ in range(max_new_tokens):
        next_tok = mock_model_predict_fn(context)
        if next_tok == eos_token:
            break
        context.append(next_tok)
    return context
`,
    testAssertion: `def step_mock(ctx):
    return 99 if len(ctx) >= 3 else 42
res = generate_tokens(step_mock, [1], max_new_tokens=5, eos_token=99)
assert res == [1, 42, 42], f"Expected [1, 42, 42], got {res}"
print("Assertion Passed: Autoregressive generation loop functioning!")
`
  },
  {
    id: "instruction-tuning",
    title: "Instruction Tuning & Human Alignment (RLHF)",
    prereqs: ["autoregressive-loop"],
    difficulty: 4,
    hook: "Raw language models often just complete sentences with random internet text. Why does ChatGPT instead act like a polite, knowledgeable assistant?",
    explanationSummary:
      "Pretraining teaches an LLM the structure of language from internet text. Reinforcement Learning from Human Feedback (RLHF) and Supervised Instruction Tuning (SFT) guide the model to follow prompts, refuse harmful queries, and format helpful answers.",
    buildStep: "Implement the prompt formatting template that injects system instructions and separates user dialogue.",
    starterCode: `# Step 6: Chat Prompt Templating & System Formatting
def format_chat_prompt(system_instruction, user_query):
    """
    Wraps system role and user role with special boundary delimiters.
    """
    # TODO: Build standard format: "<|system|>\\n{system}\\n<|user|>\\n{query}\\n<|assistant|>\\n"
    formatted = f"<|system|>\\n{system_instruction}\\n<|user|>\\n{user_query}\\n<|assistant|>\\n"
    return formatted

sys = "You are Socrates, a thoughtful AI tutor."
query = "What is backpropagation?"
print(format_chat_prompt(sys, query))
`,
    solutionCode: `def format_chat_prompt(system_instruction, user_query):
    return f"<|system|>\\n{system_instruction}\\n<|user|>\\n{user_query}\\n<|assistant|>\\n"
`,
    testAssertion: `out = format_chat_prompt("Be helpful", "Hello")
assert "<|system|>" in out and "<|user|>" in out and "<|assistant|>" in out, "Must include all delimiter tags"
print("Assertion Passed: Chat formatting template verified!")
`
  }
];

export const CHATGPT_EDGES: ConceptEdge[] = [
  { from: "tokenization-bpe", to: "word-embeddings" },
  { from: "word-embeddings", to: "self-attention" },
  { from: "self-attention", to: "softmax-temperature" },
  { from: "softmax-temperature", to: "autoregressive-loop" },
  { from: "autoregressive-loop", to: "instruction-tuning" }
];

export const CHATGPT_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag-chatgpt-1",
    targetConceptId: "tokenization-bpe",
    question: "When a Large Language Model like ChatGPT processes human text, what is the very first representation conversion it makes?",
    options: [
      {
        text: "It splits text into subword token chunks and maps each to an integer ID.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "It translates the English directly into binary CPU machine instructions.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Text goes through subword tokenization before numeric vector lookup."
      },
      {
        text: "It converts text into sound frequencies using Fourier transforms.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Audio processing uses Fourier transforms, but text LLMs use BPE tokenization."
      },
      {
        text: "It stores every unique sentence in the world inside a giant lookup table.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "LLMs generalize through subword embeddings rather than memorizing full sentences."
      }
    ]
  },
  {
    id: "diag-chatgpt-2",
    targetConceptId: "self-attention",
    question: "What core architectural breakthrough allows Transformers (the 'T' in ChatGPT) to outperform older recurrent models (RNNs)?",
    options: [
      {
        text: "Self-attention computes connections between all words in parallel, without forgetting distant context.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "Transformers remove all mathematical matrix multiplications to save energy.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Transformers rely heavily on massive matrix multiplications in parallel."
      },
      {
        text: "Transformers only read the first 5 words of any paragraph to maximize speed.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Self-attention processes thousands of context tokens simultaneously."
      },
      {
        text: "Transformers are search engines that copy-paste paragraphs from Google in real time.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Transformers are neural generative models, not web search scrapers."
      }
    ]
  },
  {
    id: "diag-chatgpt-3",
    targetConceptId: "softmax-temperature",
    question: "What effect does setting a low temperature (e.g., temperature = 0.1) have on ChatGPT's output?",
    options: [
      {
        text: "It makes responses more deterministic and focused on the highest-probability words.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "It slows down the GPU fans to keep the server room cold.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Temperature in LLMs is a mathematical sampling scaling parameter."
      },
      {
        text: "It makes the model hallucinate wild and random words.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "High temperature increases randomness, whereas low temperature minimizes randomness."
      },
      {
        text: "It deletes the conversation history permanently.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Temperature only scales output logits during sampling."
      }
    ]
  }
];
