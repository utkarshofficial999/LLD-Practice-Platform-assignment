# Research Note: Low-Level Design (LLD) Practice & Evaluation

## 1. The Learner Problem: Why LLD Practice is Hard

Low-Level Design (LLD) is one of the most critical stages in a software engineer's transition from writing functional code to authoring scalable, maintainable, and extensible software systems. Yet, practicing LLD today remains extraordinarily frustrating and inefficient for self-directed learners.

Through our analysis of the learning journey, four foundational obstacles emerge:

### 1.1 The Absence of an Automated Feedback Loop
In Data Structures and Algorithms (DSA), a platform like LeetCode provides an immediate, deterministic truth: code passes test cases or it fails. The feedback loop is instantaneous. In LLD, there are rarely binary test cases because **design is fundamentally about trade-offs**. A learner can spend three hours designing a Parking Lot system or an Elevator Dispatcher, write dozens of classes, and still have no idea whether their abstractions are decoupled, their responsibilities are coherent, or their solution suffers from design smells like God Objects or tight coupling.

### 1.2 The "Multiple Valid Designs" Dilemma
Unlike algorithmic problem solving where time/space complexity can objectively rank solutions, two completely different LLD solutions can both be valid depending on the operating constraints and assumptions:
- An Elevator system can use a simple scan algorithm (LOOK/SCAN) with a single controller, or a decentralized multi-car dispatch agent network with state-machine delegates.
- If a practice platform simply provides a static "Reference Solution", learners mistakenly conclude their different approach was "wrong", or worse, blindly memorize one specific pattern rather than developing architectural reasoning.

### 1.3 The Friction of Submission Modalities
Learners struggle with what to submit:
- **Full executable code**: Demands tedious boilerplate (getters, setters, serialization, syntax minutiae) that distracts from structural design.
- **Unstructured plain text**: Too ambiguous to evaluate objectively; learners write hand-wavy descriptions without committing to concrete class boundaries or relationships.
- **Pure visual diagrams**: Time-consuming to draw in external tools (Draw.io/Lucidchart) and hard to parse semantically for automated review.

### 1.4 Lack of Iterative Improvement Tracking
Real-world software design is iterative: you produce a draft, review trade-offs, identify edge cases, and refactor. Existing practice resources are one-off consumption media (reading a blog post or watching a video). They provide no mechanism for a learner to see: *"Here is Attempt 1, here is where my coupling was tight, and here is how my Attempt 2 improved abstraction and resolved the concerns."*

---

## 2. Research into Existing Tools & Approaches

We analyzed the primary methods learners currently use to prepare for LLD:

| Practice Medium / Tool | Workflow & Submission | Evaluation & Feedback | Critical Gaps |
|---|---|---|---|
| **Educative / Grokking LLD** | Read text + view pre-made class diagrams + copy Java code. | No evaluation. Passive reading. | Zero interactive practice. Learner cannot test their own original design ideas. |
| **GitHub Repos (e.g., awesome-low-level-design)** | Clone repo, read community implementations of Parking Lot, etc. | None (self-comparison against someone else's arbitrary code). | No validation of whether the community code is actually good or fits different constraints. |
| **LeetCode / HackerRank OOP Questions** | Write runnable code that implements an interface (e.g. `Design Underground System`). | Unit tests pass/fail. | Evaluates runtime execution correctness, **not design quality**. A God Class with 1,000 lines and static state passes all tests. |
| **P2P / Paid Mock Interviews (Pramp, Interviewing.io)** | Verbal discussion + collaborative Google Doc / Coderpad. | High-quality human feedback on trade-offs. | Extremely expensive ($150–$300/hr), unscalable, scheduling friction, inconsistent interviewer rubrics. |
| **Generic Chatbots (ChatGPT / Claude web chat)** | Learner pastes prompt: *"Critique my Parking Lot design"*. | Generic praise or unanchored critique; often hallucinated scores without structural consistency. | Unstructured, non-repeatable, lack of rubric anchoring, no attempt progression tracking. |

---

## 3. Key Gaps Identified

1. **Gap 1: Disconnect between Code and Architectural Intent**: Tools either grade raw compilation/tests (LeetCode) or provide static text (Educative). There is no tool that evaluates *architectural relationships* and *design trade-offs* together with stated assumptions.
2. **Gap 2: Subjective, Unanchored Feedback**: Generic AI feedback says "looks good, but you could add a Factory Pattern" without citing specific code evidence or explaining why that pattern is warranted.
3. **Gap 3: Missing State & Progression Retention**: Platforms treat submissions as ephemeral. Learners never get a diff of their design competence over time.

---

## 4. Product Direction & MVP Hypothesis

### 4.1 The Core Learner Loop
We design our platform around a focused, non-distracting practice loop:
$$\text{Choose Problem} \longrightarrow \text{Think \& Structure} \longrightarrow \text{Submit} \longrightarrow \text{Explainable Feedback} \longrightarrow \text{Review} \longrightarrow \text{Refactor \& Try Again}$$

### 4.2 The Submission Sweet Spot: "Structured Design Model"
To give high evidence of design quality without forcing learners to write 500 lines of boilerplate, we require:
1. **Class & Interface Skeleton**: Clear class declarations, interfaces, fields, method signatures, and access levels (proves encapsulation, coupling, abstractions).
2. **Design Rationale & Assumptions**: Explicit statement of chosen patterns, concurrency assumptions, and trade-off justifications (proves architectural reasoning).
3. **Live Diagram Generation**: Automatic or learner-provided Mermaid diagram rendering to visually inspect relationships.

### 4.3 Hybrid Evidence-Based Evaluation
We reject arbitrary 0–100 scores. Instead, we introduce a **Fixed Rubric Model**:
- **Deterministic Rules Engine**: Analyzes structural requirements (required domain concepts present vs missing, inheritance depth, God-class detection, interface segregation).
- **AI Judgment Engine**: Evaluates qualitative dimensions (cohesion, trade-off depth, pattern appropriateness) anchored to strict structured output:
  $$\text{criterion} \longrightarrow \text{score (1–5)} \longrightarrow \text{evidence in submission} \longrightarrow \text{specific concern} \longrightarrow \text{actionable suggestion}$$

### 4.4 Multi-Attempt Comparison Engine
Every attempt belongs to an evolving learner session. Attempt 2 explicitly highlights what changed compared to Attempt 1, which previous concerns were resolved, and whether new architectural flaws were introduced.
