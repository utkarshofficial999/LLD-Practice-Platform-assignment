# LLD Practice Platform 🚀
> A focused, domain-driven practice platform for Low-Level System Design (LLD) with hybrid deterministic static analysis and explainable AI rubric evaluation.

---

## 📖 Table of Contents
1. [Core Philosophy & Practice Loop](#-core-philosophy--practice-loop)
2. [Domain Architecture (LLD Focus)](#-domain-architecture-lld-focus)
3. [The Two Change Tests](#-the-two-change-tests)
4. [Hybrid Evaluation Approach](#-hybrid-evaluation-approach)
5. [Deliverables Overview](#-deliverables-overview)
6. [Getting Started (Setup & Run)](#-getting-started-setup--run)
7. [Running the Test Suite](#-running-the-test-suite)
8. [Trade-offs & Engineering Decisions](#-trade-offs--engineering-decisions)

---

## 🎯 Core Philosophy & Practice Loop

Low-Level Design practice is often easy to start but notoriously difficult to evaluate. Unlike algorithmic problems with binary pass/fail test cases, real-world object-oriented design is about **trade-offs, responsibility partitioning, and decoupled abstractions**.

This platform delivers an intuitive, distraction-free practice experience centered on the iterative learning loop:
$$\text{Choose Problem} \longrightarrow \text{Think \& Model} \longrightarrow \text{Submit} \longrightarrow \text{Explainable Feedback} \longrightarrow \text{Review} \longrightarrow \text{Try Again (Attempt 2)}$$

---

## 🏛 Domain Architecture (LLD Focus)

The core domain layer (`src/core/domain/`) follows Clean Architecture with zero external framework coupling:

- **`Problem`**: Holds problem description, required domain concept checklist (`ParkingSpot`, `Ticket`, `PaymentStrategy`), key expectations, and rubric criteria.
- **`Attempt`** *(Aggregate Root)*: Manages an evolving learner session across multiple version iterations (`version 1`, `version 2`), ensuring submissions are immutable and evaluation results are tracked.
- **`Submission`**: Captures a snapshot of student work with an idempotency key and explicit lifecycle state transitions (`SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `COMPLETED` / `FAILED`).
- **`ISubmissionContent`** *(Strategy Pattern)*: Encapsulates submission representations (Code Skeleton, Live UML Diagram, Design Rationale) without leaking format details to evaluators.
- **`EvaluationResult`** & **`RubricAssessment`**: Delivers consistent, evidence-backed evaluation outputs:
  $$\text{criterion} \longrightarrow \text{score (1–5)} \longrightarrow \text{evidence citation} \longrightarrow \text{concern} \longrightarrow \text{actionable suggestion} \longrightarrow \text{confidence}$$

---

## 🧩 The Two Change Tests

Per the Candidate Helping Guide, our architecture explicitly aces both change tests:

### Change Test A: New Submission Formats
> *"Today the learner submits text/code. Later the platform supports a class diagram or JSON canvas. How much of your domain model changes?"*
- **Answer**: **Zero changes** to `Problem`, `Attempt`, or `Evaluators`.
- `Submission` accepts an `ISubmissionContent` strategy. Adding visual diagram submissions only requires a new class implementing `ISubmissionContent`. Verified in automated tests (`tests/change_tests.test.ts`).

### Change Test B: New Evaluation Strategies
> *"Today feedback comes from one evaluator. Later you add a rule-based evaluator or human review. Can you add it without rewriting the practice flow?"*
- **Answer**: **Zero changes** to `PracticeService` or `Attempt`.
- Evaluators implement `IEvaluationStrategy` orchestrated via `CompositeEvaluator`. Adding human review or specialized AST linters is done by calling `composite.addStrategy(new HumanReviewEvaluator())`. Verified in automated tests (`tests/change_tests.test.ts`).

---

## 🔬 Hybrid Evaluation Approach

| Evaluation Type | Engine | Responsibilities |
|---|---|---|
| **Deterministic** | `DeterministicEvaluator` | Regex/AST class extraction, required domain entity coverage matrix, anti-pattern detection (God Class $>6$ methods, missing interface abstractions). |
| **Probabilistic** | `AIEvaluator` | SOLID principles evaluation, separation of concerns, pattern appropriateness, trade-off rationale depth, constructive "Next Attempt" advice. |
| **Synthesis & Diffing** | `AttemptProgressionEngine` | Compares Attempt $V_1$ vs Attempt $V_2$, highlights score deltas (+20%), identifies resolved concerns, and lists structural additions. |

---

## 📂 Deliverables Overview

1. [RESEARCH_NOTE.md](file:///e:/LLD%20Practice%20Platform/RESEARCH_NOTE.md): Learner problem analysis, existing tool research (Educative, LeetCode, Mock interviews), key gaps, and product direction.
2. [DESIGN_NOTE.md](file:///e:/LLD%20Practice%20Platform/DESIGN_NOTE.md): MVP architecture, domain model, class diagrams, change tests, evaluation division, and practical scaling.
3. [AI_USAGE.md](file:///e:/LLD%20Practice%20Platform/AI_USAGE.md): 4 concrete AI-assisted engineering decisions: suggestions accepted vs rejected, and technical rationale.
4. [Full Automated Test Suite](file:///e:/LLD%20Practice%20Platform/tests/): Vitest tests covering domain logic, Change Tests A & B, evaluators, anti-patterns, and progression deltas.
5. **Interactive Working Prototype**: React + Express + Mermaid live diagramming + dark mode glassmorphic UI.

---

## 🚀 Getting Started (Setup & Run)

### Prerequisites
- Node.js `v18+` (tested on Node `v24.11`)
- npm `v9+`

### Installation
```powershell
# Clone repository
git clone https://github.com/utkarshofficial999/LLD-Practice-Platform-assignment.git
cd LLD-Practice-Platform-assignment

# Install dependencies
npm install
```

### Running Locally (Frontend + Backend Concurrently)
```powershell
npm run dev
```
- **Web UI**: Open your browser at [http://localhost:5173](http://localhost:5173)
- **API Server**: Running at `http://localhost:3001`

---

## 🧪 Running the Test Suite

```powershell
npm test
```
Runs the full suite of Vitest unit and integration tests:
- `tests/domain.test.ts`: Domain models, entity coverage, and attempt state transitions.
- `tests/change_tests.test.ts`: Change Test A and Change Test B proofs.
- `tests/evaluation.test.ts`: Anti-pattern detection, structured rubric validation, and progression engine.
- `tests/practice_service.test.ts`: Complete end-to-end practice loop integration.

---

## ⚖️ Trade-offs & Engineering Decisions

1. **Modular Monolith over Microservices**: Built as a cohesive TypeScript monolith. Microservices would introduce network hops and serialization overhead without providing learner value.
2. **Dual-Mode AI Engine**: Works 100% out-of-the-box using the local semantic reasoning engine with zero external API key requirements, while supporting live Gemini/OpenAI API keys when configured.
3. **Structured Design Model over Sandboxed Execution**: Avoids tedious boilerplate and compilation errors, maximizing learner focus on object-oriented architecture and trade-offs.
