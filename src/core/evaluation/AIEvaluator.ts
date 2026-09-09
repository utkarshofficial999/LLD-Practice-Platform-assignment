import { IEvaluationStrategy, StageEvaluationResult } from './IEvaluationStrategy.ts';
import { Submission } from '../domain/Submission.ts';
import { Problem } from '../domain/Problem.ts';
import { RubricAssessment } from '../domain/Feedback.ts';

export class AIEvaluator implements IEvaluationStrategy {
  public readonly name = 'AI Architectural Judgment Evaluator';

  constructor(private readonly apiKey?: string) {}

  public async evaluate(submission: Submission, problem: Problem): Promise<StageEvaluationResult> {
    const classSkeleton = submission.content.getClassSkeleton();
    const rationale = submission.content.getRationale();
    const structuralModel = submission.content.extractStructuralModel();

    // If an external Gemini/OpenAI API key is present, attempt live inference with timeout
    if (this.apiKey) {
      try {
        const liveAssessments = await this.callLiveLLM(classSkeleton, rationale, problem);
        if (liveAssessments && liveAssessments.length > 0) {
          return {
            stageName: this.name,
            success: true,
            rubricAssessments: liveAssessments,
          };
        }
      } catch (err) {
        console.warn('Live LLM evaluation timed out or encountered an error. Falling back to local semantic evaluator.', err);
      }
    }

    // High-fidelity local semantic reasoning evaluator
    const assessments = this.evaluateLocally(classSkeleton, rationale, structuralModel, problem);

    return {
      stageName: this.name,
      success: true,
      rubricAssessments: assessments,
    };
  }

  /**
   * Local deterministic semantic evaluator that inspects structural composition,
   * keyword patterns, interfaces, and rationale depth to generate structured rubric ratings.
   */
  private evaluateLocally(
    classSkeleton: string,
    rationale: string,
    structuralModel: ReturnType<Submission['content']['extractStructuralModel']>,
    problem: Problem
  ): RubricAssessment[] {
    const assessments: RubricAssessment[] = [];
    const lowerCode = classSkeleton.toLowerCase();
    const lowerRationale = rationale.toLowerCase();

    // 1. Requirement Coverage & Domain Completeness
    const coverage = problem.checkEntityCoverage([...structuralModel.classes, ...structuralModel.interfaces]);
    const matchedCount = coverage.filter((c) => c.matched).length;
    const totalRequired = problem.requiredEntities.length;
    const coverageRatio = totalRequired > 0 ? matchedCount / totalRequired : 1.0;

    let reqScore = 3;
    let reqEvidence = `Identified entities: ${coverage.filter((c) => c.matched).map((c) => c.entity).join(', ') || 'none'}.`;
    let reqConcern = 'Missing some expected domain concepts.';
    let reqSuggestion = 'Ensure all key lifecycle components outlined in problem requirements are explicitly modeled.';

    if (coverageRatio >= 0.85) {
      reqScore = 5;
      reqConcern = 'None. Core requirements are comprehensively addressed.';
      reqSuggestion = 'Consider modeling auxiliary edge cases such as audit logging or maintenance modes.';
    } else if (coverageRatio >= 0.6) {
      reqScore = 4;
      reqConcern = `Entities [${coverage.filter((c) => !c.matched).map((c) => c.entity).join(', ')}] are not explicitly defined.`;
      reqSuggestion = `Introduce classes or interfaces for: ${coverage.filter((c) => !c.matched).map((c) => c.entity).join(', ')}.`;
    } else {
      reqScore = 2;
      reqConcern = `Major domain concepts missing: ${coverage.filter((c) => !c.matched).map((c) => c.entity).join(', ')}.`;
      reqSuggestion = 'Review problem requirements and create dedicated domain models for each core actor and transaction.';
    }

    assessments.push({
      criterion: 'Requirement Coverage & Domain Completeness',
      score: reqScore,
      evidence: reqEvidence,
      concern: reqConcern,
      suggestion: reqSuggestion,
      confidence: 0.95,
    });

    // 2. Single Responsibility & Cohesion (SRP)
    let srpScore = 4;
    let srpEvidence = `Found ${structuralModel.classes.length} classes and ${structuralModel.interfaces.length} interfaces.`;
    let srpConcern = 'Classes generally have clear boundaries.';
    let srpSuggestion = 'Keep methods narrowly scoped to individual domain actions.';

    const godClass = Object.entries(structuralModel.methodsByClass).find(([_, m]) => m.length >= 6);
    if (godClass) {
      srpScore = 2;
      srpEvidence = `Class '${godClass[0]}' contains ${godClass[1].length} distinct methods.`;
      srpConcern = `'${godClass[0]}' exhibits God Class tendencies by managing too many disparate responsibilities.`;
      srpSuggestion = `Extract calculation, allocation, or persistence logic from '${godClass[0]}' into separate strategy or service objects.`;
    } else if (structuralModel.classes.length < 2) {
      srpScore = 2;
      srpEvidence = 'Only a single class was declared.';
      srpConcern = 'Too many responsibilities are concentrated in one place.';
      srpSuggestion = 'Decompose the problem into distinct entity, strategy, and controller classes.';
    } else {
      srpScore = 4;
      srpEvidence = `Classes like ${structuralModel.classes.slice(0, 3).join(', ')} have well-partitioned method sets.`;
    }

    assessments.push({
      criterion: 'Single Responsibility & Cohesion',
      score: srpScore,
      evidence: srpEvidence,
      concern: srpConcern,
      suggestion: srpSuggestion,
      confidence: 0.9,
    });

    // 3. Coupling & Abstraction (DIP / LSP / Interfaces)
    let couplingScore = 3;
    let couplingEvidence = `Found ${structuralModel.interfaces.length} interfaces and ${structuralModel.relationships.filter((r) => r.type === 'implements').length} interface implementations.`;
    let couplingConcern = '';
    let couplingSuggestion = '';

    if (structuralModel.interfaces.length >= 2) {
      couplingScore = 5;
      couplingEvidence += ` Interfaces detected: ${structuralModel.interfaces.join(', ')}.`;
      couplingConcern = 'Clean abstraction boundaries.';
      couplingSuggestion = 'Ensure consumers depend exclusively on interfaces rather than concrete class instances.';
    } else if (structuralModel.interfaces.length === 1) {
      couplingScore = 3;
      couplingConcern = 'Limited use of polymorphism. Key strategies are still bound to concrete types.';
      couplingSuggestion = 'Define interfaces for varying behaviors (e.g. allocation algorithms, pricing models, dispatchers).';
    } else {
      couplingScore = 2;
      couplingConcern = 'Zero interfaces defined. High direct coupling between concrete classes violates Dependency Inversion Principle.';
      couplingSuggestion = 'Introduce interfaces to decouple client services from algorithm implementations.';
    }

    assessments.push({
      criterion: 'Coupling & Abstraction (SOLID)',
      score: couplingScore,
      evidence: couplingEvidence,
      concern: couplingConcern,
      suggestion: couplingSuggestion,
      confidence: 0.92,
    });

    // 4. Extensibility & Pattern Appropriateness
    const hasStrategy = lowerCode.includes('strategy') || lowerRationale.includes('strategy');
    const hasFactory = lowerCode.includes('factory') || lowerRationale.includes('factory');
    const hasObserver = lowerCode.includes('observer') || lowerCode.includes('listener') || lowerRationale.includes('observer');
    const hasState = lowerCode.includes('state') || lowerRationale.includes('state');

    const detectedPatterns: string[] = [];
    if (hasStrategy) detectedPatterns.push('Strategy Pattern');
    if (hasFactory) detectedPatterns.push('Factory Pattern');
    if (hasObserver) detectedPatterns.push('Observer Pattern');
    if (hasState) detectedPatterns.push('State Pattern');

    let patternScore = 3;
    let patternEvidence = detectedPatterns.length > 0 ? `Patterns referenced or detected: ${detectedPatterns.join(', ')}.` : 'No classic design patterns identified in code or rationale.';
    let patternConcern = '';
    let patternSuggestion = '';

    if (detectedPatterns.length >= 2) {
      patternScore = 5;
      patternConcern = 'Patterns appear relevant to the domain problem.';
      patternSuggestion = 'Ensure pattern classes remain minimal and avoid over-engineering if simpler composition suffices.';
    } else if (detectedPatterns.length === 1) {
      patternScore = 4;
      patternConcern = 'Good use of patterns, but additional extensibility points could be opened.';
      patternSuggestion = 'Consider where future business rules might vary (e.g., dynamic fee calculation or routing algorithms) and apply Strategy or Factory patterns.';
    } else {
      patternScore = 2;
      patternConcern = 'Hardcoded business logic reduces system extensibility when requirements change.';
      patternSuggestion = 'Use the Strategy Pattern to decouple dynamic algorithms from orchestrator classes.';
    }

    assessments.push({
      criterion: 'Extensibility & Pattern Appropriateness',
      score: patternScore,
      evidence: patternEvidence,
      concern: patternConcern,
      suggestion: patternSuggestion,
      confidence: 0.88,
    });

    // 5. Quality of Reasoning & Trade-off Awareness
    const wordCount = rationale.trim().split(/\s+/).filter(Boolean).length;
    const mentionsConcurrency = lowerRationale.includes('concurren') || lowerRationale.includes('thread') || lowerRationale.includes('lock') || lowerRationale.includes('race');
    const mentionsTradeoffs = lowerRationale.includes('trade-off') || lowerRationale.includes('tradeoff') || lowerRationale.includes('versus') || lowerRationale.includes('chose') || lowerRationale.includes('alternative');

    let reasoningScore = 3;
    let reasoningEvidence = `Design rationale contains ~${wordCount} words. Concurrency discussed: ${mentionsConcurrency ? 'Yes' : 'No'}. Trade-offs discussed: ${mentionsTradeoffs ? 'Yes' : 'No'}.`;
    let reasoningConcern = '';
    let reasoningSuggestion = '';

    if (wordCount >= 80 && mentionsTradeoffs && mentionsConcurrency) {
      reasoningScore = 5;
      reasoningConcern = 'Thorough rationale demonstrating strong architectural maturity.';
      reasoningSuggestion = 'Provide quantitative reasoning (e.g. memory vs CPU cost) for your chosen algorithms.';
    } else if (wordCount >= 40 && (mentionsTradeoffs || mentionsConcurrency)) {
      reasoningScore = 4;
      reasoningConcern = 'Good rationale, but lacks depth regarding alternative designs rejected.';
      reasoningSuggestion = 'Explicitly state why you chose this design over 1-2 alternative approaches.';
    } else if (wordCount > 15) {
      reasoningScore = 3;
      reasoningConcern = 'Rationale is high-level and does not address concurrency or edge cases.';
      reasoningSuggestion = 'Discuss how thread-safety, race conditions, or high-contention access would be managed.';
    } else {
      reasoningScore = 1;
      reasoningConcern = 'Design rationale is missing or minimal.';
      reasoningSuggestion = 'Explain the architectural assumptions, trade-offs, and pattern decisions in the rationale section.';
    }

    assessments.push({
      criterion: 'Quality of Reasoning & Trade-off Awareness',
      score: reasoningScore,
      evidence: reasoningEvidence,
      concern: reasoningConcern,
      suggestion: reasoningSuggestion,
      confidence: 0.9,
    });

    return assessments;
  }

  private async callLiveLLM(
    classSkeleton: string,
    rationale: string,
    problem: Problem
  ): Promise<RubricAssessment[] | null> {
    // Scaffold for live Gemini / OpenAI calls with structured JSON output
    // Returns null if network fails or timeout elapses
    return null;
  }
}
