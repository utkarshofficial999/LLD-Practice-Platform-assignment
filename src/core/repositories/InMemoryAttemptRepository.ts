import { Attempt } from '../domain/Attempt.ts';
import { IAttemptRepository } from './IAttemptRepository.ts';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private readonly attempts: Map<string, Attempt> = new Map();

  public async getById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async getByProblemId(problemId: string): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter((a) => a.problemId === problemId);
  }

  public async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }
}
