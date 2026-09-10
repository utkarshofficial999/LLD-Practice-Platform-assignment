import { describe, it, expect } from 'vitest';
import { DeterministicEvaluator } from '../src/core/evaluation/DeterministicEvaluator.ts';
import { AIEvaluator } from '../src/core/evaluation/AIEvaluator.ts';
import { AttemptProgressionEngine } from '../src/core/evaluation/AttemptProgressionEngine.ts';
import { StructuredSubmissionContent, Submission } from '../src/core/domain/Submission.ts';
import { Problem } from '../src/core/domain/Problem.ts';
import { EvaluationResult } from '../src/core/domain/Feedback.ts';

describe('Evaluation Engine', () => {
  const problem = new Problem(
    'p-parking',
    'Parking Lot',
    'Medium',
    'Desc',
    ['ParkingSpot', 'Vehicle', 'Ticket', 'PaymentStrategy'],
    ['Coverage'],
    [],
    { skeleton: '', rationale: '', diagramMermaid: '' }
  );

  it('DeterministicEvaluator flags God Class anti-pattern when a class has >= 6 methods', async () => {
    const godClassCode = `
      export class MegaParkingManager {
        parkVehicle(): void {}
        unparkVehicle(): void {}
        calculateFee(): void {}
        processCreditCard(): void {}
        printReceipt(): void {}
        cleanSpot(): void {}
        auditLogs(): void {}
      }
    `;

    const sub = new Submission(
      'sub-1',
      'att-1',
      1,
      new StructuredSubmissionContent(godClassCode, 'Simple rationale'),
      'idem-god'
    );

    const evaluator = new DeterministicEvaluator();
    const result = await evaluator.evaluate(sub, problem);

    expect(result.deterministicFindings?.antiPatternFlags.some((f) => f.name === 'God Class Tendency')).toBe(true);
    expect(result.deterministicFindings?.antiPatternFlags.some((f) => f.name === 'Lack of Interface Abstraction')).toBe(true);
  });

  it('AIEvaluator returns 5-dimension structured rubric with evidence, concern, and suggestion', async () => {
    const goodDesign = `
      export interface IPaymentStrategy {
        pay(amount: number): boolean;
      }
      export class HourlyPayment implements IPaymentStrategy {
        pay(amount: number): boolean { return true; }
      }
      export class ParkingSpot {
        constructor(public id: string) {}
      }
      export class Vehicle {
        constructor(public plate: string) {}
      }
      export class Ticket {
        constructor(public id: string) {}
      }
    `;

    const sub = new Submission(
      'sub-good',
      'att-good',
      1,
      new StructuredSubmissionContent(
        goodDesign,
        'We chose the Strategy Pattern for payments to decouple fee logic from the gates. Trade-offs: Strategy introduces extra classes, but prevents violating the Open-Closed Principle. Concurrency is handled with spot-level mutexes to prevent double allocation.'
      ),
      'idem-good'
    );

    const aiEvaluator = new AIEvaluator();
    const result = await aiEvaluator.evaluate(sub, problem);

    expect(result.rubricAssessments).toHaveLength(5);
    for (const assessment of result.rubricAssessments!) {
      expect(assessment.criterion).toBeTruthy();
      expect(assessment.score).toBeGreaterThanOrEqual(1);
      expect(assessment.score).toBeLessThanOrEqual(5);
      expect(assessment.evidence).toBeTruthy();
      expect(assessment.concern).toBeDefined();
      expect(assessment.suggestion).toBeTruthy();
    }
  });

  it('AttemptProgressionEngine accurately computes progression between Attempt 1 and Attempt 2', () => {
    const evalAttempt1 = new EvaluationResult(
      'sub-1',
      1,
      50,
      [
        {
          criterion: 'Coupling & Abstraction (SOLID)',
          score: 2,
          evidence: 'No interfaces',
          concern: 'High direct coupling without interfaces',
          suggestion: 'Introduce IPaymentStrategy',
          confidence: 0.9,
        },
        {
          criterion: 'Requirement Coverage & Domain Completeness',
          score: 3,
          evidence: 'Missing Ticket',
          concern: 'Ticket is missing',
          suggestion: 'Add Ticket model',
          confidence: 0.9,
        },
      ],
      {
        entityCoverage: [],
        detectedClasses: ['ParkingLot'],
        detectedInterfaces: [],
        relationshipCount: 0,
        antiPatternFlags: [{ name: 'Lack of Interface Abstraction', severity: 'critical', details: 'No interfaces' }],
      },
      ['Refactor coupling']
    );

    const evalAttempt2 = new EvaluationResult(
      'sub-2',
      2,
      80,
      [
        {
          criterion: 'Coupling & Abstraction (SOLID)',
          score: 5,
          evidence: 'Found IPaymentStrategy interface',
          concern: 'None',
          suggestion: 'Great job',
          confidence: 0.9,
        },
        {
          criterion: 'Requirement Coverage & Domain Completeness',
          score: 4,
          evidence: 'Ticket added',
          concern: 'Good coverage',
          suggestion: 'Consider adding Floor',
          confidence: 0.9,
        },
      ],
      {
        entityCoverage: [],
        detectedClasses: ['ParkingLot', 'Ticket'],
        detectedInterfaces: ['IPaymentStrategy'],
        relationshipCount: 1,
        antiPatternFlags: [],
      },
      ['Keep it up']
    );

    const diff = AttemptProgressionEngine.compare(evalAttempt1, evalAttempt2);

    expect(diff.overallScoreDelta).toBe(30);
    expect(diff.criteriaDeltas.find((c) => c.criterion.includes('SOLID'))?.status).toBe('improved');
    expect(diff.structuralProgress.classesAdded).toContain('Ticket');
    expect(diff.structuralProgress.interfacesAdded).toContain('IPaymentStrategy');
    expect(diff.structuralProgress.antiPatternsResolved).toContain('Lack of Interface Abstraction');
    expect(diff.resolvedConcerns.length).toBeGreaterThan(0);
  });
});
