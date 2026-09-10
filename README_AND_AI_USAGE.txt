# Deliverable 5: README & AI Usage Note

Author: Candidate Submission
Deliverable: System Guide, Setup, Key Decisions & AI Usage Reflections

================================================================================
PART 1: README (SYSTEM GUIDE, SETUP & ARCHITECTURE)
================================================================================

1. Why We Built This
--------------------------------------------------------------------------------
Practicing Low-Level Design (LLD) is notoriously difficult for self-directed
engineers. Unlike algorithms platforms where code either passes or fails unit tests,
object-oriented design is about trade-offs, clean responsibilities, and extensible
abstractions.

We built this platform to give learners what has always been missing:
an instant, objective, and evidence-backed feedback loop that tracks design growth
over multiple iterations.


2. Core Features
--------------------------------------------------------------------------------
• Realistic Problem Scenarios:
  Curated design challenges (Multi-Floor Parking Lot, High-Rise Elevator Dispatcher)
  with explicit domain entity checklists, behavioral expectations, and scoring rubrics.

• Three-Panel Studio Workspace:
  - Left: Problem specification and dynamic entity detection checklist.
  - Center: Multi-tab editor with TypeScript skeleton code, live visual Mermaid UML
    class diagrams, and architectural rationale notes.
  - Right: AI Architect scorecard with 5-criteria rubric ratings, anti-pattern
    warnings, and attempt progression diffing.

• Hybrid Evaluation Pipeline:
  Pairs deterministic static analysis (checks mandatory entities, God Classes,
  missing interfaces) with an AI architectural judgment engine that cites exact
  lines of code to support its evaluation.

• Version Comparison & Progression:
  Submissions are automatically versioned (v1 -> v2). A dedicated comparison modal
  highlights resolved concerns, score changes, and remaining suggestions.

• Resilient 100% Uptime:
  Engineered to run seamlessly on a Node server or Vercel Serverless, while featuring
  an intelligent in-browser fallback service that ensures the platform continues
  functioning even during network drops or cold starts.


3. Quick Start Guide
--------------------------------------------------------------------------------
Prerequisites: Node.js (v18+) and npm.

1. Install Dependencies:
   npm install

2. Environment Setup (Optional):
   Create a `.env` file in the project root:
   GROQ_API_KEY=your_groq_api_key_here
   (If left blank, the platform automatically uses its built-in local evaluator).

3. Start Locally:
   npm run dev
   This concurrently runs the Express server (port 3001) and Vite client (port 5173).

4. Open in Browser:
   http://localhost:5173

5. Run Automated Tests:
   npm test


4. The Two Architectural Change Tests
--------------------------------------------------------------------------------
Our architecture is built around Clean Architecture and passed the Candidate Guide's
two critical change tests:

• Change Test A (New Submission Formats):
  Adding a new visual diagram or JSON canvas submission requires ZERO changes to
  Problem, Attempt, or Evaluator classes. `Submission` delegates directly to an
  `ISubmissionContent` strategy interface. Tested in `tests/change_tests.test.ts`.

• Change Test B (New Evaluation Strategies):
  Adding human mentors, peer reviewers, or automated AST linters requires ZERO
  changes to `PracticeService` or `Attempt`. Evaluators implement `IEvaluationStrategy`
  and plug into `CompositeEvaluator`. Tested in `tests/change_tests.test.ts`.


================================================================================
PART 2: AI USAGE NOTE (ENGINEERING DECISIONS & TRADE-OFFS)
================================================================================

Overview
--------------------------------------------------------------------------------
Throughout building this project, AI was utilized as an engineering brainstorming
partner. However, AI suggestions frequently leaned toward over-engineering or
superficial designs. 

Below are four concrete examples where AI proposals were scrutinized, challenged,
and adapted using practical engineering judgment.


Decision 1: Submission Modality — Sandboxed Code vs. Structured Skeleton
--------------------------------------------------------------------------------
• What the AI Suggested:
  The AI originally proposed spinning up a Docker or WebAssembly sandbox to
  compile student code, execute automated unit test suites, and measure CPU/memory.

• What was Accepted vs. Rejected:
  - REJECTED: Sandboxed code execution and automated unit testing.
  - ACCEPTED: A "Structured Design Model" consisting of class/interface skeletons,
    a live Mermaid UML visualizer, and an architectural design rationale.

• Why (Engineering Judgment):
  - Running unit tests measures algorithmic correctness and syntax, NOT design quality.
    A candidate can write a 1,000-line God Object full of static variables that passes
    all unit tests while having terrible architectural design.
  - Furthermore, requiring runnable code forces learners to spend 80% of their time
    wrestling with imports, syntax errors, and mock database boilerplate.
  - In senior engineering interviews, interviewers look for clean class boundaries,
    separation of concerns, and clear trade-off justifications. Our structured
    skeleton provides maximum architectural signal with minimal learner friction.


Decision 2: Evaluation Scoring — Free-Form 0–100 vs. Grounded Rubric
--------------------------------------------------------------------------------
• What the AI Suggested:
  Prompting an LLM with: "You are an LLD expert. Rate this design from 0 to 100
  and write general feedback on what was done well and what was done poorly."

• What was Accepted vs. Rejected:
  - REJECTED: Arbitrary 0–100 scoring and free-form advice.
  - ACCEPTED: A rigid, evidence-based rubric schema requiring the model to return
    structured criteria evaluations:
    { criterion, score (1–5), evidence, concern, suggestion, confidence }

• Why (Engineering Judgment):
  - Unconstrained LLM scores are notoriously inconsistent and prone to drift
    between identical submissions.
  - Forcing the model to cite exact code snippets as evidence grounds the evaluation
    in reality and prevents generic hallucinations (such as recommending a Factory
    Pattern when not needed).
  - A structured 1–5 scale across 5 defined criteria gives learners clear,
    actionable targets for their next refactoring attempt.


Decision 3: Architectural Extensibility & The Two Change Tests
--------------------------------------------------------------------------------
• What the AI Suggested:
  Putting the parser, LLM client, and evaluation logic inside a single monolithic
  `EvaluationService.evaluate()` procedural function.

• What was Accepted vs. Rejected:
  - REJECTED: Procedural evaluation method.
  - ACCEPTED: Applying the Strategy Pattern (`ISubmissionContent`) and the
    Composite Pattern (`IEvaluationStrategy` orchestrated by `CompositeEvaluator`).

• Why (Engineering Judgment):
  - The Candidate Helping Guide explicitly highlighted two future requirements:
    * Change Test A: Supporting new submission formats (like visual canvas diagrams).
    * Change Test B: Adding rule-based linters or human reviewers.
  - A monolithic script would have required rewriting core domain code for either
    change. By decoupling submission content behind `ISubmissionContent` and
    evaluators behind `IEvaluationStrategy`, both change tests were satisfied with
    ZERO modifications to `Problem`, `Attempt`, or the practice loop.


Decision 4: Infrastructure Scope — Distributed Queues vs. Modular Monolith
--------------------------------------------------------------------------------
• What the AI Suggested:
  Setting up an asynchronous event-driven architecture with RabbitMQ/Kafka, Redis
  caching, and a Python worker microservice to handle LLM calls.

• What was Accepted vs. Rejected:
  - REJECTED: Message brokers, Redis caches, and multi-service deployments.
  - ACCEPTED: A clean, modular TypeScript monolith with an explicit domain state
    machine (SUBMITTED -> EVALUATING -> COMPLETED / FAILED) and in-process async
    execution.

• Why (Engineering Judgment):
  - The assignment guidelines specifically warned: "Do not spend the majority of
    your time on Kubernetes, microservices... A simple monolith is completely acceptable."
  - Message brokers introduce deployment overhead and failure modes without adding
    value to the learner's practice loop.
  - The modular monolith boots instantly, runs the full test suite in ~600ms, deploys
    to Vercel with zero operational friction, and provides 100% availability.
