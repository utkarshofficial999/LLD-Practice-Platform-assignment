================================================================================
                         README: LLD PRACTICE PLATFORM
              SYSTEM GUIDE, SETUP, ARCHITECTURE & DECISIONS
================================================================================

1. PROJECT OVERVIEW
--------------------------------------------------------------------------------
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


2. DELIVERABLES SUMMARY
--------------------------------------------------------------------------------
This project includes complete deliverables matching the submission criteria:
1. Research Note        -> RESEARCH_NOTE.txt / RESEARCH_NOTE.md
2. Design Note          -> DESIGN_NOTE.txt / DESIGN_NOTE.md
3. Working Prototype    -> WORKING_PROTOTYPE.txt (Live on Vercel)
4. Tests                -> TESTS.txt (9 automated Vitest test cases)
5. README + AI Usage    -> README.txt + AI_USAGE.txt / AI_USAGE.md


3. QUICK START & RUN INSTRUCTIONS
--------------------------------------------------------------------------------
Prerequisites: Node.js (v18+) and npm.

Step 1: Install Dependencies
   npm install

Step 2: Environment Setup
   Create a `.env` file in the project root:
   GROQ_API_KEY=your_groq_api_key_here

Step 3: Run Locally (Concurrently starts Server on 3001 & Client on 5173)
   npm run dev

Step 4: Open in Browser
   http://localhost:5173

Step 5: Run Automated Tests
   npm test


4. CORE ARCHITECTURE & DOMAIN MODEL
--------------------------------------------------------------------------------
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


5. THE TWO ARCHITECTURAL CHANGE TESTS
--------------------------------------------------------------------------------
- Change Test A (New Submission Formats like JSON Canvas / Diagrams):
  Solved via `ISubmissionContent` interface. Adding new formats requires ZERO
  changes to `Problem`, `Attempt`, or `Evaluator` classes.
  Verified in `tests/change_tests.test.ts`.

- Change Test B (New Evaluation Strategies like Rule Linters or Human Review):
  Solved via `IEvaluationStrategy` and `CompositeEvaluator`. Adding human review
  or AST checkers requires ZERO changes to `PracticeService` or `Attempt`.
  Verified in `tests/change_tests.test.ts`.


6. KEY ENGINEERING DECISIONS & LIMITATIONS
--------------------------------------------------------------------------------
Key Decisions:
1. Structured Design Model over Full Executable Code:
   Avoids forcing learners to spend 80% of their time writing getter/setter
   boilerplate or debugging compiler errors instead of reasoning about design.
2. Evidence-Based Rubric over Arbitrary 0-100 Score:
   Requires exact citations from code, preventing ungrounded AI hallucinations.
3. Modular Monolith over Distributed Microservices:
   Eliminated needless operational complexity (Kafka, Redis, Docker), ensuring
   instant setup, fast response times, and high maintainability.

Known Limitations:
- Single Active User Session: The in-memory repository is per-client/server
  instance. A production deployment would persist attempts to PostgreSQL.
- Diagram Rendering: Uses Mermaid.js; advanced free-form drag-and-drop spatial
  positioning would benefit from a dedicated canvas like React Flow.
- Language Focus: Currently optimized for TypeScript/Java/C#-style OOP syntax.
================================================================================
