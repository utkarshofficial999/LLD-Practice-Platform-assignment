# LLD Practice Platform

A domain-driven practice platform for Low-Level System Design (LLD), featuring
hybrid deterministic static analysis and evidence-based AI rubric evaluation.

--------------------------------------------------------------------------------
1. Why We Built This
--------------------------------------------------------------------------------
Practicing Low-Level Design (LLD) is notoriously difficult for self-directed
engineers. Unlike algorithms platforms where code either passes or fails unit tests,
object-oriented design is about trade-offs, clean responsibilities, and extensible
abstractions.

We built this platform to give learners what has always been missing:
an instant, objective, and evidence-backed feedback loop that tracks design growth
over multiple iterations.


--------------------------------------------------------------------------------
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


--------------------------------------------------------------------------------
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


--------------------------------------------------------------------------------
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


--------------------------------------------------------------------------------
5. Project Structure
--------------------------------------------------------------------------------
src/
├── core/
│   ├── domain/         # Pure domain entities (Problem, Attempt, Submission, Feedback)
│   ├── evaluation/     # Hybrid evaluators (Deterministic, AI, Composite, Progression)
│   ├── repositories/   # Storage interfaces and in-memory repositories
│   └── services/       # PracticeService application orchestrator
├── server/             # Express API application & Vercel serverless adapter
└── client/             # React 19 UI, three-panel studio, Mermaid UML visualizer, theme
tests/                  # 9 automated Vitest test suites (domain, evaluation, change tests)
submission_deliverables/# Plain-text copies formatted for assessment upload
