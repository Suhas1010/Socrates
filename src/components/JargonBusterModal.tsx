"use client";

import React, { useState } from "react";
import { BookOpen, Search, X, Sparkles, CheckCircle2, Lightbulb } from "lucide-react";

interface JargonItem {
  term: string;
  simpleMeaning: string;
  example: string;
  category: "Beginner" | "Machine Learning" | "How Socrates Works";
}

const JARGON_LIST: JargonItem[] = [
  {
    term: "Concept DAG / Roadmap",
    simpleMeaning:
      "A step-by-step learning roadmap where each step unlocks the next in a natural order, without getting you stuck in confusing circles.",
    example:
      "Like learning to count before learning multiplication — you always know what to learn next.",
    category: "How Socrates Works",
  },
  {
    term: "Classification / Classifier",
    simpleMeaning:
      "A smart computer program that sorts things into categories instead of just predicting a random number.",
    example:
      "Sorting emails into 'Spam' vs 'Not Spam', or photos into 'Cat' vs 'Dog'.",
    category: "Beginner",
  },
  {
    term: "Inference",
    simpleMeaning:
      "Using your finished AI model to make a live prediction on brand new, real-world data.",
    example:
      "Typing a new email into your spam classifier and watching it calculate whether it's junk.",
    category: "Machine Learning",
  },
  {
    term: "Naive Bayes",
    simpleMeaning:
      "A classic, fast machine learning method based on probability that looks at the words in a text to guess its category.",
    example:
      "If an email has words like 'lottery', 'winner', and 'cash', Naive Bayes calculates that the chances of it being spam are very high.",
    category: "Machine Learning",
  },
  {
    term: "Tokenization",
    simpleMeaning:
      "Splitting a sentence or paragraph into clean, lowercase individual words (tokens) so a computer can count them.",
    example:
      "'Win $1000 now!' gets turned into ['win', '1000', 'now'].",
    category: "Beginner",
  },
  {
    term: "Bag of Words",
    simpleMeaning:
      "A simple way for computers to understand text by counting how many times each word appears, ignoring grammar or word order.",
    example:
      "Counting how often 'free' appears in spam vs in emails from your friends.",
    category: "Machine Learning",
  },
  {
    term: "Python Sandbox (Pyodide)",
    simpleMeaning:
      "A built-in coding environment that lets real Python code run directly inside your web browser. You don't need to install Python, drivers, or any software on your computer.",
    example:
      "You can write and run Python right here on this page, and it executes securely in seconds.",
    category: "How Socrates Works",
  },
  {
    term: "Decision Threshold",
    simpleMeaning:
      "A sensitivity slider for the AI. If set to 80%, the AI will only mark an email as spam if it is at least 80% confident.",
    example:
      "Raising the threshold ensures important work emails never get accidentally sent to the junk folder.",
    category: "Machine Learning",
  },
  {
    term: "The Feynman Technique (Teach-It-Back)",
    simpleMeaning:
      "A proven learning method created by Nobel Prize physicist Richard Feynman: if you can explain an idea in simple, plain English without jargon, you have truly mastered it.",
    example:
      "Explaining how a spam filter works to a friend over coffee.",
    category: "How Socrates Works",
  },
  {
    term: "Training vs Testing",
    simpleMeaning:
      "Teaching the AI using one set of examples (training), and then quizzing it on brand-new examples it has never seen before (testing) to make sure it didn't just memorize answers.",
    example:
      "Just like studying practice questions, but taking a test with different questions.",
    category: "Machine Learning",
  },
  {
    term: "Overfitting",
    simpleMeaning:
      "When an AI memorizes specific training examples word-for-word rather than learning the general concept, causing it to fail on new data.",
    example:
      "A student who memorizes test answer keys but can't solve a slightly rephrased problem.",
    category: "Machine Learning",
  },
  {
    term: "Feature Vector",
    simpleMeaning:
      "A list of numbers that describes an item so the computer can understand it mathematically.",
    example:
      "Representing a house by [number of bedrooms, square footage, price] or an image by pixel brightness numbers.",
    category: "Beginner",
  },
];

interface JargonBusterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JargonBusterModal: React.FC<JargonBusterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const filtered = JARGON_LIST.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.simpleMeaning.toLowerCase().includes(search.toLowerCase()) ||
      item.example.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/15 p-6 md:p-8 shadow-2xl flex flex-col space-y-5 relative overflow-hidden bg-[#080B11]/95 text-zinc-100">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Beginner Jargon Buster</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Plain English
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Every AI term explained simply — no math degree required.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any term (e.g. DAG, Inference, Bayes, Threshold)..."
              className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-white placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["All", "Beginner", "Machine Learning", "How Socrates Works"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[460px]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No matching terms found. Try searching something else!
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.term}
                className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/20 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-amber-300">
                    {item.term}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 border border-white/5">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {item.simpleMeaning}
                </p>
                <div className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-white/5 flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold flex-shrink-0">
                    Example:
                  </span>
                  <span>{item.example}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Remember: AI is just math and code made accessible!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all text-xs"
          >
            Got it, Let&apos;s Build!
          </button>
        </div>
      </div>
    </div>
  );
};
