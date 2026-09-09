import { IEvaluationStrategy } from './IEvaluationStrategy.ts';
import { DeterministicEvaluator } from './DeterministicEvaluator.ts';
import { AIEvaluator } from './AIEvaluator.ts';
import { Submission } from '../domain/Submission.ts';
import { Problem } from '../domain/Problem.ts';
import { EvaluationResult, RubricAssessment, DeterministicFindings } from '../domain/Feedback.ts';

export class CompositeEvaluator {
  private readonly strategies: IEvaluationStrategy[] = [];

  constructor(strategies?: IEvaluationStrategy[]) {
    if (strategies && strategies.length > 0) {
      this.strategies = strategies;
    } else {
      // Default pipeline: Deterministic checks first, then AI qualitative judgment
      this.strategies = [
        new DeterministicEvaluator(),
        new AIEvaluator(process.env.GROQ_API_KEY, process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
      ];
    }
  }

  /**
   * Adds a new evaluation strategy. Directly demonstrates Change Test B (e.g. human review or custom linters).
   */
  public addStrategy(strategy: IEvaluationStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Orchestrates the evaluation pipeline with timeout guard and fallback.
   */
  public async evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult> {
    let deterministicFindings: DeterministicFindings = {
      entityCoverage: [],
      detectedClasses: [],
      detectedInterfaces: [],
      relationshipCount: 0,
      antiPatternFlags: [],
    };

    let rubricAssessments: RubricAssessment[] = [];
    let evaluationSource: EvaluationResult['evaluationSource'] = 'hybrid-ai';

    for (const strategy of this.strategies) {
      try {
        // Enforce 10-second timeout per evaluation stage
        const stageResult = await Promise.race([
          strategy.evaluate(submission, problem),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout in stage: ${strategy.name}`)), 10000)
          ),
        ]);

        if (stageResult.deterministicFindings) {
          deterministicFindings = stageResult.deterministicFindings;
        }

        if (stageResult.rubricAssessments) {
          rubricAssessments = stageResult.rubricAssessments;
        }
      } catch (stageError) {
        console.warn(`Evaluation stage [${strategy.name}] encountered an issue:`, stageError);
        evaluationSource = 'fallback';
      }
    }

    // If AI failed or produced no assessments, synthesize fallback assessments from deterministic findings
    if (rubricAssessments.length === 0) {
      rubricAssessments = this.createFallbackRubric(deterministicFindings, problem);
      evaluationSource = 'fallback';
    }

    // Compute overall score (0 to 100) based on average of 1-5 scale
    const totalScore = rubricAssessments.reduce((sum, a) => sum + a.score, 0);
    const maxScore = rubricAssessments.length * 5;
    const overallScore = Math.round((totalScore / maxScore) * 100);

    // Extract top actionable improvement suggestions
    const actionableSummary: string[] = rubricAssessments
      .filter((a) => a.score < 5)
      .map((a) => `[${a.criterion}]: ${a.suggestion}`)
      .slice(0, 3);

    if (actionableSummary.length === 0) {
      actionableSummary.push('Outstanding design! Explore multi-threading locks or distributed partition strategies next.');
    }

    return new EvaluationResult(
      submission.id,
      submission.version,
      overallScore,
      rubricAssessments,
      deterministicFindings,
      actionableSummary,
      new Date(),
      evaluationSource
    );
  }

  private createFallbackRubric(findings: DeterministicFindings, problem: Problem): RubricAssessment[] {
    const coverage = findings.entityCoverage;
    const matchedCount = coverage.filter((c) => c.matched).length;
    const ratio = coverage.length > 0 ? matchedCount / coverage.length : 1.0;

    return [
      {
        criterion: 'Requirement Coverage & Domain Completeness',
        score: ratio >= 0.8 ? 4 : ratio >= 0.5 ? 3 : 2,
        evidence: `Deterministic scan detected ${findings.detectedClasses.length} classes and ${matchedCount}/${coverage.length} required entities.`,
        concern: ratio < 0.8 ? 'Some domain entities were not identified.' : 'No major entity gaps.',
        suggestion: 'Ensure all domain models are declared with clear boundaries.',
        confidence: 0.85,
      },
      {
        criterion: 'Coupling & Abstraction (SOLID)',
        score: findings.detectedInterfaces.length > 0 ? 4 : 2,
        evidence: `Detected ${findings.detectedInterfaces.length} interfaces.`,
        concern: findings.detectedInterfaces.length === 0 ? 'No interfaces detected.' : 'Good abstraction foundation.',
        suggestion: 'Use interfaces for all major dependencies.',
        confidence: 0.8,
      },
    ];
  }
}
