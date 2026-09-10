import { describe, it, expect } from 'vitest';
import { ISubmissionContent, StructuralModel } from '../src/core/domain/Submission.ts';
import { Problem } from '../src/core/domain/Problem.ts';
import { Attempt } from '../src/core/domain/Attempt.ts';
import { IEvaluationStrategy, StageEvaluationResult } from '../src/core/evaluation/IEvaluationStrategy.ts';
import { CompositeEvaluator } from '../src/core/evaluation/CompositeEvaluator.ts';
import { DeterministicEvaluator } from '../src/core/evaluation/DeterministicEvaluator.ts';

describe('Candidate Helping Guide: The Two Change Tests', () => {
  it('Change Test A: Can support a new Diagram format without changing domain entities', () => {
    class CustomDiagramSubmission implements ISubmissionContent {
      public readonly formatType = 'visual-canvas-json';

      constructor(private readonly nodes: { name: string; type: 'class' | 'interface' }[]) {}

      getRawContent(): string {
        return JSON.stringify(this.nodes);
      }
      getClassSkeleton(): string {
        return '';
      }
      getRationale(): string {
        return 'Visual diagram design rationale';
      }
      getDiagramMermaid(): string {
        return 'classDiagram\nclass A';
      }
      extractStructuralModel(): StructuralModel {
        return {
          classes: this.nodes.filter((n) => n.type === 'class').map((n) => n.name),
          interfaces: this.nodes.filter((n) => n.type === 'interface').map((n) => n.name),
          relationships: [],
          methodsByClass: {},
        };
      }
    }

    const diagramSubmission = new CustomDiagramSubmission([
      { name: 'ParkingSpot', type: 'class' },
      { name: 'IPaymentStrategy', type: 'interface' },
    ]);

    const attempt = new Attempt('att-test', 'prob-1');
    const submission = attempt.createNextSubmission(diagramSubmission, 'idem-diagram');

    expect(submission.content.formatType).toBe('visual-canvas-json');
    const model = submission.content.extractStructuralModel();
    expect(model.classes).toContain('ParkingSpot');
    expect(model.interfaces).toContain('IPaymentStrategy');
  });

  it('Change Test B: Can add a Human Review Evaluator without altering practice flow', async () => {
    class HumanReviewEvaluator implements IEvaluationStrategy {
      public readonly name = 'Senior Staff Human Review';

      async evaluate(): Promise<StageEvaluationResult> {
        return {
          stageName: this.name,
          success: true,
          rubricAssessments: [
            {
              criterion: 'Human Architectural Review',
              score: 5,
              evidence: 'Senior architect verified clear boundaries.',
              concern: 'None.',
              suggestion: 'Consider adding resilience circuits for payment gateway outages.',
              confidence: 1.0,
            },
          ],
        };
      }
    }

    const composite = new CompositeEvaluator([
      new DeterministicEvaluator(),
      new HumanReviewEvaluator(),
    ]);

    const problem = new Problem(
      'prob-1',
      'Parking Lot',
      'Medium',
      'Desc',
      ['ParkingSpot'],
      [],
      [],
      { skeleton: '', rationale: '', diagramMermaid: '' }
    );

    const attempt = new Attempt('att-1', 'prob-1');
    const sub = attempt.createNextSubmission(
      {
        formatType: 'text',
        getRawContent: () => 'class ParkingSpot {}',
        getClassSkeleton: () => 'class ParkingSpot {}',
        getRationale: () => 'Good rationale',
        getDiagramMermaid: () => '',
        extractStructuralModel: () => ({ classes: ['ParkingSpot'], interfaces: [], relationships: [], methodsByClass: {} }),
      },
      'idem-test'
    );

    const result = await composite.evaluate(sub, problem);
    expect(result.rubricAssessments.some((a) => a.criterion === 'Human Architectural Review')).toBe(true);
    expect(result.deterministicFindings.detectedClasses).toContain('ParkingSpot');
  });
});
