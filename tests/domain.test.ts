import { describe, it, expect } from 'vitest';
import { Problem } from '../src/core/domain/Problem.ts';
import { Attempt } from '../src/core/domain/Attempt.ts';
import { StructuredSubmissionContent } from '../src/core/domain/Submission.ts';
import { EvaluationResult } from '../src/core/domain/Feedback.ts';

describe('Domain Models', () => {
  it('Problem correctly detects matched and missing domain entities', () => {
    const problem = new Problem(
      'p1',
      'Test Problem',
      'Easy',
      'Test description',
      ['ParkingSpot', 'Vehicle', 'PaymentStrategy'],
      ['Expectation 1'],
      [],
      { skeleton: '', rationale: '', diagramMermaid: '' }
    );

    const coverage = problem.checkEntityCoverage(['ParkingSpot', 'CompactVehicle', 'RandomClass']);
    expect(coverage).toHaveLength(3);

    const spotMatch = coverage.find((c) => c.entity === 'ParkingSpot');
    expect(spotMatch?.matched).toBe(true);

    const vehicleMatch = coverage.find((c) => c.entity === 'Vehicle');
    expect(vehicleMatch?.matched).toBe(true);

    const paymentMatch = coverage.find((c) => c.entity === 'PaymentStrategy');
    expect(paymentMatch?.matched).toBe(false);
  });

  it('StructuredSubmissionContent extracts classes, interfaces, and methods correctly', () => {
    const code = `
      export interface IPaymentStrategy {
        processPayment(amount: number): boolean;
      }

      export class CreditCardPayment implements IPaymentStrategy {
        processPayment(amount: number): boolean { return true; }
        validateCard(): boolean { return true; }
      }

      export class Vehicle {
        constructor(public licensePlate: string) {}
        getPlate(): string { return this.licensePlate; }
      }
    `;

    const content = new StructuredSubmissionContent(code, 'Rationale text', '');
    const model = content.extractStructuralModel();

    expect(model.interfaces).toContain('IPaymentStrategy');
    expect(model.classes).toContain('CreditCardPayment');
    expect(model.classes).toContain('Vehicle');
    expect(model.relationships).toContainEqual({
      from: 'CreditCardPayment',
      to: 'IPaymentStrategy',
      type: 'implements',
    });
  });

  it('Attempt aggregate root manages versioning and state transitions cleanly', () => {
    const attempt = new Attempt('att-1', 'prob-1');
    expect(attempt.currentVersion).toBe(0);

    const content = new StructuredSubmissionContent('class A {}', 'Rationale 1');
    const sub1 = attempt.createNextSubmission(content, 'idem-1');

    expect(attempt.currentVersion).toBe(1);
    expect(sub1.status).toBe('SUBMITTED');
    expect(attempt.submissions).toHaveLength(1);

    sub1.markEvaluating();
    expect(sub1.status).toBe('EVALUATING');

    const evalResult = new EvaluationResult(
      sub1.id,
      1,
      85,
      [],
      { entityCoverage: [], detectedClasses: ['A'], detectedInterfaces: [], relationshipCount: 0, antiPatternFlags: [] },
      ['Good start']
    );

    attempt.recordEvaluation(1, evalResult);
    expect(sub1.status).toBe('COMPLETED');
    expect(attempt.getLatestEvaluation()?.overallScore).toBe(85);
  });
});
