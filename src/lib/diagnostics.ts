import { DiagnosticQuestion, Concept, ConceptEdge } from "./types";

/**
 * Generates tailored diagnostic questions grounded in the user's actual project goal.
 * Never mentions spam emails unless the goal is specifically about spam!
 */
export function generateDiagnosticQuestionsForGoal(goal: string): DiagnosticQuestion[] {
  const lower = (goal || "").toLowerCase();
  const safeGoal = goal?.trim() || "Your AI Project";

  // 0. Facial Emotion / Face Expression Analyzer
  if (
    lower.includes("emotion") ||
    lower.includes("face") ||
    lower.includes("facial") ||
    lower.includes("expression") ||
    lower.includes("smile") ||
    lower.includes("mood")
  ) {
    return [
      {
        id: "diag-emotion-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". Imagine showing the model 1,000 photos of faces — some happy, some angry, some surprised. What is the model's job?`,
        options: [
          {
            text: `Look at each photo's measurements (like eyebrow height, lip curve) and learn which combination of measurements goes with which emotion — so it can label NEW photos it has never seen.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Memorise every single photo and refuse to work on any new photos.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Memorising training photos is not learning. A good model recognises patterns that apply to NEW faces it has never seen.`,
          },
          {
            text: `Download the internet and search for matching faces.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `ML models learn from the training data you provide — they don't browse the web.`,
          },
          {
            text: `A human expert manually reviews every photo and writes the label.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `That is manual labeling, not machine learning. ML automates this process after learning from labeled examples.`,
          },
        ],
      },
      {
        id: "diag-emotion-2",
        targetConceptId: "prior-probability",
        question: `A camera sees pixels — millions of coloured dots. How does a computer figure out if someone is happy from pixels alone?`,
        options: [
          {
            text: `We measure specific physical features of the face (like how curved the lips are, how raised the eyebrows are) and give those measurements as numbers to the model.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `The computer "feels" emotions the same way humans do.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Computers have zero emotional awareness. They only compute arithmetic on numbers. We must convert the face into numerical measurements first.`,
          },
          {
            text: `Python has a built-in "emotion detector" that works on raw photos automatically.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `No such built-in exists. You must explicitly extract numerical features from the image and feed them to a trained model.`,
          },
          {
            text: `Computers can only process sound files, not images.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Computers process images as matrices of numbers (pixel values). Both images and audio are just numbers at the lowest level.`,
          },
        ],
      },
      {
        id: "diag-emotion-3",
        targetConceptId: "feature-engineering",
        question: `Why can't we just write a simple rule like "if smile_width > 50, print Happy" for every face?`,
        options: [
          {
            text: `Because human faces are all different — a 50-pixel smile on a baby is huge, but tiny on an adult. One simple rule fails on real diversity. A trained model handles all these variations automatically.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Because Python crashes if you use an if statement.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Python if statements work perfectly fine. The issue is that a single rigid rule cannot handle the variation in real human faces.`,
          },
          {
            text: `Because smiling faces are invisible to cameras.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Cameras capture smiles clearly. The problem is that a single measurement threshold cannot generalize across diverse face shapes and sizes.`,
          },
          {
            text: `There is no reason — one rule would work perfectly.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Try it — a single threshold fails on real-world diversity. ML discovers the complex multi-feature pattern automatically from examples.`,
          },
        ],
      },
    ];
  }

  const isPlantOrAgri =
    lower.includes("plant") ||
    lower.includes("crop") ||
    lower.includes("leaf") ||
    lower.includes("leaves") ||
    lower.includes("botan") ||
    lower.includes("agri") ||
    lower.includes("tree") ||
    lower.includes("garden") ||
    lower.includes("farm") ||
    lower.includes("flora");

  // 0.5 Agricultural Vision / Plant Disease Detector
  if (isPlantOrAgri) {
    return [
      {
        id: "diag-plant-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". Imagine a farmer who takes a photo of a leaf. What should the AI model do with that photo?`,
        options: [
          {
            text: `Look at visual patterns in the photo (like spots, discoloration, texture) and match them to known disease patterns it learned from thousands of labelled training photos.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Physically treat the leaf by spraying it with chemicals.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `AI models analyse images and make predictions — they cannot perform physical actions like spraying crops.`,
          },
          {
            text: `Search Google Images for a matching leaf.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `The model learns from training data you provide, not from internet searches.`,
          },
          {
            text: `Print the photo on paper and send it to a laboratory.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `AI models run entirely in software — they make instant digital predictions, no physical lab needed.`,
          },
        ],
      },
      {
        id: "diag-plant-2",
        targetConceptId: "prior-probability",
        question: `You have 100 leaf photos in your training dataset. 8 show disease, 92 are healthy. You train a model and it predicts "healthy" for every single new photo. What is wrong with this?`,
        options: [
          {
            text: `The model is just defaulting to "healthy" for everything. It gets 92% accuracy by doing nothing useful — but it misses 100% of diseased leaves, which is the whole point of the project.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `92% accuracy is excellent — the model works perfectly.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A model that never detects disease is useless for disease detection, even with 92% accuracy. Always check whether it actually catches the thing you care about.`,
          },
          {
            text: `8% disease rate means the project is impossible.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Imbalanced datasets are common. The solution is to use appropriate techniques, not to abandon the project.`,
          },
          {
            text: `The dataset needs exactly 50% diseased and 50% healthy.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Balanced datasets help, but are not strictly required. Real-world datasets are often imbalanced — the model must still learn to detect rare events.`,
          },
        ],
      },
      {
        id: "diag-plant-3",
        targetConceptId: "feature-engineering",
        question: `Your plant disease model uses two measurements: "percentage of leaf covered by spots" (0–100%) and "colour change score" (0.01–0.98). Does the big difference in scale matter?`,
        options: [
          {
            text: `Yes — the model might unfairly focus on the spot percentage (because 100 is much bigger than 0.98) and almost ignore the colour score. Rescaling both to a common range (like 0 to 1) fixes this.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `No — the model treats all numbers the same regardless of size.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Many ML algorithms ARE sensitive to scale. A 0–100 feature will dominate a 0–1 feature in the model's calculations, even if both carry equal biological importance.`,
          },
          {
            text: `Python crashes if you mix percentages and decimal scores in a list.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Python handles all numbers fine. The issue is mathematical: unequal scales lead to unfair weighting in the model's calculations.`,
          },
          {
            text: `We should just delete the colour score since it has smaller values.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Never delete features just because they have smaller numbers. Rescale them so the model treats both features fairly.`,
          },
        ],
      },
      {
        id: "diag-plant-4",
        targetConceptId: "decision-boundary",
        question: `Your model outputs a "disease confidence" score between 0 and 1. You set the threshold at 0.50 — scores above 0.50 trigger an alert. A farmer says: "I'd rather get a few false alarms than miss any real disease." What threshold change does this suggest?`,
        options: [
          {
            text: `Lower the threshold to something like 0.30 — so the model alerts more often, catching more real disease cases even if some alerts are false alarms.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Raise the threshold to 0.90 — so only very confident predictions trigger an alert.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Raising the threshold means the model only alerts when very confident, which causes it to MISS more borderline disease cases. The farmer wants the opposite.`,
          },
          {
            text: `Keep it at exactly 0.50 — changing it makes the model inaccurate.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `0.50 is just a default. Adjusting the threshold trades off false alarms vs missed detections — it is a design choice based on real-world priorities.`,
          },
          {
            text: `Delete the threshold entirely — the model should decide for itself.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `The threshold is a design parameter you control. It balances the real-world cost of missing a disease vs the cost of a false alarm.`,
          },
        ],
      },
    ];
  }

  // 1. Medical / Health / Disease / Clinical (e.g. Diabetes, Cancer, Heart Disease, Medical Diagnosis)
  if (
    !isPlantOrAgri &&
    (lower.includes("diabet") ||
      (lower.includes("disease") && !isPlantOrAgri) ||
      lower.includes("cancer") ||
      lower.includes("medical") ||
      lower.includes("patient") ||
      (lower.includes("health") && !isPlantOrAgri) ||
      lower.includes("clinic") ||
      lower.includes("heart") ||
      lower.includes("tumor") ||
      lower.includes("glucose") ||
      (lower.includes("diagnosis") && !isPlantOrAgri))
  ) {
    return [
      {
        id: "diag-med-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". A doctor looks at a patient's measurements (like age, weight, blood test results) and makes a prediction. What is the ML model's job here?`,
        options: [
          {
            text: `Learn from hundreds of past patients — each with known measurements AND known outcomes — so it can predict the outcome for NEW patients it has never seen before.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Replace the doctor entirely and diagnose without any data.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `ML models are decision-support tools, not replacements. They predict based on patterns in historical data — they always need input measurements.`,
          },
          {
            text: `Look up the patient's name in a database and retrieve a pre-written answer.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `ML models learn statistical patterns from training data. They do not look up individuals in a database.`,
          },
          {
            text: `Randomly generate a diagnosis without looking at any patient measurements.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `ML models make predictions based on learned patterns in the input features — not random guessing.`,
          },
        ],
      },
      {
        id: "diag-med-2",
        targetConceptId: "prior-probability",
        question: `To train a "${safeGoal}" model, you have 200 past patients. For each patient you have their measurements AND whether the prediction turned out to be correct. Why do you need BOTH the measurements AND the outcomes?`,
        options: [
          {
            text: `The model learns by comparing its predictions to the known outcomes. Without the outcomes, it has no way to know if it is right or wrong — and cannot improve.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `You only need the outcomes — measurements are optional.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Without the input measurements, the model has nothing to learn FROM. Both are required: measurements as inputs, outcomes as the target to learn.`,
          },
          {
            text: `The outcomes are stored separately in a hospital database, not in training data.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `For supervised learning, we need labeled training examples — each example has both the input measurements and the known correct answer.`,
          },
          {
            text: `You only need measurements — the model figures out outcomes on its own.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `The model cannot learn without seeing what the correct answer is. Supervision means the training data contains both inputs AND labeled answers.`,
          },
        ],
      },
      {
        id: "diag-med-3",
        targetConceptId: "feature-engineering",
        question: `For "${safeGoal}", your training data includes: age (years), blood pressure (mmHg), and cholesterol (mg/dL). These are already numbers — can you feed them directly into the model, or is there anything to watch out for?`,
        options: [
          {
            text: `You CAN feed them as numbers, but watch out: age goes 0–100, blood pressure 60–200, cholesterol 100–300. The model might unfairly weight cholesterol just because its numbers are bigger. It helps to rescale all features to a similar range.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Yes, just feed them directly — scale differences never matter.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Scale differences DO matter for many algorithms. Features with larger values can dominate the model's calculations unfairly.`,
          },
          {
            text: `No — you must convert all medical measurements to text strings first.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `ML models work on numbers. Text would need to be encoded as numbers, not the other way around.`,
          },
          {
            text: `Blood pressure cannot be used as a feature because it changes over time.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `A single snapshot measurement (e.g., today's blood pressure reading) can absolutely be used as a feature. The model learns from point-in-time measurements.`,
          },
        ],
      },
    ];
  }

  // 2. Financial / Fraud / Risk / Default
  if (
    lower.includes("fraud") ||
    lower.includes("credit") ||
    lower.includes("loan") ||
    lower.includes("bank") ||
    lower.includes("default") ||
    lower.includes("finance")
  ) {
        return [
      {
        id: "diag-fin-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". When a bank looks at a transaction and asks "Is this fraud or not?", what kind of answer are they looking for?`,
        options: [
          {
            text: `A yes/no decision — either it IS suspicious (fraud/risk) or it is NOT. The model learns from thousands of past transactions with known outcomes.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `An exact dollar amount, like predicting the precise transaction total.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Fraud detection is about categorizing a transaction (fraud vs legitimate) — not predicting a number. Predicting numbers is a different type of ML called regression.`,
          },
          {
            text: `The name and address of the fraudster.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `ML models predict categories based on patterns in numerical features. They do not identify specific individuals.`,
          },
          {
            text: `A random guess, since fraud is impossible to detect.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Fraud detection ML models achieve 95%+ accuracy on real datasets by learning patterns in transaction data.`,
          },
        ],
      },
      {
        id: "diag-fin-2",
        targetConceptId: "prior-probability",
        question: `Out of 100 past transactions in your training data, only 2 were fraud. You train the model, and it predicts "not fraud" for EVERY new transaction. It gets 98% accuracy. Is this a good model?`,
        options: [
          {
            text: `No! It gets 98% by doing absolutely nothing — just always saying "safe". It would miss 100% of real fraud cases. Accuracy alone is a misleading metric here.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Yes — 98% accuracy is excellent, whatever the reason.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A model that never flags fraud is useless for fraud detection, regardless of its accuracy number. This is why we also look at how many frauds it actually catches.`,
          },
          {
            text: `It depends on the weather that day.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `ML model performance depends on training data and evaluation metrics — not external conditions like weather.`,
          },
          {
            text: `Yes — if it gets 98% it correctly identified all 2 fraud cases.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `It got 98% by ignoring fraud entirely. 98 correct "safe" labels out of 100 = 98%, while missing both fraud cases.`,
          },
        ],
      },
      {
        id: "diag-fin-3",
        targetConceptId: "feature-engineering",
        question: `Your fraud model uses two features: transaction amount ($0–$50,000) and number of attempts (1–10). Why does the huge difference in scale matter?`,
        options: [
          {
            text: `The model might ignore "number of attempts" almost completely because $50,000 is a much bigger number than 10, even though both features matter equally. We need to rescale them to the same range.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `It does not matter — the model treats all numbers the same regardless of size.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Many ML algorithms are sensitive to the scale of features. A $50,000 difference dominates a 10-attempt difference in calculations, even if both are equally important signals.`,
          },
          {
            text: `Python crashes if you mix large and small numbers in a list.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Python handles all sizes of numbers. The issue is mathematical: the model's internal calculations give unfair weight to larger-magnitude features.`,
          },
          {
            text: `We should delete the smaller feature since it has smaller numbers.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Never delete features based on scale. Scale the features to a common range (like 0–1) so the model weighs them fairly.`,
          },
        ],
      },
    ];
  }

  // 2.5 Customer Churn & Subscriber Retention
  if (
    lower.includes("customer churn") ||
    lower.includes("subscriber churn") ||
    lower.includes("customer retention") ||
    lower.includes("attrition") ||
    lower.includes("churn")
  ) {
    return [
      {
        id: "diag-churn-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". A subscription service wants to stop customers from canceling. Why predict who will cancel BEFORE they leave?`,
        options: [
          {
            text: `So the company can step in with support, discounts, or bug fixes while the customer is still active — once they already left, it is too late.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `To automatically cancel their accounts before they can do it themselves.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `The goal is customer retention, not prematurely closing accounts.`,
          },
          {
            text: `Because computers cannot store data about people who already canceled.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Databases can easily store past customer records. The reason to predict early is business intervention.`,
          },
          {
            text: `Churn models only work on people who promise to never leave.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `The whole point is identifying at-risk users who are likely to leave.`,
          },
        ],
      },
      {
        id: "diag-churn-2",
        targetConceptId: "prior-probability",
        question: `If only 4 out of 100 subscribers cancel each month, and a lazy model predicts "nobody cancels", it scores 96% accuracy. Why is this model useless?`,
        options: [
          {
            text: `Because the entire business goal was to find the 4 people at risk of leaving! The model caught 0% of them, so 96% accuracy is completely deceptive.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `96% accuracy is fantastic — the company should deploy it immediately.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A churn model that never flags churners saves zero customers, regardless of accuracy.`,
          },
          {
            text: `Because Python will crash when running on 96% accuracy.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Accuracy is just a statistical score. The issue is operational usefulness.`,
          },
          {
            text: `Subscriptions cannot be modeled using machine learning.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Churn prediction is one of the most widely used and successful ML applications in business.`,
          },
        ],
      },
      {
        id: "diag-churn-3",
        targetConceptId: "feature-engineering",
        question: `A subscriber's monthly bill just increased by $35, their weekly usage dropped by 70%, and they submitted 3 support tickets. How does the model use these clues?`,
        options: [
          {
            text: `It combines all three measurements into a single risk score — multiple warning signs reinforce each other to predict a high churn probability.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `It picks only one feature at random and ignores the other two.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Machine learning models look at all input features simultaneously to discover multi-signal patterns.`,
          },
          {
            text: `It waits for the customer to fill out an exit survey first.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Exit surveys happen after cancellation. ML predicts beforehand using behavioral signals.`,
          },
          {
            text: `It deletes their support tickets to improve customer satisfaction.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Software models read data; they do not delete customer support records.`,
          },
        ],
      },
    ];
  }

  // 2.6 Recommender Systems (Movies, Music, Books, Products)
  if (
    lower.includes("recommend") ||
    lower.includes("movie") ||
    lower.includes("netflix") ||
    lower.includes("spotify") ||
    lower.includes("song") ||
    lower.includes("book") ||
    lower.includes("collaborative filtering")
  ) {
    return [
      {
        id: "diag-rec-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". How does a modern recommendation system (like Netflix or Spotify) know what you might like next?`,
        options: [
          {
            text: `It compares your past ratings/choices with millions of other users who have similar taste, and recommends things they loved that you haven't seen yet.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `A human Netflix employee manually curates a custom list for every single subscriber every morning.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Manual curation doesn't scale to hundreds of millions of users. ML algorithms compute similarity automatically.`,
          },
          {
            text: `It randomly shuffles the entire movie catalog every time you open the app.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Random shuffling offers zero personalization. Recommenders use learned taste patterns.`,
          },
          {
            text: `It downloads your personal webcam footage to see what you look like.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Recommenders rely on interaction history (ratings, clicks, watch duration) — not camera biometrics.`,
          },
        ],
      },
      {
        id: "diag-rec-2",
        targetConceptId: "prior-probability",
        question: `A catalog has 10,000 movies. An average user has only watched and rated 25 of them (meaning 99.7% of the ratings grid is blank). How do algorithms handle this "sparse" data?`,
        options: [
          {
            text: `They look for overlapping ratings between users to find taste "neighborhoods", filling in the missing blanks with predicted rating scores.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `They delete all movies that haven't been watched by 100% of users.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Deleting unrated movies would erase almost the entire catalog. Collaborative filtering is built specifically for sparse tables.`,
          },
          {
            text: `They force the user to watch all 10,000 movies before giving any recommendations.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `No user could watch 10,000 movies. The model must extrapolate from tiny samples of user activity.`,
          },
          {
            text: `Python crashes if more than 50% of a table is empty.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Python and sparse matrix libraries handle 99%+ empty matrices efficiently.`,
          },
        ],
      },
      {
        id: "diag-rec-3",
        targetConceptId: "feature-engineering",
        question: `Why can't a recommender simply show the top 10 most popular movies of all time to every single user on the homepage?`,
        options: [
          {
            text: `Because everyone has different tastes — a fan of quiet indie dramas would be annoyed if they only ever saw generic superhero blockbusters.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Because popular movies are illegal to recommend twice.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `There is no legal restriction. The issue is personalization and user satisfaction.`,
          },
          {
            text: `Popular movies have smaller file sizes so the server refuses to stream them.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `File size has nothing to do with recommendation quality.`,
          },
          {
            text: `Top 10 lists work perfectly for 100% of users with no complaints.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A single global top 10 list fails to cater to niche genres and individual preferences.`,
          },
        ],
      },
    ];
  }

  // 2.7 Autonomous Driving & Vision Object / Obstacle Detection
  if (
    lower.includes("object detect") ||
    lower.includes("pedestrian") ||
    lower.includes("obstacle") ||
    lower.includes("self-driving") ||
    lower.includes("autonomous") ||
    lower.includes("yolo") ||
    lower.includes("bounding box") ||
    lower.includes("traffic sign") ||
    lower.includes("vehicle detect")
  ) {
    return [
      {
        id: "diag-obj-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". A camera on a car records 30 video frames per second. What must the vision model output for each frame?`,
        options: [
          {
            text: `Both WHAT the objects are (car, pedestrian, cyclist) AND WHERE they are in the image (box coordinates: [x, y, width, height]).`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Just a single word saying whether the photo is pretty or ugly.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Driving safety requires detecting specific obstacles and their spatial coordinates in the road.`,
          },
          {
            text: `It physically steers the wheel using mechanical arms inside the camera lens.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `The vision model is software that outputs detections. Vehicle control is handled downstream by path planning and steering controllers.`,
          },
          {
            text: `It sends a text message to the manufacturer asking for advice.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Object detection runs locally in real time (milliseconds) on the vehicle's computer.`,
          },
        ],
      },
      {
        id: "diag-obj-2",
        targetConceptId: "prior-probability",
        question: `On a clear highway, 99.9% of video frames show empty road with zero pedestrians. If a model simply predicts "no pedestrians" 100% of the time, it gets 99.9% accuracy. Why is this unacceptable?`,
        options: [
          {
            text: `Because it would hit the one pedestrian who steps onto the road! In safety AI, catching rare danger events (Recall) is infinitely more important than raw accuracy.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `99.9% accuracy is safe enough for any road situation.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A car that never stops for pedestrians because they are rare is lethal. Imbalanced safety metrics require prioritizing recall.`,
          },
          {
            text: `Because highway roads are actually 50% covered by pedestrians.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Pedestrians on highways are indeed rare, which is why class imbalance is a critical concept to master.`,
          },
          {
            text: `Cars only drive in reverse if accuracy is above 99%.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Accuracy does not reverse mechanical transmission; it measures prediction quality.`,
          },
        ],
      },
      {
        id: "diag-obj-3",
        targetConceptId: "feature-engineering",
        question: `How does an AI model measure whether its predicted bounding box around an obstacle is accurate compared to the human ground truth?`,
        options: [
          {
            text: `By calculating how much the predicted box overlaps with the true box (Intersection over Union / IoU).`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `By counting how many vowels are in the word "obstacle".`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Box evaluation is spatial and geometric, not linguistic.`,
          },
          {
            text: `It doesn't measure overlap — as long as any pixel matches, it gets 100%.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A single matching pixel is not enough; the bounding box must closely enclose the physical object.`,
          },
          {
            text: `By asking other drivers on the road through their radios.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Evaluation is computed mathematically against annotated training datasets.`,
          },
        ],
      },
    ];
  }

  // 2.8 Cybersecurity & Network Threat / Intrusion Detection
  if (
    lower.includes("cyber") ||
    lower.includes("intrusion") ||
    lower.includes("ddos") ||
    lower.includes("packet") ||
    lower.includes("malware") ||
    lower.includes("network attack") ||
    lower.includes("firewall")
  ) {
    return [
      {
        id: "diag-cyber-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". Thousands of data packets hit a server every second. What is the ML model's job?`,
        options: [
          {
            text: `Learn what normal traffic looks like (normal packet sizes, typical request rates) so it can instantly flag abnormal spikes or intrusion signatures.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Disconnect the company's internet whenever anyone visits a website.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `The goal is protecting legitimate business traffic, not shutting down operations.`,
          },
          {
            text: `Identify the hacker's real legal name and home address from IP numbers.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `ML models classify traffic behavior (malicious vs benign); they do not magically reveal personal identities.`,
          },
          {
            text: `Print every data packet on physical paper for human review.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Network traffic happens at gigabits per second — AI automation is required for sub-millisecond defense.`,
          },
        ],
      },
      {
        id: "diag-cyber-2",
        targetConceptId: "prior-probability",
        question: `In 1,000,000 network packets, only 50 are malicious cyberattacks. A model predicts "normal traffic" for every packet and boasts 99.995% accuracy. Why is this dangerous?`,
        options: [
          {
            text: `It let all 50 hackers right into the database! When attacks are rare, high accuracy is meaningless if the model misses 100% of real threats.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `99.995% accuracy proves the firewall is impregnable.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `A firewall that never blocks anything is not secure. Tracking Recall on the attack class is mandatory.`,
          },
          {
            text: `Because 50 attacks out of a million means the server was never attacked.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Even a single undetected intrusion can cause a catastrophic data breach.`,
          },
          {
            text: `Packets cannot be counted using numbers.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Packets are discrete digital units counted and inspected continuously.`,
          },
        ],
      },
      {
        id: "diag-cyber-3",
        targetConceptId: "feature-engineering",
        question: `Your intrusion model examines packet size (up to 1,500 bytes) and failed password attempts (0 to 5). Why does rescaling both features to a common range matter?`,
        options: [
          {
            text: `Because 1,500 is much larger than 5, the model might fixate on packet size and almost ignore the vital signal of repeated failed passwords.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `It does not matter — models always treat all numbers with equal fairness regardless of size.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Numerical magnitude directly influences weights in many algorithms. Feature scaling levels the playing field.`,
          },
          {
            text: `Python crashes when numbers larger than 100 are used in machine learning.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Python handles arbitrarily large numbers. The constraint is mathematical weighting in optimization algorithms.`,
          },
          {
            text: `We should delete failed password attempts because it has smaller numbers.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Failed password attempts is a critical security signal. Always scale, never discard valuable signals.`,
          },
        ],
      },
    ];
  }

  // 2.9 Fake News & Misinformation Detection (NLP)
  if (
    lower.includes("fake news") ||
    lower.includes("misinformation") ||
    lower.includes("clickbait") ||
    lower.includes("fact check") ||
    lower.includes("rumor") ||
    lower.includes("disinformation")
  ) {
    return [
      {
        id: "diag-fake-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". How can machine learning evaluate whether an article might be misleading or fake?`,
        options: [
          {
            text: `By analyzing stylistic patterns (like emotional sensationalism, ALL CAPS, excessive punctuation, unverified claims) learned from thousands of labeled real vs fake articles.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `By sending an undercover detective to interview the author.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `ML runs automated statistical text analysis; it does not perform physical investigative reporting.`,
          },
          {
            text: `By deleting every article that disagrees with the programmer's opinion.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `A scientific model learns objective credibility indicators from diverse training data, not personal bias.`,
          },
          {
            text: `Machine learning cannot analyze text because text has no pixels.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `NLP (Natural Language Processing) is one of the largest branches of AI, converting words into numerical features.`,
          },
        ],
      },
      {
        id: "diag-fake-2",
        targetConceptId: "feature-engineering",
        question: `Computers can only do maths on numbers, not English sentences. How does an AI read a headline like "SHOCKING TRUTH REVEALED!!!"?`,
        options: [
          {
            text: `We convert text into numbers — like counting sensational words, measuring the percentage of CAPITAL letters, and calculating word frequencies (TF-IDF).`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `The computer translates the headline into French before processing.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `French is still human text. All text must be vectorized into numbers for machine learning.`,
          },
          {
            text: `Computers have a human brain inside that understands words directly.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Computers only perform arithmetic on numerical vectors.`,
          },
          {
            text: `Headlines are automatically discarded and never used in fake news models.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Headlines are one of the strongest signals for clickbait and sensationalism.`,
          },
        ],
      },
      {
        id: "diag-fake-3",
        targetConceptId: "decision-boundary",
        question: `If your model was trained ONLY on news articles from 2020, what will happen when you ask it to check breaking 2026 news?`,
        options: [
          {
            text: `It might struggle because it memorized specific 2020 names and events, rather than learning timeless stylistic patterns of unverified writing.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `It will be 100% accurate because news never changes.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Language, names, and topics evolve constantly. Models must generalize to new topics without overfitting to old entities.`,
          },
          {
            text: `Python refuses to run on articles published in a different calendar year.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Python will run without error, but the predictions will suffer from temporal domain shift.`,
          },
          {
            text: `The model automatically travels forward in time to read the 2026 internet.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Models only know what was in their training dataset unless explicitly retrained.`,
          },
        ],
      },
    ];
  }

  // 2.10 Audio / Speech / Voice Recognition
  if (
    lower.includes("audio") ||
    lower.includes("speech") ||
    lower.includes("voice") ||
    lower.includes("sound") ||
    lower.includes("acoustic") ||
    lower.includes("speaker")
  ) {
    return [
      {
        id: "diag-audio-1",
        targetConceptId: "problem-framing",
        question: `You want to build "${safeGoal}". When someone speaks into a microphone, it records sound vibrations in the air. How does an AI recognize spoken words?`,
        options: [
          {
            text: `It breaks the sound wave into frequency patterns over time (acoustic fingerprints called spectrograms) and matches them to phonemes and words.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `A tiny person inside the smart speaker writes down what it hears.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Audio recognition is powered by statistical signal processing and deep neural networks.`,
          },
          {
            text: `Microphones only record text, not sound waves.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Microphones convert physical air pressure waves into continuous electrical signals (sound waves).`,
          },
          {
            text: `It guesses based solely on the color of the microphone.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Audio classification depends on acoustic frequency spectra, not physical hardware color.`,
          },
        ],
      },
      {
        id: "diag-audio-2",
        targetConceptId: "feature-engineering",
        question: `A 1-second audio file contains 44,100 raw pressure samples. Why do we extract features (like pitch and energy) instead of feeding raw wave points directly?`,
        options: [
          {
            text: `Raw waves are chaotic and change drastically if someone speaks slightly louder. Acoustic features extract the stable frequency pattern that actually defines the word.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Because 44,100 numbers is too large for any computer to store.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Computers easily store millions of numbers. The challenge is extracting informative signals from raw noise.`,
          },
          {
            text: `Sound waves cannot be represented with numbers.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Digital audio is fundamentally a stream of numerical amplitude samples.`,
          },
          {
            text: `Raw waves are always identical for every person who speaks.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Raw waveforms vary wildly between speakers, microphones, and room acoustics.`,
          },
        ],
      },
      {
        id: "diag-audio-3",
        targetConceptId: "decision-boundary",
        question: `Your voice recognition model works with 99% accuracy in your quiet bedroom, but fails completely inside a moving car. Why?`,
        options: [
          {
            text: `It overfit to clean silence! In a car, engine rumble and wind noise mix into the frequencies, confusing a model that was never trained with background noise.`,
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: `Cars block all microphone signals from entering software.`,
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: `Microphones in cars work fine; the issue is background noise distribution shift.`,
          },
          {
            text: `Human voices sound completely backwards when traveling in vehicles.`,
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: `Vehicle velocity does not invert human voice frequencies.`,
          },
          {
            text: `99% accuracy in one room guarantees 99% accuracy anywhere in the universe.`,
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: `Models only generalize to acoustic environments that resemble their training data distribution.`,
          },
        ],
      },
    ];
  }

  // 3. General / Custom Machine Learning Project — beginner-friendly, zero jargon first
  return [
    {
      id: "diag-custom-1",
      targetConceptId: "problem-framing",
      question: `You want to build "${safeGoal}". Think of it like teaching a child to recognise patterns. Which best describes what the computer will do?`,
      options: [
        {
          text: `Look at many past examples and learn a pattern, so it can make a prediction on NEW data it has never seen before.`,
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: `A human programmer manually writes an if/else rule for every possible situation.`,
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: `If you wrote a rule for every situation you'd need millions of rules. ML learns the pattern automatically from examples.`,
        },
        {
          text: `The computer searches Google and copy-pastes the answer.`,
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: `ML models learn from historical data you provide — they don't browse the internet.`,
        },
        {
          text: `The programmer tells the computer the exact answer to every possible question in advance.`,
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: `That is a lookup table, not learning. ML models discover patterns from examples.`,
        },
      ],
    },
    {
      id: "diag-custom-2",
      targetConceptId: "feature-engineering",
      question: `For "${safeGoal}", you describe each historical example as a row of numbers — like [30, 88, 1005] for one day's temperature, humidity, and pressure. Why numbers instead of words like "hot" or "humid"?`,
      options: [
        {
          text: `Computers do maths — they can add, multiply, and compare numbers. They cannot do maths on words. Numbers let the model calculate patterns.`,
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: `Because Python crashes if you use strings inside a list.`,
          isCorrect: false,
          errorType: "TERMINOLOGY_CONFUSION",
          rationale: `Python handles strings fine. ML algorithms need numbers to run mathematical operations.`,
        },
        {
          text: `Because numbers take less storage space on disk.`,
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: `Storage is not the reason. ML training needs numerical values to compute patterns.`,
        },
        {
          text: `There is no reason — words would work equally well.`,
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: `You cannot multiply or find gradients in plain text. ML requires numerical inputs.`,
        },
      ],
    },
    {
      id: "diag-custom-3",
      targetConceptId: "decision-boundary",
      question: `You train your model on 100 examples and then test it on those SAME 100 examples — it scores 100% accuracy. Is your model actually good?`,
      options: [
        {
          text: `No — the model may have just memorised those 100 examples, like a student who memorised exam answers. It could fail completely on new unseen data.`,
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: `Yes — 100% accuracy always means a perfect model.`,
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: `Testing on training data is meaningless. The model already saw those examples — it is like re-taking an exam you were given the answer sheet for.`,
        },
        {
          text: `sklearn will throw an error if you evaluate on training data.`,
          isCorrect: false,
          errorType: "TERMINOLOGY_CONFUSION",
          rationale: `sklearn will not error — but the score is misleadingly inflated.`,
        },
        {
          text: `The model deletes training data after learning, making the test invalid.`,
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: `Models never delete data. The problem is evaluating on examples the model already memorised.`,
        },
      ],
    },
  ];
}

/**
 * Generates tailored fallback concepts with real interactive blanks and assertions
 * specifically tailored to the user's project domain.
 */
export function generateFallbackConceptsForGoal(goal: string): Concept[] {
  const lower = (goal || "").toLowerCase();
  const safeGoal = goal?.trim() || "Your AI Project";

  const isPlantOrAgri =
    lower.includes("plant") ||
    lower.includes("crop") ||
    lower.includes("leaf") ||
    lower.includes("leaves") ||
    lower.includes("botan") ||
    lower.includes("agri") ||
    lower.includes("tree") ||
    lower.includes("garden") ||
    lower.includes("farm") ||
    lower.includes("flora");

  // Facial Emotion / Face Expression Analyzer
  if (
    lower.includes("emotion") ||
    lower.includes("face") ||
    lower.includes("facial") ||
    lower.includes("expression") ||
    lower.includes("smile") ||
    lower.includes("mood")
  ) {
    return [
      {
        id: "problem-framing",
        title: `Facial Feature Extraction & Contract: ${safeGoal}`,
        prereqs: [],
        difficulty: 1,
        hook: `How do computer vision models convert raw facial landmark geometries into quantifiable features to predict emotions?`,
        explanationSummary: `Facial emotion recognition systems map geometric landmark distances (such as lip corner elevation AU12 and brow furrow AU4) as observable input features (X) to predict categorical emotional states (Y: Joy, Surprise, Anger, Sadness, Neutral).`,
        corePrinciple: `Action Units (AUs) represent fundamental muscle contractions. Mathematical model: f(action_units) -> emotion_probabilities. Target variables must never leak into inputs.`,
        whyItMatters: `Explicitly defining facial action unit features makes emotion classification invariant to lighting, skin tone, and camera sensor variations.`,
        buildStep: `Define the facial emotion model contract specifying task type, action unit features, and target emotions.`,
        starterCode: `# Step 1: Facial Emotion Architecture Contract for ${safeGoal}
# Fill in the blanks:
# 1. Specify task type: "classification" or "regression"
# 2. List the facial action unit features extracted from landmarks
# 3. Specify the target emotion classes

def define_face_emotion_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,                   # TODO: "classification" or "regression"
        "action_units": [___],              # TODO: list strings, e.g. "smile_curvature", "brow_furrow", "eye_aperture", "jaw_drop"
        "target_emotions": [___]            # TODO: list target emotion categories, e.g. "Joy", "Surprise", "Anger", "Neutral"
    }

print("Vision Spec:", define_face_emotion_spec())
`,
        solutionCode: `def define_face_emotion_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "classification",
        "action_units": ["smile_curvature", "brow_furrow", "eye_aperture", "jaw_drop"],
        "target_emotions": ["Joy", "Surprise", "Anger", "Neutral"]
    }

print("Vision Spec:", define_face_emotion_spec())
`,
        testAssertion: `spec = define_face_emotion_spec()
assert isinstance(spec, dict), "define_face_emotion_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'classification' or 'regression'."
assert task_type == "classification", f"Emotion recognition is a 'classification' task, got '{task_type}'"
units = spec.get("action_units", [])
assert isinstance(units, list) and len(units) > 0 and units != ["___"], "Blank 'action_units' is not filled in yet."
emotions = spec.get("target_emotions", [])
assert isinstance(emotions, list) and len(emotions) > 0 and emotions != ["___"], "Blank 'target_emotions' is not filled in yet."
print("Assertion Passed: Facial emotion specification contract verified!")
`,
        predictQuestion: {
          prompt: `For ${safeGoal}, why are facial action units (e.g. smile curvature, brow furrow) used instead of raw image pixel coordinates?`,
          options: [
            "Action units are invariant to camera distance and head size, providing scale-independent biometric signals.",
            "Raw pixel coordinates make code run backwards.",
            "Because machine learning cannot process numbers.",
            "To remove the mouth from the face.",
          ],
          correctIndex: 0,
          explanation: "Action units measure geometric muscle deformation relative to face size, making the model robust across different camera angles and distances.",
        },
        checkQuestion: {
          prompt: "What mathematical representation do we use for the input to our facial emotion classifier?",
          options: [
            "A normalized numerical feature vector representing facial landmark displacements.",
            "An uncompressed raw audio stream.",
            "A random word dictionary.",
            "A database backup file.",
          ],
          correctIndex: 0,
          explanation: "Computer vision classifiers transform geometric landmarks into normalized numerical feature vectors for matrix computation.",
        },
      },
      {
        id: "feature-engineering",
        title: `Action Unit Feature Normalization: ${safeGoal}`,
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `A user sitting close to a webcam has larger pixel distances than someone sitting 6 feet away. How do we make facial measurements distance-invariant?`,
        explanationSummary: `Feature normalization bounds facial landmark measurements to standardized ranges (e.g., -1.0 to +1.0 for lip curvature, 0.0 to 1.0 for brow furrow) so that camera distance does not distort emotion classification.`,
        corePrinciple: `Normalized AU = (measured_distance - baseline) / face_scale. Normalization ensures features operate on balanced numerical intervals.`,
        whyItMatters: `Without normalization, a subject moving closer to the camera would cause pixel distances to expand, leading the classifier to mistakenly detect exaggerated expressions.`,
        buildStep: `Implement normalize_action_unit to scale raw landmark displacements into normalized floating point values.`,
        starterCode: `# Step 2: Facial Landmark Normalization
# Fill in the blanks:
# 1. Normalize raw displacement by the reference face scale (inter-ocular distance)
# 2. Clamp the value between min_val and max_val using max() and min()

def normalize_action_unit(raw_displacement: float, face_scale: float, min_val: float = -1.0, max_val: float = 1.0) -> float:
    # Scale raw pixel distance by face scale to achieve distance-invariance
    scaled = raw_displacement / ___      # TODO: divide by which reference scale?
    # Clamp between min_val and max_val
    clamped = max(min_val, min(max_val, ___))  # TODO: clamp the scaled value
    return round(clamped, 3)

print("Smiling close-up:", normalize_action_unit(raw_displacement=45.0, face_scale=50.0))
print("Smiling far away:", normalize_action_unit(raw_displacement=18.0, face_scale=20.0))
`,
        solutionCode: `def normalize_action_unit(raw_displacement: float, face_scale: float, min_val: float = -1.0, max_val: float = 1.0) -> float:
    scaled = raw_displacement / face_scale
    clamped = max(min_val, min(max_val, scaled))
    return round(clamped, 3)

print("Smiling close-up:", normalize_action_unit(raw_displacement=45.0, face_scale=50.0))
print("Smiling far away:", normalize_action_unit(raw_displacement=18.0, face_scale=20.0))
`,
        testAssertion: `close_up = normalize_action_unit(45.0, 50.0)
far_away = normalize_action_unit(18.0, 20.0)
assert close_up == 0.9, f"Expected 0.9 for close-up smile, got {close_up}"
assert far_away == 0.9, f"Expected 0.9 for far-away smile, got {far_away}"
assert close_up == far_away, "Scale invariance failed: close-up and far-away identical smiles must yield identical normalized values!"
over_extended = normalize_action_unit(100.0, 50.0, -1.0, 1.0)
assert over_extended == 1.0, f"Clamping failed: expected 1.0, got {over_extended}"
print("Assertion Passed: Facial feature normalization operates with scale invariance!")
`,
        predictQuestion: {
          prompt: "If a person smiles with displacement 45px at 50px face width, and later with displacement 18px at 20px face width, what should their normalized smile scores be?",
          options: [
            "Identical (0.90 for both), because normalization divides by face width to cancel out camera distance.",
            "45px should score much higher because 45 > 18.",
            "Both should be 0.0 because pixels cannot be divided.",
            "18px should score higher because the person is farther.",
          ],
          correctIndex: 0,
          explanation: "Dividing by the face reference scale makes the feature scale-invariant: 45/50 = 0.90 and 18/20 = 0.90.",
        },
        checkQuestion: {
          prompt: "What mathematical property does feature clamping (bounding between -1.0 and 1.0) provide?",
          options: [
            "It prevents outlier landmark tracker glitches from producing explosive gradients or infinite logits.",
            "It changes the color of the webcam feed.",
            "It makes the computer shut down automatically.",
            "It deletes old photo files from disk.",
          ],
          correctIndex: 0,
          explanation: "Clamping ensures extreme values or tracking artifacts do not produce disproportionate logit scores during inference.",
        },
      },
      {
        id: "weights-scoring",
        title: `Linear Logit Scoring & Emotion Weights: ${safeGoal}`,
        prereqs: ["feature-engineering"],
        difficulty: 3,
        hook: `How does a machine learning model mathematically evaluate whether a combination of smile, brow furrow, and eye aperture indicates Joy, Surprise, or Anger?`,
        explanationSummary: `Each emotion class maintains learned weights for every facial action unit. A weighted linear sum (logit z = w1*smile + w2*brow + w3*eyes + w4*jaw + bias) scores how strongly the facial configuration aligns with each emotion.`,
        corePrinciple: `Logit formula: z = (W . X) + b. Positive weights increase the emotion likelihood, while negative weights penalize incompatible movements (e.g. brow furrow penalizes Joy).`,
        whyItMatters: `Calibrating weights ensures conflicting facial expressions are correctly disentangled (e.g. a wide smile with deeply furrowed brows vs a relaxed smile).`,
        buildStep: `Implement compute_emotion_logits to calculate class scores for Joy, Surprise, and Anger from normalized action units.`,
        starterCode: `# Step 3: Linear Emotion Logit Scoring
# Fill in the blanks:
# 1. Joy: high positive weight on smile, negative weight on brow_furrow
# 2. Surprise: high positive weight on eye_openness and jaw_drop
# 3. Anger: high positive weight on brow_furrow, negative weight on smile

def compute_emotion_logits(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    # Joy is driven strongly by smile curvature
    joy_score = (3.5 * ___) - (2.0 * brow) + 0.2            # TODO: which feature drives joy?
    # Surprise is driven by widened eyes and dropped jaw
    surprise_score = (2.8 * eyes) + (3.0 * ___) - (1.5 * brow)  # TODO: which feature indicates dropped mouth?
    # Anger is driven by brow furrow
    anger_score = (4.0 * ___) - (2.5 * smile) + 0.1         # TODO: which feature indicates furrowed brow?
    
    return {
        "Joy": round(joy_score, 3),
        "Surprise": round(surprise_score, 3),
        "Anger": round(anger_score, 3)
    }

print("Smiling face logits:", compute_emotion_logits(smile=0.85, brow=0.10, eyes=0.60, jaw=0.15))
print("Surprised face logits:", compute_emotion_logits(smile=0.05, brow=0.15, eyes=0.95, jaw=0.85))
`,
        solutionCode: `def compute_emotion_logits(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    joy_score = (3.5 * smile) - (2.0 * brow) + 0.2
    surprise_score = (2.8 * eyes) + (3.0 * jaw) - (1.5 * brow)
    anger_score = (4.0 * brow) - (2.5 * smile) + 0.1
    return {
        "Joy": round(joy_score, 3),
        "Surprise": round(surprise_score, 3),
        "Anger": round(anger_score, 3)
    }

print("Smiling face logits:", compute_emotion_logits(smile=0.85, brow=0.10, eyes=0.60, jaw=0.15))
print("Surprised face logits:", compute_emotion_logits(smile=0.05, brow=0.15, eyes=0.95, jaw=0.85))
`,
        testAssertion: `smile_logits = compute_emotion_logits(0.85, 0.10, 0.60, 0.15)
assert smile_logits["Joy"] > smile_logits["Surprise"], "Smiling face should score higher on Joy than Surprise"
assert smile_logits["Joy"] > smile_logits["Anger"], "Smiling face should score higher on Joy than Anger"

surp_logits = compute_emotion_logits(0.05, 0.15, 0.95, 0.85)
assert surp_logits["Surprise"] > surp_logits["Joy"], "Surprised face should score higher on Surprise than Joy"

anger_logits = compute_emotion_logits(-0.50, 0.90, 0.40, 0.10)
assert anger_logits["Anger"] > anger_logits["Joy"], "Furrowed brow should score higher on Anger than Joy"
print("Assertion Passed: Emotion scoring weights correctly discriminate distinct facial expressions!")
`,
        predictQuestion: {
          prompt: "Why does the Joy logit have a negative weight (-2.0) on the brow furrow feature?",
          options: [
            "Because genuine joy typically exhibits relaxed brows; a strong brow furrow contradicts happiness and suggests confusion or anger.",
            "Because negative numbers make code execute faster.",
            "To turn off the webcam.",
            "Because smiles cannot occur in daylight.",
          ],
          correctIndex: 0,
          explanation: "Negative weights penalize incompatible facial movements, helping the linear model suppress Joy when conflicting features like brow furrowing are present.",
        },
        checkQuestion: {
          prompt: "What is a 'logit' in machine learning classification?",
          options: [
            "An unnormalized raw scalar score produced by a linear combination of features and weights before activation.",
            "A log file stored on disk.",
            "A Python syntax error.",
            "A type of computer screen.",
          ],
          correctIndex: 0,
          explanation: "Logits are raw real-valued scores (z = W.X + b) that represent the model's confidence in each class prior to probability normalization.",
        },
      },
      {
        id: "decision-boundary",
        title: `Softmax Activation & Live Pipeline: ${safeGoal}`,
        prereqs: ["weights-scoring"],
        difficulty: 4,
        hook: `Logits can be any positive or negative number (-3.2, 5.8, etc.). How do we convert them into calibrated percentages that sum to 100%?`,
        explanationSummary: `The Softmax activation function exponentiates each class logit and normalizes by the sum of all exponents: P(Class_i) = exp(z_i) / sum(exp(z_j)). This guarantees all class probabilities are strictly positive and sum exactly to 1.0 (100%).`,
        corePrinciple: `Softmax turns arbitrary continuous logits into a valid categorical probability distribution. The class with the highest probability is chosen as the dominant emotion.`,
        whyItMatters: `Without Softmax, models cannot express calibrated multi-class uncertainties (e.g. 70% Joy, 20% Surprise, 10% Neutral) or apply decision thresholds.`,
        buildStep: `Implement predict_face_emotion to compute Softmax probabilities and classify the dominant emotion.`,
        starterCode: `# Step 4: Multi-Class Softmax Activation & Classification
# Fill in the blanks:
# 1. Compute exp(logit) for each emotion class using math.exp()
# 2. Divide each exp value by sum_exp to get valid probabilities summing to 1.0
# 3. Determine the dominant emotion using max()

import math

def predict_face_emotion(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    # 1. Compute linear logits
    joy_z = (3.5 * smile) - (2.0 * brow) + 0.2
    surp_z = (2.8 * eyes) + (3.0 * jaw) - (1.5 * brow)
    anger_z = (4.0 * brow) - (2.5 * smile) + 0.1
    neutral_z = 0.5 - abs(smile) - brow
    
    logits = {"Joy": joy_z, "Surprise": surp_z, "Anger": anger_z, "Neutral": neutral_z}
    
    # 2. Exponentiate logits
    exp_scores = {k: math.exp(v) for k, v in logits.items()}
    sum_exp = sum(exp_scores.values())
    
    # 3. Softmax probabilities: p_i = exp_i / sum_exp
    probabilities = {k: round(v / ___, 4) for k, v in exp_scores.items()}  # TODO: divide by which total sum?
    
    # 4. Find dominant emotion class
    dominant_emotion = max(probabilities, key=probabilities.get)
    confidence_pct = round(probabilities[dominant_emotion] * 100, 1)
    
    return {
        "dominant_emotion": dominant_emotion,
        "confidence": confidence_pct,
        "probabilities": probabilities
    }

print("Happy Face:", predict_face_emotion(smile=0.88, brow=0.05, eyes=0.60, jaw=0.20))
print("Surprised Face:", predict_face_emotion(smile=0.05, brow=0.10, eyes=0.95, jaw=0.85))
`,
        solutionCode: `import math

def predict_face_emotion(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    joy_z = (3.5 * smile) - (2.0 * brow) + 0.2
    surp_z = (2.8 * eyes) + (3.0 * jaw) - (1.5 * brow)
    anger_z = (4.0 * brow) - (2.5 * smile) + 0.1
    neutral_z = 0.5 - abs(smile) - brow
    logits = {"Joy": joy_z, "Surprise": surp_z, "Anger": anger_z, "Neutral": neutral_z}
    exp_scores = {k: math.exp(v) for k, v in logits.items()}
    sum_exp = sum(exp_scores.values())
    probabilities = {k: round(v / sum_exp, 4) for k, v in exp_scores.items()}
    dominant_emotion = max(probabilities, key=probabilities.get)
    confidence_pct = round(probabilities[dominant_emotion] * 100, 1)
    return {
        "dominant_emotion": dominant_emotion,
        "confidence": confidence_pct,
        "probabilities": probabilities
    }

print("Happy Face:", predict_face_emotion(smile=0.88, brow=0.05, eyes=0.60, jaw=0.20))
print("Surprised Face:", predict_face_emotion(smile=0.05, brow=0.10, eyes=0.95, jaw=0.85))
`,
        testAssertion: `res_joy = predict_face_emotion(0.88, 0.05, 0.60, 0.20)
assert res_joy["dominant_emotion"] == "Joy", f"Expected Joy, got {res_joy['dominant_emotion']}"
assert res_joy["confidence"] > 50.0, f"Expected confidence > 50%, got {res_joy['confidence']}%"

res_surp = predict_face_emotion(0.05, 0.10, 0.95, 0.85)
assert res_surp["dominant_emotion"] == "Surprise", f"Expected Surprise, got {res_surp['dominant_emotion']}"

probs_sum = sum(res_joy["probabilities"].values())
assert abs(probs_sum - 1.0) < 0.01, f"Softmax probabilities must sum to 1.0, got {probs_sum}"
print("Assertion Passed: Full facial emotion inference engine verified operational!")
`,
        predictQuestion: {
          prompt: "Why must multi-class classification probabilities sum to exactly 1.0 (100%)?",
          options: [
            "Because an observation must belong to mutually exclusive classes within the defined probability space.",
            "Because numbers larger than 1 break computer monitors.",
            "To save memory on the graphic card.",
            "It is not required; probabilities can sum to any number.",
          ],
          correctIndex: 0,
          explanation: "In standard single-label multi-class classification, classes are mutually exclusive, so the sum of all class probabilities over the outcome space must equal 1.0.",
        },
        checkQuestion: {
          prompt: "Once the inference pipeline passes assertion testing, where can you test it live with interactive facial action unit sliders?",
          options: [
            "In the 'Model Tester' tab with real-time AU sliders, SVG face visualizer, and Softmax charts.",
            "Nowhere, AI models cannot be tested interactively.",
            "By emailing the weights to a university.",
            "By clearing the browser cache.",
          ],
          correctIndex: 0,
          explanation: "The Model Tester tab lets you interactively adjust action unit sliders, test expression presets, and observe the live SVG facial avatar update in real time.",
        },
      },
    ];
  }

  // Agricultural Vision / Plant Disease Detector
  if (isPlantOrAgri) {
    return [
      {
        id: "problem-framing",
        title: `Agricultural Vision Formulation: ${safeGoal}`,
        prereqs: [],
        difficulty: 1,
        hook: `Before training AI to diagnose leaf diseases from photographs, what observable visual features are extracted from the leaf, and what target pathogen classes are we predicting?`,
        explanationSummary: `Agricultural computer vision establishes a strict input/output contract: observable visual symptoms (lesion surface area %, chlorophyll discoloration index, spot edge irregularity, canopy moisture) serve as inputs (X), and the botanical health status (Healthy, Powdery Mildew, Bacterial Blight, Rust Fungus) serves as the target output (Y).`,
        corePrinciple: `Supervised classification learns a mathematical mapping f(leaf_visual_features) -> disease_class. Target labels must never leak into input features.`,
        whyItMatters: `Clearly isolating visual features from ground truth labels prevents data leakage, ensuring the model generalizes to new crop fields under varying weather conditions.`,
        buildStep: `Define the plant disease vision specification dictionary with observed leaf features and target pathogen classes.`,
        starterCode: `# Step 1: Agricultural Vision Specification for ${safeGoal}
# Fill in the blanks:
# 1. Specify task type: "classification" or "regression"
# 2. List the observable visual features extracted from leaf imagery
# 3. State the primary target pathogen classes to diagnose

def define_plant_disease_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,               # TODO: "classification" or "regression"
        "visual_features": [___],       # TODO: list strings, e.g. "lesion_area_pct", "chlorophyll_discoloration", "spot_irregularity", "canopy_moisture"
        "target_pathogens": [___]       # TODO: list strings, e.g. "Healthy", "Powdery Mildew", "Bacterial Blight", "Rust Fungus"
    }

print("Plant Vision Spec:", define_plant_disease_spec())
`,
        solutionCode: `def define_plant_disease_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "classification",
        "visual_features": ["lesion_area_pct", "chlorophyll_discoloration", "spot_irregularity", "canopy_moisture"],
        "target_pathogens": ["Healthy", "Powdery Mildew", "Bacterial Blight", "Rust Fungus"]
    }

print("Plant Vision Spec:", define_plant_disease_spec())
`,
        testAssertion: `spec = define_plant_disease_spec()
assert isinstance(spec, dict), "define_plant_disease_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'classification' or 'regression'."
assert task_type == "classification", f"Plant disease detection is a 'classification' task, got '{task_type}'"
features = spec.get("visual_features", [])
assert isinstance(features, list), "'visual_features' must be a list of feature names"
assert len(features) > 0 and features != ["___"], "Blank 'visual_features' is not filled in yet."
pathogens = spec.get("target_pathogens", [])
assert isinstance(pathogens, list) and len(pathogens) > 0 and pathogens != ["___"], "Blank 'target_pathogens' is not filled in yet."
print("Assertion Passed: Plant disease vision specification contract verified!")
`,
        predictQuestion: {
          prompt: `For ${safeGoal}, why must the 'target_pathogens' never be included inside the 'visual_features' input list?`,
          options: [
            "Including target labels in the input causes target leakage, where the model memorizes answers without learning visual symptom patterns.",
            "Python deletes the file if any word repeats twice.",
            "Leaf images can only be saved in grayscale if target labels are present.",
            "Agricultural models can only process a single leaf per day.",
          ],
          correctIndex: 0,
          explanation: "Target leakage gives the model the answer during training, causing it to completely fail when evaluating unseen leaves in real crop fields.",
        },
        checkQuestion: {
          prompt: `In machine learning for plant pathology, what is the mathematical difference between classification and regression?`,
          options: [
            "Classification predicts discrete categories (e.g. Healthy vs Powdery Mildew), while regression predicts continuous numerical quantities (e.g. crop yield in kg).",
            "Classification only runs on mobile phones, regression only on servers.",
            "Regression works without any dataset.",
            "There is no difference between them.",
          ],
          correctIndex: 0,
          explanation: "Plant disease identification classifies leaves into discrete pathogen categories.",
        },
      },
      {
        id: "feature-engineering",
        title: "Leaf Visual Feature Normalization & Scaling",
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `Lesion area spans 0–100% while spot irregularity ranges from 0.01 to 0.95. Why must these visual measurements be scaled before optimizing model weights?`,
        explanationSummary: `When numerical inputs have vastly different scales, gradient descent oscillates erratically. Min-max normalization scales raw measurements into a standardized [0.0, 1.0] interval using: (x - min) / (max - min).`,
        corePrinciple: `Normalized Value = (x - min_val) / (max_val - min_val). Equalizing feature magnitude ensures balanced gradient steps.`,
        whyItMatters: `Without scaling, features with large numbers (like 100% lesion area) dominate weight updates, blinding the network to subtle but critical microscopic spot patterns.`,
        buildStep: `Implement normalize_leaf_feature to rescale raw visual leaf measurements into a normalized [0.0, 1.0] float.`,
        starterCode: `# Step 2: Leaf Visual Feature Scaling
# Formula: normalized = (value - min_val) / (max_val - min_val)

def normalize_leaf_feature(value: float, min_val: float, max_val: float) -> float:
    # Fill in the blanks:
    # 1. Compute the range: max_val - min_val
    # 2. Divide offset by range and clamp between 0.0 and 1.0
    feat_range = ___                            # TODO: max_val - min_val
    scaled = (value - min_val) / feat_range
    clamped = max(0.0, min(1.0, scaled))
    return round(clamped, 4)

# Test with 45% lesion area on a [0, 100] scale
print("Normalized Lesion:", normalize_leaf_feature(45.0, 0.0, 100.0))
`,
        solutionCode: `def normalize_leaf_feature(value: float, min_val: float, max_val: float) -> float:
    feat_range = max_val - min_val
    scaled = (value - min_val) / feat_range
    clamped = max(0.0, min(1.0, scaled))
    return round(clamped, 4)

print("Normalized Lesion:", normalize_leaf_feature(45.0, 0.0, 100.0))
`,
        testAssertion: `res = normalize_leaf_feature(45.0, 0.0, 100.0)
assert res == 0.45, f"Expected 0.45 for 45% lesion on [0, 100], got {res}"
res_edge = normalize_leaf_feature(110.0, 0.0, 100.0)
assert res_edge == 1.0, f"Expected clamped 1.0 for out-of-range value, got {res_edge}"
print("Assertion Passed: Leaf visual feature normalization verified!")
`,
        predictQuestion: {
          prompt: "If a leaf has 100% lesion coverage on a [0, 100] scale, what is its normalized value?",
          options: [
            "1.0000",
            "100.0000",
            "0.0000",
            "-1.0000",
          ],
          correctIndex: 0,
          explanation: "(100 - 0) / (100 - 0) = 1.0000. Min-max normalization maps the maximum observed value to exactly 1.0.",
        },
        checkQuestion: {
          prompt: "Why is feature scaling essential for neural networks processing visual leaf attributes?",
          options: [
            "It prevents large-scale numerical attributes from dominating gradients and destabilizing backpropagation.",
            "It automatically colors all images black and white.",
            "It prevents Python from running out of RAM.",
            "It increases image resolution from 720p to 4K.",
          ],
          correctIndex: 0,
          explanation: "Normalized features ensure loss surface contours are circular rather than elongated, allowing gradient descent to converge quickly.",
        },
      },
      {
        id: "prior-probability",
        title: "Crop Pathogen Prior & Base Rate Calibration",
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `If only 8% of plants in a healthy nursery harbor fungal spores, how does Bayes' rule ensure our detector does not trigger excessive false alarms?`,
        explanationSummary: `Prior probability P(Disease) anchors predictions to historical incidence rates. When disease prevalence is rare, a naive model that ignores base rates will generate massive false positive alarm rates.`,
        corePrinciple: `Prior P(Disease) = infected_count / total_population. The prior acts as an anchor before observing leaf visual evidence.`,
        whyItMatters: `Commercial farm managers cannot afford to quarantine entire crop fields due to false positive alerts; incorporating agronomic base rates ensures balanced decision support.`,
        buildStep: `Implement calculate_pathogen_prior to compute the empirical prior probability from nursery survey records.`,
        starterCode: `# Step 3: Pathogen Prior Probability
# Formula: prior = infected_samples / total_inspected

def calculate_pathogen_prior(infected_samples: int, total_inspected: int) -> float:
    # Fill in the blanks:
    # 1. Guard against division by zero
    # 2. Divide infected by total and round to 4 decimals
    if total_inspected <= 0:
        return 0.0
    prior = ___ / ___                           # TODO: compute infected / total
    return round(prior, 4)

print("Greenhouse Prior:", calculate_pathogen_prior(16, 200))
`,
        solutionCode: `def calculate_pathogen_prior(infected_samples: int, total_inspected: int) -> float:
    if total_inspected <= 0:
        return 0.0
    prior = infected_samples / total_inspected
    return round(prior, 4)

print("Greenhouse Prior:", calculate_pathogen_prior(16, 200))
`,
        testAssertion: `prior = calculate_pathogen_prior(16, 200)
assert prior == 0.08, f"Expected 0.08 for 16/200, got {prior}"
assert calculate_pathogen_prior(0, 100) == 0.0, "Zero infected should yield 0.0"
print("Assertion Passed: Pathogen prior calculation verified!")
`,
        predictQuestion: {
          prompt: "If 25 out of 500 inspected grapevine leaves have powdery mildew, what is the pathogen prior rate?",
          options: [
            "0.05 (5%)",
            "0.50 (50%)",
            "0.25 (25%)",
            "0.005 (0.5%)",
          ],
          correctIndex: 0,
          explanation: "25 / 500 = 0.05 (5% baseline prior probability).",
        },
        checkQuestion: {
          prompt: "Why must plant disease AI models account for base rates?",
          options: [
            "In low-prevalence outbreaks, ignoring base rates leads to severe false-positive over-reporting.",
            "Prior probabilities make Python run without an operating system.",
            "Because leaves only grow in prime numbers.",
            "To delete corrupted photos from camera SD cards.",
          ],
          correctIndex: 0,
          explanation: "Bayesian reasoning combines the prior prevalence with observed leaf symptoms to compute true posterior infection likelihood.",
        },
      },
      {
        id: "decision-boundary",
        title: "Visual Logit Scoring for Plant Diseases",
        prereqs: ["feature-engineering"],
        difficulty: 3,
        hook: `How does a machine learning model combine lesion area, discoloration, and spot sharpness into a single decision score?`,
        explanationSummary: `A linear decision score (logit z) multiplies each normalized leaf feature by a learned weight vector and adds a bias: z = w1*lesion + w2*discoloration + w3*sharpness + bias.`,
        corePrinciple: `Logit z = sum(w_i * x_i) + b. Positive weights amplify disease evidence, while the bias calibrates baseline susceptibility.`,
        whyItMatters: `Visual symptoms reinforce each other: widespread lesion coverage combined with yellow chlorotic halos strongly signals virulent pathogen infection.`,
        buildStep: `Implement compute_leaf_pathogen_logit to calculate the weighted symptom sum.`,
        starterCode: `# Step 4: Visual Logit Calculation
# Formula: z = (w_lesion * x1) + (w_discolor * x2) + (w_sharp * x3) + bias

def compute_leaf_pathogen_logit(norm_lesion: float, norm_discolor: float, norm_sharp: float) -> float:
    # Agronomic vision weights learned from field datasets
    w_lesion = 2.40
    w_discolor = 1.80
    w_sharp = 1.20
    bias = -1.60

    # Fill in the blank: compute linear combination
    logit = ___                                 # TODO: sum weighted features + bias
    return round(logit, 4)

# Test with severe leaf blight symptoms: lesion=0.8, discolor=0.7, sharp=0.9
print("Severe Blight Logit:", compute_leaf_pathogen_logit(0.8, 0.7, 0.9))
`,
        solutionCode: `def compute_leaf_pathogen_logit(norm_lesion: float, norm_discolor: float, norm_sharp: float) -> float:
    w_lesion = 2.40
    w_discolor = 1.80
    w_sharp = 1.20
    bias = -1.60
    logit = (w_lesion * norm_lesion) + (w_discolor * norm_discolor) + (w_sharp * norm_sharp) + bias
    return round(logit, 4)

print("Severe Blight Logit:", compute_leaf_pathogen_logit(0.8, 0.7, 0.9))
`,
        testAssertion: `z = compute_leaf_pathogen_logit(0.8, 0.7, 0.9)
expected = round((2.4 * 0.8) + (1.8 * 0.7) + (1.2 * 0.9) - 1.6, 4)
assert z == expected, f"Expected {expected}, got {z}"
z_clean = compute_leaf_pathogen_logit(0.0, 0.0, 0.0)
assert z_clean == -1.6, f"Expected bias -1.6 for pristine leaf, got {z_clean}"
print("Assertion Passed: Leaf pathogen logit calculation verified!")
`,
        predictQuestion: {
          prompt: "What will the logit score be for a completely pristine leaf where all normalized symptoms are 0.0?",
          options: [
            "Equal to the negative bias (-1.60), representing strong baseline resistance to infection.",
            "Positive infinity.",
            "Zero always.",
            "It will throw a division by zero exception.",
          ],
          correctIndex: 0,
          explanation: "When all features are 0.0, the sum of weights*features is 0.0, leaving only the bias term (-1.60).",
        },
        checkQuestion: {
          prompt: "What role does the bias term play in plant disease scoring?",
          options: [
            "It shifts the decision boundary independently of input symptoms, capturing baseline healthy resilience.",
            "It flips the image orientation 180 degrees.",
            "It deletes features with low correlation.",
            "It encrypts the model weights for security.",
          ],
          correctIndex: 0,
          explanation: "The bias allows the model to shift the activation function left or right along the input axis.",
        },
      },
      {
        id: "loss-functions",
        title: "Sigmoid Probability & Cross-Entropy Loss",
        prereqs: ["decision-boundary"],
        difficulty: 3,
        hook: `A raw logit score of +2.8 indicates severe symptoms, but farmers need an actionable probability (e.g. 94% chance of blight). How do we convert unbounded logits into valid probabilities?`,
        explanationSummary: `The Sigmoid activation sigma(z) = 1 / (1 + exp(-z)) maps any real number into the open interval (0, 1). Binary Cross-Entropy measures the loss between predicted probability p and true label y in {0, 1}.`,
        corePrinciple: `P(Disease) = 1 / (1 + exp(-z)). Cross-Entropy Loss L = -[y * log(p) + (1 - y) * log(1 - p)]. Confident wrong predictions are penalized with extreme loss.`,
        whyItMatters: `Cross-entropy provides smooth non-zero gradients across all probability values, driving rapid weight correction when the detector mistakes a blighted leaf for healthy foliage.`,
        buildStep: `Implement sigmoid activation and binary cross-entropy loss in Python.`,
        starterCode: `import math

# Step 5: Sigmoid Activation & Binary Cross-Entropy
def leaf_disease_probability(logit: float) -> float:
    # Fill in the blank: Sigmoid formula: 1 / (1 + exp(-z))
    p = ___                                     # TODO: 1.0 / (1.0 + math.exp(-logit))
    return round(p, 4)

def binary_cross_entropy(y_true: int, y_pred: float) -> float:
    # Clamp y_pred to prevent log(0) math domain error
    eps = 1e-12
    p = max(eps, min(1.0 - eps, y_pred))
    # Fill in the blank: -[y*log(p) + (1-y)*log(1-p)]
    loss = ___                                  # TODO: -(y_true * math.log(p) + (1 - y_true) * math.log(1.0 - p))
    return round(loss, 4)

prob = leaf_disease_probability(2.65)
print("Infection Probability:", prob)
print("Loss on Diseased Leaf (y=1):", binary_cross_entropy(1, prob))
`,
        solutionCode: `import math

def leaf_disease_probability(logit: float) -> float:
    p = 1.0 / (1.0 + math.exp(-logit))
    return round(p, 4)

def binary_cross_entropy(y_true: int, y_pred: float) -> float:
    eps = 1e-12
    p = max(eps, min(1.0 - eps, y_pred))
    loss = -(y_true * math.log(p) + (1 - y_true) * math.log(1.0 - p))
    return round(loss, 4)

prob = leaf_disease_probability(2.65)
print("Infection Probability:", prob)
print("Loss on Diseased Leaf (y=1):", binary_cross_entropy(1, prob))
`,
        testAssertion: `p = leaf_disease_probability(0.0)
assert p == 0.5, f"Sigmoid(0) must equal 0.5, got {p}"
p_pos = leaf_disease_probability(5.0)
assert p_pos > 0.99, "Large positive logit should yield probability near 1.0"
loss_good = binary_cross_entropy(1, 0.99)
loss_bad = binary_cross_entropy(1, 0.01)
assert loss_bad > loss_good, "Wrong prediction should produce significantly higher loss"
print("Assertion Passed: Sigmoid and Cross-Entropy verified!")
`,
        predictQuestion: {
          prompt: "What happens to the cross-entropy loss if the true label is 1 (Blighted), but our model outputs p = 0.001 (confident it is healthy)?",
          options: [
            "The loss explodes to a very large positive number (-log(0.001) approx 6.9), heavily penalizing the mistake.",
            "The loss becomes negative.",
            "The loss drops to zero.",
            "The model restarts the training computer.",
          ],
          correctIndex: 0,
          explanation: "-log(p) approaches infinity as p approaches 0 when the ground truth label is 1.",
        },
        checkQuestion: {
          prompt: "Why is epsilon clipping (e.g. 1e-12) used when computing Cross-Entropy?",
          options: [
            "To prevent math domain errors from calculating log(0), which is undefined (-infinity).",
            "To speed up GPU clock speeds.",
            "To remove watermarks from leaf photos.",
            "To reduce image storage file sizes.",
          ],
          correctIndex: 0,
          explanation: "log(0) is mathematically undefined and throws a runtime exception in Python.",
        },
      },
      {
        id: "gradient-descent",
        title: "Weight Optimization via Gradient Descent",
        prereqs: ["loss-functions"],
        difficulty: 4,
        hook: `When our detector misclassifies a powdery mildew infection, how does calculus compute the exact adjustment needed for each symptom weight?`,
        explanationSummary: `Gradient descent computes the partial derivative of loss with respect to each weight: dL/dw = (p - y) * x. Each weight is updated opposite to the gradient: w_new = w_old - (learning_rate * gradient).`,
        corePrinciple: `Weight Update: w_new = w_old - alpha * (p - y) * x. When error (p - y) is positive (overprediction), weights decrease; when negative (underprediction), weights increase.`,
        whyItMatters: `Gradient descent automates parameter optimization across thousands of leaf training samples without requiring hand-tuned heuristics.`,
        buildStep: `Implement update_leaf_weights to perform a single gradient step.`,
        starterCode: `# Step 6: Gradient Descent Step on Leaf Weights
# Formula: w_new = w - (learning_rate * gradient)
# where gradient = (p - y) * x

def update_leaf_weights(weights: list, features: list, y_true: int, p_pred: float, lr: float = 0.1) -> list:
    error = p_pred - y_true
    new_weights = []
    # Fill in the blanks:
    # Compute gradient for each feature and update weight
    for w, x in zip(weights, features):
        grad = error * x
        w_updated = ___                         # TODO: w - (lr * grad)
        new_weights.append(round(w_updated, 4))
    return new_weights

print("Updated Weights:", update_leaf_weights([2.0, 1.5], [0.8, 0.6], y_true=1, p_pred=0.4, lr=0.1))
`,
        solutionCode: `def update_leaf_weights(weights: list, features: list, y_true: int, p_pred: float, lr: float = 0.1) -> list:
    error = p_pred - y_true
    new_weights = []
    for w, x in zip(weights, features):
        grad = error * x
        w_updated = w - (lr * grad)
        new_weights.append(round(w_updated, 4))
    return new_weights

print("Updated Weights:", update_leaf_weights([2.0, 1.5], [0.8, 0.6], y_true=1, p_pred=0.4, lr=0.1))
`,
        testAssertion: `w_up = update_leaf_weights([2.0], [1.0], y_true=1, p_pred=0.5, lr=0.1)
assert w_up[0] == 2.05, f"Expected 2.05, got {w_up[0]}"
print("Assertion Passed: Gradient descent update verified!")
`,
        predictQuestion: {
          prompt: "If our model predicts p = 0.3 for a severely diseased leaf (y = 1), what direction will the weight update move?",
          options: [
            "Weights will increase (error is -0.7, so subtracting negative gradient adds to the weights).",
            "Weights will decrease to zero.",
            "Weights will stay unchanged.",
            "Weights will turn into string variables.",
          ],
          correctIndex: 0,
          explanation: "When the model underpredicts (p < y), the error (p - y) is negative. Subtracting lr * negative_grad increases the weights to boost future sensitivity.",
        },
        checkQuestion: {
          prompt: "What happens if the learning rate alpha is set excessively high (e.g. alpha = 100.0)?",
          options: [
            "Weights oscillate violently and diverge, causing loss to explode.",
            "The model trains in 1 millisecond perfectly.",
            "The computer screen starts flickering green.",
            "Training data deletes itself from disk.",
          ],
          correctIndex: 0,
          explanation: "Excessively high learning rates overshoot the minimum of the loss landscape and diverge.",
        },
      },
      {
        id: "bias-variance",
        title: "Agronomic Disease Triage & Quarantine Threshold",
        prereqs: ["loss-functions"],
        difficulty: 3,
        hook: `A default 0.50 threshold treats false alarms and missed outbreaks equally. In agriculture, missing a contagious fungal infection is disastrous. How do we tune decision thresholds for farm protection?`,
        explanationSummary: `Tuning the classification decision threshold allows agronomists to optimize the precision-recall tradeoff. Lowering the threshold to 0.35 increases Sensitivity (Recall), catching 99% of early crop infections.`,
        corePrinciple: `Threshold Decision: If P(Disease) >= threshold -> ACTIONABLE INFECTION ALERT. Lower thresholds prioritize recall; higher thresholds prioritize precision.`,
        whyItMatters: `Catching leaf blight when only 2 plants are infected saves an entire field; waiting for 50%+ confidence risks catastrophic harvest losses.`,
        buildStep: `Implement triage_crop_disease to return structured agronomic action recommendations.`,
        starterCode: `# Step 7: Agronomic Disease Triage
# Decision logic based on calibrated infection probability and threshold

def triage_crop_disease(prob: float, threshold: float = 0.35) -> dict:
    # Fill in the blanks:
    # 1. Determine infection status: True if prob >= threshold else False
    # 2. Assign action: "QUARANTINE_AND_SPRAY", "MONITOR_FIELD", or "CLEAN_HEALTHY"
    is_infected = ___                           # TODO: prob >= threshold
    if prob >= 0.70:
        action = "QUARANTINE_AND_SPRAY"
        severity = "HIGH"
    elif prob >= threshold:
        action = "MONITOR_FIELD"
        severity = "MODERATE"
    else:
        action = "CLEAN_HEALTHY"
        severity = "LOW"
    return {"infected": is_infected, "action": action, "severity": severity, "probability": prob}

print("Crop Triage:", triage_crop_disease(0.42, threshold=0.35))
`,
        solutionCode: `def triage_crop_disease(prob: float, threshold: float = 0.35) -> dict:
    is_infected = prob >= threshold
    if prob >= 0.70:
        action = "QUARANTINE_AND_SPRAY"
        severity = "HIGH"
    elif prob >= threshold:
        action = "MONITOR_FIELD"
        severity = "MODERATE"
    else:
        action = "CLEAN_HEALTHY"
        severity = "LOW"
    return {"infected": is_infected, "action": action, "severity": severity, "probability": prob}

print("Crop Triage:", triage_crop_disease(0.42, threshold=0.35))
`,
        testAssertion: `res = triage_crop_disease(0.42, threshold=0.35)
assert res["infected"] is True, "Prob 0.42 should exceed 0.35 threshold"
assert res["action"] == "MONITOR_FIELD", f"Expected MONITOR_FIELD, got {res['action']}"
res_clean = triage_crop_disease(0.15, threshold=0.35)
assert res_clean["infected"] is False, "Prob 0.15 should be below threshold"
assert res_clean["action"] == "CLEAN_HEALTHY"
print("Assertion Passed: Agronomic disease triage verified!")
`,
        predictQuestion: {
          prompt: "What is the primary operational tradeoff when lowering the agricultural alert threshold from 0.50 to 0.35?",
          options: [
            "Higher Recall (fewer missed fungal infections) at the cost of slightly lower Precision (more false positive alerts).",
            "The model runs in reverse.",
            "Images take twice as long to load.",
            "All plants automatically turn into trees.",
          ],
          correctIndex: 0,
          explanation: "Lowering the decision threshold catches more true positives (high recall) but accepts more false alarms (lower precision).",
        },
        checkQuestion: {
          prompt: "Why is high recall prioritized in crop pathogen detection systems?",
          options: [
            "Because an undetected pathogen can spread exponentially and wipe out an entire farm season.",
            "Because high precision causes camera lenses to blur.",
            "Because agricultural drones cannot fly at 0.50.",
            "Because Python runs faster with high recall.",
          ],
          correctIndex: 0,
          explanation: "The asymmetric cost of a false negative (missed contagion) far exceeds the cost of a false alarm (routine visual reinspection).",
        },
      },
      {
        id: "inference-pipeline",
        title: "Live End-to-End Plant Disease Inference Pipeline",
        prereqs: ["bias-variance"],
        difficulty: 4,
        hook: `Now assemble everything we built into a complete production pipeline: from raw leaf measurements to normalized features, logit scoring, probability mapping, and agronomic triage report!`,
        explanationSummary: `An end-to-end vision inference pipeline ingests raw leaf attributes (lesion %, discoloration, spot sharpness, moisture), applies feature scaling, computes logits, applies sigmoid activation, and generates a structured agronomic diagnostic report.`,
        corePrinciple: `Complete Pipeline: Raw Leaf -> normalize_leaf_feature() -> compute_leaf_pathogen_logit() -> sigmoid() -> triage_crop_disease() -> Actionable Agronomic Report.`,
        whyItMatters: `Packaging modular functions into a unified pipeline allows testing in the browser 'Model Tester' tab with real-time sliders and instant diagnostic feedback.`,
        buildStep: `Implement predict_plant_disease to integrate all pipeline stages into a unified function.`,
        starterCode: `import math

# Step 8: Unified Plant Disease Inference Pipeline
def predict_plant_disease(lesion_area_pct: float, discoloration: float, spot_sharpness: float, moisture_pct: float = 50.0, threshold: float = 0.35) -> dict:
    # 1. Feature normalization
    norm_lesion = max(0.0, min(1.0, lesion_area_pct / 100.0))
    norm_disc = max(0.0, min(1.0, discoloration))
    norm_sharp = max(0.0, min(1.0, spot_sharpness))
    
    # 2. Logit calculation
    logit = (2.40 * norm_lesion) + (1.80 * norm_disc) + (1.20 * norm_sharp) - 1.60
    
    # 3. Sigmoid probability
    prob = round(1.0 / (1.0 + math.exp(-logit)), 4)
    
    # 4. Agronomic triage
    is_infected = prob >= threshold
    if prob >= 0.75:
        diagnosis = "Powdery Mildew / Blight (Severe)"
        action = "Quarantine block & apply targeted bio-fungicide"
    elif prob >= threshold:
        action = "Inspect canopy & schedule secondary moisture check"
        diagnosis = "Early Pathogen Infection Detected"
    else:
        diagnosis = "Healthy Foliage Baseline"
        action = "Routine surveillance"
        
    return {
        "lesion_area_pct": lesion_area_pct,
        "discoloration": discoloration,
        "infection_probability": prob,
        "is_infected": is_infected,
        "diagnosis": diagnosis,
        "action": action
    }

print("Healthy Leaf:", predict_plant_disease(lesion_area_pct=0.0, discoloration=0.04, spot_sharpness=0.02))
print("Diseased Leaf:", predict_plant_disease(lesion_area_pct=65.0, discoloration=0.82, spot_sharpness=0.75))
`,
        solutionCode: `import math

def predict_plant_disease(lesion_area_pct: float, discoloration: float, spot_sharpness: float, moisture_pct: float = 50.0, threshold: float = 0.35) -> dict:
    norm_lesion = max(0.0, min(1.0, lesion_area_pct / 100.0))
    norm_disc = max(0.0, min(1.0, discoloration))
    norm_sharp = max(0.0, min(1.0, spot_sharpness))
    
    logit = (2.40 * norm_lesion) + (1.80 * norm_disc) + (1.20 * norm_sharp) - 1.60
    prob = round(1.0 / (1.0 + math.exp(-logit)), 4)
    
    is_infected = prob >= threshold
    if prob >= 0.75:
        diagnosis = "Powdery Mildew / Blight (Severe)"
        action = "Quarantine block & apply targeted bio-fungicide"
    elif prob >= threshold:
        action = "Inspect canopy & schedule secondary moisture check"
        diagnosis = "Early Pathogen Infection Detected"
    else:
        diagnosis = "Healthy Foliage Baseline"
        action = "Routine surveillance"
        
    return {
        "lesion_area_pct": lesion_area_pct,
        "discoloration": discoloration,
        "infection_probability": prob,
        "is_infected": is_infected,
        "diagnosis": diagnosis,
        "action": action
    }

print("Healthy Leaf:", predict_plant_disease(lesion_area_pct=0.0, discoloration=0.04, spot_sharpness=0.02))
print("Diseased Leaf:", predict_plant_disease(lesion_area_pct=65.0, discoloration=0.82, spot_sharpness=0.75))
`,
        testAssertion: `res_clean = predict_plant_disease(0.0, 0.02, 0.01)
assert res_clean["is_infected"] is False, "Clean leaf should be marked healthy"
res_sick = predict_plant_disease(75.0, 0.85, 0.90)
assert res_sick["is_infected"] is True, "High lesion leaf must be classified as infected"
assert "Blight" in res_sick["diagnosis"] or "Severe" in res_sick["diagnosis"]
print("Assertion Passed: Full plant disease inference pipeline verified!")
`,
        predictQuestion: {
          prompt: "What is the primary advantage of bundling normalization, logit computation, and threshold triage into a single inference pipeline function?",
          options: [
            "It creates an atomic, reproducible inference endpoint ready for deployment to edge devices or web apps.",
            "It deletes intermediate variables so code cannot be read.",
            "It turns Python into JavaScript.",
            "It allows the program to run without memory.",
          ],
          correctIndex: 0,
          explanation: "Encapsulating the full pipeline ensures raw real-world inputs undergo the exact same preprocessing and transformation used during model training.",
        },
        checkQuestion: {
          prompt: "Where can you interactively test your plant disease model pipeline in Socrates?",
          options: [
            "In the 'Model Tester' tab using live leaf symptom sliders, preset buttons, and visual feedback.",
            "Nowhere, AI models cannot be tested interactively.",
            "By printing out the Python script on physical paper.",
            "By clearing the browser history.",
          ],
          correctIndex: 0,
          explanation: "The Model Tester tab lets you interactively adjust lesion area, discoloration, and spot sharpness sliders to test the model live in the browser.",
        },
      },
    ];
  }

  // Medical / Health / Disease / clinical — domain-aware, goal-specific
  if (
    !isPlantOrAgri &&
    (lower.includes("diabet") ||
      (lower.includes("disease") && !isPlantOrAgri) ||
      lower.includes("cancer") ||
      lower.includes("medical") ||
      lower.includes("patient") ||
      (lower.includes("health") && !isPlantOrAgri) ||
      lower.includes("clinic") ||
      lower.includes("heart") ||
      lower.includes("tumor") ||
      lower.includes("glucose") ||
      lower.includes("blood pressure") ||
      lower.includes("hypertension") ||
      (lower.includes("diagnosis") && !isPlantOrAgri))
  ) {
    // Detect specific medical sub-domain
    const isHeartRate =
      lower.includes("heart rate") ||
      lower.includes("bpm") ||
      lower.includes("pulse") ||
      lower.includes("resting heart") ||
      lower.includes("cardiac rate");

    const isHeartDisease =
      !isHeartRate &&
      (lower.includes("heart disease") ||
        lower.includes("heart attack") ||
        lower.includes("coronary") ||
        lower.includes("cardiovascular") ||
        lower.includes("myocardial"));

    const isDiabetes =
      lower.includes("diabet") ||
      lower.includes("glucose") ||
      lower.includes("insulin") ||
      lower.includes("blood sugar");

    const isCancer =
      lower.includes("cancer") ||
      lower.includes("tumor") ||
      lower.includes("malignant") ||
      lower.includes("biopsy");

    const isBloodPressure =
      lower.includes("blood pressure") ||
      lower.includes("hypertension") ||
      lower.includes("systolic") ||
      lower.includes("bp prediction");

    let medFeatures: string[];
    let medTarget: string;
    let medTaskType: string;
    let medSampleRows: string;
    let medSklearnModel: string;
    let medTestSamples: string;
    let medPredictVarName: string;

    if (isHeartRate) {
      medFeatures = ["age", "weight_kg", "height_cm", "activity_level", "sleep_hours", "stress_score"];
      medTarget = "resting_heart_rate_bpm";
      medTaskType = "regression";
      medSampleRows = `# [age, weight_kg, height_cm, activity(1-5), sleep_hrs, stress(1-10)] -> resting_hr_bpm
X_train = [
    [25, 70,  175, 4, 7.5, 3],
    [45, 90,  170, 2, 6.0, 7],
    [30, 65,  168, 5, 8.0, 2],
    [55, 100, 165, 1, 5.5, 9],
    [35, 75,  180, 3, 7.0, 5],
    [22, 58,  162, 5, 8.5, 2],
]
y_train = [62, 85, 58, 92, 72, 55]  # resting BPM`;
      medSklearnModel = `from sklearn.ensemble import GradientBoostingRegressor
model = GradientBoostingRegressor(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
      medTestSamples = `new_patients = [
    [40, 80, 172, 3, 6.5, 6],
    [28, 62, 170, 5, 8.0, 2],
]`;
      medPredictVarName = "new_patients";
    } else if (isDiabetes) {
      medFeatures = ["glucose_mg_dl", "bmi", "age", "blood_pressure_mmhg", "insulin_mu_ml", "skin_thickness_mm"];
      medTarget = "diabetes_positive";
      medTaskType = "classification";
      medSampleRows = `# [glucose, bmi, age, blood_pressure, insulin, skin_thickness] -> diabetes(0=No,1=Yes)
X_train = [
    [150, 32.0, 50, 88, 180, 35],
    [85,  20.0, 25, 70,  30, 20],
    [165, 35.5, 58, 92, 220, 40],
    [90,  22.5, 30, 72,  40, 22],
    [140, 30.0, 45, 85, 160, 33],
    [75,  19.0, 22, 68,  25, 18],
]
y_train = [1, 0, 1, 0, 1, 0]  # 1=Diabetic, 0=Non-diabetic`;
      medSklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
      medTestSamples = `new_patients = [
    [155, 33.0, 52, 90, 190, 36],
    [88,  21.0, 27, 71,  35, 21],
]`;
      medPredictVarName = "new_patients";
    } else if (isHeartDisease) {
      medFeatures = ["age", "cholesterol_mg_dl", "resting_bp_mmhg", "max_heart_rate", "oldpeak_st", "num_vessels"];
      medTarget = "heart_disease_positive";
      medTaskType = "classification";
      medSampleRows = `# [age, cholesterol, resting_bp, max_hr, oldpeak, vessels] -> heart_disease(0=No,1=Yes)
X_train = [
    [63, 233, 145, 150, 2.3, 0],
    [37, 250, 130, 187, 3.5, 0],
    [41, 204, 130, 172, 1.4, 0],
    [56, 236, 120, 178, 0.8, 0],
    [57, 354, 140, 163, 0.6, 0],
    [57, 192, 148, 148, 0.4, 1],
]
y_train = [0, 1, 0, 0, 1, 1]  # 1=Heart disease present`;
      medSklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
      medTestSamples = `new_patients = [
    [55, 280, 138, 155, 1.5, 1],
    [40, 195, 125, 180, 0.5, 0],
]`;
      medPredictVarName = "new_patients";
    } else if (isCancer) {
      medFeatures = ["radius_mean", "texture_mean", "perimeter_mean", "area_mean", "smoothness_mean", "compactness_mean"];
      medTarget = "malignant";
      medTaskType = "classification";
      medSampleRows = `# Tumour cell measurements -> malignant(0=Benign,1=Malignant)
X_train = [
    [17.99, 10.38, 122.8, 1001.0, 0.118, 0.278],
    [13.54, 14.36,  87.5,  566.3, 0.098, 0.105],
    [20.57, 17.77, 132.9, 1326.0, 0.085, 0.079],
    [11.42, 20.38,  77.6,  386.1, 0.142, 0.284],
    [15.22, 30.62, 103.4,  716.9, 0.105, 0.208],
    [12.46, 24.04,  83.97, 475.9, 0.119, 0.240],
]
y_train = [1, 0, 1, 1, 1, 0]  # 1=Malignant, 0=Benign`;
      medSklearnModel = `from sklearn.svm import SVC
model = SVC(kernel='rbf', random_state=42)
model.fit(X_train, y_train)`;
      medTestSamples = `new_tumours = [
    [18.5, 12.0, 118.0,  950.0, 0.110, 0.260],
    [12.0, 15.0,  80.0,  430.0, 0.092, 0.095],
]`;
      medPredictVarName = "new_tumours";
    } else if (isBloodPressure) {
      medFeatures = ["age", "weight_kg", "bmi", "sodium_intake_mg", "activity_hrs_per_wk", "stress_score"];
      medTarget = "systolic_bp_mmhg";
      medTaskType = "regression";
      medSampleRows = `# [age, weight_kg, bmi, sodium_mg, activity_hrs, stress(1-10)] -> systolic_bp
X_train = [
    [35, 70, 22.0, 1800, 5, 3],
    [55, 95, 31.0, 3200, 1, 8],
    [45, 80, 26.5, 2400, 3, 5],
    [28, 60, 19.8, 1500, 6, 2],
    [65, 100, 34.0, 3500, 0, 9],
    [40, 75, 24.2, 2100, 4, 4],
]
y_train = [115, 155, 132, 108, 168, 122]  # systolic blood pressure (mmHg)`;
      medSklearnModel = `from sklearn.linear_model import Ridge
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)`;
      medTestSamples = `new_patients = [
    [50, 88, 28.5, 2800, 2, 7],
    [32, 65, 21.0, 1700, 5, 3],
]`;
      medPredictVarName = "new_patients";
    } else {
      medFeatures = ["age", "bmi", "systolic_bp", "cholesterol_mg_dl", "activity_score"];
      medTarget = "health_risk_level";
      medTaskType = "classification";
      medSampleRows = `# [age, bmi, systolic_bp, cholesterol, activity(1-5)] -> health_risk(0=Low,1=High)
X_train = [
    [35, 22.0, 115, 180, 4],
    [58, 33.0, 155, 260, 1],
    [42, 26.5, 128, 200, 3],
    [29, 19.8, 108, 160, 5],
    [65, 35.0, 165, 285, 0],
    [47, 24.0, 122, 195, 3],
]
y_train = [0, 1, 0, 0, 1, 0]  # 1=High risk, 0=Low risk`;
      medSklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
      medTestSamples = `new_patients = [
    [55, 30.0, 148, 240, 1],
    [30, 21.5, 112, 170, 4],
]`;
      medPredictVarName = "new_patients";
    }

    const medFeaturesStr = JSON.stringify(medFeatures);
    const medFeaturesComment = medFeatures.map((f, i) => `# ${i}: ${f}`).join("\n");
    const isRegression = medTaskType === "regression";

    return [
      {
        id: "problem-framing",
        title: `Define the Problem: ${safeGoal}`,
        prereqs: [],
        difficulty: 1,
        hook: `Before writing ANY code: what data goes IN to the model, and what does it predict? For "${safeGoal}", the model reads measurements that you already know, and predicts something you want to find out.`,
        explanationSummary: `Think of training a model like teaching a new employee. You show them 100 past examples: "On THIS day the readings were [${medFeatures.slice(0,2).join(", ")}, ...] — and the known result was ${medTarget}." After 100 examples they learn the pattern. That is machine learning.\n\nKEY TERMS (no jargon):\n• FEATURE = a measurement you already have (INPUT to the model)\n• TARGET = the thing you want to predict (OUTPUT of the model)\n\nFor ${safeGoal}: Features = [${medFeatures.slice(0,2).join(", ")}, ...]. Target = ${medTarget}.`,
        corePrinciple: `🎓 Plain English: Features are facts you ALREADY KNOW. Target is the unknown thing you want to FIND OUT. Like a doctor who already knows your age, weight, and test results (features) and needs to predict your diagnosis (target).`,
        whyItMatters: `The most common beginner mistake: accidentally including the target in the feature list. Example: if "will_rain_tomorrow" is inside your weather features, the model reads the answer directly and learns nothing. This is called target leakage and is dangerous because the model fails completely on real new data.`,
        buildStep: `Write the data contract: list exact input features and target for ${safeGoal}.`,
        hints: [
          `Blank 1 ("task_type"): "${medTaskType}" (${isRegression ? "predicting continuous numbers like BPM" : "predicting discrete categories"}).`,
          `Blank 2 ("features"): ${medFeaturesStr} (the list of measurable input facts).`,
          `Blank 3 ("target"): "${medTarget}" (the single output you want to predict). Do not include this in features!`,
        ],
        starterCode: `# Step 1: Data Contract for ${safeGoal}
# Real input features:
${medFeaturesComment}
# Target: ${medTarget}

def define_project_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,     # TODO: "${medTaskType}"
        "features": ___,      # TODO: ${medFeaturesStr}
        "target": ___         # TODO: "${medTarget}"
    }

print("Spec:", define_project_spec())
`,
        solutionCode: `# Step 1: Data Contract for ${safeGoal}
# Real input features:
${medFeaturesComment}
# Target: ${medTarget}

def define_project_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "${medTaskType}",
        "features": ${medFeaturesStr},
        "target": "${medTarget}"
    }

print("Spec:", define_project_spec())
`,
        testAssertion: `spec = define_project_spec()
assert isinstance(spec, dict)
task = str(spec.get("task_type", "")).lower()
assert task in ["classification", "regression"], f"Got '{task}'"
features = spec.get("features", [])
assert isinstance(features, list) and len(features) >= 2
target = str(spec.get("target", "")).strip()
assert target and target != "___"
assert target not in [str(f).lower() for f in features], "TARGET LEAKAGE!"
print("✅ Data contract verified for ${safeGoal}")
`,
        predictQuestion: {
          prompt: `For "${safeGoal}", which correctly identifies features vs target?`,
          options: [
            `features = [${medFeatures.slice(0,2).join(", ")}, ...] (inputs we measure). target = ${medTarget} (what we predict).`,
            `features = ${medTarget}. target = the model weights.`,
            `features and target are the same.`,
            `target = number of training rows.`,
          ],
          correctIndex: 0,
          explanation: `Features are measured inputs. Target is the single output the model learns to predict. They must never overlap.`,
        },
        checkQuestion: {
          prompt: `Why would including "${medTarget}" in the feature list break the model?`,
          options: [
            `Target leakage "” the model memorises the answer during training and fails on real data where that answer is unknown.`,
            `Python raises SyntaxError on duplicate keys.`,
            `sklearn cannot handle more than 5 features.`,
            `It would make training faster.`,
          ],
          correctIndex: 0,
          explanation: `At prediction time you don't HAVE the target "” that's what you're finding out. Leaking it creates a model that cheats and is worthless in production.`,
        },
      },
      {
        id: "feature-engineering",
        title: `Build the Training Dataset: ${safeGoal}`,
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `A model learns from EXAMPLES, not rules. We need to give it a table of past examples in a format Python understands. Each row = one past observation. Let's build that table now.`,
        explanationSummary: `Imagine a spreadsheet:\n• Each ROW = one historical observation (one past event)\n• Each COLUMN = one feature value (one measurement)\n• There's also a "correct answer" column\n\nIn Python, we split this into TWO variables:\n• X_train = the feature columns (a list of lists — each inner list is one row)\n• y_train = the correct answers (a plain list, one answer per row)\n\nFor ${safeGoal}: each row in X_train has [${medFeatures.join(", ")}] and the matching y_train value = the known ${medTarget}.`,
        corePrinciple: `🎓 Think of X_train as EXAM QUESTIONS and y_train as the ANSWER KEY. During training the model reads both together to learn the pattern. After training, you give it only new questions (new rows) and it predicts the answers.`,
        whyItMatters: `Without training data you'd have to manually guess every weight in a formula — and those guesses are almost always wrong. A model trained on real examples discovers the true statistical relationship automatically.`,
        buildStep: `Create X_train (list of lists, where each inner list = one example's values) and y_train (list of correct answers) for ${safeGoal}.`,
        starterCode: `# ══════════════════════════════════════════════════════════
# STEP 2: Build the Training Dataset
# ══════════════════════════════════════════════════════════
#
# X_train = a list of lists (like a spreadsheet)
#   Each inner list [ , , , ] = ONE past example (one row)
#   Column order: ${medFeatures.join(" | ")}
#
# y_train = the correct answers
#   One answer per row in X_train

${medSampleRows}

# Explore what we built:
print(f"Number of training examples (rows): {len(X_train)}")
print(f"Number of features per example (columns): {len(X_train[0])}")
print(f"Feature names: ${medFeatures.join(', ')}")
print(f"First example values: {X_train[0]}")
print(f"Correct answer for first example: {y_train[0]}")

# ✏ TODO: Add 2 more rows to X_train and y_train
# Keep the same column order: ${medFeatures.join(', ')}
`,
        solutionCode: `${medSampleRows}

print(f"Dataset: {len(X_train)} rows x {len(X_train[0])} features")
print(f"Features: ${medFeatures.join(', ')}")
print(f"Target  ({medTarget}): {y_train}")
`,
        testAssertion: `assert len(X_train) >= 4, f"Need >= 4 rows, got {len(X_train)}"
assert all(len(r) == ${medFeatures.length} for r in X_train), "Each row must have ${medFeatures.length} features: ${medFeatures.join(', ')}"
assert len(X_train) == len(y_train), "X_train and y_train must be same length"
print(f"✅ {len(X_train)} training examples, ${medFeatures.length} real features each")
`,
        predictQuestion: {
          prompt: `What does a single row in the ${safeGoal} training dataset represent?`,
          options: [
            `One complete historical observation "” all ${medFeatures.length} measurements for one person paired with the known ${medTarget}.`,
            `One learned weight value.`,
            `One Python function.`,
            `One column of the table.`,
          ],
          correctIndex: 0,
          explanation: `Each row = one real-world example. The model finds patterns by comparing feature values to targets across all rows.`,
        },
        checkQuestion: {
          prompt: `Why is "model.fit(X_train, y_train)" more powerful than manually writing "output = 2.2*x1 + 1.3*x2"?`,
          options: [
            `model.fit() discovers the optimal coefficients from real data. The formula uses numbers a human guessed "” no learning happened.`,
            `They produce identical results.`,
            `Manual formulas always outperform trained models.`,
            `sklearn requires datasets; it has nothing to do with learning.`,
          ],
          correctIndex: 0,
          explanation: `ML training finds optimal weights by minimising error across all examples simultaneously "” discovering patterns impossible to handpick.`,
        },
      },
      {
        id: "model-architecture",
        title: `Train a Real ML Model: ${safeGoal}`,
        prereqs: ["feature-engineering"],
        difficulty: 3,
        hook: `We will use a Python library called sklearn (scikit-learn) to train a real model. A library = pre-written Python code you can import. You do NOT write the ML algorithm yourself. You just: import → create model → call .fit() → call .predict().`,
        explanationSummary: `sklearn is the world's most popular ML library for Python. It has dozens of algorithms already built for you.\n\nThe 4 lines that do all the work:\n  1. from sklearn.X import Algorithm  ← import the algorithm\n  2. model = Algorithm()               ← create an untrained model\n  3. model.fit(X_train, y_train)       ← TRAIN IT (learning happens here)\n  4. model.predict(new_data)           ← get predictions on new examples\n\nWhat does .fit() do? It studies every row in X_train, makes a prediction, compares it to y_train, and adjusts its internal settings to reduce the error. It repeats thousands of times until the error is minimal.`,
        corePrinciple: `🎓 Plain English for .fit(): Like a student studying for an exam. They read each question (X_train row), check the correct answer (y_train), notice what they got wrong, and improve. After studying everything, they can answer NEW questions they've never seen — because they learned the pattern, not just the answers.`,
        whyItMatters: `Before libraries like sklearn, implementing ML from scratch took hundreds of lines of complex maths. With sklearn, a complete beginner can train a real ML model in 4 lines. That is the whole point of this step.`,
        buildStep: `Import sklearn, create the model, train it with .fit(), then predict on new unseen examples with .predict().`,
        starterCode: `# ═══════════════════════════════════════════════════════════
# STEP 3: Train a Real ML Model using sklearn
# ═══════════════════════════════════════════════════════════
#
# WHAT IS sklearn? It is a Python library (pre-written code you can import).
# You do NOT write the ML algorithm yourself — sklearn already has it.
# You just: import it, create a model, and call .fit() to train it.

${medSampleRows}

# Step 3a: Import the algorithm from sklearn
# (This is like opening the right toolbox for the job)
${medSklearnModel.split("\n")[0]}

# Step 3b: Create a model object
# (This creates an "untrained" model, like hiring someone before they start studying)
model = ___           # TODO: e.g. RandomForestClassifier() or GradientBoostingRegressor()

# Step 3c: TRAIN the model — this is where learning happens!
# model.fit(questions, answers) — the model studies both to find the pattern
model.fit(___, ___)   # TODO: model.fit(X_train, y_train)

# Step 3d: Predict on NEW data the model has NEVER seen before
${medTestSamples}
# model.predict() applies what the model learned to new examples
predictions = model.predict(___)  # TODO: pass in ${medPredictVarName}
print("Predictions for new data:", predictions)
print("(These came from a model that LEARNED — no hardcoded numbers!)")
`,
        solutionCode: `${medSampleRows}

# sklearn learns the weights "” no handpicking!
${medSklearnModel}

${medTestSamples}
predictions = model.predict(${medPredictVarName})
print("✅ Trained on", len(X_train), "examples")
print("Predictions for new data:", predictions)
print("Target: ${medTarget}")
print("\\nðŸ’¡ Weights were LEARNED from data, not hardcoded!")
`,
        testAssertion: `try:
    preds = model.predict(${medPredictVarName})
    assert len(preds) == len(${medPredictVarName})
    assert hasattr(model, "fit")
    print(f"✅ Real ML model trained! Predictions: {list(preds)}")
except NameError:
    print("âš  Call model.fit(X_train, y_train) first")
    raise
`,
        predictQuestion: {
          prompt: `What is the difference between model.fit() and "logit = 2.2*x1 + 1.3*x2 - 1.8"?`,
          options: [
            `model.fit() discovers those coefficients from real data. The formula uses manually guessed numbers "” no learning happened.`,
            `Both give identical outputs.`,
            `model.fit() is just a wrapper around the formula.`,
            `Handpicked weights are always more accurate.`,
          ],
          correctIndex: 0,
          explanation: `Hardcoded weights = someone's guess. Trained weights = mathematically optimal values computed from the actual training data.`,
        },
        checkQuestion: {
          prompt: `After model.fit(X_train, y_train), what has changed inside the model?`,
          options: [
            `The model's internal parameters (weights/trees/splits) have been optimised to minimise prediction error on training data.`,
            `X_train has been deleted.`,
            `The model printed training rows.`,
            `Nothing "” .fit() only validates types.`,
          ],
          correctIndex: 0,
          explanation: `fit() runs an optimisation algorithm that tunes all internal parameters. Subsequent .predict() calls use those discovered parameters.`,
        },
      },
      {
        id: "decision-boundary",
        title: `Evaluate on Held-Out Test Data: ${safeGoal}`,
        prereqs: ["model-architecture"],
        difficulty: 3,
        hook: `Your model was just trained. But how do you know if it actually WORKS on new data — or did it just memorise the training examples? We test it on examples it has NEVER seen before.`,
        explanationSummary: `Before training, we secretly hold back 2 examples (the "test set"). The model NEVER sees these during training.\n\nAfter training, we run:\n  predictions = model.predict(X_test)\n...and compare against the real answers (y_test).\n\n• If the model memorised training data → it fails on the test set\n• If the model learned the real pattern → it gets the test set right\n\nThis is called a train/test split. It is the most important quality check in all of machine learning.`,
        corePrinciple: `🎓 Real-world analogy: You study 80% of past exam papers (training). Then you attempt the remaining 20% of papers you have NEVER studied — as a practice test. If you pass the practice test, you learned concepts. If you only pass papers you already studied, you just memorised.`,
        whyItMatters: `A model that scores 100% on training data but 50% on test data has "overfit" — it memorised examples instead of learning the real pattern. Test accuracy is the only honest measure of how the model performs on new real-world data.`,
        buildStep: `Split your dataset, train, then evaluate on the held-out test set.`,
        starterCode: `# Step 4: Honest Evaluation for ${safeGoal}
${medSampleRows}

X_train_split = X_train[:4]
y_train_split = y_train[:4]
X_test = X_train[4:]   # Never seen during training
y_test = y_train[4:]

${medSklearnModel.replace(/X_train/g, "X_train_split").replace(/y_train/g, "y_train_split")}

predictions = model.predict(___)   # TODO: X_test
${isRegression
  ? `mae = sum(abs(p - t) for p, t in zip(predictions, y_test)) / len(y_test)
print(f"Mean Absolute Error: {round(mae, 2)}")`
  : `correct = sum(1 for p, t in zip(predictions, y_test) if p == t)
print(f"Test accuracy: {round(correct/len(y_test)*100)}%")`}
`,
        solutionCode: `${medSampleRows}

X_train_split = X_train[:4]
y_train_split = y_train[:4]
X_test = X_train[4:]
y_test = y_train[4:]

${medSklearnModel.replace(/X_train/g, "X_train_split").replace(/y_train/g, "y_train_split")}

predictions = model.predict(X_test)
print(f"True:      {y_test}")
print(f"Predicted: {list(predictions)}")
${isRegression
  ? `mae = sum(abs(float(p)-float(t)) for p,t in zip(predictions, y_test)) / len(y_test)
print(f"Mean Absolute Error: {round(mae, 2)} (lower = better)")`
  : `correct = sum(1 for p,t in zip(predictions, y_test) if p==t)
print(f"Test accuracy: {round(correct/len(y_test)*100)}%")`}
`,
        testAssertion: `preds = model.predict(X_test)
assert len(preds) == len(y_test), f"Expected {len(y_test)} preds, got {len(preds)}"
print(f"✅ Evaluated on {len(y_test)} unseen test examples")
`,
        predictQuestion: {
          prompt: `Why evaluate on a test set instead of the same training data?`,
          options: [
            `Training accuracy can reach 100% by memorisation. Test accuracy on unseen data is the only honest real-world measure.`,
            `sklearn crashes if you reuse training data for evaluation.`,
            `The test set is always larger.`,
            `Training data gets deleted after .fit().`,
          ],
          correctIndex: 0,
          explanation: `A model that memorises training examples will fail on new data. The test set simulates real-world unseen inputs.`,
        },
        checkQuestion: {
          prompt: `A ${safeGoal} model gets 100% training accuracy but 50% test accuracy. What happened?`,
          options: [
            `Overfitting "” the model memorised training examples instead of learning the general pattern.`,
            `The model performed perfectly.`,
            `The test labels are wrong.`,
            `100% training accuracy = great model.`,
          ],
          correctIndex: 0,
          explanation: `Overfitting = memorisation without generalisation. High training accuracy + low test accuracy reveals the model cannot generalise to new real-world inputs.`,
        },
      },
    ];
  }
  // General Custom Machine Learning Project
  // Detect domain keywords to generate real, grounded feature names
  const isCustomerChurn =
    lower.includes("customer churn") ||
    lower.includes("subscriber churn") ||
    lower.includes("customer retention") ||
    lower.includes("attrition") ||
    lower.includes("churn");

  const isRecommender =
    lower.includes("recommend") ||
    lower.includes("movie") ||
    lower.includes("netflix") ||
    lower.includes("spotify") ||
    lower.includes("song") ||
    lower.includes("book") ||
    lower.includes("collaborative filtering");

  const isObjectDetection =
    lower.includes("object detect") ||
    lower.includes("pedestrian") ||
    lower.includes("obstacle") ||
    lower.includes("self-driving") ||
    lower.includes("autonomous") ||
    lower.includes("yolo") ||
    lower.includes("bounding box") ||
    lower.includes("traffic sign") ||
    lower.includes("vehicle detect");

  const isCybersecurity =
    lower.includes("cyber") ||
    lower.includes("intrusion") ||
    lower.includes("ddos") ||
    lower.includes("packet") ||
    lower.includes("malware") ||
    lower.includes("network attack") ||
    lower.includes("firewall");

  const isFakeNews =
    lower.includes("fake news") ||
    lower.includes("misinformation") ||
    lower.includes("clickbait") ||
    lower.includes("fact check") ||
    lower.includes("rumor") ||
    lower.includes("disinformation");

  const isAudioOrSpeech =
    lower.includes("audio") ||
    lower.includes("speech") ||
    lower.includes("voice") ||
    lower.includes("sound") ||
    lower.includes("acoustic") ||
    lower.includes("speaker");

  const isSalesDemand =
    lower.includes("sales") ||
    lower.includes("demand") ||
    lower.includes("inventory") ||
    lower.includes("retail");

  const isWeather =
    lower.includes("weather") ||
    lower.includes("rain") ||
    lower.includes("forecast") ||
    lower.includes("temperature") ||
    lower.includes("humidity") ||
    lower.includes("climate");

  const isHouseOrProperty =
    lower.includes("house") ||
    lower.includes("home") ||
    lower.includes("real estate") ||
    lower.includes("property") ||
    lower.includes("apartment");

  const isStock =
    lower.includes("stock") ||
    lower.includes("price") ||
    lower.includes("market") ||
    lower.includes("finance") ||
    lower.includes("trading");

  // Determine real features for the project domain
  let domainFeatures: string[];
  let targetName: string;
  let taskType: string;
  let sampleRows: string;
  let sklearnModel: string;
  let testSamples: string;

  if (isCustomerChurn) {
    domainFeatures = ["tenure_months", "monthly_charges_usd", "total_charges_usd", "support_calls", "contract_type_years"];
    targetName = "will_churn";
    taskType = "classification";
    sampleRows = `# [tenure_mo, monthly_$, total_$, support_calls, contract_yrs] -> will_churn(0=Stay, 1=Cancel)
X_train = [
    [2,   85.0, 170.0,  4, 0],
    [36,  45.0, 1620.0, 0, 2],
    [5,   90.0, 450.0,  5, 0],
    [48,  55.0, 2640.0, 1, 2],
    [12,  70.0, 840.0,  2, 1],
    [1,   95.0, 95.0,   3, 0],
]
y_train = [1, 0, 1, 0, 0, 1]  # 1=Churned (canceled), 0=Retained`;
    sklearnModel = `from sklearn.ensemble import GradientBoostingClassifier
model = GradientBoostingClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_customers = [
    [3,  88.0, 264.0, 4, 0],   # New customer with multiple complaints (high risk)
    [60, 40.0, 2400.0, 0, 2],  # Long-term loyal subscriber (low risk)
]`;
  } else if (isRecommender) {
    domainFeatures = ["user_avg_rating", "genre_affinity_score", "item_popularity", "release_recency", "critic_score"];
    targetName = "predicted_rating_stars";
    taskType = "regression";
    sampleRows = `# [user_avg(1-5), genre_affinity(0-1), popularity(0-1), recency(0-1), critic_score(0-100)] -> rating
X_train = [
    [4.5, 0.95, 0.85, 0.90, 88.0],
    [2.2, 0.10, 0.40, 0.30, 42.0],
    [4.0, 0.80, 0.70, 0.60, 78.0],
    [1.8, 0.25, 0.90, 0.40, 35.0],
    [3.8, 0.65, 0.50, 0.85, 82.0],
    [4.8, 0.98, 0.95, 0.95, 94.0],
]
y_train = [4.8, 1.5, 4.0, 2.0, 3.7, 5.0]  # User stars out of 5.0`;
    sklearnModel = `from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_candidate_items = [
    [4.2, 0.92, 0.80, 0.90, 86.0],  # Strong match with user favorite genre
    [2.0, 0.15, 0.50, 0.20, 50.0],  # Poor genre alignment
]`;
  } else if (isObjectDetection) {
    domainFeatures = ["bbox_area_px", "aspect_ratio", "relative_speed_kmh", "distance_meters", "edge_density"];
    targetName = "obstacle_type";
    taskType = "classification";
    sampleRows = `# [area_px, aspect_ratio, speed_kmh, distance_m, edge_density] -> obstacle(0=Road, 1=Vehicle, 2=Pedestrian)
X_train = [
    [14000.0, 1.85, 55.0, 35.0, 0.82],
    [1800.0,  0.42, 4.0,  12.0, 0.75],
    [250.0,   1.00, 0.0,  80.0, 0.15],
    [16500.0, 1.70, 60.0, 28.0, 0.88],
    [2100.0,  0.38, 5.5,  15.0, 0.78],
    [400.0,   1.10, 0.0,  65.0, 0.20],
]
y_train = [1, 2, 0, 1, 2, 0]  # 0=Clear road, 1=Vehicle ahead, 2=Pedestrian`;
    sklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_camera_detections = [
    [1950.0,  0.40, 3.5, 10.0, 0.72],  # Narrow tall bounding box close by (pedestrian)
    [15200.0, 1.80, 52.0, 30.0, 0.85],  # Wide box moving at 52 km/h (vehicle)
]`;
  } else if (isCybersecurity) {
    domainFeatures = ["packet_length_bytes", "packets_per_second", "failed_logins", "session_duration_sec", "foreign_port_flag"];
    targetName = "is_malicious_attack";
    taskType = "classification";
    sampleRows = `# [packet_len, pkts_per_sec, failed_logins, duration_sec, foreign_port(0/1)] -> attack(0=Safe, 1=Attack)
X_train = [
    [1450, 1500, 8, 2, 1],
    [480,  12,   0, 350, 0],
    [1500, 2200, 15, 1, 1],
    [520,  20,   0, 600, 0],
    [1200, 950,  6, 3, 1],
    [390,  8,    0, 240, 0],
]
y_train = [1, 0, 1, 0, 1, 0]  # 1=Intrusion / DDoS threat, 0=Benign user traffic`;
    sklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_network_sessions = [
    [1480, 1800, 12, 1, 1],  # Massive packet burst with failed logins (attack)
    [420,  15,   0,  450, 0], # Normal web browsing session (benign)
]`;
  } else if (isFakeNews) {
    domainFeatures = ["sensational_word_density", "uppercase_letter_ratio", "exclamation_mark_freq", "source_credibility_score", "quote_count"];
    targetName = "is_fake_news";
    taskType = "classification";
    sampleRows = `# [sensational_pct, caps_ratio, exclamations, source_cred(0-1), quotes] -> fake(0=Verified, 1=Fake)
X_train = [
    [0.85, 0.45, 7, 0.15, 0],
    [0.08, 0.02, 0, 0.95, 5],
    [0.92, 0.50, 9, 0.10, 0],
    [0.05, 0.01, 0, 0.98, 4],
    [0.78, 0.38, 5, 0.20, 1],
    [0.12, 0.03, 1, 0.90, 6],
]
y_train = [1, 0, 1, 0, 1, 0]  # 1=Unverified / sensationalist fake news, 0=Credible report`;
    sklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_articles = [
    [0.88, 0.48, 8, 0.12, 0],  # "SHOCKING SECRET REVEALED!!!" (fake)
    [0.06, 0.02, 0, 0.94, 4],  # Balanced investigative journalism (verified)
]`;
  } else if (isAudioOrSpeech) {
    domainFeatures = ["pitch_hz", "spectral_centroid_hz", "zero_crossing_rate", "energy_rms", "duration_seconds"];
    targetName = "voice_command_class";
    taskType = "classification";
    sampleRows = `# [pitch_hz, centroid_hz, zcr, energy_rms, duration_s] -> command(0=Stop, 1=Play, 2=Next)
X_train = [
    [120.0, 1400.0, 0.06, 0.35, 0.60],
    [210.0, 2600.0, 0.14, 0.75, 0.85],
    [165.0, 1950.0, 0.09, 0.55, 0.70],
    [115.0, 1350.0, 0.05, 0.32, 0.55],
    [220.0, 2700.0, 0.15, 0.78, 0.90],
    [170.0, 2000.0, 0.10, 0.58, 0.75],
]
y_train = [0, 1, 2, 0, 1, 2]  # 0="Stop", 1="Play", 2="Next"`;
    sklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_audio_recordings = [
    [215.0, 2650.0, 0.14, 0.76, 0.88],  # Bright energetic vocal acoustics ("Play")
    [118.0, 1380.0, 0.06, 0.34, 0.58],  # Low abrupt vocal acoustics ("Stop")
]`;
  } else if (isSalesDemand) {
    domainFeatures = ["prev_week_sales", "promotional_discount_pct", "holiday_flag", "store_footfall", "marketing_spend_usd"];
    targetName = "units_sold";
    taskType = "regression";
    sampleRows = `# [prev_sales, discount%, holiday(0/1), footfall, mktg_$] -> units_sold
X_train = [
    [350, 15, 1, 1200, 800],
    [180, 0,  0, 600,  150],
    [420, 25, 1, 1500, 1200],
    [200, 5,  0, 680,  200],
    [310, 10, 0, 950,  500],
    [480, 30, 1, 1800, 1500],
]
y_train = [385, 175, 460, 210, 320, 520]  # Actual units sold`;
    sklearnModel = `from sklearn.ensemble import GradientBoostingRegressor
model = GradientBoostingRegressor(n_estimators=50, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_sales_weeks = [
    [360, 20, 1, 1300, 900],   # Holiday week with 20% discount promotion
    [190, 0,  0, 620,  150],   # Standard baseline off-peak week
]`;
  } else if (isWeather) {
    domainFeatures = ["temperature_c", "humidity_pct", "pressure_hpa", "wind_speed_kmh", "cloud_cover_pct"];
    targetName = "will_rain_tomorrow";
    taskType = "classification";
    sampleRows = `# [temp_c, humidity%, pressure_hpa, wind_kmh, cloud%] -> rain_tomorrow
X_train = [
    [30, 65, 1012, 12, 40],
    [25, 88, 1005, 18, 90],
    [22, 55, 1018, 8,  20],
    [28, 91, 1003, 22, 95],
    [32, 60, 1015, 5,  10],
    [18, 85, 1000, 25, 98],
]
y_train = [0, 1, 0, 1, 0, 1]  # 0=No rain, 1=Rain tomorrow`;
    sklearnModel = `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=10, random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `# New unseen weather observations to predict
new_readings = [
    [26, 85, 1007, 15, 80],   # Humid & cloudy
    [34, 45, 1020, 6,  5],    # Dry & sunny
]`;
  } else if (isHouseOrProperty) {
    domainFeatures = ["sqft", "bedrooms", "bathrooms", "garage_spaces", "distance_to_city_km"];
    targetName = "price_usd";
    taskType = "regression";
    sampleRows = `# [sqft, bedrooms, bathrooms, garage, distance_km] -> price_usd
X_train = [
    [1200, 2, 1, 0, 15],
    [1800, 3, 2, 1, 8],
    [2400, 4, 2, 2, 5],
    [3000, 4, 3, 2, 3],
    [900,  1, 1, 0, 22],
]
y_train = [180000, 265000, 380000, 520000, 125000]`;
    sklearnModel = `from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)`;
    testSamples = `new_houses = [
    [1500, 3, 2, 1, 10],
    [3500, 5, 4, 3, 2],
]`;
  } else if (isStock) {
    domainFeatures = ["open_price", "volume", "day_of_week", "prev_close", "market_index"];
    targetName = "close_price";
    taskType = "regression";
    sampleRows = `# [open, volume_M, day(0-4), prev_close, market_index] -> close_price
X_train = [
    [150.0, 5.2, 0, 148.5, 4500],
    [152.0, 6.1, 1, 150.0, 4510],
    [149.0, 4.8, 2, 152.0, 4490],
    [151.0, 7.3, 3, 149.0, 4520],
    [153.0, 5.5, 4, 151.0, 4530],
]
y_train = [151.5, 153.0, 148.0, 152.5, 155.0]`;
    sklearnModel = `from sklearn.linear_model import Ridge
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)`;
    testSamples = `new_days = [
    [154.0, 6.0, 0, 153.0, 4540],
    [148.0, 4.5, 2, 149.5, 4475],
]`;
  } else {
    // Generic custom goal — derive contextual names from goal string
    const words = safeGoal.toLowerCase().split(/[\s_-]+/).filter(w => w.length > 3);
    domainFeatures = words.slice(0, 3).map(w => `${w}_score`).concat(["value_1", "value_2"]).slice(0, 4);
    targetName = "prediction";
    taskType = "classification";
    sampleRows = `# Auto-generated training samples for ${safeGoal}
X_train = [[1.2, 0.5, 3.1, 0.9], [0.3, 2.1, 1.5, 0.2], [2.8, 0.8, 0.4, 1.7],
           [0.1, 1.9, 2.0, 0.5], [3.2, 0.3, 1.1, 2.0], [0.6, 2.7, 0.8, 1.3]]
y_train = [1, 0, 1, 0, 1, 0]  # 1 = positive outcome`;
    sklearnModel = `from sklearn.linear_model import LogisticRegression
model = LogisticRegression(random_state=42)
model.fit(X_train, y_train)`;
    testSamples = `new_samples = [[2.0, 0.4, 1.5, 1.1], [0.2, 2.5, 0.9, 0.4]]`;
  }

  const featuresStr = JSON.stringify(domainFeatures);
  const featuresComment = domainFeatures.map((f, i) => `# ${i}: ${f}`).join("\n");
  const testVarName = testSamples.match(/^([a-zA-Z0-9_]+)\s*=/m)?.[1] || "new_samples";

  return [
    {
      id: "problem-framing",
      title: `Problem Formulation: ${safeGoal}`,
      prereqs: [],
      difficulty: 1,
      hook: `Before writing code for ${safeGoal}, what real-world measurements will the model use as inputs, and what single outcome does it need to predict?`,
      explanationSummary: `Every machine learning project starts with a data contract: define what observable facts go IN (features) and what the model must output (target). For ${safeGoal} the features are things like ${domainFeatures.slice(0,3).join(", ")} and the target is ${targetName}.`,
      corePrinciple: `Supervised learning: f(X) -> Y. Features X are measured before prediction. Target Y is what we learn to predict.`,
      whyItMatters: `Mixing the target into the inputs causes "target leakage" — the model cheats on training but fails completely on real data.`,
      buildStep: `Define the exact input features and target for ${safeGoal}.`,
      starterCode: `# Step 1: Define the Data Contract for ${safeGoal}
# These are the REAL features your model will learn from:
${featuresComment}
# Target: ${targetName}

def define_project_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,             # TODO: "${taskType}"
        "features": ___,              # TODO: ${featuresStr}
        "target": ___                 # TODO: "${targetName}"
    }

spec = define_project_spec()
print("Project Spec:", spec)
`,
      solutionCode: `# Step 1: Data Contract for ${safeGoal}
def define_project_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "${taskType}",
        "features": ${featuresStr},
        "target": "${targetName}"
    }

spec = define_project_spec()
print("Project Spec:", spec)
`,
      testAssertion: `spec = define_project_spec()
assert isinstance(spec, dict), "Must return a dict"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Fill in task_type: '${taskType}'"
features = spec.get("features", [])
assert isinstance(features, list) and len(features) > 0, "features must be a non-empty list"
assert features != ["___"], "Replace blank with the actual feature list"
target = str(spec.get("target", "")).strip()
assert target != "___" and target != "", "Fill in target: '${targetName}'"
assert target not in [str(f).lower() for f in features], "TARGET LEAKAGE: target cannot be in the features list!"
print("Assertion Passed: Data contract verified!")
`,
      predictQuestion: {
        prompt: `For "${safeGoal}", which of these correctly describes the input features vs the target?`,
        options: [
          `Features = [${domainFeatures.slice(0,2).join(", ")},...] (things we measure BEFORE prediction). Target = ${targetName} (what we predict).`,
          `Features = ${targetName} (the thing to predict). Target = the model's weights.`,
          `Features = model accuracy. Target = number of training rows.`,
          `Features and target are the same thing.`,
        ],
        correctIndex: 0,
        explanation: `Features are observable measurements available before prediction. Target is the outcome the model learns to output.`,
      },
      checkQuestion: {
        prompt: `What is "target leakage" and why is it dangerous?`,
        options: [
          "Including the target inside the feature list — the model memorizes it during training but fails on real unseen data.",
          "Having too many rows in the training dataset.",
          "Using a learning rate that is too high.",
          "Training the model for too many epochs.",
        ],
        correctIndex: 0,
        explanation: "Target leakage lets the model cheat during training. It then collapses completely on new real-world examples where the target is unknown.",
      },
    },
    {
      id: "feature-engineering",
      title: `Build the Training Dataset: ${safeGoal}`,
      prereqs: ["problem-framing"],
      difficulty: 2,
      hook: `A machine learning model can only learn if it has historical examples. Where do those examples come from, and how do we format them for ${safeGoal}?`,
      explanationSummary: `A training dataset is a table of historical observations. Each row is one past example with measured feature values and the known correct answer. For ${safeGoal}, each row contains [${domainFeatures.join(", ")}] and the known target: ${targetName}.`,
      corePrinciple: `X_train = [[features of example 1], [features of example 2], ...]. y_train = [target1, target2, ...]. Same index = same example.`,
      whyItMatters: `Without a real dataset the model has nothing to learn from. Manually picking weights is NOT learning — it is just a formula.`,
      buildStep: `Build X_train (feature matrix) and y_train (targets) for ${safeGoal} using realistic domain values.`,
      starterCode: `# Step 2: Build the Training Dataset for ${safeGoal}
# Each row in X_train = one historical observation
# Columns order: ${domainFeatures.join(" | ")}

${sampleRows}

# Explore the data shape
print(f"Training samples: {len(X_train)} rows x {len(X_train[0])} features")
print(f"Target values: {y_train}")

# TODO: Add 2 more realistic rows to X_train and y_train
# Hint: Copy the pattern above using real domain-appropriate values
`,
      solutionCode: `# Step 2: Training Dataset for ${safeGoal}
${sampleRows}

print(f"Training samples: {len(X_train)} rows x {len(X_train[0])} features")
print(f"Feature columns: ${domainFeatures.join(', ')}")
print(f"Target ({targetName}): {y_train}")
`,
      testAssertion: `assert len(X_train) >= 4, f"Need at least 4 training rows, got {len(X_train)}"
assert all(len(row) == ${domainFeatures.length} for row in X_train), "Each row must have ${domainFeatures.length} features: ${domainFeatures.join(', ')}"
assert len(X_train) == len(y_train), "X_train and y_train must have the same number of rows"
print(f"Assertion Passed: Dataset has {len(X_train)} examples with ${domainFeatures.length} real features each!")
`,
      predictQuestion: {
        prompt: `In the training dataset for ${safeGoal}, what does each ROW represent?`,
        options: [
          `One historical real-world observation — e.g. one day's weather readings [${domainFeatures.slice(0,2).join(", ")}, ...] paired with the known outcome.`,
          `A single weight value learned during gradient descent.`,
          `A Python function that runs the prediction.`,
          `A random number generated by the model.`,
        ],
        correctIndex: 0,
        explanation: `Each row is one complete historical example: all measured features + the correct answer the model should learn to predict.`,
      },
      checkQuestion: {
        prompt: `Why can't we just make up weights ourselves instead of training on real data?`,
        options: [
          `Handpicked weights are just a formula — they cannot adapt to patterns hidden in data that humans cannot see.`,
          `sklearn does not accept manually set weights.`,
          `Python crashes when you write numbers directly.`,
          `Training data always makes the model worse.`,
        ],
        correctIndex: 0,
        explanation: `An ML model finds optimal weights by minimising error across hundreds of examples. A human guessing weights cannot discover subtle multi-feature interactions.`,
      },
    },
    {
      id: "model-architecture",
      title: `Train a Real ML Model: ${safeGoal}`,
      prereqs: ["feature-engineering"],
      difficulty: 3,
      hook: `You now have real data. How does sklearn actually LEARN the weights — and what does model.fit() do under the hood?`,
      explanationSummary: `model.fit(X_train, y_train) iterates over the training data, computes prediction errors, and mathematically adjusts weights to minimise those errors. After .fit(), the model has LEARNED — the weights are no longer manually set, they were computed from data.`,
      corePrinciple: `Training loop: Predict → Measure Error → Compute Gradient → Update Weights → Repeat. sklearn automates all of this in one .fit() call.`,
      whyItMatters: `This is the core of machine learning. Without .fit() it is just a formula with hardcoded numbers — not a model that learned anything.`,
      buildStep: `Train a real sklearn model on your ${safeGoal} dataset and make predictions on new unseen examples.`,
      starterCode: `# Step 3: Train a Real ML Model for ${safeGoal}
# We already built our dataset in Step 2
${sampleRows}

# Import the right sklearn model
${sklearnModel.split("\n")[0]}           # <-- import
model = ___                              # TODO: create the model instance (e.g. RandomForestClassifier())
model.fit(___, ___)                      # TODO: train on X_train, y_train

# Now predict on NEW unseen examples
${testSamples}
predictions = model.predict(___)
print("New predictions:", predictions)
`,
      solutionCode: `# Step 3: Train a Real ML Model for ${safeGoal}
${sampleRows}

${sklearnModel}

# Predict on new unseen examples the model has never seen
${testSamples}
predictions = model.predict(${testVarName})
print("Model was trained on", len(X_train), "historical examples")
print("Predictions for new data:", predictions)
print("\n✅ The model LEARNED these patterns — no hardcoded weights!")
`,
      testAssertion: `try:
    preds = model.predict(${testVarName})
    assert preds is not None and len(preds) > 0, "model.predict() must return at least one prediction"
    assert hasattr(model, "fit"), "Model must be a proper sklearn estimator with .fit()"
    print(f"Assertion Passed: Real ML model trained! Got {len(preds)} predictions: {preds}")
except NameError:
    print("⚠ Model not trained yet — make sure to call model.fit(X_train, y_train)")
    raise
`,
      predictQuestion: {
        prompt: `What is the difference between model.fit() and just writing a formula like score = 0.5*x1 + 1.5*x2?`,
        options: [
          `model.fit() LEARNS the best weights from real historical data. A formula uses weights you manually guessed — no learning happened.`,
          `model.fit() is slower but produces identical results to a manual formula.`,
          `A manual formula uses sklearn internally.`,
          `model.fit() only works with images, not tabular data.`,
        ],
        correctIndex: 0,
        explanation: `Training discovers optimal weights by minimising prediction error across the entire dataset. Manual formulas cannot discover hidden feature interactions.`,
      },
      checkQuestion: {
        prompt: `After model.fit(X_train, y_train) is called, what has happened inside the model?`,
        options: [
          `The model has adjusted its internal weights/parameters so its predictions are as accurate as possible on the training data.`,
          `The model deleted the training data to save memory.`,
          `The model printed all training rows to the terminal.`,
          `Nothing — .fit() only validates the input format.`,
        ],
        correctIndex: 0,
        explanation: `fit() optimises the model's internal parameters (weights, decision boundaries, leaf splits, etc.) to minimise error on the training examples.`,
      },
    },
    {
      id: "decision-boundary",
      title: `Evaluate & Test the Model: ${safeGoal}`,
      prereqs: ["model-architecture"],
      difficulty: 3,
      hook: `Your model was trained on past data. But how do you know if it will work on NEW data it has never seen?`,
      explanationSummary: `After training, we hold back some data (the test set) that the model never saw during training. We compare model predictions to the real answers on this unseen test set. This gives an honest accuracy score — not a score inflated by memorising training examples.`,
      corePrinciple: `Train/Test Split: train on 80% of data, evaluate on the remaining 20%. Accuracy = correct_predictions / total_test_examples.`,
      whyItMatters: `A model can memorise all training data and get 100% training accuracy but fail completely on new real-world inputs. Test-set evaluation reveals the truth.`,
      buildStep: `Split your dataset into training and test sets, train the model, then measure real accuracy on the held-out test examples.`,
      starterCode: `# Step 4: Train/Test Split & Honest Evaluation
${sampleRows}

# Split: first 4 rows for training, last 2 rows for testing
X_train_split = X_train[:4]
y_train_split = y_train[:4]
X_test = X_train[4:]          # Model will NEVER see these during training
y_test = y_train[4:]          # True answers for the test rows

${sklearnModel.replace("X_train", "X_train_split").replace("y_train", "y_train_split")}

# Evaluate on the held-out test set
predictions = model.predict(___)
correct = sum(1 for p, t in zip(predictions, ___) if p == t)
accuracy = round(correct / len(y_test), 2)
print(f"Test accuracy: {accuracy * 100}%")
`,
      solutionCode: `# Step 4: Train/Test Split & Evaluation for ${safeGoal}
${sampleRows}

X_train_split = X_train[:4]
y_train_split = y_train[:4]
X_test  = X_train[4:]
y_test  = y_train[4:]

${sklearnModel.replace("X_train", "X_train_split").replace("y_train", "y_train_split")}

predictions = model.predict(X_test)
correct = sum(1 for p, t in zip(predictions, y_test) if p == t)
accuracy = round(correct / len(y_test), 2)
print(f"Held-out test predictions: {predictions}")
print(f"True labels:               {y_test}")
print(f"Test accuracy:             {accuracy * 100}%")
`,
      testAssertion: `preds = model.predict(X_test)
assert len(preds) == len(y_test), f"Expected {len(y_test)} predictions, got {len(preds)}"
correct = sum(1 for p, t in zip(preds, y_test) if p == t)
print(f"Assertion Passed: Model evaluated on {len(y_test)} unseen examples. Correct: {correct}/{len(y_test)}")
`,
      predictQuestion: {
        prompt: `Why do we evaluate on a TEST set instead of the same data we trained on?`,
        options: [
          `Training accuracy can be faked by memorisation. Test accuracy on unseen data reveals how the model really performs in the real world.`,
          `sklearn requires a separate test set or it crashes.`,
          `The test set is always larger than the training set.`,
          `Training data is deleted automatically after .fit().`,
        ],
        correctIndex: 0,
        explanation: `A model that memorises training examples will score 100% on training data but fail on new examples. The test set simulates real-world unseen data.`,
      },
      checkQuestion: {
        prompt: `If a model gets 100% accuracy on training data but 50% on test data, what does this tell you?`,
        options: [
          `The model is overfitting — it memorised the training examples instead of learning general patterns.`,
          `The model is performing perfectly.`,
          `The test set has errors.`,
          `100% training accuracy always means the model is excellent.`,
        ],
        correctIndex: 0,
        explanation: `Overfitting = model learned the training data by heart, not the underlying patterns. It fails to generalise to new unseen examples.`,
      },
    },
  ];
}

/**
 * Generates linear concept edges connecting the roadmap concepts in sequence.
 */
export function generateFallbackEdgesForGoal(concepts: Concept[]): ConceptEdge[] {
  const edges: ConceptEdge[] = [];
  for (let i = 0; i < concepts.length - 1; i++) {
    edges.push({
      from: concepts[i].id,
      to: concepts[i + 1].id,
    });
  }
  return edges;
}
