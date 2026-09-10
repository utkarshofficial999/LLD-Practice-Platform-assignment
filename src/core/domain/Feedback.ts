import { EntityCoverageResult } from './Problem.ts';

export interface RubricAssessment {
  criterion: string;
  score: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
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
    public readonly overallScore: number,
    public readonly rubricAssessments: RubricAssessment[],
    public readonly deterministicFindings: DeterministicFindings,
    public readonly actionableSummary: string[],
    public readonly evaluatedAt: Date = new Date(),
    public readonly evaluationSource: 'deterministic' | 'hybrid-ai' | 'fallback' = 'hybrid-ai'
  ) {}

  public getAssessment(criterionName: string): RubricAssessment | undefined {
    return this.rubricAssessments.find((a) =>
      a.criterion.toLowerCase().includes(criterionName.toLowerCase())
    );
  }
}
