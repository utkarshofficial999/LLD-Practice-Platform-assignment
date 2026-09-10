export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface RubricDefinition {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface StarterTemplate {
  skeleton: string;
  rationale: string;
  diagramMermaid: string;
}

export interface EntityCoverageResult {
  entity: string;
  matched: boolean;
  detectedName?: string;
}

export class Problem {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly difficulty: ProblemDifficulty,
    public readonly description: string,
    public readonly requiredEntities: string[],
    public readonly keyExpectations: string[],
    public readonly rubric: RubricDefinition[],
    public readonly starterTemplate: StarterTemplate
  ) {}

  public checkEntityCoverage(detectedEntities: string[]): EntityCoverageResult[] {
    const normalizedDetected = detectedEntities.map((e) => e.toLowerCase().replace(/[^a-z0-9]/g, ''));

    return this.requiredEntities.map((req) => {
      const normalizedReq = req.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchedName = detectedEntities.find((detected) => {
        const norm = detected.toLowerCase().replace(/[^a-z0-9]/g, '');
        return norm === normalizedReq || norm.includes(normalizedReq) || normalizedReq.includes(norm);
      });

      return {
        entity: req,
        matched: !!matchedName,
        detectedName: matchedName,
      };
    });
  }
}
