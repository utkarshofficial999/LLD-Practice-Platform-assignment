import { describe, it, expect } from 'vitest';
import { InMemoryProblemRepository } from '../src/core/repositories/InMemoryProblemRepository.ts';
import { InMemoryAttemptRepository } from '../src/core/repositories/InMemoryAttemptRepository.ts';
import { PracticeService } from '../src/core/services/PracticeService.ts';

describe('PracticeService End-to-End Practice Loop', () => {
  const problemRepo = new InMemoryProblemRepository();
  const attemptRepo = new InMemoryAttemptRepository();
  const service = new PracticeService(problemRepo, attemptRepo);

  it('orchestrates complete practice loop: list -> start -> submit -> iterate -> compare', async () => {
    // 1. List problems
    const problems = await service.listProblems();
    expect(problems.length).toBeGreaterThanOrEqual(3);
    const problem = problems[0];

    // 2. Start attempt
    const attempt = await service.startAttempt(problem.id);
    expect(attempt.id).toBeTruthy();
    expect(attempt.currentVersion).toBe(0);

    // 3. Submit Attempt 1 (Initial naive design)
    const result1 = await service.submitAttempt(attempt.id, {
      classSkeleton: `
        export class ParkingLot {
          park() {}
          unpark() {}
          charge() {}
        }
      `,
      designRationale: 'Simple parking lot without many abstractions.',
    });

    expect(result1.submission.status).toBe('COMPLETED');
    expect(result1.submission.version).toBe(1);
    expect(result1.evaluation).toBeDefined();
    const eval1Score = result1.evaluation!.overallScore;

    // 4. Test Idempotency: submitting the exact same content returns existing completed submission
    const duplicateSubmission = await service.submitAttempt(attempt.id, {
      classSkeleton: `
        export class ParkingLot {
          park() {}
          unpark() {}
          charge() {}
        }
      `,
      designRationale: 'Simple parking lot without many abstractions.',
    });
    expect(duplicateSubmission.submission.version).toBe(1);

    // 5. Submit Attempt 2 (Refactored design incorporating feedback)
    const result2 = await service.submitAttempt(attempt.id, {
      classSkeleton: `
        export interface IPaymentStrategy {
          calculate(hours: number): number;
        }
        export class HourlyPayment implements IPaymentStrategy {
          calculate(hours: number): number { return hours * 10; }
        }
        export class ParkingSpot {
          constructor(public id: string) {}
        }
        export class Vehicle {
          constructor(public licensePlate: string) {}
        }
        export class Ticket {
          constructor(public id: string) {}
        }
        export class ParkingFloor {
          constructor(public floorNumber: number) {}
        }
        export class ParkingLotController {
          constructor(private paymentStrategy: IPaymentStrategy) {}
        }
      `,
      designRationale: 'Refactored to introduce IPaymentStrategy, Ticket, ParkingFloor, and separated concerns. Concurrency is handled with spot locks to prevent race conditions. Trade-off: slightly more classes but follows Open-Closed principle.',
    });

    expect(result2.submission.version).toBe(2);
    expect(result2.submission.status).toBe('COMPLETED');
    expect(result2.evaluation!.overallScore).toBeGreaterThanOrEqual(eval1Score);

    // 6. Compare Attempt 1 and Attempt 2
    const comparison = await service.compareAttemptVersions(attempt.id, 1, 2);
    expect(comparison.previousVersion).toBe(1);
    expect(comparison.currentVersion).toBe(2);
    expect(comparison.overallScoreDelta).toBeGreaterThanOrEqual(0);
    expect(comparison.structuralProgress.classesAdded.length).toBeGreaterThan(0);
    expect(comparison.structuralProgress.interfacesAdded).toContain('IPaymentStrategy');
  });
});
