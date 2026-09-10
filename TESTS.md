# Automated Tests & Edge Case Verification

**Deliverable**: Test Suite Documentation & Invariants  
**Framework**: Vitest  
**Status**: 9 Tests Passing (100% Success)  

---

## 1. How to Run the Tests

From the project root:

```powershell
# Single Run
npm test

# Live Watcher Mode
npm run test:watch
```

The test suite runs in under 1 second with zero external dependencies or mock servers.

---

## 2. Test Invariants & Suites

### Group 1: Domain Invariants (`tests/domain.test.ts`)
- **Entity Coverage Check**: Verifies that `Problem.checkEntityCoverage()` correctly maps extracted class names against mandatory domain entities, distinguishing between present and missing concepts.
- **Attempt Immutability & Version Progression**: Ensures the `Attempt` aggregate root increments versions monotonically (`v1` $\rightarrow$ `v2`), keeps historical submissions immutable, and pairs each evaluation with its corresponding version.
- **Structural Token Parsing**: Verifies that `StructuredSubmissionContent` extracts classes, interfaces, and method signatures reliably.

### Group 2: Evaluator Rules & Anti-Pattern Detection (`tests/evaluation.test.ts`)
- **God Class Detection (Single Responsibility Principle)**: Tests that when a class defines 6 or more methods, the deterministic analyzer flags a "God Class Tendency" warning, citing the offending class name.
- **Missing Interface Abstractions (Dependency Inversion Principle)**: Tests that if a submission defines concrete classes with zero interfaces, the system flags a critical "Lack of Interface Abstraction" finding.
- **Composite Pipeline Orchestration**: Verifies that `CompositeEvaluator` executes multiple evaluation strategies seamlessly and aggregates deterministic findings with rubric assessments.

### Group 3: Candidate Guide Change Tests (`tests/change_tests.test.ts`)
- **Change Test A (New Submission Formats)**: Simulates adding a new diagram-based or JSON canvas submission format. A new `CustomVisualSubmissionContent` class implementing `ISubmissionContent` is passed to the domain with **zero modifications** to `Problem`, `Attempt`, or the evaluators.
- **Change Test B (New Evaluator Strategies)**: Simulates adding a human reviewer or rule-based AST linter. A custom `CustomMockHumanReviewEvaluator` implementing `IEvaluationStrategy` is plugged into `CompositeEvaluator` with **zero modifications** to `PracticeService` or `Attempt`.

### Group 4: End-to-End Practice Loop (`tests/practice_service.test.ts`)
- **Complete Practice Flow**: Integrates submission creation, domain entity verification, deterministic anti-pattern analysis, and rubric evaluation end-to-end.
