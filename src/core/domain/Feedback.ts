import { EntityCoverageResult } from './Problem.ts';

export interface RubricAssessment {
  criterion: string;
  score: number; // 1 to 5
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number; // 0.0 to 1.0
}

export interface AntiPatternFlag {
  name: string;
  severity: 'info' | 'warning' | 'critical';
  details: string;
  offendingElement?: string;
}

export interface DeterministicFindings {
  entityCoverage: EntityCoverageResult[];
  detectedClasses: string[];
  detectedInterfaces: string[];
  relationshipCount: number;
  antiPatternFlags: AntiPatternFlag[];
}

export class EvaluationResult {
  constructor(
    public readonly submissionId: string,
    public readonly version: number,
    public readonly overallScore: number, // 0 to 100
    public readonly rubricAssessments: RubricAssessment[],
    public readonly deterministicFindings: DeterministicFindings,
    public readonly actionableSummary: string[],
    public readonly evaluatedAt: Date = new Date(),
    public readonly evaluationSource: 'deterministic' | 'hybrid-ai' | 'fallback' = 'hybrid-ai'
  ) {}

  /**
   * Helper to fetch a specific criterion assessment
   */
  public getAssessment(criterionName: string): RubricAssessment | undefined {
    return this.rubricAssessments.find((a) =>
      a.criterion.toLowerCase().includes(criterionName.toLowerCase())
    );
  }
}
