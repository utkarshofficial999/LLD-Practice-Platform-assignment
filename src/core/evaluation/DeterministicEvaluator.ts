import { IEvaluationStrategy, StageEvaluationResult } from './IEvaluationStrategy.ts';
import { Submission } from '../domain/Submission.ts';
import { Problem } from '../domain/Problem.ts';
import { AntiPatternFlag, DeterministicFindings } from '../domain/Feedback.ts';

export class DeterministicEvaluator implements IEvaluationStrategy {
  public readonly name = 'Deterministic Static Evaluator';

  public async evaluate(submission: Submission, problem: Problem): Promise<StageEvaluationResult> {
    const structuralModel = submission.content.extractStructuralModel();
    const allClassesAndInterfaces = [...structuralModel.classes, ...structuralModel.interfaces];

    // 1. Entity Coverage Matrix
    const entityCoverage = problem.checkEntityCoverage(allClassesAndInterfaces);

    // 2. Anti-pattern detection
    const antiPatternFlags: AntiPatternFlag[] = [];

    // Check for God Classes (classes with excessive methods)
    for (const [className, methods] of Object.entries(structuralModel.methodsByClass)) {
      if (methods.length >= 6) {
        antiPatternFlags.push({
          name: 'God Class Tendency',
          severity: 'warning',
          details: `Class '${className}' has ${methods.length} methods (${methods.slice(0, 4).join(', ')}...). Consider decomposing into specialized strategy/service objects to adhere to Single Responsibility Principle.`,
          offendingElement: className,
        });
      }
    }

    // Check for missing interfaces/abstractions
    if (structuralModel.classes.length >= 1 && structuralModel.interfaces.length === 0) {
      antiPatternFlags.push({
        name: 'Lack of Interface Abstraction',
        severity: 'critical',
        details: 'The design relies entirely on concrete classes without defining interfaces for key dependencies. This tightly couples components and violates the Dependency Inversion Principle.',
      });
    }

    // Check if missing critical core entities
    const missingEntities = entityCoverage.filter((e) => !e.matched).map((e) => e.entity);
    if (missingEntities.length > 0) {
      antiPatternFlags.push({
        name: 'Missing Domain Entities',
        severity: missingEntities.length > 2 ? 'critical' : 'warning',
        details: `The design is missing key problem domain concepts: ${missingEntities.join(', ')}.`,
      });
    }

    const findings: DeterministicFindings = {
      entityCoverage,
      detectedClasses: structuralModel.classes,
      detectedInterfaces: structuralModel.interfaces,
      relationshipCount: structuralModel.relationships.length,
      antiPatternFlags,
    };

    return {
      stageName: this.name,
      success: true,
      deterministicFindings: findings,
    };
  }
}
