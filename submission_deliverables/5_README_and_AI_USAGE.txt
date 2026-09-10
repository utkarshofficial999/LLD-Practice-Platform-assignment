================================================================================
                    DELIVERABLE 5: README + AI_USAGE
================================================================================

PART 1: README (SYSTEM OVERVIEW, SETUP, ARCHITECTURE & DECISIONS)
--------------------------------------------------------------------------------

1. PROJECT OVERVIEW
LLD Practice Platform is a focused Low-Level System Design (LLD) practice
application designed to help software engineers transition from writing
functional algorithms to architecting scalable, decoupled, and maintainable
software systems.

Unlike Data Structures & Algorithms platforms where solutions are binary
(pass/fail), object-oriented design is fundamentally about trade-offs,
abstractions, and separation of concerns.

Key Features:
- Real-world curated problem scenarios (Parking Lot System, Elevator Dispatcher).
- Three-Panel Studio: Specification & requirements on the left, interactive
  multi-tab editor (TypeScript skeleton, live Mermaid UML class diagram, design
  rationale) in the center, and explainable AI rubric feedback on the right.
- Hybrid Evaluation: Deterministic static rules engine (checks entity coverage,
  God Classes, missing interfaces) paired with evidence-backed AI judgment.
- Version Progression & Comparison: Automatic versioning (v1 -> v2) with
  side-by-side progression reporting highlighting resolved issues and score deltas.
- 100% Uptime Architecture: Works both with local/serverless Node backend and
  gracefully falls back to in-browser client evaluation when network fails.

2. QUICK START & RUN INSTRUCTIONS
Prerequisites: Node.js (v18+) and npm.

Step 1: Install Dependencies
   npm install

Step 2: Environment Setup
   Create a `.env` file in the project root:
   GROQ_API_KEY=your_groq_api_key_here

Step 3: Run Locally (Starts Server on 3001 & Client on 5173 concurrently)
   npm run dev

Step 4: Open in Browser
   http://localhost:5173

Step 5: Run Automated Tests
   npm test

3. CORE ARCHITECTURE & DOMAIN MODEL
Organized under Clean Architecture principles (`src/core/domain/`):
- `Problem`: Domain challenge definition, required entity checklist, expectations.
- `Attempt` (Aggregate Root): Continuous session managing versioned submissions.
- `Submission` (Entity): Immutable snapshot with idempotency key and explicit
  lifecycle transitions (`SUBMITTED` -> `EVALUATING` -> `COMPLETED` / `FAILED`).
- `ISubmissionContent` (Strategy): Encapsulates code skeleton, UML diagram, and
  rationale, allowing arbitrary submission formats without domain changes.
- `IEvaluationStrategy` & `CompositeEvaluator`: Plug-and-play evaluation pipeline
  combining deterministic structural checks with AI rubric assessments.
- `PracticeService`: Application orchestration service for the complete loop.

4. THE TWO ARCHITECTURAL CHANGE TESTS
- Change Test A (New Submission Formats like JSON Canvas / Diagrams):
  Solved via `ISubmissionContent` interface. Adding new formats requires ZERO
  changes to `Problem`, `Attempt`, or `Evaluator` classes.
  Verified in `tests/change_tests.test.ts`.

- Change Test B (New Evaluation Strategies like Rule Linters or Human Review):
  Solved via `IEvaluationStrategy` and `CompositeEvaluator`. Adding human review
  or AST checkers requires ZERO changes to `PracticeService` or `Attempt`.
  Verified in `tests/change_tests.test.ts`.

5. KEY DECISIONS & LIMITATIONS
- Structured Design Model over Full Executable Code: Avoids forcing learners to
  spend 80% of their time writing boilerplate instead of reasoning about design.
- Evidence-Based Rubric over Arbitrary 0-100 Score: Requires exact citations from
  code, preventing ungrounded AI hallucinations.
- Modular Monolith over Distributed Microservices: Eliminates unnecessary
  operational complexity, ensuring instant setup and high maintainability.


================================================================================
PART 2: AI_USAGE (ENGINEERING DECISIONS, TRADEOFFS & SCRUTINY)
--------------------------------------------------------------------------------

DECISION 1: SUBMISSION MODALITY — CODE EXECUTION VS STRUCTURED SKELETON + RATIONALE
- What the AI Suggested:
  Building a full WebAssembly / Docker code sandbox where learners write runnable
  TypeScript/Java code, execute automated unit tests, and measure runtime speed.
- Accepted vs Rejected:
  * REJECTED: Docker / Sandboxed code execution.
  * ACCEPTED: A Structured Design Model consisting of an interface/class skeleton,
    a live visual Mermaid class diagram, and an architectural design rationale.
- Why (Engineering Judgement):
  * Sandboxed code execution tests algorithmic correctness and syntax, not
    object-oriented design quality.
  * Requiring full compilation forces learners to spend 80% of their time
    debugging compiler type errors rather than thinking about responsibilities.
  * The structured skeleton + rationale provides maximum evidence of design
    trade-offs with minimal friction.

DECISION 2: FEEDBACK GENERATION — OPEN-ENDED 0-100 SCORE VS FIXED STRUCTURED RUBRIC
- What the AI Suggested:
  Prompting an LLM with: "Review this student design, rate it from 0 to 100, and
  write feedback on what they did well and poorly."
- Accepted vs Rejected:
  * REJECTED: Unconstrained 0-100 scoring and free-form feedback generation.
  * ACCEPTED: A Fixed Rubric Schema requiring the model to emit a strict JSON shape:
    { criterion, score (1-5), evidence, concern, suggestion, confidence }
- Why (Engineering Judgement):
  * Free-form scores from LLMs are notoriously noisy and drift between runs.
  * Forcing the model to cite exact code evidence grounds the evaluation in
    reality and prevents generic hallucinations.
  * A 1-5 scale per concrete dimension provides actionable clarity for Attempt 2.

DECISION 3: EXTENSIBILITY & THE TWO CHANGE TESTS
- What the AI Suggested:
  Combining submission parsing and evaluation inside a single procedural script.
- Accepted vs Rejected:
  * REJECTED: Monolithic procedural evaluation method.
  * ACCEPTED: Separating submission content via ISubmissionContent (Strategy pattern)
    and decoupling evaluators via IEvaluationStrategy combined under a
    CompositeEvaluator.
- Why (Engineering Judgement):
  * Candidate Guide explicitly highlighted Change Test A (diagram submissions)
    and Change Test B (rule-based / human evaluators).
  * Decoupling ISubmissionContent and IEvaluationStrategy ensures both change tests
    pass cleanly with zero modifications to Problem, Attempt, or the loop.

DECISION 4: RESILIENCE & SCALE — MICROSERVICES / QUEUES VS MODULAR MONOLITH
- What the AI Suggested:
  Implementing an asynchronous event-driven microservices architecture using
  RabbitMQ/Kafka, Redis caching, and a separate Python FastAPI worker service.
- Accepted vs Rejected:
  * REJECTED: Distributed message brokers and multi-service deployments.
  * ACCEPTED: A Single Modular Monolith in TypeScript with immediate persistence
    before evaluation, an explicit domain state machine (SUBMITTED -> EVALUATING
    -> COMPLETED / FAILED), and in-process async evaluation with timeout fallbacks.
- Why (Engineering Judgement):
  * Assignment explicitly cautioned against spending time on Kubernetes or
    microservices.
  * Monolith keeps the architecture maintainable, responsive, and easy to deploy.
================================================================================
