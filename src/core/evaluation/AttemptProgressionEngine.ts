import { EvaluationResult } from '../domain/Feedback.ts';

export interface CriterionDelta {
  criterion: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  status: 'improved' | 'declined' | 'unchanged';
}

export interface ProgressionReport {
  previousVersion: number;
  currentVersion: number;
  previousOverallScore: number;
  currentOverallScore: number;
  overallScoreDelta: number;
  criteriaDeltas: CriterionDelta[];
  resolvedConcerns: string[];
  newConcerns: string[];
  structuralProgress: {
    classesAdded: string[];
    interfacesAdded: string[];
    antiPatternsResolved: string[];
  };
}

export class AttemptProgressionEngine {
  public static compare(prev: EvaluationResult, curr: EvaluationResult): ProgressionReport {
    const overallScoreDelta = curr.overallScore - prev.overallScore;

    const criteriaDeltas: CriterionDelta[] = [];
    const resolvedConcerns: string[] = [];
    const newConcerns: string[] = [];

    for (const currAssessment of curr.rubricAssessments) {
      const prevAssessment = prev.rubricAssessments.find(
        (p) => p.criterion.toLowerCase() === currAssessment.criterion.toLowerCase()
      );

      const prevScore = prevAssessment ? prevAssessment.score : 0;
      const delta = currAssessment.score - prevScore;

      criteriaDeltas.push({
        criterion: currAssessment.criterion,
        previousScore: prevScore,
        currentScore: currAssessment.score,
        delta,
        status: delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'unchanged',
      });

      if (prevAssessment && prevAssessment.score < 4 && currAssessment.score >= 4) {
        resolvedConcerns.push(
          `Resolved '${currAssessment.criterion}': ${prevAssessment.concern} → Now: ${currAssessment.evidence}`
        );
      } else if (currAssessment.score < 3) {
        newConcerns.push(`Remaining gap in '${currAssessment.criterion}': ${currAssessment.concern}`);
      }
    }

    const prevClasses = new Set(prev.deterministicFindings.detectedClasses);
    const currClasses = new Set(curr.deterministicFindings.detectedClasses);
    const classesAdded = [...currClasses].filter((c) => !prevClasses.has(c));

    const prevIfaces = new Set(prev.deterministicFindings.detectedInterfaces);
    const currIfaces = new Set(curr.deterministicFindings.detectedInterfaces);
    const interfacesAdded = [...currIfaces].filter((i) => !prevIfaces.has(i));

    const prevFlags = new Set(prev.deterministicFindings.antiPatternFlags.map((f) => f.name));
    const currFlags = new Set(curr.deterministicFindings.antiPatternFlags.map((f) => f.name));
    const antiPatternsResolved = [...prevFlags].filter((f) => !currFlags.has(f));

    return {
      previousVersion: prev.version,
      currentVersion: curr.version,
      previousOverallScore: prev.overallScore,
      currentOverallScore: curr.overallScore,
      overallScoreDelta,
      criteriaDeltas,
      resolvedConcerns,
      newConcerns,
      structuralProgress: {
        classesAdded,
        interfacesAdded,
        antiPatternsResolved,
      },
    };
  }
}
